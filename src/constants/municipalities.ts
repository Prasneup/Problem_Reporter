export interface MunicipalityData {
  id: string;
  name: string;
  nepaliName: string;
  type: 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  headquarters: string;
  latitude: number;
  longitude: number;
  wardCount: number;
}

export const DANG_CENTER = { lat: 28.062, lng: 82.484 };

export const MUNICIPALITIES: MunicipalityData[] = [
  {
    id: 'ghorahi',
    name: 'Ghorahi Sub-Metropolitan City',
    nepaliName: 'घोराही उपमहानगरपालिका',
    type: 'Sub-Metropolitan City',
    headquarters: 'Ghorahi',
    latitude: 28.062,
    longitude: 82.484,
    wardCount: 19
  }
];
