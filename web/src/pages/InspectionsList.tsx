import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Inspection } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import { ClipboardCheck, Search, Filter, Eye, ArrowRight, ArrowLeft } from 'lucide-react';

export const InspectionsList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTheme();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    api.inspections.list()
      .then((res) => setInspections(res.inspections))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = inspections.filter((i) => {
    return statusFilter === 'ALL' || i.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('inspManagementTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('inspManagementSubtitle')}
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
      <div className="gov-card p-4 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">{t('filterStatus')}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="SUBMITTED">SUBMITTED (Pending Review)</option>
            <option value="REVIEWED">REVIEWED</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {t('showingInstitutes')}: <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">{t('thInspectionId')}</th>
                <th className="px-4 py-3">{t('thInstName')}</th>
                <th className="px-4 py-3">{t('thAssignedOfficer')}</th>
                <th className="px-4 py-3">{t('thGpsLock')}</th>
                <th className="px-4 py-3">{t('filterStatus')}</th>
                <th className="px-4 py-3">{t('thRiskAssess')}</th>
                <th className="px-4 py-3 text-right">{t('thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No inspections match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        #{insp.id} — {insp.inspection_type}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Priority: <strong className="text-[#0284c7]">{insp.priority}</strong>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {insp.institute_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{insp.institute_district}, {insp.institute_state}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {insp.inspector_name || 'PMU Officer'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Date: {new Date(insp.scheduled_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {insp.gps_verified ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          ✓ Verified ({insp.gps_distance_meters || 24}m)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Pending arrival</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={insp.status} size="sm" />
                    </td>

                    <td className="px-4 py-3.5">
                      {insp.final_status ? (
                        <StatusBadge status={insp.final_status} size="sm" />
                      ) : (
                        <span className="text-[11px] text-slate-400">In-progress</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          if (user?.role === 'inspection_officer' && (insp.status === 'ASSIGNED' || insp.status === 'IN_PROGRESS')) {
                            navigate(`/inspector/inspections/${insp.id}`);
                          } else {
                            navigate(`/official/inspections/${insp.id}`);
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs transition-colors cursor-pointer"
                      >
                        {user?.role === 'inspection_officer' && (insp.status === 'ASSIGNED' || insp.status === 'IN_PROGRESS')
                          ? 'Conduct Inspection'
                          : insp.status === 'SUBMITTED' ? 'Review Report' : 'View Details'}
                      </button>
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
