import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  AdminNotification,
  AdminUser,
  DashboardStats,
  PaginationParams,
  Report,
  Survey,
  SurveyUser,
  Transaction,
  Withdrawal,
} from '@/types';

// Users Hooks
export function useUsers(params?: PaginationParams & { role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      // Try `users` table first (older schema), otherwise fall back to `user_profiles`.
      try {
        let query = supabase.from('users').select('*', { count: 'exact' });

        if (params?.role && params.role !== 'all') {
          query = query.eq('user_role', params.role);
        }

        if (params?.sort_by) {
          query = query.order(params.sort_by, {
            ascending: params.sort_order === 'asc',
          });
        }

        if (params?.page && params?.limit) {
          const start = (params.page - 1) * params.limit;
          query = query.range(start, start + params.limit - 1);
        }

        const { data, error, count } = await query;
        if (!error && data && data.length > 0) {
          const limit = params?.limit || 10;
          const total_pages = Math.ceil((count || 0) / limit);
          return {
            data: data as SurveyUser[],
            total: count || 0,
            total_pages,
            page: params?.page || 1,
            limit,
          };
        }
      } catch (e) {
        // ignore and fallback
      }

      // Fallback to user_profiles table (some deployments use this table)
      let profQuery = supabase.from('user_profiles').select('*', { count: 'exact' });
      if (params?.role && params.role !== 'all') {
        profQuery = profQuery.eq('user_role', params.role);
      }
      if (params?.sort_by) {
        profQuery = profQuery.order(params.sort_by, {
          ascending: params.sort_order === 'asc',
        });
      }
      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit;
        profQuery = profQuery.range(start, start + params.limit - 1);
      }

      const { data, error, count } = await profQuery;
      if (error) throw error;
      const limit = params?.limit || 10;
      const total_pages = Math.ceil((count || 0) / limit);

      // Map user_profiles rows to the shape expected by the UI
      const mapped = (data || []).map((row: any) => ({
        id: row.user_id || row.id,
        full_name: row.full_name || row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        email: row.email || row.primary_email || null,
        user_role: row.user_role || row.role || 'filler',
        wallet_balance: row.wallet_balance ?? row.balance ?? 0,
        total_reports: row.total_reports ?? 0,
        created_at: row.created_at || row.profile_created_at,
        status: row.status || 'active',
      })) as SurveyUser[];

      return {
        data: mapped,
        total: count || mapped.length,
        total_pages,
        page: params?.page || 1,
        limit,
      };
    },
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as SurveyUser;
    },
    enabled: !!userId,
  });
}

// Surveys Hooks
export function useSurveys(params?: PaginationParams) {
  return useQuery({
    queryKey: ['surveys', params],
    queryFn: async () => {
      let query = supabase.from('surveys').select('*', { count: 'exact' });

      if (params?.sort_by) {
        query = query.order(params.sort_by, {
          ascending: params.sort_order === 'asc',
        });
      }

      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit;
        query = query.range(start, start + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const surveys = (data || []) as any[];

      // Attach creator info and response counts when possible
      const userIds = Array.from(new Set(surveys.map((s) => s.user_id || s.creator_id).filter(Boolean)));
      let creatorsMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('user_profiles').select('user_id,full_name').in('user_id', userIds);
        if (profiles) {
          profiles.forEach((p: any) => {
            creatorsMap[p.user_id] = p;
          });
        }
      }

      // Fetch response counts for each survey (batch)
      const counts: Record<string, number> = {};
      await Promise.all(
        surveys.map(async (s) => {
          try {
            const res = await supabase.from('survey_responses').select('id', { count: 'exact', head: true }).eq('survey_id', s.id);
            counts[s.id] = res.count || 0;
          } catch (e) {
            counts[s.id] = s.total_responses_collected ?? s.responses_collected ?? s.total_responses ?? 0;
          }
        })
      );

      const enriched = surveys.map((s) => ({
        ...s,
        creator_name: creatorsMap[s.user_id]?.full_name || creatorsMap[s.creator_id]?.full_name || s.creator_name || s.creator || null,
        responses_count: counts[s.id] ?? s.total_responses_collected ?? s.responses_collected ?? s.total_responses ?? 0,
      }));

      const limit = params?.limit || 10;
      const total_pages = Math.ceil((count || 0) / limit);

      return {
        data: enriched as Survey[],
        total: count || enriched.length,
        total_pages,
        page: params?.page || 1,
        limit,
      };
    },
  });
}

