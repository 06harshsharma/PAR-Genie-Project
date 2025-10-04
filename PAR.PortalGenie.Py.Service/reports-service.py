import json
import os
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import dateparser.search
from rapidfuzz import fuzz
import re
from datetime import datetime
import tempfile

# ------------------------------
# CONFIGURATION
# ------------------------------
DATASET_PATH = r"C:\Hackathon 2025\PAR Genie\Datasets\reports-dataset.json"
POS_DATASET_PATH = r"C:\Hackathon 2025\PAR Genie\Datasets\pos-data.json"
MODEL_NAME = "all-MiniLM-L6-v2"  # Free, small, local embedding model
FEEDBACK_FILE = os.path.join(os.path.dirname(DATASET_PATH), "feedback.json")

# ------------------------------
# INITIALIZATION
# ------------------------------
app = FastAPI(title="PAR Genie Report + POS Assistant Service")

# Load reports dataset
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    REPORTS = json.load(f)

# Prepare text for embeddings
report_texts = [
    (
        r["reportId"],
        f"{r['name']} - {r['description']} "
        f"Columns: {' '.join(r.get('columns', []))} "
        f"Filters: {' '.join([flt['name'] for flt in r.get('filters', [])])} "
        f"Examples: {' '.join(r.get('examples', []))}"
    )
    for r in REPORTS
]

# Load embedding model
print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME)

# Generate embeddings
print("Generating embeddings...")
corpus_texts = [t for _, t in report_texts]
embeddings = model.encode(corpus_texts, convert_to_numpy=True, show_progress_bar=True)

# Normalize for cosine similarity
faiss.normalize_L2(embeddings)
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)

# Map back to reportId
id_to_report = [rid for rid, _ in report_texts]

# ------------------------------
# API MODELS
# ------------------------------
class QueryRequest(BaseModel):
    query: str
    top_k: int = 3

class FeedbackRequest(BaseModel):
    query: str
    matches: list[str]  # list of reportIds returned in that search
    feedback: str       # "positive" or "negative"

class AssistantQuery(BaseModel):
    query: str

# ------------------------------
# FILTER EXTRACTION
# ------------------------------
def extract_filters(query_text: str):
    filters = {"dates": [], "locations": []}
    date_matches = dateparser.search.search_dates(query_text, settings={'PREFER_DATES_FROM': 'past'})
    if date_matches:
        for raw, dt in date_matches:
            if len(raw.strip()) > 3:
                filters["dates"].append({"raw": raw, "parsed": dt.isoformat()})

    location_keywords = ["Reg1", "Reg2", "Hilary", "All Locations"]
    for keyword in location_keywords:
        if keyword.lower() in query_text.lower():
            filters["locations"].append(keyword)

    return filters

# ------------------------------
# FEEDBACK STORAGE
# ------------------------------
def _atomic_write_json(path, data):
    dirn = os.path.dirname(path)
    with tempfile.NamedTemporaryFile("w", dir=dirn, delete=False, encoding="utf-8") as tf:
        json.dump(data, tf, indent=2)
        tmpname = tf.name
    os.replace(tmpname, path)

def load_feedback():
    if not os.path.exists(FEEDBACK_FILE):
        return []
    try:
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_feedback_record(record: dict):
    data = load_feedback()
    data.append(record)
    _atomic_write_json(FEEDBACK_FILE, data)

def compute_feedback_scores():
    feedback_data = load_feedback()
    scores = {}
    for record in feedback_data:
        for rid in record.get("matches", []):
            if rid not in scores:
                scores[rid] = {"positive": 0, "negative": 0}
            if record["feedback"].lower() == "positive":
                scores[rid]["positive"] += 1
            elif record["feedback"].lower() == "negative":
                scores[rid]["negative"] += 1

    feedback_scores = {}
    for rid, counts in scores.items():
        total = counts["positive"] + counts["negative"]
        if total > 0:
            feedback_scores[rid] = (counts["positive"] - counts["negative"]) / total
        else:
            feedback_scores[rid] = 0
    return feedback_scores

