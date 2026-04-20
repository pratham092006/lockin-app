import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Zap, Check, Timer, Dumbbell, 
  ChevronDown, ChevronUp, Trash2, ChevronLeft, 
  ChevronRight, Pause, Play, Flame, BarChart3,
  Dumbbell as DumbbellIcon, Clock
} from 'lucide-react';
import { useWorkoutTemplates, useWorkoutLogs } from '../hooks/useWorkouts';
import AddWorkoutTemplateModal from '../components/AddWorkoutTemplateModal';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop',
];

// ── Set row ──────────────────────────────────────────────────────────────────
function SetRow({ setNum, previous = '', weight, reps, done, onChange }) {
  return (
    <motion.div 
      initial={false}
      animate={{ 
        backgroundColor: done ? 'rgba(204,255,0,0.05)' : 'rgba(255,255,255,0.02)',
        borderColor: done ? 'rgba(204,255,0,0.3)' : 'rgba(255,255,255,0.05)'
      }}
      className={cn(
        "grid gap-3 items-center rounded-2xl p-2.5 transition-all border",
        done && "shadow-[0_0_20px_rgba(204,255,0,0.1)]"
      )}
      style={{ gridTemplateColumns: '2.5rem 1fr 1fr 1fr 2.5rem' }}
    >
      <span className={cn(
        "text-center font-black text-xs mono-data transition-colors",
        done ? "text-lime-400" : "text-white/30"
      )}>{setNum}</span>
      
      <div className="text-center flex flex-col items-center">
        <span className="text-[9px] uppercase tracking-tighter text-white/20 font-bold">PREV</span>
        <span className="text-xs text-white/50 mono-data font-medium">{previous || '—'}</span>
      </div>

      <Input 
        type="number" 
        placeholder="kg" 
        value={weight} 
        onChange={e => onChange('weight', e.target.value)} 
        className={cn(
          "h-10 text-center font-bold font-mono transition-all",
          done && "border-lime-500/30 bg-lime-500/5"
        )}
      />

      <Input 
        type="number" 
        placeholder="reps" 
        value={reps} 
        onChange={e => onChange('reps', e.target.value)} 
        className={cn(
          "h-10 text-center font-bold font-mono transition-all",
          done && "border-lime-500/30 bg-lime-500/3"
        )}
      />

      <button 
        onClick={() => onChange('done', !done)} 
        className={cn(
          "size-9 rounded-xl border-2 flex items-center justify-center transition-all mx-auto active:scale-90",
          done 
            ? "border-transparent bg-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.4)]" 
            : "border-white/10 bg-white/5 hover:border-white/20"
        )}
      >
        {done && <Check size={18} className="text-[#121212]" strokeWidth={4} />}
      </button>
    </motion.div>
  );
}