export function useSurveyDetail(surveyId: string) {
  return useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (error) throw error;
      const survey = data as any;

      // parse questions if stored as JSON string
      try {
        if (typeof survey.questions === 'string') survey.questions = JSON.parse(survey.questions);
      } catch (e) {
        // leave as-is
      }

      // attach responses count
      try {
        const { count } = await supabase.from('survey_responses').select('id', { count: 'exact', head: true }).eq('survey_id', surveyId);
        (survey as any).responses_count = count || 0;
      } catch (e) {
        (survey as any).responses_count = survey.total_responses_collected ?? 0;
      }

      // attach creator name if possible
      const creatorId = survey.user_id || survey.creator_id;
      if (creatorId) {
        const { data: profile } = await supabase.from('user_profiles').select('user_id,full_name').eq('user_id', creatorId).single();
        if (profile) survey.creator_name = profile.full_name;
      }

      return survey as Survey;
    },
    enabled: !!surveyId,
  });
}

export function useSurveyResponses(surveyId?: string) {
  return useQuery({
    queryKey: ['survey-responses', surveyId],
    queryFn: async () => {
      if (!surveyId) return [] as any[];
      const { data, error } = await supabase.from('survey_responses').select('*').eq('survey_id', surveyId).order('created_at', { ascending: false });
      if (error) throw error;

      const responses = (data || []) as any[];

      // Batch fetch responder names if user_id present
      const userIds = Array.from(new Set(responses.map((r) => r.user_id).filter(Boolean)));
      const respondersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('user_profiles').select('user_id,full_name').in('user_id', userIds);
        if (profiles) profiles.forEach((p: any) => (respondersMap[p.user_id] = p));
      }

      const mapped = responses.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        responder_name: respondersMap[r.user_id]?.full_name || r.responder_name || null,
        created_at: r.created_at || r.createdAt || r.completed_at,
        completed_at: r.completed_at || r.finished_at || null,
        response_data: r.response_data || r.response || r.responseData || r.response_data_json || r.response_data,
        status: r.status,
        time_taken_seconds: r.time_taken_seconds,
        raw: r,
      }));

      return mapped as any[];
    },
    enabled: !!surveyId,
  });
}

export function useSurveyReports(surveyId?: string) {
  return useQuery({
    queryKey: ['survey-reports', surveyId],
    queryFn: async () => {
      if (!surveyId) return [] as any[];
      const { data, error } = await supabase.from('reports').select('*').eq('target_id', surveyId).eq('report_type', 'survey').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!surveyId,
  });
}

// Reports Hooks
export function useReports(params?: PaginationParams) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      let query = supabase.from('reports').select('*', { count: 'exact' });

      if (params?.sort_by) {
        query = query.order(params.sort_by, {
          ascending: params.sort_order === 'asc',
        });
      }

      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit;
        query = query.range(start, start + params.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const limit = params?.limit || 10;
      const total_pages = Math.ceil((count || 0) / limit);

      return {
        data: data as Report[],
        total: count || 0,
        total_pages,
        page: params?.page || 1,
        limit,
      };
    },
  });
}

