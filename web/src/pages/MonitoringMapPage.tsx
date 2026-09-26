import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { Institute } from '../types';
import { Map } from '../components/Map';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getDashboardRoute } from '../utils/navigation';
import { MapPin, ArrowLeft } from 'lucide-react';

export const MonitoringMapPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTheme();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine if the user opened the map from Home or Dashboard
  const isFromHome =
    location.state?.from === 'home' ||
    (!isAuthenticated && location.state?.from !== 'dashboard');

  const handleBack = () => {
    if (isFromHome) {
      navigate('/');
    } else {
      navigate(getDashboardRoute(user, location.pathname));
    }
  };

  useEffect(() => {
    api.institutes.list()
      .then((res) => setInstitutes(res.institutes))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('mapPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('mapPageSubtitle')}
          </p>
        </div>

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs self-start sm:self-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isFromHome ? t('btnBackHome') : t('btnBackDashboard')}</span>
        </button>
      </div>

      <div className="h-[calc(100vh-12rem)] min-h-[600px]">
        {isLoading ? (
          <div className="gov-card h-full flex items-center justify-center text-xs text-slate-400">
            {t('mapLoading')}
          </div>
        ) : (
          <Map institutes={institutes} />
        )}
      </div>
    </div>
  );
};
