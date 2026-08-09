from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.app.api.interview import router as interview_router
from backend.app.api.candidates import router as candidates_router

app = FastAPI(
    title="Talentra AI",
    description="Adaptive AI Interview Agent",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_router, prefix="/api")
app.include_router(candidates_router, prefix="/api")

frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")


@app.get("/")
def root():
    return {
        "name": "Talentra AI",
        "status": "running",
        "message": "Adaptive AI Interview Agent API",
        "docs": "/docs",
        "frontend": "/app",
    }
