import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, UserProfile, Report, Comment, Notification, WardBudget, Assignment } from '../types';
import { MOCK_PROFILES, MOCK_REPORTS, MOCK_COMMENTS, MOCK_BUDGETS } from './mockData';
import { calculatePriority } from '../utils/civicUtils';

interface CivicState {
  language: 'en' | 'ne';
  currentUser: UserProfile;
  reports: Report[];
  comments: Comment[];
  assignments: Assignment[];
  budgets: WardBudget[];
  notifications: Notification[];
  offlineQueue: Report[];
  isOnline: boolean;
  
  // Actions
  setLanguage: (lang: 'en' | 'ne') => void;
  setUserRole: (role: UserRole) => void;
  setOnlineStatus: (status: boolean) => void;
  
  submitReport: (report: Omit<Report, 'id' | 'reporterId' | 'status' | 'priority' | 'supportCount' | 'duplicateCount' | 'createdAt' | 'updatedAt' | 'images'> & { imageUrl?: string }) => void;
  supportReport: (reportId: string) => void;
  addComment: (reportId: string, content: string) => void;
  updateReportStatus: (reportId: string, status: Report['status'], notes?: string) => void;
  
  assignInspector: (reportId: string, inspectorId: string, inspectorName: string, notes?: string) => void;
  completeAssignment: (reportId: string, afterImageUrl: string, notes?: string) => void;
  reopenReport: (reportId: string, notes: string, imageUrl: string) => void;
  syncOfflineQueue: () => void;
  dismissNotification: (id: string) => void;
}

