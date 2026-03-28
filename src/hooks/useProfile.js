import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';

// ─── Profile (reads from AuthContext, writes to DB) ───────────────────────────
export function useProfile() {
  const { user, profile, profileLoading, setProfile } = useAuth();
  const qc = useQueryClient();

  const updateProfile = async (updates) => {
    if (!user?.uid) return;
    // Optimistic
    setProfile(prev => ({ ...prev, ...updates }));
    const dbUpdates = {};
    const keyMap = {
      height: 'height', weight: 'weight', goalWeight: 'goal_weight',
      dailyCalorieGoal: 'daily_calorie_goal', waterIntakeGoal: 'water_intake_goal',
      age: 'age', gender: 'gender', activityLevel: 'activity_level',
      fitnessGoal: 'fitness_goal', onboardingComplete: 'onboarding_complete',
      proteinTarget: 'protein_target', carbsTarget: 'carbs_target', fatsTarget: 'fats_target',
      waterUnit: 'water_unit',
    };
    Object.entries(updates).forEach(([k, v]) => { dbUpdates[keyMap[k] || k] = v; });
    const { error } = await supabase.from('profiles').update(dbUpdates)
      .eq('user_id', user.uid);
    if (error) throw error;
  };

  return { profile, loading: profileLoading, updateProfile };
}

// ─── Water Tracking (with unit preference #34) ───────────────────────────────
export function useWaterTracking() {
  const { user, profile, setProfile } = useAuth();
  const qc = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const logWater = async (cups) => {
    if (!user?.uid) return;
    // Optimistic update
    setProfile(prev => ({
      ...prev,
      todayWater: (prev?.todayWater || 0) + cups,
    }));
    const { error } = await supabase.from('water_logs').upsert(
      { user_id: user.uid, date: today, cups: (profile?.todayWater || 0) + cups },
      { onConflict: 'user_id,date' }
    );
    if (error) console.error('Water log error', error);
  };

  const waterGoal = profile?.waterIntakeGoal || 8;
  const todayCups = profile?.todayWater || 0;
  const waterUnit = profile?.waterUnit || 'ml'; // #34
  const multiplier = waterUnit === 'cups' ? 1 : 250; // 1 cup = 250ml

  return {
    todayCups,
    waterGoal,
    waterUnit,
    waterMl: todayCups * 250,
    waterGoalMl: waterGoal * 250,
    displayAmount: waterUnit === 'cups' ? todayCups : todayCups * 250,
    displayGoal: waterUnit === 'cups' ? waterGoal : waterGoal * 250,
    displayUnit: waterUnit === 'cups' ? 'cups' : 'ml',
    logWater,
    history: [],
  };
}

// ─── Weight Tracking ──────────────────────────────────────────────────────────
export function useWeightTracking() {
  const { user, profile, setProfile } = useAuth();
  const qc = useQueryClient();

  const logWeight = async (weight) => {
    if (!user?.uid) return;
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => ({ ...prev, weight }));
    const { error } = await supabase.from('weight_logs').upsert(
      { user_id: user.uid, date: today, weight },
      { onConflict: 'user_id,date' }
    );
    if (error) console.error('Weight log error', error);
  };

  return {
    currentWeight: profile?.weight || 0,
    goalWeight: profile?.goalWeight || 0,
    logWeight,
  };
}

// ─── Weight history for chart (#40) ───────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';

export function useWeightHistory(days = 30) {
  const { user } = useAuth();
  const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const query = useQuery({
    queryKey: ['weightHistory', user?.uid, days],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('weight_logs').select('date, weight')
        .eq('user_id', user.uid).gte('date', startDate)
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  return { history: query.data || [], loading: query.isLoading };
}
