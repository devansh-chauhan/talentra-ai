from backend.app.ai.gemini import ask_gemini
import json
import re


class AdaptiveQuestionGenerator:
    def generate(self, current_question, answer, evaluation, action):
        prompt = f"""
You are an adaptive technical interviewer.

Current topic: {current_question.get("topic")}
Current question: {current_question.get("question")}
Difficulty: {current_question.get("difficulty")}
Candidate answer: {answer}
Evaluation: {json.dumps(evaluation)}
Adaptive action: {action}

Generate ONE next interview question on the same topic.
If action is increase_difficulty, make it more practical/deeper.
If action is decrease_difficulty, make it more foundational.
If action is proceed, make it a natural next question.

Return ONLY JSON:
{{
  "type": "ADAPTIVE",
  "topic": "...",
  "question": "...",
  "difficulty": "Easy|Medium|Hard",
  "tools": [...],
  "objectives": [...]
}}
"""
        raw = ask_gemini(prompt).strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.S)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
        return None
