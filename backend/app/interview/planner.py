from backend.app.services.data_loader import DataLoader
from backend.app.interview.question_generator import QuestionGenerator


class InterviewPlanner:
    def __init__(self):
        self.generator = QuestionGenerator()

    def create_plan(self, candidate_id):
        curriculum = DataLoader.load_curriculum()
        candidates = DataLoader.load_candidates()

        candidate = next(
            c for c in candidates["candidates"]
            if c["member"]["id"] == candidate_id
        )

        completed = [
            mission for mission in candidate["missions"]
            if mission.get("passed")
        ]

        completed.sort(
            key=lambda x: x.get("attempts", 1),
            reverse=True
        )

        selected = completed[:8]
        questions = self.generator.generate_questions(selected)

        return {
            "candidate": candidate["member"],
            "signals": candidate["signals"],
            "interview_days": selected,
            "questions": questions,
            "curriculum_days": len(curriculum.get("days", [])),
        }
