# ASD Screening Intelligence Studio

A robust, experimental engineering platform designed for autism spectrum disorder (ASD) risk screening using advanced machine learning architectures and fuzzy logic inference.

This project was built as an engineering case study to explore how traditional machine learning (Random Forest) can be augmented with expert systems (Fuzzy Logic) to produce a highly accurate, interpretable **Hybrid ML** model. The application features a high-fidelity, 3D unified clinical UI designed to process and present telemetry clearly.

> **Note for Evaluators:** This software is a proof-of-concept engineering research project. It is **not** an FDA-approved medical diagnostic tool and should not be used for actual clinical diagnosis.

---

## 🚀 Engineering Features & Architecture

### 1. The Machine Learning Engine (Backend)
- **Baseline Model:** A conventional Random Forest Classifier trained on clinical screening data.
- **Fuzzy Inference System:** A rule-based logic system evaluating continuous degrees of membership for social and behavioral traits rather than rigid binary splits.
- **Hybrid Model (The Core Engine):** A state-of-the-art classifier that combines original dataset features with the generated fuzzy scores (e.g., `fuzzy_symptom`, `fuzzy_social`) to dramatically boost accuracy and model interpretability.

### 2. The 3D UI/UX (Frontend)
- **Unified Diagnostic Console:** A seamless, single-flow user experience built with HTML, CSS, and Vanilla JS.
- **State Machine UI:** Transitions smoothly from a stepped clinical wizard into a dynamic, hardware-accelerated 3D scanning animation, culminating in a single unified "ASD Risk Index."
- **Premium Aesthetics:** Zero-scroll design, clinical glassmorphic teals/cyans, and interactive 3D card tilts using CSS perspective and Javascript mouse-tracking.

---

## 📂 Project Structure

```text
ASD-Detection/
├── backend/
│   └── main.py              # FastAPI server & inference endpoints
├── frontend/
│   ├── index.html           # Unified 3D Workspace UI
│   ├── style.css            # Hardware-accelerated CSS & Theme
│   └── script.js            # State machine & API integration
├── model/
│   ├── train_model.py       # ML Pipeline for training Baseline & Hybrid models
│   ├── fuzzy_logic.py       # Fuzzy logic rule sets and membership functions
│   └── hybrid_features.py   # Feature engineering bridge for the hybrid model
├── requirements.txt         # Python dependencies
└── README.md
```

---

## 🛠️ Setup & Deployment

### 1. Environment Setup
Clone the repository and install the required dependencies using a virtual environment.

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On Unix/MacOS

# Install dependencies
pip install -r requirements.txt
```

### 2. Model Training (Optional)
If you need to retrain the Random Forest and Hybrid models from the dataset:

```bash
python -m model.train_model
```
*Note: The system preserves original dataset spelling idiosyncrasies (e.g., `jundice`, `contry_of_res`) to ensure alignment between training features and inference.*

### 3. Running the Application
Start the FastAPI server (which also serves the static frontend UI):

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Access the application in your browser at: **`http://127.0.0.1:8000/app/`** (or just load `/frontend/index.html` directly).

---

## 📡 API Reference

- **`GET /health`**
  Returns model metadata, accuracy metrics, and system status.
- **`POST /predict`**
  Accepts a JSON payload containing the 10-question screening responses and biometric data, returning the unified risk analysis (using the hybrid model's prediction).

---

## 🔍 Future Optimizations
- **Data Expansion:** Implement stricter cross-validation with external clinical datasets.
- **Explainable AI (XAI):** Integrate SHAP values into the final 3D UI to show the user exactly *why* the hybrid model made its prediction.
