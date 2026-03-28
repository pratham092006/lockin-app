import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth.jsx';

const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Meals for a given date (with optimistic add #33) ─────────────────────────
export function useMeals(date) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : todayStr();

  const query = useQuery({
    queryKey: ['meals', user?.uid, dateStr],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('meals').select('*')
        .eq('user_id', user.uid).eq('date', dateStr)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const logMeal = useMutation({
    // Optimistic insert (#33)
    onMutate: async (meal) => {
      await qc.cancelQueries({ queryKey: ['meals', user?.uid, dateStr] });
      const prev = qc.getQueryData(['meals', user?.uid, dateStr]);
      const optimistic = {
        id: `temp-${Date.now()}`, user_id: user.uid, ...meal,
        meal_type: meal.mealType, date: dateStr, created_at: new Date().toISOString(),
      };
      qc.setQueryData(['meals', user?.uid, dateStr], old => [...(old || []), optimistic]);
      // Also update daily nutrition cache
      qc.setQueryData(['dailyNutrition', user?.uid, dateStr], old => ({
        calories: (old?.calories || 0) + (meal.calories || 0),
        protein:  (old?.protein  || 0) + (meal.protein  || 0),
        carbs:    (old?.carbs    || 0) + (meal.carbs    || 0),
        fats:     (old?.fats     || 0) + (meal.fats     || 0),
      }));
      return { prev };
    },
    mutationFn: async ({ name, calories = 0, protein = 0, carbs = 0, fats = 0, mealType = 'Other', notes = '' }) => {
      const { error } = await supabase.from('meals').insert({
        user_id: user.uid, name, calories, protein, carbs, fats,
        meal_type: mealType, notes, date: dateStr,
      });
      if (error) throw error;
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['meals', user?.uid, dateStr], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['meals',          user?.uid, dateStr] });
      qc.invalidateQueries({ queryKey: ['dailyNutrition', user?.uid, dateStr] });
    },
  });

  const deleteMeal = useMutation({
    mutationFn: async (mealId) => {
      const { error } = await supabase.from('meals').delete().eq('id', mealId).eq('user_id', user.uid);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals',          user?.uid, dateStr] });
      qc.invalidateQueries({ queryKey: ['dailyNutrition', user?.uid, dateStr] });
    },
  });

  const meals = (query.data || []).map(m => ({ ...m, mealType: m.meal_type }));

  return { meals, loading: query.isLoading, error: query.error, logMeal: logMeal.mutateAsync, deleteMeal: deleteMeal.mutate };
}

// ─── Daily totals ──────────────────────────────────────────────────────────────
export function useDailyNutrition(date) {
  const { user } = useAuth();
  const dateStr = date ? new Date(date).toISOString().split('T')[0] : todayStr();

  const query = useQuery({
    queryKey: ['dailyNutrition', user?.uid, dateStr],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('meals')
        .select('calories, protein, carbs, fats')
        .eq('user_id', user.uid).eq('date', dateStr);
      if (error) throw error;
      return (data || []).reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein:  acc.protein  + (m.protein  || 0),
          carbs:    acc.carbs    + (m.carbs    || 0),
          fats:     acc.fats     + (m.fats     || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
    },
  });

  return {
    nutrition: query.data || { calories: 0, protein: 0, carbs: 0, fats: 0 },
    loading: query.isLoading, error: query.error,
  };
}

// ─── Meal Plans (basic #10) ───────────────────────────────────────────────────
export function useMealPlans() {
  const { user } = useAuth();

  // Pull distinct dates that have meals logged, as "available plans"
  const query = useQuery({
    queryKey: ['mealPlans', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('meals')
        .select('name, calories, protein, carbs, fats, meal_type, date')
        .eq('user_id', user.uid)
        .order('date', { ascending: false })
        .limit(200);
      if (error) throw error;
      // Group by date
      const byDate = {};
      (data || []).forEach(m => {
        if (!byDate[m.date]) byDate[m.date] = { date: m.date, meals: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
        byDate[m.date].meals.push(m);
        byDate[m.date].totals.calories += m.calories || 0;
        byDate[m.date].totals.protein += m.protein || 0;
        byDate[m.date].totals.carbs += m.carbs || 0;
        byDate[m.date].totals.fats += m.fats || 0;
      });
      return Object.values(byDate).filter(p => p.meals.length >= 2).slice(0, 10);
    },
  });

  return { plans: query.data || [], loading: query.isLoading };
}
