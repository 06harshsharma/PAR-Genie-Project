import json
import os
import re
import tempfile
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import dateparser.search
from rapidfuzz import fuzz

# ------------------------------
# CONFIGURATION
# ------------------------------
DATASET_PATH = r"C:\Hackathon 2025\PAR Genie\Datasets\reports-dataset.json"
POS_DATA_PATH = r"C:\Hackathon 2025\PAR Genie\Datasets\pos-data.json"
MODEL_NAME = "all-MiniLM-L6-v2"
FEEDBACK_FILE = os.path.join(os.path.dirname(DATASET_PATH), "feedback.json")

# ------------------------------
# FASTAPI INIT
# ------------------------------
app = FastAPI(title="PAR Genie Service")

# ------------------------------
# LOAD DATASETS
# ------------------------------
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    REPORTS = json.load(f)

with open(POS_DATA_PATH, "r", encoding="utf-8") as f:
    POS_DATA = json.load(f)

# ------------------------------
# PREPARE REPORT EMBEDDINGS
# ------------------------------
report_texts = [
    (
        r["reportId"],
        f"{r['name']} - {r['description']} Columns: {' '.join(r.get('columns', []))} Filters: {' '.join([flt['name'] for flt in r.get('filters', [])])}"
    )
    for r in REPORTS
]

print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME)

print("Generating report embeddings...")
corpus_texts = [t for _, t in report_texts]
embeddings = model.encode(corpus_texts, convert_to_numpy=True, show_progress_bar=True)
faiss.normalize_L2(embeddings)
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)
id_to_report = [rid for rid, _ in report_texts]

# ------------------------------
# API MODELS
# ------------------------------
class QueryRequest(BaseModel):
    query: str
    limit: int = 3

class FeedbackRequest(BaseModel):
    query: str
    matches: list[str]
    feedback: str  # "positive" or "negative"

# ------------------------------
# FEEDBACK UTILITIES
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
    except:
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
        feedback_scores[rid] = (counts["positive"] - counts["negative"]) / total if total > 0 else 0
    return feedback_scores

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
# INTENT DETECTION
# ------------------------------
INTENT_EXAMPLES = {
    "search_report": [
        "show me the sales report", "get the taxes by location report",
        "find timecard data", "give me gift card summary",
        "report on customer signups", "can I see the employee hours report",
        "fetch report with tips included", "list available reports",
        "I need a report of new customers", "analytics on order counts",
        "summary report of promotions", "download the labor cost report"
    ],
    "read_data": [
        "what is the price of a burger", "show me cost of fries",
        "get current discount on coke", "how much does coffee cost",
        "list menu prices at Chicago location", "what are today’s discounts",
        "retrieve details of chicken sandwich", "find price of double cheeseburger",
        "list all items and prices", "fetch current offers"
    ],
    "update_data": [
        "update price of burger to 5.99", "change fries cost to 2.50",
        "set coke discount to 10 percent", "reduce price of coffee",
        "increase burger cost by 1 dollar", "apply 20% discount on fries",
        "modify the price of chicken sandwich", "update cost of whopper",
        "adjust discount for double cheeseburger", "set new price for fries"
    ]
}

intent_model = SentenceTransformer(MODEL_NAME)
intent_embeddings = {}
for intent, examples in INTENT_EXAMPLES.items():
    vecs = intent_model.encode(examples, convert_to_numpy=True)
    faiss.normalize_L2(vecs)
    mean_vec = np.mean(vecs, axis=0)
    faiss.normalize_L2(mean_vec.reshape(1, -1))
    intent_embeddings[intent] = mean_vec

INTENT_KEYWORDS = {
    "search_report": ["report", "summary", "analytics", "data"],
    "read_data": ["price", "cost", "show", "how much", "list", "details"],
    "update_data": ["update", "change", "modify", "set", "increase", "reduce", "adjust"]
}

def detect_intent(query: str):
    query_vec = intent_model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)
    scores = {intent: float(np.dot(query_vec, mean_vec)) for intent, mean_vec in intent_embeddings.items()}

    # Boost with keyword match
    q_lower = query.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in q_lower:
                scores[intent] += 0.1
                break

    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]
    if best_score < 0.55:
        return "unknown", scores
    return best_intent, scores

