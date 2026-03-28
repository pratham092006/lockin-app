import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';

const today = () => new Date().toISOString().split('T')[0];

// ─── All habits for this user ─────────────────────────────────────────────────
export function useHabits() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['habits', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits').select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createHabit = useMutation({
    mutationFn: async ({ name, description = '', color = '#42e355', dailyTarget = 1 }) => {
      const { error } = await supabase.from('habits').insert({
        user_id: user.uid, name, description, color, daily_target: dailyTarget,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
  });

  const updateHabit = useMutation({
    mutationFn: async ({ habitId, updates }) => {
      const { error } = await supabase.from('habits')
        .update({ name: updates.name, description: updates.description, color: updates.color })
        .eq('id', habitId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId) => {
      const { error } = await supabase.from('habits').delete()
        .eq('id', habitId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits', user?.uid] }),
  });

  return {
    habits:      query.data || [],
    loading:     query.isLoading,
    error:       query.error,
    createHabit: createHabit.mutateAsync,
    updateHabit: updateHabit.mutate,
    deleteHabit: deleteHabit.mutate,
  };
}

// ─── Habit logs for today — with OPTIMISTIC updates (#32) ─────────────────────
export function useTodayHabitLogs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const t = today();

  const query = useQuery({
    queryKey: ['habitLogs', user?.uid, t],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs')
        .select('habit_id, completed')
        .eq('user_id', user.uid).eq('date', t);
      if (error) throw error;
      return new Set((data || []).filter(r => r.completed).map(r => r.habit_id));
    },
  });

  const toggle = useMutation({
    // Optimistic update (#32) — flip the Set immediately
    onMutate: async ({ habitId, isCompleted }) => {
      await qc.cancelQueries({ queryKey: ['habitLogs', user?.uid, t] });
      const prev = qc.getQueryData(['habitLogs', user?.uid, t]);
      qc.setQueryData(['habitLogs', user?.uid, t], (old) => {
        const next = new Set(old || []);
        if (isCompleted) next.delete(habitId);
        else             next.add(habitId);
        return next;
      });
      return { prev };
    },
    mutationFn: async ({ habitId, isCompleted }) => {
      if (isCompleted) {
        const { error } = await supabase.from('habit_logs').delete()
          .eq('user_id', user.uid).eq('habit_id', habitId).eq('date', t);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('habit_logs')
          .upsert({ user_id: user.uid, habit_id: habitId, date: t, completed: true });
        if (error) throw error;
      }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(['habitLogs', user?.uid, t], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['habitLogs', user?.uid, t] });
      qc.invalidateQueries({ queryKey: ['allHabitLogs', user?.uid] });
    },
  });

  return {
    completedIds: query.data || new Set(),
    loading: query.isLoading,
    toggle: toggle.mutate,
    isToggling: toggle.isPending,
  };
}

// ─── ALL habit logs for a date range (batched — #12/#35) ──────────────────────
export function useHabitLogsRange(days = 90) {
  const { user } = useAuth();
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const query = useQuery({
    queryKey: ['allHabitLogs', user?.uid, days],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs')
        .select('habit_id, date, completed')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .gte('date', startDate)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const logs = query.data || [];

  // Compute streaks for all habits from one query result
  const computeStreak = (habitId) => {
    const dates = new Set(logs.filter(l => l.habit_id === habitId).map(l => l.date));
    let streak = 0;
    let cur = new Date();
    while (true) {
      const ds = cur.toISOString().split('T')[0];
      if (dates.has(ds)) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  };

  // Map of date → Set of completed habit_ids (for calendar #29)
  const byDate = {};
  logs.forEach(l => {
    if (!byDate[l.date]) byDate[l.date] = new Set();
    byDate[l.date].add(l.habit_id);
  });

  // Completion percentage per date (for contribution grid #43)
  const completionByDate = (totalHabits) => {
    const result = {};
    Object.entries(byDate).forEach(([date, set]) => {
      result[date] = totalHabits > 0 ? set.size / totalHabits : 0;
    });
    return result;
  };

  return {
    logs,
    byDate,
    computeStreak,
    completionByDate,
    loading: query.isLoading,
  };
}
