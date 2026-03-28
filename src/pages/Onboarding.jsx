import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  User, Ruler, Scale, Target, Zap, Flame,
  ChevronRight, ChevronLeft, Check, Loader2
} from 'lucide-react';

import { C } from '../lib/theme';
import { calculateTDEE, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';


// ─── Reusable input ────────────────────────────────────────────────────────────
function Input({ label, name, type = 'text', value, onChange, placeholder, unit, min, max }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} min={min} max={max}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'rgba(14,14,14,0.8)',
            border: `1px solid ${focused ? C.primaryC : C.outlineV}`,
            color: C.onSurface,
            boxShadow: focused ? '0 0 0 3px rgba(75,142,255,0.1)' : 'none',
          }}
        />
        {unit && (
          <span className="absolute right-4 text-xs font-bold pointer-events-none" style={{ color: C.outline }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? C.primaryC : i < current ? C.secondary : C.outlineV,
          }}
        />
      ))}
    </div>
  );
}

// ─── STEPS ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'basics',
    title: "Let's get to know you",
    subtitle: 'Basic information to personalise your experience.',
    icon: User,
  },
  {
    id: 'body',
    title: 'Your body metrics',
    subtitle: 'Used to calculate your calorie needs accurately.',
    icon: Scale,
  },
  {
    id: 'activity',
    title: 'How active are you?',
    subtitle: 'Be honest — this shapes your daily calorie target.',
    icon: Zap,
  },
  {
    id: 'goal',
    title: "What's your goal?",
    subtitle: "We'll set your targets accordingly.",
    icon: Target,
  },
  {
    id: 'summary',
    title: 'You\'re all set!',
    subtitle: 'Here\'s your personalised calorie & water plan.',
    icon: Flame,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();
  const { updateProfile } = useProfile();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    goalWeight: '',
    activityLevel: 1.55,
    fitnessGoal: 'maintain',
    waterIntakeGoal: 8,
    dailyCalorieGoal: 2200,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const onChange = e => set(e.target.name, e.target.value);

  // Auto-calculate TDEE on step 4 (summary)
  const tdee = (form.age && form.height && form.weight)
    ? calculateTDEE({
        age: Number(form.age),
        gender: form.gender,
        height: Number(form.height),
        weight: Number(form.weight),
        activityLevel: Number(form.activityLevel),
      })
    : null;

  const goalModifier = GOALS.find(g => g.value === form.fitnessGoal)?.modifier || 0;
  const finalCalories = tdee ? tdee + goalModifier : 2200;

  useEffect(() => {
    if (step === 4 && tdee) {
      setForm(f => ({ ...f, dailyCalorieGoal: finalCalories }));
    }
  }, [step, tdee]);

  const canProceed = () => {
    if (step === 0) return form.age && form.gender;
    if (step === 1) return form.height && form.weight;
    return true;
  };

  const next = () => {
    setError('');
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };
  const back = () => { setError(''); setStep(s => s - 1); };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        age:              Number(form.age),
        gender:           form.gender,
        height:           Number(form.height),
        weight:           Number(form.weight),
        goalWeight:       Number(form.goalWeight) || undefined,
        activityLevel:    Number(form.activityLevel),
        fitnessGoal:      form.fitnessGoal,
        dailyCalorieGoal: finalCalories,
        waterIntakeGoal:  Number(form.waterIntakeGoal),
        onboardingDone:   true,
      });
      // Push the flag into AuthContext immediately so the guard flips without a re-fetch
      setProfile({ onboarding_done: true });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12"
      style={{ background: C.bg, color: C.onSurface, fontFamily: "'Inter', system-ui" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(circle at 25% 35%, rgba(0,122,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 65%, rgba(66,227,85,0.05) 0%, transparent 50%)
        `
      }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <span
            className="text-2xl font-extrabold tracking-tighter"
            style={{
              fontFamily: "'Manrope', system-ui",
              background: 'linear-gradient(135deg, #adc6ff 0%, #4b8eff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LockIn
          </span>
        </div>

        {/* Step dots */}
        <StepDots current={step} total={STEPS.length} />

        {/* Card */}
        <div
          className="mt-6 rounded-3xl overflow-hidden"
          style={{
            background: C.glass,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(65,71,85,0.2)',
          }}
        >
          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(65,71,85,0.2)' }}>
            <div className="flex items-center gap-4">
              <div
                className="size-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(75,142,255,0.12)' }}
              >
                <StepIcon size={22} color={C.primaryC} />
              </div>
              <div>
                <h2
                  className="font-bold text-xl"
                  style={{ fontFamily: "'Manrope', system-ui" }}
                >
                  {STEPS[step].title}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: C.outline }}>
                  {STEPS[step].subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Step content */}
          <div className="px-8 py-6 space-y-5">

            {/* ── Step 0: Basics ── */}
            {step === 0 && (
              <>
                <Input label="Age" name="age" type="number" min="10" max="100"
                  value={form.age} onChange={onChange} placeholder="25" unit="yrs" />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className="py-3.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          border: `1px solid ${form.gender === g ? C.primaryC : C.outlineV}`,
                          background: form.gender === g ? 'rgba(75,142,255,0.12)' : 'rgba(14,14,14,0.6)',
                          color: form.gender === g ? C.primary : C.outline,
                          fontFamily: "'Manrope', system-ui",
                        }}
                      >
                        {g === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Body metrics ── */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Height" name="height" type="number" min="100" max="250"
                    value={form.height} onChange={onChange} placeholder="175" unit="cm" />
                  <Input label="Weight" name="weight" type="number" min="30" max="300"
                    value={form.weight} onChange={onChange} placeholder="75" unit="kg" />
                </div>
                <Input label="Goal Weight (optional)" name="goalWeight" type="number" min="30" max="300"
                  value={form.goalWeight} onChange={onChange} placeholder="68" unit="kg" />
              </>
            )}

            {/* ── Step 2: Activity level ── */}
            {step === 2 && (
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => set('activityLevel', level.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                    style={{
                      border: `1px solid ${Number(form.activityLevel) === level.value ? C.primaryC : C.outlineV}`,
                      background: Number(form.activityLevel) === level.value
                        ? 'rgba(75,142,255,0.1)'
                        : 'rgba(14,14,14,0.5)',
                    }}
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: C.onSurface, fontFamily: "'Manrope', system-ui" }}>
                        {level.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.outline }}>{level.desc}</p>
                    </div>
                    {Number(form.activityLevel) === level.value && (
                      <div className="size-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: C.primaryC }}>
                        <Check size={12} color="#001a41" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 3: Goal ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => set('fitnessGoal', goal.value)}
                      className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
                      style={{
                        border: `1px solid ${form.fitnessGoal === goal.value ? goal.color : C.outlineV}`,
                        background: form.fitnessGoal === goal.value
                          ? `${goal.color}12`
                          : 'rgba(14,14,14,0.5)',
                      }}
                    >
                      <span className="text-3xl">{goal.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold" style={{ color: C.onSurface, fontFamily: "'Manrope', system-ui" }}>
                          {goal.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: C.outline }}>
                          {goal.modifier > 0 ? `+${goal.modifier}` : goal.modifier} kcal from TDEE
                        </p>
                      </div>
                      {form.fitnessGoal === goal.value && (
                        <div className="size-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: goal.color }}>
                          <Check size={12} color="#0e0e0e" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>
                    Daily Water Goal
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[6, 8, 10, 12].map(cups => (
                      <button
                        key={cups}
                        type="button"
                        onClick={() => set('waterIntakeGoal', cups)}
                        className="flex-1 min-w-[60px] py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          border: `1px solid ${form.waterIntakeGoal === cups ? C.primaryC : C.outlineV}`,
                          background: form.waterIntakeGoal === cups ? 'rgba(75,142,255,0.12)' : 'rgba(14,14,14,0.6)',
                          color: form.waterIntakeGoal === cups ? C.primary : C.outline,
                          fontFamily: "'Manrope', system-ui",
                        }}
                      >
                        {cups} cups
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Summary ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Daily Calories', value: finalCalories, unit: 'kcal', color: C.primaryC },
                    { label: 'Water Goal',     value: `${form.waterIntakeGoal} cups`, unit: `${form.waterIntakeGoal * 250}ml`, color: C.primary },
                    { label: 'Your TDEE',      value: tdee || '—', unit: 'kcal/day', color: C.secondary },
                    { label: 'Fitness Goal',   value: GOALS.find(g => g.value === form.fitnessGoal)?.label, unit: '', color: '#ffb595' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-2xl"
                      style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(65,71,85,0.2)' }}
                    >
                      <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: C.outline }}>
                        {stat.label}
                      </p>
                      <p className="font-black text-2xl" style={{ fontFamily: "'Manrope', system-ui", color: stat.color }}>
                        {stat.value}
                      </p>
                      {stat.unit && (
                        <p className="text-xs font-medium mt-0.5" style={{ color: C.outline }}>{stat.unit}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Body stats row */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-around"
                  style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(65,71,85,0.2)' }}
                >
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold" style={{ color: C.outline }}>Age</p>
                    <p className="font-black text-xl" style={{ fontFamily: "'Manrope', system-ui" }}>{form.age}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold" style={{ color: C.outline }}>Height</p>
                    <p className="font-black text-xl" style={{ fontFamily: "'Manrope', system-ui" }}>{form.height} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold" style={{ color: C.outline }}>Weight</p>
                    <p className="font-black text-xl" style={{ fontFamily: "'Manrope', system-ui" }}>{form.weight} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest font-bold" style={{ color: C.outline }}>Gender</p>
                    <p className="font-black text-xl capitalize" style={{ fontFamily: "'Manrope', system-ui" }}>{form.gender === 'male' ? '♂' : '♀'}</p>
                  </div>
                </div>

                <p className="text-xs text-center" style={{ color: C.outline }}>
                  Based on the <strong style={{ color: C.onSurfaceV }}>Mifflin-St Jeor</strong> equation. You can always update this in Settings.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(147,0,10,0.2)', color: C.error, border: '1px solid rgba(147,0,10,0.4)' }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="px-8 pb-8 flex gap-3">
            {step > 0 && (
              <button
                onClick={back}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all"
                style={{
                  background: 'rgba(42,42,42,0.6)',
                  border: `1px solid ${C.outlineV}`,
                  color: C.outline,
                  fontFamily: "'Manrope', system-ui",
                }}
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}

            <button
              onClick={step === STEPS.length - 1 ? finish : next}
              disabled={!canProceed() || saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: step === STEPS.length - 1
                  ? 'linear-gradient(135deg, #04c339, #42e355)'
                  : 'linear-gradient(135deg, #4b8eff, #adc6ff)',
                color: step === STEPS.length - 1 ? '#002204' : '#001a41',
                fontFamily: "'Manrope', system-ui",
                boxShadow: step === STEPS.length - 1
                  ? '0 4px 20px rgba(4,195,57,0.3)'
                  : '0 4px 20px rgba(75,142,255,0.3)',
              }}
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving…</>
              ) : step === STEPS.length - 1 ? (
                <><Check size={18} strokeWidth={3} /> Let's Go!</>
              ) : (
                <>Continue <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {step < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setStep(STEPS.length - 1)}
              className="text-xs transition-colors"
              style={{ color: C.outline }}
            >
              Skip setup — I'll configure later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
