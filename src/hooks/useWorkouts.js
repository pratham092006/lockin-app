import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';

// ─── Workout Templates ────────────────────────────────────────────────────────
export function useWorkoutTemplates() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['workoutTemplates', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_templates').select('*')
        .eq('user_id', user.uid).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async ({ name, description = '', exercises = [] }) => {
      const { error } = await supabase.from('workout_templates').insert({
        user_id: user.uid, name, description, exercises,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutTemplates', user?.uid] }),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ templateId, updates }) => {
      const { error } = await supabase.from('workout_templates')
        .update({ name: updates.name, description: updates.description, exercises: updates.exercises })
        .eq('id', templateId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutTemplates', user?.uid] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId) => {
      const { error } = await supabase.from('workout_templates').delete()
        .eq('id', templateId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutTemplates', user?.uid] }),
  });

  return {
    templates:      query.data || [],
    loading:        query.isLoading,
    error:          query.error,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
  };
}

// ─── Workout Logs (with per-set data #2/#9) ───────────────────────────────────
export function useWorkoutLogs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['workoutLogs', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_logs').select('*')
        .eq('user_id', user.uid).order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // #2/#9: Now saves per-set data into exercises JSONB
  const logWorkout = useMutation({
    mutationFn: async ({ templateId = null, exercises = [], duration = 0, caloriesBurned = 0, notes = '' }) => {
      const { error } = await supabase.from('workout_logs').insert({
        user_id: user.uid,
        template_id:     templateId,
        exercises,       // [ { name, type, sets: [{ weight, reps, done }] } ]
        duration,
        calories_burned: caloriesBurned,
        notes,
        date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutLogs', user?.uid] }),
  });

  const deleteLog = useMutation({
    mutationFn: async (logId) => {
      const { error } = await supabase.from('workout_logs').delete()
        .eq('id', logId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workoutLogs', user?.uid] }),
  });

  const logs = (query.data || []).map(l => ({
    ...l,
    caloriesBurned: l.calories_burned,
  }));

  return {
    logs,
    loading:    query.isLoading,
    error:      query.error,
    logWorkout: logWorkout.mutateAsync,
    deleteLog:  deleteLog.mutate,
  };
}
