from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

from model.fuzzy_logic import compute_fuzzy_memberships


class FuzzyFeatureTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        frame = pd.DataFrame(X).copy()
        fuzzy_rows = []
        for _, row in frame.iterrows():
            memberships = compute_fuzzy_memberships(row.to_dict())
            fuzzy_rows.append(
                {
                    "fuzzy_symptom_sum": memberships["symptom_sum"],
                    "fuzzy_social_sum": memberships["social_sum"],
                    "fuzzy_behavior_sum": memberships["behavior_sum"],
                    "fuzzy_symptom_low": memberships["symptom_low"],
                    "fuzzy_symptom_medium": memberships["symptom_medium"],
                    "fuzzy_symptom_high": memberships["symptom_high"],
                    "fuzzy_social_high": memberships["social_high"],
                    "fuzzy_behavior_high": memberships["behavior_high"],
                    "fuzzy_background_support": memberships["background_support"],
                }
            )
        return pd.DataFrame(fuzzy_rows)

    def get_feature_names_out(self, input_features=None):
        return np.array(
            [
                "fuzzy_symptom_sum",
                "fuzzy_social_sum",
                "fuzzy_behavior_sum",
                "fuzzy_symptom_low",
                "fuzzy_symptom_medium",
                "fuzzy_symptom_high",
                "fuzzy_social_high",
                "fuzzy_behavior_high",
                "fuzzy_background_support",
            ]
        )
