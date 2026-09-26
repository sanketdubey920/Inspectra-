import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Inspection } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import {
  FileCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Camera,
  User,
  Calendar,
  Building2,
  Clock,
  ShieldAlert,
  ArrowLeft,
  X,
} from 'lucide-react';

export const OfficialReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const inspectionId = Number(id);

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal / action state
  const [finalStatus, setFinalStatus] = useState<string>('PARTIALLY_COMPLIANT');
  const [reviewRemarks, setReviewRemarks] = useState<string>(
    'Verified on-ground attendance mismatch (68% verified vs 94% reported). Immediate submission of audited biometric logs required.'
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Corrective action modal state
  const [showCAModal, setShowCAModal] = useState<boolean>(false);
  const [caTitle, setCaTitle] = useState<string>('Attendance Register Mismatch & Biometric Reconciliation');
  const [caDesc, setCaDesc] = useState<string>(
    'Submit physical attendance registers, biometric device server logs, and reconciliation affidavit for the period 01 Aug – 15 Sep within 15 days.'
  );
  const [caDeadlineDays, setCaDeadlineDays] = useState<number>(15);
  const [isSubmittingCA, setIsSubmittingCA] = useState<boolean>(false);

  const fetchInspection = async () => {
    setIsLoading(true);
    try {
      const data = await api.inspections.getById(inspectionId);
      setInspection(data);
      if (data.final_status) {
        setFinalStatus(data.final_status);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load inspection record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [inspectionId]);

  const handleOfficialReview = async () => {
    setIsSubmittingReview(true);
    try {
      await api.inspections.review(inspectionId, {
        final_status: finalStatus,
        remarks: reviewRemarks,
      });
      alert(`Official review completed! Status recorded as ${finalStatus}.`);
      fetchInspection();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit official review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCreateCA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspection) return;
    setIsSubmittingCA(true);
    try {
      await api.correctiveActions.create({
        institute_id: inspection.institute_id,
        inspection_id: inspection.id,
        issue_title: caTitle,
        description: caDesc,
        severity: 'HIGH',
        deadline_days: caDeadlineDays,
      });
      alert('Corrective action issued! Directive transmitted to Institute Representative.');
      setShowCAModal(false);
      navigate('/corrective-actions');
    } catch (err: any) {
      alert(err?.message || 'Failed to create corrective action.');
    } finally {
      setIsSubmittingCA(false);
    }
  };

  if (isLoading) {
    return <div className="gov-card p-12 text-center text-xs text-slate-400">Loading inspection report for official review...</div>;
  }

  if (error || !inspection) {
    return (
      <div className="gov-card p-8 text-center text-xs text-red-600 space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto" />
        <p>{error || 'Inspection record not found.'}</p>
        <button onClick={() => navigate('/inspections')} className="px-4 py-2 bg-slate-100 rounded font-bold">
          Back to Inspections
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(getDashboardRoute(user))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBackDashboard')}</span>
          </button>
          <button
            onClick={() => navigate('/inspections')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>{t('reviewBtnBackList')}</span>
          </button>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{t('reviewPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500">
            {t('reviewPageSubtitle')}
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="gov-card p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-[10px] font-bold uppercase">
              Inspection #{inspection.id} • {inspection.inspection_type}
            </span>
            <StatusBadge status={inspection.status} size="sm" />
            {inspection.final_status && <StatusBadge status={inspection.final_status} size="sm" />}
          </div>
          <h2 className="text-2xl font-black">{inspection.institute_name}</h2>
          <p className="text-xs text-slate-300">
            Inspector: <strong>{inspection.inspector_name || 'PMU Officer'}</strong> | Date: {new Date(inspection.scheduled_date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCAModal(true)}
            className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-bold text-xs shadow transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t('reviewBtnIssueCA')}</span>
          </button>
        </div>
      </div>

      {/* Location Verification & Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPS Verification Card */}
        <div className="gov-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>GPS Field Location Verification</span>
          </h3>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Verification Result:</span>
              {inspection.gps_verified ? (
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                  ✓ LOCATION VERIFIED (Authentic On-Site Audit)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                  ✕ LOCATION MISMATCH
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Expected Coordinates:</span>
              <span className="font-mono">{inspection.expected_latitude || 23.2599}, {inspection.expected_longitude || 77.4126}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Inspector Coordinates:</span>
              <span className="font-mono">{inspection.verified_latitude || 23.2601}, {inspection.verified_longitude || 77.4124}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Radial Proximity:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {inspection.gps_distance_meters || 24.5} meters (Tolerance: ≤ 500m)
              </span>
            </div>
          </div>
        </div>

        {/* On-Ground Attendance & Staff Findings */}
        <div className="gov-card p-5 space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Findings vs Reported Signals</span>
          </h3>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Reported Daily Attendance:</span>
              <span className="font-mono font-bold text-red-600">
                {inspection.reported_attendance_pct || 94}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Inspector Verified Physical Attendance:</span>
              <span className="font-mono font-black text-blue-600 text-sm">
                {inspection.verified_attendance_pct || 68}% (26% Shortfall)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">On-Duty Staff Presence:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {inspection.staff_present_count || 4} / {inspection.staff_total_count || 6} Present
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Beneficiaries Physically Verified:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {inspection.beneficiaries_verified_count || 42} Residents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Targeted Inspection Checklist Results */}
      <div className="gov-card p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
          Targeted Checklist Audit Results
        </h3>

        <div className="space-y-3">
          {(inspection.checklists && inspection.checklists.length > 0) ? (
            inspection.checklists.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase">
                      {item.section}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.item_name}</span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      Inspector Notes: {item.notes}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 p-4 text-center">No checklist items recorded.</div>
          )}
        </div>
      </div>

      {/* Geo-Tagged Evidence Gallery */}
      <div className="gov-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Geo-Tagged Evidence Repository ({inspection.evidence?.length || 0})</span>
          </h3>
          <span className="text-[11px] text-slate-500">Cryptographically stamped with GPS & Timestamp</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(!inspection.evidence || inspection.evidence.length === 0) ? (
            <div className="col-span-3 text-center p-8 text-xs text-slate-400">
              No evidence files attached to this report yet.
            </div>
          ) : (
            inspection.evidence.map((ev) => (
              <div key={ev.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                <div className="aspect-video bg-slate-900 relative">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80"
                    alt={ev.category || 'Evidence'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur text-[10px] text-white p-2 rounded font-mono space-y-0.5">
                    <div>GPS: {ev.latitude}, {ev.longitude}</div>
                    <div>Captured: {new Date(ev.captured_at).toLocaleDateString()} IST</div>
                  </div>
                </div>
                <div className="p-3 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">{ev.category}</span>
                  <p className="text-[11px] text-slate-500 mt-1">{ev.description || 'On-site photograph verification'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Official Sign-Off Section (Department Official only) */}
      {user?.role === 'department_official' && (
        <div className="gov-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Department Official Concluding Assessment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">
                Final Compliance Evaluation
              </label>
              <select
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
              >
                <option value="PARTIALLY_COMPLIANT">PARTIALLY COMPLIANT (Corrective Action Required)</option>
                <option value="NON_COMPLIANT">NON-COMPLIANT (Serious Breach / Show Cause)</option>
                <option value="COMPLIANT">COMPLIANT (Satisfactory Standing)</option>
                <option value="FURTHER_INSPECTION_REQUIRED">FURTHER INSPECTION REQUIRED</option>
              </select>
            </div>

            <div>
              <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">
                Reviewing Remarks & Directives
              </label>
              <input
                type="text"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleOfficialReview}
              disabled={isSubmittingReview}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow transition-colors"
            >
              {isSubmittingReview ? 'Recording...' : 'Submit Official Review Sign-Off'}
            </button>
          </div>
        </div>
      )}

      {/* Corrective Action Modal */}
      {user?.role === 'department_official' && showCAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#0284c7] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">Issue Corrective Action Directive</h3>
              </div>
              <button onClick={() => setShowCAModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCA} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deficiency / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={caTitle}
                  onChange={(e) => setCaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Action Directive & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={caDesc}
                  onChange={(e) => setCaDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Compliance Deadline (Days)
                </label>
                <select
                  value={caDeadlineDays}
                  onChange={(e) => setCaDeadlineDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value={7}>7 Days (Urgent)</option>
                  <option value={15}>15 Days (Standard)</option>
                  <option value={30}>30 Days (Extended)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCAModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCA}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold transition-colors"
                >
                  {isSubmittingCA ? 'Transmitting...' : 'Issue Mandatory Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
