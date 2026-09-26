import numpy as np
from sklearn.ensemble import IsolationForest
from backend.database import db
from backend.models.anomaly import Anomaly
from backend.models.institute import Institute

class AnomalyDetector:
    """
    Scikit-learn Isolation Forest Anomaly Detection Service.
    Transforms operational signals (attendance delta, complaints, compliance lag, CCTV activity delta)
    into multidimensional feature vectors to detect outlier patterns.
    """

    def __init__(self, contamination=0.15, random_state=42):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=random_state,
            n_estimators=100
        )
        self._is_trained = False

    def extract_features(self, institute: Institute) -> list:
        attendance_dev = abs(institute.reported_attendance - institute.historical_attendance)
        complaints = institute.complaints_count
        pending_comp = institute.pending_compliance_count
        
        # Calculate average CCTV activity
        cctv_cams = institute.cctv_cameras
        avg_cctv_activity = sum(c.activity_level for c in cctv_cams) / len(cctv_cams) if cctv_cams else 70.0
        
        # Activity-attendance mismatch: high attendance reported but low CCTV activity
        activity_gap = max(0.0, institute.reported_attendance - avg_cctv_activity)
        
        return [
            attendance_dev,
            float(complaints),
            float(pending_comp),
            avg_cctv_activity,
            activity_gap
        ]

    def train_baseline(self, feature_matrix: np.ndarray):
        if len(feature_matrix) >= 5:
            self.model.fit(feature_matrix)
            self._is_trained = True

    def evaluate_institute(self, institute: Institute) -> dict:
        features = self.extract_features(institute)
        X = np.array([features])
        
        # If not enough instances for full fit, use calibrated heuristics aligned with isolation criteria
        if not self._is_trained:
            # Calibrated baseline training data simulating 30 standard institutes
            rng = np.random.RandomState(42)
            normal_data = np.column_stack([
                rng.normal(loc=3.0, scale=2.0, size=30).clip(0, 15),     # attendance dev
                rng.poisson(lam=0.5, size=30),                           # complaints
                rng.poisson(lam=0.3, size=30),                           # pending compliance
                rng.normal(loc=75.0, scale=8.0, size=30).clip(50, 100),  # CCTV activity
                rng.normal(loc=5.0, scale=4.0, size=30).clip(0, 20),     # activity gap
            ])
            self.train_baseline(normal_data)

        # Predict (-1: anomaly, 1: normal)
        prediction = self.model.predict(X)[0]
        anomaly_score = float(self.model.decision_function(X)[0])
        is_anomaly = (prediction == -1)

        result = {
            "is_anomaly": is_anomaly,
            "decision_score": anomaly_score,
            "features": {
                "attendance_deviation": features[0],
                "complaints": features[1],
                "pending_compliance": features[2],
                "cctv_activity": features[3],
                "activity_gap": features[4]
            },
            "disclaimer": "AI detection is decision-support indicator only. It does NOT establish guilt or fraud."
        }
        return result
