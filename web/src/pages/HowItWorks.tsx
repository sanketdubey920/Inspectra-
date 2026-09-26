import React from 'react';
import { 
  Database, 
  Cpu, 
  AlertTriangle, 
  Calculator, 
  Send, 
  MapPin, 
  ListChecks, 
  Camera, 
  FileCheck, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Continuous Data Ingestion',
      icon: Database,
      desc: 'Institutes submit daily attendance and compliance reports; authorized CCTV streams feed telemetry; beneficiaries submit public grievances.',
    },
    {
      num: '02',
      title: 'Multi-Signal AI Anomaly Detection',
      icon: Cpu,
      desc: 'Scikit-learn Isolation Forest algorithm checks operational signals against historical baselines to detect statistical deviations without making premature conclusions.',
    },
    {
      num: '03',
      title: 'Explainable Risk Engine Calculation',
      icon: Calculator,
      desc: 'Inputs are weighted into a 0–100 risk score (Low, Medium, High, Critical). Every point is transparently attributed to specific operational reasons.',
    },
    {
      num: '04',
      title: 'Surprise Inspection Prioritization',
      icon: AlertTriangle,
      desc: 'High & Critical risk institutes are flagged on the national dashboard. Officials review the explainable factors and assign PMU field inspection teams.',
    },
    {
      num: '05',
      title: 'Mobile GPS Verification on Arrival',
      icon: MapPin,
      desc: 'Inspector reaches the physical premise. The mobile inspection workspace queries GPS coordinates and verifies location within allowable 500m radius.',
    },
    {
      num: '06',
      title: 'Targeted Dynamic Inspection Checklist',
      icon: ListChecks,
      desc: 'Backend generates tailored checklist items focused on the detected anomalies (e.g. attendance register audit, random beneficiary headcount, room inspection).',
    },
    {
      num: '07',
      title: 'Geo-Tagged Evidence Collection',
      icon: Camera,
      desc: 'Inspector captures photos, videos, and documents. System stamps coordinates, timestamp, and officer ID directly into the evidence repository.',
    },
    {
      num: '08',
      title: 'Digital Inspection Report Submission',
      icon: FileCheck,
      desc: 'Inspector compiles on-ground findings and submits report with compliance rating (Compliant, Partially Compliant, Non-Compliant).',
    },
    {
      num: '09',
      title: 'Official Review & Corrective Action',
      icon: CheckCircle2,
      desc: 'Department official evaluates the geo-tagged evidence and issues a time-bound corrective action directive to the institute representative.',
    },
    {
      num: '10',
      title: 'Resolution Verification & Risk Recalculation',
      icon: RefreshCw,
      desc: 'Institute uploads resolution proof. Once approved by the official, the risk score is automatically recalculated (e.g., 82 → 45) closing the monitoring loop.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          Architecture & Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
          The INSPECTRA Closed-Loop System
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          From operational signal monitoring to verified remediation — a complete journey ensuring accountable governance.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((st, i) => {
          const Icon = st.icon;
          return (
            <div
              key={i}
              className="gov-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 font-mono font-bold text-base">
                {st.num}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {st.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
