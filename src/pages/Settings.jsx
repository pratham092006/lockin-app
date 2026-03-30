import React, { useMemo, useState } from 'react';
import { User, Scale, Ruler, Target, Calculator, Save, CheckCircle, LogOut, Moon, Sun, Droplets } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import GlassPanel from '../components/GlassPanel';
import { calculateTDEE, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '0.65rem 1rem',
  color: '#FFFFFF',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function Settings() {
  const { user, signOutUser } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState({});

  const baseForm = useMemo(() => ({
    height: profile?.height || '',
    weight: profile?.weight || '',
    goalWeight: profile?.goalWeight || '',
    dailyCalorieGoal: profile?.dailyCalorieGoal || 2200,
    waterIntakeGoal: profile?.waterIntakeGoal || 8,
    age: profile?.age || '',
    gender: profile?.gender || 'male',
    activityLevel: profile?.activityLevel || 1.55,
    fitnessGoal: profile?.fitnessGoal || 'maintain',
    proteinTarget: profile?.proteinTarget || 150,
    carbsTarget: profile?.carbsTarget || 250,
    fatsTarget: profile?.fatsTarget || 70,
    waterUnit: profile?.waterUnit || 'ml',
  }), [profile]);

  const form = useMemo(() => ({ ...baseForm, ...draft }), [baseForm, draft]);

  const set = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));

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
      setDraft({});
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error('Failed to save settings', err); }
  };

  const tdeePreview = (form.age && form.height && form.weight)
    ? calculateTDEE({ age: Number(form.age), gender: form.gender, height: Number(form.height), weight: Number(form.weight), activityLevel: Number(form.activityLevel) })
    : null;

  if (loading) {
    return (<div className="space-y-6 animate-fade-in">
      <div className="skeleton h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="skeleton h-64 rounded-[2rem]" /><div className="skeleton h-64 rounded-[2rem]" /></div>
    </div>);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-white/50 mono-data">PREFERENCES</p>
          <h1 className="text-4xl font-black font-display tracking-tight text-white uppercase">Settings</h1>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${saved ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 glow-lime' : 'lv-btn-primary'}`}>
          {saved ? <><CheckCircle size={18} strokeWidth={2.5} /> Saved!</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Profile Card */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl flex items-center justify-center bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20">
              <User size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg font-header text-white">Profile</h2>
              <p className="text-sm mt-0.5 text-white/50 mono-data">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[{ name: 'height', label: 'Height (cm)', icon: Ruler, ph: '175' },
                { name: 'weight', label: 'Weight (kg)', icon: Scale, ph: '80' }].map(f => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white/60">
                    <f.icon size={14} className="text-[#00FFFF]" /> {f.label}
                  </label>
                  <input name={f.name} type="number" min="0" value={form[f.name]} onChange={e => set(f.name, e.target.value)} placeholder={f.ph} 
                    style={inputStyle} className="focus:border-[#00FFFF] placeholder:text-white/20 font-black" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white/60">
                  <Target size={14} className="text-[#CCFF00]" /> Goal Weight
                </label>
                <input name="goalWeight" type="number" min="0" value={form.goalWeight} onChange={e => set('goalWeight', e.target.value)} placeholder="75" 
                  style={inputStyle} className="focus:border-[#CCFF00] placeholder:text-white/20 font-black" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Age</label>
                <input name="age" type="number" min="1" max="120" value={form.age} onChange={e => set('age', e.target.value)} placeholder="25" 
                  style={inputStyle} className="focus:border-[#00FFFF] placeholder:text-white/20 font-black" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Gender</label>
              <div className="flex gap-3">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => set('gender', g)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all border mono-data"
                    style={{
                      background: form.gender === g ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: form.gender === g ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      color: form.gender === g ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                      boxShadow: form.gender === g ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
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
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-xl flex items-center justify-center bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20">
              <Calculator size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg font-header text-white">TDEE Calculator</h2>
              <p className="text-sm mt-0.5 text-white/50 mono-data">Auto-calculate calorie target</p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Activity Level</label>
              <div className="grid gap-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button key={level.value} type="button" onClick={() => set('activityLevel', level.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border"
                    style={{
                      background: Number(form.activityLevel) === level.value ? 'rgba(204,255,0,0.08)' : 'rgba(255,255,255,0.02)',
                      borderColor: Number(form.activityLevel) === level.value ? 'rgba(204,255,0,0.3)' : 'rgba(255,255,255,0.05)',
                      boxShadow: Number(form.activityLevel) === level.value ? '0 0 16px rgba(204,255,0,0.1)' : 'none'
                    }}>
                    <span className="text-lg opacity-80">{level.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-bold block" style={{ color: Number(form.activityLevel) === level.value ? '#CCFF00' : 'rgba(255,255,255,0.7)' }}>{level.label}</span>
                      <span className="text-xs block mt-0.5 text-white/40">{level.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Goal</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(goal => (
                  <button key={goal.value} type="button" onClick={() => set('fitnessGoal', goal.value)}
                    className="flex-auto py-3 px-4 rounded-xl text-xs font-bold transition-all border mono-data tracking-wider uppercase"
                    style={{
                      background: form.fitnessGoal === goal.value ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                      borderColor: form.fitnessGoal === goal.value ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                      color: form.fitnessGoal === goal.value ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                      boxShadow: form.fitnessGoal === goal.value ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
                    }}>
                    <span className="flex items-center justify-center gap-1.5">{goal.icon} {goal.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {tdeePreview && (
              <div className="p-4 rounded-xl mt-4" style={{ background: 'rgba(204,255,0,0.05)', border: '1px dashed rgba(204,255,0,0.2)' }}>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-white/50 mono-data">Estimated TDEE</p>
                <p className="text-3xl font-extrabold text-[#CCFF00] font-display">
                  {tdeePreview} <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">kcal/day</span>
                </p>
                <p className="text-[10px] uppercase mt-2 font-medium text-white/40 mono-data tracking-widest">
                  Target: <strong className="text-white">{tdeePreview + (GOALS.find(g => g.value === form.fitnessGoal)?.modifier || 0)} kcal/day</strong>
                </p>
              </div>
            )}
            <button type="button" onClick={handleTDEECalculation} disabled={!form.age || !form.height || !form.weight}
              className="w-full mt-4 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              Calculate & Apply
            </button>
          </div>
        </GlassPanel>

        {/* Daily Goals — spans full width */}
        <GlassPanel className="p-6 lg:col-span-2">
          <h2 className="font-bold text-lg mb-6 font-header text-white">Daily Targets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Calorie Target (kcal)</label>
              <input name="dailyCalorieGoal" type="number" min="0" value={form.dailyCalorieGoal} onChange={e => set('dailyCalorieGoal', e.target.value)}
                placeholder="2200" style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="focus:border-[#CCFF00]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white/50">
                <Droplets size={14} className="text-[#00FFFF]" /> Water Goal
              </label>
              <input name="waterIntakeGoal" type="number" min="1" max="10000" value={form.waterIntakeGoal} onChange={e => set('waterIntakeGoal', e.target.value)}
                placeholder="2000" style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }} className="focus:border-[#00FFFF]" />
            </div>
          </div>
          {/* Macro targets */}
          <h3 className="font-bold text-sm mt-8 mb-4 border-b pb-2 text-white/60 font-header uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>Macro Targets (grams/day)</h3>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'proteinTarget', label: 'Protein', color: '#CCFF00' },
              { key: 'carbsTarget', label: 'Carbs', color: '#00FFFF' },
              { key: 'fatsTarget', label: 'Fats', color: '#A855F7' }].map(m => (
              <div key={m.key} className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: m.color }}>{m.label}</label>
                <input type="number" min="0" value={form[m.key]} onChange={e => set(m.key, e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }} />
              </div>
            ))}
          </div>
          {/* Water unit preference */}
          <h3 className="font-bold text-sm mt-8 mb-4 border-b pb-2 text-white/60 font-header uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>Water Tracking Unit</h3>
          <div className="flex gap-3 max-w-sm">
            {['ml', 'cups'].map(u => (
              <button key={u} type="button" onClick={() => set('waterUnit', u)}
                className="flex-1 py-3 rounded-xl text-xs font-bold transition-all capitalize border mono-data"
                style={{
                  background: form.waterUnit === u ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: form.waterUnit === u ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: form.waterUnit === u ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                  boxShadow: form.waterUnit === u ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
                }}>
                {u === 'ml' ? 'Millilitres (ml)' : 'Cups'}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      <button onClick={signOutUser}
        className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border text-red-400 hover:bg-red-500/10"
        style={{ background: 'rgba(248, 113, 113, 0.05)', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
        <LogOut size={16} /> Sign Out
      </button>

      {/* Credit */}
      <div className="mt-8 text-center pb-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">
          Developed by Pratham Pingle
        </p>
      </div>
    </div>
  );
}
