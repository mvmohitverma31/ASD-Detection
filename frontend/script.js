const API_URL = window.location.origin && window.location.origin !== "null"
  ? window.location.origin
  : "http://127.0.0.1:8000";

// ASD Clinical Questions Definitions
const QUESTIONS = [
  { id: 1, text: "Difficulty in social interaction", type: "social" },
  { id: 2, text: "Avoids eye contact", type: "social" },
  { id: 3, text: "Difficulty understanding emotions", type: "social" },
  { id: 4, text: "Prefers to be alone", type: "social" },
  { id: 5, text: "Difficulty making friends", type: "social" },
  { id: 6, text: "Repetitive behaviors", type: "behavioral" },
  { id: 7, text: "Difficulty with conversation", type: "behavioral" },
  { id: 8, text: "Limited interests", type: "behavioral" },
  { id: 9, text: "Difficulty understanding social cues", type: "behavioral" },
  { id: 10, text: "Difficulty adapting to change", type: "behavioral" },
];

// DOM Elements
const socialQuestionsGrid = document.getElementById("social-questions-grid");
const behavioralQuestionsGrid = document.getElementById("behavioral-questions-grid");
const form = document.getElementById("screening-form");
const submitButton = document.getElementById("submit-button");
const formContainer = document.getElementById("form-container");
const resultContainer = document.getElementById("result-container");
const statusCard = document.getElementById("status-card");

// Stepper Elements
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const stepNodes = document.querySelectorAll(".step-node");
const stepConnector = document.querySelectorAll(".step-connector");
let currentStep = 1;

// Biometric Interactive Elements
const ageSlider = document.getElementById("age");
const ageDisplay = document.getElementById("age-display");
const infoDrawerBtn = document.getElementById("info-drawer-btn");
const closeDrawerBtn = document.getElementById("close-drawer-btn");
const infoDrawer = document.getElementById("clinical-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");

// Dynamic 3D Tilt Panels Hooks
const unifiedCardPane = document.getElementById("unified-card-pane");

/* --- Setup Dynamic UI --- */

// Dynamic range slider indicator
ageSlider.addEventListener("input", (e) => {
  ageDisplay.textContent = e.target.value;
});

// Setup segment control bindings to sync value with hidden inputs
function setupSegmentControls() {
  const syncGroup = (groupId, hiddenInputId) => {
    const radios = document.querySelectorAll(`#${groupId} input[type="radio"]`);
    const hiddenInput = document.getElementById(hiddenInputId);
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          hiddenInput.value = radio.value;
        }
      });
    });
  };
  
  syncGroup("gender-group", "gender");
  syncGroup("jaundice-group", "jundice");
  syncGroup("austim-group", "austim");
}

// Render dynamic binary selection questionnaire rows
function renderQuestionnaire() {
  const renderRow = (q) => `
    <div class="question-row">
      <div class="question-text-block">
        <span class="question-id-tag">Question A${q.id}</span>
        <strong>${q.text}</strong>
      </div>
      <div class="segmented-control" id="Q${q.id}-group">
        <input type="radio" name="A${q.id}_Score" id="A${q.id}-no" value="0">
        <label for="A${q.id}-no">No</label>
        
        <input type="radio" name="A${q.id}_Score" id="A${q.id}-yes" value="1">
        <label for="A${q.id}-yes">Yes</label>
      </div>
    </div>
  `;

  socialQuestionsGrid.innerHTML = QUESTIONS
    .filter(q => q.type === "social")
    .map(renderRow)
    .join("");

  behavioralQuestionsGrid.innerHTML = QUESTIONS
    .filter(q => q.type === "behavioral")
    .map(renderRow)
    .join("");
}

/* --- Stateful Stepper Form Control --- */

function updateStepperUI() {
  stepNodes.forEach((node, idx) => {
    const stepVal = idx + 1;
    node.classList.remove("active", "completed");
    
    if (stepVal === currentStep) {
      node.classList.add("active");
    } else if (stepVal < currentStep) {
      node.classList.add("completed");
    }
  });

  // Toggle Steps Container visibility
  document.querySelectorAll(".wizard-step").forEach((step, idx) => {
    step.classList.remove("active");
    if (idx + 1 === currentStep) {
      step.classList.add("active");
    }
  });

  // Action Bar states
  if (currentStep === 1) {
    backBtn.disabled = true;
    nextBtn.classList.remove("hidden");
    submitButton.classList.add("hidden");
  } else if (currentStep === 2) {
    backBtn.disabled = false;
    nextBtn.classList.remove("hidden");
    submitButton.classList.add("hidden");
  } else if (currentStep === 3) {
    backBtn.disabled = false;
    nextBtn.classList.add("hidden");
    submitButton.classList.remove("hidden");
  }
}

// Client-side validations per step
function validateStep(step) {
  if (step === 1) {
    const country = document.getElementById("contry_of_res").value.trim();
    const ethnicity = document.getElementById("ethnicity").value;
    const relation = document.getElementById("relation").value;
    
    if (!country) {
      alert("Please specify Country of Residence.");
      return false;
    }
    if (!ethnicity) {
      alert("Please specify Patient Ethnicity Spectrum.");
      return false;
    }
    if (!relation) {
      alert("Please select Respondent Relation.");
      return false;
    }
  }
  return true;
}

