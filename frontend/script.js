const API_URL = window.location.origin && window.location.origin !== "null"
  ? window.location.origin
  : "http://127.0.0.1:8000";

const QUESTIONS = [
  "Difficulty in social interaction",
  "Avoids eye contact",
  "Difficulty understanding emotions",
  "Prefers to be alone",
  "Difficulty making friends",
  "Repetitive behaviors",
  "Difficulty with conversation",
  "Limited interests",
  "Difficulty understanding social cues",
  "Difficulty adapting to change",
];

const questionGrid = document.getElementById("question-grid");
const form = document.getElementById("screening-form");
const submitButton = document.getElementById("submit-button");
const statusCard = document.getElementById("status-card");
const resultGrid = document.getElementById("result-grid");

function renderQuestions() {
  questionGrid.innerHTML = QUESTIONS.map((question, index) => `
    <label class="field question-card">
      <strong>${question}</strong>
      <select id="A${index + 1}" required>
        <option value="" selected disabled>Select answer</option>
        <option value="0">No</option>
        <option value="1">Yes</option>
      </select>
    </label>
  `).join("");
}

function getPayload() {
  const payload = {
    age: Number.parseFloat(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    ethnicity: document.getElementById("ethnicity").value,
    jundice: document.getElementById("jundice").value,
    austim: document.getElementById("austim").value,
    contry_of_res: document.getElementById("contry_of_res").value.trim(),
    used_app_before: "no",
    relation: document.getElementById("relation").value,
  };

  for (let index = 1; index <= 10; index += 1) {
    payload[`A${index}_Score`] = Number.parseInt(document.getElementById(`A${index}`).value, 10);
  }

  return payload;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getToneClass(riskLevel) {
  return `tone-${riskLevel.toLowerCase()}`;
}

function getFriendlyTitle(riskLevel) {
  if (riskLevel === "Low") {
    return "Everything looks reassuring";
  }
  if (riskLevel === "Moderate") {
    return "A few signs may need attention";
  }
  return "A closer check may be helpful";
}

function renderResultCard(result) {
  return `
    <article class="model-card single-result ${getToneClass(result.risk_level)}">
      <div class="result-orb ${getToneClass(result.risk_level)}"></div>
      <p class="result-kicker">${getFriendlyTitle(result.risk_level)}</p>
      <p class="prediction">${result.headline}</p>
      <div class="meter">
        <div class="meter-fill" style="width:${formatPercent(result.probability)}"></div>
      </div>
      <p class="probability">Overall support score: ${formatPercent(result.probability)}</p>
    </article>
  `;
}

async function predict(event) {
  event.preventDefault();

  const payload = getPayload();
  if (!Number.isFinite(payload.age) || payload.age <= 0) {
    statusCard.textContent = "Enter a valid age before submitting the form.";
    statusCard.className = "status-card error";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  statusCard.textContent = "Processing your response...";
  statusCard.className = "status-card loading";

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    resultGrid.innerHTML = renderResultCard(data.result);

    statusCard.textContent = "Result ready.";
    statusCard.className = "status-card success";
  } catch (error) {
    resultGrid.innerHTML = "";
    statusCard.textContent = `Unable to complete the assessment. ${error.message}`;
    statusCard.className = "status-card error";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
}

renderQuestions();
form.addEventListener("submit", predict);
