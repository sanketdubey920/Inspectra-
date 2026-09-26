import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute } from '../types';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { InspectionAssignmentModal } from '../components/InspectionAssignmentModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  ArrowRight,
  Compass,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Send,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'beneficiary') {
        navigate('/feedback', { replace: true });
      } else if (user.role === 'inspection_officer') {
        navigate('/inspector/inspections', { replace: true });
      } else if (user.role === 'institute_representative') {
        navigate(`/institutes/${user.institute_id || 1}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [, setSummary] = useState<any>(null);
  const [, setIsLoading] = useState<boolean>(true);

  // Top Filter Bar State
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('30d');
  const [lastUpdated, setLastUpdated] = useState<string>('2 min ago');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Selected institute for inspection assignment modal
  const [selectedForInspection, setSelectedForInspection] = useState<Institute | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [instData, riskData] = await Promise.all([
          api.institutes.list(),
          api.risk.getSummary(),
        ]);
        setInstitutes(instData.institutes);
        setSummary(riskData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('Just now');
    }, 500);
  };

  // Demo trend data for attendance comparison
  const attendanceTrendData = [
    { month: 'Apr', reported: 81, historical: 79 },
    { month: 'May', reported: 83, historical: 78 },
    { month: 'Jun', reported: 86, historical: 77 },
    { month: 'Jul', reported: 91, historical: 76 },
    { month: 'Aug', reported: 93, historical: 76 },
    { month: 'Sep', reported: 94, historical: 76 }, // Anomaly spike (+18% deviation)
  ];

  // Exact, realistic proportional counts for National Risk Distribution
  const riskDistributionData = [
    { name: language === 'hi' ? 'निम्न जोखिम' : 'Low Risk', count: 1234, fill: '#10B981' },
    { name: language === 'hi' ? 'मध्यम जोखिम' : 'Medium Risk', count: 2, fill: '#F59E0B' },
    { name: language === 'hi' ? 'उच्च जोखिम' : 'High Risk', count: 47, fill: '#F97316' },
    { name: language === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk', count: 1, fill: '#EF4444' },
  ];

  // State-wise High & Critical Risk data
  const stateComparisonData = [
    { state: 'Madhya Pradesh', count: 14 },
    { state: 'Uttar Pradesh', count: 12 },
    { state: 'Maharashtra', count: 9 },
    { state: 'Rajasthan', count: 7 },
    { state: 'Delhi NCR', count: 5 },
  ];

  // Filter high & critical institutes for table
  const prioritizedInstitutes = institutes.filter(
    (i) => i.risk?.risk_level === 'HIGH' || i.risk?.risk_level === 'CRITICAL'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('dashboardTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map', { state: { from: 'dashboard' } })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{t('openMonitoringMap')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Filter Bar (Compact, Professional Government Standard) */}
      <div className="gov-card px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Scope:</span>
          </div>

          {/* State */}
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">State: All States</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>

          {/* District */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">District: All Districts</option>
            <option value="Bhopal">Bhopal</option>
            <option value="Indore">Indore</option>
            <option value="Jabalpur">Jabalpur</option>
            <option value="Gwalior">Gwalior</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Institute Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Type: All Types</option>
            <option value="Residential Centre">Residential Centre</option>
            <option value="Day Care">Day Care</option>
            <option value="Special School">Special School</option>
            <option value="Rehabilitation">Rehabilitation</option>
            <option value="Vocational Training">Vocational Training</option>
          </select>

          {/* Risk Level */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Risk: All Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          {/* Date Range */}
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="30d">Date: Last 30 Days</option>
            <option value="90d">Date: Last 90 Days</option>
            <option value="fy25">Current FY (2025-26)</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Subtle Last Updated & Refresh */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-auto">
          <span>Last updated: {lastUpdated}</span>
          <button
            onClick={handleRefresh}
            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Exactly 4 KPI Cards (Wider, Uniform Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={language === 'hi' ? 'कुल संस्थान' : 'Total Institutes'}
          value="1,284"
          icon={Building2}
          variant="slate"
          subtitle={language === 'hi' ? 'सत्यापित संस्थान' : 'All verified institutions'}
        />
        <KpiCard
          title={language === 'hi' ? 'उच्च जोखिम' : 'High Risk'}
          value="47"
          icon={AlertTriangle}
          variant="amber"
          subtitle={language === 'hi' ? 'सक्रिय निगरानी आवश्यक' : 'Requires monitoring'}
        />
        <KpiCard
          title={language === 'hi' ? 'गंभीर जोखिम' : 'Critical Risk'}
          value="1"
          icon={ShieldAlert}
          variant="rose"
          subtitle={language === 'hi' ? 'तत्काल कार्रवाई अपेक्षित' : 'Immediate action required'}
        />
        <KpiCard
          title={language === 'hi' ? 'लंबित निरीक्षण' : 'Pending Inspections'}
          value="31"
          icon={ClipboardCheck}
          variant="blue"
          subtitle={language === 'hi' ? 'सक्रिय पीएमयू अनुसूची' : 'Scheduled audits'}
        />
      </div>

      {/* 3, 4, 5. Main Charts Row (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: National Risk Distribution */}
        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  National Risk Distribution
                </h3>
                <p className="text-[11px] text-slate-400">
                  Classification of 1,284 verified institutions
                </p>
              </div>
            </div>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionData} margin={{ top: 18, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} institutes`, 'Count']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]} 
                    label={{ position: 'top', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`risk-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clear Proportional Value Pills */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-1.5 text-center">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60">
              <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase">Low</div>
              <div className="font-bold font-mono text-xs text-emerald-800 dark:text-emerald-300">1,234</div>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60">
              <div className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Med</div>
              <div className="font-bold font-mono text-xs text-amber-800 dark:text-amber-300">2</div>
            </div>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/60">
              <div className="text-[9px] text-orange-700 dark:text-orange-400 font-semibold uppercase">High</div>
              <div className="font-bold font-mono text-xs text-orange-800 dark:text-orange-300">47</div>
            </div>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/60">
              <div className="text-[9px] text-red-700 dark:text-red-400 font-semibold uppercase">Critical</div>
              <div className="font-bold font-mono text-xs text-red-800 dark:text-red-300">1</div>
            </div>
          </div>
        </div>

        {/* Chart 2: Attendance Deviation Trend */}
        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t('chartAttendanceTitle')}
                </h3>
                <p className="text-[11px] text-slate-400">{t('chartAttendanceSub')}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                +18% deviation from baseline
              </span>
            </div>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={26}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    name="Reported Attendance" 
                    stroke="#EF4444" 
                    strokeWidth={2.5} 
                    dot={{ r: 4 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    name="Historical Baseline" 
                    stroke="#64748b" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={{ r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Historical Baseline: <strong>76%</strong></span>
            <span className="text-red-600 dark:text-red-400 font-semibold">Peak Anomaly: 94% (September)</span>
          </div>
        </div>

        {/* Chart 3: High & Critical Risk by State */}
        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  High & Critical Risk by State
                </h3>
                <p className="text-[11px] text-slate-400">
                  Institutions requiring priority attention
                </p>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All States →</span>
              </button>
            </div>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={stateComparisonData} 
                  layout="vertical" 
                  margin={{ top: 10, right: 30, left: 15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="state" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} Centers`, 'High/Critical Risk']}
                  />
                  <Bar 
                    dataKey="count" 
                    name="High/Critical Risk Centers" 
                    fill="#0284c7" 
                    radius={[0, 4, 4, 0]} 
                    label={{ position: 'right', fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Highest Concentration: <strong>Madhya Pradesh (14)</strong></span>
            <span>National Total: <strong>47 High / 12 Critical</strong></span>
          </div>
        </div>
      </div>

      {/* 6. Priority Actions Card (Compact, Decision Support Focus) */}
      <div className="gov-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Priority Actions</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Actionable operational flags requiring authorized official intervention
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 self-start sm:self-center">
            3 Active Intervention Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1: Critical Safety Compliance */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  Critical Safety Compliance
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  12 institutes
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/alerts')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review</span>
            </button>
          </div>

          {/* Row 2: Pending / Overdue Inspections */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  Pending / Overdue Inspections
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  31 institutes
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/inspections')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>
          </div>

          {/* Row 3: Attendance Anomaly */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  Attendance Anomaly
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  18 institutes
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/cctv')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prioritized Institutes Table (Spotlight on ABC Bhopal) */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#0284c7]" />
              <span>{t('tableDiscrepancyTitle')}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('tableDiscrepancySub')}
            </p>
          </div>

          <button
            onClick={() => navigate('/institutes?risk_level=HIGH')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewAllHighRisk')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('thInstName')}</th>
                <th className="px-4 py-3">{t('thLocation')}</th>
                <th className="px-4 py-3">{t('thReportedHist')}</th>
                <th className="px-4 py-3">{t('thComplaints')}</th>
                <th className="px-4 py-3">{t('thRiskAssess')}</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prioritizedInstitutes.map((inst) => (
                <tr
                  key={inst.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    inst.id === 1 ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{inst.name}</span>
                      {inst.id === 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-bold border border-orange-300 dark:border-orange-800">
                          {t('spotlightFocus')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Reg: {inst.registration_number} | {inst.scheme}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {inst.district}
                    </div>
                    <div className="text-[11px] text-slate-400">{inst.state}</div>
                  </td>

                  <td className="px-4 py-3.5 font-mono">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {inst.reported_attendance}%
                    </span>
                    <span className="text-slate-400"> / {inst.historical_attendance}%</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#0284c7]">
                      {inst.complaints_count} {t('registeredCount')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <RiskBadge
                      score={inst.risk?.score}
                      level={inst.risk?.risk_level}
                      size="sm"
                    />
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setSelectedForInspection(inst)}
                      className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {t('btnAssignInspection')}
                    </button>
                    <button
                      onClick={() => navigate(`/institutes/${inst.id}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {t('btnViewProfile')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Assignment Modal */}
      {selectedForInspection && (
        <InspectionAssignmentModal
          institute={selectedForInspection}
          isOpen={!!selectedForInspection}
          onClose={() => setSelectedForInspection(null)}
          onSuccess={() => {
            alert('Surprise inspection successfully assigned! Notification dispatched to Officer Rajesh Kumar (PMU Team 04).');
            navigate('/inspections');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
