import { supabase } from '../lib/supabase';
import type { Report, Comment, WardBudget, ReportImage, ReportCategory, PriorityLevel, ReportStatus, UserRole, Notification, ReportVideo } from '../types';
import { authService } from './authService';

const sanitizeUUID = (id: string | null | undefined): string | null => {
  if (!id) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id : null;
};

interface DbReportImageRow {
  id: string;
  report_id: string;
  url: string;
  image_type: 'before' | 'after';
  ai_analysis: {
    category: string;
    confidence: number;
    qualityScore: number;
    issuesDetected: string[];
    isFake: boolean;
    isBlurry: boolean;
  } | null;
  created_at: string;
}

interface DbReportRow {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  address: string;
  municipality_id: string | null;
  ward_id: string | null;
  reporter_id: string;
  status: ReportStatus;
  priority: PriorityLevel;
  support_count: number;
  duplicate_count: number;
  assigned_department: string | null;
  budget_estimated: number;
  budget_spent: number;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
  report_images?: DbReportImageRow[];
  report_videos?: DbReportVideoRow[];
}

interface DbReportVideoRow {
  id: string;
  report_id: string;
  url: string;
  created_at: string;
}

interface DbCommentWithProfile {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    role: string;
  } | null;
}

interface DbBudgetRow {
  id: string;
  entity_type: string;
  entity_id: string;
  year: string;
  category: string;
  allocated: number;
  spent: number;
}

const CATEGORY_TO_DB: Record<string, string> = {
  'Garbage / Waste Management': 'Garbage',
  'Road Damage': 'Road Damage',
  'Water Supply Problems': 'Water Supply',
  'Drainage / Sewer': 'Drainage',
  'Street Light / Electricity': 'Street Lights',
  'Public Infrastructure': 'Infrastructure Problems',
  'Accident / Traffic Emergency': 'Emergency',
  'Fire Emergency': 'Emergency',
  'Public Safety / Crime': 'Public Safety'
};

const DB_TO_CATEGORY: Record<string, ReportCategory> = {
  'Garbage': 'Garbage / Waste Management',
  'Road Damage': 'Road Damage',
  'Potholes': 'Road Damage',
  'Water Supply': 'Water Supply Problems',
  'Drainage': 'Drainage / Sewer',
  'Street Lights': 'Street Light / Electricity',
  'Electricity': 'Street Light / Electricity',
  'Infrastructure Problems': 'Public Infrastructure',
  'Public Safety': 'Public Safety / Crime',
  'Emergency': 'Accident / Traffic Emergency',
  'Other': 'Public Infrastructure'
};

export function mapCategoryToDb(category: string): string {
  return CATEGORY_TO_DB[category] || 'Other';
}

export function mapDbToCategory(dbCategory: string): ReportCategory {
  return DB_TO_CATEGORY[dbCategory] || 'Public Infrastructure';
}

