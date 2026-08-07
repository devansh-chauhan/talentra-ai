import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


class DataLoader:

    @staticmethod
    def load_curriculum():
        with open(DATA_DIR / "curriculum.json", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def load_candidates():
        with open(DATA_DIR / "candidates.json", encoding="utf-8") as f:
            return json.load(f)