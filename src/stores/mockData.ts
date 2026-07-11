import type { UserProfile, Report, Comment, WardBudget } from '../types';

export const MOCK_PROFILES: Record<string, UserProfile> = {
  citizen: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Yogesh Pulami',
    email: 'yogi@dang.gov.np',
    phone: '9847800000',
    role: 'Citizen',
    reputationPoints: 120,
    badgeIds: ['first_report', 'community_helper'],
    createdAt: '2026-01-10T10:00:00Z'
  },
  admin: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Ghorahi Municipality Admin',
    email: 'admin@ghorahimun.gov.np',
    phone: '9857800001',
    role: 'Admin',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  sanitation_officer: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Ramesh Chaudhary (Sanitation)',
    email: 'garbage@ghorahimun.demo',
    phone: '9867800002',
    role: 'Department Officer',
    department: 'Sanitation / Waste Management Mahashakha',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-02-01T08:30:00Z'
  },
  roads_officer: {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Binod Bhandari (Roads)',
    email: 'roads@ghorahimun.demo',
    phone: '9807800003',
    role: 'Department Officer',
    department: 'Road & Infrastructure Division',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  water_officer: {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Krishna Raj Oli (Water)',
    email: 'water@ghorahimun.demo',
    phone: '9817800004',
    role: 'Department Officer',
    department: 'Water Supply Department',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  drainage_officer: {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Shyam Sundar Shrestha (Drainage)',
    email: 'drainage@ghorahimun.demo',
    phone: '9827800005',
    role: 'Department Officer',
    department: 'Drainage Department',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  electrical_officer: {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Hari Prasad Devkota (Electrical)',
    email: 'electric@ghorahimun.demo',
    phone: '9837800006',
    role: 'Department Officer',
    department: 'Electrical Department',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  police_officer: {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Nepal Police Traffic Unit',
    email: 'police@ghorahimun.demo',
    phone: '9847800007',
    role: 'Department Officer',
    department: 'Nepal Police / Traffic Police',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  safety_officer: {
    id: '00000000-0000-0000-0000-000000000009',
    name: 'Nepal Police Security Unit',
    email: 'safety@ghorahimun.demo',
    phone: '9857800008',
    role: 'Department Officer',
    department: 'Nepal Police',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  fire_officer: {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Ghorahi Fire Station Command',
    email: 'fire@ghorahimun.demo',
    phone: '9867800009',
    role: 'Department Officer',
    department: 'Fire Response Department',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  }
};

export const MOCK_BUDGETS: WardBudget[] = [
  { id: 'b1', municipalityId: 'ghorahi', wardId: 15, allocated: 5000000, spent: 3200000 },
  { id: 'b2', municipalityId: 'ghorahi', wardId: 2, allocated: 3500000, spent: 1100000 },
  { id: 'b3', municipalityId: 'ghorahi', wardId: 5, allocated: 4500000, spent: 2800000 },
  { id: 'b4', municipalityId: 'ghorahi', wardId: 12, allocated: 3000000, spent: 900000 },
  { id: 'b5', municipalityId: 'ghorahi', wardId: 3, allocated: 2500000, spent: 2100000 }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r-1',
    title: 'Severe Potholes on Ghorahi-Tulsipur Highway',
    description: 'Huge potholes near Ghorahi Ward 15 intersection causing frequent accidents and traffic blockages.',
    category: 'Road Damage',
    latitude: 28.067,
    longitude: 82.478,
    address: 'Highway intersection, Ghorahi-15, Dang',
    municipalityId: 'ghorahi',
    wardId: 15,
    reporterId: '00000000-0000-0000-0000-000000000001',
    status: 'Assigned',
    priority: 'High',
    supportCount: 18,
    duplicateCount: 2,
    assignedDepartment: 'Road & Infrastructure Division',
    budgetEstimated: 120000,
    budgetSpent: 0,
    isEmergency: false,
    createdAt: '2026-06-01T10:30:00Z',
    updatedAt: '2026-06-03T14:20:00Z',
    images: [
      {
        id: 'img-1',
        reportId: 'r-1',
        url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
        imageType: 'before',
        aiAnalysis: {
          category: 'Road Damage',
          confidence: 0.94,
          qualityScore: 0.88,
          issuesDetected: ['pothole', 'cracked_asphalt'],
          isFake: false,
          isBlurry: false
        },
        createdAt: '2026-06-01T10:30:00Z'
      }
    ]
  },
  {
    id: 'r-2',
    title: 'Illegal Waste Dumping behind Lamahi Market',
    description: 'A large heap of municipal waste has been piled behind the vegetable market, leading to severe odor.',
    category: 'Garbage / Waste Management',
    latitude: 28.068,
    longitude: 82.486,
    address: 'Vegetable Market, Ghorahi-3, Dang',
    municipalityId: 'ghorahi',
    wardId: 3,
    reporterId: '00000000-0000-0000-0000-000000000001',
    status: 'Resolved',
    priority: 'Medium',
    supportCount: 5,
    duplicateCount: 0,
    assignedDepartment: 'Sanitation / Waste Management Mahashakha',
    budgetEstimated: 25000,
    budgetSpent: 22000,
    isEmergency: false,
    createdAt: '2026-05-25T08:15:00Z',
    updatedAt: '2026-05-29T17:00:00Z',
    images: [
      {
        id: 'img-2-before',
        reportId: 'r-2',
        url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60',
        imageType: 'before',
        aiAnalysis: {
          category: 'Garbage / Waste Management',
          confidence: 0.98,
          qualityScore: 0.91,
          issuesDetected: ['organic_waste', 'plastic_waste'],
          isFake: false,
          isBlurry: false
        },
        createdAt: '2026-05-25T08:15:00Z'
      },
      {
        id: 'img-2-after',
        reportId: 'r-2',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60',
        imageType: 'after',
        createdAt: '2026-05-29T17:00:00Z'
      }
    ]
  },
  {
    id: 'r-3',
    title: 'Major Traffic Collision on main chowk',
    description: 'A severe truck collision on the main chowk blocking all Ghorahi transit routes.',
    category: 'Accident / Traffic Emergency',
    latitude: 28.062,
    longitude: 82.484,
    address: 'Ghorahi Bazar Chowk, Ward 15',
    municipalityId: 'ghorahi',
    wardId: 15,
    reporterId: '00000000-0000-0000-0000-000000000001',
    status: 'In_Progress',
    priority: 'Emergency',
    supportCount: 42,
    duplicateCount: 5,
    assignedDepartment: 'Nepal Police / Traffic Police',
    budgetEstimated: 450000,
    budgetSpent: 150000,
    isEmergency: true,
    createdAt: '2026-06-05T16:00:00Z',
    updatedAt: '2026-06-05T18:00:00Z',
    images: [
      {
        id: 'img-3',
        reportId: 'r-3',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=60',
        imageType: 'before',
        aiAnalysis: {
          category: 'Accident / Traffic Emergency',
          confidence: 0.97,
          qualityScore: 0.95,
          issuesDetected: ['landslide', 'mudslide', 'roadblock'],
          isFake: false,
          isBlurry: false
        },
        createdAt: '2026-06-05T16:00:00Z'
      }
    ]
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    reportId: 'r-1',
    userId: '00000000-0000-0000-0000-000000000002',
    userName: 'Ghorahi Municipality Admin',
    userRole: 'Admin',
    content: 'Report verified. Manual forwarding to Road & Infrastructure Division completed.',
    isOfficialUpdate: true,
    createdAt: '2026-06-02T09:00:00Z'
  },
  {
    id: 'c-2',
    reportId: 'r-1',
    userId: '00000000-0000-0000-0000-000000000001',
    userName: 'Yogesh Pulami',
    userRole: 'Citizen',
    content: 'Thank you Admin. Please fix this soon, another motorcycle slipped here yesterday.',
    isOfficialUpdate: false,
    createdAt: '2026-06-02T11:15:00Z'
  }
];
