export interface WardBoundary {
  wardNumber: number;
  name: string;
  polygon: [number, number][]; // Array of [lat, lng]
}

export const GHORAHI_WARDS: WardBoundary[] = [
  {
    wardNumber: 10,
    name: 'Narayanpur',
    polygon: [[28.03, 82.37], [28.06, 82.37], [28.06, 82.43], [28.03, 82.43]]
  },
  {
    wardNumber: 15,
    name: 'Ghorahi Bazar',
    polygon: [[28.058, 82.470], [28.075, 82.470], [28.075, 82.490], [28.058, 82.490]]
  },
  {
    wardNumber: 14,
    name: 'Bazar East/South',
    polygon: [[28.045, 82.480], [28.065, 82.480], [28.065, 82.510], [28.045, 82.510]]
  },
  {
    wardNumber: 13,
    name: 'Ghorahi South',
    polygon: [[28.010, 82.450], [28.045, 82.450], [28.045, 82.490], [28.010, 82.490]]
  },
  {
    wardNumber: 17,
    name: 'West Bazar',
    polygon: [[28.045, 82.430], [28.070, 82.430], [28.070, 82.470], [28.045, 82.470]]
  },
  {
    wardNumber: 16,
    name: 'Sauri / North',
    polygon: [[28.070, 82.440], [28.095, 82.440], [28.095, 82.475], [28.070, 82.475]]
  },
  {
    wardNumber: 18,
    name: 'Northeast Bazar',
    polygon: [[28.065, 82.490], [28.095, 82.490], [28.095, 82.520], [28.065, 82.520]]
  },
  {
    wardNumber: 19,
    name: 'Foothills North',
    polygon: [[28.095, 82.430], [28.180, 82.430], [28.180, 82.510], [28.095, 82.510]]
  },
  {
    wardNumber: 5,
    name: 'Tripur Dharna',
    polygon: [[28.010, 82.490], [28.065, 82.490], [28.065, 82.530], [28.010, 82.530]]
  },
  {
    wardNumber: 4,
    name: 'Tripur South',
    polygon: [[27.950, 82.450], [28.010, 82.450], [28.010, 82.500], [27.950, 82.500]]
  },
  {
    wardNumber: 1,
    name: 'Laxmipur',
    polygon: [[27.950, 82.500], [28.010, 82.500], [28.010, 82.530], [27.950, 82.530]]
  },
  {
    wardNumber: 2,
    name: 'Tripur East',
    polygon: [[27.950, 82.530], [28.010, 82.530], [28.010, 82.560], [27.950, 82.560]]
  },
  {
    wardNumber: 3,
    name: 'Tripur Far East',
    polygon: [[27.950, 82.560], [28.010, 82.560], [28.010, 82.600], [27.950, 82.600]]
  },
  {
    wardNumber: 6,
    name: 'Saigha South',
    polygon: [[28.010, 82.530], [28.065, 82.530], [28.065, 82.570], [28.010, 82.570]]
  },
  {
    wardNumber: 7,
    name: 'Saigha East',
    polygon: [[28.010, 82.570], [28.065, 82.570], [28.065, 82.610], [28.010, 82.610]]
  },
  {
    wardNumber: 8,
    name: 'Saigha Foothills',
    polygon: [[28.065, 82.520], [28.180, 82.520], [28.180, 82.610], [28.065, 82.610]]
  },
  {
    wardNumber: 9,
    name: 'Saigha West',
    polygon: [[28.065, 82.475], [28.095, 82.475], [28.095, 82.520], [28.065, 82.520]]
  },
  {
    wardNumber: 11,
    name: 'Hapur North',
    polygon: [[28.06, 82.37], [28.10, 82.37], [28.10, 82.42], [28.06, 82.42]]
  },
  {
    wardNumber: 12,
    name: 'Hapur East',
    polygon: [[28.06, 82.42], [28.10, 82.42], [28.10, 82.45], [28.06, 82.45]]
  }
];

