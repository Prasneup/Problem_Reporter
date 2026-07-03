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

    // Set view centered on Ghorahi
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [DANG_CENTER.lat, DANG_CENTER.lng],
      13
    );
    mapInstance.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);

    // 1. Define Layer Views (Light Premium, Satellite, and Standard Streets)
    const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, and the GIS User Community',
      maxZoom: 19
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // Add Light layer as default view
    lightLayer.addTo(map);

    // 2. Add Native Leaflet Layer Switcher Control in top-right
    const baseLayers = {
      "Light Premium": lightLayer,
      "Satellite View": satelliteLayer,
      "Standard Streets": streetLayer
    };
    L.control.layers(baseLayers, undefined, { position: 'topright', collapsed: false }).addTo(map);

    markersGroup.current = L.featureGroup().addTo(map);
    heatGroup.current = L.featureGroup();
    gisGroup.current = L.featureGroup();

    // Support single click for easy Pin dropping
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

  // Update selection marker
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (placementMarker.current) {
      map.removeLayer(placementMarker.current);
      placementMarker.current = null;
    }

    if (selectedCoords) {
      // Add custom pinging active pin placement
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

  // Update Markers, Heatmaps, and GIS Layers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !markersGroup.current || !heatGroup.current || !gisGroup.current) return;

    markersGroup.current.clearLayers();
    heatGroup.current.clearLayers();
    gisGroup.current.clearLayers();

    reports.forEach((r) => {
      const color = r.priority === 'Emergency' ? '#dc2626' : r.priority === 'Critical' ? '#ea580c' : r.priority === 'High' ? '#eab308' : '#2563eb';
      const markerHtml = `<div class="w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform" style="background-color: ${color}">
        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
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
        <div class="p-1 min-w-[170px] font-sans">
          <h4 class="font-bold text-slate-800 text-xs m-0 leading-tight">${r.title}</h4>
          <p class="text-[10px] text-slate-500 m-0 mt-1 font-semibold">${r.category} | Ward ${r.wardId}</p>
          <span class="inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 text-blue-600 border border-blue-150">${r.status.replace('_', ' ')}</span>
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
        const poly = L.polyline(line as L.LatLngExpression[], { color: '#2563eb', weight: 3, opacity: 0.7, dashArray: '5, 10' });
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
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full min-h-[350px]" />
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 border border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-bold text-slate-650 backdrop-blur-sm shadow-sm select-none">
        Click map to select custom GPS location
      </div>
    </div>
  );
};
export default LeafletMap;
