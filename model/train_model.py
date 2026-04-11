from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from model.hybrid_features import FuzzyFeatureTransformer


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "asd.csv"
MODEL_PATH = BASE_DIR / "model" / "model_bundle.pkl"

TARGET_COLUMN = "Class_ASD"
NUMERIC_COLUMNS = [
    "A1_Score",
    "A2_Score",
    "A3_Score",
    "A4_Score",
    "A5_Score",
    "A6_Score",
    "A7_Score",
    "A8_Score",
    "A9_Score",
    "A10_Score",
    "age",
]
CATEGORICAL_COLUMNS = [
    "gender",
    "ethnicity",
    "jundice",
    "austim",
    "contry_of_res",
    "used_app_before",
    "relation",
]
FEATURE_COLUMNS = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS


def load_dataset() -> pd.DataFrame:
    frame = pd.read_csv(DATA_PATH)
    frame.columns = frame.columns.str.replace("/", "_", regex=False)
    frame.replace("?", np.nan, inplace=True)

    for column in ["age_desc", "result"]:
        if column in frame.columns:
            frame.drop(columns=column, inplace=True)

    frame[TARGET_COLUMN] = frame[TARGET_COLUMN].map({"NO": 0, "YES": 1})
    return frame


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline([("imputer", SimpleImputer(strategy="median"))]),
                NUMERIC_COLUMNS,
            ),
            (
                "categorical",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )


def build_baseline_pipeline() -> Pipeline:
    return Pipeline(
        [
            ("preprocessor", build_preprocessor()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=400,
                    max_depth=16,
                    min_samples_leaf=2,
                    random_state=42,
                ),
            ),
        ]
    )


def build_hybrid_pipeline() -> Pipeline:
    return Pipeline(
        [
            (
                "feature_union",
                ColumnTransformer(
                    transformers=[
                        ("core", build_preprocessor(), FEATURE_COLUMNS),
                        ("fuzzy", FuzzyFeatureTransformer(), FEATURE_COLUMNS),
                    ]
                ),
            ),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=500,
                    max_depth=18,
                    min_samples_leaf=2,
                    random_state=42,
                ),
            ),
        ]
    )


def evaluate_model(name: str, model: Pipeline, X_train, X_test, y_train, y_test) -> dict[str, object]:
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, predictions)

    print(f"\n{name} accuracy: {accuracy:.4f}")
    print(f"\n{name} classification report:\n")
    print(classification_report(y_test, predictions))

    return {
        "name": name,
        "accuracy": accuracy,
        "mean_probability": float(np.mean(probabilities)),
    }


def main() -> None:
    frame = load_dataset()
    X = frame[FEATURE_COLUMNS]
    y = frame[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    baseline_model = build_baseline_pipeline()
    hybrid_model = build_hybrid_pipeline()

    baseline_metrics = evaluate_model("Baseline ML", baseline_model, X_train, X_test, y_train, y_test)
    hybrid_metrics = evaluate_model("Hybrid ML + Fuzzy", hybrid_model, X_train, X_test, y_train, y_test)

    bundle = {
        "baseline_model": baseline_model,
        "hybrid_model": hybrid_model,
        "metadata": {
            "feature_columns": FEATURE_COLUMNS,
            "numeric_columns": NUMERIC_COLUMNS,
            "categorical_columns": CATEGORICAL_COLUMNS,
            "metrics": {
                "baseline": baseline_metrics,
                "hybrid": hybrid_metrics,
            },
        },
    }

    joblib.dump(bundle, MODEL_PATH)

    print("\nTraining features:\n")
    print(FEATURE_COLUMNS)
    print(f"\nModel bundle saved successfully at {MODEL_PATH}")


if __name__ == "__main__":
    main()