# ------------------------------
# POS ENTITY EXTRACTION
# ------------------------------
def extract_pos_entities(query: str):
    q = query.lower()
    entities = {"group": None, "location": None, "item": None, "value": None}

    # Extract numeric value
    match = re.search(r"\b(\d+(\.\d{1,2})?)\b", query)
    if match:
        entities["value"] = float(match.group(1))

    # Match group, location, item
    for group in POS_DATA.get("groups", []):
        if group["groupName"].lower() in q:
            entities["group"] = group["groupName"]
        for loc in group.get("locations", []):
            if loc["locationName"].lower() in q:
                entities["location"] = loc["locationName"]
            for item in loc.get("items", []):
                if item["name"].lower() in q:
                    entities["item"] = item["name"]

    return entities

# ------------------------------
# HANDLERS
# ------------------------------
def handle_search_reports(query: str, top_k: int):
    query_lower = query.lower()
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
                    "score": 1.0
                }
                break

    query_vector = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(query_vector)
    distances, indices = index.search(query_vector, top_k)
    embedding_results = {}
    for score, idx in zip(distances[0], indices[0]):
        report_id = id_to_report[idx]
        report_data = next(r for r in REPORTS if r["reportId"] == report_id)
        embedding_results[report_id] = {
            "reportId": report_id,
            "name": report_data["name"],
            "category": report_data["category"],
            "description": report_data["description"],
            "score": float(score)
        }

    final_results = {**embedding_results, **keyword_boost}
    feedback_scores = compute_feedback_scores()
    weight = 0.1
    for rid, report in final_results.items():
        fb_score = feedback_scores.get(rid, 0)
        report["score"] = max(0.0, min(report["score"] + (weight * fb_score), 1.0))

    sorted_results = sorted(final_results.values(), key=lambda x: x["score"], reverse=True)
    filters = extract_filters(query)
    return {"intent": "search_report", "query": query, "matches": sorted_results, "suggestedFilters": filters}

def handle_read_data(query: str):
    entities = extract_pos_entities(query)
    if not all([entities["group"], entities["location"], entities["item"]]):
        return {"status": "error", "message": "Could not identify group/location/item"}
    for group in POS_DATA["groups"]:
        if group["groupName"] != entities["group"]:
            continue
        for loc in group["locations"]:
            if loc["locationName"] != entities["location"]:
                continue
            for item in loc["items"]:
                if item["name"] == entities["item"]:
                    return {
                        "status": "success",
                        "action": "read",
                        "message": None,
                        "item": {
                            "id": item.get("id", ""),
                            "name": item["name"],
                            "price": item["price"],
                            "discount": item.get("discount", 0)
                        }
                    }
    return {"status": "error", "message": "Item not found"}

def handle_update_data(query: str):
    entities = extract_pos_entities(query)
    if not all([entities["group"], entities["location"], entities["item"], entities["value"]]):
        return {"status": "error", "message": "Missing entity (group/location/item/value)"}

    updated_item = None
    for group in POS_DATA["groups"]:
        if group["groupName"] != entities["group"]:
            continue
        for loc in group["locations"]:
            if loc["locationName"] != entities["location"]:
                continue
            for item in loc["items"]:
                if item["name"] == entities["item"]:
                    old_price = item["price"]
                    item["price"] = entities["value"]
                    updated_item = {
                        "id": item.get("id", ""),
                        "name": item["name"],
                        "price": item["price"],
                        "discount": item.get("discount", 0)
                    }
                    message = f"Updated {item['name']} in {group['groupName']} {loc['locationName']} from {old_price} to {item['price']}"
                    break

    if updated_item:
        with open(POS_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(POS_DATA, f, indent=2)
        return {"status": "success", "action": "update", "message": message, "item": updated_item}
    else:
        return {"status": "error", "message": "Could not find item to update"}

# ------------------------------
# ENDPOINTS
# ------------------------------
@app.post("/assistant")
def assistant(req: QueryRequest):
    intent, scores = detect_intent(req.query)
    if intent == "search_report":
        return handle_search_reports(req.query, req.limit)
    elif intent == "read_data":
        return handle_read_data(req.query)
    elif intent == "update_data":
        return handle_update_data(req.query)
    else:
        return {"status": "error", "message": "Could not classify intent"}

@app.post("/feedback")
def feedback(req: FeedbackRequest):
    record = {"query": req.query, "matches": req.matches, "feedback": req.feedback, "timestamp": datetime.utcnow().isoformat()}
    save_feedback_record(record)
    return {"status": "success", "saved": record}

@app.get("/")
def root():
    return {"message": "PAR Genie Report + POS Assistant Service is running"}
