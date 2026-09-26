import React from 'react';
import { Shield, Target, Users, CheckCircle2, Lock, FileCheck } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          Institutional Framework
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
          About INSPECTRA
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
          INSPECTRA is a centralized digital orchestration platform conceptualized for institutions, projects, and non-governmental organisations (NGOs) supported under schemes of the Department of Social Justice and Empowerment (DoSJE), Government of India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gov-card p-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Our Mission</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Eliminate operational blind spots and transform periodic annual inspections into continuous, proactive, evidence-driven monitoring.
          </p>
        </div>

        <div className="gov-card p-6">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Human-in-the-Loop</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            AI serves strictly as decision-support telemetry. Authorized human officers always evaluate evidence, conduct field checks, and issue binding directives.
          </p>
        </div>

        <div className="gov-card p-6">
          <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-4">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Closed-Loop Resolution</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Every deficiency logged triggers a time-bound corrective action. Once verified, the institute's risk score is dynamically recalculated to reflect remediation.
          </p>
        </div>
      </div>

      <div className="gov-card p-8 bg-slate-50 dark:bg-slate-900/60 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Supported Schemes</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">✓ Deendayal Rehabilitation Scheme (DDRS)</li>
          <li className="flex items-center gap-2">✓ Integrated Programme for Senior Citizens (IPSrC)</li>
          <li className="flex items-center gap-2">✓ PM DAKSH Skill Empowerment Scheme</li>
          <li className="flex items-center gap-2">✓ Assistance to Voluntary Organisations working for SCs</li>
        </ul>
      </div>
    </div>
  );
};