nextBtn.addEventListener("click", () => {
  if (validateStep(currentStep)) {
    currentStep += 1;
    updateStepperUI();
  }
});

backBtn.addEventListener("click", () => {
  currentStep -= 1;
  updateStepperUI();
});

/* --- Hardware Accelerated 3D Tilt Effect --- */

function setup3DTilt(element) {
  if (!element) return;
  
  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max rotation 1.2 degrees for ultra-subtle, high-fidelity tactile hover
    const rotateX = ((centerY - y) / centerY) * 1.2;
    const rotateY = ((x - centerX) / centerX) * 1.2;
    
    element.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    element.style.boxShadow = `
      0 26px 50px -10px rgba(15, 23, 42, 0.08), 
      inset 0 1px 0 rgba(255, 255, 255, 0.9), 
      0 3px 12px rgba(26, 86, 219, 0.02)
    `;
  });
  
  element.addEventListener("mouseleave", () => {
    element.style.transform = "rotateX(0deg) rotateY(0deg)";
    element.style.boxShadow = "";
  });
}

/* --- Sidebar drawer control --- */

function toggleDrawer(isOpen) {
  if (isOpen) {
    infoDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
  } else {
    infoDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
  }
}

infoDrawerBtn.addEventListener("click", () => toggleDrawer(true));
closeDrawerBtn.addEventListener("click", () => toggleDrawer(false));
drawerOverlay.addEventListener("click", () => toggleDrawer(false));

/* --- Payload Compilation & Analytics Parsing --- */

function getPayload() {
  const payload = {
    age: Number.parseFloat(ageSlider.value),
    gender: document.getElementById("gender").value,
    ethnicity: document.getElementById("ethnicity").value,
    jundice: document.getElementById("jundice").value,
    austim: document.getElementById("austim").value,
    contry_of_res: document.getElementById("contry_of_res").value.trim(),
    used_app_before: "no",
    relation: document.getElementById("relation").value,
  };

  for (let idx = 1; idx <= 10; idx += 1) {
    const radio = document.querySelector(`input[name="A${idx}_Score"]:checked`);
    payload[`A${idx}_Score`] = radio ? Number.parseInt(radio.value, 10) : 0;
  }

  return payload;
}

function getToneClass(riskLevel) {
  return `tone-${riskLevel.toLowerCase()}`;
}

function getFriendlyTitle(riskLevel) {
  if (riskLevel === "Low") return "Reassuring Telemetry";
  if (riskLevel === "Moderate") return "Moderate Trait Telemetry";
  return "High Clinical Trait Telemetry";
}

// Generate a beautiful narrative summary of the patient profile
function getNarrativeReport(payload, result, fuzzyDetails) {
  const genderLabel = payload.gender === "f" ? "female" : (payload.gender === "m" ? "male" : "individual");
  const autismHistory = payload.austim === "yes" ? "has a documented family history of Autism" : "does not report a family history of Autism";
  const jaundiceBirth = payload.jundice === "yes" ? "was born with Jaundice" : "was not born with Jaundice";
  
  let riskAdvice = "";
  if (result.risk_level === "Low") {
    riskAdvice = "The overall index is low and suggests typical social and behavioral developments. Continue standard healthcare monitoring.";
  } else if (result.risk_level === "Moderate") {
    riskAdvice = "A moderate index indicates mild spectrum traits. It is advised to review specific behavioral categories and consult a developmental practitioner if concerns persist.";
  } else {
    riskAdvice = "A high clinical index indicates significant social-communication and behavioral trait matching. A comprehensive psychiatric or clinical diagnostic assessment is strongly recommended.";
  }

  return `
    The patient is a <strong>${payload.age} year old ${genderLabel}</strong> who is reported by <strong>${payload.relation}</strong>. 
    During assessment, the patient scored <strong>${fuzzyDetails.symptom_sum || 0} out of 10</strong> on the diagnostic questionnaire. 
    The patient ${autismHistory} and ${jaundiceBirth}.
    <br><br>
    <strong>Clinical Guidance:</strong> ${riskAdvice}
  `;
}

