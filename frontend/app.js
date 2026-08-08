const $ = id => document.getElementById(id);
let candidateId = "CAND-003";
let total = 8;
let current = 0;

async function api(url, options={}) {
  const res = await fetch(url, {
    headers: {"Content-Type":"application/json"},
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

async function previewCandidate() {
  try {
    const id = $("candidateId").value.trim();
    const c = await api(`/api/candidates/${id}`);
    $("candidatePreview").innerHTML =
      `<div class="preview"><b>${c.member.name} · ${c.member.jobRole}</b><span>${c.member.yearsExperience} years · ${c.member.education}</span></div>`;
    $("error").textContent = "";
  } catch {
    $("candidatePreview").innerHTML = "";
  }
}

$("candidateId").addEventListener("change", previewCandidate);
previewCandidate();

$("startBtn").onclick = async () => {
  candidateId = $("candidateId").value.trim();
  $("startBtn").disabled = true;
  $("error").textContent = "";
  try {
    const data = await api(`/api/interview/start/${candidateId}`, {method:"POST"});
    total = data.total_questions;
    current = 0;
    renderCandidate(data.candidate);
    renderQuestion(data.current_question);
    $("setupView").classList.add("hidden");
    $("interviewView").classList.remove("hidden");
  } catch(e) {
    $("error").textContent = e.message;
  } finally {
    $("startBtn").disabled = false;
  }
};

function renderCandidate(c) {
  $("candidateCard").innerHTML =
    `<div class="candidate"><h3>${c.name}</h3><p>${c.jobRole}</p><p>${c.education}</p></div>`;
}

function renderQuestion(q) {
  if (!q) return;
  $("currentQuestion")?.remove();
  $("questionNo").textContent = `QUESTION ${current + 1}`;
  $("progressText").textContent = `${current} / ${total}`;
  $("progressBar").style.width = `${Math.round((current / total) * 100)}%`;
  $("difficulty").textContent = (q.difficulty || "Hard").toUpperCase();
  $("topic").textContent = q.topic || "Technical Assessment";
  $("question").textContent = q.question;
  $("tools").innerHTML = (q.tools || []).map(x => `<span>${x}</span>`).join("");
  $("answer").value = "";
  $("answer").focus();
  $("evaluation").classList.add("hidden");
}

$("submitBtn").onclick = async () => {
  const answer = $("answer").value.trim();
  if (!answer) {
    $("answerHint").textContent = "Please enter an answer before submitting.";
    return;
  }

  $("submitBtn").disabled = true;
  $("submitBtn").textContent = "AI evaluating...";
  try {
    const data = await api(`/api/interview/answer/${candidateId}`, {
      method:"POST",
      body: JSON.stringify({answer})
    });

    showEvaluation(data.evaluation, data.adaptive_decision);

    if (data.completed) {
      await showReport();
      return;
    }

    current++;
    renderQuestion(data.next_question);
  } catch(e) {
    alert(e.message);
  } finally {
    $("submitBtn").disabled = false;
    $("submitBtn").textContent = "Submit Answer →";
  }
};

function showEvaluation(e, decision) {
  const box = $("evaluation");
  box.classList.remove("hidden");
  box.innerHTML = `
    <div class="evalscore">${e.score}<small>/100 · ${decision.action.replaceAll("_"," ")}</small></div>
    <p>${e.feedback || ""}</p>
  `;
}

async function showReport() {
  const report = await api(`/api/interview/report/${candidateId}`);
  $("interviewView").classList.add("hidden");
  $("reportView").classList.remove("hidden");
  $("reportTitle").textContent = `${report.candidate.name} — Interview Report`;
  $("overallScore").textContent = report.overall_score;
  $("recommendation").textContent = report.recommendation;
  const metrics = [
    ["Technical", report.technical_correctness],
    ["Understanding", report.understanding],
    ["Practical", report.practical_knowledge],
    ["Clarity", report.clarity],
    ["Completeness", report.completeness]
  ];
  $("metrics").innerHTML = metrics.map(([n,v]) =>
    `<div class="metric"><b>${v}</b><small>${n}</small></div>`
  ).join("");

  $("reportDetails").innerHTML = report.evaluations.map((e,i) => `
    <div class="detail">
      <h4>Question ${i+1} · Score ${e.score}</h4>
      <p>${e.feedback || ""}</p>
      <p><b>Strengths:</b> ${(e.strengths || []).join(" · ")}</p>
      <p><b>Areas to improve:</b> ${(e.weaknesses || []).join(" · ")}</p>
    </div>
  `).join("");
}
