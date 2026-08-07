class ConversationMemory:

    def __init__(self):
        self.sessions = {}

    def start(self, candidate_id):
        self.sessions[candidate_id] = {
            "current_question": 0,
            "history": [],
            "score": 0,
        }

    def add_turn(self, candidate_id, question, answer):
        self.sessions[candidate_id]["history"].append(
            {
                "question": question,
                "answer": answer,
            }
        )

    def get(self, candidate_id):
        return self.sessions.get(candidate_id)

    def next_question(self, candidate_id):
        self.sessions[candidate_id]["current_question"] += 1