from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.interview import router as interview_router

app = FastAPI(
    title="Talentra AI",
    description="Adaptive AI Interview Agent",
    version="1.0.0"
)

app.include_router(interview_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # we'll restrict later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "Talentra AI",
        "status": "running",
        "message": "Adaptive AI Interview Agent API"
    }