import json
import re
from backend.app.ai.gemini import ask_gemini


class AnswerEvaluator:
    def evaluate(self, question: str, answer: str) -> dict:
        prompt = f"""
You are a senior technical interviewer.

Evaluate this candidate answer.

QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Return ONLY valid JSON with exactly these keys:
score (integer 0-100),
technical_correctness (integer 0-10),
understanding (integer 0-10),
practical_knowledge (integer 0-10),
clarity (integer 0-10),
completeness (integer 0-10),
strengths (array of strings),
weaknesses (array of strings),
feedback (string),
recommendation (one of: "proceed", "follow_up", "decrease_difficulty").

Do not use markdown fences.
"""
        raw = ask_gemini(prompt).strip()
        return self._parse(raw)

    @staticmethod
    def _parse(raw: str) -> dict:
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.S)
            if match:
                return json.loads(match.group(0))
            return {
                "score": 0,
                "technical_correctness": 0,
                "understanding": 0,
                "practical_knowledge": 0,
                "clarity": 0,
                "completeness": 0,
                "strengths": [],
                "weaknesses": ["AI evaluator returned invalid JSON."],
                "feedback": raw[:1000],
                "recommendation": "follow_up",
            }
