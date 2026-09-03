import os
import sys
import json
import joblib

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.ml_engine import MLEngine

def train_and_save():
    print("[+] Training models from Heart_Disease_Severity_ML_Pipeline_fixed...")
    engine = MLEngine()
    
    save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(save_dir, exist_ok=True)
    
    for name, model in engine.fitted_models.items():
        filename = f"{name.lower().replace(' ', '_')}_model.joblib"
        filepath = os.path.join(save_dir, filename)
        joblib.dump(model, filepath)
        print(f"[OK] Saved {name} to {filepath}")
        
    benchmarks_path = os.path.join(save_dir, "benchmarks.json")
    with open(benchmarks_path, "w", encoding="utf-8") as f:
        json.dump(engine.get_model_benchmarks(), f, indent=2)
    print(f"[OK] Saved benchmarks to {benchmarks_path}")
    print("[+] Model training and export complete!")

if __name__ == "__main__":
    train_and_save()
