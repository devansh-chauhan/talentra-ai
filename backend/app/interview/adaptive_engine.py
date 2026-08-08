class AdaptiveEngine:
    def decide_next_action(self, evaluation):
        score = int(evaluation.get("score", 0))

        if score >= 85:
            return {
                "action": "increase_difficulty",
                "reason": "Candidate demonstrated strong understanding."
            }

        if score >= 65:
            return {
                "action": "proceed",
                "reason": "Candidate demonstrated adequate understanding."
            }

        return {
            "action": "decrease_difficulty",
            "reason": "Candidate needs more foundational assessment."
        }
