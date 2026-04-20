"""
Isolation Forest anomaly detection for WSN sensor data.
"""
import os
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest
from django.conf import settings

MODEL_PATH = Path(settings.MODEL_DIR) / 'isolation_forest.joblib'

_model = None
_is_trained = False

def _ensure_model_dir():
    """Create model directory if it doesn't exist."""
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

def load_model():
    """Load a previously trained model from disk."""
    global _model, _is_trained
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        _is_trained = True
        print(f"[ML] Loaded trained model from {MODEL_PATH}")
        return True
    return False

def train_model(readings_queryset=None):
    """
    Train the Isolation Forest model on existing sensor readings.
    If no queryset is provided, fetches all readings from the database.
    Returns True if training succeeded.
    """
    global _model, _is_trained

    if readings_queryset is None:
        from .models import SensorReading
        readings_queryset = SensorReading.objects.all()

    count = readings_queryset.count()
    if count < 50:
        print(f"[ML] Not enough data to train ({count}/50 readings). Skipping.")
        return False

    data = np.array([
        [r.temperature, r.humidity, r.gas]
        for r in readings_queryset.iterator()
    ])

    print(f"[ML] Training Isolation Forest on {len(data)} readings...")

    _model = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42,
        n_jobs=-1,
    )
    _model.fit(data)
    _is_trained = True

    _ensure_model_dir()
    joblib.dump(_model, MODEL_PATH)
    print(f"[ML] Model trained and saved to {MODEL_PATH}")
    return True

def predict(temperature, humidity, gas):
    """
    Predict whether a reading is normal or anomaly.
    Returns 'normal' or 'anomaly'.
    If model is not trained, returns 'normal' (safe default).
    """
    global _model, _is_trained

    if not _is_trained:

        if not load_model():
            return 'normal'

    sample = np.array([[temperature, humidity, gas]])
    prediction = _model.predict(sample)

    return 'anomaly' if prediction[0] == -1 else 'normal'

def is_trained():
    """Check if the model is ready for predictions."""
    global _is_trained
    if not _is_trained:
        load_model()
    return _is_trained

def get_model_info():
    """Return model status information."""
    return {
        'algorithm': 'Isolation Forest',
        'is_trained': is_trained(),
        'contamination': 0.08,
        'features': ['temperature', 'humidity', 'gas'],
        'model_path': str(MODEL_PATH),
        'model_exists': MODEL_PATH.exists(),
    }
