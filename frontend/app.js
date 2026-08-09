const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const $ = id => document.getElementById(id);

let candidateId = "CAND-003";
let total = 8;
let current = 0;


/* =========================================================
   API HELPER
   ========================================================= */
async function api(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            data.detail || `Request failed (${res.status})`
        );
    }

    return data;
}


/* =========================================================
   CANDIDATE PREVIEW
   ========================================================= */

async function previewCandidate() {
    try {
        const id = $("candidateId").value.trim();

        if (!id) {
            $("candidatePreview").innerHTML = "";
            return;
        }

        const c = await api(`/api/candidates/${id}`);

        $("candidatePreview").innerHTML = `
            <div class="preview">
                <b>${c.member.name} · ${c.member.jobRole}</b>
                <span>
                    ${c.member.yearsExperience} years ·
                    ${c.member.education}
                </span>
            </div>
        `;

        $("error").textContent = "";

    } catch (error) {
        $("candidatePreview").innerHTML = "";
    }
}


/* =========================================================
   CANDIDATE INPUT EVENTS
   ========================================================= */

$("candidateId").addEventListener(
    "change",
    previewCandidate
);

$("candidateId").addEventListener(
    "blur",
    previewCandidate
);

previewCandidate();


/* =========================================================
   START INTERVIEW
   ========================================================= */

$("startBtn").onclick = async () => {

    candidateId = $("candidateId").value.trim();

    if (!candidateId) {
        $("error").textContent =
            "Please enter a candidate ID.";

        return;
    }

    $("startBtn").disabled = true;
    $("startBtn").textContent = "Starting...";
    $("error").textContent = "";

    try {

        const data = await api(
            `/api/interview/start/${candidateId}`,
            {
                method: "POST"
            }
        );

        total = data.total_questions || 8;
        current = 0;

        renderCandidate(data.candidate);

        renderQuestion(
            data.current_question
        );

        $("setupView").classList.add("hidden");

        $("interviewView").classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(
            "Start interview error:",
            error
        );

        $("error").textContent =
            error.message;

    } finally {

        $("startBtn").disabled = false;
        $("startBtn").textContent =
            "Start Interview";
    }
};


/* =========================================================
   RENDER CANDIDATE
   ========================================================= */

function renderCandidate(candidate) {

    if (!candidate) {
        return;
    }

    $("candidateCard").innerHTML = `
        <div class="candidate">
            <h3>${candidate.name}</h3>

            <p>
                ${candidate.jobRole || "Technical Candidate"}
            </p>

            <p>
                ${candidate.education || ""}
            </p>
        </div>
    `;
}


/* =========================================================
   RENDER QUESTION
   ========================================================= */

function renderQuestion(q) {

    if (!q) {
        console.warn(
            "No question received from backend."
        );

        return;
    }

    const oldQuestion =
        $("currentQuestion");

    if (oldQuestion) {
        oldQuestion.remove();
    }

    $("questionNo").textContent =
        `QUESTION ${current + 1}`;

    $("progressText").textContent =
        `${current} / ${total}`;

    const progress =
        Math.round(
            (current / total) * 100
        );

    $("progressBar").style.width =
        `${progress}%`;

    $("difficulty").textContent =
        (
            q.difficulty ||
            "Hard"
        ).toUpperCase();

    $("topic").textContent =
        q.topic ||
        "Technical Assessment";

    $("question").textContent =
        q.question ||
        "No question available.";

    $("tools").innerHTML =
        (q.tools || [])
            .map(
                tool =>
                    `<span>${tool}</span>`
            )
            .join("");

    $("answer").value = "";

    $("answerHint").textContent =
        "Be specific. Explain your reasoning and implementation choices.";

    $("answer").focus();

    $("evaluation").classList.add(
        "hidden"
    );
}


/* =========================================================
   SUBMIT ANSWER
   ========================================================= */

$("submitBtn").onclick = async () => {
    const answer = $("answer").value.trim();

    if (!answer) {
        $("answerHint").textContent =
            "Please enter an answer before submitting.";
        return;
    }

    $("submitBtn").disabled = true;
    $("submitBtn").textContent = "AI evaluating...";
    $("answerHint").textContent = "";

    try {
        console.log("Submitting answer...");

        const data = await api(
            `/api/interview/answer/${candidateId}`,
            {
                method: "POST",
                body: JSON.stringify({
                    answer: answer
                })
            }
        );

        console.log("Answer response:", data);

        showEvaluation(
            data.evaluation,
            data.adaptive_decision
        );

        if (data.completed === true) {
            console.log("Interview completed");

            await showReport();
            return;
        }

        current++;

        if (!data.next_question) {
            throw new Error(
                "Backend did not return the next interview question."
            );
        }

        renderQuestion(data.next_question);

    } catch (error) {
        console.error("Submit answer error:", error);

        $("answerHint").textContent =
            error.message || "Failed to submit answer.";

    } finally {
        $("submitBtn").disabled = false;
        $("submitBtn").textContent = "Submit Answer →";
    }
};

/* =========================================================
   SHOW AI EVALUATION
   ========================================================= */

