import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "talentra.db"


def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = _conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS sessions (
        candidate_id TEXT PRIMARY KEY,
        candidate_json TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        current_index INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id TEXT NOT NULL,
        question_json TEXT NOT NULL,
        answer TEXT NOT NULL,
        evaluation_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()


def save_session(candidate_id, candidate, questions, current_index=0, completed=False):
    now = datetime.now(timezone.utc).isoformat()
    conn = _conn()
    conn.execute("""
        INSERT INTO sessions
        (candidate_id, candidate_json, questions_json, current_index, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(candidate_id) DO UPDATE SET
            candidate_json=excluded.candidate_json,
            questions_json=excluded.questions_json,
            current_index=excluded.current_index,
            completed=excluded.completed,
            updated_at=excluded.updated_at
    """, (
        candidate_id, json.dumps(candidate), json.dumps(questions),
        current_index, int(completed), now, now
    ))
    conn.commit()
    conn.close()


def get_session(candidate_id):
    conn = _conn()
    row = conn.execute(
        "SELECT * FROM sessions WHERE candidate_id = ?", (candidate_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)


def save_answer(candidate_id, question, answer, evaluation):
    conn = _conn()
    conn.execute("""
        INSERT INTO answers
        (candidate_id, question_json, answer, evaluation_json, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        candidate_id, json.dumps(question), answer,
        json.dumps(evaluation), datetime.now(timezone.utc).isoformat()
    ))
    conn.commit()
    conn.close()


def get_answers(candidate_id):
    conn = _conn()
    rows = conn.execute(
        "SELECT * FROM answers WHERE candidate_id = ? ORDER BY id",
        (candidate_id,)
    ).fetchall()
    conn.close()
    result = []
    for row in rows:
        item = dict(row)
        item["question"] = json.loads(item.pop("question_json"))
        item["evaluation"] = json.loads(item.pop("evaluation_json"))
        result.append(item)
    return result


def clear_session(candidate_id):
    conn = _conn()
    conn.execute("DELETE FROM answers WHERE candidate_id = ?", (candidate_id,))
    conn.execute("DELETE FROM sessions WHERE candidate_id = ?", (candidate_id,))
    conn.commit()
    conn.close()
