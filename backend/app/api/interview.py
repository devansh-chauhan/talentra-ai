from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from requests import session

from backend.app.interview.planner import InterviewPlanner
from backend.app.interview.session_manager import InterviewSessionManager
from backend.app.ai.evaluator import AnswerEvaluator
from backend.app.interview.adaptive_engine import AdaptiveEngine
from backend.app.interview.adaptive.question_generator import AdaptiveQuestionGenerator
from backend.app.services import database

router = APIRouter()

planner = InterviewPlanner()
session_manager = InterviewSessionManager()
evaluator = AnswerEvaluator()
adaptive_engine = AdaptiveEngine()
adaptive_question_generator = AdaptiveQuestionGenerator()

MAX_QUESTIONS = 8


class AnswerRequest(BaseModel):
    answer: str


@router.get("/plan/{candidate_id}")
def interview_plan(candidate_id: str):
    try:
        return planner.create_plan(candidate_id)
    except StopIteration:
        raise HTTPException(status_code=404, detail="Candidate not found")


@router.post("/interview/start/{candidate_id}")
def start_interview(candidate_id: str):
    try:
        plan = planner.create_plan(candidate_id)
    except StopIteration:
        raise HTTPException(status_code=404, detail="Candidate not found")

    questions = plan.get("questions", [])
    if not questions:
        raise HTTPException(status_code=400, detail="No interview questions generated")

    session_manager.create_session(
        candidate_id,
        questions,
        plan["candidate"],
    )

    return {
        "message": "Interview started",
        "candidate": plan["candidate"],
        "total_questions": len(questions),
        "current_question": session_manager.get_current_question(candidate_id),
    }


@router.post("/interview/answer/{candidate_id}")
def submit_answer(candidate_id: str, request: AnswerRequest):
    session = session_manager.get_session(candidate_id)

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    if session["completed"]:
        raise HTTPException(status_code=400, detail="Interview already completed")
    if not request.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty")

    current_question = session_manager.get_current_question(candidate_id)
    if not current_question:
        raise HTTPException(status_code=400, detail="No active question")

    # 1. Evaluate answer
    evaluation = evaluator.evaluate(
    current_question["question"],
    request.answer
    )

# 2. Save answer + evaluation
    session = session_manager.submit_answer(
    candidate_id,
    request.answer,
    evaluation
    )

# 3. Decide adaptive action
    action = adaptive_engine.decide_next_action(evaluation)

# 4. Check if interview is completed
    if session["completed"]:
        return {
        "message": "Interview completed",
        "completed": True,
        "evaluation": evaluation,
        "adaptive_decision": action,
        "answers_submitted": len(session["answers"])
    }

# 5. Get next question
    next_question = session_manager.get_current_question(candidate_id)

    return {
    "message": "Answer evaluated",
    "completed": False,
    "evaluation": evaluation,
    "adaptive_decision": action,
    "next_question": next_question,
    "question_number": session["current_index"] + 1,
    "total_questions": len(session["questions"])
    }

    # The first 8 planned questions are the interview budget.
    # Adaptive generation is used to replace the next planned question
    # while keeping the total interview length controlled.
    action = adaptive_decision["action"]
    if action in ("increase_difficulty", "decrease_difficulty"):
        generated = adaptive_question_generator.generate(
            current_question=current_question,
            answer=request.answer,
            evaluation=evaluation,
            action=action,
        )
        if generated:
            idx = session["current_index"]
            if idx < len(session["questions"]):
                session["questions"][idx] = generated
                database.save_session(
                    candidate_id,
                    session["candidate"],
                    session["questions"],
                    session["current_index"],
                    session["completed"],
                )
                next_question = generated

    return {
        "message": "Answer evaluated",
        "completed": False,
        "evaluation": evaluation,
        "adaptive_decision": adaptive_decision,
        "next_question": next_question,
        "question_number": session["current_index"] + 1,
        "total_questions": len(session["questions"]),
    }


@router.get("/interview/session/{candidate_id}")
def interview_session(candidate_id: str):
    session = session_manager.get_session(candidate_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return {
        "candidate": session["candidate"],
        "current_index": session["current_index"],
        "total_questions": len(session["questions"]),
        "completed": session["completed"],
        "answers_submitted": len(session["answers"]),
    }


@router.get("/interview/report/{candidate_id}")
def interview_report(candidate_id: str):
    session = session_manager.get_session(candidate_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    if not session["completed"]:
        raise HTTPException(
            status_code=400,
            detail="Interview is not completed"
        )

    evaluations = session.get("evaluations", [])

    if not evaluations:
        raise HTTPException(
            status_code=400,
            detail="No evaluations available"
        )

    candidate = planner.create_plan(candidate_id)["candidate"]

    def avg(key):
        values = [
            e.get(key, 0)
            for e in evaluations
        ]

        return round(
            sum(values) / len(values),
            1
        )

    overall_score = round(
        sum(
            e.get("score", 0)
            for e in evaluations
        ) / len(evaluations)
    )

    if overall_score >= 80:
        recommendation = "Strong Hire"
    elif overall_score >= 65:
        recommendation = "Hire"
    elif overall_score >= 50:
        recommendation = "Consider"
    else:
        recommendation = "Reject"

    return {
        "candidate": candidate,
        "overall_score": overall_score,
        "recommendation": recommendation,
        "technical_correctness": avg(
            "technical_correctness"
        ),
        "understanding": avg("understanding"),
        "practical_knowledge": avg(
            "practical_knowledge"
        ),
        "clarity": avg("clarity"),
        "completeness": avg("completeness"),
        "evaluations": evaluations
    }

@router.delete("/interview/session/{candidate_id}")
def reset_interview(candidate_id: str):
    database.clear_session(candidate_id)
    session_manager.sessions.pop(candidate_id, None)
    return {"message": "Interview session reset", "candidate_id": candidate_id}
