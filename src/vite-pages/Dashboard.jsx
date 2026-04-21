import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Flame, Droplets, Target, 
  TrendingUp, CalendarDays, Plus, 
  ArrowRight, Download, Activity,
  ChevronRight, Calculator, User, 
  Scale, BarChart3, Dumbbell, 
  Utensils, Check, Clock, RefreshCcw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useProfile, useWaterTracking, useWeightHistory } from '../hooks/useProfile';
import { useHabits, useTodayHabitLogs, useHabitLogsRange } from '../hooks/useHabits';
import { useDailyNutrition, useMeals } from '../hooks/useNutrition';
import { useWorkoutLogs } from '../hooks/useWorkouts';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { THEME } from '../lib/theme';
import { cn } from '../lib/utils';
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
  const { habits, loading: habitsLoading }  = useHabits();
  const { completedIds, toggle: toggleHabit } = useTodayHabitLogs();
  const { nutrition }                = useDailyNutrition();
  const { logs: workoutLogs }        = useWorkoutLogs();
  const { meals, logMeal }           = useMeals();
  const { history: weightHistory }   = useWeightHistory(30);
  const { completionByDate }         = useHabitLogsRange(7);
  
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [isClient, setIsClient]           = useState(false);

  useEffect(() => { 
    setIsClient(true);
  }, []);

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
  
  const dailyCompletion = completionByDate(habits.length);
  const heatmapData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    return dailyCompletion[ds] || 0;
  });

  const handleWaterLog = async (amount) => {
    try {
      await logWater(amount);
      toast.success(`Logged ${amount === 1 ? '250' : '500'}ml of water`, {
        icon: <Droplets className="text-blue-400" size={16} />
      });
    } catch {
      toast.error("Failed to log water");
    }
  };

  if (profileLoading || !isClient) return <div className="p-8 text-center opacity-50">Loading Dashboard...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Daily Summary</p>
          <div className="flex items-center gap-3 mt-4">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{profile?.username || 'USER'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-auto gap-5">
        
        {/* Nutrition Card */}
        <GlassCard className="col-span-2 row-span-2 p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Nutrition</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">{goalCalories} KCAL GOAL</p>
            </div>
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <Utensils size={24} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <span className="text-7xl font-bold tracking-tighter text-white leading-none">
                {remaining.toLocaleString()}
              </span>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-4">KCAL REMAINING</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Intake</p>
              <p className="text-xl font-bold text-white leading-none">{eaten.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Calculated Burn</p>
              <p className="text-xl font-bold text-white leading-none">{burned.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        {/* Habit Circular Progress */}
        <GlassCard className="col-span-2 lg:col-span-1 p-6 flex flex-col justify-between" hover>
           <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Habit Progress</p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{completedIds.size}/{habits.length}</p>
            </div>
            <div className="relative size-32 mx-auto flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-8 border-white/5" />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="text-3xl font-bold tracking-tight text-white"
               >
                 {habits.length ? Math.round((completedIds.size/habits.length)*100) : 0}%
               </motion.div>
            </div>
        </GlassCard>

        {/* Hydration */}
        <GlassCard className="col-span-2 lg:col-span-1 p-6 flex flex-col justify-between" hover>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hydration</p>
              <Droplets size={16} className="text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white">{waterMl}</span>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">ML</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
               <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, (waterMl/waterGoalMl)*100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleWaterLog(1)} className="h-10 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">+250ml</button>
              <button onClick={() => handleWaterLog(2)} className="h-10 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">+500ml</button>
            </div>
        </GlassCard>

        {/* Activity Heatmap */}
        <GlassCard className="col-span-2 lg:col-span-4 p-6" hover>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Weekly Consistency</h3>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Past 7 Days</p>
          </div>
          
          <div className="flex gap-2 h-16">
            {heatmapData.map((val, i) => (
              <div key={i} className="flex-1 rounded-xl relative overflow-hidden border border-white/5 bg-white/[0.02]">
                <div 
                  className="absolute inset-0 bg-lime-400 transition-all duration-700"
                  style={{ opacity: val * 0.8 || 0.05 }}
                />
                {i === 6 && <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Habits Checklist */}
        <GlassCard className="col-span-2 lg:col-span-2 p-6 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Today's Habits</h3>
          {habitsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 w-full skeleton rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {habits.slice(0, 5).map(habit => {
                const done = completedIds.has(habit.id);
                return (
                  <div key={habit.id} 
                    onClick={() => toggleHabit({ habitId: habit.id, isCompleted: done })}
                    className={cn(
                      "flex justify-between items-center p-4 rounded-xl cursor-pointer border transition-all",
                      done ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    )}>
                    <span className={cn("font-bold text-sm", done ? "text-white/40" : "text-white")}>{habit.name}</span>
                    <div className={cn("size-5 rounded-lg flex items-center justify-center border", done ? "bg-white text-black border-transparent" : "border-white/10")}>
                      {done && <Check size={12} strokeWidth={4} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Weight Analytics */}
        <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
          <GlassCard className="p-6 flex-1" hover>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Weight Tracking</p>
                <h3 className="text-3xl font-bold tracking-tight text-white">
                  {weightHistory[weightHistory.length - 1]?.weight || '--'} <span className="text-sm font-normal text-white/20">KG</span>
                </h3>
              </div>
              <TrendingUp size={24} className="text-lime-400/50" />
            </div>
            <div className="h-20 w-full opacity-30">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={weightHistory}>
                   <Line type="monotone" dataKey="weight" stroke="#CCFF00" strokeWidth={2} dot={false} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </GlassCard>

          <Button onClick={() => setMealModalOpen(true)} className="h-16 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90">
            <Plus size={20} className="mr-2" /> Log Meal
          </Button>
        </div>

      </div>

      <Button 
        variant="ghost" 
        className="w-full h-14 rounded-2xl border border-white/5 text-white/40 hover:text-white"
        onClick={() => {
          const rows = meals.map(m => [m.name, m.mealType, m.calories, m.protein, m.carbs, m.fats]);
          exportCSV(['Name', 'Type', 'Calories', 'Protein', 'Carbs', 'Fats'], rows, 'health-data.csv');
        }}
      >
        <Download size={16} className="mr-2" /> Export Data (CSV)
      </Button>

      <AddMealModal isOpen={mealModalOpen} onClose={() => setMealModalOpen(false)} onSubmit={logMeal} />
    </div>
  );
}
