import json
import os
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
MODEL_NAME = "all-MiniLM-L6-v2"  # Free, small, local embedding model

from datetime import datetime
import tempfile

FEEDBACK_FILE = os.path.join(os.path.dirname(DATASET_PATH), "feedback.json")

# ------------------------------
# INITIALIZATION
# ------------------------------
app = FastAPI(title="PAR Genie Report Search Service")

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

# ------------------------------
# FILTER EXTRACTION
# ------------------------------
def extract_filters(query_text: str):
    """Extract dates and locations from the query."""
    filters = {"dates": [], "locations": []}

    # Detect dates like "last week", "September 2025"
    date_matches = dateparser.search.search_dates(
        query_text,
        settings={'PREFER_DATES_FROM': 'past'}
    )

    if date_matches:
        for raw, dt in date_matches:
            # Ignore very short tokens like "me" or "to"
            if len(raw.strip()) > 3:
                filters["dates"].append({
                    "raw": raw,
                    "parsed": dt.isoformat()
                })

    # Detect location keywords manually (extend as needed)
    location_keywords = ["Reg1", "Reg2", "Hilary", "All Locations"]
    for keyword in location_keywords:
        if keyword.lower() in query_text.lower():
            filters["locations"].append(keyword)

    return filters

# ------------------------------
# FEEDBACK STORAGE
# ------------------------------
def _atomic_write_json(path, data):
    """Safely write JSON to file (avoids corruption if multiple writes happen)."""
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
    """Return a dict of reportId -> feedback score (-1 to +1)."""
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
# SEARCH ENDPOINT
# ------------------------------
@app.post("/search")
def search_reports(req: QueryRequest):
    query_lower = req.query.lower()

    # -----------------------------------------
    # STEP 1: Keyword Boosting (fuzzy match)
    # -----------------------------------------
    keyword_boost = {}
    for report in REPORTS:
        for col in report.get("columns", []):
            # Fuzzy match column name to query
            score = fuzz.token_set_ratio(col.lower(), query_lower)
            if score > 75:  # Strong match
                keyword_boost[report["reportId"]] = {
                    "reportId": report["reportId"],
                    "name": report["name"],
                    "category": report["category"],
                    "description": report["description"],
                    "score": 1.0,  # Force top rank
                    "filters": report["filters"],
                    "columns": report["columns"]
                }
                print(f"BOOST MATCH: '{col}' matched query '{req.query}' with score {score}")
                break  # Only boost once per report

    # -----------------------------------------
    # STEP 2: Embedding Search
    # -----------------------------------------
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

    # -----------------------------------------
    # STEP 3: Merge Results
    # -----------------------------------------
    final_results = {}
    # Add boosted reports first (guaranteed top)
    for rid, report in keyword_boost.items():
        final_results[rid] = report
    # Add embedding results, but don't override boosted ones
    for rid, report in embedding_results.items():
        if rid not in final_results:
            final_results[rid] = report

    # Apply feedback scores
    feedback_scores = compute_feedback_scores()
    weight = 0.01  # adjust sensitivity

    for rid, report in final_results.items():
        fb_score = feedback_scores.get(rid, 0)
        report["score"] = report["score"] + (weight * fb_score)
        # Cap score
        report["score"] = max(0.0, min(report["score"], 1.0))

    # Sort by score (keyword boost always = 1.0, so these appear first)
    sorted_results = sorted(final_results.values(), key=lambda x: x["score"], reverse=True)

    # -----------------------------------------
    # STEP 4: Extract Filters
    # -----------------------------------------
    filters = extract_filters(req.query)

    return {
        "query": req.query,
        "matches": sorted_results,
        "suggestedFilters": filters
    }

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
# ROOT ENDPOINT
# ------------------------------
@app.get("/")
def root():
    return {"message": "PAR Genie Report Search Service is running"}
