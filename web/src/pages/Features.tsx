import React from 'react';
import { 
  Activity, 
  MapPin, 
  Video, 
  CheckSquare, 
  FileSpreadsheet, 
  ShieldCheck, 
  Camera, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Discrepancy Matrix (0–100)',
      desc: 'Transparent multi-factor scoring evaluating attendance delta, grievances, compliance lag, and presence telemetry.',
    },
    {
      icon: MapPin,
      title: 'GPS Geofence Verification',
      desc: 'Haversine distance formula validates field inspector coordinates within 500m of institutional boundaries.',
    },
    {
      icon: Video,
      title: 'CCTV Telemetry Layer',
      desc: 'RTSP/ONVIF integration framework with automated optical motion and occupancy estimation telemetry.',
    },
    {
      icon: CheckSquare,
      title: 'Targeted Dynamic Checklists',
      desc: 'No generic inspection forms. If an attendance anomaly is flagged, the mobile checklist dynamically prioritizes physical register audits and random beneficiary headcounts.',
    },
    {
      icon: Camera,
      title: 'Geo-Tagged Evidence Repository',
      desc: 'On-site photos, video clips, and documents are securely uploaded with embedded GPS metadata, inspector ID, and cryptographic timestamping.',
    },
    {
      icon: Clock,
      title: 'Closed-Loop Corrective Actions',
      desc: 'Department officials assign time-bound remediation tasks. Upon official verification of resolution, the institute risk score is dynamically recalculated.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Automated Digital Reports',
      desc: 'Generate comprehensive inspection dossiers and export multi-dimensional state, district, and scheme-wise analytics in CSV/PDF formats.',
    },
    {
      icon: ShieldCheck,
      title: 'Tamper-Evident Audit Trails',
      desc: 'Every critical system event (login, inspection assignment, GPS verification, evidence upload, risk recalculation) is permanently logged with IP and user metadata.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
          Engineered for Rigorous Monitoring
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          A modern government-grade solution designed to safeguard public welfare funds and maximize institutional compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="gov-card p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-900">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
