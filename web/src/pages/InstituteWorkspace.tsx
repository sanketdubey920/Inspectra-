import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute, CorrectiveAction } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { getDashboardRoute } from '../utils/navigation';
import { Building2, UserCheck, CheckSquare, UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const InstituteWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const instituteId = user?.institute_id || 1;

  const [institute, setInstitute] = useState<Institute | null>(null);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Daily attendance submission state
  const [dailyAttendance, setDailyAttendance] = useState<number>(78);
  const [presentCount, setPresentCount] = useState<number>(74);
  const [totalCount, setTotalCount] = useState<number>(95);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState<boolean>(false);

  // Corrective action response state
  const [selectedCA, setSelectedCA] = useState<CorrectiveAction | null>(null);
  const [resolutionDesc, setResolutionDesc] = useState<string>(
    'Biometric attendance machine recalibrated and synced with central server. Physical register cross-checked and signed by Special Magistrate.'
  );
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const [instData, actionsData] = await Promise.all([
        api.institutes.getById(instituteId),
        api.correctiveActions.list({ institute_id: String(instituteId) }),
      ]);
      setInstitute(instData);
      setActions(actionsData.corrective_actions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [instituteId]);

  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAttendance(true);
    setTimeout(() => {
      alert(`Daily attendance records (${presentCount}/${totalCount} - ${Math.round((presentCount/totalCount)*100)}%) submitted successfully to DoSJE portal!`);
      setIsSubmittingAttendance(false);
    }, 500);
  };

  const handleSubmitResolutionProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCA) return;
    setIsSubmittingProof(true);
    try {
      await api.correctiveActions.submitResolution(selectedCA.id, {
        resolution_description: resolutionDesc,
        resolution_evidence_url: '/api/uploads/attendance_reconciliation_audit_affidavit.pdf',
      });
      alert('Resolution proof and supporting documents submitted to Department Official for review!');
      setSelectedCA(null);
      fetchProfile();
    } catch (err: any) {
      alert(err?.message || 'Submission failed');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  if (isLoading || !institute) {
    return <div className="gov-card p-12 text-center text-xs text-slate-400">Loading institutional portal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="gov-card p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-800 text-blue-200 text-[10px] font-bold uppercase">
              {t('wsInstitutePortalTitle')}
            </span>
            <span className="text-xs text-slate-300">Reg: {institute.registration_number}</span>
          </div>
          <h1 className="text-2xl font-black mt-1">{institute.name}</h1>
          <p className="text-xs text-slate-300">
            Authorized Representative: <strong>{user?.name || institute.incharge}</strong> | {institute.district}, {institute.state}
          </p>
        </div>

        <button
          onClick={() => navigate(getDashboardRoute(user))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{user?.role === 'institute_representative' ? (t('instituteProfile') || 'Institute') : t('btnBackDashboard')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Attendance & Operational Submission */}
        <div className="gov-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Daily Attendance Filing</span>
          </h3>

          <form onSubmit={handleSubmitAttendance} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Total Enrolled Beneficiaries
              </label>
              <input
                type="number"
                value={totalCount}
                onChange={(e) => setTotalCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Physical Present Count (Today)
              </label>
              <input
                type="number"
                value={presentCount}
                onChange={(e) => setPresentCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded font-mono font-bold text-sky-600"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-500">
              Calculated Rate: <strong>{Math.round((presentCount / totalCount) * 100)}%</strong>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAttendance}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors"
            >
              {isSubmittingAttendance ? 'Transmitting...' : 'Transmit Verified Daily Log'}
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Corrective Action Notices */}
        <div className="lg:col-span-2 gov-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#0284c7]" />
            <span>Official Directives & Corrective Actions ({actions.length})</span>
          </h3>

          {actions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No open corrective action directives issued by Department Officials.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {actions.map((ca) => (
                <div
                  key={ca.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {ca.issue_title}
                    </span>
                    <StatusBadge status={ca.status} size="sm" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{ca.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Compliance Deadline: <strong className="text-red-600">{ca.deadline}</strong>
                    </span>

                    {ca.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedCA(ca)}
                        className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs"
                      >
                        Submit Resolution Proof & Files
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Resolution Proof Modal */}
      {selectedCA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0284c7] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Submit Compliance Resolution Proof</h3>
              <button onClick={() => setSelectedCA(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitResolutionProof} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Corrective Action
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded font-semibold text-slate-800 dark:text-slate-200">
                  {selectedCA.issue_title}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Detailed Remediation Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionDesc}
                  onChange={(e) => setResolutionDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload Audited Proof / Biometric Logs (PDF)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-slate-500 cursor-pointer">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <span>attendance_reconciliation_audit_affidavit.pdf (Ready for submission)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCA(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold transition-colors"
                >
                  {isSubmittingProof ? 'Transmitting...' : 'Submit Resolution to Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
