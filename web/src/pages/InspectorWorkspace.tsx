import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Inspection, ChecklistItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import {
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Upload,
  FileCheck,
  Building2,
  UserCheck,
  Send,
  ArrowLeft,
  ClipboardCheck,
  Compass,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const InspectorWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();
  const { t, language } = useTheme();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'CRITICAL' | 'ASSIGNED' | 'COMPLETED'>('ALL');

  // Field workflow steps: 1 = Assigned/Overview, 2 = GPS Verification, 3 = Targeted Checklist, 4 = Evidence & Submit
  const [step, setStep] = useState<number>(1);

  // GPS state
  const [inspectorLat, setInspectorLat] = useState<number>(23.2601);
  const [inspectorLon, setInspectorLon] = useState<number>(77.4124);
  const [gpsResult, setGpsResult] = useState<any>(null);
  const [isVerifyingGps, setIsVerifyingGps] = useState<boolean>(false);

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Submission state
  const [verifiedAttendance, setVerifiedAttendance] = useState<number>(68.0);
  const [observations, setObservations] = useState<string>(
    'Physical headcount confirmed 68% attendance vs reported 94%. Classroom 2 equipment under-utilized. Night duty records missing.'
  );
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  const selectInspection = async (insp: Inspection) => {
    setIsLoading(true);
    try {
      const detail = await api.inspections.getById(insp.id);
      setActiveInspection(detail);
      setChecklistItems(detail.checklists || []);

      if (detail.expected_latitude && detail.expected_longitude) {
        setInspectorLat(detail.verified_latitude || Number((detail.expected_latitude + 0.0002).toFixed(4)));
        setInspectorLon(detail.verified_longitude || Number((detail.expected_longitude - 0.0002).toFixed(4)));
      }

      if (detail.status === 'ASSIGNED') {
        setStep(1);
        setGpsResult(null);
      } else if (detail.status === 'IN_PROGRESS') {
        if (detail.gps_verified) {
          setGpsResult({ verified: true, status: 'LOCATION_VERIFIED', distance_meters: detail.gps_distance_meters || 24.5 });
          setStep(3);
        } else {
          setStep(2);
        }
      } else {
        // SUBMITTED or REVIEWED
        setStep(4);
        if (detail.gps_verified) {
          setGpsResult({ verified: true, status: 'LOCATION_VERIFIED', distance_meters: detail.gps_distance_meters || 24.5 });
        }
      }
    } catch (err) {
      console.error('Failed to load inspection detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const res = await api.inspections.list();
      const list = res.inspections || [];
      setInspections(list);

      if (list.length > 0) {
        let target = list[0];
        if (paramId) {
          const match = list.find((i: Inspection) => String(i.id) === String(paramId));
          if (match) target = match;
        } else {
          const pending = list.find((i: Inspection) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS');
          if (pending) target = pending;
        }
        await selectInspection(target);
      } else {
        setActiveInspection(null);
      }
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [paramId]);

  const handleStartInspection = async () => {
    if (!activeInspection) return;
    try {
      await api.inspections.start(activeInspection.id);
      setStep(2); // Move to GPS verification
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyGPS = async () => {
    if (!activeInspection) return;
    setIsVerifyingGps(true);
    try {
      const res = await api.inspections.verifyGPS(activeInspection.id, {
        latitude: inspectorLat,
        longitude: inspectorLon,
      });
      setGpsResult(res);
      if (res.verified) {
        setStep(3); // Advance to checklist
      }
    } catch (err: any) {
      alert(err?.message || 'GPS verification error');
    } finally {
      setIsVerifyingGps(false);
    }
  };

  const handleUpdateItemStatus = (itemId: number, newStatus: 'PASS' | 'FAIL' | 'NA') => {
    setChecklistItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
    );
  };

  const handleUpdateItemNotes = (itemId: number, notes: string) => {
    setChecklistItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, notes } : it))
    );
  };

  const handleSaveChecklist = async () => {
    if (!activeInspection) return;
    try {
      await api.inspections.updateChecklist(
        activeInspection.id,
        checklistItems.map((it) => ({ id: it.id, status: it.status, notes: it.notes }))
      );
      setStep(4); // Move to evidence & final submit
    } catch (err: any) {
      alert(err?.message || 'Failed to save checklist');
    }
  };

  const handleUploadSampleEvidence = async (category: string) => {
    if (!activeInspection) return;
    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', `Geo-tagged field capture of ${category}`);
    formData.append('latitude', String(inspectorLat));
    formData.append('longitude', String(inspectorLon));
    formData.append('evidence_type', 'PHOTO');
    formData.append('file_url', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80');

    try {
      await api.inspections.uploadEvidence(activeInspection.id, formData);
      alert(`Evidence for ${category} successfully captured and geo-tagged!`);
      const refreshed = await api.inspections.getById(activeInspection.id);
      setActiveInspection(refreshed);
    } catch (err: any) {
      alert(err?.message || 'Evidence upload failed');
    }
  };

  const handleSubmitReport = async () => {
    if (!activeInspection) return;
    setIsSubmittingReport(true);
    try {
      await api.inspections.submitReport(activeInspection.id, {
        reported_attendance_pct: activeInspection.trigger_risk_score ? 94.0 : 85.0,
        verified_attendance_pct: verifiedAttendance,
        staff_present_count: 4,
        staff_total_count: 6,
        beneficiaries_verified_count: 42,
        observations,
        final_status: 'PARTIALLY_COMPLIANT',
      });
      alert('Digital Inspection Report successfully submitted to Department Official!');
      navigate(`/official/inspections/${activeInspection.id}`);
    } catch (err: any) {
      alert(err?.message || 'Report submission failed');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const criticalCount = inspections.filter(i => i.priority === 'CRITICAL').length || 1;
  const highCount = inspections.filter(i => i.priority === 'HIGH').length;
  const pendingCount = inspections.filter(i => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter(i => i.status === 'SUBMITTED' || i.status === 'REVIEWED' || i.status === 'CLOSED').length;

  const filteredInspections = inspections.filter((i) => {
    if (filterTab === 'CRITICAL') return i.priority === 'CRITICAL';
    if (filterTab === 'ASSIGNED') return i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS';
    if (filterTab === 'COMPLETED') return i.status === 'SUBMITTED' || i.status === 'REVIEWED' || i.status === 'CLOSED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('wsFieldInspectorTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('wsFieldInspectorSub')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => navigate(user?.role === 'inspection_officer' ? '/inspector/history' : getDashboardRoute(user))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{user?.role === 'inspection_officer' ? (t('inspectionHistory') || 'History') : t('btnBackDashboard')}</span>
          </button>

          {activeInspection && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                #{activeInspection.id} ({activeInspection.institute_name})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Inspector Quick KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="gov-card p-3.5 border-l-4 border-l-slate-700">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            {language === 'hi' ? 'कुल आवंटित' : 'Total Assigned'}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {inspections.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'पीएमयू कार्यदल 04' : 'PMU Taskforce 04'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-rose-500">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'hi' ? 'गंभीर प्राथमिकता' : 'Critical Priority'}</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {criticalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'तत्काल आकस्मिक जांच' : 'Immediate surprise audit'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-orange-500">
          <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority'}</span>
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {highCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'अनियमितता सत्यापन' : 'Anomaly verification'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-blue-500">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'hi' ? 'लंबित ऑन-साइट जांच' : 'Pending Field Visits'}</span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'कार्रवाई प्रतीक्षित' : 'Awaiting physical audit'}
          </div>
        </div>
      </div>

      {/* Assigned Inspections Queue / Task Selector */}
      <div className="gov-card p-4 space-y-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/80 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {language === 'hi' ? 'आवंटित निरीक्षण कार्य' : 'Assigned Inspections Queue'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {inspections.length} {language === 'hi' ? 'कुल' : 'Total'}
            </span>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'hi' ? 'सभी' : 'All'} ({inspections.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('CRITICAL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                filterTab === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'hi' ? 'गंभीर' : 'Critical'} ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('ASSIGNED')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                filterTab === 'ASSIGNED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'hi' ? 'लंबित' : 'Pending'} ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('COMPLETED')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                filterTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'hi' ? 'पूर्ण' : 'Completed'} ({completedCount})
            </button>
          </div>
        </div>

        {/* Inspections Cards Grid */}
        {filteredInspections.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            {language === 'hi' ? 'इस श्रेणी में कोई निरीक्षण नहीं मिला।' : 'No inspections found matching the selected filter.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredInspections.map((insp) => {
              const isSelected = activeInspection?.id === insp.id;
              const isPending = insp.status === 'ASSIGNED' || insp.status === 'IN_PROGRESS';
              return (
                <div
                  key={insp.id}
                  onClick={() => selectInspection(insp)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs relative ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-slate-700 dark:text-slate-300">
                        #{insp.id}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        insp.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                      }`}>
                        {insp.priority}
                      </span>
                    </div>

                    <StatusBadge status={insp.status} size="sm" />
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1" title={insp.institute_name}>
                    {insp.institute_name || `Institute #${insp.institute_id}`}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span className="truncate">{insp.institute_district}, {insp.institute_state}</span>
                    {insp.trigger_risk_score && (
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 ml-1 shrink-0">
                        Risk {insp.trigger_risk_score}/100
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(insp.scheduled_date || insp.created_at).toLocaleDateString()}
                    </span>
                    {isSelected ? (
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{language === 'hi' ? 'सक्रिय कार्य' : 'Active Duty'}</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-0.5">
                        <span>{isPending ? (language === 'hi' ? 'निरीक्षण करें' : 'Audit Now') : (language === 'hi' ? 'विवरण देखें' : 'View Report')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State when no inspections exist at all */}
      {inspections.length === 0 && !isLoading && (
        <div className="gov-card p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'hi' ? 'वर्तमान में कोई आवंटित निरीक्षण नहीं है' : 'No Assigned Inspections at Present'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'hi'
              ? 'आपके पीएमयू दल के लिए सभी निर्धारित निरीक्षण पूर्ण हो चुके हैं। जब विभागीय अधिकारी आकस्मिक निरीक्षण आवंटित करेंगे, तो वे यहां दिखाई देंगे।'
              : 'All field audits assigned to your PMU unit have been concluded. When the Department Official recommends a surprise inspection, it will appear here in real-time.'}
          </p>
        </div>
      )}

      {/* Step Indicator */}
      {activeInspection && (
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          {[
            { num: 1, label: language === 'hi' ? '1. आवंटित ब्रीफिंग' : '1. Assigned Briefing' },
            { num: 2, label: language === 'hi' ? '2. जीपीएस प्रमाणीकरण' : '2. GPS Verification' },
            { num: 3, label: language === 'hi' ? '3. लक्षित चेकलिस्ट' : '3. Targeted Checklist' },
            { num: 4, label: language === 'hi' ? '4. साक्ष्य एवं जमा' : '4. Evidence & Submit' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Assigned Inspection Details */}
      {step === 1 && activeInspection && (
        <div className="gov-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                {language === 'hi' ? 'आकस्मिक निरीक्षण ब्रीफिंग' : 'Statutory Surprise Inspection Briefing'}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {activeInspection.institute_name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase ${
                activeInspection.priority === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
              }`}>
                {language === 'hi' ? 'प्राथमिकता: ' : 'Priority: '}{activeInspection.priority}
              </span>
              <StatusBadge status={activeInspection.status} size="sm" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">{language === 'hi' ? 'संस्थान एवं स्थान:' : 'Facility & Jurisdiction:'}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{activeInspection.institute_name}</span>
                <span className="text-slate-500 block text-[11px]">{activeInspection.institute_district}, {activeInspection.institute_state}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{language === 'hi' ? 'निरीक्षण आईडी एवं प्रकार:' : 'Inspection ID & Directive:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">#{activeInspection.id} • {activeInspection.inspection_type}</span>
                <span className="text-slate-500 block text-[11px]">
                  {language === 'hi' ? 'निर्धारित तिथि: ' : 'Scheduled Date: '}
                  {new Date(activeInspection.scheduled_date || activeInspection.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-slate-500 block">{language === 'hi' ? 'ट्रिगर जोखिम स्कोर:' : 'Trigger Risk Score:'}</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                  {activeInspection.trigger_risk_score || 82}/100 ({activeInspection.trigger_risk_level || 'HIGH'})
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 block">{language === 'hi' ? 'जीपीएस अपेक्षित निर्देशांक:' : 'Expected GPS Coordinates:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {activeInspection.expected_latitude || 23.2599}, {activeInspection.expected_longitude || 77.4126}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                {language === 'hi' ? 'जोखिम इंजन ट्रिगर कारण:' : 'AI Risk Engine Trigger Factors:'}
              </span>
              <p className="text-[#0284c7] dark:text-[#38bdf8] font-semibold">
                {activeInspection.trigger_reasons || 'Attendance Anomaly (+18%) + Unresolved Compliance + 3 Grievances'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <strong className="text-blue-700 dark:text-blue-400 block mb-0.5">
                {language === 'hi' ? 'विभागीय विशेष निर्देश:' : 'Department Official Statutory Directives:'}
              </strong>
              <p className="italic leading-relaxed">
                "{activeInspection.special_instructions || 'Cross-examine physical attendance register vs reported 94% figure. Conduct random headcount and inspect classroom 2 facilities.'}"
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 italic">
              {language === 'hi'
                ? 'कार्यस्थल पर पहुंचने पर "साइट पर पहुंचे" बटन दबाएं।'
                : 'Press the action button upon reaching the premise to lock GPS coordinates.'}
            </span>
            <button
              onClick={handleStartInspection}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>
                {activeInspection.status === 'ASSIGNED'
                  ? (language === 'hi' ? 'साइट पर पहुंचे — निरीक्षण शुरू करें' : 'Arrived at Site — Start Inspection')
                  : (language === 'hi' ? 'निरीक्षण जारी रखें (जीपीएस / चेकलिस्ट) →' : 'Proceed to GPS Verification →')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: GPS Verification */}
      {step === 2 && activeInspection && (
        <div className="gov-card p-6 space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Field Geolocation Verification
            </h3>
            <p className="text-xs text-slate-500">
              Verifying inspector coordinates against institute registered coordinates (≤ 500m radius)
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Expected Facility Coordinates:</span>
              <span className="font-mono font-bold">{activeInspection.expected_latitude || 23.2599}, {activeInspection.expected_longitude || 77.4126}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Inspector Geolocation:</span>
              <div className="flex items-center gap-2 font-mono">
                <input
                  type="number"
                  step="0.0001"
                  value={inspectorLat}
                  onChange={(e) => setInspectorLat(parseFloat(e.target.value))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={inspectorLon}
                  onChange={(e) => setInspectorLon(parseFloat(e.target.value))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                />
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setInspectorLat(23.2601);
                  setInspectorLon(77.4124);
                }}
                className="text-[11px] text-blue-600 underline font-semibold"
              >
                Simulate On-Premise Coordinates (24m away)
              </button>
            </div>
          </div>

          {gpsResult && (
            <div className={`p-4 rounded-xl border max-w-lg mx-auto text-xs ${
              gpsResult.verified
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {gpsResult.verified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span>{gpsResult.status}</span>
              </div>
              <p className="mt-1 text-[11px]">
                Calculated Distance: <strong>{gpsResult.distance_meters}m</strong> (Allowable: ≤ 500m).
                {gpsResult.verified && ' You are verified on-site. Checklist unlocked!'}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={handleVerifyGPS}
              disabled={isVerifyingGps}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              {isVerifyingGps ? 'Querying GPS Hardware...' : 'Authenticate Location Coordinates'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Targeted Checklist */}
      {step === 3 && activeInspection && (
        <div className="gov-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Targeted Field Inspection Checklist
              </h3>
              <p className="text-xs text-slate-500">
                AI dynamically generated items focused on attendance anomalies and reported grievances
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {checklistItems.filter((it) => it.status !== 'PENDING').length} of {checklistItems.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold uppercase mr-2">
                      {item.section}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.item_name}</span>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateItemStatus(item.id, 'PASS')}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                        item.status === 'PASS'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      PASS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemStatus(item.id, 'FAIL')}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                        item.status === 'FAIL'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      FAIL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateItemStatus(item.id, 'NA')}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-colors ${
                        item.status === 'NA'
                          ? 'bg-slate-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-slate-500 text-[11px]">{item.description}</p>
                )}

                <input
                  type="text"
                  placeholder="Add inspector field observation / register page ref..."
                  value={item.notes || ''}
                  onChange={(e) => handleUpdateItemNotes(item.id, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-xs"
            >
              Back to GPS
            </button>
            <button
              onClick={handleSaveChecklist}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Save Checklist & Proceed to Evidence Capture →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Evidence & Submit Report */}
      {step === 4 && activeInspection && (
        <div className="gov-card p-6 space-y-6">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Geo-Tagged Evidence & Digital Report Submission
            </h3>
            <p className="text-xs text-slate-500">
              Attach mandatory photographic proof and enter verified on-site metrics
            </p>
          </div>

          {/* Quick Evidence Capture Buttons */}
          <div className="space-y-3">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
              Capture & Stamp Geo-Tagged Photos:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => handleUploadSampleEvidence('Attendance Register')}
                className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-500 font-bold flex flex-col items-center gap-1.5 text-center"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span>1. Attendance Register</span>
              </button>
              <button
                onClick={() => handleUploadSampleEvidence('Classroom & Lab')}
                className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-500 font-bold flex flex-col items-center gap-1.5 text-center"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span>2. Classroom Facility</span>
              </button>
              <button
                onClick={() => handleUploadSampleEvidence('Hostel & Hygiene')}
                className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-500 font-bold flex flex-col items-center gap-1.5 text-center"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span>3. Hostel Sanitation</span>
              </button>
              <button
                onClick={() => handleUploadSampleEvidence('Staff Roll Call')}
                className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-500 font-bold flex flex-col items-center gap-1.5 text-center"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span>4. Staff Presence</span>
              </button>
            </div>
          </div>

          {/* Evidence Counter */}
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{activeInspection.evidence?.length || 0} Geo-Tagged Evidence items stored in secure vault.</span>
          </div>

          {/* Verified Findings Inputs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inspector Verified Physical Attendance (%) *
                </label>
                <input
                  type="number"
                  value={verifiedAttendance}
                  onChange={(e) => setVerifiedAttendance(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded font-mono font-bold text-sm text-blue-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Reported by Institute: 94.0% (Discrepancy: -{Math.round(94.0 - verifiedAttendance)}%)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Compliance Assessment
                </label>
                <div className="p-2 bg-amber-100 text-amber-900 font-bold rounded">
                  PARTIALLY COMPLIANT (Deficiencies Noted)
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Observations & Non-Compliance Summary *
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded font-semibold text-xs cursor-pointer"
            >
              Back to Checklist
            </button>
            {activeInspection.status === 'SUBMITTED' || activeInspection.status === 'REVIEWED' ? (
              <button
                type="button"
                onClick={() => navigate(`/official/inspections/${activeInspection.id}`)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{language === 'hi' ? 'आधिकारिक समीक्षा देखें' : 'View Executive Review'}</span>
              </button>
            ) : (
              <button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingReport ? 'Submitting...' : 'SUBMIT DIGITAL INSPECTION REPORT'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
