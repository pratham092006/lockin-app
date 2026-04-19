import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Coffee, UtensilsCrossed, Apple, Trash2, 
  ChevronRight, ChevronLeft, CalendarDays, Copy,
  Zap, Flame, Target, PieChart, Activity, Clock, Download
} from 'lucide-react';
import { useMeals, useMealPlans, useDailyNutrition } from '../hooks/useNutrition';
import { useProfile } from '../hooks/useProfile';
import AddMealModal from '../components/AddMealModal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

function exportCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const MEAL_ICONS = { 
  Breakfast: Coffee, 
  Lunch: UtensilsCrossed, 
  Dinner: UtensilsCrossed, 
  Snack: Apple, 
  Other: Activity 
};

export default function Nutrition() {
  const [activeTab, setActiveTab]     = useState('diary');
  const [mealModalOpen, setMealOpen]  = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  const { meals, logMeal, deleteMeal } = useMeals(selectedDate);
  const { nutrition }                  = useDailyNutrition(selectedDate);
  const { profile, loading: profileLoading } = useProfile();
  const { plans }                      = useMealPlans();

  const totalCals   = Math.round(nutrition.calories || 0);
  const goalCals    = profile?.dailyCalorieGoal || 2200;
  const remaining   = Math.max(goalCals - totalCals, 0);
  const progressPct = Math.min((totalCals / goalCals) * 100, 100);

  const proteinTarget = profile?.proteinTarget || 150;
  const carbsTarget   = profile?.carbsTarget || 250;
  const fatsTarget    = profile?.fatsTarget || 70;

  const MACROS = [
    { key: 'protein', label: 'Protein', color: '#CCFF00', value: Math.round(nutrition.protein || 0), max: proteinTarget, icon: <Zap size={10} /> },
    { key: 'carbs',   label: 'Carbs',   color: '#00FFFF',    value: Math.round(nutrition.carbs || 0),   max: carbsTarget,   icon: <PieChart size={10} /> },
    { key: 'fats',    label: 'Fats',    color: '#FF3366',    value: Math.round(nutrition.fats || 0),    max: fatsTarget,    icon: <Flame size={10} /> },
  ];

  const prevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => { if (!isToday) setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }); };

  if (profileLoading) return <div className="p-20 text-center opacity-30">Loading Nutrition Data...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Nutrition</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mt-1">Daily Intake Tracking</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="h-14 rounded-2xl border border-white/5 text-white/40 hover:text-white" 
            onClick={() => {
              const rows = meals.map(m => [m.name, m.mealType, m.calories, m.protein, m.carbs, m.fats]);
              exportCSV(['Name', 'Type', 'Calories', 'Protein', 'Carbs', 'Fats'], rows, 'meal-data.csv');
              toast.info("Exporting records...");
            }}>
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button 
            onClick={() => setMealOpen(true)}
            className="h-14 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90"
          >
            <Plus size={20} className="mr-2" /> Log Meal
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-2xl w-full sm:w-fit sm:mx-auto">
        <button onClick={prevDay} className="p-3 rounded-xl transition-all hover:bg-white/5 text-white/40 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <div className="px-8 text-center min-w-[140px]">
          <p className="text-sm font-bold uppercase tracking-widest text-white">
            {isToday ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[9px] font-bold text-white/20 mt-0.5">{dateStr}</p>
        </div>
        <button onClick={nextDay} disabled={isToday}
          className="p-3 rounded-xl transition-all hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-5"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Gauges */}
      <GlassCard className="p-10 flex flex-col items-center relative overflow-hidden group">
        <div className="relative flex items-center justify-center">
            <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
              <circle cx="120" cy="120" r="100" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
              <motion.circle 
                cx="120" cy="120" r="100" fill="transparent"
                stroke={totalCals > goalCals ? "#EF4444" : "#FFFFFF"}
                strokeWidth="14" strokeLinecap="round"
                initial={{ strokeDasharray: 2 * Math.PI * 100, strokeDashoffset: 2 * Math.PI * 100 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progressPct / 100) }}
                transition={{ duration: 2, ease: "circOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-6xl font-bold tracking-tighter text-white leading-none">
                {remaining.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold mt-2 text-white/30">KCAL REMAINING</span>
              <div className="flex items-center gap-1.5 mt-4 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                 <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{totalCals} CALORIES IN</span>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-12 w-full border-t border-white/5 pt-10">
          {MACROS.map(m => {
            const pct = Math.min((m.value / m.max) * 100, 100);
            return (
              <div key={m.key} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-white/20">
                  {m.icon}
                  <span className="text-[10px] uppercase font-bold tracking-widest">{m.label}</span>
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: m.color }}>
                  {m.value}<span className="text-xs ml-0.5 opacity-40">g</span>
                </p>
                <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full rounded-full" 
                    style={{ background: m.color }} 
                  />
                </div>
                <p className="text-[9px] mt-2 font-bold text-white/10 uppercase">Goal: {m.max}g</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-fit">
        {[
          { id: 'diary', label: 'Meal Diary', icon: <UtensilsCrossed size={14} /> }, 
          { id: 'plans', label: 'History', icon: <CalendarDays size={14} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === tab.id 
                ? "bg-white text-black shadow-lg" 
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'diary' && (
          <motion.div 
            key="diary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 pt-2"
          >
            {meals.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <UtensilsCrossed size={48} className="text-white/10 mb-6" />
                <p className="text-sm text-white/30 font-medium uppercase tracking-widest text-center mb-8">No meals logged today</p>
                <Button onClick={() => setMealOpen(true)} className="h-16 px-10 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90">
                  <Plus size={20} className="mr-2" /> Log First Meal
                </Button>
              </div>
            ) : (
              meals.map(meal => {
                const Icon = MEAL_ICONS[meal.mealType] || Apple;
                const time = meal.created_at
                  ? new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';
                
                return (
                  <motion.div
                    layout
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group"
                  >
                    <GlassCard className="p-5 flex items-center justify-between cursor-default border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl flex items-center justify-center bg-white/5 text-white/40 border border-white/10 group-hover:bg-white/10 transition-all">
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-xl text-white uppercase tracking-tight mb-1">{meal.name}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{meal.mealType}</span>
                             {time && <><span className="size-1 rounded-full bg-white/10" /><span className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> {time}</span></>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex gap-4 border-r border-white/5 pr-6 mr-2">
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-lime-400 uppercase tracking-widest">P</p>
                              <p className="text-sm font-bold text-white/60">{meal.protein}g</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">C</p>
                              <p className="text-sm font-bold text-white/60">{meal.carbs}g</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">F</p>
                              <p className="text-sm font-bold text-white/60">{meal.fats}g</p>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-3xl text-white leading-none tracking-tighter">{meal.calories}</p>
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/30 mt-1">CALORIES</p>
                        </div>
                        <button 
                          onClick={() => {
                            if(confirm(`Delete meal: ${meal.name}?`)) {
                              deleteMeal(meal.id);
                              toast.info("Meal deleted");
                            }
                          }}
                          className="p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === 'plans' && (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pt-2"
          >
            {plans.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <CalendarDays size={48} className="text-white/10 mb-6" />
                <p className="text-sm text-white/30 font-medium uppercase tracking-widest text-center">No history found</p>
              </div>
            ) : (
              plans.map(plan => (
                <GlassCard key={plan.date} className="p-6 group">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                       <div className="size-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 text-white/40">
                          <p className="text-lg font-bold leading-none">{plan.date.split('-')[2]}</p>
                       </div>
                       <div>
                         <p className="font-bold text-sm uppercase tracking-widest text-white">{plan.date}</p>
                         <p className="text-xs mt-1 text-white/40 font-bold tracking-tight">{plan.meals.length} MEALS • {plan.totals.calories} KCAL</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex gap-2 flex-1 sm:flex-none">
                        {[
                          { label: 'P', val: plan.totals.protein, color: '#CCFF00' },
                          { label: 'C', val: plan.totals.carbs, color: '#00FFFF' },
                          { label: 'F', val: plan.totals.fats, color: '#FF3366' },
                        ].map(m => (
                          <div key={m.label} className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-center min-w-[60px]">
                             <p className="text-[8px] font-black uppercase mb-0.5" style={{ color: m.color }}>{m.label}</p>
                             <p className="text-xs font-bold text-white">{m.val}g</p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => {
                          plan.meals.forEach(m => logMeal({
                            name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fats: m.fats,
                            mealType: m.meal_type,
                          }));
                          toast.success("History copied to today");
                        }}
                        className="size-11 rounded-xl transition-all"
                      >
                        <Copy size={18} />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddMealModal 
        isOpen={mealModalOpen} 
        onClose={() => setMealOpen(false)} 
        onSubmit={(data) => {
          logMeal(data);
          toast.success(`Meal logged: ${data.name}`);
        }} 
      />
    </div>
  );
}