// Dashboard Stats Hook
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const stats: DashboardStats = {
        total_users: 0,
        total_creators: 0,
        total_fillers: 0,
        active_surveys: 0,
        draft_surveys: 0,
        pending_reports: 0,
        total_revenue: 0,
        withdrawals_pending: 0,
        blocked_users: 0,
        todays_signups: 0,
        todays_surveys: 0,
        todays_responses: 0,
      };

      const today = new Date();
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      const [
        { count: totalUsers },
        { count: totalCreators },
        { count: totalFillers },
        { count: activeSurveys },
        { count: draftSurveys },
        { count: pendingReports },
        { count: blockedUsers },
        { data: revenueData },
        { count: pendingWithdrawalsCount },
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_role', 'creator'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_role', 'filler'),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'blocked'),
        supabase.from('transactions').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      stats.total_users = totalUsers || 0;
      stats.total_creators = totalCreators || 0;
      stats.total_fillers = totalFillers || 0;
      stats.active_surveys = activeSurveys || 0;
      stats.draft_surveys = draftSurveys || 0;
      stats.pending_reports = pendingReports || 0;
      stats.blocked_users = blockedUsers || 0;
      stats.total_revenue = (revenueData || []).reduce(
        (sum, transaction) => sum + Number((transaction as Transaction).amount || 0),
        0
      );
      stats.withdrawals_pending = Number(pendingWithdrawalsCount || 0);

      const [{ count: todaysSignups }, { count: todaysSurveys }] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
      ]);

      stats.todays_signups = Number(todaysSignups || 0);
      stats.todays_surveys = Number(todaysSurveys || 0);

      return stats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      const startIso = startDate.toISOString();

      const [userRes, transactionRes] = await Promise.all([
        supabase.from('users').select('created_at').gte('created_at', startIso),
        supabase
          .from('transactions')
          .select('amount, created_at')
          .gte('created_at', startIso)
          .eq('status', 'completed'),
      ]);

      if (userRes.error) throw userRes.error;
      if (transactionRes.error) throw transactionRes.error;

      const users = userRes.data || [];
      const transactions = transactionRes.data || [];

      const dateMap = Array.from({ length: 7 }).map((_, idx) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + idx);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          label,
          users: 0,
          revenue: 0,
          timestamp: date.getTime(),
        };
      });

      users.forEach((item) => {
        const createdAt = new Date(item.created_at as string).setHours(0, 0, 0, 0);
        const bucket = dateMap.find((entry) => entry.timestamp === createdAt);
        if (bucket) bucket.users += 1;
      });

      transactions.forEach((item) => {
        const createdAt = new Date(item.created_at as string).setHours(0, 0, 0, 0);
        const bucket = dateMap.find((entry) => entry.timestamp === createdAt);
        if (bucket) bucket.revenue += Number((item as Transaction).amount || 0);
      });

      return {
        userGrowthData: dateMap.map(({ label, users }) => ({ date: label, users })),
        revenueData: dateMap.map(({ label, revenue }) => ({ date: label, revenue })),
      };
    },
    refetchInterval: 30000,
  });
}

export function usePayments(params?: PaginationParams) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: async () => {
      let transactionQuery = supabase
        .from('transactions')
        .select('*, users(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false });
      let withdrawalQuery = supabase.from('withdrawals').select('*', { count: 'exact' }).order('requested_at', { ascending: false });

      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit;
        transactionQuery = transactionQuery.range(start, start + params.limit - 1);
        withdrawalQuery = withdrawalQuery.range(start, start + params.limit - 1);
      }

      const [transactionResult, withdrawalResult] = await Promise.all([transactionQuery, withdrawalQuery]);
      if (transactionResult.error) throw transactionResult.error;
      if (withdrawalResult.error) throw withdrawalResult.error;

      const transactions = (transactionResult.data || []) as Transaction[];
      const withdrawals = (withdrawalResult.data || []) as Withdrawal[];

      const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').length;

      return {
        transactions,
        withdrawals,
        totalRevenue,
        pendingWithdrawals,
        total: transactionResult.count || 0,
        total_pages: Math.ceil((transactionResult.count || 0) / (params?.limit || 10)),
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
    },
    refetchInterval: 30000,
  });
}

export function useNotifications(adminId?: string) {
  return useQuery({
    queryKey: ['notifications', adminId],
    queryFn: async () => {
      let query = supabase.from('admin_notifications').select('*').order('created_at', { ascending: false });
      if (adminId) query = query.eq('admin_id', adminId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AdminNotification[];
    },
    enabled: true,
    refetchInterval: 30000,
  });
}

export function useAdminUser(adminId?: string) {
  return useQuery({
    queryKey: ['admin-user', adminId],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_users').select('*').eq('id', adminId).single();
      if (error) throw error;
      return data as AdminUser;
    },
    enabled: !!adminId,
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<AdminUser> }) => {
      // Use upsert so the admin_users row is created if it does not already exist
      const payload = { id: userId, ...data } as Partial<AdminUser> & { id: string };
      const { data: updated, error } = await supabase.from('admin_users').upsert(payload).select().single();
      if (error) throw error;
      return updated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
    },
  });
}

// Mutations
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<SurveyUser> }) => {
      const { data: updated, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDownSurveyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyId: string) => {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'downed' })
        .eq('id', surveyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useRestoreSurveyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyId: string) => {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'published' })
        .eq('id', surveyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteSurveyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyId: string) => {
      const { error } = await supabase.from('surveys').delete().eq('id', surveyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateReportStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
