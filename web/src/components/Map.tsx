import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Institute } from '../types';
import { RiskBadge } from './RiskBadge';
import { useTheme } from '../context/ThemeContext';
import { 
  MapPin, 
  Filter, 
  Search, 
  Building2, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  Compass, 
  Maximize2, 
  RotateCcw,
  Satellite,
  Map as MapIcon,
  Moon
} from 'lucide-react';

interface MapProps {
  institutes: Institute[];
  selectedInstitute?: Institute | null;
  onSelectInstitute?: (institute: Institute) => void;
  heightClass?: string;
  showControls?: boolean;
}

// Authentic Google Maps Tile Layers
const TILE_LAYERS = {
  GOOGLE_HYBRID: {
    name: 'Google Satellite (Hybrid)',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: 'Map data &copy; Google Maps',
    maxZoom: 20
  },
  GOOGLE_STREET: {
    name: 'Google Roadmap',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: 'Map data &copy; Google Maps',
    maxZoom: 20
  }
};

// Regional center coordinates & zoom levels
const REGION_PRESETS: Record<string, { center: [number, number]; zoom: number }> = {
  ALL: { center: [22.8, 79.5], zoom: 5 },
  NORTH: { center: [30.5, 76.5], zoom: 6 },
  CENTRAL: { center: [23.2, 77.4], zoom: 7 }, // Bhopal MP zone
  WEST: { center: [21.5, 72.8], zoom: 6 },  // Gujarat / Maharashtra
  SOUTH: { center: [13.0, 77.5], zoom: 6 },  // Karnataka / TN / AP
  EAST: { center: [24.5, 88.0], zoom: 6 }   // Bengal / NE
};

