import React from 'react';
import { RiskScore } from '../types';
import { AlertCircle, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface RiskCardProps {
  risk?: RiskScore;
  instituteName?: string;
  onRecommendInspection?: () => void;
  showAction?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  risk,
  instituteName,
  onRecommendInspection,
  showAction = true,
}) => {
  if (!risk) {
    return (
      <div className="gov-card p-6 text-center text-slate-500">
        No risk assessment data available for this institute.
      </div>
    );
  }

  const score = risk.score;
  const level = risk.risk_level;

  let ringColor = 'text-emerald-500';
  let progressBg = 'bg-emerald-500';
  if (level === 'MEDIUM') {
    ringColor = 'text-amber-500';
    progressBg = 'bg-amber-500';
  } else if (level === 'HIGH') {
    ringColor = 'text-orange-500';
    progressBg = 'bg-orange-500';
  } else if (level === 'CRITICAL') {
    ringColor = 'text-red-500';
    progressBg = 'bg-red-500';
  }

  return (
    <div className="gov-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Institutional Risk & Discrepancy Matrix
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              <ShieldAlert className="w-3 h-3" /> GFR 150(2) Monitoring
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical deviation score computed from biometric registers, CCTV telemetry, grievances & filing history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge score={score} level={level} size="lg" />
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 items-center">
        {/* Gauge Card */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Discrepancy Priority Index
          </span>
          <div className="flex items-baseline gap-1 my-2">
            <span className={`text-5xl font-black tracking-tight ${ringColor}`}>
              {score}
            </span>
            <span className="text-slate-400 font-bold text-lg">/ 100</span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>

          {risk.previous_score !== undefined && (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Previous Score:</span>
              <span className="font-bold line-through text-slate-400">{risk.previous_score}</span>
              <span>→</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
            </div>
          )}
        </div>

        {/* Recommendation Box */}
        <div className="md:col-span-2 flex flex-col justify-between h-full p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <div>
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Recommended Intervention
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {risk.recommendation}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Based on the detected risk factors, an unannounced inspection is strongly recommended to conduct on-ground verification of beneficiary attendance and cross-examine institutional records.
            </p>
          </div>

          {showAction && onRecommendInspection && (
            <div className="mt-4 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Action requires authorized Department Official sign-off
              </span>
              <button
                onClick={onRecommendInspection}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-sm transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Recommend Surprise Inspection</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Explainable Factor Breakdown */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Explainable Factor Breakdown (Why this score exists)
        </h4>

        <div className="space-y-3">
          {risk.factors && risk.factors.map((f, idx) => (
            <div
              key={f.id || idx}
              className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {f.factor_name}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    f.points > 0 
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {f.status_label}
                  </span>
                </div>
                {f.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {f.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.points > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${(f.points / f.max_points) * 100}%` }}
                  ></div>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 w-12 text-right">
                  +{f.points} <span className="text-[10px] text-slate-400 font-normal">/{f.max_points}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Decision Support Disclaimer */}
      <div className="mt-5 p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-700 dark:text-amber-400">
            Statutory Decision-Support Notice (GFR Rule 150(2) & CVC Guidelines)
          </span>
          <span>
            The Discrepancy Priority Index and statistical deviation indicators serve strictly as administrative decision-support tools. They highlight institutional areas requiring physical verification and do not constitute legal findings of non-compliance. Official determinations are rendered solely following physical on-site inspection by authorized Inspecting Officers.
          </span>
        </div>
      </div>
    </div>
  );
};
