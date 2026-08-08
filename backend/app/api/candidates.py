from fastapi import APIRouter, HTTPException
from backend.app.services.data_loader import DataLoader

router = APIRouter()


@router.get("/candidates")
def candidates():
    return DataLoader.load_candidates()


@router.get("/candidates/{candidate_id}")
def candidate(candidate_id: str):
    try:
        item = next(
            c for c in DataLoader.load_candidates()["candidates"]
            if c["member"]["id"] == candidate_id
        )
        return item
    except StopIteration:
        raise HTTPException(status_code=404, detail="Candidate not found")
