import type { UserProfile, Report, Comment, WardBudget } from '../types';

export const MOCK_PROFILES: Record<string, UserProfile> = {
  citizen: {
    id: 'p-citizen',
    name: 'Ram Bahadur Thapa',
    email: 'ram@dang.gov.np',
    phone: '9847800000',
    role: 'Citizen',
    reputationPoints: 120,
    badgeIds: ['first_report', 'community_helper'],
    createdAt: '2026-01-10T10:00:00Z'
  },
  verifier: {
    id: 'p-verifier',
    name: 'Sita Kumari Chaudhary',
    email: 'sita@dang.gov.np',
    phone: '9857800001',
    role: 'Community Verifier',
    municipalityId: 'ghorahi',
    wardId: 15,
    reputationPoints: 450,
    badgeIds: ['first_report', 'community_helper', 'ward_champion'],
    createdAt: '2026-01-15T09:00:00Z'
  },
  inspector: {
    id: 'p-inspector',
    name: 'Hari Prasad Devkota',
    email: 'hari@dang.gov.np',
    phone: '9867800002',
    role: 'Field Inspector',
    municipalityId: 'ghorahi',
    wardId: 15,
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-02-01T08:30:00Z'
  },
  wardOfficer: {
    id: 'p-ward',
    name: 'Krishna Raj Oli',
    email: 'krishna.oli@ghorahi.gov.np',
    phone: '9807800003',
    role: 'Ward Officer',
    municipalityId: 'ghorahi',
    wardId: 15,
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  muniOfficer: {
    id: 'p-muni',
    name: 'Shyam Sundar Shrestha',
    email: 'shyam.shrestha@ghorahi.gov.np',
    phone: '9817800004',
    role: 'Municipality Officer',
    municipalityId: 'ghorahi',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  districtAdmin: {
    id: 'p-dist',
    name: 'Dr. Govinda Rijal',
    email: 'cdodan@dang.gov.np',
    phone: '9827800005',
    role: 'District Administrator',
    reputationPoints: 0,
    badgeIds: [],
    createdAt: '2026-01-01T10:00:00Z'
  },
  superAdmin: {
    id: 'p-super',
    name: 'Admin Bahadur',
    email: 'admin@dang.gov.np',
    role: 'Super Admin',
    reputationPoints: 999,
    badgeIds: ['civic_guardian'],
    createdAt: '2026-01-01T10:00:00Z'
  }
};

export const MOCK_BUDGETS: WardBudget[] = [
  { id: 'b1', municipalityId: 'ghorahi', wardId: 15, allocated: 5000000, spent: 3200000 },
  { id: 'b2', municipalityId: 'ghorahi', wardId: 2, allocated: 3500000, spent: 1100000 },
  { id: 'b3', municipalityId: 'tulsipur', wardId: 5, allocated: 4500000, spent: 2800000 },
  { id: 'b4', municipalityId: 'tulsipur', wardId: 12, allocated: 3000000, spent: 900000 },
  { id: 'b5', municipalityId: 'lamahi', wardId: 3, allocated: 2500000, spent: 2100000 }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'r-1',
    title: 'Severe Potholes on Ghorahi-Tulsipur Highway',
    description: 'Huge potholes near Ghorahi Ward 15 intersection causing frequent accidents and traffic blockages.',
    category: 'Potholes',
    latitude: 28.067,
    longitude: 82.478,
    address: 'Highway intersection, Ghorahi-15, Dang',
    municipalityId: 'ghorahi',
    wardId: 15,
    reporterId: 'p-citizen',
    status: 'Assigned',
    priority: 'High',
    supportCount: 18,
    duplicateCount: 2,
    assignedDepartment: 'Road Department',
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
          category: 'Potholes',
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
    category: 'Garbage',
    latitude: 27.878,
    longitude: 82.552,
    address: 'Vegetable Market, Lamahi-3, Dang',
    municipalityId: 'lamahi',
    wardId: 3,
    reporterId: 'p-citizen',
    status: 'Resolved',
    priority: 'Medium',
    supportCount: 5,
    duplicateCount: 0,
    assignedDepartment: 'Sanitation Division',
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
          category: 'Garbage',
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
    title: 'Landslide Blockage on Ghorahi-Pyuthan Road',
    description: 'Landslide triggered by recent heavy rainfall has completely blocked the road. Risk of further slides.',
    category: 'Emergency',
    latitude: 28.142,
    longitude: 82.592,
    address: 'Bangalachuli-4, Dang Hill Section',
    municipalityId: 'bangalachuli',
    wardId: 4,
    reporterId: 'p-verifier',
    status: 'In_Progress',
    priority: 'Emergency',
    supportCount: 42,
    duplicateCount: 5,
    assignedDepartment: 'Disaster Relief Division',
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
          category: 'Emergency',
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
    userId: 'p-ward',
    userName: 'Krishna Raj Oli',
    userRole: 'Ward Officer',
    content: 'Report verified. Assigning Ghorahi road maintenance team for a site assessment.',
    isOfficialUpdate: true,
    createdAt: '2026-06-02T09:00:00Z'
  },
  {
    id: 'c-2',
    reportId: 'r-1',
    userId: 'p-citizen',
    userName: 'Ram Bahadur Thapa',
    userRole: 'Citizen',
    content: 'Thank you ward officer. Please fix this soon, another motorcycle slipped here yesterday.',
    isOfficialUpdate: false,
    createdAt: '2026-06-02T11:15:00Z'
  }
];
