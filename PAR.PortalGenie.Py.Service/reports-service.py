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
# ROOT ENDPOINT
# ------------------------------
@app.get("/")
def root():
    return {"message": "PAR Genie Report Search Service is running"}
