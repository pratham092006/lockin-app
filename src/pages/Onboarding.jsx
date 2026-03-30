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
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#00FFFF]">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} min={min} max={max}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.15)] placeholder:text-white/20 font-bold"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${focused ? '#00FFFF' : 'rgba(255,255,255,0.1)'}`,
            color: '#FFFFFF',
          }}
        />
        {unit && (
          <span className="absolute right-4 text-xs font-bold pointer-events-none text-white/40">
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
            background: i === current ? '#00FFFF' : i < current ? '#CCFF00' : 'rgba(255,255,255,0.1)',
            boxShadow: i === current ? '0 0 10px rgba(0,255,255,0.4)' : 'none'
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
  }, [step, tdee, finalCalories]);

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
      style={{ background: '#121212', color: '#FFFFFF', fontFamily: "'Inter', system-ui" }}
    >
      {/* Ambient glow - Dark Theme */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(circle at 25% 35%, rgba(0,255,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 75% 65%, rgba(204,255,0,0.05) 0%, transparent 50%)
        `
      }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <span
            className="text-3xl font-extrabold tracking-tight uppercase font-display"
            style={{ color: '#FFFFFF' }}
          >
            LockIn
          </span>
        </div>

        {/* Step dots */}
        <StepDots current={step} total={STEPS.length} />

        {/* Card */}
        <div className="mt-6 rounded-[2rem] overflow-hidden glass-panel backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
             style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b" style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.2)' }}>
                <StepIcon size={22} className="drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
              </div>
              <div>
                <h2 className="font-bold text-xl font-header text-white">
                  {STEPS[step].title}
                </h2>
                <p className="text-sm mt-0.5 font-medium text-white/50">
                  {STEPS[step].subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Step content */}
          <div className="px-8 py-6 space-y-5">
            {step === 0 && (
              <>
                <Input label="Age" name="age" type="number" min="10" max="100"
                  value={form.age} onChange={onChange} placeholder="25" unit="yrs" />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => set('gender', g)}
                        className="py-3.5 rounded-2xl text-sm font-bold transition-all border shadow-sm font-header tracking-wider uppercase"
                        style={{
                          borderColor: form.gender === g ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                          background: form.gender === g ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                          color: form.gender === g ? '#00FFFF' : 'rgba(255,255,255,0.4)',
                          boxShadow: form.gender === g ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
                        }}
                      >
                        {g === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

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

            {step === 2 && (
              <div className="space-y-3">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => set('activityLevel', level.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all border shadow-sm group hover:bg-white/5"
                    style={{
                      borderColor: Number(form.activityLevel) === level.value ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                      background: Number(form.activityLevel) === level.value ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      boxShadow: Number(form.activityLevel) === level.value ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
                    }}
                  >
                    <span className="text-2xl drop-shadow-md">{level.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm font-header tracking-wider" style={{ color: Number(form.activityLevel) === level.value ? '#00FFFF' : '#FFFFFF' }}>
                        {level.label}
                      </p>
                      <p className="text-xs mt-0.5 text-white/50">{level.desc}</p>
                    </div>
                    {Number(form.activityLevel) === level.value && (
                      <div className="size-5 rounded-full flex items-center justify-center shrink-0 border border-[#00FFFF]"
                        style={{ background: '#00FFFF' }}>
                        <Check size={12} color="#121212" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => set('fitnessGoal', goal.value)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all border shadow-sm group hover:bg-white/5"
                      style={{
                        borderColor: form.fitnessGoal === goal.value ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                        background: form.fitnessGoal === goal.value ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                        boxShadow: form.fitnessGoal === goal.value ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
                      }}
                    >
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm font-header tracking-wider" style={{ color: form.fitnessGoal === goal.value ? '#00FFFF' : '#FFFFFF' }}>
                          {goal.label}
                        </p>
                        <p className="text-xs mt-0.5 flex gap-1 font-medium text-white/50">
                           <span style={{ color: goal.modifier > 0 ? '#FF3366' : goal.modifier < 0 ? '#CCFF00' : 'rgba(255,255,255,0.4)' }}>{goal.modifier > 0 ? `+${goal.modifier}` : goal.modifier} kcal</span> from TDEE
                        </p>
                      </div>
                      {form.fitnessGoal === goal.value && (
                        <div className="size-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: '#00FFFF' }}>
                          <Check size={12} color="#121212" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest block text-[#00FFFF]">
                    Daily Water Goal (Cups)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[6, 8, 10, 12].map(cups => (
                      <button
                        key={cups}
                        type="button"
                        onClick={() => set('waterIntakeGoal', cups)}
                        className="flex-1 min-w-[60px] py-3 rounded-2xl text-sm font-bold transition-all border shadow-sm font-header tracking-wider"
                        style={{
                          borderColor: form.waterIntakeGoal === cups ? '#00FFFF' : 'rgba(255,255,255,0.1)',
                          background: form.waterIntakeGoal === cups ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                          color: form.waterIntakeGoal === cups ? '#00FFFF' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {cups} cups
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Daily Calories', value: finalCalories, unit: 'kcal', color: '#00FFFF' },
                    { label: 'Water Goal',     value: `${form.waterIntakeGoal} cups`, unit: `${form.waterIntakeGoal * 250}ml`, color: '#CCFF00' },
                    { label: 'Your TDEE',      value: tdee || '—', unit: 'kcal/day', color: '#FF3366' },
                    { label: 'Fitness Goal',   value: GOALS.find(g => g.value === form.fitnessGoal)?.label, unit: '', color: '#FFFFFF' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-2xl shadow-sm border glass-panel"
                      style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-white/50">
                        {stat.label}
                      </p>
                      <p className="font-black text-2xl font-display uppercase tracking-tighter" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                      {stat.unit && (
                        <p className="text-[10px] font-bold mt-1 text-white/30 mono-data">{stat.unit}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-4 flex items-center justify-around shadow-sm border glass-panel"
                     style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">Age</p>
                    <p className="font-bold text-lg mt-0.5 font-header text-white">{form.age}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">Height</p>
                    <p className="font-bold text-lg mt-0.5 font-header text-white">{form.height} <span className="text-xs text-white/40">cm</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/50">Weight</p>
                    <p className="font-bold text-lg mt-0.5 font-header text-white">{form.weight} <span className="text-xs text-white/40">kg</span></p>
                  </div>
                </div>

                <p className="text-[10px] text-center max-w-xs mx-auto mt-6 text-white/30 tracking-wide uppercase">
                  Based on the <strong className="text-white/60">Mifflin-St Jeor</strong> equation. You can always update this in Settings.
                </p>
              </div>
            )}

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs font-bold text-[#FF3366] bg-[#FF3366]/10 border border-[#FF3366]/20 shadow-[0_0_12px_rgba(255,51,102,0.1)]"
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
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-bold text-sm transition-all border hover:bg-white/5 font-header tracking-wider uppercase text-white/60 hover:text-white"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}

            <button
              onClick={step === STEPS.length - 1 ? finish : next}
              disabled={!canProceed() || saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50 border shadow-sm font-header"
              style={step === STEPS.length - 1 ? {
                 background: 'rgba(204,255,0,0.1)', borderColor: 'rgba(204,255,0,0.3)', color: '#CCFF00',
                 boxShadow: '0 0 20px rgba(204,255,0,0.2)'
              } : {
                 background: 'rgba(0,255,255,0.1)', borderColor: 'rgba(0,255,255,0.3)', color: '#00FFFF',
                 boxShadow: '0 0 20px rgba(0,255,255,0.2)'
              }}
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving…</>
              ) : step === STEPS.length - 1 ? (
                <><Check size={18} strokeWidth={3} /> Finish Setup</>
              ) : (
                <>Continue <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {step < STEPS.length - 1 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setStep(STEPS.length - 1)}
              className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-white text-white/30"
            >
              Skip setup — I'll configure later
            </button>
          </div>
        )}

        {/* Credit */}
        <div className="mt-8 text-center pb-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">
            Developed by Pratham Pingle
          </p>
        </div>
      </div>
    </div>
  );
}
