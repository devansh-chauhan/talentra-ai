from fastapi import APIRouter
from backend.app.interview.interviewer import InterviewEngine

router = APIRouter()

engine = InterviewEngine()


@router.post("/interview/start/{candidate_id}")
def start(candidate_id: str):
    return engine.start_interview(candidate_id)