import React from 'react';
import { CCTVCamera } from '../types';
import { CCTVPlayer, getCameraVideoProfile } from './CCTVPlayer';
import { useTheme } from '../context/ThemeContext';
import { 
  Video, 
  VideoOff, 
  Maximize2, 
  Activity, 
  Users, 
  AlertTriangle,
  Radio,
  Building,
  GraduationCap,
  Home as HomeIcon
} from 'lucide-react';

interface CCTVCardProps {
  camera: CCTVCamera;
  instituteName?: string;
  instituteType?: string;
  onEnlarge?: (camera: CCTVCamera) => void;
}

export const CCTVCard: React.FC<CCTVCardProps> = ({ 
  camera, 
  instituteName = 'Institute',
  instituteType = '',
  onEnlarge 
}) => {
  const { t } = useTheme();
  const profile = getCameraVideoProfile(camera, instituteType, instituteName);

  return (
    <div className="gov-card overflow-hidden flex flex-col hover:border-blue-500/50 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Camera Header */}
      <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-blue-900/50 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Video className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs block truncate text-slate-100">{camera.room}</span>
            <span className="text-[10px] text-slate-400 block font-mono">{camera.camera_name} • 1080p</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {camera.status === 'ONLINE' ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
              OFFLINE
            </span>
          )}

          {/* Enlarge trigger icon */}
          <button
            type="button"
            onClick={() => onEnlarge && onEnlarge(camera)}
            title={t('cctvClickToEnlarge')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real Video Player with Domain Selection and Live AI Detections */}
      <div className="relative aspect-video bg-slate-950">
        {camera.status === 'ONLINE' ? (
          <CCTVPlayer
            camera={camera}
            instituteName={instituteName}
            instituteType={instituteType}
            isEnlarged={false}
            onEnlarge={() => onEnlarge && onEnlarge(camera)}
            showControls={true}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <VideoOff className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">CAMERA OFFLINE</p>
            <p className="text-[10px] text-slate-600 mt-1">Check NVR port or network bridge</p>
          </div>
        )}
      </div>

      {/* AI Telemetry Summary Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px]">Activity:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {camera.activity_level}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="text-[11px]">{t('cctvEstimatedOccupancy')}:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {profile.actualOccupants}
            </span>
          </div>
        </div>

        {camera.unusual_inactivity && (
          <div className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded text-[10px] font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="truncate">{t('cctvUnusualInactivity')}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            AI Pipeline Active
          </span>
          <button
            type="button"
            onClick={() => onEnlarge && onEnlarge(camera)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('cctvClickToEnlarge')}</span>
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
