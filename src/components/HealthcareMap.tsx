import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility } from '../types';
import { useApp } from '../context/AppContext';
import {
  Compass,
  AlertCircle,
  LocateFixed,
  Filter,
} from 'lucide-react';

interface HealthcareMapProps {
  facilities: Facility[];
  selectedFacilityId?: string | null;
  onSelectFacility?: (facility: Facility) => void;
  userCoords?: { lat: number; lng: number } | null;
  onUserCoordsChange?: (coords: { lat: number; lng: number; locationName: string }) => void;
  className?: string;
  height?: string;
  showFilters?: boolean;
}

// Preset Maharashtra locations for quick switcher & rural testing
export const MAHARASHTRA_LOCATIONS = [
  { name: 'Ramtek (Nagpur)', nameMr: 'रामटेक (नागपूर)', nameHi: 'रामटेक (नागपुर)', lat: 21.3966, lng: 79.3274, district: 'Nagpur' },
  { name: 'Mansar Village (Nagpur)', nameMr: 'मानसर गाव (नागपूर)', nameHi: 'मानसर गांव (नागपुर)', lat: 21.3780, lng: 79.2890, district: 'Nagpur' },
  { name: 'Katol Town (Nagpur)', nameMr: 'काटोल (नागपूर)', nameHi: 'काटोल (नागपुर)', lat: 21.2721, lng: 78.5867, district: 'Nagpur' },
  { name: 'Nagpur City (HQ)', nameMr: 'नागपूर शहर', nameHi: 'नागपुर शहर', lat: 21.1458, lng: 79.0882, district: 'Nagpur' },
  { name: 'Paunar (Wardha)', nameMr: 'पवनार (वर्धा)', nameHi: 'पवनार (वर्धा)', lat: 20.7850, lng: 78.6730, district: 'Wardha' },
  { name: 'Wardha City', nameMr: 'वर्धा शहर', nameHi: 'वर्धा शहर', lat: 20.7453, lng: 78.6022, district: 'Wardha' },
  { name: 'Bhamragad (Gadchiroli Tribal)', nameMr: 'भामरागड (गडचिरोली आदिवासी)', nameHi: 'भामरागढ़ (गढ़चिरोली)', lat: 19.3789, lng: 80.3540, district: 'Gadchiroli' },
  { name: 'Gadchiroli District HQ', nameMr: 'गडचिरोली जिल्हा केंद्र', nameHi: 'गढ़चिरोली जिला केंद्र', lat: 20.1809, lng: 79.9936, district: 'Gadchiroli' },
  { name: 'Trimbakeshwar (Nashik)', nameMr: 'त्र्यंबकेश्वर (नाशिक)', nameHi: 'त्र्यंबकेश्वर (नासिक)', lat: 19.9324, lng: 73.5307, district: 'Nashik' },
  { name: 'Nashik City', nameMr: 'नाशिक शहर', nameHi: 'नासिक शहर', lat: 19.9975, lng: 73.7898, district: 'Nashik' },
  { name: 'Pune Civil Hospital Zone', nameMr: 'पुणे', nameHi: 'पुणे', lat: 18.5204, lng: 73.8567, district: 'Pune' },
  { name: 'Amravati District HQ', nameMr: 'अमरावती', nameHi: 'अमरावती', lat: 20.9374, lng: 77.7796, district: 'Amravati' },
  { name: 'Chandrapur Health Zone', nameMr: 'चंद्रपूर', nameHi: 'चंद्रपुर', lat: 19.9615, lng: 79.2961, district: 'Chandrapur' },
];

