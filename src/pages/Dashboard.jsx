import React, { useState, useEffect } from 'react';
import { Flame, Plus, TrendingUp, Check, Droplets, Dumbbell, CalendarCheck, Download, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useProfile, useWaterTracking, useWeightHistory } from '../hooks/useProfile';
import { useHabits, useTodayHabitLogs } from '../hooks/useHabits';
import { useDailyNutrition, useMeals } from '../hooks/useNutrition';
import { useWorkoutLogs } from '../hooks/useWorkouts';
import GlassPanel from '../components/GlassPanel';
import AddMealModal from '../components/AddMealModal';

function exportCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const { waterMl, waterGoalMl, logWater } = useWaterTracking();
  const { habits }                   = useHabits();
  const { completedIds, toggle: toggleHabit } = useTodayHabitLogs();
  const { nutrition }                = useDailyNutrition();
  const { logs: workoutLogs }        = useWorkoutLogs();
  const { meals, logMeal }           = useMeals();
  const { history: weightHistory }   = useWeightHistory(30);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [gaugeReady, setGaugeReady]       = useState(false);

  useEffect(() => { const t = setTimeout(() => setGaugeReady(true), 100); return () => clearTimeout(t); }, []);

  if (profileLoading) {
    return (
      <div className="space-y-4 animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="skeleton h-64 lg:col-span-2 lg:row-span-2" />
        <div className="skeleton h-64 lg:col-span-2" />
        <div className="skeleton h-48 lg:col-span-2" />
      </div>
    );
  }

  const goalCalories = profile?.dailyCalorieGoal || 2200;
  const eaten        = Math.round(nutrition.calories || 0);
  const todayStr     = new Date().toISOString().split('T')[0];
  const burned       = workoutLogs
    .filter(l => l.date === todayStr)
    .reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const remaining    = Math.max(goalCalories - eaten + burned, 0);
  
  // Isometric Habit Ring logic
  const habitPct = habits.length === 0 ? 0 : completedIds.size / habits.length;
  const HR = 80;
  const habitCirc = 2 * Math.PI * HR;
  const habitOffset = gaugeReady ? habitCirc - habitPct * habitCirc : habitCirc;
  
  // Quick mock for heatmap (last 7 days logic would go here ideally)
  const heatmapData = [0.4, 0.8, 1.0, 0.6, 0.2, 0.9, habitPct];

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold mono-data text-white/50 mb-1">
            DASHBOARD OVERVIEW
          </p>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Lock<span className="text-[#00FFFF]">In</span>
          </h1>
        </div>
      </div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
        
        {/* 1. Energy Balance Hero (2x2) */}
        <GlassPanel className="col-span-2 row-span-2 p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold font-header">Energy Balance</h2>
              <p className="text-xs text-white/50 mono-data mt-1">{goalCalories} KCAL GOAL</p>
            </div>
            <Activity className="text-[#00FFFF]" size={24} />
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <span className="text-6xl font-black tracking-tighter font-display mb-1">{remaining.toLocaleString()}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00FFFF] mono-data glow-cyan bg-[#00FFFF]/10 px-3 py-1 rounded-full">
              KCAL LEFT
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase font-bold text-white/50 mb-1">EATEN</p>
              <p className="text-2xl font-bold font-mono">{eaten}</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-[10px] tracking-widest uppercase font-bold text-white/50 mb-1">BURNED</p>
              <p className="text-2xl font-bold font-mono text-[#CCFF00]">{burned}</p>
            </div>
          </div>
        </GlassPanel>

        {/* 2. Isometric Habit Completion Ring (2x1 for Mobile, 1x2 for Desktop or 2x1) */}
        <GlassPanel className="col-span-2 lg:col-span-1 row-span-1 p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-header uppercase tracking-wider">Habits</h3>
            <p className="text-xs text-white/50 mono-data">{completedIds.size}/{habits.length} Done</p>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-48 h-48 pointer-events-none" 
               style={{ transform: 'perspective(1000px) rotateX(55deg) rotateZ(-45deg)' }}>
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
              {/* Track */}
              <circle cx="100" cy="100" r={HR} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
              {/* Progress */}
              <circle cx="100" cy="100" r={HR} fill="transparent"
                      stroke="url(#habitGrad)" strokeWidth="20" strokeLinecap="round"
                      strokeDasharray={habitCirc} strokeDashoffset={habitOffset}
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: habitPct > 0 ? 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' : 'none', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
              <defs>
                <linearGradient id="habitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="z-10 mt-14">
            <span className="text-4xl font-black font-display">{Math.round(habitPct * 100)}%</span>
          </div>
        </GlassPanel>

        {/* 3. Hydration Card (2x1) */}
        <GlassPanel className="col-span-2 lg:col-span-1 row-span-1 p-5 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold font-header uppercase tracking-wider">Hydration</h3>
            <Droplets size={18} className="text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
          </div>
          <div className="my-4">
            <p className="text-4xl font-black font-display text-[#00FFFF] tracking-tight">{waterMl.toLocaleString()} <span className="text-[12px] font-bold text-white/50">ML</span></p>
            <div className="w-full h-2.5 bg-white/5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div className="h-full bg-[#00FFFF] shadow-[0_0_12px_#00FFFF] transition-all duration-1000 ease-out" 
                   style={{ width: `${Math.min((waterMl / waterGoalMl) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => logWater(1)} className="flex-1 py-3 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-[#00FFFF] rounded-xl text-xs font-bold font-header tracking-wider transition-all border border-[#00FFFF]/20 hover:border-[#00FFFF]/40 active:scale-95 shadow-[0_0_12px_rgba(0,255,255,0.1)]">
              + 250 ML
            </button>
            <button onClick={() => logWater(2)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs font-bold font-header tracking-wider transition-all border border-white/10 active:scale-95">
              + 500 ML
            </button>
          </div>
        </GlassPanel>

        {/* 4. Habit Heatmap (4x1) */}
        <GlassPanel className="col-span-2 lg:col-span-4 p-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold font-header">Habit Heatmap</h3>
              <p className="text-[10px] uppercase font-bold text-white/50 mono-data mt-1">LAST 7 DAYS ACTIVITY</p>
            </div>
          </div>
          
          {/* Heatmap Visualization Grid */}
          <div className="flex items-center gap-2 justify-between">
            {heatmapData.map((val, i) => {
              // Map 0-1 to opacities of the gradient
              const bgOp = Math.max(0.1, val);
              const isToday = i === heatmapData.length - 1;
              return (
                <div key={i} className="flex-1 aspect-square rounded-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7] to-[#EC4899] transition-all duration-500"
                       style={{ opacity: bgOp, filter: val > 0.7 ? 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.5))' : 'none' }} />
                  {isToday && (
                    <div className="absolute inset-0 border-2 border-white/40 rounded-2xl pointer-events-none" />
                  )}
                  {val > 0.8 && <div className="absolute inset-0 bg-white/20 blur-md pointer-events-none mix-blend-overlay" />}
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* 5. Quick Habit Toggles (2x2 or 4x1 depending on screen) */}
        <GlassPanel className="col-span-2 lg:col-span-2 p-6 flex flex-col">
          <h3 className="text-md font-bold font-header mb-4">Today's Focus</h3>
          {habits.length === 0 ? (
            <p className="text-xs text-white/50 italic">No habits tracking yet.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto hide-scrollbar flex-1">
              {habits.slice(0, 5).map(habit => {
                const done = completedIds.has(habit.id);
                return (
                  <div key={habit.id} 
                    onClick={() => toggleHabit({ habitId: habit.id, isCompleted: done })}
                    className="flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                    style={{ 
                      background: done ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))' : 'rgba(255,255,255,0.03)',
                      border: done ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: done ? '0 4px 16px rgba(236,72,153,0.1)' : 'none'
                    }}>
                    <span className="font-bold text-sm">{habit.name}</span>
                    <div className={`size-6 rounded-lg flex-center border-2 transition-all duration-300 ${done ? 'border-transparent bg-gradient-to-br from-[#A855F7] to-[#EC4899] scale-110 shadow-[0_0_12px_rgba(236,72,153,0.4)]' : 'border-white/20 bg-black/20'}`}>
                      {done && <Check size={14} strokeWidth={4} className="text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassPanel>

        {/* 6. Weight Progress & Quick Action (4x1 or 2x2) */}
        <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
          {weightHistory.length > 1 && (
            <GlassPanel className="p-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold font-header uppercase tracking-wider">Weight</h3>
                <span className="text-xl font-black font-display text-[#CCFF00]">
                  {weightHistory[weightHistory.length - 1]?.weight} <span className="text-[10px] text-white/50">KG</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={weightHistory}>
                  <Line type="monotone" dataKey="weight" stroke="#CCFF00" strokeWidth={3} dot={false}
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(204,255,0,0.3))' }} />
                </LineChart>
              </ResponsiveContainer>
            </GlassPanel>
          )}

          <div className="flex gap-4">
            <button onClick={() => setMealModalOpen(true)} className="flex-1 lv-btn-primary flex-center gap-2">
              <Plus size={18} /> Log Meal
            </button>
          </div>
        </div>

      </div>

      {/* Export Data Button */}
      <div className="pt-4">
        <button onClick={() => {
          const rows = meals.map(m => [m.name, m.mealType, m.calories, m.protein, m.carbs, m.fats]);
          exportCSV(['Name', 'Type', 'Calories', 'Protein', 'Carbs', 'Fats'], rows, 'lockin-meals.csv');
        }}
          className="w-full py-4 rounded-[20px] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Download size={16} className="text-white/50" /> Export Analytics
        </button>
      </div>

      <AddMealModal isOpen={mealModalOpen} onClose={() => setMealModalOpen(false)} onSubmit={logMeal} />
    </div>
  );
}
