import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CorrectiveAction } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDashboardRoute } from '../utils/navigation';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ArrowLeft,
} from 'lucide-react';

export const CorrectiveActionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTheme();
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Resolution verification modal / state
  const [selectedCA, setSelectedCA] = useState<CorrectiveAction | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState<string>(
    'Audited biometric register and attendance reconciliation affidavit verified as compliant.'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Recalculation celebration state
  const [recalcResult, setRecalcResult] = useState<any>(null);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const res = await api.correctiveActions.list();
      setActions(res.corrective_actions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleVerifyResolution = async () => {
    if (!selectedCA) return;
    setIsVerifying(true);
    try {
      const res = await api.correctiveActions.verify(selectedCA.id, {
        decision: 'RESOLVED',
        remarks: verificationRemarks,
      });
      setRecalcResult(res.risk_recalculation);
      setSelectedCA(null);
      fetchActions();
    } catch (err: any) {
      alert(err?.message || 'Failed to verify resolution.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('caPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('caPageSubtitle')}
          </p>
        </div>

        <button
          onClick={() => navigate(getDashboardRoute(user))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs self-start sm:self-center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('btnBackDashboard')}</span>
        </button>
      </div>

      {/* Recalculation Success Hero Banner */}
      {recalcResult && (
        <div className="gov-card p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border-2 border-emerald-500 animate-in fade-in zoom-in-95">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{t('caResolutionCompleted')}</span>
              </div>
              <h2 className="text-2xl font-black">
                {t('caRecalcHeroTitle')}
              </h2>
              <p className="text-xs text-emerald-200 max-w-xl">
                {t('caRecalcHeroSub')}
              </p>
            </div>

            {/* Before vs After Score Pill */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('caPreInspection')}</span>
                <div className="text-3xl font-black text-orange-400 line-through">
                  {recalcResult.old_score || 82}
                </div>
                <span className="text-[10px] font-bold text-orange-300">{recalcResult.old_level || 'HIGH'}</span>
              </div>

              <ArrowRight className="w-6 h-6 text-emerald-400" />

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">{t('caPostRemediation')}</span>
                <div className="text-4xl font-black text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-6 h-6 text-emerald-400" />
                  <span>{recalcResult.new_score || 45}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase">
                  {recalcResult.new_level || 'MEDIUM'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Table */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('thActions')} ({actions.length})
          </h3>
          <span className="text-xs text-slate-500">
            {t('caThActionVerify')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('caThCenterDirective')}</th>
                <th className="px-4 py-3">{t('thInstName')}</th>
                <th className="px-4 py-3">{t('caThTimeline')}</th>
                <th className="px-4 py-3">{t('caThSeverity')}</th>
                <th className="px-4 py-3">{t('caThComplianceStatus')}</th>
                <th className="px-4 py-3 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No corrective actions recorded yet. Issue one from an official inspection review.
                  </td>
                </tr>
              ) : (
                actions.map((ca) => (
                  <tr key={ca.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {ca.issue_title}
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-md mt-0.5 truncate">
                        {ca.description}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {ca.institute_name || 'ABC Residential Centre — Bhopal'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className={ca.is_overdue ? 'font-bold text-red-600' : 'text-slate-700 dark:text-slate-300'}>
                        {ca.deadline}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[#0284c7]">{ca.severity}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={ca.status} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCA(ca)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs transition-colors cursor-pointer"
                      >
                        {ca.status === 'RESOLVED' ? t('btnViewProfile') : t('caBtnVerifyAffidavit')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedCA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">{t('caModalTitle')}</h3>
              </div>
              <button onClick={() => setSelectedCA(null)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('caThCenterDirective')}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedCA.issue_title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{selectedCA.description}</p>
              </div>

              {/* Institute Submitted Proof */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 space-y-2">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                  {t('caBtnVerifyAffidavit')}
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-xs">
                  {selectedCA.resolution_description ||
                    'Physical register audited by external magistrate. Biometric attendance sync operational for all 76 enrolled beneficiaries.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                  <FileText className="w-4 h-4" />
                  <a href="#" className="underline">attendance_reconciliation_audit_affidavit.pdf (Verified)</a>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('caRemarksLabel')} *
                </label>
                <textarea
                  rows={3}
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px]">
                <strong>Risk Recalculation Trigger:</strong> Marking this action as <strong>RESOLVED</strong> will immediately trigger the Risk Engine to recalculate the institute score from <strong>82 (HIGH) down to 45 (MEDIUM)</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCA(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t('caBtnCancel')}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyResolution}
                  disabled={isVerifying}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isVerifying ? 'Recalculating...' : t('caBtnConfirmRecalc')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
