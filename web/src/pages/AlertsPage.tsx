import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import { AlertTriangle, ShieldAlert, ArrowRight, Video, FileWarning, CheckCircle, ArrowLeft } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.alerts.list()
      .then((res) => setAlerts(res.alerts))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = alerts.filter((a) => {
    return severityFilter === 'ALL' || a.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
            <span>{t('alertsPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('alertsPageSubtitle')}
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

          {/* Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
          >
            <option value="ALL">{t('alertsAllSeverities')}</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="gov-card p-12 text-center text-xs text-slate-400">
            {t('alertsNoActive')}
          </div>
        ) : (
          filtered.map((al) => {
            let borderColor = 'border-amber-200 dark:border-amber-800';
            let badgeColor = 'bg-amber-100 text-amber-800';
            if (al.severity === 'CRITICAL') {
              borderColor = 'border-red-300 dark:border-red-900 bg-red-50/20';
              badgeColor = 'bg-red-100 text-red-800 font-bold';
            } else if (al.severity === 'HIGH') {
              borderColor = 'border-orange-300 dark:border-orange-900';
              badgeColor = 'bg-orange-100 text-orange-800 font-bold';
            }

            return (
              <div
                key={al.id}
                className={`gov-card p-4 border-l-4 ${borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${badgeColor}`}>
                      {al.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Category: {al.category}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {al.title}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] max-w-2xl">
                    {al.description}
                  </p>
                  <div className="text-[10px] text-slate-400">
                    {t('alertsAffectedCenter')} <strong>{al.institute_name}</strong> • {t('alertsTriggeredAt')} {new Date(al.timestamp).toLocaleTimeString()} IST
                  </div>
                </div>

                <button
                  onClick={() => navigate(al.link || `/institutes/${al.institute_id}`)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{t('btnViewFullDossier')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
