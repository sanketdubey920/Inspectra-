import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import { FileSpreadsheet, Download, Filter, Search, ArrowLeft } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.reports.getSummary()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = data.filter((item) => {
    return (
      !search ||
      item.institute_name.toLowerCase().includes(search.toLowerCase()) ||
      item.state.toLowerCase().includes(search.toLowerCase()) ||
      item.scheme.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('reportsPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('reportsPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => navigate(getDashboardRoute(user))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBackDashboard')}</span>
          </button>

          <a
            href={api.reports.getExportCsvUrl()}
            download="inspectra_institutes_report.csv"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg text-xs shadow transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('reportsBtnExportCsv')}</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-4 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60">
        <input
          type="text"
          placeholder={t('reportsSearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-72 sm:w-80"
        />
        <span className="text-xs text-slate-500">
          {t('showingInstitutes')}: <strong>{filtered.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('reportsThInstitute')}</th>
                <th className="px-4 py-3">{t('reportsThStateDist')}</th>
                <th className="px-4 py-3">{t('reportsThScheme')}</th>
                <th className="px-4 py-3">{t('reportsThAttendance')}</th>
                <th className="px-4 py-3">{t('caThTimeline')}</th>
                <th className="px-4 py-3">{t('reportsThRiskScore')}</th>
                <th className="px-4 py-3">{t('thScheduledDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((row) => (
                <tr key={row.institute_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {row.institute_name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {row.district}, {row.state}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.scheme}</td>
                  <td className="px-4 py-3 font-mono font-bold">
                    {row.reported_attendance}% <span className="text-slate-400 font-normal">/ {row.historical_attendance}%</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0284c7]">
                    {row.pending_actions} {t('drawerActive')}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge score={row.risk_score} level={row.risk_level} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.last_inspection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
