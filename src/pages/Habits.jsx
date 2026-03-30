import React, { useState } from 'react';
import { Plus, Check, Flame, Trash2, CalendarDays } from 'lucide-react';
import { useHabits, useTodayHabitLogs, useHabitLogsRange } from '../hooks/useHabits';
import AddHabitModal from '../components/AddHabitModal';
import GlassPanel, { EmptyState } from '../components/GlassPanel';
import { C } from '../lib/theme';

function HabitRow({ habit, isCompleted, onToggle, onDelete, isToggling, streak }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl group transition-all glass-panel"
      style={{
        background: isCompleted ? 'rgba(204,255,0,0.05)' : 'rgba(255,255,255,0.02)',
        border: isCompleted ? '1px solid rgba(204,255,0,0.2)' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isCompleted ? '0 0 16px rgba(204,255,0,0.1)' : 'none'
      }}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="size-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `${habit.color}18`, borderColor: `${habit.color}40` }}>
          <div className="size-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: habit.color, color: habit.color }} />
        </div>
        <div className="min-w-0">
          <p className={`font-bold text-base truncate transition-all ${isCompleted ? 'text-white/60 line-through' : 'text-white'}`} style={{ fontFamily: 'var(--font-header)' }}>{habit.name}</p>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <Flame size={12} className="text-[#FF3366] drop-shadow-[0_0_8px_rgba(255,51,102,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF3366] mono-data">{streak} day streak</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* always visible on mobile */}
        <button onClick={() => onDelete(habit.id)}
          className="p-2.5 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-transparent hover:border-red-500/30">
          <Trash2 size={16} />
        </button>
        <button onClick={() => onToggle({ habitId: habit.id, isCompleted })} disabled={isToggling}
          className="size-8 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90"
          style={{ borderColor: isCompleted ? '#CCFF00' : 'rgba(255,255,255,0.15)', background: isCompleted ? '#CCFF00' : 'transparent', boxShadow: isCompleted ? '0 0 12px rgba(204,255,0,0.5)' : 'none' }}>
          {isCompleted && <Check size={16} color="#121212" strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}

// ── GitHub-style contribution grid (#43) ─────────────────────────────────────
function ContributionGrid({ completionByDate, totalHabits }) {
  const grid = completionByDate(totalHabits);
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  // Group into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>Streak Map</h3>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.outline }}>Last 90 days</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map(dateStr => {
              const pct = grid[dateStr] || 0;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return (
                <div key={dateStr} className="size-3.5 rounded-[3px] transition-colors" title={`${dateStr}: ${Math.round(pct * 100)}%`}
                  style={{
                    background: isToday && pct === 0
                      ? 'rgba(0,0,0,0.08)'
                      : pct >= 1 ? C.secondaryC
                      : pct >= 0.5 ? 'rgba(132,204,22,0.6)'
                      : pct > 0 ? 'rgba(132,204,22,0.2)'
                      : 'rgba(0,0,0,0.03)',
                  }} />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: C.outline }}>Less</span>
        {[0, 0.15, 0.4, 1].map((v, i) => (
          <div key={i} className="size-3.5 rounded-[3px]" style={{
            background: v >= 1 ? C.secondaryC : v >= 0.5 ? 'rgba(132,204,22,0.6)' : v > 0 ? 'rgba(132,204,22,0.2)' : 'rgba(0,0,0,0.03)' }} />
        ))}
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: C.outline }}>More</span>
      </div>
    </GlassPanel>
  );
}

