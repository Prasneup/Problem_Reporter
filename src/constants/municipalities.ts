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

export const DANG_CENTER = { lat: 28.006, lng: 82.403 };

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
  },
  {
    id: 'tulsipur',
    name: 'Tulsipur Sub-Metropolitan City',
    nepaliName: 'तुलसीपुर उपमहानगरपालिका',
    type: 'Sub-Metropolitan City',
    headquarters: 'Tulsipur',
    latitude: 28.131,
    longitude: 82.296,
    wardCount: 19
  },
  {
    id: 'lamahi',
    name: 'Lamahi Municipality',
    nepaliName: 'लमही नगरपालिका',
    type: 'Municipality',
    headquarters: 'Lamahi',
    latitude: 27.876,
    longitude: 82.548,
    wardCount: 9
  },
  {
    id: 'rapti',
    name: 'Rapti Rural Municipality',
    nepaliName: 'राप्ती गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Masuriya',
    latitude: 27.858,
    longitude: 82.695,
    wardCount: 9
  },
  {
    id: 'gadhawa',
    name: 'Gadhawa Rural Municipality',
    nepaliName: 'गढवा गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Gadhawa',
    latitude: 27.818,
    longitude: 82.518,
    wardCount: 8
  },
  {
    id: 'dangisharan',
    name: 'Dangisharan Rural Municipality',
    nepaliName: 'दंगीशरण गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Hekuli',
    latitude: 28.113,
    longitude: 82.189,
    wardCount: 7
  },
  {
    id: 'babai',
    name: 'Babai Rural Municipality',
    nepaliName: 'बबई गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Tulasipur (Hapur)',
    latitude: 28.188,
    longitude: 82.072,
    wardCount: 7
  },
  {
    id: 'shantinagar',
    name: 'Shantinagar Rural Municipality',
    nepaliName: 'शान्तिनगर गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Chirahana',
    latitude: 28.214,
    longitude: 82.176,
    wardCount: 7
  },
  {
    id: 'bangalachuli',
    name: 'Bangalachuli Rural Municipality',
    nepaliName: 'बंगलाचुली गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Kavre',
    latitude: 28.147,
    longitude: 82.585,
    wardCount: 8
  },
  {
    id: 'rajpur',
    name: 'Rajpur Rural Municipality',
    nepaliName: 'राजपुर गाउँपालिका',
    type: 'Rural Municipality',
    headquarters: 'Gangapraspur',
    latitude: 27.765,
    longitude: 82.342,
    wardCount: 7
  }
];
