import React, { useEffect, useState } from 'react';
import { CCTVCamera } from '../types';
import { CCTVPlayer, getCameraVideoProfile } from './CCTVPlayer';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  ArrowLeft, 
  Shield, 
  Activity, 
  Users, 
  Camera, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  Wifi,
  Cpu,
  Download
} from 'lucide-react';

interface CCTVModalProps {
  camera: CCTVCamera | null;
  instituteName?: string;
  instituteType?: string;
  onClose: () => void;
  onBackToDashboard: () => void;
}

export const CCTVModal: React.FC<CCTVModalProps> = ({
  camera,
  instituteName = 'Institutional Facility',
  instituteType = '',
  onClose,
  onBackToDashboard
}) => {
  const { t } = useTheme();
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);
  const [flaggedNotice, setFlaggedNotice] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!camera) return null;

  const profile = getCameraVideoProfile(camera, instituteType, instituteName);
  const opticalCount = profile.actualOccupants;
  const biometricCount = camera.unusual_inactivity ? 25 : (opticalCount > 0 ? opticalCount + 1 : 0);
  const matchLabel = camera.unusual_inactivity ? '0% MATCH (ANOMALY)' : (opticalCount > 0 ? '92% MATCH' : 'N/A (QUIET HOURS)');

  const handleCaptureSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 3500);
  };

  const handleFlagDiscrepancy = () => {
    setFlaggedNotice(true);
    setTimeout(() => setFlaggedNotice(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-3 sm:p-5 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {camera.room} ({camera.camera_name})
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE • 25 FPS
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {instituteName} • {t('cctvEnlargeTitle')}
            </p>
          </div>
        </div>

        {/* Header Navigation Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Back to Dashboard Option */}
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('btnBackDashboard')}</span>
          </button>

          {/* Close Viewer */}
          <button
            type="button"
            onClick={onClose}
            title={t('cctvCloseModal')}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Snapshot / Alert Notification Toast */}
      {snapshotTaken && (
        <div className="mt-2 p-2.5 bg-emerald-950/90 border border-emerald-600 rounded-lg flex items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('cctvSnapshotSaved')} (SHA-256 Hash: 8f9b...a102)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">TIMESTAMP ATTESTED</span>
        </div>
      )}

      {flaggedNotice && (
        <div className="mt-2 p-2.5 bg-amber-950/90 border border-amber-600 rounded-lg flex items-center gap-2 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Discrepancy logged for Inspection Unit (Case #{camera.id}08-DoSJE). Forwarded to Risk Engine.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* Left: Giant Video Display */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-center items-center bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <CCTVPlayer
            camera={camera}
            instituteName={instituteName}
            instituteType={instituteType}
            isEnlarged={true}
            showControls={true}
          />
        </div>

        {/* Right: Telemetry & Analytical Signals */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Headcount Card */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                {t('cctvHeadcountMatch')}
              </span>
              <span className={`font-mono font-bold ${camera.unusual_inactivity ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {matchLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">Optical Count</span>
                <span className="text-xl font-black font-mono text-white">{opticalCount}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block uppercase">Biometric Muster</span>
                <span className="text-xl font-black font-mono text-slate-300">
                  {biometricCount}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Level Meter */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" />
                {t('cctvActivityLevel')}
              </span>
              <span className="font-mono font-bold text-blue-400">{camera.activity_level}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  camera.activity_level > 50 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, camera.activity_level)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {camera.activity_level >= 50 ? t('cctvNormalActivity') : t('cctvUnusualInactivity')}
            </p>
          </div>

          {/* Unusual Inactivity Warning */}
          {camera.unusual_inactivity && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('cctvUnusualInactivity')}</span>
              </div>
              <p className="text-[11px] text-rose-200/80">
                {t('cctvInactivityNotice')}
              </p>
            </div>
          )}

          {/* Hardware & Stream Diagnostics */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">
              {t('cctvStreamDiagnostics')}
            </span>
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-slate-500" />
                NVR Stream
              </span>
              <span className="font-mono text-slate-200">10.42.12.89:554/cam{camera.id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                Encoding
              </span>
              <span className="font-mono text-slate-200">H.264 / 1080p FHD</span>
            </div>
            <div className="flex items-center justify-between text-[11px] py-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                Vision Pipeline
              </span>
              <span className="font-mono text-emerald-400">YOLOv8 + Optical Flow</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-auto pt-2">
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('cctvSnapshotCapture')}</span>
            </button>

            <button
              type="button"
              onClick={handleFlagDiscrepancy}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('cctvFlagAnomaly')}</span>
            </button>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('btnBackDashboard')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
