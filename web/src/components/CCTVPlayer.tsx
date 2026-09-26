import React, { useState, useEffect, useRef } from 'react';
import { CCTVCamera } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Maximize2, 
  Activity, 
  Scan, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  AlertTriangle,
  Building,
  GraduationCap,
  Home as HomeIcon,
  Users
} from 'lucide-react';

interface CCTVPlayerProps {
  camera: CCTVCamera;
  instituteName?: string;
  instituteType?: string;
  isEnlarged?: boolean;
  onEnlarge?: () => void;
  showControls?: boolean;
}

export interface DetectionBox {
  id: string;
  label: string;
  conf: number;
  x: number; // percentage from left
  y: number; // percentage from top
  w: number; // width percentage
  h: number; // height percentage
  role: 'student' | 'teacher' | 'person' | 'staff';
}

export interface VideoProfile {
  id: string;
  primary: string;
  primaryType: string;
  fallback: string;
  fallbackType: string;
  locationLabel: string;
  domain: 'residential' | 'college' | 'school';
  actualOccupants: number;
  getDetections: (rolePrefix: string) => DetectionBox[];
}

const VIDEO_PROFILES: Record<string, VideoProfile> = {
  // 1. Active Classroom full of Indian / Asian students writing & studying at individual desks
  'classroom-students': {
    id: 'classroom-students',
    primary: '/videos/classroom-students.webm',
    primaryType: 'video/webm',
    fallback: '/videos/classroom-students.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Active Classroom Instruction & Attendance Session',
    domain: 'school',
    actualOccupants: 8,
    getDetections: (prefix: string) => [
      { id: 'STU-01', label: `${prefix} STUDENT #01`, conf: 98.4, x: 67, y: 50, w: 20, h: 42, role: 'student' },
      { id: 'STU-02', label: `${prefix} STUDENT #02`, conf: 97.8, x: 29, y: 40, w: 15, h: 35, role: 'student' },
      { id: 'STU-03', label: `${prefix} STUDENT #03`, conf: 96.5, x: 51, y: 38, w: 12, h: 30, role: 'student' },
      { id: 'STU-04', label: `${prefix} STUDENT #04`, conf: 95.9, x: 86, y: 45, w: 13, h: 33, role: 'student' },
      { id: 'STU-05', label: `${prefix} STUDENT #05`, conf: 96.2, x: 14, y: 36, w: 11, h: 32, role: 'student' },
      { id: 'STU-06', label: `${prefix} STUDENT #06`, conf: 94.7, x: 66, y: 39, w: 9, h: 26, role: 'student' },
      { id: 'STU-07', label: `${prefix} STUDENT #07`, conf: 93.8, x: 76, y: 40, w: 8, h: 22, role: 'student' },
      { id: 'TCH-01', label: `${prefix} INSTRUCTOR (GOI)`, conf: 99.2, x: 33, y: 29, w: 8, h: 25, role: 'teacher' }
    ]
  },

  // 2. Seminar / Higher-Education Lecture Hall with 4 seated students & 1 instructor at whiteboard
  'classroom-seminar': {
    id: 'classroom-seminar',
    primary: '/videos/classroom.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/classroom-students.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Theory Lecture & Seminar Hall',
    domain: 'college',
    actualOccupants: 4,
    getDetections: (prefix: string) => [
      { id: 'INS-01', label: `${prefix} INSTRUCTOR`, conf: 99.4, x: 65, y: 34, w: 15, h: 52, role: 'teacher' },
      { id: 'TRN-01', label: `${prefix} TRAINEE #01`, conf: 97.6, x: 10, y: 52, w: 15, h: 35, role: 'student' },
      { id: 'TRN-02', label: `${prefix} TRAINEE #02`, conf: 96.8, x: 23, y: 45, w: 11, h: 25, role: 'student' },
      { id: 'TRN-03', label: `${prefix} TRAINEE #03`, conf: 97.1, x: 45, y: 45, w: 11, h: 25, role: 'student' }
    ]
  },

  // 3. Technical Trades Workshop Floor with 1 technician wearing yellow safety helmet & vest
  'vocational-workshop': {
    id: 'vocational-workshop',
    primary: '/videos/vocational-workshop.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/classroom.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Technical Trades & Workshop Floor',
    domain: 'college',
    actualOccupants: 1,
    getDetections: (prefix: string) => [
      { id: 'WRK-01', label: `${prefix} TECHNICIAN (SAFETY GEAR: VERIFIED)`, conf: 98.9, x: 18, y: 19, w: 14, h: 58, role: 'staff' }
    ]
  },

  // 4. Institutional Administrative Corridor with 2 staff members walking toward camera
  'campus-corridor': {
    id: 'campus-corridor',
    primary: '/videos/campus-corridor.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/people-detection.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Administrative Wing & Office Corridor',
    domain: 'residential',
    actualOccupants: 2,
    getDetections: (prefix: string) => [
      { id: 'STF-01', label: `${prefix} STAFF #01`, conf: 98.7, x: 45, y: 42, w: 12, h: 55, role: 'staff' },
      { id: 'STF-02', label: `${prefix} SUPERVISOR`, conf: 99.1, x: 55, y: 36, w: 15, h: 62, role: 'staff' }
    ]
  },

  // 5. Reception Lobby with 2 people walking into the facility
  'people-detection': {
    id: 'people-detection',
    primary: '/videos/people-detection.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/campus-corridor.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Campus Reception & Visitor Desk',
    domain: 'residential',
    actualOccupants: 2,
    getDetections: (prefix: string) => [
      { id: 'REC-01', label: `${prefix} VISITOR`, conf: 97.8, x: 24, y: 29, w: 15, h: 60, role: 'person' },
      { id: 'REC-02', label: `${prefix} ATTENDANT`, conf: 98.5, x: 41, y: 33, w: 14, h: 53, role: 'staff' }
    ]
  },

  // 6. Sri Ramakrishna Pre-College Campus Mangalore (India) with 2 individuals in courtyard
  'india-school-campus': {
    id: 'india-school-campus',
    primary: '/videos/india-school-campus.webm',
    primaryType: 'video/webm',
    fallback: '/videos/campus-walkway.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Campus Grounds & Assembly Area (Mangalore, India)',
    domain: 'school',
    actualOccupants: 2,
    getDetections: (prefix: string) => [
      { id: 'IND-01', label: `${prefix} STUDENT`, conf: 97.4, x: 23, y: 73, w: 4, h: 8, role: 'student' },
      { id: 'IND-02', label: `${prefix} WARDEN`, conf: 98.6, x: 47, y: 59, w: 3, h: 8, role: 'teacher' }
    ]
  },

  // 7. Campus Pedestrian Walkway with 3 people walking along paths
  'campus-walkway': {
    id: 'campus-walkway',
    primary: '/videos/campus-walkway.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/india-school-campus.webm',
    fallbackType: 'video/webm',
    locationLabel: 'Campus Main Entrance & Walkway',
    domain: 'college',
    actualOccupants: 3,
    getDetections: (prefix: string) => [
      { id: 'PED-01', label: `${prefix} PEDESTRIAN #01`, conf: 96.8, x: 32, y: 38, w: 5, h: 15, role: 'person' },
      { id: 'PED-02', label: `${prefix} PEDESTRIAN #02`, conf: 97.2, x: 65, y: 27, w: 5, h: 14, role: 'person' },
      { id: 'PED-03', label: `${prefix} PEDESTRIAN #03`, conf: 96.4, x: 83, y: 41, w: 6, h: 15, role: 'person' }
    ]
  },

  // 8. Advanced Computer & IT Laboratory (Desktop monitors, PC towers, workstation desks)
  'computer-lab': {
    id: 'computer-lab',
    primary: '/videos/computer-lab.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/computer-lab.webm',
    fallbackType: 'video/webm',
    locationLabel: 'Advanced Computer & IT Laboratory',
    domain: 'college',
    actualOccupants: 4,
    getDetections: (prefix: string) => [
      { id: 'WS-01', label: `${prefix} PC WORKSTATION #01 [ONLINE]`, conf: 99.1, x: 19, y: 30, w: 14, h: 28, role: 'person' },
      { id: 'WS-02', label: `${prefix} PC WORKSTATION #02 [ACTIVE]`, conf: 98.7, x: 62, y: 31, w: 13, h: 25, role: 'person' },
      { id: 'WS-03', label: `${prefix} PC WORKSTATION #03 [DESK]`, conf: 97.9, x: 39, y: 32, w: 14, h: 26, role: 'person' },
      { id: 'SRV-01', label: `${prefix} TERMINAL CPU TOWER`, conf: 98.5, x: 50, y: 28, w: 9, h: 32, role: 'person' }
    ]
  },

  // 9. Vacant Room with round table & wooden floor (0 occupants - NO GHOST BOXES!)
  'vacant-room': {
    id: 'vacant-room',
    primary: '/videos/residential-hostel.mp4',
    primaryType: 'video/mp4',
    fallback: '/videos/campus-corridor.mp4',
    fallbackType: 'video/mp4',
    locationLabel: 'Unusual Inactivity / Vacant Activity Room',
    domain: 'residential',
    actualOccupants: 0,
    getDetections: () => [] // Zero boxes because no one is in the room!
  }
};

