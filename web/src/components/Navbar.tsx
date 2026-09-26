import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell, Sun, Moon, Languages, LogOut, User as UserIcon, Menu, CheckCheck, 
  ChevronDown, ArrowRight, ShieldCheck, Compass, FileText, CheckCircle2, Lock, LogIn
} from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { getDashboardRoute, getDashboardLabel } from '../utils/navigation';

export const Navbar: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [fontSizeClass, setFontSizeClass] = useState<string>('normal');

  useEffect(() => {
    if (isAuthenticated) {
      api.notifications.list()
        .then((res) => {
          setNotifications(res.notifications);
          setUnreadCount(res.unread_count);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'department_official': return language === 'hi' ? 'निदेशक (निगरानी)' : 'Director (Monitoring)';
      case 'inspection_officer': return language === 'hi' ? 'पीएमयू निरीक्षण अधिकारी' : 'PMU Inspection Officer';
      case 'institute_representative': return language === 'hi' ? 'संस्थान प्रभारी' : 'Institution In-charge';
      case 'beneficiary': return language === 'hi' ? 'नागरिक / लाभार्थी' : 'Citizen / Beneficiary';
      default: return language === 'hi' ? 'अधिकृत उपयोगकर्ता' : 'Authorized User';
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-sm border-b border-slate-200 dark:border-slate-800 w-full">
      {/* Tier 1: Topmost Official Utility Bar (Charcoal Gray) */}
      <div className="bg-[#1e293b] dark:bg-[#0f172a] text-slate-100 text-xs sm:text-sm px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between border-b border-slate-700/60 w-full">
        <div className="flex items-center gap-2">
          <img src="/indian_flag.png" alt="India Flag" className="w-5 h-3.5 object-cover rounded-xs border border-white/30 shadow-xs" />
          <span className="font-semibold text-slate-100 tracking-wide">
            {t('ministryHeader')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Bilingual Switcher */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer border border-white/20 shadow-2xs"
            title={t('langToggleTitle')}
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span className={language === 'hi' ? 'font-bold text-amber-300' : 'text-slate-200'}>हिन्दी</span>
            <span className="text-slate-400">/</span>
            <span className={language === 'en' ? 'font-bold text-amber-300' : 'text-slate-200'}>English</span>
          </button>

          <span className="text-slate-400">|</span>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-200" />}
          </button>
        </div>
      </div>

      {/* Tier 2: Main Brand Header Banner (Full Screen Fitting, Clean Alignment) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-1.5 sm:py-2 px-3 sm:px-6 lg:px-8 w-full">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left Brand: Government of India & Ministry */}
          <div className="flex items-center gap-3.5 shrink-0">
            {isAuthenticated && onMenuToggle && (
              <button 
                onClick={onMenuToggle}
                className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3">
              {/* Ashoka Lion Capital Official Emblem */}
              <div className="h-16 sm:h-20 w-auto flex items-center justify-center shrink-0">
                <img 
                  src="/emblem_india.png" 
                  alt="State Emblem of India - Satyamev Jayate" 
                  className="h-full w-auto object-contain filter contrast-150 brightness-90 drop-shadow-md"
                />
              </div>

              <div>
                <h1 className="font-serif font-bold text-base sm:text-lg lg:text-xl tracking-tight text-[#0284c7] dark:text-[#38bdf8] leading-tight">
                  {t('govOfIndia')}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight mt-0.5">
                  {t('ministryTitle')}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight font-medium mt-0.5">
                  {t('deptTitle')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Brand: Council Devanagari Title, INSPECTRA & Official Logo */}
          <div className="hidden lg:flex items-center gap-3 text-right shrink-0">
            <div>
              <div className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                {t('councilHindiTitle')}
              </div>
              <div className="font-sans font-bold text-[11px] sm:text-xs text-slate-800 dark:text-slate-200 tracking-tight leading-tight mt-0.5">
                {t('councilEngTitle')}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                {t('councilStatutorySub')}
              </div>
            </div>

            {/* Inspectra Official Shield Logo */}
            <div className="h-13 sm:h-16 w-auto flex items-center justify-center shrink-0">
              <img 
                src="/inspectra_logo.png" 
                alt="INSPECTRA Logo" 
                className="h-full w-auto object-contain filter contrast-125 brightness-95 drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Main Navigation Ribbon (Charcoal Gray - Centered Navigation Ribbon) */}
      <div className="bg-[#1e293b] dark:bg-[#0f172a] text-white px-3 sm:px-6 lg:px-8 shadow-sm w-full">
        <div className="w-full flex items-center justify-between relative h-11 sm:h-12">
          {/* Left balance spacer matching right container width for true optical centering */}
          <div className="hidden lg:flex items-center min-w-[140px] shrink-0" />

          {/* Centered Navigation Items */}
          <nav className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-semibold tracking-normal overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                location.pathname === '/' ? 'bg-white/20 text-white font-bold shadow-2xs' : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('navHome')}
            </button>

            <button
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('gia-schemes')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#gia-schemes');
                }
              }}
              className="px-3 py-1.5 rounded-md text-blue-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>{t('navSchemes')}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            <button
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('guidelines')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#guidelines');
                }
              }}
              className="px-3 py-1.5 rounded-md text-blue-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>{t('navGuidelines')}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            <Link
              to="/map"
              state={{ from: location.pathname.startsWith('/dashboard') ? 'dashboard' : 'home' }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                location.pathname === '/map' ? 'bg-white/20 text-white font-bold shadow-2xs' : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('navMap')}</span>
            </Link>

            {/* About Us button placed to the RIGHT side of the Map button */}
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#about');
                }
              }}
              className="px-3 py-1.5 rounded-md text-blue-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>{t('navAbout')}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>
          </nav>

          {/* Right Action: Moderate and Highlighted Login Button with LogIn icon (Lightened 1 point to #f97316) */}
          <div className="shrink-0 flex items-center justify-end min-w-[140px]">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardRoute(user, location.pathname)}
                  className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{getDashboardLabel(user, language)}</span>
                </Link>

                {/* Notifications with interactive popover */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-1.5 rounded-md text-blue-100 hover:text-white relative cursor-pointer"
                    title={language === 'hi' ? 'सूचनाएं' : 'Notifications'}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-800 dark:text-slate-200">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-xs">
                            {language === 'hi' ? 'विभागीय सूचनाएं' : 'Official Notifications'}
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-[10px] font-bold">
                              {unreadCount} {language === 'hi' ? 'नई' : 'new'}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                          >
                            {language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            {language === 'hi' ? 'कोई नई सूचना नहीं है' : 'No new notifications'}
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setShowNotifs(false);
                                if (n.link) navigate(n.link);
                              }}
                              className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-2.5 ${
                                !n.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                n.notification_type === 'CRITICAL' || n.notification_type === 'WARNING'
                                  ? 'bg-rose-500 animate-pulse'
                                  : 'bg-blue-500'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {n.title}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                  {n.message}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-1 font-mono">
                                  {n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
                        <Link
                          to="/alerts"
                          onClick={() => setShowNotifs(false)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {language === 'hi' ? 'सभी अलर्ट एवं सिग्नल देखें →' : 'View All Alerts & Signals →'}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 rounded-md text-blue-100 hover:text-red-300 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-md bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0 border border-sky-300/40"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>{t('navLogin')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
