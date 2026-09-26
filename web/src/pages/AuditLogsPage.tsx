import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { History, Shield, Filter, Search, ArrowLeft } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.audit.list()
      .then((res) => setLogs(res.audit_logs))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    return actionFilter === 'ALL' || l.action === actionFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('auditPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('auditPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBackDashboard')}</span>
          </button>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
          >
            <option value="ALL">{t('auditAllActions')}</option>
            <option value="LOGIN">LOGIN</option>
            <option value="INSPECTION_ASSIGNED">INSPECTION_ASSIGNED</option>
            <option value="GPS_VERIFIED">GPS_VERIFIED</option>
            <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED</option>
            <option value="REPORT_SUBMITTED">REPORT_SUBMITTED</option>
            <option value="CORRECTIVE_ACTION_CREATED">CORRECTIVE_ACTION_CREATED</option>
            <option value="CORRECTIVE_ACTION_RESOLVED">CORRECTIVE_ACTION_RESOLVED</option>
          </select>
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('auditThTimestamp')}</th>
                <th className="px-4 py-3">{t('auditThAction')}</th>
                <th className="px-4 py-3">{t('auditThUserRole')}</th>
                <th className="px-4 py-3">Entity Reference</th>
                <th className="px-4 py-3">{t('auditThDetails')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No logs found.</td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.user_name || 'System / AI'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{log.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-lg">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
