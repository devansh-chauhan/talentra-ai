"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Candidate = {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status?: string;
};

type Question = {
  day: number;
  topic: string;
  question: string;
  difficulty: string;
  tools: string[];
  objectives: string[];
  type?: string;
};

type Evaluation = {
  score: number;
  technical_correctness: number;
  understanding: number;
  practical_knowledge: number;
  clarity: number;
  completeness: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  recommendation: string;
};

type InterviewResponse = {
  message: string;
  completed: boolean;
  evaluation: Evaluation;
  adaptive_decision?: {
    action: string;
    reason: string;
  };
  next_question?: Question;
  question_number?: number;
  total_questions?: number;
  answers_submitted?: number;
};

type Report = {
  candidate: Candidate;
  overall_score: number;
  recommendation: string;
  technical_correctness: number;
  understanding: number;
  practical_knowledge: number;
  clarity: number;
  completeness: number;
  evaluations: Evaluation[];
};

async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export default function Home() {
  const [candidateId, setCandidateId] = useState("CAND-003");
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [adaptiveDecision, setAdaptiveDecision] =
    useState<any>(null);

  const [report, setReport] = useState<Report | null>(null);

  const [view, setView] =
    useState<"setup" | "interview" | "report">("setup");

  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(8);

  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  async function loadCandidate(id: string) {
    if (!id.trim()) return;

    setLoadingCandidate(true);
    setError("");

    try {
      const data = await api<any>(
        `/api/candidates/${id.trim()}`
      );

      setCandidate(data.member);
    } catch {
      setCandidate(null);
    } finally {
      setLoadingCandidate(false);
    }
  }

  useEffect(() => {
    loadCandidate(candidateId);
  }, []);

  async function startInterview() {
    if (!candidateId.trim()) {
      setError("Please enter a candidate ID.");
      return;
    }

    setStarting(true);
    setError("");
    setEvaluation(null);
    setAdaptiveDecision(null);
    setReport(null);
    setAnswer("");

    try {
      const data = await api<any>(
        `/api/interview/start/${candidateId.trim()}`,
        {
          method: "POST",
        }
      );

      setCandidate(data.candidate);
      setTotal(data.total_questions);
      setCurrent(0);
      setQuestion(data.current_question);

      setView("interview");
    } catch (err: any) {
      setError(err.message || "Unable to start interview.");
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setError("Please enter an answer before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      console.log("Submitting answer...");

      const data = await api<InterviewResponse>(
        `/api/interview/answer/${candidateId.trim()}`,
        {
          method: "POST",
          body: JSON.stringify({
            answer: trimmedAnswer,
          }),
        }
      );

      console.log("Answer response:", data);

      setEvaluation(data.evaluation);
      setAdaptiveDecision(data.adaptive_decision);

      if (data.completed) {
        await loadReport();
        return;
      }

      if (!data.next_question) {
        throw new Error(
          "The server did not return the next question."
        );
      }

      setCurrent((previous) => previous + 1);
      setQuestion(data.next_question);
      setAnswer("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err: any) {
      console.error("Submit answer error:", err);

      setError(
        err.message || "Failed to submit answer."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function loadReport() {
    try {
      const data = await api<Report>(
        `/api/interview/report/${candidateId.trim()}`
      );

      setReport(data);
      setView("report");
    } catch (err: any) {
      setError(
        err.message ||
          "Interview completed, but the report could not be loaded."
      );
    }
  }

  function restartInterview() {
    setView("setup");
    setQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setAdaptiveDecision(null);
    setReport(null);
    setCurrent(0);
    setError("");

    loadCandidate(candidateId);
  }

  const progress = Math.min(
    100,
    Math.round(((current + 1) / total) * 100)
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">T</div>

          <div>
            <h1>Talentra AI</h1>
            <p>Adaptive AI Interview Agent</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />
          AI ENGINE ONLINE
        </div>
      </header>

      <div className="page-container">
        {error && (
          <div className="error-box">
            <strong>Error</strong>
            <span>{error}</span>
            <button onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {view === "setup" && (
          <section className="setup-page">
            <div className="hero">
              <div className="hero-badge">
                AI-POWERED INTERVIEW PLATFORM
              </div>

              <h2>
                Interview smarter.
                <br />
                <span>Hire better.</span>
              </h2>

              <p>
                Talentra AI conducts adaptive technical
                interviews, evaluates candidate responses,
                and dynamically adjusts the interview based
                on performance.
              </p>
            </div>

            <div className="setup-grid">
              <div className="setup-card">
                <div className="section-label">
                  INTERVIEW SETUP
                </div>

                <h3>Start a candidate interview</h3>

                <label>
                  Candidate ID
                </label>

                <div className="input-row">
                  <input
                    value={candidateId}
                    onChange={(e) =>
                      setCandidateId(e.target.value)
                    }
                    onBlur={() =>
                      loadCandidate(candidateId)
                    }
                    placeholder="CAND-003"
                  />

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      loadCandidate(candidateId)
                    }
                  >
                    Preview
                  </button>
                </div>

                {loadingCandidate && (
                  <p className="muted">
                    Loading candidate...
                  </p>
                )}

                {candidate && (
                  <div className="candidate-preview">
                    <div className="avatar">
                      {candidate.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {candidate.name}
                      </strong>

                      <span>
                        {candidate.jobRole}
                      </span>

                      <small>
                        {candidate.yearsExperience} years
                        {" · "}
                        {candidate.education}
                      </small>
                    </div>
                  </div>
                )}

                <button
                  className="primary-btn start-btn"
                  onClick={startInterview}
                  disabled={starting}
                >
                  {starting
                    ? "Starting Interview..."
                    : "Start Interview →"}
                </button>
              </div>

              <div className="feature-card">
                <div className="feature-icon">AI</div>

                <h3>Adaptive Interviewing</h3>

                <p>
                  Every answer influences the next
                  question. Strong candidates receive
                  deeper questions while weaker areas
                  trigger foundational follow-ups.
                </p>

                <div className="feature-list">
                  <div>
                    <span>01</span>
                    AI Evaluation
                  </div>

                  <div>
                    <span>02</span>
                    Dynamic Difficulty
                  </div>

                  <div>
                    <span>03</span>
                    Technical Scoring
                  </div>

                  <div>
                    <span>04</span>
                    Interview Report
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "interview" && question && (
          <section className="interview-page">
            <div className="interview-header">
              <div>
                <div className="section-label">
                  LIVE INTERVIEW
                </div>

                <h2>
                  Technical Assessment
                </h2>
              </div>

              {candidate && (
                <div className="mini-candidate">
                  <div className="avatar small">
                    {candidate.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {candidate.name}
                    </strong>
                    <span>
                      {candidate.jobRole}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="progress-area">
              <div className="progress-info">
                <span>
                  QUESTION {current + 1}
                </span>

                <span>
                  {current + 1} / {total}
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="question-card">
              <div className="question-top">
                <span className="topic">
                  {question.topic}
                </span>

                <span className="difficulty">
                  {(
                    question.difficulty || "Hard"
                  ).toUpperCase()}
                </span>
              </div>

              <h3>
                {question.question}
              </h3>

              {question.objectives?.length > 0 && (
                <div className="objectives">
                  <span>Assessment areas</span>

                  <div>
                    {question.objectives
                      .slice(0, 4)
                      .map((objective, index) => (
                        <span
                          key={index}
                          className="objective"
                        >
                          {objective}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {question.tools?.length > 0 && (
                <div className="tools">
                  <span>TECHNOLOGIES</span>

                  <div>
                    {question.tools.map(
                      (tool) => (
                        <span
                          key={tool}
                          className="tool"
                        >
                          {tool}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="answer-card">
              <div className="answer-header">
                <div>
                  <span className="section-label">
                    YOUR ANSWER
                  </span>

                  <p>
                    Explain your approach clearly and
                    include practical implementation
                    details.
                  </p>
                </div>

                <span className="answer-status">
                  AI EVALUATION
                </span>
              </div>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Type your answer here..."
                disabled={submitting}
              />

              <div className="answer-footer">
                <span>
                  {answer.length} characters
                </span>

                <button
                  className="primary-btn"
                  onClick={submitAnswer}
                  disabled={submitting}
                >
                  {submitting
                    ? "AI evaluating..."
                    : "Submit Answer →"}
                </button>
              </div>
            </div>

            {evaluation && (
              <div className="evaluation-card">
                <div className="evaluation-header">
                  <div>
                    <span className="section-label">
                      AI EVALUATION
                    </span>

                    <h3>
                      Answer Assessment
                    </h3>
                  </div>

                  <div className="score-circle">
                    <strong>
                      {evaluation.score}
                    </strong>
                    <span>/100</span>
                  </div>
                </div>

                {adaptiveDecision && (
                  <div className="adaptive-banner">
                    <strong>
                      Adaptive Decision:{" "}
                      {String(
                        adaptiveDecision.action ||
                          ""
                      )
                        .replaceAll("_", " ")
                        .toUpperCase()}
                    </strong>

                    <span>
                      {adaptiveDecision.reason ||
                        ""}
                    </span>
                  </div>
                )}

                <p className="feedback">
                  {evaluation.feedback}
                </p>

                <div className="metrics-grid">
                  <Metric
                    label="Technical"
                    value={
                      evaluation.technical_correctness
                    }
                  />

                  <Metric
                    label="Understanding"
                    value={
                      evaluation.understanding
                    }
                  />

                  <Metric
                    label="Practical"
                    value={
                      evaluation.practical_knowledge
                    }
                  />

                  <Metric
                    label="Clarity"
                    value={evaluation.clarity}
                  />

                  <Metric
                    label="Completeness"
                    value={
                      evaluation.completeness
                    }
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {view === "report" && report && (
          <section className="report-page">
            <div className="report-hero">
              <div>
                <div className="section-label">
                  INTERVIEW COMPLETED
                </div>

                <h2>
                  Interview Report
                </h2>

                <p>
                  {report.candidate.name} ·{" "}
                  {report.candidate.jobRole}
                </p>
              </div>

              <div className="overall-score">
                <strong>
                  {report.overall_score}
                </strong>
                <span>OVERALL SCORE</span>
              </div>
            </div>

            <div className="recommendation">
              <span>RECOMMENDATION</span>

              <strong>
                {report.recommendation}
              </strong>
            </div>

            <div className="metrics-grid report-metrics">
              <Metric
                label="Technical"
                value={
                  report.technical_correctness
                }
              />

              <Metric
                label="Understanding"
                value={
                  report.understanding
                }
              />

              <Metric
                label="Practical"
                value={
                  report.practical_knowledge
                }
              />

              <Metric
                label="Clarity"
                value={report.clarity}
              />

              <Metric
                label="Completeness"
                value={
                  report.completeness
                }
              />
            </div>

            <div className="details-card">
              <div className="section-label">
                QUESTION-BY-QUESTION ANALYSIS
              </div>

              <h3>
                Detailed Evaluation
              </h3>

              <div className="details-list">
                {report.evaluations.map(
                  (evaluation, index) => (
                    <div
                      className="detail-item"
                      key={index}
                    >
                      <div className="detail-top">
                        <strong>
                          Question {index + 1}
                        </strong>

                        <span>
                          {evaluation.score}/100
                        </span>
                      </div>

                      <p>
                        {evaluation.feedback}
                      </p>

                      {evaluation.strengths
                        ?.length > 0 && (
                        <div>
                          <b>Strengths</b>

                          <ul>
                            {evaluation.strengths.map(
                              (item, i) => (
                                <li key={i}>
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {evaluation.weaknesses
                        ?.length > 0 && (
                        <div>
                          <b>Areas to improve</b>

                          <ul>
                            {evaluation.weaknesses.map(
                              (item, i) => (
                                <li key={i}>
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={restartInterview}
            >
              Start New Interview →
            </button>
          </section>
        )}
      </div>

      <footer>
        <span>Talentra AI</span>
        <span>
          Adaptive Intelligence for Technical
          Interviews
        </span>
      </footer>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>/ 10</span>
      <small>{label}</small>
    </div>
  );
}