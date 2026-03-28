import React, { useState, useEffect } from 'react';
import { Flame, Plus, TrendingUp, Check, Droplets, Scale, ChevronRight, Dumbbell, Utensils, CalendarCheck, Download } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useProfile, useWaterTracking, useWeightHistory } from '../hooks/useProfile';
import { useHabits, useTodayHabitLogs } from '../hooks/useHabits';
import { useDailyNutrition, useMeals } from '../hooks/useNutrition';
import { useWorkoutLogs } from '../hooks/useWorkouts';
import GlassPanel from '../components/GlassPanel';
import AddMealModal from '../components/AddMealModal';
import { C } from '../lib/theme';

// ── Weekly summary helper (#44) ───────────────────────────────────────────────
function useWeeklySummary() {
  const { logs: workoutLogs }        = useWorkoutLogs();
  const { habits }                   = useHabits();
  const { completedIds }             = useTodayHabitLogs();
  const { todayCups, waterGoal }     = useWaterTracking();

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const weekWorkouts = workoutLogs.filter(l => l.date >= weekAgo).length;

  return {
    weekWorkouts,
    habitPct: habits.length > 0 ? Math.round((completedIds.size / habits.length) * 100) : 0,
    waterPct: waterGoal > 0 ? Math.round((todayCups / waterGoal) * 100) : 0,
    totalHabits: habits.length,
  };
}

