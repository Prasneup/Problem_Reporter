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
  setCurrentUser: (user: UserProfile) => void;
  setOnlineStatus: (status: boolean) => void;
  loadInitialData: () => Promise<void>;
  signOut: () => Promise<void>;

  submitReport: (report: Omit<Report, 'id' | 'reporterId' | 'status' | 'priority' | 'supportCount' | 'duplicateCount' | 'createdAt' | 'updatedAt' | 'images'> & { imageUrl?: string; aiAnalysis?: any }) => Promise<void>;
  supportReport: (reportId: string) => Promise<void>;
  addComment: (reportId: string, content: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: Report['status'], notes?: string) => Promise<void>;

  assignDepartment: (reportId: string, department: string, remarks: string, priority: Report['priority'], status?: Report['status']) => Promise<void>;
  resolveReportByDepartment: (reportId: string, remarks: string, proofUrl?: string) => Promise<void>;

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
          id: 'n-init',
          userId: 'p-citizen',
          title: 'Welcome to Ghorahi Smart City Portal',
          message: 'Submit reports on waste, road damage, lighting or emergencies directly to the municipal team.',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ],
      offlineQueue: [],
      isOnline: true,

      setLanguage: (language) => set({ language }),

      setUserRole: (role) => {
        // Find profile with matching role
        const profileKey = Object.keys(MOCK_PROFILES).find(
          (key) => MOCK_PROFILES[key].role === role
        );
        if (profileKey) {
          set({ currentUser: MOCK_PROFILES[profileKey] });
        }
      },

      setCurrentUser: (currentUser) => set({ currentUser }),

      signOut: async () => {
        try {
          const { supabase } = await import('../lib/supabase');
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Sign out error:', err);
        }
        set({ currentUser: MOCK_PROFILES.citizen });
      },

      loadInitialData: async () => {
        if (!get().isOnline) return;
        try {
          const { default: reportService } = await import('../services/reportService');
          const reports = await reportService.fetchReports();
          const budgets = await reportService.fetchBudgets();
          const comments = await reportService.fetchComments();
          if (reports && reports.length > 0) {
            set({ reports });
          }
          if (budgets && budgets.length > 0) {
            set({ budgets });
          }
          if (comments && comments.length > 0) {
            set({ comments });
          }
        } catch (err) {
          console.error('Error loading initial data from Supabase:', err);
        }
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        if (isOnline && get().offlineQueue.length > 0) {
          get().syncOfflineQueue();
        }
      },

      submitReport: async (newReport) => {
        const id = 'r-' + Math.random().toString(36).substring(2, 11);
        const now = new Date().toISOString();
        const user = get().currentUser;

        let imgUrl = newReport.imageUrl || '';
        const isEmergency = newReport.isEmergency || ['Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].includes(newReport.category);
        
        let initialStatus: Report['status'] = isEmergency ? 'Under_Review' : 'Submitted';
        if (newReport.aiAnalysis) {
          const trustScore = newReport.aiAnalysis.trustScore;
          if (trustScore < 75) {
            initialStatus = 'Under_Review';
          }
        }
        
        const priority = calculatePriority(newReport.category, 0, isEmergency);

        if (get().isOnline) {
          try {
            if (imgUrl && imgUrl.startsWith('data:')) {
              const { default: storageService } = await import('../services/storageService');
              imgUrl = await storageService.uploadReportImage(imgUrl);
            }
            const { default: reportService } = await import('../services/reportService');
            const submitted = await reportService.submitReport({
              ...newReport,
              imageUrl: imgUrl || undefined,
              reporterId: user.id,
              priority,
              status: initialStatus,
              aiAnalysis: newReport.aiAnalysis
            });

            const pointsAwarded = isEmergency ? 25 : 10;
            set((state) => ({
              reports: [submitted, ...state.reports],
              currentUser: {
                ...state.currentUser,
                reputationPoints: state.currentUser.reputationPoints + pointsAwarded
              },
              notifications: [
                {
                  id: 'n-' + Math.random().toString(36).substring(2, 11),
                  userId: user.id,
                  title: 'Report Submitted Successfully',
                  message: `Your report "${newReport.title}" has been registered. You earned ${pointsAwarded} Reputation Points!`,
                  type: 'success',
                  isRead: false,
                  createdAt: now
                },
                ...state.notifications
              ]
            }));
            return;
          } catch (err) {
            console.error('Error submitting report to Supabase:', err);
          }
        }

        const detectedIssues = [newReport.category.toLowerCase().replace(' ', '_')];
        const reportObj: Report = {
          ...newReport,
          id,
          reporterId: user.id,
          status: initialStatus,
          priority,
          supportCount: 0,
          duplicateCount: 0,
          budgetEstimated: isEmergency ? 150000 : 35500,
          budgetSpent: 0,
          createdAt: now,
          updatedAt: now,
          images: imgUrl ? [{
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
          }] : []
        };

        set((state) => ({
          reports: [reportObj, ...state.reports],
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
      },

      supportReport: async (reportId) => {
        const user = get().currentUser;
        const target = get().reports.find(r => r.id === reportId);
        if (!target) return;

        const nextSupports = target.supportCount + 1;
        const nextPriority = (nextSupports > 25 && target.priority !== 'Emergency')
          ? 'Critical'
          : calculatePriority(target.category, nextSupports, target.isEmergency);

        if (get().isOnline) {
          try {
            const { default: reportService } = await import('../services/reportService');
            await reportService.supportReport(reportId, user.id, nextSupports, nextPriority);
          } catch (err) {
            console.error('Error voting support in DB:', err);
          }
        }

        set((state) => {
          const reports = state.reports.map((r) => {
            if (r.id === reportId) {
              const nextStatus = (nextSupports > 25 && r.priority !== 'Emergency')
                ? 'Under_Review'
                : r.status;

              return {
                ...r,
                supportCount: nextSupports,
                priority: nextPriority,
                status: nextStatus,
                updatedAt: new Date().toISOString()
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

      addComment: async (reportId, content) => {
        const user = get().currentUser;
        if (get().isOnline) {
          try {
            const { default: reportService } = await import('../services/reportService');
            const commentObj = await reportService.addComment(reportId, user.id, content);
            set((state) => ({
              comments: [...state.comments, commentObj]
            }));
            return;
          } catch (err) {
            console.error('Error saving comment in DB:', err);
          }
        }

        const commentObj: Comment = {
          id: 'c-' + Math.random().toString(36).substring(2, 11),
          reportId,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          content,
          isOfficialUpdate: ['Admin', 'Department Officer'].includes(user.role),
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          comments: [...state.comments, commentObj]
        }));
      },

      updateReportStatus: async (reportId, status, notes) => {
        const user = get().currentUser;
        if (get().isOnline) {
          try {
            const { default: reportService } = await import('../services/reportService');
            await reportService.updateReportStatus(reportId, status, notes, user.id);
          } catch (err) {
            console.error('Error updating status in DB:', err);
          }
        }

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
              message: `Your report "${targetReport.title}" is now: ${status.replace('_', ' ')}. Note: ${notes || 'Updated by Ghorahi team.'}`,
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

      assignDepartment: async (reportId, department, remarks, priority, status = 'Assigned') => {
        const now = new Date().toISOString();
        const user = get().currentUser;

        if (get().isOnline) {
          try {
            const { default: reportService } = await import('../services/reportService');
            // Update in DB
            await reportService.updateReportStatus(reportId, status, `Assigned to ${department}. Remarks: ${remarks}`, user.id, department, priority);
          } catch (err) {
            console.error('Error updating assignment in DB:', err);
          }
        }

        set((state) => {
          const reports = state.reports.map((r) => {
            if (r.id === reportId) {
              return { 
                ...r, 
                assignedDepartment: department, 
                priority, 
                status, 
                updatedAt: now 
              };
            }
            return r;
          });

          const commentObj: Comment = {
            id: 'c-' + Math.random().toString(36).substring(2, 11),
            reportId,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            content: `Manual routing to ${department} completed by Administrator. Urgent remarks: "${remarks}"`,
            isOfficialUpdate: true,
            createdAt: now
          };

          const targetReport = state.reports.find(r => r.id === reportId);
          const newNotifications = [...state.notifications];
          if (targetReport) {
            newNotifications.unshift({
              id: 'n-assign-' + Math.random().toString(36).substring(2, 11),
              userId: targetReport.reporterId,
              title: `Report Assigned to Mahashakha`,
              message: `Your report "${targetReport.title}" has been manually routed to "${department}". Remarks: ${remarks}`,
              type: 'info',
              isRead: false,
              createdAt: now
            });
          }

          return { 
            reports, 
            comments: [...state.comments, commentObj], 
            notifications: newNotifications 
          };
        });
      },

      resolveReportByDepartment: async (reportId, remarks, proofUrl) => {
        const now = new Date().toISOString();
        const user = get().currentUser;

        if (get().isOnline) {
          try {
            const { default: reportService } = await import('../services/reportService');
            const target = get().reports.find(r => r.id === reportId);
            const budgetSpent = target ? target.budgetEstimated : undefined;
            await reportService.updateReportStatus(reportId, 'Resolved', remarks, user.id, undefined, undefined, budgetSpent);
          } catch (err) {
            console.error('Error resolving report in DB:', err);
          }
        }

        set((state) => {
          const reports = state.reports.map((r) => {
            if (r.id === reportId) {
              const updatedImages = [...r.images];
              if (proofUrl) {
                updatedImages.push({
                  id: 'img-res-' + Math.random().toString(36).substring(2, 11),
                  reportId: r.id,
                  url: proofUrl,
                  imageType: 'after',
                  createdAt: now
                });
              }
              return { 
                ...r, 
                status: 'Resolved' as const, 
                budgetSpent: r.budgetEstimated, 
                images: updatedImages,
                updatedAt: now 
              };
            }
            return r;
          });

          const commentObj: Comment = {
            id: 'c-' + Math.random().toString(36).substring(2, 11),
            reportId,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            content: `Resolved by ${user.department || 'Department Officer'}. Completion remarks: "${remarks}"`,
            isOfficialUpdate: true,
            createdAt: now
          };

          const targetReport = state.reports.find(r => r.id === reportId);
          const newNotifications = [...state.notifications];
          if (targetReport) {
            newNotifications.unshift({
              id: 'n-resolve-' + Math.random().toString(36).substring(2, 11),
              userId: targetReport.reporterId,
              title: `Civic Problem Resolved`,
              message: `Your reported problem "${targetReport.title}" has been marked as RESOLVED by the ${user.department || 'department'}. Remarks: ${remarks}`,
              type: 'success',
              isRead: false,
              createdAt: now
            });
          }

          return { 
            reports, 
            comments: [...state.comments, commentObj], 
            notifications: newNotifications 
          };
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
                status: 'Under_Review' as const,
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
