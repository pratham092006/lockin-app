import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Check, Flame, Trash2, CalendarDays, 
  Zap, Trophy, Target, TrendingUp, ChevronRight,
  Activity
} from 'lucide-react';
import { useHabits, useTodayHabitLogs, useHabitLogsRange } from '../hooks/useHabits';
import AddHabitModal from '../components/AddHabitModal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

// ── Habit row ──────────────────────────────────────────────────────────────────
function HabitRow({ habit, isCompleted, onToggle, onDelete, isToggling, streak }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ x: 4 }}
      className="group"
    >
      <GlassCard 
        className={cn(
          "flex items-center justify-between p-4 transition-all duration-500",
          isCompleted ? "bg-lime-500/[0.03] border-lime-500/20 shadow-[0_0_20px_rgba(204,255,0,0.05)]" : "bg-white/[0.02] border-white/5"
        )}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <div 
              className="size-12 rounded-[18px] flex items-center justify-center shrink-0 border transition-all duration-500"
              style={{ 
                background: isCompleted ? `${habit.color}20` : `${habit.color}10`, 
                borderColor: isCompleted ? `${habit.color}50` : `${habit.color}20` 
              }}
            >
               <div 
                 className="size-4 rounded-full transition-all duration-500 shadow-lg" 
                 style={{ 
                   background: habit.color, 
                   boxShadow: `0 0 15px ${habit.color}80`,
                   transform: isCompleted ? 'scale(0.8)' : 'scale(1)'
                 }} 
               />
            </div>
            {isCompleted && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 size-5 bg-lime-400 rounded-full flex items-center justify-center border-2 border-black"
              >
                <Check size={10} strokeWidth={4} className="text-black" />
              </motion.div>
            )}
          </div>

          <div className="min-w-0">
            <p className={cn(
              "font-black text-lg tracking-tight uppercase transition-all duration-500",
              isCompleted ? "text-white/40 line-through decoration-lime-400/50 decoration-2" : "text-white"
            )} style={{ fontFamily: 'var(--font-display)' }}>
              {habit.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {streak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame size={12} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500/80 mono-data">{streak}D STREAK</span>
                </div>
              )}
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">DAILY HABIT</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => {
              if(confirm(`Delete habit: ${habit.name}?`)) {
                onDelete(habit.id);
                toast.error("Habit deleted");
              }
            }}
            className="p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 hover:bg-red-500/10 active:scale-90"
          >
            <Trash2 size={16} />
          </button>
          
          <button 
            onClick={() => {
              onToggle({ habitId: habit.id, isCompleted });
              if (!isCompleted) toast.success(`Habit completed: ${habit.name}`, {
                icon: <Trophy size={14} className="text-lime-400" />
              });
            }} 
            disabled={isToggling}
            className={cn(
              "size-10 rounded-[18px] border-2 flex items-center justify-center transition-all duration-500 active:scale-95",
              isCompleted 
                ? "bg-lime-400 border-transparent shadow-[0_0_20px_rgba(204,255,0,0.5)] rotate-0" 
                : "bg-white/5 border-white/10 hover:border-white/20 rotate-45"
            )}
          >
            {isCompleted ? (
              <Check size={20} className="text-black" strokeWidth={4} />
            ) : (
              <Plus size={20} className="text-white/30" strokeWidth={3} />
            )}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Contribution Grid ────────────────────────────────────────────────────────
