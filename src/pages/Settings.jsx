import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Scale, Ruler, Target, Calculator, Save, 
  CheckCircle, LogOut, Moon, Sun, Droplets, 
  Settings as SettingsIcon, Activity, Flame, Shield,
  Cpu, Zap, ChevronRight
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { calculateTDEE, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

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
    if (!form.age || !form.height || !form.weight) {
      toast.error("Biometric data incomplete for calculation");
      return;
    }
    const tdee = calculateTDEE({ 
      age: Number(form.age), 
      gender: form.gender, 
      height: Number(form.height), 
      weight: Number(form.weight), 
      activityLevel: Number(form.activityLevel) 
    });
    const goalMod = GOALS.find(g => g.value === form.fitnessGoal)?.modifier || 0;
    set('dailyCalorieGoal', tdee + goalMod);
    toast.success("Metabolic targets updated");
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        height: Number(form.height) || 0, 
        weight: Number(form.weight) || 0,
        goalWeight: Number(form.goalWeight) || 0, 
        dailyCalorieGoal: Number(form.dailyCalorieGoal) || 2200,
        waterIntakeGoal: Number(form.waterIntakeGoal) || 8, 
        age: Number(form.age) || 0,
        gender: form.gender, 
        activityLevel: Number(form.activityLevel), 
        fitnessGoal: form.fitnessGoal,
        proteinTarget: Number(form.proteinTarget) || 150, 
        carbsTarget: Number(form.carbsTarget) || 250,
        fatsTarget: Number(form.fatsTarget) || 70, 
        waterUnit: form.waterUnit,
      });
      setDraft({});
      setSaved(true);
      toast.success("System configuration synchronized");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { 
      console.error('Failed to save settings', err); 
      toast.error("Synchronization failed");
    }
  };

  const tdeePreview = (form.age && form.height && form.weight)
    ? calculateTDEE({ 
        age: Number(form.age), 
        gender: form.gender, 
        height: Number(form.height), 
        weight: Number(form.weight), 
        activityLevel: Number(form.activityLevel) 
      })
    : null;

  if (loading) {
    return (
      <div className="space-y-10 animate-fade-in py-10">
        <div className="h-20 w-80 bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="h-96 bg-white/5 rounded-[40px] animate-pulse" />
           <div className="h-96 bg-white/5 rounded-[40px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-end">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <div className="size-2 rounded-full bg-purple-500 shadow-[0_0_8px_#A855F7]" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-purple-400 mono-data">SYSTEM CONFIGURATION</p>
           </div>
           <h1 className="text-6xl font-black font-display tracking-tighter uppercase leading-none">Settings</h1>
        </div>
        <Button 
          onClick={handleSave}
          glow={!saved}
          className={cn(
            "h-16 px-10 rounded-[28px] font-black uppercase text-xs tracking-widest transition-all",
            saved ? "bg-lime-500/10 text-lime-400 border-lime-500/20" : "bg-cyan-600 hover:bg-cyan-500"
          )}
        >
          {saved ? <><CheckCircle size={18} className="mr-2" /> Synced</> : <><Save size={18} className="mr-2" /> Commit Changes</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children">
        
        {/* Biometrics Card */}
        <GlassCard className="p-10 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20 group-hover:bg-cyan-500 transition-all duration-700" />
          <div className="flex items-center gap-4 mb-10">
            <div className="size-14 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white leading-none">Body Measurements</h2>
              <p className="text-[10px] mt-2 text-white/30 uppercase font-medium tracking-widest">USER ID: {user?.email?.split('@')[0]}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: 'height', label: 'Height', unit: 'CM', icon: Ruler, ph: '175' },
                { name: 'weight', label: 'Weight', unit: 'KG', icon: Scale, ph: '80' }
              ].map(f => (
                <div key={f.name} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{f.label}</label>
                     <span className="text-[9px] font-black text-cyan-400 mono-data">{f.unit}</span>
                  </div>
                  <Input 
                    name={f.name} 
                    type="number" 
                    min="0" 
                    value={form[f.name]} 
                    onChange={e => set(f.name, e.target.value)} 
                    placeholder={f.ph} 
                    className="h-14 font-black text-xl border-white/5 bg-white/[0.01]"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Weight</label>
                   <span className="text-[9px] font-black text-lime-400 mono-data">KG</span>
                </div>
                <Input 
                  name="goalWeight" 
                  type="number" 
                  min="0" 
                  value={form.goalWeight} 
                  onChange={e => set('goalWeight', e.target.value)} 
                  placeholder="75" 
                  className="h-14 font-black text-xl border-white/5 bg-white/[0.01]"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Chrono Age</label>
                   <span className="text-[9px] font-black text-purple-400 mono-data">YRS</span>
                </div>
                <Input 
                  name="age" 
                  type="number" 
                  min="1" 
                  max="120" 
                  value={form.age} 
                  onChange={e => set('age', e.target.value)} 
                  placeholder="25" 
                  className="h-14 font-black text-xl border-white/5 bg-white/[0.01]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Biological Identity</label>
              <div className="flex gap-3 bg-white/[0.01] p-1.5 rounded-2xl border border-white/5">
                {['male', 'female'].map(g => (
                  <button 
                    key={g} 
                    type="button" 
                    onClick={() => set('gender', g)}
                    className={cn(
                      "flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      form.gender === g 
                        ? "bg-cyan-600 text-white shadow-xl shadow-cyan-900/40" 
                        : "text-white/20 hover:text-white/40 hover:bg-white/5"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Metabolic Calibration Card */}
        <GlassCard className="p-10 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-lime-500/20 group-hover:bg-lime-500 transition-all duration-700" />
          <div className="flex items-center gap-4 mb-10">
            <div className="size-14 rounded-2xl flex items-center justify-center bg-lime-500/10 text-lime-400 border border-lime-500/20 shadow-[0_0_20px_rgba(204,255,0,0.1)]">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white leading-none">Burn Rate</h2>
              <p className="text-[10px] mt-2 text-white/30 uppercase font-black tracking-widest mono-data">METABOLIC SYNC STATUS: NOMINAL</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Active Coefficient</label>
              <div className="grid gap-2">
                {ACTIVITY_LEVELS.map(level => {
                  const isActive = Number(form.activityLevel) === level.value;
                  return (
                    <button 
                      key={level.value} 
                      type="button" 
                      onClick={() => set('activityLevel', level.value)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border text-left group/btn",
                        isActive 
                          ? "bg-lime-500/10 border-lime-500/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]" 
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                      )}
                    >
                      <div className={cn(
                        "size-10 rounded-xl flex items-center justify-center transition-all duration-500",
                        isActive ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(204,255,0,0.5)]" : "bg-white/5 text-white/20"
                      )}>
                        <Activity size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-[11px] font-black uppercase tracking-widest block", isActive ? "text-lime-400" : "text-white/40")}>
                          {level.label}
                        </span>
                        <span className="text-[9px] block font-bold text-white/10 mt-1 truncate">{level.desc}</span>
                      </div>
                      {isActive && <ChevronRight size={16} className="text-lime-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Mission Objective</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(goal => {
                  const isActive = form.fitnessGoal === goal.value;
                  return (
                    <button 
                      key={goal.value} 
                      type="button" 
                      onClick={() => set('fitnessGoal', goal.value)}
                      className={cn(
                        "flex-auto h-12 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border",
                        isActive 
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.05)]" 
                          : "bg-white/[0.01] border-white/5 text-white/20 hover:text-white/40"
                      )}
                    >
                      {goal.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {tdeePreview && (
              <div className="p-6 rounded-3xl border border-dashed border-lime-500/30 bg-lime-500/[0.02] flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-2 text-lime-400/50">ESTIMATED ENGINE BURN</p>
                  <p className="text-4xl font-black text-white font-display uppercase tracking-tighter leading-none">
                    {tdeePreview} <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">KCAL/D</span>
                  </p>
                </div>
                <Button 
                   variant="secondary" 
                   size="sm" 
                   onClick={handleTDEECalculation}
                   className="h-10 px-4 rounded-xl bg-lime-400 text-black font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                   Sync Burn
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Daily Targets — Full Width */}
        <GlassCard className="p-10 lg:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.02] blur-[100px] pointer-events-none" />
           <div className="flex items-center gap-4 mb-10">
              <div className="size-14 rounded-2xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white leading-none">Directive Targets</h2>
                <p className="text-[10px] mt-2 text-white/30 uppercase font-medium tracking-widest">DAILY TARGETS</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Calorie Threshold</label>
                   <span className="text-[9px] font-black text-purple-400 mono-data uppercase tracking-widest">Global Limit</span>
                </div>
                <Input 
                  name="dailyCalorieGoal" 
                  type="number" 
                  min="0" 
                  value={form.dailyCalorieGoal} 
                  onChange={e => set('dailyCalorieGoal', e.target.value)}
                  placeholder="2200" 
                  className="h-20 text-4xl font-black font-display border-white/10 bg-white/[0.02] text-center"
                />
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Hydration Quota</label>
                   <span className="text-[9px] font-black text-cyan-400 mono-data uppercase tracking-widest">Resource Target</span>
                </div>
                <div className="flex gap-4">
                  <Input 
                    name="waterIntakeGoal" 
                    type="number" 
                    min="1" 
                    value={form.waterIntakeGoal} 
                    onChange={e => set('waterIntakeGoal', e.target.value)}
                    placeholder="2000" 
                    className="h-20 text-4xl flex-1 font-black font-display border-white/10 bg-white/[0.02] text-center"
                  />
                  <div className="flex flex-col gap-2">
                    {['ml', 'cups'].map(u => (
                      <button 
                        key={u} 
                        type="button" 
                        onClick={() => set('waterUnit', u)}
                        className={cn(
                          "px-4 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                          form.waterUnit === u 
                            ? "bg-cyan-500 text-black border-cyan-500 shadow-lg" 
                            : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
           </div>

           {/* Macro Thresholds */}
           <div className="mt-12 pt-10 border-t border-white/5">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-8 text-center">Macro Distribution Pattern</label>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {[
                  { key: 'proteinTarget', label: 'PROTEIN', color: 'text-lime-400', bcolor: 'border-lime-500/20' },
                  { key: 'carbsTarget', label: 'CARBS', color: 'text-cyan-400', bcolor: 'border-cyan-500/20' },
                  { key: 'fatsTarget', label: 'FATS', color: 'text-rose-500', bcolor: 'border-rose-500/20' }
                ].map(m => (
                  <div key={m.key} className="space-y-4">
                    <label className={cn("text-[9px] font-black tracking-[0.2em] text-center block", m.color)}>{m.label}</label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={form[m.key]} 
                      onChange={e => set(m.key, e.target.value)}
                      className={cn("h-16 text-center font-black text-2xl border-white/5 bg-black/20", m.bcolor)} 
                    />
                  </div>
                ))}
              </div>
           </div>
        </GlassCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-10">
        <Button 
          variant="outline"
          onClick={() => {
            if(confirm("Terminate current session?")) {
               signOutUser();
            }
          }}
          className="flex-1 h-16 rounded-[28px] border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 font-black uppercase text-xs tracking-widest"
        >
          <LogOut size={16} className="mr-2" /> Security Disconnect
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-16 rounded-[28px] border-white/10 text-white/20 font-black uppercase text-xs tracking-widest cursor-default"
        >
          <Shield size={16} className="mr-2 opacity-30" /> NODE_01 SYNC: VALID
        </Button>
      </div>

      {/* Credit Section */}
      <div className="flex flex-col items-center opacity-20 pt-10 border-t border-white/5">
        <div className="flex items-center gap-4 mb-2">
           <div className="h-px w-10 bg-white/50" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Developed by Pratham Pingle</p>
           <div className="h-px w-10 bg-white/50" />
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest">© 2024 LOCKIN FITNESS • ALL RIGHTS RESERVED</p>
      </div>
    </div>
  );
}