// Haversine distance calculator in Kilometers
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Facility color and styling resolver
const getFacilityIconConfig = (type: string) => {
  switch (type) {
    case 'PHC':
      return { bg: '#059669', border: '#047857', label: 'PHC', text: '#ffffff' };
    case 'CHC':
      return { bg: '#0d9488', border: '#0f766e', label: 'CHC', text: '#ffffff' };
    case 'District Hospital':
      return { bg: '#2563eb', border: '#1d4ed8', label: 'DH', text: '#ffffff' };
    case 'Sub-District Hospital':
      return { bg: '#7c3aed', border: '#6d28d9', label: 'SDH', text: '#ffffff' };
    case 'Government Medical College':
      return { bg: '#dc2626', border: '#b91c1c', label: 'GMC', text: '#ffffff' };
    default:
      return { bg: '#059669', border: '#047857', label: 'PHC', text: '#ffffff' };
  }
};

export const HealthcareMap: React.FC<HealthcareMapProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  userCoords,
  onUserCoordsChange,
  className = '',
  height = '520px',
  showFilters = true,
}) => {
  const { t, language, formatDistance, formatNumber } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>(
    userCoords || { lat: 21.3966, lng: 79.3274 } // Default Ramtek, Nagpur
  );
  const [activeLocationName, setActiveLocationName] = useState<string>('Ramtek (Nagpur)');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'success' | 'denied' | 'error'>('idle');
  const [selectedRadius, setSelectedRadius] = useState<number>(50); // km
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState<boolean>(false);
  const [filterFreeMedsOnly, setFilterFreeMedsOnly] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeCoords.lat, activeCoords.lng],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | Maharashtra Public Health GIS',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount if needed
    };
  }, []);

  // Update Markers & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // User Location Marker with pulsing ring
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 50%; background: #059669; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([activeCoords.lat, activeCoords.lng], { icon: userIcon, zIndexOffset: 1000 });
    userMarker.bindPopup(`
      <div style="padding: 6px; font-family: sans-serif;">
        <b style="color: #059669;">📍 ${t('auto.text_1062')}</b>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${activeLocationName}</div>
      </div>
    `);
    markersLayer.addLayer(userMarker);
    userMarkerRef.current = userMarker;

    // Filter & Calculate Distances for Facilities
    const bounds: L.LatLngExpression[] = [[activeCoords.lat, activeCoords.lng]];

    facilities.forEach((f) => {
      const dist = calculateHaversineDistance(activeCoords.lat, activeCoords.lng, f.lat, f.lng);

      // Filters check
      if (selectedRadius < 100 && dist > selectedRadius) return;
      if (filterType !== 'ALL' && f.type !== filterType) return;
      if (filterEmergencyOnly && !f.is24x7Emergency) return;
      if (filterFreeMedsOnly && !f.freeMedicinesAvailable) return;

      bounds.push([f.lat, f.lng]);

      const isSelected = f.id === selectedFacilityId;
      const config = getFacilityIconConfig(f.type);

      const facilityIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : config.bg};
            border: 2.5px solid ${isSelected ? '#ffffff' : config.border};
            color: ${config.text};
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '11px' : '10px'};
            font-weight: 800;
            font-family: sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            ${config.label}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([f.lat, f.lng], { icon: facilityIcon });
      markersLayer.addLayer(marker);

      const callText = t('auto.text_1063');
      const dirText = t('auto.text_1064');
      const bedsLabel = t('auto.text_1065');
      const docsLabel = t('auto.text_1066');

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${config.bg}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
              ${f.type}
            </span>
            <span style="font-size: 11px; font-weight: bold; color: #059669;">
              ${formatDistance(dist)}
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3; margin-bottom: 4px;">
            ${language === 'mr' ? f.nameMr : f.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${f.address}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; background: #f8fafc; padding: 6px; border-radius: 8px; font-size: 11px; margin-bottom: 8px;">
            <div>🛏️ <b>${formatNumber(f.bedsAvailable)}/${formatNumber(f.bedsTotal)}</b> ${bedsLabel}</div>
            <div>🩺 <b>${formatNumber(f.doctorsCount)}</b> ${docsLabel}</div>
          </div>
          ${f.is24x7Emergency ? `<div style="font-size: 10px; font-weight: bold; color: #e11d48; margin-bottom: 6px;">⚡ ${t('auto.text_1067')}</div>` : ''}
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            <a href="tel:${f.contactNumber.replace(/[^0-9+]/g, '')}" style="flex: 1; text-align: center; background: #059669; color: white; padding: 6px 8px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: bold;">
              📞 ${callText}
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #0284c7; color: white; padding: 6px 8px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: bold;">
              🗺️ ${dirText}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectFacility) {
          onSelectFacility(f);
        }
      });

      if (isSelected) {
        marker.openPopup();
      }
    });

    if (bounds.length > 1 && !selectedFacilityId) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 13 });
    }
  }, [facilities, activeCoords, selectedRadius, filterType, filterEmergencyOnly, filterFreeMedsOnly, selectedFacilityId, language, formatDistance, formatNumber]);

  // Pan to selected facility if changed from outside
  useEffect(() => {
    if (!selectedFacilityId || !mapInstanceRef.current) return;
    const target = facilities.find((f) => f.id === selectedFacilityId);
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 14, { duration: 1.2 });
    }
  }, [selectedFacilityId, facilities]);

  // Geolocation Handler
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setActiveCoords(coords);
        setActiveLocationName(t('auto.text_1068'));
        setGeoStatus('success');

        if (onUserCoordsChange) {
          onUserCoordsChange({ ...coords, locationName: 'GPS Location' });
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1 });
        }
      },
      () => {
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Location Selector Handler
  const handleLocationSelect = (locName: string) => {
    const matched = MAHARASHTRA_LOCATIONS.find((l) => l.name === locName);
    if (matched) {
      const coords = { lat: matched.lat, lng: matched.lng };
      setActiveCoords(coords);
      setActiveLocationName(language === 'mr' ? matched.nameMr : language === 'hi' ? matched.nameHi : matched.name);
      setGeoStatus('idle');

      if (onUserCoordsChange) {
        onUserCoordsChange({ ...coords, locationName: matched.name });
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([matched.lat, matched.lng], 12, { duration: 1 });
      }
    }
  };

  // Reset Center
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeCoords.lat, activeCoords.lng], 11, { duration: 0.8 });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Map Controls Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Location Picker & GPS Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGetLiveLocation}
              disabled={geoStatus === 'locating'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow transition-all cursor-pointer"
              title="Detect my current location"
            >
              <LocateFixed className={`w-4 h-4 ${geoStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>
                {geoStatus === 'locating'
                  ? t('auto.text_1069')
                  : t('auto.text_1070')}
              </span>
            </button>

            {/* Quick District/Taluka Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold hidden sm:inline">
                {t('auto.text_1071')}
              </span>
              <select
                value={activeLocationName}
                onChange={(e) => handleLocationSelect(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {MAHARASHTRA_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    📍 {language === 'mr' ? loc.nameMr : language === 'hi' ? loc.nameHi : loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Radius Selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>{t('auto.text_1072')}</span>
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              {[15, 30, 50, 100].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRadius(r)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedRadius === r
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {r === 100 ? (t('common.all')) : `${formatNumber(r)} km`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Message for Geolocation */}
        {geoStatus === 'denied' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {t('auto.text_1073')}
            </span>
          </div>
        )}

        {/* Secondary Filters Bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                >
                  <option value="ALL">{t('auto.text_1074')}</option>
                  <option value="PHC">PHC ({t('auto.text_1075')})</option>
                  <option value="CHC">CHC ({t('auto.text_1076')})</option>
                  <option value="District Hospital">{t('auto.text_1077')}</option>
                  <option value="Sub-District Hospital">{t('auto.text_1078')}</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterEmergencyOnly}
                  onChange={(e) => setFilterEmergencyOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span>{t('auto.text_1079')}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={filterFreeMedsOnly}
                  onChange={(e) => setFilterFreeMedsOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span>{t('auto.text_1080')}</span>
              </label>
            </div>

            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('auto.text_1081')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Leaflet Map View Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
        <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-10 bg-slate-100" />

        {/* Floating Legend Pill */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg text-[10px] font-bold flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>PHC</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span>CHC</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>{t('auto.text_1082')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>{t('auto.text_1083')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
