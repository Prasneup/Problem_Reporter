import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Report } from '../../types';
import { DANG_CENTER } from '../../constants/municipalities';

interface LeafletMapProps {
  reports: Report[];
  onSelectCoords?: (lat: number, lng: number) => void;
  selectedCoords?: { lat: number; lng: number } | null;
  activeReportId?: string;
  showHeatmap?: boolean;
  showGisLayers?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports,
  onSelectCoords,
  selectedCoords,
  activeReportId,
  showHeatmap = false,
  showGisLayers = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.FeatureGroup | null>(null);
  const heatGroup = useRef<L.FeatureGroup | null>(null);
  const gisGroup = useRef<L.FeatureGroup | null>(null);
  const placementMarker = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [DANG_CENTER.lat, DANG_CENTER.lng],
      11
    );
    mapInstance.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'dark-map-tiles',
    }).addTo(map);

    markersGroup.current = L.featureGroup().addTo(map);
    heatGroup.current = L.featureGroup();
    gisGroup.current = L.featureGroup();

    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      if (onSelectCoords) {
        onSelectCoords(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [onSelectCoords]);

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
          html: `<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white animate-ping"></div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);
      map.setView([selectedCoords.lat, selectedCoords.lng], 14);
    }
  }, [selectedCoords]);

  // Update Markers, Heatmaps, and GIS Layers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !markersGroup.current || !heatGroup.current || !gisGroup.current) return;

    markersGroup.current.clearLayers();
    heatGroup.current.clearLayers();
    gisGroup.current.clearLayers();

    reports.forEach((r) => {
      const color = r.priority === 'Emergency' ? '#dc2626' : r.priority === 'Critical' ? '#ea580c' : r.priority === 'High' ? '#eab308' : '#3b82f6';
      const markerHtml = `<div class="w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg cursor-pointer" style="background-color: ${color}">
        <span class="w-2 h-2 rounded-full bg-white"></span>
      </div>`;

      const marker = L.marker([r.latitude, r.longitude], {
        icon: L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      });

      marker.bindPopup(`
        <div class="p-1 min-w-[160px]">
          <h4 class="font-bold text-slate-100 text-xs">${r.title}</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">${r.category} | Ward ${r.wardId}</p>
          <span class="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-blue-400 border border-slate-700">${r.status.replace('_', ' ')}</span>
        </div>
      `);

      markersGroup.current?.addLayer(marker);

      if (showHeatmap) {
        const radius = r.priority === 'Emergency' ? 600 : r.priority === 'Critical' ? 400 : 250;
        const opacity = r.priority === 'Emergency' ? 0.35 : 0.2;
        const heatCircle = L.circle([r.latitude, r.longitude], {
          radius,
          fillColor: color,
          fillOpacity: opacity,
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
        const poly = L.polyline(line as L.LatLngExpression[], { color: '#0ea5e9', weight: 3, opacity: 0.7, dashArray: '5, 10' });
        gisGroup.current?.addLayer(poly);
      });
    }

    if (showHeatmap) map.addLayer(heatGroup.current);
    else map.removeLayer(heatGroup.current);

    if (showGisLayers) map.addLayer(gisGroup.current);
    else map.removeLayer(gisGroup.current);

    if (activeReportId) {
      const active = reports.find((r) => r.id === activeReportId);
      if (active) {
        map.setView([active.latitude, active.longitude], 14);
      }
    }
  }, [reports, showHeatmap, showGisLayers, activeReportId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <div ref={mapRef} className="w-full h-full min-h-[350px]" />
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm">
        Double click map to select custom GPS location
      </div>
    </div>
  );
};
export default LeafletMap;