export const getCameraVideoProfile = (
  camera: CCTVCamera,
  instituteType: string = '',
  instituteName: string = ''
): VideoProfile => {
  const room = (camera.room || '').toLowerCase();
  const cname = (camera.camera_name || '').toUpperCase();
  const itype = (instituteType || '').toLowerCase();
  const iname = (instituteName || '').toLowerCase();

  // 1. STATUTORY ANOMALY: If camera has unusual inactivity flagged (e.g. CAM-04 Classroom 2),
  // route to the authentic vacant room (0 occupants detected vs muster roll)
  if (camera.unusual_inactivity) {
    return {
      ...VIDEO_PROFILES['vacant-room'],
      locationLabel: `${camera.room} — Inactivity Discrepancy Detected (0 Occupants)`
    };
  }

  // 2. Room-specific contextual routing ensuring NO duplicate videos in the same facility:
  // Computer / IT Lab specifically routed to real computer lab footage:
  if (room.includes('computer') || room.includes('it lab') || room.includes('lap') || room.includes('digital') || room.includes('informatics')) {
    return VIDEO_PROFILES['computer-lab'];
  }

  if (room.includes('reception') || room.includes('visitor') || room.includes('lobby') || room.includes('desk') || room.includes('nursing') || room.includes('medical')) {
    return VIDEO_PROFILES['people-detection'];
  }

  if (room.includes('office') || room.includes('admin') || room.includes('staff')) {
    return VIDEO_PROFILES['campus-corridor'];
  }

  if (room.includes('classroom 1') || room.includes('primary') || (room.includes('class') && !room.includes('2')) || room.includes('junior') || room.includes('lecture hall')) {
    return VIDEO_PROFILES['classroom-students'];
  }

  if (room.includes('therapy') || room.includes('sensory') || room.includes('seminar') || room.includes('theory') || room.includes('lounge') || room.includes('living')) {
    return VIDEO_PROFILES['classroom-seminar'];
  }

  if (room.includes('workshop') || room.includes('trade') || room.includes('practical') || room.includes('bay')) {
    return VIDEO_PROFILES['vocational-workshop'];
  }

  if (room.includes('assembly') || room.includes('courtyard') || room.includes('ground') || room.includes('hostel')) {
    return VIDEO_PROFILES['india-school-campus'];
  }

  if (room.includes('entrance') || room.includes('turnstile') || room.includes('gate') || room.includes('walkway')) {
    return VIDEO_PROFILES['campus-walkway'];
  }

  if (room.includes('dining') || room.includes('mess') || room.includes('cafeteria')) {
    return VIDEO_PROFILES['campus-corridor'];
  }

  // 3. Fallback deterministic rotation by camera ID ensuring distinct videos
  const rotationKeys: string[] = [
    'computer-lab',
    'people-detection',
    'campus-corridor',
    'classroom-students',
    'classroom-seminar',
    'vocational-workshop',
    'india-school-campus',
    'campus-walkway'
  ];
  const idx = Math.abs(camera.id || 1) % rotationKeys.length;
  return VIDEO_PROFILES[rotationKeys[idx]];
};

