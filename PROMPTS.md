# Talentra AI — Project Transcript / Master Prompt

## Role

You are taking over an existing hackathon project called **Talentra AI**. Do not start from scratch. Understand the existing architecture, preserve working functionality, and help finish the hackathon.

## Project Goal

Talentra AI is an **Adaptive AI Interview Agent** that:

1. Takes a candidate ID.
2. Loads candidate information.
3. Starts an adaptive technical interview.
4. Presents questions.
5. Accepts natural-language answers.
6. Uses Gemini to evaluate answers.
7. Uses an adaptive engine to decide the next question/difficulty.
8. Maintains interview/session state.
9. Generates a final interview report.
10. Provides a Next.js frontend and FastAPI backend.
11. Is deployed on Render.

The project was built for a **Vibe Coding Hackathon by AbTalksOnAI**, using the **Interview Agent** problem statement.

---

## Repository

GitHub:

https://github.com/devansh-chauhan/talentra-ai.git

Local project:

```text
C:\Users\Lenovo\Talentra-AI
```

Branch:

```text
main
```

---

## Architecture

```text
Talentra AI
├── backend/
│   └── FastAPI
│       ├── API routes
│       ├── candidate data
│       ├── curriculum
│       ├── Gemini integration
│       ├── answer evaluator
│       ├── adaptive engine
│       ├── interview planner
│       ├── session manager
│       └── database
│
├── frontend/
│   └── Next.js 16 / React
│       ├── candidate preview
│       ├── interview UI
│       ├── question display
│       ├── answer submission
│       ├── evaluation display
│       └── final report
│
└── Render
    ├── talentra-ai-backend
    └── talentra-ai-frontend
```

---

## Backend

Technology:

- Python
- FastAPI
- Uvicorn
- Google GenAI SDK
- Gemini
- SQLite
- python-dotenv

Local backend:

```text
http://127.0.0.1:8000
```

Production backend:

```text
https://talentra-ai-backend.onrender.com
```

Run locally:

```powershell
uvicorn backend.app.main:app --reload
```

---

## Frontend

Technology:

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router

Local frontend:

```text
http://localhost:3000
```

Production frontend:

```text
https://talentra-ai-frontend.onrender.com
```

The frontend successfully built on Render with Next.js 16.3.0 and `npm run start`.

---

## Important Backend Structure

Known files/directories:

```text
backend/app/
├── ai/
│   ├── gemini.py
│   └── evaluator.py
├── api/
│   ├── interview.py
│   └── candidates.py
├── data/
│   ├── candidates.json
│   ├── curriculum.json
│   └── talentra.db
├── interview/
│   ├── adaptive/
│   ├── adaptive_engine.py
│   ├── planner.py
│   ├── question_generator.py
│   └── session_manager.py
├── services/
│   ├── data_loader.py
│   └── database.py
└── main.py
```

Older implementations had files such as `evaluator.py`, `feedback.py`, `interviewer.py`, and `conversation_memory.py`; the project was later refactored around the newer `ai`, adaptive, session, and database components.

Do not recreate or delete these files without first inspecting the repository.

---

## Gemini Integration

File:

```text
backend/app/ai/gemini.py
```

Known implementation:

```python
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.5-flash"

def ask_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    return response.text
```

Environment variable:

```text
GEMINI_API_KEY
```

Never put the Gemini API key in frontend code or GitHub.

### Previous Gemini issue

The project previously used:

```text
gemini-2.5-flash
```

which returned:

```text
404 NOT_FOUND
This model models/gemini-2.5-flash is no longer available to new users.
```

It was changed to:

```text
gemini-3.5-flash
```

Do not revert to `gemini-2.5-flash`.

---

## Backend API

### Candidate

```text
GET /api/candidates/{candidate_id}
```

Example:

```text
GET /api/candidates/CAND-003
```

This worked successfully.

Known test candidate:

```text
CAND-003
Emily Chen
```

Candidate response contains fields such as:

```text
member.name
member.jobRole
member.yearsExperience
member.education
```

### Start Interview

```text
POST /api/interview/start/{candidate_id}
```

Example:

```text
POST /api/interview/start/CAND-003
```

This worked locally and the deployed backend endpoint has responded successfully.

Expected response includes:

```text
message
candidate
current_question
total_questions
```

### Submit Answer

```text
POST /api/interview/answer/{candidate_id}
```

Body:

```json
{
  "answer": "candidate answer"
}
```

Expected response includes:

```text
evaluation
adaptive_decision
next_question
completed
```

### Report

```text
GET /api/interview/report/{candidate_id}
```

The report contains:

```text
candidate
overall_score
recommendation
technical_correctness
understanding
practical_knowledge
clarity
completeness
evaluations
```

---

## Session Manager

During development the answer flow needed to persist the evaluation:

```python
session = session_manager.submit_answer(
    candidate_id,
    request.answer,
    evaluation
)
```

The session manager should maintain the current interview state, answers, evaluations, and progress.

Before changing this, inspect the current `session_manager.py` and `interview.py`, because signatures may have evolved.

---

