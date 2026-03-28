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
    { key: 'protein', label: 'Protein', color: '#42e355', value: Math.round(nutrition.protein || 0), max: proteinTarget },
    { key: 'carbs',   label: 'Carbs',   color: '#adc6ff', value: Math.round(nutrition.carbs || 0),   max: carbsTarget },
    { key: 'fats',    label: 'Fats',    color: '#ffb595', value: Math.round(nutrition.fats || 0),    max: fatsTarget },
  ];

  const prevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay = () => { if (!isToday) setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; }); };

  return (
    <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.primaryC }}>DAILY VITALS</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: "'Manrope', system-ui" }}>Nutrition Hub</h1>
        </div>
        <button onClick={() => setMealOpen(true)}
          className="size-12 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'linear-gradient(135deg, #4b8eff, #42e355)', boxShadow: '0 8px 24px rgba(75,142,255,0.35)' }}>
          <Plus size={22} color="#0e0e0e" strokeWidth={3} />
        </button>
      </div>

      {/* ── Date Navigation (#15) ── */}
      <div className="flex items-center justify-between">
        <button onClick={prevDay} className="p-2 rounded-xl transition-all" style={{ color: C.outline, background: 'rgba(42,42,42,0.4)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
            {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[10px]" style={{ color: C.outline }}>{dateStr}</p>
        </div>
        <button onClick={nextDay} disabled={isToday}
          className="p-2 rounded-xl transition-all disabled:opacity-30"
          style={{ color: C.outline, background: 'rgba(42,42,42,0.4)' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Energy Ring + Macros with targets (#4/#23 fix + #41) ── */}
      <GlassPanel className="p-8 flex flex-col items-center">
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="transparent" stroke="rgba(53,53,52,1)" strokeWidth="10" />
            <circle cx="100" cy="100" r={R} fill="transparent"
              stroke={totalCals === 0 ? 'rgba(66,227,85,0.15)' : C.secondary}
              strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={ringOffset}
              className="progress-ring-circle"
              style={{ filter: totalCals > 0 ? 'drop-shadow(0 0 14px rgba(66,227,85,0.5))' : 'none' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-black text-4xl tracking-tighter" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
              {remaining.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: C.outline }}>KCAL LEFT</span>
          </div>
        </div>

        {/* Macro badges with progress bars (#41) */}
        <div className="grid grid-cols-3 gap-6 mt-8 w-full">
          {MACROS.map(m => {
            const pct = Math.min(m.value / m.max, 1);
            return (
              <div key={m.key} className="text-center">
                <p className="text-xl font-black" style={{ fontFamily: "'Manrope', system-ui", color: m.color }}>
                  {m.value}g
                </p>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: C.outline }}>{m.label}</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(53,53,52,0.8)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, background: m.color }} />
                </div>
                <p className="text-[9px] mt-1 font-medium" style={{ color: C.outline }}>{m.value}/{m.max}g</p>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* ── Tabs ── */}
      <div className="flex" style={{ borderBottom: `1px solid ${C.outlineV}` }}>
        {['diary', 'plans'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm font-semibold capitalize transition-colors"
            style={{
              borderBottom: activeTab === tab ? `2px solid ${C.primaryC}` : '2px solid transparent',
              color: activeTab === tab ? C.primary : C.outline,
              fontFamily: "'Manrope', system-ui", marginBottom: -1,
            }}>
            {tab === 'diary' ? 'Meal Journal' : 'Past Days'}
          </button>
        ))}
      </div>

      {/* ── Meal Journal ── */}
      {activeTab === 'diary' && (
        <div className="space-y-3 stagger-children">
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
                  className="flex items-center justify-between p-4 rounded-2xl group transition-all"
                  style={{ background: 'rgba(32,31,31,0.7)', border: '1px solid rgba(65,71,85,0.2)' }}>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(42,42,42,0.8)' }}>
                      <Icon size={22} color={C.outline} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: C.onSurface }}>{meal.name}</p>
                      <p className="text-xs" style={{ color: C.outline }}>{meal.mealType}{time ? ` · ${time}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{meal.calories}</p>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: C.secondary, fontWeight: 700 }}>{meal.protein}g Pro</p>
                    </div>
                    {/* #28 — always visible on mobile */}
                    <button onClick={() => deleteMeal(meal.id)}
                      className="p-1.5 rounded-lg transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                      style={{ color: '#ffb4ab' }}>
                      <Trash2 size={16} />
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
        <div className="space-y-3">
          {plans.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No Past Meal Days"
              subtitle="Log meals for at least 2 entries on a day to see it here." />
          ) : (
            plans.map(plan => (
              <GlassPanel key={plan.date} className="p-5" style={{ borderRadius: '1rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: "'Manrope', system-ui" }}>{plan.date}</p>
                    <p className="text-xs" style={{ color: C.outline }}>{plan.meals.length} meals · {plan.totals.calories} kcal</p>
                  </div>
                  <button onClick={() => {
                    // Copy all meals to today
                    plan.meals.forEach(m => logMeal({
                      name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fats: m.fats,
                      mealType: m.meal_type,
                    }));
                  }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: 'rgba(75,142,255,0.15)', color: C.primary }}>
                    <Copy size={12} /> Repeat
                  </button>
                </div>
                <div className="flex gap-4">
                  {[
                    { label: 'P', val: plan.totals.protein, color: '#42e355' },
                    { label: 'C', val: plan.totals.carbs, color: '#adc6ff' },
                    { label: 'F', val: plan.totals.fats, color: '#ffb595' },
                  ].map(m => (
                    <span key={m.label} className="text-xs font-bold" style={{ color: m.color }}>{m.label}: {m.val}g</span>
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
