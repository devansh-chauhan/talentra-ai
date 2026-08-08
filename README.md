# Talentra AI

Talentra AI is an adaptive AI technical interview agent built with FastAPI, Gemini, SQLite and a lightweight frontend.

## Features

- Candidate-specific interview plan
- Mission/curriculum driven questions
- Gemini answer evaluation
- Structured evaluation JSON
- Adaptive difficulty decisions
- AI-generated adaptive questions
- 8-question interview budget
- Persistent SQLite session and answer storage
- Automatic interview report
- Candidate API
- Swagger/OpenAPI docs
- Ready-to-use browser frontend

## Project structure

```text
Talentra-AI/
├── backend/
│   └── app/
│       ├── ai/
│       │   ├── gemini.py
│       │   └── evaluator.py
│       ├── api/
│       │   ├── candidates.py
│       │   └── interview.py
│       ├── data/
│       │   ├── candidates.json
│       │   └── curriculum.json
│       ├── interview/
│       │   ├── adaptive/
│       │   │   └── question_generator.py
│       │   ├── adaptive_engine.py
│       │   ├── planner.py
│       │   ├── question_generator.py
│       │   └── session_manager.py
│       ├── services/
│       │   ├── data_loader.py
│       │   └── database.py
│       └── main.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## Setup

### 1. Create and activate virtual environment

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure Gemini

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Put your Gemini API key into `.env`.

Do NOT commit `.env`.

### 4. Run

From the project root:

```powershell
uvicorn backend.app.main:app --reload
```

Open:

- Frontend: `http://127.0.0.1:8000/app`
- Swagger: `http://127.0.0.1:8000/docs`
- API root: `http://127.0.0.1:8000/`

## Main API endpoints

```text
GET    /api/candidates
GET    /api/candidates/{candidate_id}
GET    /api/plan/{candidate_id}

POST   /api/interview/start/{candidate_id}
POST   /api/interview/answer/{candidate_id}

GET    /api/interview/session/{candidate_id}
GET    /api/interview/report/{candidate_id}
DELETE /api/interview/session/{candidate_id}
```

## Interview flow

```text
Candidate
   ↓
Interview Planner
   ↓
Question Generator
   ↓
Interview Session
   ↓
Candidate Answer
   ↓
Gemini Evaluator
   ↓
Score + Feedback
   ↓
Adaptive Engine
   ├── increase difficulty
   ├── proceed
   └── decrease difficulty
   ↓
Adaptive Question Generator
   ↓
Next Question
   ↓
Final Report
```

## Important

The bundled `candidates.json` is sample data. Replace it with your actual candidate dataset if needed.

The bundled Gemini model is configurable through `GEMINI_MODEL`. If Google changes model availability for your account, set the model name to one available to your API key.
