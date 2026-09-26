import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Complaint, Institute } from '../types';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../components/StatusBadge';
import { InspectionAssignmentModal } from '../components/InspectionAssignmentModal';
import {
  MessageSquareWarning,
  Search,
  RefreshCw,
  Building2,
  Shield,
  ShieldAlert,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  Gavel,
  X,
  FileText,
  Copy,
  Check,
  History,
  Download,
  FileSpreadsheet,
  Activity,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BeneficiaryReportsPage: React.FC = () => {
  const { language, t } = useTheme();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewTab, setViewTab] = useState<'queue' | 'history' | 'timeline'>('queue');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInstitute, setSelectedInstitute] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>('INVESTIGATING');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Surprise Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState<boolean>(false);
  const [inspectionTargetInstitute, setInspectionTargetInstitute] = useState<Institute | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [compRes, instRes] = await Promise.all([
        api.feedback.list(),
        api.institutes.list()
      ]);
      setComplaints(compRes.feedback || []);
      setInstitutes(instRes.institutes || []);
    } catch (err) {
      console.error('Failed to load beneficiary reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenActionModal = (complaint: Complaint) => {
    setActiveComplaint(complaint);
    setNewStatus(complaint.status || 'INVESTIGATING');
    setResolutionNotes(complaint.resolution_notes || '');
    setActionSuccessMsg(null);
    setActionModalOpen(true);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setActionSubmitting(true);
    try {
      const res = await api.feedback.updateAction(activeComplaint.id, {
        status: newStatus,
        resolution_notes: resolutionNotes
      });

      // Update local complaints list
      setComplaints((prev) =>
        prev.map((c) => (c.id === activeComplaint.id ? res.complaint : c))
      );
      setActionSuccessMsg(
        language === 'hi'
          ? 'आधिकारिक कार्रवाई सफलतापूर्वक दर्ज की गई!'
          : 'Official action successfully recorded!'
      );
      setTimeout(() => {
        setActionModalOpen(false);
        setActiveComplaint(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to update action:', err);
      alert('Failed to record action. Please try again.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleDispatchInspection = (complaint: Complaint) => {
    const inst = institutes.find((i) => i.id === complaint.institute_id);
    if (inst) {
      setInspectionTargetInstitute(inst);
      setInspectionModalOpen(true);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Tracking Code',
      'Institute ID',
      'Institute Name',
      'District',
      'State',
      'Category',
      'Severity',
      'Status',
      'Complainant',
      'Anonymous',
      'Description',
      'Official Resolution Notes',
      'Filed Timestamp',
      'Resolved Timestamp'
    ];

    const rows = complaints.map((c) => [
      `"${c.tracking_code || ''}"`,
      c.institute_id || '',
      `"${(c.institute_name || '').replace(/"/g, '""')}"`,
      `"${(c.institute_district || '').replace(/"/g, '""')}"`,
      `"${(c.institute_state || '').replace(/"/g, '""')}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${c.severity || ''}"`,
      `"${c.status || ''}"`,
      `"${(c.complainant_name || '').replace(/"/g, '""')}"`,
      c.is_anonymous ? 'Yes' : 'No',
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${(c.resolution_notes || '').replace(/"/g, '""')}"`,
      `"${c.created_at || ''}"`,
      `"${c.resolved_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `INSPECTRA_Beneficiary_Report_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    // If Active Queue view and no specific status filter is set, default to active complaints
    if (viewTab === 'queue' && selectedStatus === 'ALL') {
      if (c.status === 'RESOLVED' || c.status === 'REJECTED') {
        return false;
      }
    }

    const matchesSearch =
      searchQuery.trim() === '' ||
      c.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.institute_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesInstitute =
      selectedInstitute === 'ALL' || c.institute_id === Number(selectedInstitute);

    const matchesStatus =
      selectedStatus === 'ALL' || c.status.toUpperCase() === selectedStatus.toUpperCase();

    const matchesSeverity =
      selectedSeverity === 'ALL' || c.severity.toUpperCase() === selectedSeverity.toUpperCase();

    return matchesSearch && matchesInstitute && matchesStatus && matchesSeverity;
  });

  // KPI calculations
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const investigatingCount = complaints.filter(
    (c) => c.status === 'INVESTIGATING' || c.status === 'ACTION_INITIATED'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const criticalCount = complaints.filter(
    (c) => c.severity === 'CRITICAL' || c.severity === 'HIGH'
  ).length;

  // Active queue count
  const activeQueueCount = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Official Ribbon */}
      <div className="h-1 bg-linear-to-r from-orange-500 via-white to-[#0284c7] rounded-full" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {language === 'hi' ? 'नागरिक एवं लाभार्थी निवारण' : 'Citizen & Beneficiary Redressal'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              GFR 2017 & CVC Guidelines
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <MessageSquareWarning className="w-7 h-7 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>
              {language === 'hi'
                ? 'लाभार्थी शिकायत एवं कल्याण रिपोर्ट'
                : 'Beneficiary Grievance & Welfare Reports'}
            </span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            {language === 'hi'
              ? 'लाभार्थियों और नागरिकों द्वारा दर्ज की गई शिकायतों की प्रत्यक्ष समीक्षा, आधिकारिक जांच आदेश एवं आकस्मिक निरीक्षण आवंटन'
              : 'Direct oversight of beneficiary complaints, statutory inquiry notices, and immediate field inspection dispatch.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            title={t('grvBtnExportHistory')}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('grvBtnExportHistory')}</span>
          </button>

          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'रिफ्रेश करें' : 'Refresh Reports'}</span>
          </button>
        </div>
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setViewTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              viewTab === 'queue'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('grvTabActiveQueue')}</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                viewTab === 'queue'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {activeQueueCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              viewTab === 'history'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('grvTabHistory')}</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                viewTab === 'history'
                  ? 'bg-blue-800 text-blue-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setViewTab('timeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              viewTab === 'timeline'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('grvTabTimeline')}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {viewTab === 'queue' && (
            <span>
              {language === 'hi'
                ? 'वर्तमान में लंबित एवं प्रक्रियाधीन शिकायतें'
                : 'Active complaints currently awaiting action or under field inquiry'}
            </span>
          )}
          {viewTab === 'history' && (
            <span>
              {language === 'hi'
                ? 'समस्त दर्ज शिकायतों का पूर्ण ऐतिहासिक संग्रह एवं निराकरण आदेश'
                : 'Comprehensive historical archive of all complaints & official resolutions'}
            </span>
          )}
          {viewTab === 'timeline' && (
            <span>
              {language === 'hi'
                ? 'शिकायतों एवं विभागीय कार्रवाइयों का कालक्रमानुसार ऑडिट ट्रेल'
                : 'Chronological timeline audit trail of complaints & departmental directives'}
            </span>
          )}
        </div>
      </div>

      {/* Historical Archive Banner (Shown when History tab is active) */}
      {viewTab === 'history' && (
        <div className="gov-card p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-blue-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {language === 'hi' ? 'सांविधिक अभिलेखागार' : 'Statutory Redressal Archive'}
                </span>
                <span className="text-xs text-blue-300/60">•</span>
                <span className="text-xs text-blue-200/80 font-medium">
                  {language === 'hi' ? 'GFR नियम 150(2) एवं CVC दिशानिर्देश' : 'GFR Rule 150(2) & CVC Mandate'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <span>{t('grvHistoryTitle')}</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {t('grvHistorySubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  {language === 'hi' ? 'कुल प्राप्त' : 'Total Filed'}
                </div>
                <div className="text-xl font-black text-white mt-0.5">{totalCount}</div>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">
                  {language === 'hi' ? 'निराकृत' : 'Resolved'}
                </div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{resolvedCount}</div>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <div className="text-[10px] text-blue-400 uppercase font-bold">
                  {t('grvResolutionRate')}
                </div>
                <div className="text-xl font-black text-blue-300 mt-0.5">
                  {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
                </div>
              </div>
              <div className="text-center px-2 border-l border-white/10">
                <div className="text-[10px] text-amber-400 uppercase font-bold">
                  {t('grvResolutionTurnaround')}
                </div>
                <div className="text-xl font-black text-amber-300 mt-0.5">
                  ~3.4d
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="gov-card p-3.5 border-l-4 border-l-slate-700">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            {language === 'hi' ? 'कुल प्राप्त रिपोर्ट' : 'Total Reports'}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'समस्त संस्थान' : 'All Facilities'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{language === 'hi' ? 'लंबित समीक्षा' : 'Pending Review'}</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'तत्काल कार्रवाई अपेक्षित' : 'Immediate Action Req.'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-blue-500">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>{language === 'hi' ? 'जांच / कार्रवाई जारी' : 'Investigating'}</span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {investigatingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'अधिकारी नियुक्त' : 'Official Assigned'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'hi' ? 'निराकृत शिकायतें' : 'Resolved'}</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'कार्रवाई पूर्ण' : 'Action Completed'}
          </div>
        </div>

        <div className="gov-card p-3.5 border-l-4 border-l-rose-500 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{language === 'hi' ? 'उच्च / गंभीर प्राथमिकता' : 'High Priority'}</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {criticalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'hi' ? 'जोखिम स्कोर में शामिल' : 'Factored in Risk Matrix'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="gov-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'ट्रैकिंग कोड, संस्थान या विवरण खोजें...'
                  : 'Search code, institute, or keywords...'
              }
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Institute Filter */}
          <div>
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="ALL">
                {language === 'hi' ? 'सभी संस्थान' : 'All Target Institutes'}
              </option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.district})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="ALL">{language === 'hi' ? 'सभी स्थितियां' : 'All Statuses'}</option>
              <option value="PENDING">{language === 'hi' ? 'लंबित (PENDING)' : 'Pending Review'}</option>
              <option value="INVESTIGATING">
                {language === 'hi' ? 'जांच जारी (INVESTIGATING)' : 'Under Investigation'}
              </option>
              <option value="ACTION_INITIATED">
                {language === 'hi' ? 'कार्रवाई प्रारंभ (ACTION INITIATED)' : 'Action Initiated'}
              </option>
              <option value="RESOLVED">{language === 'hi' ? 'निराकृत (RESOLVED)' : 'Resolved'}</option>
              <option value="REJECTED">{language === 'hi' ? 'खारिज (REJECTED)' : 'Rejected'}</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="ALL">{language === 'hi' ? 'सभी गंभीरता स्तर' : 'All Severities'}</option>
              <option value="CRITICAL">Critical (गंभीर)</option>
              <option value="HIGH">High (उच्च)</option>
              <option value="MEDIUM">Medium (मध्यम)</option>
              <option value="LOW">Low (निम्न)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold">
            {language === 'hi' ? 'शिकायतें लोड हो रही हैं...' : 'Loading beneficiary reports...'}
          </p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="gov-card p-12 text-center text-slate-500 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {language === 'hi' ? 'कोई शिकायत रिकॉर्ड नहीं मिला' : 'No Beneficiary Reports Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'hi'
              ? 'वर्तमान फ़िल्टर मानदंडों से मेल खाने वाली कोई रिपोर्ट उपलब्ध नहीं है।'
              : 'No complaints match the specified filter criteria.'}
          </p>
        </div>
      ) : viewTab === 'timeline' ? (
        /* Chronological Action Audit Timeline View */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-500/30 dark:border-blue-500/20 space-y-8 ml-2 sm:ml-4 py-2">
          {filteredComplaints
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((complaint) => {
              const isResolved = complaint.status === 'RESOLVED';
              const hasAction = Boolean(complaint.resolution_notes);

              return (
                <div key={complaint.id} className="relative group">
                  {/* Timeline Node Icon Marker */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                      isResolved
                        ? 'bg-emerald-500 border-white dark:border-slate-900 text-white'
                        : hasAction
                        ? 'bg-blue-600 border-white dark:border-slate-900 text-white'
                        : 'bg-amber-500 border-white dark:border-slate-900 text-white'
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : hasAction ? (
                      <Gavel className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Timeline Card */}
                  <div className="gov-card p-5 space-y-4 hover:border-slate-400 dark:hover:border-slate-600 transition-all">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-400">
                            {complaint.tracking_code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(complaint.tracking_code)}
                            title="Copy tracking code"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
                          >
                            {copiedCode === complaint.tracking_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {complaint.institute_name || `Institute #${complaint.institute_id}`}
                        </span>

                        {complaint.institute_district && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({complaint.institute_district}, {complaint.institute_state})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            complaint.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : complaint.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {complaint.severity}
                        </span>
                        <StatusBadge status={complaint.status} size="sm" />
                      </div>
                    </div>

                    {/* Event Step 1: Grievance Lodged */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                          <span>
                            {language === 'hi'
                              ? 'नागरिक / लाभार्थी शिकायत दर्ज'
                              : 'Citizen Grievance Lodged'}
                          </span>
                          <span className="text-slate-400 font-normal">({complaint.category})</span>
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(complaint.created_at).toLocaleString()}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        {complaint.is_anonymous ? (
                          <span className="flex items-center gap-1 text-slate-500 italic">
                            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Anonymous (Whistleblower Protection)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {complaint.complainant_name}
                            </span>
                            {complaint.complainant_contact && (
                              <span>({complaint.complainant_contact})</span>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        "{complaint.description}"
                      </p>
                    </div>

                    {/* Event Step 2: Department Directives / Resolution */}
                    {complaint.resolution_notes ? (
                      <div className="p-3.5 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                            <Gavel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>
                              {language === 'hi'
                                ? 'आधिकारिक विभागीय निर्देश एवं कार्रवाई'
                                : 'Official Statutory Directives & Action Taken'}
                            </span>
                          </span>
                          {complaint.resolved_at && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                              {language === 'hi' ? 'निराकरण तिथि: ' : 'Resolved: '}
                              {new Date(complaint.resolved_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                          {complaint.resolution_notes}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>
                          {language === 'hi'
                            ? 'विभागीय कार्रवाई लंबित: प्रारंभिक समीक्षा प्रतीक्षित।'
                            : 'Pending Action: Directives or field inquiry pending review by assigned officer.'}
                        </span>
                      </div>
                    )}

                    {/* Timeline Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenActionModal(complaint)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                      >
                        <Gavel className="w-3.5 h-3.5" />
                        <span>
                          {complaint.resolution_notes
                            ? language === 'hi'
                              ? 'कार्रवाई अद्यतन करें'
                              : 'Update Action'
                            : language === 'hi'
                            ? 'आधिकारिक कार्रवाई करें'
                            : 'Take Official Action'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDispatchInspection(complaint)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>
                          {language === 'hi' ? 'आकस्मिक निरीक्षण' : 'Dispatch Inspection'}
                        </span>
                      </button>

                      <Link
                        to={`/institutes/${complaint.institute_id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'संस्थान' : 'Institute'}</span>
                      </Link>

                      <Link
                        to={`/cctv`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'सीसीटीवी' : 'CCTV'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Standard / Historical Grid View */
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => {
            const isCriticalOrHigh =
              complaint.severity === 'CRITICAL' || complaint.severity === 'HIGH';

            return (
              <div
                key={complaint.id}
                className={`gov-card p-5 transition-all hover:border-slate-400 dark:hover:border-slate-600 ${
                  isCriticalOrHigh
                    ? 'border-l-4 border-l-rose-600'
                    : 'border-l-4 border-l-blue-600'
                }`}
              >
                {/* Header Row: Tracking Code, Institute, Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-400">
                        {complaint.tracking_code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(complaint.tracking_code)}
                        title="Copy tracking code"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
                      >
                        {copiedCode === complaint.tracking_code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {complaint.institute_name || `Institute #${complaint.institute_id}`}
                    </span>

                    {complaint.institute_district && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({complaint.institute_district}, {complaint.institute_state})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        complaint.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : complaint.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {complaint.severity}
                    </span>
                    {complaint.status === 'RESOLVED' && complaint.resolved_at && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>
                          {language === 'hi' ? 'निराकृत' : 'Resolved'}: {new Date(complaint.resolved_at).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>
                </div>

                {/* Complainant & Category Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-3 text-xs border-b border-slate-100 dark:border-slate-800/60">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {language === 'hi' ? 'शिकायत श्रेणी:' : 'Category:'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {complaint.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {language === 'hi' ? 'शिकायतकर्ता:' : 'Complainant:'}
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      {complaint.is_anonymous ? (
                        <span className="flex items-center gap-1 text-slate-500 italic">
                          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Anonymous (Whistleblower Protection)</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold">{complaint.complainant_name}</span>
                          {complaint.complainant_contact && (
                            <span className="text-slate-400 text-[11px]">
                              ({complaint.complainant_contact})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {language === 'hi' ? 'दर्ज करने की तिथि:' : 'Filed Timestamp:'}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(complaint.created_at).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                {/* Report Detailed Description */}
                <div className="py-3 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {language === 'hi' ? 'लाभार्थी अवलोकन / विवरण:' : 'Beneficiary Statement:'}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60 font-medium">
                    "{complaint.description}"
                  </p>
                </div>

                {/* Official Action & Resolution Box */}
                {complaint.resolution_notes ? (
                  <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Gavel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>
                          {language === 'hi'
                            ? 'आधिकारिक सरकारी कार्रवाई एवं आदेश:'
                            : 'Official Government Action & Resolution Order:'}
                        </span>
                      </span>
                      {complaint.resolved_at && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Resolved on: {new Date(complaint.resolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                      {complaint.resolution_notes}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      {language === 'hi'
                        ? 'कार्रवाई लंबित: इस शिकायत पर अभी तक कोई आधिकारिक आदेश या जांच दर्ज नहीं की गई है।'
                        : 'Action Pending: No official inquiry remarks or statutory orders have been entered yet.'}
                    </span>
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Action 1: Record Official Action */}
                  <button
                    onClick={() => handleOpenActionModal(complaint)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>
                      {complaint.resolution_notes
                        ? language === 'hi'
                          ? 'कार्रवाई अद्यतन करें'
                          : 'Update Action'
                        : language === 'hi'
                        ? 'आधिकारिक कार्रवाई करें'
                        : 'Take Official Action'}
                    </span>
                  </button>

                  {/* Action 2: Dispatch Surprise Inspection */}
                  <button
                    onClick={() => handleDispatchInspection(complaint)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>
                      {language === 'hi' ? 'आकस्मिक निरीक्षण भेजें' : 'Dispatch Inspection'}
                    </span>
                  </button>

                  {/* Action 3: View Institute Profile */}
                  <Link
                    to={`/institutes/${complaint.institute_id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'संस्थान प्रोफाइल' : 'Institute Profile'}</span>
                  </Link>

                  {/* Action 4: Live CCTV Inspection */}
                  <Link
                    to={`/cctv`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सीसीटीवी जांच' : 'CCTV Feeds'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Action Modal Dialog */}
      {actionModalOpen && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">
                  {language === 'hi'
                    ? 'आधिकारिक कार्रवाई एवं निर्णय दर्ज करें'
                    : 'Record Official Action & Statutory Orders'}
                </h3>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveAction} className="p-6 space-y-4 text-xs">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Summary Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-blue-700 dark:text-blue-400">
                  <span>{activeComplaint.tracking_code}</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {activeComplaint.category}
                  </span>
                </div>
                <div className="font-bold text-slate-800 dark:text-white">
                  {activeComplaint.institute_name}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] italic">
                  "{activeComplaint.description}"
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {language === 'hi' ? 'अद्यतन स्थिति का चयन करें *' : 'Update Grievance Status *'}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  <option value="PENDING">PENDING — Awaiting Initial Screening</option>
                  <option value="INVESTIGATING">
                    INVESTIGATING — Official Assigned / Field Inquiry Underway
                  </option>
                  <option value="ACTION_INITIATED">
                    ACTION_INITIATED — Statutory Show-Cause Notice / Directives Issued
                  </option>
                  <option value="RESOLVED">
                    RESOLVED — Grievance Redressed & Compliance Verified
                  </option>
                  <option value="REJECTED">
                    REJECTED — False Allegation / Outside Scheme Scope
                  </option>
                </select>
              </div>

              {/* Official Action Remarks / Directives */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {language === 'hi'
                    ? 'आधिकारिक कार्रवाई टिप्पणी एवं वैधानिक आदेश *'
                    : 'Official Action Taken & Statutory Orders *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'उदा. संस्थान प्रमुख को 48 घंटे में स्पष्टीकरण प्रस्तुत करने का कारण बताओ नोटिस जारी किया गया। क्षेत्रीय अधिकारी को भोजन गुणवत्ता जांच के निर्देश दिए गए।'
                      : 'e.g. Issued statutory show-cause notice under GFR Rule 150(2) to institute head. Designated PMU team to conduct unannounced food and attendance inspection.'
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  {language === 'hi'
                    ? 'यह टिप्पणी शिकायतकर्ता को उनके ट्रैकिंग कोड द्वारा प्रदर्शित होगी और जोखिम गणना को अद्यतन करेगी।'
                    : 'These remarks are immediately visible to the beneficiary via their tracking code and dynamically adjust institutional risk.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>
                    {actionSubmitting
                      ? language === 'hi'
                        ? 'दर्ज हो रहा है...'
                        : 'Saving Action...'
                      : language === 'hi'
                      ? 'कार्रवाई सुरक्षित करें'
                      : 'Save Official Action'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surprise Inspection Assignment Modal */}
      {inspectionModalOpen && inspectionTargetInstitute && (
        <InspectionAssignmentModal
          institute={inspectionTargetInstitute}
          isOpen={inspectionModalOpen}
          onClose={() => setInspectionModalOpen(false)}
          onSuccess={() => {
            fetchReports();
          }}
        />
      )}
    </div>
  );
};