# ------------------------------
# POS DATA HELPERS
# ------------------------------
def load_pos_data():
    if not os.path.exists(POS_DATASET_PATH):
        return {"groups": []}
    with open(POS_DATASET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_pos_data(data):
    with open(POS_DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def find_item(data, group_name, location_name, item_name):
    for group in data.get("groups", []):
        if group["groupName"].lower() == group_name.lower():
            for loc in group.get("locations", []):
                if loc["locationName"].lower() == location_name.lower():
                    for item in loc.get("items", []):
                        if item["name"].lower() == item_name.lower():
                            return item
    return None

# ------------------------------
# INTENT DETECTION
# ------------------------------
def detect_intent(query: str):
    q = query.lower()
    if any(word in q for word in ["update", "change", "set", "modify"]):
        return "pos_update"
    elif any(word in q for word in ["price", "discount", "cost", "show item", "get item"]):
        return "pos_read"
    elif any(word in q for word in ["report", "sales", "summary", "tax", "timecard", "customers"]):
        return "report_search"
    else:
        return "report_search"

def extract_entities(query: str):
    q = query.lower()
    data = load_pos_data()
    entities = {"group": None, "location": None, "item": None, "value": None}

    for g in data["groups"]:
        if g["groupName"].lower() in q:
            entities["group"] = g["groupName"]

    for g in data["groups"]:
        for loc in g["locations"]:
            if loc["locationName"].lower() in q:
                entities["location"] = loc["locationName"]

    for g in data["groups"]:
        for loc in g["locations"]:
            for item in loc["items"]:
                if item["name"].lower() in q:
                    entities["item"] = item["name"]

    match = re.search(r"\b(\d+(\.\d{1,2})?)\b", q)
    if match:
        entities["value"] = float(match.group(1))

    return entities

# ------------------------------
# SEARCH ENDPOINT
# ------------------------------
@app.post("/search")
def search_reports(req: QueryRequest):
    query_lower = req.query.lower()

    keyword_boost = {}
    for report in REPORTS:
        for col in report.get("columns", []):
            score = fuzz.token_set_ratio(col.lower(), query_lower)
            if score > 75:
                keyword_boost[report["reportId"]] = {
                    "reportId": report["reportId"],
                    "name": report["name"],
                    "category": report["category"],
                    "description": report["description"],
                    "score": 1.0,
                    "filters": report["filters"],
                    "columns": report["columns"]
                }
                break

    query_vector = model.encode([req.query], convert_to_numpy=True)
    faiss.normalize_L2(query_vector)

    distances, indices = index.search(query_vector, req.top_k)
    embedding_results = {}
    for score, idx in zip(distances[0], indices[0]):
        report_id = id_to_report[idx]
        report_data = next(r for r in REPORTS if r["reportId"] == report_id)
        embedding_results[report_id] = {
            "reportId": report_id,
            "name": report_data["name"],
            "category": report_data["category"],
            "description": report_data["description"],
            "score": float(score),
            "filters": report_data["filters"],
            "columns": report_data["columns"]
        }

    final_results = {}
    for rid, report in keyword_boost.items():
        final_results[rid] = report
    for rid, report in embedding_results.items():
        if rid not in final_results:
            final_results[rid] = report

    feedback_scores = compute_feedback_scores()
    weight = 0.01
    for rid, report in final_results.items():
        fb_score = feedback_scores.get(rid, 0)
        report["score"] = report["score"] + (weight * fb_score)
        report["score"] = max(0.0, min(report["score"], 1.0))

    sorted_results = sorted(final_results.values(), key=lambda x: x["score"], reverse=True)
    filters = extract_filters(req.query)

    return {"query": req.query, "matches": sorted_results, "suggestedFilters": filters}

# ------------------------------
# FEEDBACK ENDPOINT
# ------------------------------
@app.post("/feedback")
def receive_feedback(req: FeedbackRequest):
    record = {
        "query": req.query,
        "matches": req.matches,
        "feedback": req.feedback,
        "timestamp": datetime.utcnow().isoformat()
    }
    try:
        save_feedback_record(record)
        return {"status": "success", "saved": record}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ------------------------------
# ASSISTANT ENDPOINT (AGENTIC)
# ------------------------------
@app.post("/assistant")
def assistant(req: AssistantQuery):
    intent = detect_intent(req.query)
    entities = extract_entities(req.query)

    if intent == "report_search":
        return search_reports(QueryRequest(query=req.query, top_k=3))

    data = load_pos_data()

    if intent == "pos_read":
        if not (entities["group"] and entities["location"] and entities["item"]):
            return {"status": "error", "message": "Could not identify group, location, or item."}
        item = find_item(data, entities["group"], entities["location"], entities["item"])
        if not item:
            return {"status": "error", "message": "Item not found"}
        return {"status": "success", "action": "read", "item": item}

    if intent == "pos_update":
        if not (entities["group"] and entities["location"] and entities["item"] and entities["value"]):
            return {"status": "error", "message": "Missing entity for update (group, location, item, or value)."}
        item = find_item(data, entities["group"], entities["location"], entities["item"])
        if not item:
            return {"status": "error", "message": "Item not found"}
        old_price = item["price"]
        item["price"] = entities["value"]
        save_pos_data(data)
        return {
            "status": "success",
            "action": "update",
            "message": f"Updated {entities['item']} in {entities['group']} {entities['location']} from {old_price} to {entities['value']}",
            "item": item
        }

    return {"status": "error", "message": "Unknown intent"}

# ------------------------------
# ROOT ENDPOINT
# ------------------------------
@app.get("/")
def root():
    return {"message": "PAR Genie Report + POS Assistant Service is running"}