export const reportService = {
  async fetchReports(): Promise<Report[]> {
    await authService.ensureMappings();

    const { data, error } = await supabase
      .from('reports')
      .select('*, report_images(*), report_videos(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    const rows = data as DbReportRow[];

    return rows.map((r) => {
      const localMuni = r.municipality_id ? authService.getLocalMuniId(r.municipality_id) || '' : '';
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: mapDbToCategory(r.category),
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        municipalityId: localMuni,
        wardId: r.ward_id && r.municipality_id ? (authService.getLocalWardNumber(r.municipality_id, r.ward_id) || 15) : 15,
        reporterId: r.reporter_id,
        status: r.status,
        priority: r.priority,
        supportCount: r.support_count || 0,
        duplicateCount: r.duplicate_count || 0,
        assignedDepartment: r.assigned_department || undefined,
        budgetEstimated: Number(r.budget_estimated || 0),
        budgetSpent: Number(r.budget_spent || 0),
        isEmergency: r.is_emergency || false,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        images: (r.report_images || []).map((img) => ({
          id: img.id,
          reportId: img.report_id,
          url: img.url,
          imageType: img.image_type,
          aiAnalysis: img.ai_analysis || undefined,
          createdAt: img.created_at
        })),
        videos: (r.report_videos || []).map((v) => ({
          id: v.id,
          reportId: v.report_id,
          url: v.url,
          createdAt: v.created_at
        }))
      };
    });
  },

  async submitReport(
    report: Omit<Report, 'id' | 'reporterId' | 'status' | 'priority' | 'supportCount' | 'duplicateCount' | 'createdAt' | 'updatedAt' | 'images' | 'videos'> & { imageUrls?: string[]; videoUrl?: string; reporterId: string; priority: PriorityLevel; status: ReportStatus; aiAnalysis?: any }
  ): Promise<Report> {
    await authService.ensureMappings();

    const dbMuniId = authService.getDbMuniId(report.municipalityId);
    const dbWardId = dbMuniId ? authService.getDbWardId(dbMuniId, report.wardId) : null;

    const reportRow = {
      title: report.title,
      description: report.description,
      category: mapCategoryToDb(report.category),
      latitude: report.latitude,
      longitude: report.longitude,
      address: report.address,
      municipality_id: dbMuniId || null,
      ward_id: dbWardId || null,
      reporter_id: report.reporterId,
      status: report.status,
      priority: report.priority,
      support_count: 0,
      duplicate_count: 0,
      budget_estimated: report.budgetEstimated,
      budget_spent: 0,
      is_emergency: report.isEmergency
    };

    const { data: insertedReport, error } = await supabase
      .from('reports')
      .insert(reportRow)
      .select()
      .single();

    if (error || !insertedReport) throw error || new Error('Report submission failed');

    const images: ReportImage[] = [];
    if (report.imageUrls && report.imageUrls.length > 0) {
      for (const url of report.imageUrls) {
        const imgRow = {
          report_id: insertedReport.id,
          url: url,
          image_type: 'before',
          ai_analysis: report.aiAnalysis || {
            category: mapCategoryToDb(report.category),
            confidence: 0.95,
            qualityScore: 0.88,
            issuesDetected: [report.category.toLowerCase().replace(' ', '_')],
            isFake: false,
            isBlurry: false
          }
        };

        const { data: insertedImage } = await supabase
          .from('report_images')
          .insert(imgRow)
          .select()
          .single();

        if (insertedImage) {
          images.push({
            id: insertedImage.id,
            reportId: insertedImage.report_id,
            url: insertedImage.url,
            imageType: 'before',
            aiAnalysis: insertedImage.ai_analysis,
            createdAt: insertedImage.created_at
          });
        } else {
          // Fallback to local preview image if database insert fails (e.g. RLS policy blocked it)
          images.push({
            id: 'local-' + Math.random().toString(36).substring(2, 9),
            reportId: insertedReport.id,
            url: url,
            imageType: 'before',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    const videos: ReportVideo[] = [];
    if (report.videoUrl) {
      const { data: insertedVideo } = await supabase
        .from('report_videos')
        .insert({
          report_id: insertedReport.id,
          url: report.videoUrl
        })
        .select()
        .single();

      if (insertedVideo) {
        videos.push({
          id: insertedVideo.id,
          reportId: insertedVideo.report_id,
          url: insertedVideo.url,
          createdAt: insertedVideo.created_at
        });
      } else {
        // Fallback to local video preview if insert fails
        videos.push({
          id: 'local-v-' + Math.random().toString(36).substring(2, 9),
          reportId: insertedReport.id,
          url: report.videoUrl,
          createdAt: new Date().toISOString()
        });
      }
    }

    return {
      ...report,
      id: insertedReport.id,
      supportCount: 0,
      duplicateCount: 0,
      createdAt: insertedReport.created_at,
      updatedAt: insertedReport.updated_at,
      images,
      videos
    } as Report;
  },

  async supportReport(reportId: string, userId: string, nextSupportCount: number, nextPriority: string): Promise<void> {
    await supabase.from('support_votes').insert({ report_id: reportId, user_id: userId });

    await supabase
      .from('reports')
      .update({ support_count: nextSupportCount, priority: nextPriority })
      .eq('id', reportId);
  },

  async toggleSupportReport(reportId: string, userId: string, hasLiked: boolean, nextSupportCount: number, nextPriority: string): Promise<void> {
    if (hasLiked) {
      await supabase.from('support_votes').insert({ report_id: reportId, user_id: userId });
    } else {
      await supabase.from('support_votes').delete().eq('report_id', reportId).eq('user_id', userId);
    }

    await supabase
      .from('reports')
      .update({ support_count: nextSupportCount, priority: nextPriority })
      .eq('id', reportId);
  },

  async fetchUserLikes(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('support_votes')
      .select('report_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user likes:', error);
      return [];
    }
    return (data || []).map((row: any) => row.report_id);
  },

  async fetchNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: row.is_read,
      createdAt: row.created_at
    }));
  },

  async createDbNotification(notification: { userId: string; title: string; message: string; type: string }): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type
    });
  },

  async dismissDbNotification(id: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async addComment(reportId: string, userId: string, content: string): Promise<Comment> {
     const { data, error } = await supabase
       .from('comments')
       .insert({ report_id: reportId, user_id: sanitizeUUID(userId), content })
      .select('*, profiles(*)')
      .single();

    if (error || !data) throw error || new Error('Failed to post comment');

    const commentRow = data as unknown as DbCommentWithProfile;

    return {
      id: commentRow.id,
      reportId: commentRow.report_id,
      userId: commentRow.user_id,
      userName: commentRow.profiles?.name || 'Anonymous',
      userRole: (commentRow.profiles?.role || 'Citizen') as UserRole,
      content: commentRow.content,
      isOfficialUpdate: ['Admin', 'Department Officer'].includes(commentRow.profiles?.role || ''),
      createdAt: commentRow.created_at
    };
  },

  async updateReportStatus(reportId: string, status: string, notes?: string, verifierId?: string, assignedDepartment?: string, priority?: string, budgetSpent?: number): Promise<void> {
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (assignedDepartment !== undefined) {
      updatePayload.assigned_department = assignedDepartment;
    }
    if (priority !== undefined) {
      updatePayload.priority = priority;
    }
    if (budgetSpent !== undefined) {
      updatePayload.budget_spent = budgetSpent;
    }

    await supabase
      .from('reports')
      .update(updatePayload)
      .eq('id', reportId);

    if (notes && verifierId) {
      await supabase.from('verification_logs').insert({
        report_id: reportId,
        verifier_id: sanitizeUUID(verifierId),
        verification_type: 'ward_officer',
        status_change: status,
        notes
      });
    }
  },

  async fetchComments(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(*)');

    if (error) return [];
    if (!data) return [];

    const rows = data as unknown as DbCommentWithProfile[];

    return rows.map((commentRow) => ({
      id: commentRow.id,
      reportId: commentRow.report_id,
      userId: commentRow.user_id,
      userName: commentRow.profiles?.name || 'Anonymous',
      userRole: (commentRow.profiles?.role || 'Citizen') as UserRole,
      content: commentRow.content,
      isOfficialUpdate: ['Admin', 'Department Officer'].includes(commentRow.profiles?.role || ''),
      createdAt: commentRow.created_at
    }));
  },

  async fetchBudgets(): Promise<WardBudget[]> {
    await authService.ensureMappings();

    const { data, error } = await supabase.from('budgets').select('*');
    if (error) return [];

    const budgetRows = data as DbBudgetRow[];

    return budgetRows.map((b) => {
      let localMuniId = 'ghorahi';
      let wardNumber = 15;

      if (b.entity_type === 'ward') {
        const details = authService.getLocalWardDetails(b.entity_id);
        if (details) {
          localMuniId = details.localMuniId;
          wardNumber = details.wardNumber;
        }
      } else if (b.entity_type === 'municipality') {
        localMuniId = authService.getLocalMuniId(b.entity_id) || 'ghorahi';
        wardNumber = 0;
      }

      return {
        id: b.id,
        municipalityId: localMuniId,
        wardId: wardNumber,
        allocated: Number(b.allocated),
        spent: Number(b.spent)
      };
    });
  },

  async editReport(
    reportId: string,
    updates: {
      title: string;
      description: string;
      category: string;
      priority: string;
      latitude: number;
      longitude: number;
      address: string;
      imageUrls?: string[];
      videoUrl?: string;
    }
  ): Promise<void> {
    await authService.ensureMappings();
    const dbMuniId = authService.getDbMuniId('ghorahi');
    const { detectMunicipalityAndWard } = await import('../utils/civicUtils');
    const geo = detectMunicipalityAndWard(updates.latitude, updates.longitude);
    const resolvedMuniId = authService.getDbMuniId(geo.municipalityId) || dbMuniId;
    const resolvedWardId = resolvedMuniId ? authService.getDbWardId(resolvedMuniId, geo.wardId) : null;

    const reportRow = {
      title: updates.title,
      description: updates.description,
      category: mapCategoryToDb(updates.category),
      priority: updates.priority,
      latitude: updates.latitude,
      longitude: updates.longitude,
      address: updates.address,
      municipality_id: resolvedMuniId || null,
      ward_id: resolvedWardId || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('reports')
      .update(reportRow)
      .eq('id', reportId);

    if (error) throw error;

    if (updates.imageUrls) {
      const { error: delErr } = await supabase.from('report_images').delete().eq('report_id', reportId);
      if (delErr) console.warn('Error deleting old images:', delErr);
      
      for (const url of updates.imageUrls) {
        const { error: insErr } = await supabase.from('report_images').insert({
          report_id: reportId,
          url: url,
          image_type: 'before',
          ai_analysis: {
            category: mapCategoryToDb(updates.category),
            confidence: 0.95,
            qualityScore: 0.88,
            issuesDetected: [updates.category.toLowerCase().replace(' ', '_')],
            isFake: false,
            isBlurry: false
          }
        });
        if (insErr) console.error('Error inserting updated image:', insErr);
      }
    }

    if (updates.videoUrl !== undefined) {
      const { error: delVideoErr } = await supabase.from('report_videos').delete().eq('report_id', reportId);
      if (delVideoErr) console.warn('Error deleting old videos:', delVideoErr);
      
      if (updates.videoUrl) {
        const { error: insVideoErr } = await supabase.from('report_videos').insert({
          report_id: reportId,
          url: updates.videoUrl
        });
        if (insVideoErr) console.error('Error inserting updated video:', insVideoErr);
      }
    }
  },

  async softDeleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;
  }
};

export default reportService;