// ── Exercise card ────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, exerciseSets, onSetsChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sets = exerciseSets || [{ weight: '', reps: '', done: false }];
  const isCompound = exercise.type === 'compound';

  const addSet = () => onSetsChange([...sets, { weight: '', reps: '', done: false }]);
  const updateSet = (i, field, value) => {
    const next = sets.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    onSetsChange(next);
  };

  return (
    <GlassCard className="p-0 overflow-hidden" hover={!collapsed}>
      <div className={cn(
        "p-5 flex items-start justify-between cursor-pointer",
        !collapsed && "border-b border-white/5"
      )} onClick={() => setCollapsed(!collapsed)}>
        <div>
          <h3 className="font-bold text-xl font-header tracking-tight">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
              isCompound 
                ? "bg-lime-500/10 text-lime-400 border-lime-500/20" 
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            )}>
              {isCompound ? 'Compound' : 'Isolation'}
            </span>
            <span className="text-[10px] text-white/30 font-medium uppercase tracking-tighter">
              {sets.length} SETS PLANNED
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="p-5 pt-4 bg-white/[0.01]"
          >
            <div className="grid gap-3 px-3 mb-3" style={{ gridTemplateColumns: '2.5rem 1fr 1fr 1fr 2.5rem' }}>
              {['SET', 'PREV', 'WEIGHT', 'REPS', 'DONE'].map(h => (
                <span key={h} className="text-[9px] uppercase tracking-widest font-black text-center text-white/30">{h}</span>
              ))}
            </div>
            <div className="space-y-2.5">
              {sets.map((s, i) => (
                <SetRow 
                  key={i} 
                  setNum={i + 1} 
                  weight={s.weight} 
                  reps={s.reps} 
                  done={s.done}
                  onChange={(field, val) => updateSet(i, field, val)} 
                />
              ))}
            </div>
            <Button 
              variant="ghost" 
              onClick={addSet}
              className="w-full mt-4 h-12 rounded-2xl border border-dashed border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/70"
            >
              <Plus size={16} className="mr-2" /> Add Set
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ── Rest Timer ───────────────────────────────────────────────────────────────
function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(90);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  const reset = (s) => { 
    setSeconds(s); 
    setRemaining(s); 
    setRunning(true);
    toast.info(`Rest timer: ${s} seconds`, { duration: 2000 });
  };

  const isComplete = remaining <= 0;

  return (
    <GlassCard className={cn(
      "p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative transition-all duration-500",
      isComplete && "border-lime-500/50 shadow-[0_0_30px_rgba(204,255,0,0.2)] bg-lime-500/5"
    )}>
      {running && remaining > 0 && (
         <motion.div 
           initial={{ width: '0%' }}
           animate={{ width: `${(remaining / seconds) * 100}%` }}
           className="absolute bottom-0 left-0 h-1 bg-cyan-400 opacity-30 shadow-[0_0_10px_#00FFFF]"
         />
      )}

      <div className="flex items-center gap-5 w-full sm:w-auto">
        <div className={cn(
          "size-16 rounded-2xl flex items-center justify-center transition-all duration-500",
          running && remaining > 0 ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-white/5 border border-white/5",
          isComplete && "bg-lime-500/20 border-lime-500/40 animate-pulse"
        )}>
          <Timer size={32} className={cn(
            "transition-colors",
            running && remaining > 0 ? "text-cyan-400" : "text-white/20",
            isComplete && "text-lime-400"
          )} />
        </div>
        <div>
          <span className={cn(
            "text-5xl font-black font-display tracking-tighter transition-all",
            isComplete ? "text-lime-400 drop-shadow-[0_0_12px_rgba(204,255,0,0.5)]" : "text-white"
          )}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
          {isComplete && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="block text-[10px] uppercase tracking-widest font-black text-lime-400 mt-1"
            >
              REST COMPLETE
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
        <div className="flex gap-2">
          {[60, 90, 120].map(s => (
            <button 
              key={s} 
              onClick={() => reset(s)}
              className={cn(
                "w-12 h-11 rounded-xl text-xs font-black transition-all border mono-data",
                seconds === s 
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
                  : "bg-white/5 text-white/30 border-white/5 hover:border-white/10 hover:text-white/50"
              )}
            >
              {s}s
            </button>
          ))}
        </div>
        <div className="w-px h-8 bg-white/10 mx-1" />
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => setRunning(!running)}
          className="size-11 rounded-xl"
        >
          {running ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
        </Button>
      </div>
    </GlassCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Workouts() {
  const { templates, createTemplate, deleteTemplate, loading: templatesLoading } = useWorkoutTemplates();
  const { logs, logWorkout } = useWorkoutLogs();
  const [modalOpen, setModalOpen]         = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionSets, setSessionSets]     = useState({});
  const [elapsed, setElapsed]             = useState(0);
  const [caloriesInput, setCaloriesInput] = useState('');
  const [dateFilter, setDateFilter]       = useState(''); 
  const [detailLog, setDetailLog]         = useState(null); 
  const timerRef = useRef(null);

  useEffect(() => {
    if (!activeSession) return;
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 60000);
    return () => clearInterval(timerRef.current);
  }, [activeSession]);

  const startSession = (template) => {
    setActiveSession(template);
    setElapsed(0);
    setCaloriesInput('');
    const initSets = {};
    (template.exercises || []).forEach((ex, i) => {
      initSets[i] = Array.from({ length: ex.sets || 3 }, () => ({ weight: '', reps: '', done: false }));
    });
    setSessionSets(initSets);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`Started: ${template.name}`);
  };

  const finishSession = async () => {
    if (!activeSession) return;
    const exercisesWithSets = (activeSession.exercises || []).map((ex, i) => ({
      name: ex.name,
      type: ex.type || 'isolation',
      sets: (sessionSets[i] || []).filter(s => s.done).map(s => ({
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
      })),
    }));

    toast.promise(
      logWorkout({
        templateId: activeSession.id,
        exercises: exercisesWithSets,
        duration: elapsed,
        caloriesBurned: Number(caloriesInput) || 0,
      }),
      {
        loading: 'Saving workout...',
        success: 'Workout saved!',
        error: 'Failed to save session'
      }
    );

    setActiveSession(null);
    setSessionSets({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredLogs = dateFilter ? logs.filter(l => l.date === dateFilter) : logs;

  /* ─── Active Session view ──────────────────────────── */
  if (activeSession) {
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <section className="bg-white/5 p-8 rounded-[32px] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#CCFF00]/10 blur-[100px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_#CCFF00]" />
                <p className="text-[10px] uppercase tracking-widest font-black text-lime-400 mono-data">SESSION ACTIVE</p>
              </div>
              <h2 className="text-xl font-bold text-white">Current Routine</h2>
              <h1 className="text-5xl font-black font-display text-white uppercase tracking-tighter leading-none">{activeSession.name}</h1>
              <p className="text-sm mt-3 text-white/50 font-header max-w-md">
                {activeSession.description || 'Stay focused and maintain good form.'}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-[20px]">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">Workout</h1>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest">In Progress</p>
              </div>
              <Clock size={24} className="text-white/20" />
            </div>
          </div>
        </section>

        <RestTimer />

        <div className="space-y-4">
          {(activeSession.exercises || []).map((ex, i) => (
            <ExerciseCard 
              key={i} 
              exercise={ex} 
              exerciseSets={sessionSets[i]}
              onSetsChange={(sets) => setSessionSets(prev => ({ ...prev, [i]: sets }))} 
            />
          ))}
          {(!activeSession.exercises || activeSession.exercises.length === 0) && (
            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[32px]">
              <p className="text-sm text-white/30 italic">No exercises in this routine.</p>
            </div>
          )}
        </div>

        <GlassCard className="p-6 flex items-center gap-6 border border-cyan-500/20 group h-24">
          <div className="size-14 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 transition-all group-focus-within:border-cyan-500/50 group-focus-within:bg-cyan-500/20">
            <Flame size={24} className="text-[#00FFFF] drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest font-black text-cyan-400/60 block mb-1">CALORIES BURNED</label>
            <input 
              type="number" 
              placeholder="0 KCAL" 
              value={caloriesInput} 
              onChange={e => setCaloriesInput(e.target.value)}
              className="font-black text-3xl w-full bg-transparent outline-none text-white font-display placeholder:text-white/10 uppercase tracking-tighter" 
            />
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="glass" 
            onClick={() => {
              setActiveSession(null);
              toast.info("Workout cancelled");
            }} 
            className="h-16 rounded-[24px] uppercase font-bold text-xs tracking-widest text-white/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={finishSession} 
            className="h-16 rounded-[24px] uppercase font-bold text-xs tracking-widest bg-lime-400 text-black hover:bg-lime-500"
          >
            <Check size={18} className="mr-2" strokeWidth={3} /> Finish
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Workout detail view ──────────────────────── */
  if (detailLog) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <button 
          onClick={() => setDetailLog(null)} 
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all hover:text-cyan-400 text-white/30 mb-8"
        >
          <ChevronLeft size={16} /> BACK TO HISTORY
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase tracking-tighter">Workout Summary</h1>
            <p className="text-sm text-white/40 font-medium uppercase tracking-widest">{detailLog.date}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl min-w-[100px]">
               <p className="text-[9px] uppercase tracking-widest font-bold text-white/30">DURATION</p>
               <p className="text-xl font-black font-mono">{detailLog.duration || 0} <span className="text-[10px]">MIN</span></p>
            </div>
            {detailLog.caloriesBurned > 0 && (
              <div className="bg-lime-500/5 border border-lime-500/10 p-4 rounded-2xl min-w-[100px]">
                 <p className="text-[9px] uppercase tracking-widest font-bold text-lime-400">BURNED</p>
                 <p className="text-xl font-black font-mono text-lime-400">{detailLog.caloriesBurned} <span className="text-[10px]">KCAL</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {(detailLog.exercises || []).map((ex, i) => (
            <GlassCard key={i} className="p-6 border-l-4 border-l-[#CCFF00]">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-black text-2xl font-header tracking-tight uppercase">{ex.name}</h3>
                <span className="text-[9px] bg-white/5 px-2 py-1 rounded font-bold uppercase text-white/40 tracking-widest">
                  {ex.sets?.length || 0} SETS
                </span>
              </div>
              {(ex.sets || []).length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-3 px-4 mb-3">
                    {['SET', 'WEIGHT (KG)', 'REPS'].map(h => (
                      <span key={h} className="text-[9px] uppercase tracking-widest font-black text-center text-white/20">{h}</span>
                    ))}
                  </div>
                  {ex.sets.map((s, j) => (
                    <div key={j} className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-center font-black text-sm text-[#CCFF00] mono-data leading-none flex items-center justify-center">{j + 1}</span>
                      <span className="text-center text-sm font-bold text-white mono-data">{s.weight}</span>
                      <span className="text-center text-sm font-bold text-white mono-data">{s.reps}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-white/30 text-center py-4">No data recorded.</p>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Template browser view ──────────────────────────── */
  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-black mb-1 text-white/40 mono-data">FITNESS DASHBOARD</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Workouts</h1>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          size="icon"
          className="size-16 rounded-[24px] glow-lime"
        >
          <Plus size={28} strokeWidth={3} />
        </Button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6 group cursor-default">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[2px] bg-[#CCFF00]/50" />
             <h2 className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">My Routines</h2>
          </div>
        </div>
        
        {templatesLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar">
             {[1,2,3].map(i => <div key={i} className="skeleton h-[380px] min-w-[320px] rounded-[32px] shrink-0" />)}
          </div>
        ) : templates.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
            <DumbbellIcon size={48} className="text-white/10 mb-6" />
            <p className="text-sm text-white/30 font-header uppercase tracking-widest">No routines found</p>
            <Button variant="ghost" onClick={() => setModalOpen(true)} className="mt-6 text-xs text-lime-400">Create New Routine</Button>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth">
            {templates.map((template, idx) => (
              <motion.div 
                key={template.id} 
                whileHover={{ y: -8 }}
                className="relative h-[380px] min-w-[320px] w-[320px] shrink-0 rounded-[35px] overflow-hidden group snap-center border border-white/5 shadow-2xl"
              >
                <img src={IMAGES[idx % IMAGES.length]} alt="" className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent" />
                
                <div className="absolute inset-x-0 bottom-0 p-8 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-lime-400 text-black rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                      {template.exercises?.length || 0} EXERCISES
                    </span>
                  </div>
                  
                  <h3 className="font-display font-black text-4xl text-white uppercase leading-[0.9] tracking-tighter mb-3 group-hover:text-[#CCFF00] transition-colors">{template.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 font-header uppercase tracking-tight mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {template.description || 'Routine details'}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => startSession(template)} 
                      className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest"
                      variant="primary"
                    >
                      Start
                    </Button>
                    <button 
                      onClick={() => {
                        if(confirm('Delete this routine?')) deleteTemplate(template.id);
                      }} 
                      className="size-14 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent logs */}
      {logs.length > 0 && (
        <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="size-2 rounded-full bg-cyan-400" />
               <h2 className="text-xl font-black font-display uppercase tracking-wider text-white">History</h2>
            </div>
            <div className="relative">
              <input 
                type="date" 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)}
                className="text-[10px] font-black rounded-xl px-4 py-2 outline-none border border-white/10 bg-black/40 text-white/50 focus:border-cyan-400/50 uppercase tracking-widest placeholder:text-white/10" 
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLogs.slice(0, 9).map(log => (
              <GlassCard 
                key={log.id} 
                onClick={() => setDetailLog(log)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.04] border-white/5 transition-all group hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm font-header uppercase tracking-tight text-white group-hover:text-cyan-400 transition-colors truncate">
                    {log.exercises?.[0]?.name || 'Workout'}
                  </p>
                  <p className="text-[9px] mt-1 text-white/30 mono-data uppercase tracking-widest flex items-center gap-2">
                    {log.date} <span className="size-1 rounded-full bg-white/10" /> <span className="text-cyan-400/80 font-bold">{log.duration || 0}M</span>
                    {log.caloriesBurned > 0 && <><span className="size-1 rounded-full bg-white/10" /> <span className="text-lime-400/80 font-bold">{log.caloriesBurned}K</span></>}
                  </p>
                </div>
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all ml-4">
                  <ChevronRight size={18} className="text-white/20 group-hover:text-cyan-400 transition-all group-hover:translate-x-0.5" />
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      <AddWorkoutTemplateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => { 
          await createTemplate(data); 
          setModalOpen(false); 
          toast.success("Routine created");
        }} 
      />
    </div>
  );
}
