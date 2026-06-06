export type UserRole =
  | 'Citizen'
  | 'Community Verifier'
  | 'Field Inspector'
  | 'Ward Officer'
  | 'Municipality Officer'
  | 'District Administrator'
  | 'Super Admin';

export type ReportCategory =
  | 'Road Damage'
  | 'Potholes'
  | 'Garbage'
  | 'Water Supply'
  | 'Drainage'
  | 'Electricity'
  | 'Street Lights'
  | 'Environmental Issues'
  | 'Public Safety'
  | 'Infrastructure Problems'
  | 'Other'
  | 'Emergency';

export type ReportStatus =
  | 'Submitted'
  | 'AI_Flagged'
  | 'Under_Review'
  | 'Verified'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened'
  | 'Closed';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  municipalityId?: string;
  wardId?: number;
  reputationPoints: number;
  badgeIds: string[];
  createdAt: string;
}

export interface ReportImage {
  id: string;
  reportId: string;
  url: string;
  imageType: 'before' | 'after';
  aiAnalysis?: {
    category: string;
    confidence: number;
    qualityScore: number;
    issuesDetected: string[];
    isFake: boolean;
    isBlurry: boolean;
  };
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  address: string;
  municipalityId: string;
  wardId: number;
  reporterId: string;
  status: ReportStatus;
  priority: PriorityLevel;
  supportCount: number;
  duplicateCount: number;
  assignedDepartment?: string;
  budgetEstimated: number;
  budgetSpent: number;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
  images: ReportImage[];
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  isOfficialUpdate: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  reportId: string;
  inspectorId: string;
  inspectorName: string;
  assignedBy: string;
  notes?: string;
  status: 'Assigned' | 'In_Transit' | 'Inspecting' | 'Completed' | 'Failed';
  createdAt: string;
  completedAt?: string;
}

export interface VerificationLog {
  id: string;
  reportId: string;
  verifierId: string;
  verifierName: string;
  verificationType: 'citizen_verifier' | 'ward_officer' | 'field_inspector';
  statusChange: string;
  notes: string;
  createdAt: string;
}

export interface WardBudget {
  id: string;
  municipalityId: string;
  wardId: number;
  allocated: number;
  spent: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconType: string;
  pointsThreshold: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'escalation' | 'reward';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  tableName: string;
  recordId: string;
  timestamp: string;
}