// Generate the ONE AND ONLY unified 3D risk diagnostics card
function renderDiagnosticsReport(payload, data) {
  const result = data.result;
  const details = data.details;
  const fuzzyDetails = details.fuzzy_details || {};
  const toneClass = getToneClass(result.risk_level);
  
  // Calculate radial stroke offset (perimeter is 251.2)
  const strokeOffset = (251.2 - (result.probability * 251.2)).toFixed(2);
  const narrative = getNarrativeReport(payload, result, fuzzyDetails);

  return `
    <article class="telemetry-dashboard">
      <!-- Shaded Radial Risk Orb -->
      <section class="risk-index-section">
        <div class="radial-gauge-container ${toneClass}">
          <svg class="radial-svg" viewBox="0 0 100 100">
            <circle class="radial-track" cx="50" cy="50" r="40" />
            <circle class="radial-fill" cx="50" cy="50" r="40" style="stroke-dashoffset: ${strokeOffset};" />
          </svg>
          <div class="radial-orb-overlay">
            <span class="risk-pct-label">${(result.probability * 100).toFixed(0)}%</span>
            <span class="risk-pct-unit">RISK INDEX</span>
          </div>
        </div>
        
        <div class="risk-briefing">
          <div class="risk-kicker-row">
            <span class="risk-kicker">${getFriendlyTitle(result.risk_level)}</span>
            <span class="risk-badge ${toneClass}">${result.risk_level} Risk</span>
          </div>
          <h4 class="risk-headline">${result.headline}</h4>
        </div>
      </section>

      <!-- Beautiful Unified Narrative Summary -->
      <section class="clinical-report-card">
        <h4>Diagnostic Narrative & Metrics</h4>
        <p class="clinical-report-text">${narrative}</p>
      </section>

      <!-- Tiny Footnote Disclaimer (Replaces Bulky Disclaimer Panels) -->
      <footer class="telemetry-footnote">
        *This diagnosis is just based on machine learning techniques, please consult a qualified medical professional for an actual diagnosis.
      </footer>
    </article>
  `;
}

/* --- Stateful 3D Scan & API Compilation --- */

function runScannerSequence(payload, data, onComplete) {
  resultContainer.innerHTML = `
    <div class="telemetry-scanner">
      <div class="scanner-laser"></div>
      <div class="scanner-orb">
        <!-- Clean geometric scanning radar icon -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20M12 2a10 10 0 0110 10" />
        </svg>
      </div>
      <div class="scanner-text">
        <h3>Processing Patient Telemetry...</h3>
      </div>
      <div class="scan-log" id="scan-log-feed">
        <div class="scan-log-line blink" id="log-line-active"></div>
      </div>
    </div>
  `;
  
  const logFeed = document.getElementById("scan-log-feed");
  const activeLogLine = document.getElementById("log-line-active");

  const logLines = [
    `[0.0s] Booting clinical diagnostics...`,
    `[0.6s] Extracting demographic metrics (Age: ${payload.age})...`,
    `[1.2s] Parsing social & interaction features (A1-A5)...`,
    `[1.8s] Resolving repetitive behavior models (A6-A10)...`,
    `[2.4s] Packaging hybrid forest classifier telemetry...`,
    `[3.0s] Telemetry Sync Complete.`
  ];

  let currentLineIdx = 0;

  const writeLine = () => {
    if (currentLineIdx < logLines.length) {
      const newLine = document.createElement("div");
      newLine.className = "scan-log-line";
      newLine.innerHTML = logLines[currentLineIdx];
      
      // Move active blinking cursor line to bottom
      logFeed.insertBefore(newLine, activeLogLine);
      activeLogLine.innerHTML = `[${((currentLineIdx + 1) * 0.6).toFixed(1)}s] ...`;
      
      currentLineIdx += 1;
      setTimeout(writeLine, 500); // Pulse logs every 500ms
    } else {
      activeLogLine.remove();
      setTimeout(onComplete, 400); // Brief pause before loading unified card
    }
  };

  // Begin sequence
  writeLine();
}

async function runDiagnostics(event) {
  event.preventDefault();

  if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
    return;
  }
  
  // Validate that all questions are answered
  for (let idx = 1; idx <= 10; idx += 1) {
    const radio = document.querySelector(`input[name="A${idx}_Score"]:checked`);
    if (!radio) {
      alert("Please answer all questions before proceeding.");
      return;
    }
  }

  const payload = getPayload();

  submitButton.disabled = true;
  submitButton.textContent = "Compiling...";
  
  statusCard.textContent = "Connecting to Diagnostic Server...";
  statusCard.className = "status-card loading";
  statusCard.classList.remove("hidden");
  
  // Transition to scanning state
  formContainer.classList.remove("active");
  formContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  resultContainer.classList.add("active");

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Telemetry API error (Code: ${response.status})`);
    }

    const data = await response.json();
    statusCard.classList.add("hidden");

    // Run custom 3D scanning animation, then render unified result
    runScannerSequence(payload, data, () => {
      resultContainer.innerHTML = renderDiagnosticsReport(payload, data);
    });

  } catch (error) {
    statusCard.textContent = `Diagnostic fault: ${error.message}`;
    statusCard.className = "status-card error";
    statusCard.classList.remove("hidden");
    submitButton.disabled = false;
    submitButton.textContent = "Run Diagnostics";
    // Transition back to form on error
    resultContainer.classList.remove("active");
    resultContainer.classList.add("hidden");
    formContainer.classList.remove("hidden");
    formContainer.classList.add("active");
  } finally {
    // Re-enable button after processing finishes
    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Run Diagnostics";
    }, 3500);
  }
}

/* --- Initialization --- */

renderQuestionnaire();
setupSegmentControls();
updateStepperUI();

// Hook active forms and submit buttons
form.addEventListener("submit", runDiagnostics);

// Hook 3D interactive hardware tilt panels
setup3DTilt(unifiedCardPane);
