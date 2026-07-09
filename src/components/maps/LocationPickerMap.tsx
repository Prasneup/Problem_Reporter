import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DANG_CENTER } from '../../constants/municipalities';
import { ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface LocationPickerMapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onSelectCoords: (lat: number, lng: number, accuracy: number) => void;
  gpsAccuracy: number | null;
}

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

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  selectedCoords,
  onSelectCoords,
  gpsAccuracy,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const placementMarker = useRef<L.Marker | null>(null);
  const accuracyCircle = useRef<L.Circle | null>(null);
  const boundaryGroup = useRef<L.FeatureGroup | null>(null);
  const isDragging = useRef<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default to selectedCoords or Dang Center
    const initialCenter = selectedCoords
      ? [selectedCoords.lat, selectedCoords.lng]
      : [DANG_CENTER.lat, DANG_CENTER.lng];

    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      initialCenter as L.LatLngExpression,
      selectedCoords ? 16 : 13
    );
    mapInstance.current = map;

    // Minimal light style tile layer using CartoDB Positron
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20
    }).addTo(map);

    boundaryGroup.current = L.featureGroup().addTo(map);

    // Render Municipal Boundary Overlay (helpful boundary limit helper)
    const boundaryPoly = L.polygon(GHORAHI_BOUNDARY, {
      color: '#3b82f6',
      weight: 1.5,
      opacity: 0.4,
      fillColor: '#3b82f6',
      fillOpacity: 0.02,
      dashArray: '5, 8'
    });
    boundaryGroup.current.addLayer(boundaryPoly);

    // Allow user to tap/click map to drop/move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectCoords(e.latlng.lat, e.latlng.lng, 2.0); // manual set is high accuracy (2.0m)
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update selection marker and accuracy circle when selectedCoords or accuracy changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedCoords) return;

    // 1. Update/Create marker
    if (placementMarker.current) {
      placementMarker.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
    } else {
      placementMarker.current = L.marker([selectedCoords.lat, selectedCoords.lng], {
        draggable: true,
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

      // Listen to drag events
      placementMarker.current.on('dragstart', () => {
        isDragging.current = true;
      });

      placementMarker.current.on('drag', (e: any) => {
        // Move circle dynamically as marker is dragged
        if (accuracyCircle.current) {
          accuracyCircle.current.setLatLng(e.latlng);
        }
      });

      placementMarker.current.on('dragend', (e: any) => {
        isDragging.current = false;
        const newLatLng = e.target.getLatLng();
        onSelectCoords(newLatLng.lat, newLatLng.lng, 2.0);
      });
    }

    // 2. Update/Create accuracy circle
    const currentAccuracy = gpsAccuracy || 2.0;
    if (accuracyCircle.current) {
      accuracyCircle.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
      accuracyCircle.current.setRadius(currentAccuracy);
    } else {
      accuracyCircle.current = L.circle([selectedCoords.lat, selectedCoords.lng], {
        radius: currentAccuracy,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '3, 6'
      }).addTo(map);
    }

    // 3. Pan/Zoom map only if we are not actively dragging the marker
    if (!isDragging.current) {
      map.setView([selectedCoords.lat, selectedCoords.lng], 16);
    }
  }, [selectedCoords, gpsAccuracy]);

  const handleZoomIn = () => {
    mapInstance.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstance.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (selectedCoords) {
      mapInstance.current?.setView([selectedCoords.lat, selectedCoords.lng], 16);
    } else {
      mapInstance.current?.setView([DANG_CENTER.lat, DANG_CENTER.lng], 13);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner select-none font-sans">
      <div ref={mapRef} className="w-full h-full min-h-[250px]" />

      {/* Navigation Controls in Top Right */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-md transition-colors cursor-pointer"
          title="Recenter on Pin"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[300] bg-white/95 border border-slate-200 rounded-xl px-3 py-1.5 text-[9px] font-bold text-slate-600 backdrop-blur-sm shadow-sm select-none">
        Drag PIN or tap map to adjust location
      </div>
    </div>
  );
};

export default LocationPickerMap;
