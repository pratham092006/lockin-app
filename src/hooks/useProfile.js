import { useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';
import { useQuery } from '@tanstack/react-query';

// ─── Profile (reads from AuthContext, writes to DB) ───────────────────────────
export function useProfile() {
  const { user, profile, profileLoading, setProfile } = useAuth();

  const updateProfile = async (updates) => {
    if (!user?.uid) return;
    // Optimistic
    setProfile(prev => ({ ...prev, ...updates }));
    const dbUpdates = {};
    const keyMap = {
      height: 'height', weight: 'weight', goalWeight: 'goal_weight',
      dailyCalorieGoal: 'daily_calorie_goal', waterIntakeGoal: 'water_intake_goal',
      age: 'age', gender: 'gender', activityLevel: 'activity_level',
      fitnessGoal: 'fitness_goal', onboardingDone: 'onboarding_done', onboardingComplete: 'onboarding_done',
      proteinTarget: 'protein_target', carbsTarget: 'carbs_target', fatsTarget: 'fats_target',
      waterUnit: 'water_unit',
    };
    Object.entries(updates).forEach(([k, v]) => { dbUpdates[keyMap[k] || k] = v; });

    // Keep legacy and current metric columns in sync to avoid stale UI values.
    if (Object.prototype.hasOwnProperty.call(updates, 'height')) {
      dbUpdates.height = updates.height;
      dbUpdates.height_cm = updates.height;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'weight')) {
      dbUpdates.weight = updates.weight;
      dbUpdates.weight_kg = updates.weight;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'goalWeight')) {
      dbUpdates.goal_weight = updates.goalWeight;
      dbUpdates.goal_weight_kg = updates.goalWeight;
    }

    const { error } = await supabase.from('profiles').update(dbUpdates)
      .eq('user_id', user.uid);
    if (error) throw error;
  };

  return { profile, loading: profileLoading, updateProfile };
}

// ─── Water Tracking (with unit preference #34) ───────────────────────────────
export function useWaterTracking() {
  const { user, profile, setProfile } = useAuth();
  const queueRef = useRef(Promise.resolve());

  const today = new Date().toISOString().split('T')[0];

  const logWater = async (cups) => {
    if (!user?.uid) return;
    // Queue writes to avoid race conditions when users tap quickly.
    queueRef.current = queueRef.current.then(async () => {
      let optimisticNext = (profile?.todayWater || 0) + cups;
      setProfile(prev => {
        optimisticNext = (prev?.todayWater || 0) + cups;
        return {
          ...prev,
          todayWater: optimisticNext,
          today_water: optimisticNext,
        };
      });

      const { data: existing, error: readError } = await supabase
        .from('water_logs')
        .select('cups')
        .eq('user_id', user.uid)
        .eq('date', today)
        .single();

      if (readError && readError.code !== 'PGRST116') {
        console.error('Water log read error', readError);
        return;
      }

      const persistedNext = (existing?.cups || 0) + cups;
      const { error: writeError } = await supabase.from('water_logs').upsert(
        { user_id: user.uid, date: today, cups: persistedNext },
        { onConflict: 'user_id,date' }
      );

      if (writeError) {
        console.error('Water log write error', writeError);
        // Keep UI consistent even when persistence fails.
        setProfile(prev => ({
          ...prev,
          todayWater: optimisticNext,
          today_water: optimisticNext,
        }));
        return;
      }

      setProfile(prev => ({
        ...prev,
        todayWater: persistedNext,
        today_water: persistedNext,
      }));
    });

    return queueRef.current;
  };

  const waterGoal = profile?.waterIntakeGoal || 8;
  const todayCups = profile?.todayWater || 0;
  const waterUnit = profile?.waterUnit || 'ml'; // #34

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
export function useWeightHistory(days = 30) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['weightHistory', user?.uid, days],
    enabled: !!user?.uid,
    queryFn: async () => {
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const { data, error } = await supabase.from('weight_logs').select('date, weight')
        .eq('user_id', user.uid).gte('date', startDate)
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  return { history: query.data || [], loading: query.isLoading };
}
