from backend.app.interview.planner import InterviewPlanner
from backend.app.memory.conversation_memory import ConversationMemory


class InterviewEngine:

    def __init__(self):
        self.planner = InterviewPlanner()
        self.memory = ConversationMemory()

    def start_interview(self, candidate_id):

        plan = self.planner.create_plan(candidate_id)

        self.memory.start(candidate_id)

        return {
            "candidate": plan["candidate"],
            "question_number": 1,
            "total_questions": len(plan["questions"]),
            "question": plan["questions"][0]
        }