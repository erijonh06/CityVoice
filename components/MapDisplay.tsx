import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Report, ReportStatus, ReportCategory } from '../types';
import PollWidget from './PollWidget';
import { useTranslation } from '../TranslationContext';

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 };
const DEFAULT_ZOOM = 14;

interface MapDisplayProps {
  reports: Report[];
  onMapClick?: (lat: number, lng: number) => void;
  onReportClick: (report: Report) => void;
  onReportPositionChange?: (id: string, lat: number, lng: number) => void;
  onMapError?: (message: string) => void;
  interactive: boolean;
  enableDragging?: boolean;
  newReportLocation?: { lat: number, lng: number } | null;
  isDarkMode?: boolean;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  reports, 
  onMapClick, 
  onReportClick, 
  onReportPositionChange,
  onMapError,
  interactive,
  enableDragging = false,
  newReportLocation,
  isDarkMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const { t } = useTranslation();
  const newReportMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false
    });

    map.on('click', (e) => {
      if (onMapClick && interactive) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapRef.current = map;
    handleLocateMe();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tiles based on Theme
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = isDarkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapRef.current);
  }, [isDarkMode]);

  const handleLocateMe = () => {
    if (!mapRef.current) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latLng = { lat: latitude, lng: longitude };
        mapRef.current?.flyTo(latLng, 16);
        L.marker(latLng, {
           icon: L.divIcon({
               className: 'bg-transparent',
               html: `<div class="relative flex items-center justify-center"><div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div></div>`,
               iconSize: [24, 24],
               iconAnchor: [12, 12]
           })
        }).addTo(mapRef.current).bindPopup(t('yourLocation'));
      }, (err) => {
        const errorMessages: Record<number, string> = {
          1: "Permission denied for location.",
          2: "Position unavailable.",
          3: "Request timed out."
        };
        const errorMsg = errorMessages[err.code] || t('unknownGpsError');
        if (onMapError) onMapError(errorMsg);
      });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Always show all reports now that filter is removed from top
    const filteredReports = reports;

    Object.keys(markersRef.current).forEach(id => {
       if (!filteredReports.find(r => r.id === id)) {
           markersRef.current[id].remove();
           delete markersRef.current[id];
       }
    });
    filteredReports.forEach(report => {
       if (markersRef.current[report.id]) {
           markersRef.current[report.id].setLatLng([report.location.lat, report.location.lng]);
           return;
       }
       const iconHtml = `
         <div id="marker-${report.id}" class="marker-container relative group transform transition hover:scale-110">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 text-white relative
              ${report.status === ReportStatus.SOLVED ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-rose-400 to-orange-400'}">
              <span class="material-icons-round text-base drop-shadow-md">
                ${report.status === ReportStatus.SOLVED ? 'check' : report.category === 'Safety' ? 'local_police' : report.category === 'Cleanliness' ? 'delete' : 'location_on'}
              </span>
            </div>
         </div>
       `;
       const marker = L.marker([report.location.lat, report.location.lng], {
           icon: L.divIcon({ className: 'bg-transparent border-none', html: iconHtml, iconSize: [40, 40], iconAnchor: [20, 20] }),
           draggable: enableDragging
       }).addTo(mapRef.current);
       
       marker.on('click', (e) => { 
           if (!enableDragging) {
               // Visual feedback animation
               const element = document.getElementById(`marker-${report.id}`);
               if (element) {
                   element.classList.remove('animate-marker-click');
                   void element.offsetWidth; // Trigger reflow
                   element.classList.add('animate-marker-click');
               }
               onReportClick(report); 
           }
       });
       markersRef.current[report.id] = marker;
    });
  }, [reports, enableDragging]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (newReportLocation) {
      if (!newReportMarkerRef.current) {
        newReportMarkerRef.current = L.marker([newReportLocation.lat, newReportLocation.lng], {
          icon: L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div class="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 text-yellow-900"><span class="material-icons-round text-2xl">add_location_alt</span></div>`,
            iconSize: [48, 48],
            iconAnchor: [24, 48]
          })
        }).addTo(mapRef.current);
      } else {
        newReportMarkerRef.current.setLatLng([newReportLocation.lat, newReportLocation.lng]);
      }
    } else {
      if (newReportMarkerRef.current) { newReportMarkerRef.current.remove(); newReportMarkerRef.current = null; }
    }
  }, [newReportLocation]);

  return (
    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-inner border-[6px] border-white dark:border-slate-800 transition-colors">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Small Legend Overlay */}
      <div className="absolute top-4 left-6 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 dark:border-slate-800 flex flex-col gap-1 transition-colors pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Active Report</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Fixed Issue</span>
          </div>
      </div>

      <div className="absolute bottom-6 left-6 z-[400] hidden md:block"><PollWidget /></div>
    </div>
  );
};

export default MapDisplay;