export const TULSIPUR_WARDS: WardBoundary[] = [
  {
    wardNumber: 5,
    name: 'Tulsipur Bazar Center',
    polygon: [[28.125, 82.285], [28.140, 82.285], [28.140, 82.305], [28.125, 82.305]]
  },
  {
    wardNumber: 6,
    name: 'Tulsipur Bazar South',
    polygon: [[28.110, 82.285], [28.125, 82.285], [28.125, 82.305], [28.110, 82.305]]
  },
  {
    wardNumber: 12,
    name: 'Tulsipur Bazar West',
    polygon: [[28.120, 82.250], [28.140, 82.250], [28.140, 82.285], [28.120, 82.285]]
  },
  {
    wardNumber: 11,
    name: 'Tulsipur Southwest',
    polygon: [[28.100, 82.250], [28.120, 82.250], [28.120, 82.285], [28.100, 82.285]]
  },
  {
    wardNumber: 1,
    name: 'Hekuli North',
    polygon: [[28.140, 82.230], [28.180, 82.230], [28.180, 82.270], [28.140, 82.270]]
  },
  {
    wardNumber: 2,
    name: 'Hekuli East',
    polygon: [[28.140, 82.270], [28.180, 82.270], [28.180, 82.310], [28.140, 82.310]]
  },
  {
    wardNumber: 3,
    name: 'Tulsipur Northeast',
    polygon: [[28.140, 82.310], [28.180, 82.310], [28.180, 82.350], [28.140, 82.350]]
  },
  {
    wardNumber: 4,
    name: 'Tulsipur East',
    polygon: [[28.110, 82.305], [28.140, 82.305], [28.140, 82.330], [28.110, 82.330]]
  },
  {
    wardNumber: 7,
    name: 'Tulsipur Southeast',
    polygon: [[28.080, 82.285], [28.110, 82.285], [28.110, 82.320], [28.080, 82.320]]
  },
  {
    wardNumber: 8,
    name: 'Tulsipur Outer East',
    polygon: [[28.080, 82.320], [28.110, 82.320], [28.110, 82.350], [28.080, 82.350]]
  },
  {
    wardNumber: 9,
    name: 'Tulsipur South border',
    polygon: [[28.050, 82.280], [28.080, 82.280], [28.080, 82.330], [28.050, 82.330]]
  },
  {
    wardNumber: 10,
    name: 'Tulsipur South',
    polygon: [[28.050, 82.330], [28.080, 82.330], [28.080, 82.370], [28.050, 82.370]]
  },
  {
    wardNumber: 13,
    name: 'Tulsipur West Border',
    polygon: [[28.120, 82.210], [28.150, 82.210], [28.150, 82.250], [28.120, 82.250]]
  },
  {
    wardNumber: 14,
    name: 'Tulsipur Far West',
    polygon: [[28.150, 82.170], [28.200, 82.170], [28.200, 82.220], [28.150, 82.220]]
  },
  {
    wardNumber: 15,
    name: 'Tulsipur Northwest Hills',
    polygon: [[28.200, 82.150], [28.260, 82.150], [28.260, 82.220], [28.200, 82.220]]
  },
  {
    wardNumber: 16,
    name: 'Tulsipur North Hills',
    polygon: [[28.200, 82.220], [28.260, 82.220], [28.260, 82.280], [28.200, 82.280]]
  },
  {
    wardNumber: 17,
    name: 'Tulsipur Northeast Hills',
    polygon: [[28.180, 82.280], [28.250, 82.280], [28.250, 82.340], [28.180, 82.340]]
  },
  {
    wardNumber: 18,
    name: 'Tulsipur Outer Northeast',
    polygon: [[28.120, 82.330], [28.180, 82.330], [28.180, 82.370], [28.120, 82.370]]
  },
  {
    wardNumber: 19,
    name: 'Tulsipur West Outer',
    polygon: [[28.080, 82.230], [28.120, 82.230], [28.120, 82.270], [28.080, 82.270]]
  }
];

export const LAMAHI_WARDS: WardBoundary[] = [
  {
    wardNumber: 1,
    name: 'Lamahi North',
    polygon: [[27.88, 82.52], [27.91, 82.52], [27.91, 82.56], [27.88, 82.56]]
  },
  {
    wardNumber: 2,
    name: 'Lamahi Northeast',
    polygon: [[27.88, 82.56], [27.91, 82.56], [27.91, 82.60], [27.88, 82.60]]
  },
  {
    wardNumber: 3,
    name: 'Lamahi Bazar',
    polygon: [[27.85, 82.52], [27.88, 82.52], [27.88, 82.56], [27.85, 82.56]]
  },
  {
    wardNumber: 4,
    name: 'Lamahi East',
    polygon: [[27.85, 82.56], [27.88, 82.56], [27.88, 82.60], [27.85, 82.60]]
  },
  {
    wardNumber: 5,
    name: 'Lamahi Southwest',
    polygon: [[27.82, 82.52], [27.85, 82.52], [27.85, 82.56], [27.82, 82.56]]
  },
  {
    wardNumber: 6,
    name: 'Lamahi Southeast',
    polygon: [[27.82, 82.56], [27.85, 82.56], [27.85, 82.60], [27.82, 82.60]]
  },
  {
    wardNumber: 7,
    name: 'Lamahi Outer West',
    polygon: [[27.80, 82.48], [27.85, 82.48], [27.85, 82.52], [27.80, 82.52]]
  },
  {
    wardNumber: 8,
    name: 'Lamahi West Hills',
    polygon: [[27.85, 82.48], [27.90, 82.48], [27.90, 82.52], [27.85, 82.52]]
  },
  {
    wardNumber: 9,
    name: 'Lamahi South',
    polygon: [[27.80, 82.52], [27.82, 82.52], [27.82, 82.60], [27.80, 82.60]]
  }
];

export const MUNI_WARDS_MAP: Record<string, WardBoundary[]> = {
  ghorahi: GHORAHI_WARDS,
  tulsipur: TULSIPUR_WARDS,
  lamahi: LAMAHI_WARDS
};
