import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SurveyUser, Survey, Report, DashboardStats, PaginationParams } from '@/types';

// Users Hooks
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      let query = supabase.from('users').select('*', { count: 'exact' });

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
        data: data as SurveyUser[],
        total: count || 0,
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

      const limit = params?.limit || 10;
      const total_pages = Math.ceil((count || 0) / limit);

      return {
        data: data as Survey[],
        total: count || 0,
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
      return data as Survey;
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

      // Fetch each stat
      const [
        { count: totalUsers },
        { count: totalCreators },
        { count: totalFillers },
        { count: activeSurveys },
        { count: draftSurveys },
        { count: pendingReports },
        { count: blockedUsers },
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString()),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_role', 'creator'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('user_role', 'filler'),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'blocked'),
      ]);

      stats.total_users = totalUsers || 0;
      stats.total_creators = totalCreators || 0;
      stats.total_fillers = totalFillers || 0;
      stats.active_surveys = activeSurveys || 0;
      stats.draft_surveys = draftSurveys || 0;
      stats.pending_reports = pendingReports || 0;
      stats.blocked_users = blockedUsers || 0;

      return stats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
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
