import { supabase } from '../lib/supabase';
import type { Report, Comment, WardBudget, ReportImage, ReportCategory, PriorityLevel, ReportStatus, UserRole } from '../types';
import { authService } from './authService';

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

export const reportService = {
  async fetchReports(): Promise<Report[]> {
    await authService.ensureMappings();

    const { data, error } = await supabase
      .from('reports')
      .select('*, report_images(*)')
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
        category: r.category,
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
        }))
      };
    });
  },

  async submitReport(
    report: Omit<Report, 'id' | 'reporterId' | 'status' | 'priority' | 'supportCount' | 'duplicateCount' | 'createdAt' | 'updatedAt' | 'images'> & { imageUrl?: string; reporterId: string; priority: PriorityLevel; status: ReportStatus; aiAnalysis?: any }
  ): Promise<Report> {
    await authService.ensureMappings();

    const dbMuniId = authService.getDbMuniId(report.municipalityId);
    const dbWardId = dbMuniId ? authService.getDbWardId(dbMuniId, report.wardId) : null;

    const reportRow = {
      title: report.title,
      description: report.description,
      category: report.category,
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
    if (report.imageUrl) {
      const imgRow = {
        report_id: insertedReport.id,
        url: report.imageUrl,
        image_type: 'before',
        ai_analysis: report.aiAnalysis || {
          category: report.category,
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
      }
    }

    return {
      ...report,
      id: insertedReport.id,
      supportCount: 0,
      duplicateCount: 0,
      createdAt: insertedReport.created_at,
      updatedAt: insertedReport.updated_at,
      images
    } as Report;
  },

  async supportReport(reportId: string, userId: string, nextSupportCount: number, nextPriority: string): Promise<void> {
    await supabase.from('support_votes').insert({ report_id: reportId, user_id: userId });

    await supabase
      .from('reports')
      .update({ support_count: nextSupportCount, priority: nextPriority })
      .eq('id', reportId);
  },

  async addComment(reportId: string, userId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({ report_id: reportId, user_id: userId, content })
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
      isOfficialUpdate: ['Ward Officer', 'Municipality Officer', 'District Administrator', 'Super Admin'].includes(commentRow.profiles?.role || ''),
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
        verifier_id: verifierId,
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
      isOfficialUpdate: ['Ward Officer', 'Municipality Officer', 'District Administrator', 'Super Admin'].includes(commentRow.profiles?.role || ''),
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
  }
};

export default reportService;
