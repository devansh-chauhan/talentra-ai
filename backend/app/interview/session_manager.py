from backend.app.services import database


class InterviewSessionManager:
    def __init__(self):
        self.sessions = {}
        database.init_db()

    def create_session(self, candidate_id, questions, candidate=None):
        session = {
            "candidate_id": candidate_id,
            "candidate": candidate or {},
            "questions": questions,
            "current_index": 0,
            "answers": [],
            "evaluations": [],
            "completed": False,
        }
        self.sessions[candidate_id] = session
        database.save_session(
            candidate_id,
            session["candidate"],
            questions,
            0,
            False,
        )
        return session

    def get_session(self, candidate_id):
        if candidate_id in self.sessions:
            return self.sessions[candidate_id]

        row = database.get_session(candidate_id)
        if not row:
            return None

        answers = database.get_answers(candidate_id)
        session = {
            "candidate_id": candidate_id,
            "candidate": __import__("json").loads(row["candidate_json"]),
            "questions": __import__("json").loads(row["questions_json"]),
            "current_index": row["current_index"],
            "answers": [
                {"question": a["question"], "answer": a["answer"]}
                for a in answers
            ],
            "evaluations": [a["evaluation"] for a in answers],
            "completed": bool(row["completed"]),
        }
        self.sessions[candidate_id] = session
        return session

    def get_current_question(self, candidate_id):
        session = self.get_session(candidate_id)
        if not session:
            return None
        index = session["current_index"]
        if index >= len(session["questions"]):
            return None
        return session["questions"][index]

    def submit_answer(self, candidate_id, answer, evaluation):
        session = self.get_session(candidate_id)
        if not session:
            return None

        current_question = self.get_current_question(candidate_id)
        if not current_question:
            session["completed"] = True
            return session

        session["answers"].append({
            "question": current_question,
            "answer": answer,
        })
        session["evaluations"].append(evaluation)

        database.save_answer(
            candidate_id,
            current_question,
            answer,
            evaluation,
        )

        session["current_index"] += 1
        if session["current_index"] >= len(session["questions"]):
            session["completed"] = True

        database.save_session(
            candidate_id,
            session["candidate"],
            session["questions"],
            session["current_index"],
            session["completed"],
        )
        return session