export const useCivicStore = create<CivicState>()(
  persist(
    (set, get) => ({
      language: 'en',
      currentUser: MOCK_PROFILES.citizen,
      reports: MOCK_REPORTS,
      comments: MOCK_COMMENTS,
      assignments: [],
      budgets: MOCK_BUDGETS,
      notifications: [
        {
          id: 'n-welcome',
          userId: 'p-citizen',
          title: 'Welcome to Dang Smart City Portal',
          message: 'Thank you for participating in digital governance. Submit your reports to clean and fix our district.',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ],
      offlineQueue: [],
      isOnline: true,

      setLanguage: (language) => set({ language }),
      
      setUserRole: (role) => {
        const profileKey = Object.keys(MOCK_PROFILES).find(
          (key) => MOCK_PROFILES[key].role === role
        ) || 'citizen';
        set({ currentUser: MOCK_PROFILES[profileKey] });
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline && get().offlineQueue.length > 0) {
          get().syncOfflineQueue();
        }
      },

      submitReport: (newReport) => {
        const id = 'r-' + Math.random().toString(36).substring(2, 11);
        const now = new Date().toISOString();
        const user = get().currentUser;
        
        const imgUrl = newReport.imageUrl || 'https://images.unsplash.com/photo-1594913785162-e6785b4938a2?w=800&auto=format&fit=crop&q=60';
        const isEmergency = newReport.isEmergency || newReport.category === 'Emergency';
        const initialStatus = isEmergency ? 'Under_Review' : 'Submitted';
        const detectedIssues = [newReport.category.toLowerCase().replace(' ', '_')];
        
        const reportObj: Report = {
          ...newReport,
          id,
          reporterId: user.id,
          status: initialStatus,
          priority: calculatePriority(newReport.category, 0, isEmergency),
          supportCount: 0,
          duplicateCount: 0,
          budgetEstimated: isEmergency ? 150000 : 35000,
          budgetSpent: 0,
          createdAt: now,
          updatedAt: now,
          images: [{
            id: 'img-' + Math.random().toString(36).substring(2, 11),
            reportId: id,
            url: imgUrl,
            imageType: 'before',
            aiAnalysis: {
              category: newReport.category,
              confidence: 0.92,
              qualityScore: 0.85,
              issuesDetected: detectedIssues,
              isFake: false,
              isBlurry: false
            },
            createdAt: now
          }]
        };

        if (!get().isOnline) {
          set((state) => ({
            offlineQueue: [...state.offlineQueue, reportObj],
            notifications: [
              {
                id: 'n-offline-' + Date.now(),
                userId: user.id,
                title: 'Offline Report Queued',
                message: 'No internet connection detected. Your report has been saved locally and will sync once connection returns.',
                type: 'warning',
                isRead: false,
                createdAt: now
              },
              ...state.notifications
            ]
          }));
          return;
        }

        set((state) => {
          const pointsAwarded = isEmergency ? 25 : 10;
          const updatedUser = {
            ...state.currentUser,
            reputationPoints: state.currentUser.reputationPoints + pointsAwarded
          };

          const newNotification: Notification = {
            id: 'n-' + Math.random().toString(36).substring(2, 11),
            userId: user.id,
            title: 'Report Submitted Successfully',
            message: `Your report "${newReport.title}" has been registered. You earned ${pointsAwarded} Reputation Points!`,
            type: 'success',
            isRead: false,
            createdAt: now
          };

          return {
            reports: [reportObj, ...state.reports],
            currentUser: updatedUser,
            notifications: [newNotification, ...state.notifications]
          };
        });
      },

      supportReport: (reportId) => {
        set((state) => {
          const now = new Date().toISOString();
          const reports = state.reports.map((r) => {
            if (r.id === reportId) {
              const nextSupports = r.supportCount + 1;
              const nextPriority = (nextSupports > 25 && r.priority !== 'Emergency')
                ? 'Critical'
                : calculatePriority(r.category, nextSupports, r.isEmergency);
              const nextStatus = (nextSupports > 25 && r.priority !== 'Emergency')
                ? 'Under_Review'
                : r.status;
              
              return {
                ...r,
                supportCount: nextSupports,
                priority: nextPriority,
                status: nextStatus,
                updatedAt: now
              };
            }
            return r;
          });

          const updatedUser = {
            ...state.currentUser,
            reputationPoints: state.currentUser.reputationPoints + 2
          };

          return { reports, currentUser: updatedUser };
        });
      },

      addComment: (reportId, content) => {
        const user = get().currentUser;
        const commentObj: Comment = {
          id: 'c-' + Math.random().toString(36).substring(2, 11),
          reportId,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          content,
          isOfficialUpdate: ['Ward Officer', 'Municipality Officer', 'District Administrator', 'Super Admin'].includes(user.role),
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          comments: [...state.comments, commentObj]
        }));
      },

      updateReportStatus: (reportId, status, notes) => {
        set((state) => {
          const now = new Date().toISOString();
          const reports = state.reports.map((r) => {
            if (r.id === reportId) {
              let budgetSpent = r.budgetSpent;
              if (status === 'Resolved' && r.budgetSpent === 0) {
                budgetSpent = r.budgetEstimated;
              }
              return { ...r, status, budgetSpent, updatedAt: now };
            }
            return r;
          });

          const targetReport = state.reports.find(r => r.id === reportId);
          const newNotifications = [...state.notifications];
          if (targetReport) {
            newNotifications.unshift({
              id: 'n-stat-' + Math.random().toString(36).substring(2, 11),
              userId: targetReport.reporterId,
              title: `Report Status Updated`,
              message: `Your report "${targetReport.title}" is now: ${status.replace('_', ' ')}. Note: ${notes || 'Updated by municipal team.'}`,
              type: status === 'Resolved' ? 'success' : 'info',
              isRead: false,
              createdAt: now
            });
          }

          let budgets = state.budgets;
          if (status === 'Resolved' && targetReport) {
            budgets = state.budgets.map(b => {
              if (b.municipalityId === targetReport.municipalityId && b.wardId === targetReport.wardId) {
                return { ...b, spent: b.spent + targetReport.budgetEstimated };
              }
              return b;
            });
          }

          return { reports, notifications: newNotifications, budgets };
        });
      },

      assignInspector: (reportId, inspectorId, inspectorName, notes) => {
        const now = new Date().toISOString();
        const assignmentObj: Assignment = {
          id: 'a-' + Math.random().toString(36).substring(2, 11),
          reportId,
          inspectorId,
          inspectorName,
          assignedBy: get().currentUser.name,
          notes,
          status: 'Assigned',
          createdAt: now
        };

        set((state) => {
          const assignments = [...state.assignments, assignmentObj];
          const reports = state.reports.map(r => 
            r.id === reportId ? { ...r, status: 'Assigned' as const, updatedAt: now } : r
          );
          
          const newNotifications = [
            {
              id: 'n-insp-' + Math.random().toString(36).substring(2, 11),
              userId: inspectorId,
              title: 'New Inspection Assignment',
              message: `You have been assigned to inspect: "${state.reports.find(r => r.id === reportId)?.title}"`,
              type: 'info' as const,
              isRead: false,
              createdAt: now
            },
            ...state.notifications
          ];

          return { assignments, reports, notifications: newNotifications };
        });
      },

      completeAssignment: (reportId, afterImageUrl) => {
        const now = new Date().toISOString();
        set((state) => {
          const assignments = state.assignments.map(a => 
            a.reportId === reportId ? { ...a, status: 'Completed' as const, completedAt: now } : a
          );

          const reports = state.reports.map(r => {
            if (r.id === reportId) {
              const updatedImages = [
                ...r.images,
                {
                  id: 'img-after-' + Math.random().toString(36).substring(2, 11),
                  reportId: r.id,
                  url: afterImageUrl,
                  imageType: 'after' as const,
                  createdAt: now
                }
              ];
              return { 
                ...r, 
                status: 'Resolved' as const, 
                budgetSpent: r.budgetEstimated,
                updatedAt: now,
                images: updatedImages 
              };
            }
            return r;
          });

          const targetReport = state.reports.find(r => r.id === reportId);
          const newNotifications = [...state.notifications];
          if (targetReport) {
            newNotifications.unshift({
              id: 'n-resolved-' + Math.random().toString(36).substring(2, 11),
              userId: targetReport.reporterId,
              title: 'Civic Issue Resolved!',
              message: `Fantastic! The issue "${targetReport.title}" has been successfully resolved. Thank you for your support.`,
              type: 'success',
              isRead: false,
              createdAt: now
            });
          }

          return { assignments, reports, notifications: newNotifications };
        });
      },

      reopenReport: (reportId, notes, imageUrl) => {
        const now = new Date().toISOString();
        set((state) => {
          const reports = state.reports.map(r => {
            if (r.id === reportId) {
              const updatedImages = r.images.filter(img => img.imageType !== 'after');
              updatedImages.push({
                id: 'img-reopen-' + Math.random().toString(36).substring(2, 11),
                reportId: r.id,
                url: imageUrl,
                imageType: 'before' as const,
                createdAt: now
              });
              return {
                ...r,
                status: 'Reopened' as const,
                description: `${r.description}\n\n[Reopened on ${now.split('T')[0]}: ${notes}]`,
                updatedAt: now,
                images: updatedImages
              };
            }
            return r;
          });

          return { reports };
        });
      },

      syncOfflineQueue: () => {
        const queue = get().offlineQueue;
        if (queue.length === 0) return;
        
        set((state) => {
          const syncedReports = queue.map((report) => ({
            ...report,
            id: 'r-' + Math.random().toString(36).substring(2, 11),
            status: 'Submitted' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

          const syncNotification: Notification = {
            id: 'n-sync-' + Date.now(),
            userId: state.currentUser.id,
            title: 'Offline Reports Synchronized',
            message: `Successfully synchronized ${queue.length} reports submitted offline.`,
            type: 'success',
            isRead: false,
            createdAt: new Date().toISOString()
          };

          return {
            reports: [...syncedReports, ...state.reports],
            offlineQueue: [],
            notifications: [syncNotification, ...state.notifications]
          };
        });
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        }));
      }
    }),
    {
      name: 'dang-smart-city-store',
      partialize: (state) => ({
        reports: state.reports,
        comments: state.comments,
        assignments: state.assignments,
        budgets: state.budgets,
        notifications: state.notifications,
        language: state.language
      })
    }
  )
);