// ── Export data as CSV (#48) ──────────────────────────────────────────────────
function exportCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const { todayCups, waterGoal, waterMl, waterGoalMl, logWater } = useWaterTracking();
  const { habits }                   = useHabits();
  const { completedIds, toggle: toggleHabit } = useTodayHabitLogs();
  const { nutrition }                = useDailyNutrition();
  const { logs: workoutLogs }        = useWorkoutLogs();
  const { meals, logMeal }           = useMeals();
  const { history: weightHistory }   = useWeightHistory(30);
  const summary                      = useWeeklySummary();
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [gaugeReady, setGaugeReady]       = useState(false);

  useEffect(() => { const t = setTimeout(() => setGaugeReady(true), 200); return () => clearTimeout(t); }, []);

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {['h-72', 'h-56', 'h-48'].map((h, i) => <div key={i} className={`skeleton ${h} rounded-[2rem]`} />)}
      </div>
    );
  }

  const goalCalories = profile?.dailyCalorieGoal || 2200;
  const eaten        = Math.round(nutrition.calories || 0);
  const todayStr     = new Date().toISOString().split('T')[0];
  const burned       = workoutLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const remaining    = Math.max(goalCalories - eaten + burned, 0); // #1 fixed
  const pct          = Math.min((eaten / goalCalories) * 100, 100);

  // SVG ring
  const R    = 110;
  const circ = 2 * Math.PI * R;
  const offset = gaugeReady ? circ - (pct / 100) * circ : circ;

  // Water (#1 fix — uses todayCups from hook, not waterHistory[0])
  const waterPct = Math.min(waterMl / waterGoalMl, 1);

  return (
    <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>

      {/* ── Hero: Daily Energy Balance ── */}
      <section>
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.primaryC }}>
            DAILY ENERGY BALANCE
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
            Focus on Vitality
          </h1>
        </div>

        <GlassPanel className="p-8 flex flex-col items-center">
          {/* Ring — #24 empty state */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r={R} fill="transparent" stroke="rgba(53,53,52,0.8)" strokeWidth="10" />
              <circle cx="128" cy="128" r={R} fill="transparent"
                stroke={eaten === 0 ? 'rgba(75,142,255,0.15)' : C.primaryC}
                strokeWidth="13" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="progress-ring-circle"
                style={{ filter: eaten > 0 ? 'drop-shadow(0 0 12px rgba(75,142,255,0.45))' : 'none' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {eaten === 0 ? (
                <>
                  <span className="text-lg font-bold" style={{ color: C.outline }}>Start Tracking</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: C.outline }}>
                    {goalCalories.toLocaleString()} kcal goal
                  </span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-black tracking-tighter"
                    style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
                    {remaining.toLocaleString()}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] font-bold mt-1" style={{ color: C.outline }}>
                    KCAL LEFT
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 gap-8 w-full mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: C.secondary }}>
                <span className="text-[10px] uppercase font-bold tracking-widest">EATEN</span>
              </div>
              <p className="text-xl font-bold" style={{ fontFamily: "'Manrope', system-ui" }}>{eaten.toLocaleString()}</p>
            </div>
            <div className="text-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: C.primary }}>
                <Flame size={14} />
                <span className="text-[10px] uppercase font-bold tracking-widest">BURNED</span>
              </div>
              <p className="text-xl font-bold" style={{ fontFamily: "'Manrope', system-ui" }}>{burned}</p>
            </div>
          </div>

          <button onClick={() => setMealModalOpen(true)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#00285c',
              boxShadow: '0 4px 20px rgba(75,142,255,0.35)', fontFamily: "'Manrope', system-ui" }}>
            <Plus size={18} /> Log Food
          </button>
        </GlassPanel>
      </section>

      {/* ── Weekly Summary (#44) ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Workouts', value: summary.weekWorkouts, sub: 'this week', icon: Dumbbell, color: C.primaryC },
          { label: 'Habits', value: `${summary.habitPct}%`, sub: 'today', icon: CalendarCheck, color: C.secondary },
          { label: 'Water', value: `${summary.waterPct}%`, sub: 'of goal', icon: Droplets, color: '#38bdf8' },
        ].map(s => (
          <GlassPanel key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.outline }}>{s.label}</span>
            </div>
            <p className="text-2xl font-black" style={{ fontFamily: "'Manrope', system-ui", color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-medium" style={{ color: C.outline }}>{s.sub}</p>
          </GlassPanel>
        ))}
      </div>

      {/* ── Hydration Card (#21 fix) ── */}
      <GlassPanel className="p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>Hydration</h3>
            <p className="text-xs font-medium" style={{ color: C.outline }}>Goal: {waterGoalMl.toLocaleString()}ml</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black" style={{ fontFamily: "'Manrope', system-ui", color: C.primary }}>
              {waterMl.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold ml-1" style={{ color: C.outline }}>ML</span>
          </div>
        </div>

        <div className="relative h-40 w-full rounded-2xl overflow-hidden flex items-end p-2"
          style={{ background: '#0e0e0e' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(173,198,255,0.04))' }} />
          <div className="relative w-full rounded-xl transition-all duration-700"
            style={{
              height: `${Math.max(waterPct * 100, 5)}%`,
              background: 'linear-gradient(to top, rgba(75,142,255,0.4), rgba(173,198,255,0.18))',
              boxShadow: '0 0 30px rgba(0,122,255,0.15)',
            }}>
            <div className="absolute top-0 left-0 w-full h-0.5 blur-[1px]" style={{ background: 'rgba(255,255,255,0.18)' }} />
          </div>
          <div className="absolute bottom-8 left-1/4 w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute bottom-14 right-1/3 w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div className="flex gap-3">
          <button onClick={() => logWater(1)}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(42,42,42,0.8)', color: C.onSurface }}>
            + 250ml
          </button>
          <button onClick={() => logWater(2)}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: C.primary, color: '#001a41', boxShadow: '0 4px 12px rgba(173,198,255,0.28)' }}>
            + 500ml
          </button>
        </div>
      </GlassPanel>

      {/* ── Weight Progress Chart (#40) ── */}
      {weightHistory.length > 1 && (
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>Weight Progress</h3>
              <p className="text-xs" style={{ color: C.outline }}>Last 30 days</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black" style={{ fontFamily: "'Manrope', system-ui", color: C.secondary }}>
                {weightHistory[weightHistory.length - 1]?.weight || 0}
              </span>
              <span className="text-xs font-bold ml-1" style={{ color: C.outline }}>kg</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={weightHistory}>
              <XAxis dataKey="date" hide />
              <Tooltip
                contentStyle={{ background: '#201f1f', border: '1px solid rgba(65,71,85,0.3)', borderRadius: '12px', color: '#e5e2e1', fontSize: '12px' }}
                labelStyle={{ color: '#8b90a0' }} />
              <Line type="monotone" dataKey="weight" stroke={C.secondary} strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: C.secondary }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassPanel>
      )}

      {/* ── Daily Habits ── */}
      <GlassPanel className="p-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>Daily Habits</h3>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.secondary }}>
              {habits.length} HABITS
            </p>
          </div>
          <div className="size-10 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: 'rgba(66,227,85,0.25)' }}>
            <span className="text-xs font-bold" style={{ color: C.secondary }}>
              {habits.length === 0 ? '0%' : `${Math.round((completedIds.size / Math.max(habits.length, 1)) * 100)}%`}
            </span>
          </div>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: C.outline }}>No habits yet. Create one from the Habits page.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.slice(0, 5).map(habit => {
              const done = completedIds.has(habit.id);
              return (
                <div key={habit.id}
                  className="flex items-center justify-between p-4 rounded-2xl transition-all"
                  style={{
                    background: done ? 'rgba(66,227,85,0.06)' : 'rgba(14,14,14,0.5)',
                    border: done ? '1px solid rgba(66,227,85,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl flex items-center justify-center"
                      style={{ background: done ? 'rgba(66,227,85,0.15)' : 'rgba(173,198,255,0.1)', color: done ? C.secondary : C.primary }}>
                      <Check size={18} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: C.onSurface }}>{habit.name}</span>
                  </div>
                  <button onClick={() => toggleHabit({ habitId: habit.id, isCompleted: done })}
                    className="size-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
                    style={{ borderColor: done ? C.secondary : 'rgba(139,144,160,0.35)', background: done ? C.secondary : 'transparent' }}>
                    {done && <Check size={13} color="#00390a" strokeWidth={3} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </GlassPanel>

      {/* ── Vitality Markers (last workout) ── */}
      {workoutLogs.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-widest font-bold px-2 mb-4" style={{ color: C.outline }}>
            VITALITY MARKERS
          </p>
          <div className="relative w-full h-44 rounded-[2.5rem] overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1c1b1b, #201f1f)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #131313, transparent)' }} />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-1" style={{ color: '#70ff76' }}>
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Last Session</span>
              </div>
              <h4 className="font-bold text-xl leading-tight" style={{ fontFamily: "'Manrope', system-ui" }}>
                {workoutLogs[0]?.exercises?.[0]?.name || 'Workout Complete'}
              </h4>
              <p className="text-xs mt-1" style={{ color: C.onSurfaceV }}>
                {workoutLogs[0]?.duration || 0} min • {workoutLogs[0]?.exercises?.length || 0} exercises
                {workoutLogs[0]?.caloriesBurned > 0 && ` • ${workoutLogs[0].caloriesBurned} kcal`}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Export Data Button (#48) ── */}
      <button onClick={() => {
        const rows = meals.map(m => [m.name, m.mealType, m.calories, m.protein, m.carbs, m.fats]);
        exportCSV(['Name', 'Type', 'Calories', 'Protein', 'Carbs', 'Fats'], rows, 'lockin-meals.csv');
      }}
        className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: 'rgba(42,42,42,0.4)', border: '1px solid rgba(65,71,85,0.2)', color: C.outline }}>
        <Download size={14} /> Export Today's Data
      </button>

      <AddMealModal isOpen={mealModalOpen} onClose={() => setMealModalOpen(false)} onSubmit={logMeal} />
    </div>
  );
}
