import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Institute, CCTVCamera } from '../types';
import { CCTVCard } from '../components/CCTVCard';
import { CCTVModal } from '../components/CCTVModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/navigation';
import { playNotificationChime } from '../utils/sound';
import { 
  Video, 
  Shield, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  Bell, 
  Maximize2, 
  Send, 
  X, 
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export const CCTVPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTheme();
  const { user } = useAuth();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<number>(1);
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enlargedCamera, setEnlargedCamera] = useState<CCTVCamera | null>(null);

  // Active Anomaly Notification Toast & Banner State
  const [activeAnomaly, setActiveAnomaly] = useState<{
    camera: CCTVCamera;
    notifiedAt: string;
    dismissed: boolean;
  } | null>(null);

  const [notificationSuccessMsg, setNotificationSuccessMsg] = useState<string | null>(null);
  const hasNotifiedRef = useRef<boolean>(false);

  useEffect(() => {
    api.institutes.list().then((res) => {
      setInstitutes(res.institutes);
      if (res.institutes.length > 0) {
        setSelectedInstId(res.institutes[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedInstId) {
      setIsLoading(true);
      api.cctv.getInstituteCameras(selectedInstId)
        .then((res) => {
          setCameras(res.cameras);

          // Check if any camera has unusual inactivity / anomaly
          const anomalyCam = res.cameras.find((c: CCTVCamera) => c.unusual_inactivity);
          if (anomalyCam && !hasNotifiedRef.current) {
            triggerAnomalyNotification(anomalyCam);
            hasNotifiedRef.current = true;
          }
        })
        .catch(() => setCameras([]))
        .finally(() => setIsLoading(false));
    }
  }, [selectedInstId]);

  const selectedInstitute = institutes.find((i) => i.id === selectedInstId);

  // Trigger Notification for Unusual Activity / Inactivity
  const triggerAnomalyNotification = (cam: CCTVCamera) => {
    // 1. Play soft audio chime
    playNotificationChime();

    // 2. Set active anomaly state for visual toast banner
    setActiveAnomaly({
      camera: cam,
      notifiedAt: new Date().toLocaleTimeString(),
      dismissed: false
    });

    // 3. Register notification in official notification registry
    const instName = selectedInstitute?.name || 'Authorized Facility';
    const notifTitle = language === 'hi' 
      ? `🚨 असामान्य निष्क्रियता चेतावनी: ${cam.room}`
      : `🚨 Unusual Inactivity Alert: ${cam.room}`;
    
    const notifMessage = language === 'hi'
      ? `${instName} (${cam.room}) पर सक्रिय समय के दौरान केवल ${cam.activity_level}% गतिविधि एवं 0 उपस्थिति पाई गई (मस्टर रोल पर 25 अपेक्षित)।`
      : `Severe attendance drop: 0 optical occupants detected (${cam.activity_level}% activity) at ${instName} (${cam.room}) against 25 expected on biometric muster roll.`;

    api.notifications.create({
      title: notifTitle,
      message: notifMessage,
      notification_type: 'CRITICAL',
      link: '/cctv'
    }).catch(() => {
      // Graceful fallback for demo or unauthenticated state
    });
  };

  // Test / Simulate Trigger Anomaly Alert on demand
  const handleSimulateAlert = () => {
    const targetCam = cameras.find((c) => c.unusual_inactivity) || cameras[0];
    if (targetCam) {
      triggerAnomalyNotification(targetCam);
      setNotificationSuccessMsg(t('cctvSimulateAnomalySuccess'));
      setTimeout(() => setNotificationSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Back to Dashboard Button & Facility Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-600 shrink-0" />
            <span>{t('cctvPageTitle')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('cctvPageSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
          {/* Back to Dashboard Button */}
          <button
            type="button"
            onClick={() => navigate(getDashboardRoute(user))}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('btnBackDashboard')}</span>
          </button>

          {/* Test / Simulate Anomaly Notification Button */}
          <button
            type="button"
            onClick={handleSimulateAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
            title="Simulate CCTV Unusual Activity Detection Alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            <span>{t('cctvBtnSimulateAnomaly')}</span>
          </button>

          {/* Institute Selector & Domain Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">{t('cctvFacilityLabel')}</span>
            <select
              value={selectedInstId}
              onChange={(e) => {
                hasNotifiedRef.current = false;
                setSelectedInstId(Number(e.target.value));
              }}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
            >
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.district})
                </option>
              ))}
            </select>

            {/* Dynamic Domain Badge */}
            {selectedInstitute && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-2xs flex items-center gap-1.5 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                <SlidersHorizontal className="w-3 h-3 text-blue-500" />
                <span>{selectedInstitute.institute_type || selectedInstitute.scheme}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* High-Impact Statutory Anomaly Notification Banner & Toast */}
      {activeAnomaly && !activeAnomaly.dismissed && (
        <div className="p-4 bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500/80 rounded-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-rose-600 text-white tracking-wider">
                  STATUTORY ALERT • GFR 150(2)
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  {t('cctvAnomalyDetectedHeader')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({activeAnomaly.notifiedAt})
                </span>
              </div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                {t('cctvAnomalyBannerText')
                  .replace('{instName}', selectedInstitute?.name || 'Facility')
                  .replace('{room}', `${activeAnomaly.camera.room} - ${activeAnomaly.camera.camera_name}`)
                  .replace('{level}', activeAnomaly.camera.activity_level.toString())}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1">
                <span>Observed Count: <strong className="text-rose-600 dark:text-rose-400">{activeAnomaly.camera.occupancy_count} Persons</strong></span>
                <span>•</span>
                <span>Biometric Muster Target: <strong>22 Persons</strong></span>
                <span>•</span>
                <span>Telemetry Deviation: <strong className="text-rose-600 dark:text-rose-400">-85% Drop</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons on notification banner */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
            <button
              type="button"
              onClick={() => setEnlargedCamera(activeAnomaly.camera)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{t('cctvBtnInvestigate')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/inspections')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('cctvBtnDispatchInsp')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAnomaly((prev) => prev ? { ...prev, dismissed: true } : null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('cctvBtnDismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Simulated notification feedback toast */}
      {notificationSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">CHIME PLAYED • NAVBAR BELL UPDATED</span>
        </div>
      )}

      {/* Integration Standard Advisory */}
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block uppercase tracking-wider text-[10px] text-blue-700 dark:text-blue-400">
            {t('cctvNoticeTitle')}
          </span>
          <span>
            {t('cctvNoticeText')}
          </span>
        </div>
      </div>

      {/* Cameras Grid with Real Indian Looping Videos and AI Detections */}
      {isLoading ? (
        <div className="gov-card p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span>{t('cctvConnecting')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((cam) => (
            <CCTVCard 
              key={cam.id} 
              camera={cam} 
              instituteName={selectedInstitute?.name}
              instituteType={selectedInstitute?.institute_type}
              onEnlarge={(targetCam) => setEnlargedCamera(targetCam)}
            />
          ))}
        </div>
      )}

      {/* Enlarged Full-Screen Video Modal */}
      {enlargedCamera && (
        <CCTVModal
          camera={enlargedCamera}
          instituteName={selectedInstitute?.name}
          instituteType={selectedInstitute?.institute_type}
          onClose={() => setEnlargedCamera(null)}
          onBackToDashboard={() => navigate(getDashboardRoute(user))}
        />
      )}
    </div>
  );
};