## Adaptive Interview

Important file:

```text
backend/app/interview/adaptive_engine.py
```

The adaptive engine decides what happens after an answer.

Conceptually:

```text
Question
   ↓
Evaluate answer
   ↓
Adaptive decision
   ↓
Choose next question
   ↓
Increase / maintain / decrease difficulty
```

The key product differentiator is that the interview is not simply a fixed questionnaire.

---

## Interview Planner

The project has an `InterviewPlanner` that uses candidate/curriculum information to plan interview content.

Previous logic included:

- loading curriculum
- loading candidates
- considering completed missions
- sorting by attempts
- selecting relevant missions
- creating interview content

Preserve this functionality.

---

## Curriculum

File:

```text
backend/app/data/curriculum.json
```

Known curriculum:

```text
AI Cohort
31 days
8 modules
```

Topics included:

- Environment & Tooling
- Data Foundations
- Embeddings & Vector Search
- LLM Core
- Prompting & Fine-Tuning
- Chatbot Application Build
- Agentic AI & MCP
- other AI topics

---

## Questions Used During Testing

The interview generated/used questions such as:

### Embeddings

> Can you explain the concept of 'Embeddings Explained' and describe how you would implement it in a real project?

### Vector Databases

> Can you explain the concept of 'Vector Databases Overview' and describe how you would implement it in a real project?

### Retrieval

> Can you explain the concept of 'The Retrieval & Matching Engine' and describe how you would implement it in a real project?

### RAG

> Can you explain the concept of 'RAG End-to-End & LLM API Basics' and describe how you would implement it in a real project?

### Prompt Engineering

> Can you explain the concept of 'Prompt Engineering Fundamentals' and describe how you would implement it in a real project?

### Function Calling

> Can you explain the concept of 'Advanced Prompting: Function Calling & Structured Outputs' and describe how you would implement it in a real project?

### Agentic Frameworks

> Can you explain the concept of 'Agentic Frameworks: LangChain Agents & Tool Use' and describe how you would implement it in a real project?

### Multi-Agent Orchestration

> Can you explain the concept of 'Multi-Agent Orchestration' and describe how you would implement it in a real project?

These questions were used to test the interview experience.

---

## Example Test Answer

For the Embeddings question, a suitable test answer was:

```text
Embeddings are numerical vector representations of data such as text, where semantically similar content is represented by vectors that are close together in vector space. They allow systems to compare meaning rather than relying only on exact keyword matches.

In a real project, I would first clean and split the documents into appropriate chunks. I would then use an embedding model to convert each chunk into a vector and store the vectors along with the original text and metadata in a vector database. When a user submits a query, I would generate an embedding for the query, perform similarity search against the stored vectors, retrieve the most relevant chunks, and use those chunks as context for an LLM. This can be used for semantic search, recommendation systems, or a RAG application.
```

---

## Final Report

The frontend displays:

- overall score
- recommendation
- Technical
- Understanding
- Practical
- Clarity
- Completeness
- question-by-question scores
- feedback
- strengths
- weaknesses

A successful test previously produced approximately:

```text
94/100
Strong Hire
```

This confirms that the local evaluation/report pipeline worked.

---

## Frontend Flow

The intended flow is:

```text
Candidate ID
      ↓
Candidate preview
      ↓
Start Interview
      ↓
Question
      ↓
Answer
      ↓
AI evaluating
      ↓
Evaluation
      ↓
Adaptive decision
      ↓
Next question
      ↓
...
      ↓
Final report
```

The frontend contains:

- candidate ID input
- candidate preview
- Start Interview
- question number
- progress
- difficulty
- topic
- tools
- question
- answer textarea
- Submit Answer
- evaluation panel
- report screen

---

## Frontend API URL

A previous local implementation used:

```javascript
const API_BASE = "http://127.0.0.1:8000";
```

This is valid locally but MUST NOT be used for production.

Production should use:

```text
https://talentra-ai-backend.onrender.com
```

Recommended Next.js environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://talentra-ai-backend.onrender.com
```

Recommended frontend code:

```javascript
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";
```

Render frontend must have the environment variable configured.

Search the entire frontend for:

```text
127.0.0.1:8000
```

and:

```text
localhost:8000
```

Any production API reference must not point to localhost.

---

## CORS

Latest intended backend CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://talentra-ai-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The production frontend origin is:

```text
https://talentra-ai-frontend.onrender.com
```

---

# Production Deployment

Render services:

### Backend

```text
talentra-ai-backend
https://talentra-ai-backend.onrender.com
```

### Frontend

```text
talentra-ai-frontend
https://talentra-ai-frontend.onrender.com
```

Both services were successfully deployed.

Frontend build logs showed:

```text
Build successful
Your service is live
```

---

# IMPORTANT CURRENT PRODUCTION ISSUE

The last unresolved issue is:

> Clicking Start Interview on the deployed frontend does nothing.

Browser DevTools showed:

```text
CAND-003
fetch
(failed)