export default function Habits() {
  const [activeTab, setActiveTab]         = useState('list');
  const [habitModalOpen, setHabitModalOpen] = useState(false);

  const { habits, loading, createHabit, deleteHabit } = useHabits();
  const { completedIds, toggle, isToggling } = useTodayHabitLogs();
  // #12/#35 — single batch query for all habit logs
  const { computeStreak, byDate, completionByDate } = useHabitLogsRange(90);

  const doneCount  = habits.filter(h => completedIds.has(h.id)).length;
  const totalCount = habits.length;
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Calendar (#29 — real data)
  const now            = new Date();
  const daysInMonth    = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const offset         = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const todayDate      = now.getDate();
  const monthName      = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12" style={{ fontFamily: "'Inter', system-ui" }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.primaryC }}>DAILY RITUALS</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5"
            style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>Habit Tracker</h1>
        </div>
        <button onClick={() => setHabitModalOpen(true)}
          className="size-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)] active:scale-95"
          style={{ background: 'rgba(204,255,0,0.1)', color: '#CCFF00', border: '1px solid rgba(204,255,0,0.3)' }}>
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress */}
      <GlassPanel className="p-6 flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="transparent" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
            <circle cx="36" cy="36" r="28" fill="transparent"
              stroke={C.secondaryC} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
              className="progress-ring-circle" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{pct}%</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{doneCount} / {totalCount} done</p>
          <p className="text-sm mt-0.5" style={{ color: C.outline }}>
            {doneCount === totalCount && totalCount > 0 ? '🎉 All habits complete!' : `${totalCount - doneCount} remaining today`}
          </p>
        </div>
      </GlassPanel>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
        {[{ id: 'list', label: 'Daily List' }, { id: 'calendar', label: 'Calendar' }, { id: 'streaks', label: 'Streak Map' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-bold transition-colors"
            style={{
              borderBottom: activeTab === tab.id ? `2px solid ${C.primaryC}` : '2px solid transparent',
              color: activeTab === tab.id ? C.primaryC : C.outline, fontFamily: "'Manrope', system-ui", marginBottom: -1,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daily list */}
      {activeTab === 'list' && (
        <div className="space-y-3 stagger-children pt-2">
          {habits.length === 0 ? (
            <EmptyState icon={Check} title="No habits yet"
              subtitle="Create your first habit to start tracking." 
              action="+ Create Habit" onAction={() => setHabitModalOpen(true)} />
          ) : (
            habits.map(habit => (
              <HabitRow key={habit.id} habit={habit} isCompleted={completedIds.has(habit.id)}
                onToggle={toggle} onDelete={deleteHabit} isToggling={isToggling}
                streak={computeStreak(habit.id)} />
            ))
          )}
        </div>
      )}

      {/* Calendar View (#29 — real data) */}
      {activeTab === 'calendar' && (
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{monthName}</h3>
            <CalendarDays size={20} style={{ color: C.outline }} />
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase tracking-widest pb-2" style={{ color: C.outline }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(offset).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const completedCount = byDate[dateKey]?.size || 0;
              const allDone = completedCount >= totalCount && totalCount > 0;
              const someDone = completedCount > 0;
              const isFuture = day > todayDate;

              return (
                <div key={day}
                  className="aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all shadow-sm"
                  style={{
                    background: day === todayDate ? 'rgba(139,92,246,0.1)'
                      : allDone ? 'rgba(132,204,22,0.15)'
                      : someDone ? 'rgba(132,204,22,0.06)'
                      : isFuture ? 'transparent'
                      : 'rgba(0,0,0,0.02)',
                    color: day === todayDate ? C.primaryC : allDone ? C.secondaryC : someDone ? C.secondaryC : isFuture ? 'rgba(0,0,0,0.2)' : C.onSurfaceV,
                    fontFamily: "'Manrope', system-ui",
                    border: day === todayDate ? `1px dashed ${C.primaryC}` : allDone ? `1px solid rgba(132,204,22,0.3)` : '1px solid rgba(0,0,0,0.04)',
                  }}>
                  {day}
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}

      {/* GitHub-style Streak Map (#43) */}
      {activeTab === 'streaks' && (
        <div className="pt-2">
           <ContributionGrid completionByDate={completionByDate} totalHabits={totalCount} />
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassPanel className="p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: C.outline }}>Total Habits</p>
          <p className="text-3xl font-black mt-2" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{totalCount}</p>
        </GlassPanel>
        <GlassPanel className="p-6">
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: C.outline }}>Done Today</p>
          <p className="text-3xl font-black mt-2" style={{ fontFamily: "'Manrope', system-ui", color: C.secondaryC }}>{doneCount}</p>
        </GlassPanel>
      </div>

      <AddHabitModal isOpen={habitModalOpen} onClose={() => setHabitModalOpen(false)}
        onSubmit={async (data) => { await createHabit(data); setHabitModalOpen(false); }} />
    </div>
  );
}
