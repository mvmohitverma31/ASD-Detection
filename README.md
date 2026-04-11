# ASD Screening Intelligence Studio

This project compares three ASD screening approaches on the same questionnaire flow:

- `Baseline ML`: a conventional random-forest pipeline
- `Fuzzy Logic`: interpretable rule-based screening with soft memberships
- `Hybrid ML + Fuzzy`: a model that learns from both the original features and fuzzy-derived features

The app is built for screening support and experimentation. It is not a medical diagnostic tool.

## Project Structure

- [backend/main.py](D:/ASD-ML-predicictor/backend/main.py) exposes the FastAPI endpoints
- [frontend/index.html](D:/ASD-ML-predicictor/frontend/index.html) contains the browser UI
- [frontend/script.js](D:/ASD-ML-predicictor/frontend/script.js) sends requests and renders comparisons
- [model/train_model.py](D:/ASD-ML-predicictor/model/train_model.py) trains the baseline and hybrid models
- [model/fuzzy_logic.py](D:/ASD-ML-predicictor/model/fuzzy_logic.py) implements the fuzzy inference system
- [model/hybrid_features.py](D:/ASD-ML-predicictor/model/hybrid_features.py) creates fuzzy features for the hybrid model

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Retrain the bundle if needed:

```powershell
python -m model.train_model
```

4. Start the API from the project root:

```powershell
uvicorn backend.main:app --reload
```

5. Open [frontend/index.html](D:/ASD-ML-predicictor/frontend/index.html) in a browser.

## API

- `GET /` returns a short service description
- `GET /health` returns model metadata and training metrics
- `POST /predict` returns baseline, fuzzy, and hybrid outputs for one screening payload

## Notes

- The hybrid model currently scores extremely well on the available dataset. Treat that as promising but not final proof; it should be validated with stricter cross-validation and external data before making strong claims.
- The feature names keep the original dataset spellings such as `jundice` and `contry_of_res` so training and inference stay aligned.