CAND-003
preflight
(failed)
```

The production frontend and backend were both fixed/redeployed multiple times, including a CORS update.

The local interview flow worked.

Therefore, do NOT claim the production flow is fixed.

Current truthful status:

```text
Local core flow: working
Gemini evaluation: working
Adaptive interview: working locally
Final report: working locally
GitHub: working
Frontend deployment: live
Backend deployment: live
Production Start Interview: unresolved
```

---

# Production Debugging Procedure

Do not randomly rewrite the application.

### 1. Browser

Open:

```text
https://talentra-ai-frontend.onrender.com
```

Press:

```text
F12
```

Then:

```text
Network → Fetch/XHR
```

Click Start Interview.

Open the failed `CAND-003` request and check:

```text
Request URL
Status Code
Origin
Access-Control-Request-Method
Access-Control-Request-Headers
```

The Request URL must be:

```text
https://talentra-ai-backend.onrender.com/api/interview/start/CAND-003
```

NOT:

```text
http://127.0.0.1:8000/...
```

and NOT:

```text
http://localhost:8000/...
```

### 2. Backend logs

When clicking Start Interview, check Render backend logs.

Expected:

```text
OPTIONS /api/interview/start/CAND-003
```

then:

```text
POST /api/interview/start/CAND-003
```

Interpretation:

- OPTIONS never reaches backend → investigate frontend URL/network
- OPTIONS reaches backend and returns 400/403 → investigate CORS
- OPTIONS returns 200 but POST fails → investigate backend route/logic
- POST returns 500 → inspect backend traceback

Do not make additional code changes until these values are known.

---

# Git

Normal workflow:

```powershell
git status
git add .
git commit -m "description"
git push origin main
```

The repository uses:

```text
main
```

Render deploys from the latest GitHub commit.

---

# Security

Never commit:

```text
.env
.env.local
API keys
private credentials
```

Gemini API key must remain in Render environment variables.

Also consider whether `talentra.db` contains sensitive candidate information before leaving it in a public GitHub repository.

---

# Hackathon Pitch

## Talentra AI

**Talentra AI is an adaptive AI-powered technical interview agent that dynamically evaluates candidates and adjusts interview difficulty based on their responses.**

Instead of a fixed questionnaire, Talentra AI:

- understands candidate context
- uses curriculum information
- evaluates open-ended technical answers
- adapts question difficulty
- maintains interview state
- generates structured feedback
- produces a final interview report

### Core differentiator

Traditional:

```text
Question 1 → Question 2 → Question 3 → Question 4
```

Talentra:

```text
Question
   ↓
Evaluate
   ↓
Understand performance
   ↓
Adaptive decision
   ↓
Next question
   ↓
Change difficulty/topic
```

---

# Judge Questions

### Why is it adaptive?

Because the next question is determined from the candidate's previous performance instead of following a fixed sequence.

### How are answers evaluated?

Gemini receives the question and candidate answer through an evaluation prompt and returns structured assessment information such as score and feedback.

### Why use an LLM?

Technical answers are open-ended. Exact string matching cannot reliably assess semantic correctness, explanation quality, practical knowledge, clarity, and completeness.

### Why is this more than a chatbot?

It is stateful and goal-driven. It manages an interview session, evaluates answers, adapts questions, tracks progress, and produces an assessment report.

### What are the main AI components?

- Gemini: answer evaluation and feedback
- Adaptive Engine: next-question decisions
- Interview Planner: candidate/curriculum planning
- Question Generator: interview questions
- Session Manager: state and progression
- Database: persistence

---

# Hackathon Submission Priority

If production debugging becomes too risky close to submission:

1. Protect the working local demo.
2. Keep GitHub stable.
3. Make the README clear.
4. Prepare screenshots/video.
5. Explain architecture.
6. Demonstrate adaptive interviewing.
7. Demonstrate Gemini evaluation.
8. Demonstrate final report.
9. Present Render deployment as an additional achievement.
10. Do not add unnecessary features at the last minute.

---

# Final Instruction to the Next AI

You are continuing an existing project, not creating a new one.

Follow these rules:

1. Inspect existing files before replacing them.
2. Preserve working functionality.
3. Do not delete architecture unnecessarily.
4. Do not invent APIs/files.
5. Preserve Gemini evaluation.
6. Preserve adaptive interview behavior.
7. Preserve session management.
8. Preserve the final report.
9. Treat the production Start Interview issue as isolated until evidence shows otherwise.
10. Never expose API keys.
11. Give exact PowerShell commands for Git/deployment tasks.
12. Provide complete files when explicitly requested.
13. Clearly distinguish local vs production behavior.
14. Never claim a fix is complete without a successful test.
15. Prioritize a stable hackathon demo over unnecessary refactoring.

---

# Useful URLs

GitHub:

https://github.com/devansh-chauhan/talentra-ai

Frontend:

https://talentra-ai-frontend.onrender.com

Backend:

https://talentra-ai-backend.onrender.com

Backend docs:

https://talentra-ai-backend.onrender.com/docs

---

# End

Project:

**Talentra AI — Adaptive AI Interview Agent**

Current state:

**Core system works locally and is deployed.**
