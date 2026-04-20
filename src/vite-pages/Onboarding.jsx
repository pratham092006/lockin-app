import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  User, Ruler, Scale, Target, Zap, Flame,
  ChevronRight, ChevronLeft, Check, Loader2,
  Cpu, Activity, Droplets, Fingerprint
} from 'lucide-react';
import { calculateTDEE, ACTIVITY_LEVELS, GOALS } from '../lib/tdee';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useAuth();
  const { updateProfile } = useProfile();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
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

  const next = () => { if (step < 4) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); };

  const finish = async () => {
    setSaving(true);
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
      setProfile({ onboarding_done: true });
      toast.success("NEURAL CALIBRATION COMPLETE. WELCOME OPERATIVE.");
      navigate('/', { replace: true });
    } catch (err) {
      toast.error("SYNCHRONIZATION FAILED: RE-ATTEMPTING...");
    } finally {
      setSaving(false);
    }
  };

  const ShieldCheck = Flame;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0d0d0d] px-6 py-12 selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] size-[600px] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[600px] bg-lime-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-8 flex flex-col">
        
        {/* Progress System */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400">Step {step + 1} / 5</p>
              <h1 className="text-2xl font-bold tracking-tight text-white/20">Profile Setup</h1>
          </div>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={false}
                animate={{ width: `${(step + 1) * 20}%` }}
                className="h-full bg-cyan-500"
              />
           </div>
        </div>

        {/* Card Component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard className="p-10">
               {/* Card Header */}
               <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Setup</h1>
                  <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Complete your profile to get started.</p>
               </div>

               {/* Step Specific Forms */}
               <div className="space-y-8 min-h-[320px] flex flex-col justify-center">
                 {step === 0 && (
                   <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Age</label>
                        <Input type="number" value={form.age} onChange={onChange} name="age" placeholder="25" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Gender</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['male', 'female'].map(g => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => set('gender', g)}
                              className={cn(
                                "h-12 rounded-lg text-xs font-bold uppercase transition-all border",
                                form.gender === g 
                                  ? "bg-blue-600 border-blue-600 text-white" 
                                  : "bg-white border-gray-200 text-gray-600"
                              )}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                     </div>
                   </div>
                 )}

                 {step === 1 && (
                   <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-gray-500">Height (cm)</label>
                           <Input type="number" value={form.height} onChange={onChange} name="height" placeholder="175" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-gray-500">Weight (kg)</label>
                           <Input type="number" value={form.weight} onChange={onChange} name="weight" placeholder="75" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Target Weight (kg)</label>
                        <Input type="number" value={form.goalWeight} onChange={onChange} name="goalWeight" placeholder="70" />
                     </div>
                   </div>
                 )}

                 {step === 2 && (
                   <div className="space-y-3">
                     {ACTIVITY_LEVELS.map(level => {
                       const isActive = Number(form.activityLevel) === level.value;
                       return (
                         <button
                           key={level.value}
                           type="button"
                           onClick={() => set('activityLevel', level.value)}
                           className={cn(
                             "w-full flex items-center gap-4 p-4 rounded-xl transition-all border text-left",
                             isActive 
                               ? "border-blue-600 bg-blue-50" 
                               : "border-gray-200 bg-white hover:border-gray-300"
                           )}
                         >
                           <div className="flex-1 min-w-0">
                             <p className={cn("text-sm font-bold uppercase", isActive ? "text-blue-700" : "text-gray-900")}>{level.label}</p>
                             <p className="text-xs text-gray-500">{level.desc}</p>
                           </div>
                         </button>
                       );
                     })}
                   </div>
                 )}

                 {step === 3 && (
                   <div className="space-y-3 animate-fade-in">
                     {GOALS.map(goal => {
                       const isActive = form.fitnessGoal === goal.value;
                       return (
                         <button
                           key={goal.value}
                           type="button"
                           onClick={() => set('fitnessGoal', goal.value)}
                           className={cn(
                             "w-full flex items-center gap-6 p-5 rounded-2xl transition-all border text-left group/btn",
                             isActive 
                               ? "bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)]" 
                               : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                           )}
                         >
                           <div className={cn(
                              "size-12 rounded-xl flex items-center justify-center transition-all duration-500",
                              isActive ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-white/5 text-white/20"
                           )}>
                              <Target size={20} />
                           </div>
                           <div className="flex-1">
                             <p className={cn("text-[11px] font-black uppercase tracking-widest", isActive ? "text-purple-400" : "text-white/40")}>{goal.label}</p>
                             <p className="text-[9px] mt-1 text-white/10 font-bold uppercase tracking-widest">CALORIE SHIFT: {goal.modifier > 0 ? '+' : ''}{goal.modifier} KCAL</p>
                           </div>
                         </button>
                       );
                     })}
                   </div>
                 )}

                 {step === 4 && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'DAILY CALORIES', value: finalCalories, unit: 'kcal/d', color: 'text-cyan-400' },
                          { label: 'TARGET WEIGHT', value: form.goalWeight, unit: 'kg', color: 'text-emerald-400' },
                          { label: 'ESTIMATED TDEE', value: tdee || '---', unit: 'kcal/d', color: 'text-blue-400' },
                          { label: 'WATER GOAL', value: form.waterIntakeGoal, unit: 'cups/d', color: 'text-blue-300' },
                        ].map(stat => (
                          <div key={stat.label} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                             <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 mb-2">{stat.label}</p>
                             <div className="flex items-baseline gap-1">
                                <span className={cn("text-3xl font-bold tracking-tighter leading-none", stat.color)}>{stat.value}</span>
                                <span className="text-[8px] font-medium text-white/10 uppercase tracking-widest">{stat.unit}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                        <p className="text-[9px] text-center text-white/30 font-medium uppercase tracking-[0.1em] leading-relaxed">
                          Calculations based on the Mifflin-St Jeor equation. These values can be updated later in settings.
                        </p>
                      </div>
                   </div>
                 )}
               </div>

               {/* Footer Controls */}
               <div className="mt-12 flex gap-4">
                 {step > 0 && (
                   <Button
                     variant="outline"
                     onClick={back}
                     disabled={saving}
                     className="flex-1 h-12 rounded-xl border-white/10 text-white/40 hover:text-white font-bold uppercase text-[10px] tracking-widest"
                   >
                     Back
                   </Button>
                 )}
                 <Button
                   disabled={!canProceed() || saving}
                   onClick={step === 4 ? finish : next}
                   className="flex-[2] h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                 >
                   {saving ? (
                     <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</>
                   ) : step === 4 ? (
                     <><Check size={18} className="mr-2" /> Finish Setup</>
                   ) : (
                     <>Continue <ChevronRight size={18} className="ml-2" /></>
                   )}
                 </Button>
               </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Global Branding Info */}
        <div className="text-center opacity-20">
           <p className="text-[9px] font-black uppercase tracking-[0.5em]">Developed by Pratham Pingle</p>
        </div>
      </div>
    </div>
  );
}
