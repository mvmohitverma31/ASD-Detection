from __future__ import annotations

from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from model.fuzzy_logic import infer_fuzzy_risk


BASE_DIR = Path(__file__).resolve().parents[1]
BUNDLE_PATH = BASE_DIR / "model" / "model_bundle.pkl"
FRONTEND_DIR = BASE_DIR / "frontend"
BUNDLE = joblib.load(BUNDLE_PATH)
BASELINE_MODEL = BUNDLE["baseline_model"]
HYBRID_MODEL = BUNDLE["hybrid_model"]
METADATA = BUNDLE["metadata"]
FEATURE_COLUMNS = METADATA["feature_columns"]


class ScreeningRequest(BaseModel):
    A1_Score: int = Field(ge=0, le=1)
    A2_Score: int = Field(ge=0, le=1)
    A3_Score: int = Field(ge=0, le=1)
    A4_Score: int = Field(ge=0, le=1)
    A5_Score: int = Field(ge=0, le=1)
    A6_Score: int = Field(ge=0, le=1)
    A7_Score: int = Field(ge=0, le=1)
    A8_Score: int = Field(ge=0, le=1)
    A9_Score: int = Field(ge=0, le=1)
    A10_Score: int = Field(ge=0, le=1)
    age: float = Field(gt=0, le=120)
    gender: Literal["f", "m", "other"]
    ethnicity: str = Field(min_length=1, max_length=100)
    jundice: Literal["no", "yes"]
    austim: Literal["no", "yes"]
    contry_of_res: str = Field(min_length=1, max_length=100)
    used_app_before: Literal["no", "yes"] = "no"
    relation: Literal["Self", "Parent", "Health care professional", "Relative", "Others"]


app = FastAPI(
    title="ASD Screening API",
    description="ASD screening assessment API.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


def build_feature_frame(payload: ScreeningRequest) -> pd.DataFrame:
    row = payload.model_dump()
    if row["gender"] == "other":
        row["gender"] = "f"
    return pd.DataFrame([[row[column] for column in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)


def to_label(probability: float) -> str:
    return "ASD Risk Detected" if probability >= 0.5 else "No ASD Risk"


def get_risk_level(probability: float) -> str:
    if probability < 0.30:
        return "Low"
    if probability < 0.70:
        return "Moderate"
    return "High"


def get_guidance(risk_level: str) -> str:
    if risk_level == "Low":
        return "The responses suggest a lower level of ASD-related concern."
    if risk_level == "Moderate":
        return "The responses suggest some ASD-related traits may be present."
    return "The responses suggest a higher level of ASD-related concern."


@app.get("/")
def home() -> dict[str, object]:
    return RedirectResponse(url="/app/")


@app.get("/api")
def api_info() -> dict[str, object]:
    return {
        "message": "ASD Screening API running",
        "approaches": ["baseline_ml", "fuzzy_logic", "hybrid_ml_fuzzy"],
    }


@app.get("/favicon.ico")
def favicon() -> Response:
    return Response(status_code=204)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "bundle_path": str(BUNDLE_PATH),
        "feature_count": len(FEATURE_COLUMNS),
        "metrics": METADATA["metrics"],
    }


@app.post("/predict")
def predict(payload: ScreeningRequest) -> dict[str, object]:
    record = payload.model_dump()
    features = build_feature_frame(payload)
    fuzzy_result = infer_fuzzy_risk(record)
    baseline_probability = float(BASELINE_MODEL.predict_proba(features)[0][1])
    hybrid_probability = float(HYBRID_MODEL.predict_proba(features)[0][1])
    screening_score = int(sum(record[f"A{i}_Score"] for i in range(1, 11)))
    combined_probability = (
        (baseline_probability * 0.25)
        + (fuzzy_result.score * 0.20)
        + (hybrid_probability * 0.55)
    )
    combined_risk = get_risk_level(combined_probability)

    return {
        "input_summary": {
            "screening_score": screening_score,
            "age": record["age"],
            "family_history": record["austim"],
        },
        "result": {
            "prediction": to_label(combined_probability),
            "probability": combined_probability,
            "risk_level": combined_risk,
            "headline": get_guidance(combined_risk),
            "summary": "",
        },
        "details": {
            "baseline_probability": baseline_probability,
            "fuzzy_probability": fuzzy_result.score,
            "hybrid_probability": hybrid_probability,
            "fuzzy_details": fuzzy_result.summary,
        },
    }
