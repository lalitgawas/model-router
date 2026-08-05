import os
import pickle
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download

load_dotenv()

print("Downloading dataset from Hugging Face (approx. 1.2 GB)...")


local_file_path = hf_hub_download(
    repo_id="withmartian/routerbench",
    filename="routerbench_raw.pkl",
    repo_type="dataset",
    token=os.getenv("HF_TOKEN")
)

print(f"File cached successfully at: {local_file_path}")
print("Loading binary data into memory...")

with open(local_file_path, "rb") as file:
    dataset = pickle.load(file)

print("\n--- Dataset Successfully Loaded ---")
print(f"Data type: {type(dataset)}")

print(dataset)

print(dataset.columns)
