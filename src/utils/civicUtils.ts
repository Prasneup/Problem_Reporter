import type { Report, ReportCategory } from '../types';
import { MUNICIPALITIES } from '../constants/municipalities';
import { MUNI_WARDS_MAP } from '../constants/wardBoundaries';

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 1. Calculate Priority level dynamically
export function calculatePriority(category: ReportCategory, supports: number, isEmergency: boolean): 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency' {
  if (isEmergency || category === 'Emergency') return 'Emergency';
  const score = supports + (category === 'Road Damage' || category === 'Water Supply' ? 5 : 2);
  if (score > 30) return 'Critical';
  if (score > 15) return 'High';
  if (score > 5) return 'Medium';
  return 'Low';
}

// 2. Geodesic Ward & Municipality Detection (Mock Boundary Check)
export function detectMunicipalityAndWard(lat: number, lng: number) {
  let closestMuni = MUNICIPALITIES[0];
  let minDistance = Infinity;

  for (const muni of MUNICIPALITIES) {
    const dist = Math.sqrt(Math.pow(muni.latitude - lat, 2) + Math.pow(muni.longitude - lng, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closestMuni = muni;
    }
  }

  // Check if we have GIS boundaries for this municipality
  const wardBoundaries = MUNI_WARDS_MAP[closestMuni.id];
  if (wardBoundaries) {
    for (const wb of wardBoundaries) {
      if (isPointInPolygon(lat, lng, wb.polygon)) {
        return {
          municipalityId: closestMuni.id,
          municipalityName: closestMuni.name,
          wardId: wb.wardNumber,
          address: `${wb.name} Ward ${wb.wardNumber}, Dang District, Nepal`
        };
      }
    }
  }

  // Fallback using deterministic radial sectors around municipality headquarters
  const angle = Math.atan2(lat - closestMuni.latitude, lng - closestMuni.longitude) + Math.PI; // 0 to 2*PI
  const sectorCount = closestMuni.wardCount;
  const sectorWidth = (2 * Math.PI) / sectorCount;
  const ward = Math.min(sectorCount, Math.floor(angle / sectorWidth) + 1);

  return {
    municipalityId: closestMuni.id,
    municipalityName: closestMuni.name,
    wardId: ward,
    address: `${closestMuni.headquarters} Ward ${ward}, Dang District, Nepal`
  };
}

// 3. Infrastructure Health Index Calculator (0 - 100 scale)
export function calculateWardHealth(reports: Report[], wardId: number, municipalityId: string): number {
  const wardReports = reports.filter(r => r.wardId === wardId && r.municipalityId === municipalityId);
  if (wardReports.length === 0) return 96; // Excellent health by default

  const activeReports = wardReports.filter(r => r.status !== 'Resolved' && r.status !== 'Closed');
  const criticalReports = activeReports.filter(r => r.priority === 'Critical' || r.priority === 'Emergency');

  // Health formula: starting 100, deducting for issues, adding weight for resolution
  const score = 100 - (activeReports.length * 4) - (criticalReports.length * 10);

  // Ensure score stays bounded
  return Math.max(10, Math.min(100, Math.round(score)));
}

// 4. Nepal Timezone Date Formatter (UTC +5:45)
export function formatNepalTime(dateString: string): string {
  const date = new Date(dateString);
  // Add 5 hours and 45 minutes for Nepal Time
  const NPT_OFFSET = (5 * 60 + 45) * 60 * 1000;
  const nptDate = new Date(date.getTime() + NPT_OFFSET);

  return nptDate.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' NPT';
}
