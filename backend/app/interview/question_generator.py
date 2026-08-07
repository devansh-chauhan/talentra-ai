from backend.app.services.data_loader import DataLoader


class QuestionGenerator:

    def __init__(self):
        self.curriculum = DataLoader.load_curriculum()

    def generate_questions(self, interview_days):
        questions = []

        for mission in interview_days:

            day_number = mission["day"]

            day_info = next(
                (
                    d
                    for d in self.curriculum["days"]
                    if d["day"] == day_number
                ),
                None
            )

            if not day_info:
                continue

            questions.append(
                {
                    "day": day_number,
                    "topic": day_info["title"],
                    "question": f"Can you explain the concept of '{day_info['title']}' and describe how you would implement it in a real project?",
                    "difficulty": self._difficulty(mission),
                    "tools": day_info["tools"],
                    "objectives": day_info["objectives"],
                }
            )

        return questions

    def _difficulty(self, mission):
        attempts = mission.get("attempts", 1)

        if attempts == 1:
            return "Hard"

        if attempts <= 3:
            return "Medium"

        return "Easy"