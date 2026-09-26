import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  ClipboardCheck,
  AlertTriangle,
  Video,
  FileSpreadsheet,
  History,
  CheckSquare,
  ShieldCheck,
  Send,
  UserCheck,
  MessageSquareWarning,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { language, t } = useTheme();

  const officialLinks = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/map', label: t('monitoringMap'), icon: MapPin },
    { to: '/institutes', label: t('institutes'), icon: Building2 },
    { to: '/inspections', label: t('inspections'), icon: ClipboardCheck },
    { to: '/corrective-actions', label: t('correctiveActions'), icon: CheckSquare },
    { to: '/cctv', label: t('cctvMonitoring'), icon: Video },
    { to: '/alerts', label: t('alerts'), icon: AlertTriangle },
    { to: '/reports', label: t('reports'), icon: FileSpreadsheet },
    { to: '/beneficiary-reports', label: t('beneficiaryReports'), icon: MessageSquareWarning },
  ];

  const inspectorLinks = [
    { to: '/inspector/inspections', label: t('assignedInspections'), icon: ClipboardCheck },
    { to: '/inspector/history', label: t('inspectionHistory'), icon: History },
    { to: '/map', label: t('facilityMap'), icon: MapPin },
  ];

  const instituteLinks = [
    { to: `/institutes/${user?.institute_id || 1}`, label: t('instituteProfile'), icon: Building2 },
    { to: '/institute/attendance', label: t('submitAttendance'), icon: UserCheck },
    { to: '/institute/corrective-actions', label: t('correctiveActionResponse'), icon: CheckSquare },
  ];

  const beneficiaryLinks = [
    { to: '/feedback', label: language === 'hi' ? 'लाभार्थी कल्याण एवं शिकायतें' : 'Beneficiary Portal & Reports', icon: LayoutDashboard },
    { to: '/map', label: t('monitoringMap'), icon: MapPin },
  ];

  let links = officialLinks;
  if (user?.role === 'inspection_officer') links = inspectorLinks;
  if (user?.role === 'institute_representative') links = instituteLinks;
  if (user?.role === 'beneficiary') links = beneficiaryLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-4 left-0 z-30 h-[calc(100vh-4rem)] md:h-[calc(100vh-6.5rem)] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between py-4 px-3 shrink-0 shadow-xs overflow-y-auto`}
      >
        <div>
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {user?.role === 'department_official' 
              ? t('sidebarOfficialCommand') 
              : user?.role === 'inspection_officer' 
              ? t('sidebarFieldInspector') 
              : user?.role === 'beneficiary'
              ? (language === 'hi' ? 'नागरिक / लाभार्थी पोर्टल' : 'Citizen & Beneficiary Portal')
              : t('sidebarInstitutePortal')}
          </div>

          <nav className="space-y-1 mt-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  state={{ from: 'dashboard' }}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-l-4 border-blue-600'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Human in the loop AI card - compact */}
        <div className="p-2.5 mt-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 mb-1 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>{t('decisionSupportPolicy')}</span>
          </div>
          <p className="leading-snug text-[10px] text-slate-500 dark:text-slate-400">
            Automated telemetry flags statistical anomalies. All flagged actions require official verification.
          </p>
        </div>
      </aside>
    </>
  );
};
