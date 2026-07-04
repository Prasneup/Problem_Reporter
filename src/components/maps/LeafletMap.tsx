import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Report } from '../../types';
import { DANG_CENTER } from '../../constants/municipalities';
import { ZoomIn, ZoomOut, Compass, X } from 'lucide-react';

interface LeafletMapProps {
  reports: Report[];
  onSelectCoords?: (lat: number, lng: number) => void;
  selectedCoords?: { lat: number; lng: number } | null;
  activeReportId?: string;
  showHeatmap?: boolean;
  showGisLayers?: boolean;
}

// Haversine distance formula to calculate exact distance in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Municipal Boundary Bounding Polygon around Ghorahi core wards
const GHORAHI_BOUNDARY: L.LatLngExpression[] = [
  [28.085, 82.44],
  [28.095, 82.47],
  [28.08, 82.52],
  [28.05, 82.53],
  [28.03, 82.49],
  [28.04, 82.44],
  [28.06, 82.43]
];

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports,
  onSelectCoords,
  selectedCoords,
  activeReportId,
  showHeatmap: initialShowHeatmap = false,
  showGisLayers = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.FeatureGroup | null>(null);
  const heatGroup = useRef<L.FeatureGroup | null>(null);
  const gisGroup = useRef<L.FeatureGroup | null>(null);
  const boundaryGroup = useRef<L.FeatureGroup | null>(null);
  const placementMarker = useRef<L.Marker | null>(null);
  const radiusCircle = useRef<L.Circle | null>(null);
  const boundsFitted = useRef(false);

  // States
  const [localHeatmap, setLocalHeatmap] = useState(initialShowHeatmap);
  const [selectedRadiusReport, setSelectedRadiusReport] = useState<Report | null>(null);
  const [radiusMeters, setRadiusMeters] = useState<number>(500);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Center on Ghorahi
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [DANG_CENTER.lat, DANG_CENTER.lng],
      13
    );
    mapInstance.current = map;

    // 1. Sleek minimal light style using CartoDB Positron
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    markersGroup.current = L.featureGroup().addTo(map);
    heatGroup.current = L.featureGroup().addTo(map);
    gisGroup.current = L.featureGroup().addTo(map);
    boundaryGroup.current = L.featureGroup().addTo(map);

    // Render Municipal Boundary Overlay
    const boundaryPoly = L.polygon(GHORAHI_BOUNDARY, {
      color: '#3b82f6',
      weight: 1.5,
      opacity: 0.4,
      fillColor: '#3b82f6',
      fillOpacity: 0.02,
      dashArray: '5, 8'
    });
    boundaryGroup.current.addLayer(boundaryPoly);

    // Support single click pin dropping
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSelectCoords) {
        onSelectCoords(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [onSelectCoords]);

  // Dynamically fit map bounds on initial load of active pins
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || reports.length === 0 || boundsFitted.current) return;

    const latLngs = reports.map((r) => L.latLng(r.latitude, r.longitude));
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    boundsFitted.current = true;
  }, [reports]);

  // Handle Zoom operations via Custom Buttons
  const handleZoomIn = () => {
    mapInstance.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstance.current?.zoomOut();
  };

  // Recenter on cluster of active pins, or default center if none
  const handleRecenter = () => {
    const map = mapInstance.current;
    if (!map) return;

    if (reports.length > 0) {
      const latLngs = reports.map((r) => L.latLng(r.latitude, r.longitude));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    } else {
      map.setView([DANG_CENTER.lat, DANG_CENTER.lng], 13);
    }
  };

  // Update selection marker
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (placementMarker.current) {
      map.removeLayer(placementMarker.current);
      placementMarker.current = null;
    }

    if (selectedCoords) {
      placementMarker.current = L.marker([selectedCoords.lat, selectedCoords.lng], {
        icon: L.divIcon({
          html: `<div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow"></span>
          </div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);
      map.setView([selectedCoords.lat, selectedCoords.lng], 14);
    }
  }, [selectedCoords]);

  // Update Radius Circle drawing
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (radiusCircle.current) {
      map.removeLayer(radiusCircle.current);
      radiusCircle.current = null;
    }

    if (selectedRadiusReport) {
      radiusCircle.current = L.circle([selectedRadiusReport.latitude, selectedRadiusReport.longitude], {
        radius: radiusMeters,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '3, 6'
      }).addTo(map);
    }
  }, [selectedRadiusReport, radiusMeters]);

  // Update Markers, Heatmaps, and GIS Layers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !markersGroup.current || !heatGroup.current || !gisGroup.current) return;

    markersGroup.current.clearLayers();
    heatGroup.current.clearLayers();
    gisGroup.current.clearLayers();

    reports.forEach((r) => {
      const color =
        r.priority === 'Emergency'
          ? '#ef4444' // Red
          : r.priority === 'Critical'
          ? '#f97316' // Orange
          : r.priority === 'High'
          ? '#f59e0b' // Amber
          : '#3b82f6'; // Blue

      // 1. Draw standard markers only if heatmap is off
      if (!localHeatmap) {
        const markerHtml = `<div class="w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform" style="background-color: ${color}">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </div>`;

        const marker = L.marker([r.latitude, r.longitude], {
          icon: L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          })
        });

        marker.on('click', () => {
          setSelectedRadiusReport(r);
        });

        marker.bindPopup(`
          <div class="p-1.5 min-w-[180px] font-sans font-bold">
            <h4 class="font-extrabold text-slate-800 text-xs m-0 leading-tight">${r.title}</h4>
            <p class="text-[10px] text-slate-500 m-0 mt-1 font-semibold">${r.category} | Ward ${r.wardId}</p>
            <div class="mt-2.5 flex items-center justify-between">
              <span class="inline-block px-2 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-blue-600 border border-blue-150">${r.status.replace('_', ' ')}</span>
              <span class="text-[8.5px] text-blue-600 underline cursor-pointer hover:text-blue-800">Check Radius</span>
            </div>
          </div>
        `);

        markersGroup.current?.addLayer(marker);
      } else {
        // 2. Draw smooth density gradient heatmap overlay circles
        const heatCircle = L.circle([r.latitude, r.longitude], {
          radius: r.priority === 'Emergency' ? 450 : r.priority === 'Critical' ? 350 : 200,
          fillColor: color,
          fillOpacity: 0.22,
          stroke: false
        });
        heatGroup.current?.addLayer(heatCircle);
      }
    });

    if (showGisLayers) {
      const pipes = [
        [[28.062, 82.484], [28.068, 82.478], [28.075, 82.49]],
        [[28.131, 82.296], [28.125, 82.31], [28.14, 82.285]]
      ];
      pipes.forEach(line => {
        const poly = L.polyline(line as L.LatLngExpression[], { color: '#2563eb', weight: 3, opacity: 0.7, dashArray: '5, 10' });
        gisGroup.current?.addLayer(poly);
      });
    }

    if (activeReportId) {
      const active = reports.find((r) => r.id === activeReportId);
      if (active) {
        map.setView([active.latitude, active.longitude], 14);
      }
    }
  }, [reports, localHeatmap, showGisLayers, activeReportId]);

  // Calculate nearby reports inside the active radius circle
  const getNearbyReportsCount = () => {
    if (!selectedRadiusReport) return 0;
    return reports.filter(
      (r) =>
        r.id !== selectedRadiusReport.id &&
        getDistance(selectedRadiusReport.latitude, selectedRadiusReport.longitude, r.latitude, r.longitude) <= radiusMeters
    ).length;
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner select-none font-sans">
      
      {/* Mapbox/Leaflet container */}
      <div ref={mapRef} className="w-full h-full min-h-[350px]" />

      {/* Modern custom zoom/navigation controls in top-right */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek toggle switcher on top-left for Heatmap vs Pins */}
      <div className="absolute top-4 left-4 z-[400] bg-white/95 border border-slate-200 rounded-xl p-1.5 flex gap-1 shadow-md backdrop-blur-sm">
        <button
          onClick={() => setLocalHeatmap(false)}
          className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
            !localHeatmap
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-550 hover:bg-slate-50'
          }`}
        >
          Pins
        </button>
        <button
          onClick={() => setLocalHeatmap(true)}
          className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-colors cursor-pointer ${
            localHeatmap
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-550 hover:bg-slate-50'
          }`}
        >
          Heatmap
        </button>
      </div>

      {/* Floating Selected Radius Dashboard (Bottom Center/Left) */}
      {selectedRadiusReport && (
        <div className="absolute bottom-14 left-4 right-4 sm:right-auto sm:w-80 z-[400] bg-white/95 border border-slate-250 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col space-y-3 font-bold border-l-4 border-l-blue-600 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-600">Active Radius Analyzer</span>
              <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{selectedRadiusReport.title}</h4>
            </div>
            <button
              onClick={() => setSelectedRadiusReport(null)}
              className="text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between text-center select-none">
            <div>
              <span className="text-[7.5px] font-extrabold text-slate-400 uppercase">Analysis Zone</span>
              <div className="text-xs font-extrabold text-slate-850 mt-0.5">{radiusMeters} Meters</div>
            </div>
            <div className="border-r border-slate-200 h-6" />
            <div>
              <span className="text-[7.5px] font-extrabold text-slate-400 uppercase">Cluster Load</span>
              <div className="text-xs font-extrabold text-blue-600 mt-0.5">{getNearbyReportsCount()} Nearby Issues</div>
            </div>
          </div>

          {/* Interactive Radius buttons */}
          <div className="flex gap-2">
            {[200, 500, 1000].map((m) => (
              <button
                key={m}
                onClick={() => setRadiusMeters(m)}
                className={`flex-1 py-1 rounded-lg border text-[9.5px] font-extrabold transition-colors cursor-pointer ${
                  radiusMeters === m
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {m >= 1000 ? '1 KM' : `${m}M`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* bottom description instruction */}
      <div className="absolute bottom-3 left-3 z-[300] bg-white/95 border border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-bold text-slate-600 backdrop-blur-sm shadow-sm select-none">
        Click map to drop PIN location | Click any PIN for Radius analytics
      </div>
    </div>
  );
};
export default LeafletMap;