export const Map: React.FC<MapProps> = ({
  institutes,
  selectedInstitute: controlledSelected,
  onSelectInstitute,
  heightClass = 'min-h-[580px] h-full',
  showControls = true
}) => {
  const navigate = useNavigate();
  const { t, language } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedInternal, setSelectedInternal] = useState<Institute | null>(null);
  const selectedInstitute = controlledSelected || selectedInternal;

  // Active Google Maps Tile Layer State (Default to Google Hybrid)
  const [activeLayer, setActiveLayer] = useState<keyof typeof TILE_LAYERS>('GOOGLE_HYBRID');

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const states = useMemo(() => {
    const list = Array.from(new Set(institutes.map((i) => i.state))).filter(Boolean);
    return ['ALL', ...list];
  }, [institutes]);

  const filteredInstitutes = useMemo(() => {
    return institutes.filter((inst) => {
      const matchesState = selectedState === 'ALL' || inst.state === selectedState;
      const riskLevel = inst.risk?.risk_level || 'LOW';
      const matchesRisk = selectedRisk === 'ALL' || riskLevel === selectedRisk;
      const matchesSearch =
        !searchQuery ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.scheme.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesState && matchesRisk && matchesSearch;
    });
  }, [institutes, selectedState, selectedRisk, searchQuery]);

  const handleSelect = (inst: Institute) => {
    if (onSelectInstitute) {
      onSelectInstitute(inst);
    } else {
      setSelectedInternal(inst);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([inst.latitude, inst.longitude], 13, { duration: 1.2 });
    }
  };

  // Initialize Leaflet Map with Google Maps
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      center: REGION_PRESETS.ALL.center,
      zoom: REGION_PRESETS.ALL.zoom,
      minZoom: 4,
      maxZoom: 20,
      zoomControl: false // custom placement
    });

    // Add initial Google Map tile layer
    const initialConfig = TILE_LAYERS[activeLayer] || TILE_LAYERS.GOOGLE_HYBRID;
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      subdomains: (initialConfig as any).subdomains || ['0', '1', '2', '3']
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer switch changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_LAYERS[activeLayer] || TILE_LAYERS.GOOGLE_HYBRID;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: (config as any).subdomains || ['0', '1', '2', '3']
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Update Markers when institutes or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredInstitutes.forEach((inst) => {
      const isSelected = selectedInstitute?.id === inst.id;
      const riskLevel = inst.risk?.risk_level || 'LOW';
      const score = inst.risk?.score || 25;

      let pinColor = '#10B981'; // emerald green for low risk
      let glowClass = '';
      if (riskLevel === 'CRITICAL') {
        pinColor = '#EF4444';
        glowClass = 'animate-ping opacity-75';
      } else if (riskLevel === 'HIGH') {
        pinColor = '#F97316';
        glowClass = 'animate-pulse opacity-80';
      } else if (riskLevel === 'MEDIUM') {
        pinColor = '#F59E0B';
      }

      const customHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') ? `
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${pinColor}; opacity: 0.35;" class="${glowClass}"></div>
          ` : ''}
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background-color: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            font-size: ${isSelected ? '11px' : '9px'};
            font-weight: bold;
            color: #ffffff;
            font-family: monospace;
            transition: all 0.2s ease;
          ">
            ${score}
          </div>
          <div style="
            position: absolute;
            bottom: -16px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.9);
            color: #ffffff;
            font-size: 8px;
            font-weight: 600;
            padding: 1px 4px;
            border-radius: 3px;
            white-space: nowrap;
            pointer-events: none;
            border: 0.5px solid ${pinColor};
          ">
            ${inst.district}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-map-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([inst.latitude, inst.longitude], { icon: customIcon });

      marker.on('click', () => {
        handleSelect(inst);
      });

      marker.bindTooltip(`<strong>${inst.name}</strong><br/>Score: ${score}/100 (${riskLevel})`, {
        direction: 'top',
        offset: [0, -16]
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredInstitutes, selectedInstitute]);

  // Regional Zoom handler
  const handleFlyToRegion = (regionKey: string) => {
    const preset = REGION_PRESETS[regionKey];
    if (preset && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(preset.center, preset.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className={`gov-card overflow-hidden flex flex-col ${heightClass} relative`}>
      {/* Top Filter Toolbar */}
      {showControls && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2 text-xs z-10 relative">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder={t('mapSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 w-44 sm:w-52"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? t('mapAllStates') : s}</option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
            >
              <option value="ALL">{t('mapAllRisks')}</option>
              <option value="CRITICAL">{t('mapLegendCritical')}</option>
              <option value="HIGH">{t('mapLegendHigh')}</option>
              <option value="MEDIUM">{t('mapLegendMedium')}</option>
              <option value="LOW">{t('mapLegendLow')}</option>
            </select>
          </div>

          {/* Regional Fly-To Presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase hidden md:inline">{t('mapFlyTo')}</span>
            {Object.keys(REGION_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handleFlyToRegion(key)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {key === 'ALL' ? t('mapAllIndia') : key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[460px]">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0 bg-slate-900" />

        {/* Map API Imagery Switcher (Top Left on Map: Google Hybrid & Google Road) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1 shadow-lg text-[10px]">
          <button
            onClick={() => setActiveLayer('GOOGLE_HYBRID')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
              activeLayer === 'GOOGLE_HYBRID'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>{t('mapLayerGoogleHybrid')}</span>
          </button>

          <button
            onClick={() => setActiveLayer('GOOGLE_STREET')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
              activeLayer === 'GOOGLE_STREET'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('mapLayerGoogleRoad')}</span>
          </button>
        </div>

        {/* Legend (Bottom Left on Map) */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[10px] text-white flex flex-col gap-1 shadow-md">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">
            {t('mapRiskLegend')}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t('mapLegendLow')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{t('mapLegendMedium')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>{t('mapLegendHigh')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{t('mapLegendCritical')}</span>
          </div>
        </div>

        {/* Selected Facility Dossier Overlay Drawer (Clean, No Overtexting) */}
        {selectedInstitute && (
          <div className="absolute top-3 right-3 w-80 max-w-[calc(100%-1.5rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 z-20 transition-all animate-in fade-in slide-in-from-right-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <RiskBadge
                  score={selectedInstitute.risk?.score}
                  level={selectedInstitute.risk?.risk_level}
                  size="sm"
                />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                  {selectedInstitute.name}
                </h4>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{selectedInstitute.district}, {selectedInstitute.state}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedInternal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Chips */}
            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">{t('drawerMusterAttendance')}</span>
                <span className="font-bold font-mono text-red-600 dark:text-red-400">
                  {selectedInstitute.reported_attendance}%
                </span>
                <span className="text-[10px] text-slate-400"> / {selectedInstitute.historical_attendance}%</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">{t('drawerGrievances')}</span>
                <span className="font-bold font-mono text-[#0284c7]">
                  {selectedInstitute.complaints_count} {t('drawerActive')}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-3">
              GPS: {selectedInstitute.latitude.toFixed(4)}°N, {selectedInstitute.longitude.toFixed(4)}°E
            </div>

            {/* Direct Action Link */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate(`/institutes/${selectedInstitute.id}`)}
                className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>{t('drawerFullDossier')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