function showEvaluation(
    evaluation,
    decision
) {

    const box =
        $("evaluation");

    if (!evaluation) {

        box.classList.remove(
            "hidden"
        );

        box.innerHTML = `
            <div class="evalscore">
                —
                <small>/100</small>
            </div>

            <p>
                Evaluation unavailable.
            </p>
        `;

        return;
    }


    /*
     * Backend normally returns:
     *
     * adaptive_decision: {
     *     action: "increase_difficulty",
     *     reason: "..."
     * }
     */

    let action = "proceed";

    let reason = "";

    if (
        decision &&
        typeof decision === "object"
    ) {

        action =
            decision.action ||
            "proceed";

        reason =
            decision.reason ||
            "";

    } else if (
        typeof decision === "string"
    ) {

        action = decision;
    }


    const score =
        evaluation.score ?? 0;

    const feedback =
        evaluation.feedback || "";


    const strengths =
        evaluation.strengths || [];

    const weaknesses =
        evaluation.weaknesses || [];


    const actionText =
        String(action)
            .replaceAll(
                "_",
                " "
            );


    box.classList.remove(
        "hidden"
    );


    box.innerHTML = `
        <div class="evalscore">
            ${score}
            <small>
                /100 · ${actionText}
            </small>
        </div>

        <p>
            ${feedback}
        </p>

        ${
            reason
                ? `
                    <p>
                        <b>Adaptive decision:</b>
                        ${reason}
                    </p>
                `
                : ""
        }

        ${
            strengths.length
                ? `
                    <div class="evaluation-section">
                        <b>Strengths</b>
                        <ul>
                            ${strengths
                                .map(
                                    item =>
                                        `<li>${item}</li>`
                                )
                                .join("")}
                        </ul>
                    </div>
                `
                : ""
        }

        ${
            weaknesses.length
                ? `
                    <div class="evaluation-section">
                        <b>Areas to improve</b>
                        <ul>
                            ${weaknesses
                                .map(
                                    item =>
                                        `<li>${item}</li>`
                                )
                                .join("")}
                        </ul>
                    </div>
                `
                : ""
        }
    `;
}


/* =========================================================
   SHOW FINAL REPORT
   ========================================================= */

async function showReport() {

    try {

        const report =
            await api(
                `/api/interview/report/${candidateId}`
            );


        console.log(
            "Interview report:",
            report
        );


        /*
         * Hide interview screen
         */

        $("interviewView")
            .classList
            .add("hidden");


        /*
         * Show report screen
         */

        $("reportView")
            .classList
            .remove("hidden");


        /*
         * Candidate name
         */

        if (
            report.candidate
        ) {

            $("reportTitle").textContent =
                `${report.candidate.name} — Interview Report`;

        } else {

            $("reportTitle").textContent =
                "Interview Report";
        }


        /*
         * Overall score
         */

        $("overallScore").textContent =
            report.overall_score ?? 0;


        /*
         * Recommendation
         */

        $("recommendation").textContent =
            report.recommendation ||
            "Review";


        /*
         * Metrics
         */

        const metrics = [

            [
                "Technical",
                report.technical_correctness
            ],

            [
                "Understanding",
                report.understanding
            ],

            [
                "Practical",
                report.practical_knowledge
            ],

            [
                "Clarity",
                report.clarity
            ],

            [
                "Completeness",
                report.completeness
            ]

        ];


        $("metrics").innerHTML =
            metrics
                .map(
                    ([name, value]) => `
                        <div class="metric">
                            <b>
                                ${value ?? 0}
                            </b>

                            <small>
                                ${name}
                            </small>
                        </div>
                    `
                )
                .join("");


        /*
         * Individual evaluations
         */

        const evaluations =
            report.evaluations || [];


        $("reportDetails").innerHTML =
            evaluations
                .map(
                    (evaluation, index) => {

                        const strengths =
                            evaluation.strengths ||
                            [];

                        const weaknesses =
                            evaluation.weaknesses ||
                            [];


                        return `
                            <div class="detail">

                                <h4>
                                    Question ${index + 1}
                                    · Score
                                    ${evaluation.score ?? 0}
                                </h4>

                                <p>
                                    ${
                                        evaluation.feedback ||
                                        ""
                                    }
                                </p>

                                ${
                                    strengths.length
                                        ? `
                                            <p>
                                                <b>
                                                    Strengths:
                                                </b>

                                                ${strengths.join(
                                                    " · "
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                                ${
                                    weaknesses.length
                                        ? `
                                            <p>
                                                <b>
                                                    Areas to improve:
                                                </b>

                                                ${weaknesses.join(
                                                    " · "
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                            </div>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "Report error:",
            error
        );

        alert(
            "Interview completed, but the report could not be loaded: " +
            error.message
        );
    }
}


/* =========================================================
   START ANOTHER INTERVIEW
   ========================================================= */

const restartButton =
    $("restartBtn");

if (restartButton) {

    restartButton.onclick = () => {

        /*
         * Hide report
         */

        $("reportView")
            .classList
            .add("hidden");


        /*
         * Show setup
         */

        $("setupView")
            .classList
            .remove("hidden");


        /*
         * Reset state
         */

        current = 0;
        total = 8;

        $("candidatePreview").innerHTML =
            "";

        $("error").textContent =
            "";

        $("answer").value =
            "";

        previewCandidate();
    };
}


/* =========================================================
   API DOCS BUTTON
   ========================================================= */

const docsButton =
    $("docsBtn");

if (docsButton) {

    docsButton.onclick = () => {

        window.open(
            `${API_BASE}/docs`,
            "_blank"
        );
    };
}


/* =========================================================
   INITIAL STATE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Make sure interview/report
         * sections are in the correct
         * initial state.
         */

        if ($("interviewView")) {
            $("interviewView")
                .classList
                .add("hidden");
        }

        if ($("reportView")) {
            $("reportView")
                .classList
                .add("hidden");
        }

        if ($("setupView")) {
            $("setupView")
                .classList
                .remove("hidden");
        }
    }
);