import os
import pickle
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
import sys
import json

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_INDEX_PATH = os.path.join(BASE_DIR, "prompt_index.faiss")
METADATA_PATH = os.path.join(BASE_DIR, "metadata.pkl")
EMBEDDINGS_PATH = os.path.join(BASE_DIR, "all_embeddings.npy")

# We load the model here, but we ONLY load the index and metadata if they exist.
model = SentenceTransformer("all-MiniLM-L6-v2")
index = None
metadata = None

if os.path.exists(PROMPT_INDEX_PATH) and os.path.exists(METADATA_PATH):
    index = faiss.read_index(PROMPT_INDEX_PATH)
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)

def build_index():
    CHUNK_SIZE = 50000
    EMBEDDINGS_FILE = EMBEDDINGS_PATH

    print("Fetching dataset...")
    local_file_path = hf_hub_download(
        repo_id="withmartian/routerbench",
        filename="routerbench_raw.pkl",
        repo_type="dataset",
        token=os.getenv("HF_TOKEN")
    )

    with open(local_file_path, "rb") as f:
        df = pickle.load(f)

    prompt_col = "prompt" if "prompt" in df.columns else df.columns[0]
    prompts = df[prompt_col].astype(str).tolist()
    total_samples = len(prompts)
    print(f"Total samples: {total_samples}")

    metadata_file = METADATA_PATH
    if not os.path.exists(metadata_file):
        meta = df.to_dict(orient="records")
        with open(metadata_file, "wb") as f:
            pickle.dump(meta, f)

    all_embeddings = []
    if os.path.exists(EMBEDDINGS_FILE):
        all_embeddings = list(np.load(EMBEDDINGS_FILE))
        print(f"Found {len(all_embeddings)} existing embeddings. Resuming from here...")
    
    start_idx = len(all_embeddings)
    
    if start_idx < total_samples:
        end_idx = min(start_idx + CHUNK_SIZE, total_samples)
        print(f"\n--- Processing chunk from {start_idx} to {end_idx} ---")
        
        chunk_prompts = prompts[start_idx:end_idx]
        chunk_embeddings = model.encode(chunk_prompts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
        
        all_embeddings.extend(chunk_embeddings)
        np.save(EMBEDDINGS_FILE, np.array(all_embeddings).astype("float32"))
        
        print(f"\nSaved progress! Total embeddings processed so far: {len(all_embeddings)}/{total_samples}")
        
        # Build an intermediate FAISS index so the user can test the app immediately
        print("Building intermediate FAISS Index for testing...")
        current_embeddings = np.array(all_embeddings).astype("float32")
        dimension = current_embeddings.shape[1]
        temp_index = faiss.IndexFlatIP(dimension)
        temp_index.add(current_embeddings)
        faiss.write_index(temp_index, PROMPT_INDEX_PATH)
        
        if len(all_embeddings) < total_samples:
            print("Run `python embeddings.py` again to process the next chunk of 50,000.")
            return False
            
    # If we get here, all prompts are processed!
    print("\nAll chunks completed! Final FAISS Index is ready.")
    print("The dataset is ready to use.")
    return True

# for optimized model only
def find_best_model_for_prompt(user_prompt: str, top_k: int = 20, performance_tolerance: float = 0.02):

    index = None
    metadata = None
    if os.path.exists(PROMPT_INDEX_PATH) and os.path.exists(METADATA_PATH):
        index = faiss.read_index(PROMPT_INDEX_PATH)
        with open(METADATA_PATH, "rb") as f:
            metadata = pickle.load(f)

    if index is None or metadata is None:
        print(user_prompt)
        raise ValueError("FAISS index or metadata not found. Please run the script to build them first.")
        
    query_vector = model.encode([user_prompt], normalize_embeddings=True).astype("float32")
    distances, indices = index.search(query_vector, top_k)

    model_stats = {}
    for idx in indices[0]:
        matched_item = metadata[idx]
        m_name = matched_item["model_name"]
        prompt_name=matched_item["prompt"]

        if m_name not in model_stats:
            model_stats[m_name] = {"total_perf": 0, "total_cost": 0, "count": 0, "prompts":[]}

        model_stats[m_name]["prompts"].append(prompt_name)
        model_stats[m_name]["total_perf"] += matched_item["performance"]
        model_stats[m_name]["total_cost"] += matched_item["cost"]
        model_stats[m_name]["count"] += 1

    aggregated_models = []
    for m_name, stats in model_stats.items():
        avg_perf = stats["total_perf"] / stats["count"]
        avg_cost = stats["total_cost"] / stats["count"]
        aggregated_models.append({"model_name": m_name, "performance": avg_perf, "cost": avg_cost, "prompts":stats["prompts"]})


    if not aggregated_models:
        return None

    # Filter: only keep models within tolerance of the best performer
    max_perf = max(m["performance"] for m in aggregated_models)
    threshold = max_perf - performance_tolerance
    candidates = [m for m in aggregated_models if m["performance"] >= threshold]

    # Rank by combined score: prioritize performance, use cost as tiebreaker
    # Normalize cost so cheaper = higher score
    max_cost = max(c["cost"] for c in candidates) if candidates else 1
    for c in candidates:
        cost_efficiency = 1 - (c["cost"] / max_cost) if max_cost > 0 else 0
        c["score"] = (c["performance"] * 0.7) + (cost_efficiency * 0.3)

    candidates.sort(key=lambda x: x["score"], reverse=True)
  
    return candidates


# always the best model only
# def find_best_model_for_prompt(user_prompt: str, top_k: int = 20, performance_tolerance: float = 0.0):

#     index = None
#     metadata = None
#     if os.path.exists(PROMPT_INDEX_PATH) and os.path.exists(METADATA_PATH):
#         index = faiss.read_index(PROMPT_INDEX_PATH)
#         with open(METADATA_PATH, "rb") as f:
#             metadata = pickle.load(f)

#     if index is None or metadata is None:
#         print(user_prompt)
#         raise ValueError("FAISS index or metadata not found. Please run the script to build them first.")
        
#     query_vector = model.encode([user_prompt], normalize_embeddings=True).astype("float32")
#     distances, indices = index.search(query_vector, top_k)

#     model_stats = {}
#     for idx in indices[0]:
#         matched_item = metadata[idx]
#         m_name = matched_item["model_name"]
#         prompt_name=matched_item["prompt"]

#         if m_name not in model_stats:
#             model_stats[m_name] = {"total_perf": 0, "total_cost": 0, "count": 0, "prompts":[]}

#         model_stats[m_name]["prompts"].append(prompt_name)
#         model_stats[m_name]["total_perf"] += matched_item["performance"]
#         model_stats[m_name]["total_cost"] += matched_item["cost"]
#         model_stats[m_name]["count"] += 1

#     aggregated_models = []
#     for m_name, stats in model_stats.items():
#         avg_perf = stats["total_perf"] / stats["count"]
#         avg_cost = stats["total_cost"] / stats["count"]
#         aggregated_models.append({"model_name": m_name, "performance": avg_perf, "cost": avg_cost, "prompts":stats["prompts"]})


#     if not aggregated_models:
#         return None
    
#     aggregated_models.sort(key=lambda x: x["performance"], reverse=True)

#     return aggregated_models[0]


if __name__ == "__main__":
    # If Node.js calls this script with arguments
    if len(sys.argv) > 2 and sys.argv[1] == "find_best_model_for_prompt":
        prompt_arg = sys.argv[2]
        all_models = find_best_model_for_prompt(prompt_arg) 
        print(json.dumps(all_models))
    else:
        # If you just run `python embeddings.py` in the terminal, it builds chunks
        build_index()
