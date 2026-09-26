# INSPECTRA
### Integrated Risk-Based Monitoring & Inspection Platform
*Smart Real-Time Monitoring, Risk-Based Inspection, CCTV Integration and Evidence-Driven Compliance Management for DoSJE-Supported Institutions*

---

## 1. Executive Summary & Core Principle

**INSPECTRA** transforms conventional periodic inspection into a **continuous, risk-based monitoring workflow** for institutions, projects, and NGOs supported under schemes of the **Department of Social Justice and Empowerment (DoSJE)**, Government of India.

> **Central Product Statement:**  
> *"Don't wait for the next annual inspection to discover a problem. Use available operational signals to identify where human verification is most needed."*

### Core Architectural Loop:
$$\text{MONITOR} \longrightarrow \text{ANALYSE} \longrightarrow \text{DETECT ANOMALY} \longrightarrow \text{CALCULATE RISK} \longrightarrow \text{PRIORITIZE INSPECTION} \longrightarrow \text{GPS VERIFY} \longrightarrow \text{TARGETED CHECKLIST} \longrightarrow \text{GEO-TAGGED EVIDENCE} \longrightarrow \text{DIGITAL REPORT} \longrightarrow \text{OFFICIAL REVIEW} \longrightarrow \text{CORRECTIVE ACTION} \longrightarrow \text{INSTITUTE RESPONSE} \longrightarrow \text{VERIFICATION} \longrightarrow \text{RISK RECALCULATION} \longrightarrow \text{CONTINUOUS MONITORING}$$

### Important Governance Principle:
> [!IMPORTANT]
> **AI is Decision Support — Human Officers are the Final Decision Makers.**  
> The system strictly distinguishes **"Anomaly Detected"** from **"Fraud Proven"**. AI models identify unusual statistical patterns; authorized human officers perform on-site verification and issue directives.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Web Frontend** | React.js 18 + TypeScript + Vite | Responsive, government-grade dashboard & maps |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Accessible WCAG contrast, English/Hindi toggle, dark mode |
| **Data Visualization** | Recharts | Risk distribution, attendance delta & state statistics |
| **Mapping Engine** | Interactive Geo Engine + Google Maps API | Color-coded risk markers (Low, Med, High, Critical) |
| **Backend Framework**| Python 3.13 + Flask REST API | Clean architecture, modular Blueprints, token auth |
| **Database** | PostgreSQL / SQLite + SQLAlchemy ORM | Relational schema with 16+ tables, foreign keys & indexes |
| **Machine Learning** | Scikit-learn (Isolation Forest) | Multi-signal operational anomaly detection |
| **Computer Vision** | OpenCV (`cv2`) | CCTV frame generation, HUD watermarking & motion index |
| **Mobile App** | React Native + TypeScript + Expo | Dedicated field inspection, GPS radar & camera evidence |
| **Testing** | Pytest (Backend) + TypeScript build | 100% automated test coverage of critical flows |

---

## 3. Demo Credentials

All demo accounts are pre-seeded in the database with the secure password: `Inspectra@2025`

| Role | Email | Password | Primary Functions |
| :--- | :--- | :--- | :--- |
| **Department Official** | `official@inspectra.demo` | `Inspectra@2025` | National Dashboard, Map, Prioritize Inspections, Review Reports, Issue Corrective Actions, Recalculate Risk |
| **PMU Inspection Officer** | `inspector@inspectra.demo` | `Inspectra@2025` | Field App, GPS Verification, Targeted Checklist, Geo-Tagged Evidence Capture, Submit Report |
| **Institute Representative** | `institute@inspectra.demo` | `Inspectra@2025` | ABC Bhopal Centre Profile, Daily Attendance Filing, Submit Corrective Action Proof |
| **Citizen / Beneficiary** | `beneficiary@inspectra.demo` | `Inspectra@2025` | Public Grievance Submission & Real-time Tracking Code |

---

## 4. End-to-End SIH Demonstration Story (20 Steps)

The entire platform supports this uninterrupted closed-loop demonstration:

1. **Department Official Logs In** (`official@inspectra.demo`).
2. **Dashboard Overview**: Displays KPI cards (1,284 Institutes, 47 High Risk, 31 Pending Inspections) and Recharts trend graphs.
3. **Open India Monitoring Map**: View state-level clusters. Filter by *State: Madhya Pradesh* or *Risk: High Risk*.
4. **Select Bhopal**: Marker highlights **ABC Residential Centre — Bhopal**.
5. **Click "View Institute"**: Complete 360° institutional dossier opens.
6. **Inspect Risk Dossier**: Score displays **82/100 (HIGH)** with transparent factor breakdown:
   - *Attendance Deviation (+18%)*: 20 pts
   - *Regulatory Compliance (Unresolved)*: 18 pts
   - *Beneficiary Grievances (3 Active)*: 15 pts
   - *Previous Inspection Deficiencies*: 12 pts
   - *Reporting Latency*: 9 pts
   - *CCTV Telemetry Anomaly*: 8 pts
