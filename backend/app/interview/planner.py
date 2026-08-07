from backend.app.services.data_loader import DataLoader
from backend.app.interview.question_generator import QuestionGenerator


class InterviewPlanner:

    def __init__(self):
        self.generator = QuestionGenerator()

    def create_plan(self, candidate_id):

        candidates = DataLoader.load_candidates()

        candidate = next(
            (
                c
                for c in candidates["candidates"]
                if c["member"]["id"] == candidate_id
            ),
            None,
        )

        if not candidate:
            return {"error": "Candidate not found"}

        completed = [
            m
            for m in candidate["missions"]
            if m.get("passed")
        ]

        completed = sorted(
            completed,
            key=lambda x: x.get("attempts", 99),
            reverse=True,
        )

        selected = completed[:8]

        questions = self.generator.generate_questions(selected)

        return {
            "candidate": candidate["member"],
            "signals": candidate["signals"],
            "questions": questions,
        }