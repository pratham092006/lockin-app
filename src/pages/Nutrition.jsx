import React, { useState } from 'react';
import { Plus, Coffee, UtensilsCrossed, Apple, Trash2, ChevronRight, ChevronLeft, CalendarDays, Copy } from 'lucide-react';
import { useMeals, useMealPlans, useDailyNutrition } from '../hooks/useNutrition';
import { useProfile } from '../hooks/useProfile';
import AddMealModal from '../components/AddMealModal';
import GlassPanel, { EmptyState } from '../components/GlassPanel';
import { C } from '../lib/theme';

const MEAL_ICONS = { Breakfast: Coffee, Lunch: UtensilsCrossed, Dinner: UtensilsCrossed, Snack: Apple, Other: Apple };

export default function Nutrition() {
  const [activeTab, setActiveTab]     = useState('diary');
  const [mealModalOpen, setMealOpen]  = useState(false);
  // #15 — date navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = selectedDate.toISOString().split('T')[0];
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  const { meals, logMeal, deleteMeal } = useMeals(selectedDate);
  const { nutrition }                  = useDailyNutrition(selectedDate);
  const { profile }                    = useProfile();
  const { plans }                      = useMealPlans();

  const totalCals   = Math.round(nutrition.calories || 0);
  const goalCals    = profile?.dailyCalorieGoal || 2200;
  const remaining   = Math.max(goalCals - totalCals, 0);
  const ringPct     = Math.min(totalCals / goalCals, 1);
  const R           = 80;
  const circ        = 2 * Math.PI * R;
  const ringOffset  = circ - ringPct * circ;

  // #41 — macro targets
  const proteinTarget = profile?.proteinTarget || 150;
  const carbsTarget   = profile?.carbsTarget || 250;
  const fatsTarget    = profile?.fatsTarget || 70;

  const MACROS = [
    { key: 'protein', label: 'Protein', color: C.secondaryC, value: Math.round(nutrition.protein || 0), max: proteinTarget },
    { key: 'carbs',   label: 'Carbs',   color: '#0ea5e9',    value: Math.round(nutrition.carbs || 0),   max: carbsTarget },
    { key: 'fats',    label: 'Fats',    color: C.coralC,     value: Math.round(nutrition.fats || 0),    max: fatsTarget },
  ];

  const prevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => { if (!isToday) setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }); };

  return (
    <div className="space-y-6 animate-fade-in pb-12" style={{ fontFamily: "'Inter', system-ui" }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold mb-1" style={{ color: C.primaryC }}>DAILY VITALS</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>Nutrition Hub</h1>
        </div>
        <button onClick={() => setMealOpen(true)}
           className="size-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_12px_rgba(0,255,255,0.15)] active:scale-95"
           style={{ background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)' }}>
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Date Navigation (#15) ── */}
      <div className="flex items-center justify-between">
        <button onClick={prevDay} className="p-2 rounded-xl transition-all hover:bg-black/5" style={{ color: C.onSurface, background: 'rgba(0,0,0,0.04)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
            {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.outline }}>{dateStr}</p>
        </div>
        <button onClick={nextDay} disabled={isToday}
          className="p-2 rounded-xl transition-all hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-black/5"
          style={{ color: C.onSurface, background: 'rgba(0,0,0,0.04)' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Energy Ring + Macros with targets (#4/#23 fix + #41) ── */}
      <GlassPanel className="p-8 flex flex-col items-center">
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="transparent" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
            <circle cx="100" cy="100" r={R} fill="transparent"
              stroke={totalCals === 0 ? 'rgba(0,0,0,0.06)' : C.tertiaryC}
              strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={ringOffset}
              className="progress-ring-circle"
              style={{ filter: totalCals > 0 ? 'drop-shadow(0 0 14px rgba(234, 179, 8, 0.45))' : 'none' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-black text-4xl tracking-tighter" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
              {remaining.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold mt-1" style={{ color: C.outline }}>KCAL LEFT</span>
          </div>
        </div>

        {/* Macro badges with progress bars (#41) */}
        <div className="grid grid-cols-3 gap-6 mt-8 w-full border-t pt-6" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          {MACROS.map(m => {
            const pct = Math.min(m.value / m.max, 1);
            return (
              <div key={m.key} className="text-center">
                <p className="text-xl font-black" style={{ fontFamily: "'Manrope', system-ui", color: m.color }}>
                  {m.value}g
                </p>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: C.outline }}>{m.label}</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, background: m.color }} />
                </div>
                <p className="text-[9px] mt-1.5 font-bold" style={{ color: C.outline }}>{m.value}/{m.max}g</p>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* ── Tabs ── */}
      <div className="flex" style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
        {['diary', 'plans'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm font-bold capitalize transition-colors"
            style={{
              borderBottom: activeTab === tab ? `2px solid ${C.primaryC}` : '2px solid transparent',
              color: activeTab === tab ? C.primaryC : C.outline,
              fontFamily: "'Manrope', system-ui", marginBottom: -1,
            }}>
            {tab === 'diary' ? 'Meal Journal' : 'Past Days'}
          </button>
        ))}
      </div>

      {/* ── Meal Journal ── */}
      {activeTab === 'diary' && (
        <div className="space-y-4 pt-2 stagger-children">
          {meals.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="No meals logged"
              subtitle={isToday ? 'Tap the + button to log your first meal.' : 'No meals were logged on this day.'}
              action={isToday ? '+ Log Meal' : undefined}
              onAction={isToday ? () => setMealOpen(true) : undefined} />
          ) : (
            meals.map(meal => {
              const Icon = MEAL_ICONS[meal.mealType] || Apple;
              // #5 fix — use ISO string directly, not .toDate()
              const time = meal.created_at
                ? new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              return (
                <div key={meal.id}
                  className="flex items-center justify-between p-4 rounded-3xl group transition-all glass-panel hover:-translate-y-0.5 cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl flex items-center justify-center bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 shadow-[0_0_12px_rgba(204,255,0,0.1)]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-base text-white tracking-wide">{meal.name}</p>
                      <p className="text-[10px] mt-1 text-white/40 mono-data uppercase tracking-wider">{meal.mealType}{time ? ` • ${time}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-3">
                      <p className="font-black text-2xl leading-none font-display text-white">{meal.calories}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#CCFF00] mt-1.5">{meal.protein}G PRO</p>
                    </div>
                    <button onClick={() => deleteMeal(meal.id)}
                      className="p-3 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 active:scale-95">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Past Days / Meal Plans (#10) ── */}
      {activeTab === 'plans' && (
        <div className="space-y-4 pt-2">
          {plans.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No Past Meal Days"
              subtitle="Log meals for at least 2 entries on a day to see it here." />
          ) : (
            plans.map(plan => (
              <GlassPanel key={plan.date} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{plan.date}</p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: C.outline }}>{plan.meals.length} meals • {plan.totals.calories} kcal</p>
                  </div>
                  <button onClick={() => {
                    // Copy all meals to today
                    plan.meals.forEach(m => logMeal({
                      name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fats: m.fats,
                      mealType: m.meal_type,
                    }));
                  }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border hover:bg-black/5"
                    style={{ background: 'rgba(139,92,246,0.1)', color: C.primaryC, borderColor: 'rgba(139,92,246,0.15)' }}>
                    <Copy size={14} /> Repeat Day
                  </button>
                </div>
                <div className="flex gap-4">
                  {[
                    { label: 'Pro', val: plan.totals.protein, color: C.secondaryC },
                    { label: 'Carbs', val: plan.totals.carbs, color: '#0ea5e9' },
                    { label: 'Fats', val: plan.totals.fats, color: C.coralC },
                  ].map(m => (
                    <div key={m.label} className="flex flex-col items-center px-3 py-2 rounded-xl flex-1 border font-bold" style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.04)', color: m.color }}>
                       <span className="text-[10px] uppercase tracking-wider mb-0.5">{m.label}</span>
                       <span className="text-sm">{m.val}g</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}

      <AddMealModal isOpen={mealModalOpen} onClose={() => setMealOpen(false)} onSubmit={logMeal} />
    </div>
  );
}