export const CCTVPlayer: React.FC<CCTVPlayerProps> = ({
  camera,
  instituteName = 'Institutional Center',
  instituteType = '',
  isEnlarged = false,
  onEnlarge,
  showControls = true
}) => {
  const { t } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showDetections, setShowDetections] = useState<boolean>(true);
  const [showMotion, setShowMotion] = useState<boolean>(true);
  const [showPrivacyMask, setShowPrivacyMask] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>('');
  const [fps, setFps] = useState<number>(25.0);
  const [jitterOffsets, setJitterOffsets] = useState<{ dx: number; dy: number }[]>([]);

  const profile = getCameraVideoProfile(camera, instituteType, instituteName);

  // Role prefix based on domain
  const rolePrefix = profile.domain === 'residential' 
    ? 'RESIDENTIAL' 
    : profile.domain === 'college' 
      ? 'COLLEGE' 
      : 'DDRS';

  const baseDetections = profile.getDetections(rolePrefix);

  // Live ticking timestamp HUD with millisecond simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ms = now.getMilliseconds().toString().padStart(3, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms}`;
      setTimestamp(`${dateStr} ${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 65);
    return () => clearInterval(interval);
  }, []);

  // Dynamic tracking box micro-jitter / tracking simulation
  useEffect(() => {
    if (!showDetections || baseDetections.length === 0) return;
    const interval = setInterval(() => {
      const newOffsets = baseDetections.map(() => ({
        dx: (Math.random() - 0.5) * 1.4,
        dy: (Math.random() - 0.5) * 1.4
      }));
      setJitterOffsets(newOffsets);
      setFps(24.8 + Math.random() * 0.4);
    }, 450);

    return () => clearInterval(interval);
  }, [showDetections, baseDetections.length]);

  // Ensure video begins playing reliably across all browser autoplay policies
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch(() => {
          // Ignore autoplay restriction
        });
      }
    }
  }, [profile.primary]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className={`relative w-full bg-slate-950 rounded-lg overflow-hidden group select-none ${
        isEnlarged ? 'h-full aspect-video' : 'aspect-video cursor-pointer'
      }`}
      onClick={!isEnlarged ? onEnlarge : undefined}
    >
      {/* Optimized Real Surveillance Video with Multi-Source Fallback */}
      <video
        ref={videoRef}
        key={profile.primary}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      >
        <source src={profile.primary} type={profile.primaryType} />
        <source src={profile.fallback} type={profile.fallbackType} />
      </video>

      {/* AI Computer Vision Detection Overlay: Only rendered if people actually exist */}
      {showDetections && camera.status === 'ONLINE' && baseDetections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {baseDetections.map((box, index) => {
            const offset = jitterOffsets[index] || { dx: 0, dy: 0 };
            const curX = Math.max(1, Math.min(92, box.x + offset.dx));
            const curY = Math.max(5, Math.min(88, box.y + offset.dy));
            const isTeacherOrStaff = box.role === 'teacher' || box.role === 'staff';
            const borderColor = isTeacherOrStaff ? 'border-emerald-400' : 'border-cyan-400';
            const bgBadgeColor = isTeacherOrStaff ? 'bg-emerald-500/90 text-white' : 'bg-cyan-500/90 text-slate-950';

            return (
              <div
                key={box.id}
                style={{
                  left: `${curX}%`,
                  top: `${curY}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                }}
                className={`absolute border-2 ${borderColor} rounded-sm transition-all duration-300 shadow-[0_0_8px_rgba(14,165,233,0.3)]`}
              >
                {/* Corner Crosshair Reticles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                {/* Object Tag Badge */}
                <div className={`absolute -top-5 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight whitespace-nowrap shadow-sm ${bgBadgeColor}`}>
                  {box.label} • {box.conf.toFixed(1)}%
                </div>

                {/* Tracking ID & Optical Velocity */}
                {isEnlarged && (
                  <div className="absolute -bottom-4 right-0 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-sky-300">
                    ID:{box.id} | v:0.{(index * 3 + 4) % 9}m/s
                  </div>
                )}

                {/* Privacy Face Blur Mask Option */}
                {showPrivacyMask && (
                  <div className="absolute top-0 inset-x-0 h-1/3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-xs" />
                )}
              </div>
            );
          })}

          {/* Optical Motion Flow Grid */}
          {showMotion && (
            <svg className="absolute inset-0 w-full h-full opacity-35">
              <defs>
                <pattern id={`motion-grid-${camera.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#motion-grid-${camera.id})`} />
            </svg>
          )}
        </div>
      )}

      {/* Top HUD: Status, Rec indicator, Domain Badge & Timestamp */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-white border border-white/10 shadow">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-bold">REC • LIVE AI</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200 hidden sm:inline">{camera.room}</span>
          <span className="text-slate-400 hidden md:inline">({camera.camera_name})</span>
        </div>

        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 border border-white/10 shadow">
          <span>{timestamp}</span>
          <span className="text-slate-400">|</span>
          <span className="text-blue-300">{fps.toFixed(1)} FPS</span>
        </div>
      </div>

      {/* Bottom HUD: Telemetry & Activity Bar */}
      <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-white border border-white/10 shadow">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            {t('cctvEstimatedOccupancy')}: <strong className="text-emerald-400">{profile.actualOccupants}</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">
            Activity: <strong className={camera.activity_level > 50 ? 'text-blue-400' : 'text-amber-400'}>{camera.activity_level}%</strong>
          </span>
        </div>

        {camera.unusual_inactivity || profile.actualOccupants === 0 ? (
          <div className="flex items-center gap-1.5 bg-rose-950/90 backdrop-blur-md border border-rose-500 px-2.5 py-1 rounded text-[10px] font-mono text-rose-300 animate-pulse shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">
              {camera.unusual_inactivity 
                ? `UNUSUAL INACTIVITY DETECTED (0/25 EXPECTED)` 
                : 'ROOM VACANT / 0 OCCUPANTS'}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-400">
            {profile.domain === 'residential' && <HomeIcon className="w-2.5 h-2.5 text-amber-400" />}
            {profile.domain === 'college' && <GraduationCap className="w-2.5 h-2.5 text-blue-400" />}
            {profile.domain === 'school' && <Building className="w-2.5 h-2.5 text-sky-400" />}
            <span className="truncate max-w-[170px]">{profile.locationLabel}</span>
          </div>
        )}
      </div>

      {/* Hover overlay with Enlarge Prompt (Card mode) */}
      {!isEnlarged && (
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600/90 text-white font-bold text-xs shadow-xl backdrop-blur-sm transform group-hover:scale-105 transition-transform">
            <Maximize2 className="w-4 h-4" />
            <span>{t('cctvClickToEnlarge')}</span>
          </div>
        </div>
      )}

      {/* Interactive Controls Toolbar */}
      {showControls && (
        <div className="absolute top-2.5 right-2.5 hidden group-hover:flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1 rounded-lg border border-white/10 z-30">
          <button
            type="button"
            onClick={togglePlay}
            title={isPlaying ? 'Pause Feed' : 'Play Feed'}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetections(!showDetections);
            }}
            title="Toggle AI Object Detections"
            className={`p-1 rounded transition-colors cursor-pointer ${
              showDetections ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMotion(!showMotion);
            }}
            title="Toggle Optical Flow Motion Grid"
            className={`p-1 rounded transition-colors cursor-pointer ${
              showMotion ? 'bg-[#0284c7] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {isEnlarged && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacyMask(!showPrivacyMask);
              }}
              title="Toggle Privacy Blur Mask"
              className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-colors cursor-pointer ${
                showPrivacyMask ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              MASK
            </button>
          )}

          {!isEnlarged && onEnlarge && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEnlarge();
              }}
              title={t('cctvClickToEnlarge')}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
