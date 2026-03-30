import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null, session: null, profile: null,
  loading: true, profileLoading: true,
  signUp: async () => {}, signIn: async () => {}, signOutUser: async () => {},
  resetPassword: async () => {},  // #13
  setProfile: () => {},
});

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*')
    .eq('id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// #37 — fallback: if profile is null (trigger didn't fire), create one
async function ensureProfile(userId, email) {
  let profile = await fetchProfile(userId);
  if (!profile) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId, user_id: userId, display_name: email?.split('@')[0] || 'User',
      onboarding_done: false,
    }, { onConflict: 'id' });
    if (!error) profile = await fetchProfile(userId);
  }
  return profile;
}

function normaliseProfile(raw) {
  if (!raw) return null;
  return {
    ...raw,
    dailyCalorieGoal: raw.daily_calorie_goal ?? raw.dailyCalorieGoal ?? 2200,
    waterIntakeGoal:  raw.water_intake_goal  ?? raw.waterIntakeGoal ?? 8,
    height:           raw.height_cm ?? raw.height,
    weight:           raw.weight_kg ?? raw.weight,
    goalWeight:       raw.goal_weight_kg ?? raw.goal_weight ?? raw.goalWeight,
    activityLevel:    raw.activity_level ?? raw.activityLevel ?? 1.55,
    fitnessGoal:      raw.fitness_goal   ?? raw.fitnessGoal ?? 'maintain',
    gender:           raw.gender         ?? 'male',
    age:              raw.age,
    displayName:      raw.display_name ?? raw.displayName,
    onboardingDone:   raw.onboarding_done ?? raw.onboardingDone ?? false,
    todayWater:       raw.today_water ?? raw.todayWater ?? 0,
    proteinTarget:    raw.protein_target ?? raw.proteinTarget ?? 150,
    carbsTarget:      raw.carbs_target ?? raw.carbsTarget ?? 250,
    fatsTarget:       raw.fats_target ?? raw.fatsTarget ?? 70,
    waterUnit:        raw.water_unit ?? raw.waterUnit ?? 'ml', // #34
  };
}

export function AuthProvider({ children }) {
  const [session,        setSession]        = useState(null);
  const [authLoading,    setAuthLoading]    = useState(true);
  const [rawProfile,     setRawProfile]     = useState(undefined);
  const lastUserIdRef = useRef(null);

  // ── Load auth session ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id !== lastUserIdRef.current) {
        setRawProfile(undefined);
      }
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load profile + today's water ─────────────────────────────────────────
  useEffect(() => {
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId) {
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === userId) return;
    lastUserIdRef.current = userId;

    (async () => {
      try {
        const profile = await ensureProfile(userId, userEmail); // #37
        // Fetch today's water in parallel
        const today = new Date().toISOString().split('T')[0];
        const { data: waterData } = await supabase.from('water_logs')
          .select('cups').eq('user_id', userId).eq('date', today).single();
        if (profile) profile.today_water = waterData?.cups || 0;
        setRawProfile(profile);
      } catch { setRawProfile(null); }
    })();
  }, [session?.user?.id, session?.user?.email, authLoading]);

  // ── Auth actions ─────────────────────────────────────────────────────────
  const signUp = async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setRawProfile(null);
    lastUserIdRef.current = null;
  };

  // #13 — Password reset
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    if (error) throw error;
  };

  const setProfile = (updater) => {
    setRawProfile(prev => typeof updater === 'function' ? updater(prev) : (prev ? { ...prev, ...updater } : updater));
  };

  // ── Derived state ────────────────────────────────────────────────────────
  const user = useMemo(() => {
    if (!session?.user) return null;
    return {
      uid: session.user.id,
      id: session.user.id,
      email: session.user.email,
      displayName:
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split('@')[0],
      photoURL: session.user.user_metadata?.avatar_url || null,
    };
  }, [session]);

  const profile = useMemo(() => normaliseProfile(rawProfile), [rawProfile]);
  const profileLoading = !!session?.user && rawProfile === undefined;
  const loading = authLoading || (!!session?.user && profileLoading);

  const value = useMemo(
    () => ({ user, session, profile, loading, profileLoading, signUp, signIn, signOutUser, resetPassword, setProfile }),
    [user, session, profile, loading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
