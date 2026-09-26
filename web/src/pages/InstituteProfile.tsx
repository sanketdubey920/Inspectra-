import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute } from '../types';
import { RiskCard } from '../components/RiskCard';
import { CCTVCard } from '../components/CCTVCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  Calendar,
  AlertTriangle,
  FileCheck,
  Video,
  Activity,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const InstituteProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useTheme();
  const { user } = useAuth();
  const instituteId = Number(id) || 1;

  const [institute, setInstitute] = useState<Institute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cctv' | 'compliance' | 'inspections' | 'actions'>('overview');

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const data = await api.institutes.getById(instituteId);
      setInstitute(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load institute profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [instituteId]);

  if (isLoading) {
    return (
      <div className="gov-card p-12 text-center text-xs text-slate-400">
        Loading comprehensive institutional dossier...
      </div>
    );
  }

  if (error || !institute) {
    return (
      <div className="gov-card p-8 text-center text-xs text-red-600 space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto" />
        <p>{error || 'Institute not found.'}</p>
        <button
          onClick={() => navigate('/institutes')}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold"
        >
          {t('instProfileBackDir')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(getDashboardRoute(user))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBackDashboard')}</span>
          </button>
          <button
            onClick={() => navigate('/institutes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>{t('instProfileBackDir')}</span>
          </button>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {institute.district}, {institute.state} / <strong className="text-slate-700 dark:text-slate-200">{institute.name}</strong>
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="gov-card p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
              {institute.institute_type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
              REG: {institute.registration_number}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{institute.name}</h1>
          <p className="text-xs text-blue-200 max-w-2xl">{institute.project || institute.scheme}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{institute.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('instContactHead')}: {institute.incharge}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>{institute.contact}</span>
            </div>
          </div>
        </div>

        {/* Institutional Status & Geo-Coordinates */}
        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-blue-900/60 border border-blue-700 text-blue-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'hi' ? 'मान्यता प्राप्त सहायता संस्थान' : 'Authorized Grantee Centre'}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Coordinates: {institute.latitude}, {institute.longitude}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 text-xs font-bold overflow-x-auto">
        {[
          { key: 'overview', label: t('instTabOverview') },
          { key: 'cctv', label: `${t('instTabCCTV')} (${institute.cctv_cameras?.length || 0})` },
          { key: 'compliance', label: t('instTabCompliance') },
          { key: 'inspections', label: `${t('instTabInspections')} (${institute.inspections?.length || 0})` },
          { key: 'actions', label: `${t('instTabActions')} (${institute.corrective_actions?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Explainable Risk Card */}
          <RiskCard
            risk={institute.risk}
            instituteName={institute.name}
            showAction={false}
          />

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Operational Signals */}
            <div className="gov-card p-5 space-y-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Operational Signals
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reported Daily Attendance:</span>
                  <span className="font-bold text-red-600 font-mono text-sm">
                    {institute.reported_attendance}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Historical 3-Month Average:</span>
                  <span className="font-medium font-mono text-sm">
                    {institute.historical_attendance}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Registered Beneficiary Grievances:</span>
                  <span className="font-bold text-[#0284c7] font-mono">
                    {institute.complaints_count} Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pending Regulatory Filings:</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {institute.pending_compliance_count} Item(s)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Last Inspection Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {institute.last_inspection_date ? new Date(institute.last_inspection_date).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Infrastructure Readiness */}
            <div className="gov-card p-5 space-y-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Infrastructure Checklist
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Total Classrooms / Activity Rooms:</span>
                  <span className="font-bold">{institute.classrooms_count} Rooms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Computer & Vocational Lab:</span>
                  {institute.computer_lab ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">✓ Available</span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1">✕ Not Available</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">Residential Hostel Facilities:</span>
                  {institute.hostel_facility ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">✓ Operational</span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1">✕ None</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">First Aid & Medical Station:</span>
                  {institute.medical_facility ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">✓ Equipped</span>
                  ) : (
                    <span className="text-red-500 font-bold flex items-center gap-1">✕ Deficient</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">CCTV Coverage:</span>
                  <span className="font-bold text-blue-600">
                    {institute.cctv_online_count || institute.cctv_cameras?.length || 6} Streams Configured
                  </span>
                </div>
              </div>
            </div>

            {/* Staff & Beneficiaries Count */}
            <div className="gov-card p-5 space-y-3">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Enrollment & Human Resources
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Sanctioned Capacity:</span>
                  <span className="font-bold">{institute.capacity} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Currently Enrolled:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{institute.current_occupancy} beneficiaries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Verified Teaching & Care Staff:</span>
                  <span className="font-bold">{institute.staff?.length || 6} Personnel</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Occupancy Utilization:</span>
                  <span className="font-bold text-sky-600">
                    {Math.round((institute.current_occupancy / institute.capacity) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CCTV Sneak Peek */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Simulated CCTV Feeds (OpenCV Telemetry Active)</span>
              </h3>
              <button
                onClick={() => setActiveTab('cctv')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all feeds →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(institute.cctv_cameras || []).slice(0, 3).map((cam) => (
                <CCTVCard key={cam.id} camera={cam} instituteName={institute.name} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: CCTV */}
      {activeTab === 'cctv' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-3">
            <Video className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Prototype CCTV Integration Layer</span>
              <span>
                Simulated feeds demonstrating computer vision signal extraction using OpenCV. Authorized production deployment connects to institutional DVR/NVR units via RTSP/ONVIF. Video is processed for activity metrics and is not permanently stored.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(institute.cctv_cameras || []).map((cam) => (
              <CCTVCard key={cam.id} camera={cam} instituteName={institute.name} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Compliance & Grievances */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="gov-card p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              Registered Beneficiary Grievances ({institute.complaints?.length || 0})
            </h3>
            {(!institute.complaints || institute.complaints.length === 0) ? (
              <div className="text-xs text-slate-400 p-4 text-center">No active complaints filed.</div>
            ) : (
              <div className="space-y-3">
                {institute.complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-600">{c.tracking_code}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white">{c.category}</div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{c.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Reported by: {c.complainant_name} | {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Inspections */}
      {activeTab === 'inspections' && (
        <div className="gov-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {language === 'hi' ? 'निरीक्षण इतिहास एवं डिजिटल रिपोर्ट' : 'Inspection History & Digital Reports'}
            </h3>
          </div>

          {(!institute.inspections || institute.inspections.length === 0) ? (
            <div className="text-center p-8 text-xs text-slate-400">
              {language === 'hi'
                ? 'इस संस्थान के लिए अभी कोई आधिकारिक निरीक्षण रिकॉर्ड दर्ज नहीं है।'
                : 'No official field inspections recorded yet for this facility.'}
            </div>
          ) : (
            <div className="space-y-3">
              {institute.inspections.map((insp) => (
                <div
                  key={insp.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Inspection #{insp.id} — {insp.inspection_type}
                      </span>
                      <StatusBadge status={insp.status} size="sm" />
                      {insp.final_status && <StatusBadge status={insp.final_status} size="sm" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Inspector: {insp.inspector_name || 'PMU Officer'} | Date: {new Date(insp.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/official/inspections/${insp.id}`)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs shrink-0"
                  >
                    View / Review Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Corrective Actions */}
      {activeTab === 'actions' && (
        <div className="gov-card p-6">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
            Corrective Action Directives ({institute.corrective_actions?.length || 0})
          </h3>

          {(!institute.corrective_actions || institute.corrective_actions.length === 0) ? (
            <div className="text-center p-8 text-xs text-slate-400">
              No corrective actions currently issued to this facility.
            </div>
          ) : (
            <div className="space-y-3">
              {institute.corrective_actions.map((ca) => (
                <div
                  key={ca.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {ca.issue_title}
                      </span>
                      <StatusBadge status={ca.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{ca.description}</p>
                    <div className="text-[10px] text-slate-400">
                      Deadline: <strong>{ca.deadline}</strong> | Status: {ca.status}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/corrective-actions')}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded text-xs hover:bg-blue-100"
                  >
                    Manage Directive
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