7. **Open CCTV Monitoring Grid**: Observe live simulated streams for *Reception*, *Office*, *Classroom 1*, *Classroom 2 (Unusual Inactivity Flag)*, and *Hostel*.
8. **Click "RECOMMEND SURPRISE INSPECTION"**: Confirmation modal opens with pre-populated risk context.
9. **Assign PMU Team**: Select *Officer Rajesh Kumar (PMU Team 04)*, set priority to *HIGH*, and dispatch.
10. **Inspector Receives Alert**: In-app alert notifies the officer.
11. **Inspector Logs In**: Switch to Mobile App or `/inspector/inspections` in browser.
12. **Start Inspection**: Click *Start Inspection* upon reaching premise.
13. **GPS Verification**: Hardware coordinates match premise within 24.5m $\le$ 500m threshold $\longrightarrow$ **LOCATION VERIFIED**.
14. **Dynamic Targeted Checklist Unlocked**:
    - *Attendance Verification*: Physical register audit, beneficiary headcount.
    - *Staff Verification*: On-duty roster check.
    - *Infrastructure*: Classroom 2 and hostel sanitation check.
15. **Geo-Tagged Evidence Captured**: Photo captured and cryptographically stamped with GPS coordinates `[23.2601, 77.4124]` and timestamp.
16. **Submit Digital Report**: Inspector enters verified attendance (68% vs 94% reported) and marks **PARTIALLY COMPLIANT**.
17. **Department Official Reviews Report**: Opens `/official/inspections/1`, verifies GPS authenticity, and reviews evidence gallery.
18. **Issue Corrective Action**: Official mandates submission of audited biometric logs and attendance registers within 15 days.
19. **Institute Submits Proof**: Institute representative uploads external magistrate affidavit and biometric reconciliation proof.
20. **Official Verifies Resolution & Risk Recalculates**: Official marks action **RESOLVED** $\longrightarrow$ **Risk drops dynamically from 82 to 45 (HIGH $\rightarrow$ MEDIUM)**! Closed loop completed.

---

## 5. Local Setup & Quick Start

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & **npm**

### Option A: One-Click Launch (Windows)
Double-click `run_all.bat` in the project root. This automatically starts both the Flask API backend (port 5000) and the Vite web frontend (port 5173).

### Option B: Manual Terminal Launch

#### Step 1: Start Flask Backend
```bash
cd backend
# Virtual environment is already created
venv\Scripts\activate
# If running fresh:
pip install -r requirements.txt
python -m backend.seed_data
python -m backend.app
```
*Backend runs on `http://localhost:5000`*

#### Step 2: Run Backend Tests
```bash
python -m pytest backend\tests
```

#### Step 3: Start Web Frontend
```bash
cd web
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

#### Step 4: Start Mobile App (Optional Expo)
```bash
cd mobile
npm start
```

---

## 6. Judge & Evaluator FAQ

### Q1: How is CCTV integrated?
> **Answer:** INSPECTRA does not replace existing camera hardware across India. Where an institute has an authorized CCTV/DVR/NVR system, the platform integrates with its supported video interface (RTSP, ONVIF, or vendor API). The Flask backend processes selected frames through OpenCV to compute optical activity and occupancy signals as one input among six in the risk engine. In prototype mode, simulated feeds demonstrate the exact telemetry without requiring real institutional access.

### Q2: Are you streaming CCTV centrally from every institute in India?
> **Answer:** No. INSPECTRA does not centrally stream or store continuous video, which would be impractical and violate privacy-by-design principles. CCTV is treated as an operational signal where local NVRs or lightweight edge agents periodically compute occupancy metrics.

### Q3: Does AI detect fraud or misconduct?
> **Answer:** No. AI never declares fraud or wrongdoing. It detects operational deviations from historical baselines (e.g. reporting 94% attendance when activity levels are dormant). Human authorized inspection officers always perform on-ground verification.

### Q4: Why React + TypeScript?
> **Answer:** React provides component-based reusability across dashboards, maps, and role-based views. Strict TypeScript guarantees robust data contracts between the Flask backend APIs and frontend visualizations.

### Q5: Why Flask + SQL?
> **Answer:** Flask is lightweight, Python-native, and integrates seamlessly with Scikit-learn (Isolation Forest) and OpenCV (`cv2`). SQL relational database schema guarantees referential integrity between inspections, evidence, and corrective actions.
