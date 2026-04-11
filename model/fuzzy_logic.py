from __future__ import annotations

from dataclasses import dataclass


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def triangular(value: float, left: float, peak: float, right: float) -> float:
    if value <= left or value >= right:
        return 0.0
    if value == peak:
        return 1.0
    if value < peak:
        return (value - left) / (peak - left)
    return (right - value) / (right - peak)


def trapezoidal(value: float, left: float, left_top: float, right_top: float, right: float) -> float:
    if value <= left or value >= right:
        return 0.0
    if left_top <= value <= right_top:
        return 1.0
    if value < left_top:
        return (value - left) / (left_top - left)
    return (right - value) / (right - right_top)


@dataclass
class FuzzyResult:
    score: float
    risk_level: str
    summary: dict[str, float]


def compute_fuzzy_memberships(record: dict[str, object]) -> dict[str, float]:
    symptom_sum = float(sum(float(record[f"A{i}_Score"]) for i in range(1, 11)))
    social_sum = float(sum(float(record[f"A{i}_Score"]) for i in range(1, 6)))
    behavior_sum = float(sum(float(record[f"A{i}_Score"]) for i in range(6, 11)))
    age = float(record["age"])
    family_history = 1.0 if str(record["austim"]).lower() == "yes" else 0.0
    jaundice = 1.0 if str(record["jundice"]).lower() == "yes" else 0.0

    symptom_low = trapezoidal(symptom_sum, 0.0, 0.0, 2.0, 4.5)
    symptom_medium = triangular(symptom_sum, 2.5, 5.0, 7.5)
    symptom_high = trapezoidal(symptom_sum, 5.5, 7.5, 10.0, 10.5)

    social_low = trapezoidal(social_sum, 0.0, 0.0, 1.0, 2.5)
    social_high = trapezoidal(social_sum, 2.0, 3.5, 5.0, 5.5)

    behavior_low = trapezoidal(behavior_sum, 0.0, 0.0, 1.0, 2.5)
    behavior_high = trapezoidal(behavior_sum, 2.0, 3.5, 5.0, 5.5)

    age_young = trapezoidal(age, 0.0, 0.0, 18.0, 30.0)
    age_adult = trapezoidal(age, 20.0, 30.0, 60.0, 90.0)

    background_support = clamp(max(family_history, jaundice))

    return {
        "symptom_sum": symptom_sum,
        "social_sum": social_sum,
        "behavior_sum": behavior_sum,
        "symptom_low": symptom_low,
        "symptom_medium": symptom_medium,
        "symptom_high": symptom_high,
        "social_low": social_low,
        "social_high": social_high,
        "behavior_low": behavior_low,
        "behavior_high": behavior_high,
        "age_young": age_young,
        "age_adult": age_adult,
        "background_support": background_support,
    }


def infer_fuzzy_risk(record: dict[str, object]) -> FuzzyResult:
    features = compute_fuzzy_memberships(record)

    low_rule = max(
        min(features["symptom_low"], features["social_low"], features["behavior_low"]),
        min(features["symptom_low"], 1.0 - features["background_support"]),
    )
    moderate_rule = max(
        min(features["symptom_medium"], features["social_high"]),
        min(features["symptom_medium"], features["behavior_high"]),
        min(features["symptom_medium"], features["background_support"]),
    )
    high_rule = max(
        min(features["symptom_high"], features["social_high"]),
        min(features["symptom_high"], features["behavior_high"]),
        min(features["symptom_high"], features["background_support"]),
        min(features["symptom_medium"], features["social_high"], features["behavior_high"]),
    )

    numerator = (low_rule * 0.2) + (moderate_rule * 0.55) + (high_rule * 0.9)
    denominator = low_rule + moderate_rule + high_rule
    score = numerator / denominator if denominator else 0.0

    if score < 0.30:
        risk_level = "Low"
    elif score < 0.70:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    return FuzzyResult(
        score=clamp(score),
        risk_level=risk_level,
        summary={
            "symptom_sum": features["symptom_sum"],
            "social_sum": features["social_sum"],
            "behavior_sum": features["behavior_sum"],
            "background_support": features["background_support"],
            "high_rule": high_rule,
            "moderate_rule": moderate_rule,
            "low_rule": low_rule,
        },
    )
