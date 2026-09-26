import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Institute } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import { Building2, Search, Filter, ArrowRight, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';

export const InstitutesList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRisk = searchParams.get('risk_level') || '';

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [search, setSearch] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>(initialRisk);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.institutes.list()
      .then((res) => setInstitutes(res.institutes))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const states = Array.from(new Set(institutes.map((i) => i.state)));

  const filtered = institutes.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.district.toLowerCase().includes(search.toLowerCase()) ||
      inst.registration_number.toLowerCase().includes(search.toLowerCase());

    const matchesState = stateFilter === 'ALL' || inst.state === stateFilter;
    const matchesRisk = !riskFilter || inst.risk?.risk_level === riskFilter.toUpperCase();

    return matchesSearch && matchesState && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('instDirTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('instDirSubtitle')}
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

      {/* Filter Bar */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('searchPlaceholderInst')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-72 sm:w-80"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="ALL">{t('mapAllStates')}</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
          >
            <option value="">{t('mapAllRisks')}</option>
            <option value="CRITICAL">{t('mapLegendCritical')}</option>
            <option value="HIGH">{t('mapLegendHigh')}</option>
            <option value="MEDIUM">{t('mapLegendMedium')}</option>
            <option value="LOW">{t('mapLegendLow')}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {t('showingInstitutes')}: <strong>{filtered.length}</strong> / {institutes.length}
        </div>
      </div>

      {/* Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('thInstName')}</th>
                <th className="px-4 py-3">Reg. & {t('thScheme')}</th>
                <th className="px-4 py-3">{t('thLocation')}</th>
                <th className="px-4 py-3">{t('instContactHead')}</th>
                <th className="px-4 py-3">{t('thAttendanceTrend')}</th>
                <th className="px-4 py-3">{t('thRiskAssess')}</th>
                <th className="px-4 py-3 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {inst.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {inst.institute_type}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {inst.registration_number}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{inst.scheme}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {inst.district}
                    </div>
                    <div className="text-[11px] text-slate-400">{inst.state}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-slate-800 dark:text-slate-200">{inst.incharge}</div>
                    <div className="text-[11px] text-slate-400">{inst.contact}</div>
                  </td>

                  <td className="px-4 py-3.5 font-mono">
                    <span className={inst.reported_attendance > 90 ? 'font-bold text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}>
                      {inst.reported_attendance}%
                    </span>
                    <span className="text-slate-400"> / {inst.historical_attendance}%</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <RiskBadge
                      score={inst.risk?.score}
                      level={inst.risk?.risk_level}
                      size="sm"
                    />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/institutes/${inst.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('btnViewFullDossier')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