function ContributionGrid({ completionByDate, totalHabits }) {
  const grid = completionByDate(totalHabits);
  const today = new Date();
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <GlassCard className="p-8 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] pointer-events-none" />
      <div className="flex items-center justify-between mb-8">
        <div>
           <h3 className="text-xl font-bold tracking-tight text-white">Activity</h3>
           <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">Progress History (Last 12 Weeks)</p>
        </div>
        <div className="flex gap-1">
           {[0,1,2].map(i => <div key={i} className="size-1 rounded-full bg-purple-500/50" />)}
        </div>
      </div>
      
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-2.5">
            {week.map(dateStr => {
              const pct = grid[dateStr] || 0;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <motion.div 
                  key={dateStr} 
                  initial={false}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className="size-4 rounded-[4px] cursor-help relative"
                  style={{
                    background: pct >= 1 ? '#CCFF00' : 
                                pct >= 0.7 ? '#CCFF00cc' : 
                                pct >= 0.4 ? '#CCFF0099' : 
                                pct > 0 ? '#CCFF0044' : 'rgba(255,255,255,0.03)',
                    boxShadow: pct >= 0.7 ? '0 0 10px rgba(204,255,0,0.3)' : 'none',
                    border: isToday ? '1px solid rgba(255,255,255,0.4)' : 'none'
                  }} 
                  title={`${dateStr}: ${Math.round(pct * 100)}% Completion`} 
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-3 mt-8 justify-end text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
        <span>Low Activity</span>
        <div className="flex gap-1.5">
          {[0, 0.3, 0.6, 1].map((v, i) => (
            <div key={i} className="size-3 rounded-[3px]" style={{
              background: v >= 1 ? '#CCFF00' : v >= 0.6 ? '#CCFF0088' : v > 0 ? '#CCFF0033' : 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
        <span>High Activity</span>
      </div>
    </GlassCard>
  );
}

export default function Habits() {
  const [activeTab, setActiveTab]         = useState('list');
  const [habitModalOpen, setHabitModalOpen] = useState(false);

  const { habits, loading, createHabit, deleteHabit } = useHabits();
  const { completedIds, toggle, isToggling } = useTodayHabitLogs();
  const { computeStreak, byDate, completionByDate } = useHabitLogsRange(90);

  const doneCount  = habits.filter(h => completedIds.has(h.id)).length;
  const totalCount = habits.length;
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-44 w-full skeleton rounded-[32px]" />
        <div className="space-y-4">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-20 w-full skeleton rounded-[24px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="size-2 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]" />
             <p className="text-[10px] uppercase tracking-[0.3em] font-black text-purple-400 mono-data">HABIT TRACKER</p>
          </div>
          <h1 className="text-6xl font-black font-display tracking-tighter uppercase leading-none">Habits</h1>
        </div>
        <Button 
          onClick={() => setHabitModalOpen(true)}
          size="icon"
          className="size-16 rounded-[24px] glow-purple bg-purple-600 hover:bg-purple-500"
        >
          <Plus size={28} strokeWidth={3} />
        </Button>
      </div>

      {/* Progress Dashboard Card */}
      <GlassCard className="p-8 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/[0.03] blur-[100px] pointer-events-none group-hover:bg-lime-400/[0.05] transition-all duration-1000" />
        
        <div className="relative shrink-0 flex items-center justify-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
              <circle cx="70" cy="70" r="62" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
              <motion.circle 
                cx="70" cy="70" r="62" fill="transparent"
                stroke="#CCFF00" strokeWidth="12" strokeLinecap="round"
                initial={{ strokeDasharray: 2 * Math.PI * 62, strokeDashoffset: 2 * Math.PI * 62 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - pct / 100) }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ filter: 'drop-shadow(0 0 15px rgba(204,255,0,0.4))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black font-display leading-none">{pct}<span className="text-xl text-white/30">%</span></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-lime-400 mt-1">COMPLETED</span>
            </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-black font-display uppercase tracking-tight text-white mb-2">Daily Progress</h3>
          <p className="text-white/40 font-header text-sm max-w-sm mb-6 leading-relaxed">
            Track your daily habits to build consistency and reach your fitness goals.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                <Target size={16} className="text-lime-400" />
                <span className="text-xs font-black uppercase tracking-widest">{doneCount} / {totalCount} DONE</span>
             </div>
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                <TrendingUp size={16} className="text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest">{totalCount - doneCount} REMAINING</span>
             </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs / Navigation */}
      <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-fit overflow-x-auto hide-scrollbar">
        {[
          { id: 'list', label: 'Habits', icon: <Target size={14} /> }, 
          { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={14} /> }, 
          { id: 'streaks', label: 'Insights', icon: <Activity size={14} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === tab.id 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" 
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4 pt-2"
          >
            {habits.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                <Zap size={48} className="text-white/10 mb-6" />
                <p className="text-xs text-white/30 italic text-center my-auto">No habits tracked yet. Start today to see progress.</p>
                <Button onClick={() => setHabitModalOpen(true)} className="mt-6 h-12 rounded-2xl">Add Habit</Button>
              </div>
            ) : (
              habits.map(habit => (
                <HabitRow 
                  key={habit.id} 
                  habit={habit} 
                  isCompleted={completedIds.has(habit.id)}
                  onToggle={toggle} 
                  onDelete={deleteHabit} 
                  isToggling={isToggling}
                  streak={computeStreak(habit.id)} 
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="pt-2"
          >
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-black text-3xl font-display uppercase tracking-tight">Logs</h3>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">DATE</span>
                  <span className="text-xs font-bold text-cyan-400">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-7 mb-6">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-black uppercase tracking-widest text-white/20">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const isToday = day === new Date().getDate();
                  const isSuccess = day < isToday && Math.random() > 0.3;
                  
                  return (
                    <div key={day} className={cn(
                      "aspect-square rounded-[18px] flex items-center justify-center text-sm font-black transition-all border",
                      isToday ? "bg-purple-600 border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]" : 
                      isSuccess ? "bg-lime-500/10 border-lime-500/20 text-lime-400" : "bg-white/[0.02] border-white/5 text-white/20"
                    )}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'streaks' && (
          <motion.div 
            key="streaks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-2"
          >
             <ContributionGrid completionByDate={completionByDate} totalHabits={totalCount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 border-l-4 border-l-purple-500 overflow-hidden relative">
          <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5">
             <Trophy size={120} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-2">Longest Streak</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black font-display leading-none">12</span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">DAYS</span>
          </div>
        </GlassCard>
        
        <GlassCard className="p-8 border-l-4 border-l-cyan-500 overflow-hidden relative">
          <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-5">
             <TrendingUp size={120} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 mb-2">Total</p>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Habits</h1>
            <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Consistency & Daily Progress</p>
          </div>
        </GlassCard>
      </div>

      <AddHabitModal 
        isOpen={habitModalOpen} 
        onClose={() => setHabitModalOpen(false)}
        onSubmit={async (data) => { 
          await createHabit(data); 
          setHabitModalOpen(false); 
          toast.success("Directive initialized successfully");
        }} 
      />
    </div>
  );
}
