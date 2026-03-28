import React, { useState, useEffect } from 'react';
import { User, Scale, Ruler, Target, Calculator, Save, CheckCircle, LogOut, Moon, Sun, Droplets } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import GlassPanel from '../components/GlassPanel';
import { C } from '../lib/theme';
import { calculateTDEE, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';

const inputStyle = {
  width: '100%', background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(65,71,85,0.4)',
  borderRadius: '0.75rem', padding: '0.65rem 1rem', color: '#e5e2e1',
  fontFamily: "'Inter', system-ui", fontSize: '0.875rem', outline: 'none',
};

export default function Settings() {
  const { user, signOutUser } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    height: '', weight: '', goalWeight: '', dailyCalorieGoal: '',
    waterIntakeGoal: '', age: '', gender: 'male', activityLevel: 1.55,
    fitnessGoal: 'maintain', proteinTarget: '', carbsTarget: '', fatsTarget: '',
    waterUnit: 'ml',
  });

  useEffect(() => {
    if (profile) setForm(prev => ({
      ...prev,
      height: profile.height || '', weight: profile.weight || '',
      goalWeight: profile.goalWeight || '', dailyCalorieGoal: profile.dailyCalorieGoal || 2200,
      waterIntakeGoal: profile.waterIntakeGoal || 8, age: profile.age || '',
      gender: profile.gender || 'male', activityLevel: profile.activityLevel || 1.55,
      fitnessGoal: profile.fitnessGoal || 'maintain',
      proteinTarget: profile.proteinTarget || 150, carbsTarget: profile.carbsTarget || 250,
      fatsTarget: profile.fatsTarget || 70, waterUnit: profile.waterUnit || 'ml',
    }));
  }, [profile]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleTDEECalculation = () => {
    if (!form.age || !form.height || !form.weight) return;
    const tdee = calculateTDEE({ age: Number(form.age), gender: form.gender, height: Number(form.height), weight: Number(form.weight), activityLevel: Number(form.activityLevel) });
    const goalMod = GOALS.find(g => g.value === form.fitnessGoal)?.modifier || 0;
    set('dailyCalorieGoal', tdee + goalMod);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        height: Number(form.height) || 0, weight: Number(form.weight) || 0,
        goalWeight: Number(form.goalWeight) || 0, dailyCalorieGoal: Number(form.dailyCalorieGoal) || 2200,
        waterIntakeGoal: Number(form.waterIntakeGoal) || 8, age: Number(form.age) || 0,
        gender: form.gender, activityLevel: Number(form.activityLevel), fitnessGoal: form.fitnessGoal,
        proteinTarget: Number(form.proteinTarget) || 150, carbsTarget: Number(form.carbsTarget) || 250,
        fatsTarget: Number(form.fatsTarget) || 70, waterUnit: form.waterUnit,
      });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error('Failed to save settings', err); }
  };

  const tdeePreview = (form.age && form.height && form.weight)
    ? calculateTDEE({ age: Number(form.age), gender: form.gender, height: Number(form.height), weight: Number(form.weight), activityLevel: Number(form.activityLevel) })
    : null;

  if (loading) {
    return (<div className="space-y-6 animate-fade-in">
      <div className="skeleton h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="skeleton h-64 rounded-2xl" /><div className="skeleton h-64 rounded-2xl" /></div>
    </div>);
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.primaryC }}>PREFERENCES</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: "'Manrope', system-ui" }}>Settings</h1>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{ background: saved ? 'rgba(66,227,85,0.15)' : 'linear-gradient(135deg, #4b8eff, #adc6ff)',
            color: saved ? C.secondary : '#001a41', boxShadow: saved ? 'none' : '0 4px 16px rgba(75,142,255,0.3)' }}>
          {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Profile Card */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(75,142,255,0.15)', color: C.primary }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>Profile</h2>
              <p className="text-sm" style={{ color: C.outline }}>{user?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ name: 'height', label: 'Height (cm)', icon: Ruler, ph: '175' },
                { name: 'weight', label: 'Weight (kg)', icon: Scale, ph: '87' }].map(f => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: C.outline }}>
                    <f.icon size={12} /> {f.label}
                  </label>
                  <input name={f.name} type="number" min="0" value={form[f.name]} onChange={e => set(f.name, e.target.value)} placeholder={f.ph} style={inputStyle} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: C.outline }}>
                  <Target size={12} /> Goal Weight (kg)
                </label>
                <input name="goalWeight" type="number" min="0" value={form.goalWeight} onChange={e => set('goalWeight', e.target.value)} placeholder="75" style={inputStyle} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>Age</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" style={inputStyle} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>Gender</label>
              <div className="flex gap-2">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => set('gender', g)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: form.gender === g ? 'rgba(75,142,255,0.15)' : 'transparent',
                      border: `1px solid ${form.gender === g ? C.primaryC : C.outlineV}`,
                      color: form.gender === g ? C.primary : C.outline,
                    }}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* TDEE Calculator */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(66,227,85,0.15)', color: C.secondary }}>
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>TDEE Calculator</h2>
              <p className="text-sm" style={{ color: C.outline }}>Auto-calculate calorie target</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>Activity Level</label>
              {ACTIVITY_LEVELS.map(level => (
                <button key={level.value} type="button" onClick={() => set('activityLevel', level.value)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{
                    background: Number(form.activityLevel) === level.value ? 'rgba(75,142,255,0.1)' : 'rgba(14,14,14,0.4)',
                    border: `1px solid ${Number(form.activityLevel) === level.value ? 'rgba(75,142,255,0.3)' : 'rgba(65,71,85,0.2)'}`,
                  }}>
                  <span>{level.icon}</span>
                  <div>
                    <span className="text-sm font-medium" style={{ color: Number(form.activityLevel) === level.value ? C.primary : C.onSurface }}>{level.label}</span>
                    <span className="text-xs ml-2" style={{ color: C.outline }}>{level.desc}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>Goal</label>
              <div className="flex gap-2">
                {GOALS.map(goal => (
                  <button key={goal.value} type="button" onClick={() => set('fitnessGoal', goal.value)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: form.fitnessGoal === goal.value ? `${goal.color}18` : 'transparent',
                      border: `1px solid ${form.fitnessGoal === goal.value ? `${goal.color}55` : C.outlineV}`,
                      color: form.fitnessGoal === goal.value ? goal.color : C.outline,
                    }}>
                    {goal.icon} {goal.label}
                  </button>
                ))}
              </div>
            </div>
            {tdeePreview && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(75,142,255,0.08)', border: '1px solid rgba(75,142,255,0.2)' }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: C.outline }}>Estimated TDEE</p>
                <p className="text-3xl font-extrabold" style={{ color: C.primary, fontFamily: "'Manrope', system-ui" }}>
                  {tdeePreview} <span className="text-sm font-medium">kcal/day</span>
                </p>
                <p className="text-xs mt-1" style={{ color: C.outline }}>
                  With goal: <strong style={{ color: C.onSurface }}>{tdeePreview + (GOALS.find(g => g.value === form.fitnessGoal)?.modifier || 0)} kcal/day</strong>
                </p>
              </div>
            )}
            <button type="button" onClick={handleTDEECalculation} disabled={!form.age || !form.height || !form.weight}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#001a41', boxShadow: '0 4px 16px rgba(75,142,255,0.3)' }}>
              Calculate & Apply
            </button>
          </div>
        </GlassPanel>

        {/* Daily Goals — spans full width */}
        <GlassPanel className="p-6 lg:col-span-2">
          <h2 className="font-bold text-lg mb-6" style={{ fontFamily: "'Manrope', system-ui" }}>Daily Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: C.outline }}>Calorie Target (kcal)</label>
              <input name="dailyCalorieGoal" type="number" min="0" value={form.dailyCalorieGoal} onChange={e => set('dailyCalorieGoal', e.target.value)}
                placeholder="2200" style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Manrope', system-ui" }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: C.outline }}>
                <Droplets size={12} /> Water Goal (cups/day)
              </label>
              <input name="waterIntakeGoal" type="number" min="1" max="20" value={form.waterIntakeGoal} onChange={e => set('waterIntakeGoal', e.target.value)}
                placeholder="8" style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Manrope', system-ui" }} />
            </div>
          </div>
          {/* #41 — Macro targets */}
          <h3 className="font-bold text-sm mt-6 mb-3" style={{ fontFamily: "'Manrope', system-ui", color: C.outline }}>Macro Targets (grams/day)</h3>
          <div className="grid grid-cols-3 gap-3">
            {[{ key: 'proteinTarget', label: 'Protein', color: '#42e355' },
              { key: 'carbsTarget', label: 'Carbs', color: '#adc6ff' },
              { key: 'fatsTarget', label: 'Fats', color: '#ffb595' }].map(m => (
              <div key={m.key} className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: m.color }}>{m.label}</label>
                <input type="number" min="0" value={form[m.key]} onChange={e => set(m.key, e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center' }} />
              </div>
            ))}
          </div>
          {/* #34 — Water unit preference */}
          <h3 className="font-bold text-sm mt-6 mb-3" style={{ fontFamily: "'Manrope', system-ui", color: C.outline }}>Water Unit</h3>
          <div className="flex gap-2">
            {['ml', 'cups'].map(u => (
              <button key={u} type="button" onClick={() => set('waterUnit', u)}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize"
                style={{
                  background: form.waterUnit === u ? 'rgba(56,189,248,0.12)' : 'transparent',
                  border: `1px solid ${form.waterUnit === u ? 'rgba(56,189,248,0.4)' : C.outlineV}`,
                  color: form.waterUnit === u ? '#38bdf8' : C.outline,
                }}>
                {u === 'ml' ? 'Millilitres (ml)' : 'Cups'}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* #14 — Sign Out button */}
      <button onClick={signOutUser}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ background: 'rgba(147,0,10,0.1)', border: '1px solid rgba(255,180,171,0.2)', color: C.error }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}
