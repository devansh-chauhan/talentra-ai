from fastapi import APIRouter
from backend.app.interview.planner import InterviewPlanner

router = APIRouter()

planner = InterviewPlanner()


@router.get("/plan/{candidate_id}")
def interview_plan(candidate_id: str):
    return planner.create_plan(candidate_id)