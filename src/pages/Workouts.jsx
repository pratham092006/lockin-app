import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Zap, Check, Timer, Dumbbell, ChevronDown, ChevronUp, Trash2, ChevronLeft, ChevronRight, Pause, Play, Flame } from 'lucide-react';
import { useWorkoutTemplates, useWorkoutLogs } from '../hooks/useWorkouts';
import AddWorkoutTemplateModal from '../components/AddWorkoutTemplateModal';
import GlassPanel, { EmptyState } from '../components/GlassPanel';

const IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', // Dark weights
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop', // Moody gym
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop', // Ropes
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop', // Dark runner
];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', padding: '0.5rem', textAlign: 'center',
  fontFamily: 'var(--font-mono)', fontSize: '0.875rem', outline: 'none', width: '100%',
  transition: 'all 0.2s ease-out'
};

// ── Set row ──────────────────────────────────────────────────────────────────
function SetRow({ setNum, previous = '', weight, reps, done, onChange }) {
  return (
    <div className="grid gap-2 items-center rounded-xl p-2 transition-all border"
      style={{ 
        gridTemplateColumns: '2rem 1fr 1fr 1fr 2rem', 
        background: done ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.02)',
        borderColor: done ? 'rgba(204,255,0,0.4)' : 'rgba(255,255,255,0.05)',
        boxShadow: done ? '0 0 16px rgba(204,255,0,0.15)' : 'none'
      }}>
      <span className="text-center font-bold text-sm text-white/50 mono-data">{setNum}</span>
      <span className="text-center text-[10px] text-white/40 mono-data">{previous || '—'}</span>
      <input type="number" placeholder="kg" value={weight} onChange={e => onChange('weight', e.target.value)} 
             style={{...inputStyle, borderColor: done ? 'rgba(204,255,0,0.3)' : inputStyle.border}} 
             className="focus:border-[#00FFFF] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]" />
      <input type="number" placeholder="reps" value={reps} onChange={e => onChange('reps', e.target.value)} 
             style={{...inputStyle, borderColor: done ? 'rgba(204,255,0,0.3)' : inputStyle.border}}
             className="focus:border-[#00FFFF] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]" />
      <button onClick={() => onChange('done', !done)} className="size-8 rounded-lg border-2 flex-center transition-all mx-auto active:scale-90"
        style={{ 
          borderColor: done ? 'transparent' : 'rgba(255,255,255,0.2)', 
          background: done ? '#CCFF00' : 'transparent',
          boxShadow: done ? '0 0 12px rgba(204,255,0,0.5)' : 'none'
        }}>
        {done && <Check size={18} color="#121212" strokeWidth={4} />}
      </button>
    </div>
  );
}

// ── Exercise card ────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, exerciseSets, onSetsChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sets = exerciseSets || [{ weight: '', reps: '', done: false }];
  const tagColor = exercise.type === 'compound' ? '#CCFF00' : '#00FFFF';
  const tagLabel = exercise.type === 'compound' ? 'Compound' : 'Isolation';

  const addSet = () => onSetsChange([...sets, { weight: '', reps: '', done: false }]);
  const updateSet = (i, field, value) => {
    const next = sets.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    onSetsChange(next);
  };

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg font-header">{exercise.name}</h3>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: tagColor }}>
            <Zap size={12} fill={tagColor} /> {tagLabel}
          </span>
        </div>
        <button onClick={() => setCollapsed(v => !v)} className="p-2 rounded-xl transition-colors hover:bg-white/10 text-white/50">
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="grid gap-2 px-2 mb-2" style={{ gridTemplateColumns: '2rem 1fr 1fr 1fr 2rem' }}>
            {['Set', 'Prev', 'Wt', 'Reps', '✓'].map(h => (
              <span key={h} className="text-[10px] uppercase tracking-widest font-bold text-center text-white/40">{h}</span>
            ))}
          </div>
          <div className="space-y-2">
            {sets.map((s, i) => (
              <SetRow key={i} setNum={i + 1} weight={s.weight} reps={s.reps} done={s.done}
                onChange={(field, val) => updateSet(i, field, val)} />
            ))}
          </div>
          <button onClick={addSet}
            className="w-full mt-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all hover:bg-white/10 border border-dashed border-white/20 text-white/60">
            <Plus size={16} /> Add Set
          </button>
        </>
      )}
    </GlassPanel>
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

  const reset = (s) => { setSeconds(s); setRemaining(s); setRunning(true); };

  return (
    <GlassPanel className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-[#00FFFF]">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`p-3 rounded-2xl ${running && remaining > 0 ? 'bg-cyan-500/20 glow-cyan border border-cyan-500/30' : 'bg-white/5'}`}>
          <Timer size={24} className={running && remaining > 0 ? 'text-[#00FFFF]' : 'text-white/40'} />
        </div>
        <div>
          <span className="text-4xl font-black mono-data"
            style={{ color: remaining <= 0 ? '#CCFF00' : '#FFFFFF', filter: remaining <= 0 ? 'drop-shadow(0 0 12px rgba(204,255,0,0.5))' : 'none' }}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
          {remaining <= 0 && <span className="block text-[10px] uppercase tracking-widest font-bold text-[#CCFF00]">Rest Complete</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {[60, 90, 120].map(s => (
          <button key={s} onClick={() => reset(s)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all border mono-data"
            style={{ 
              background: seconds === s ? 'rgba(0,255,255,0.1)' : 'transparent', 
              color: seconds === s ? '#00FFFF' : 'rgba(255,255,255,0.4)',
              borderColor: seconds === s ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              boxShadow: seconds === s ? '0 0 16px rgba(0,255,255,0.15)' : 'none'
            }}>
            {s}s
          </button>
        ))}
        <button onClick={() => setRunning(r => !r)} className="p-3 flex-center rounded-xl transition-colors text-white hover:bg-white/10 border border-white/10 active:scale-90 bg-white/5">
          {running ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
        </button>
      </div>
    </GlassPanel>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Workouts() {
  const { templates, createTemplate, deleteTemplate, loading: templatesLoading } = useWorkoutTemplates();
  const { logs, logWorkout } = useWorkoutLogs();
  const [modalOpen, setModalOpen]         = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionSets, setSessionSets]     = useState({});
  const [search]                          = useState('');
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
    await logWorkout({
      templateId: activeSession.id,
      exercises: exercisesWithSets,
      duration: elapsed,
      caloriesBurned: Number(caloriesInput) || 0,
    });
    setActiveSession(null);
    setSessionSets({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLogs = dateFilter ? logs.filter(l => l.date === dateFilter) : logs;

  /* ─── Active Session view ──────────────────────────── */
  if (activeSession) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <section className="bg-white/5 p-6 rounded-[24px] border border-white/10 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#CCFF00] mono-data">ACTIVE SESSION</p>
            <h1 className="text-4xl font-black font-display mt-1 text-white uppercase">{activeSession.name}</h1>
            <p className="text-sm mt-2 text-white/60 font-header">
              {activeSession.description || 'Strength & Hypertrophy Focus'} • <span className="mono-data text-white font-bold">{elapsed} MIN</span>
            </p>
          </div>
        </section>

        <RestTimer />

        <div className="space-y-4">
          {(activeSession.exercises || []).map((ex, i) => (
            <ExerciseCard key={i} exercise={ex} exerciseSets={sessionSets[i]}
              onSetsChange={(sets) => setSessionSets(prev => ({ ...prev, [i]: sets }))} />
          ))}
          {(!activeSession.exercises || activeSession.exercises.length === 0) && (
            <GlassPanel className="p-8 text-center text-white/50 italic">No exercises in this template.</GlassPanel>
          )}
        </div>

        <GlassPanel className="p-5 flex items-center gap-4 border border-cyan-500/20">
          <div className="size-12 rounded-2xl flex-center bg-cyan-500/20 border border-cyan-500/30 glow-cyan">
            <Flame size={20} className="text-[#00FFFF]" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#00FFFF]">Est. Calories Burned</label>
            <input type="number" placeholder="kcal" value={caloriesInput} onChange={e => setCaloriesInput(e.target.value)}
              className="mt-1 font-black text-2xl w-full bg-transparent outline-none text-white mono-data" />
          </div>
        </GlassPanel>

        <button onClick={finishSession} className="w-full mt-6 lv-btn-primary py-4 text-base glow-lime flex-center gap-2">
          <Check size={20} strokeWidth={3} /> Complete Workout
        </button>
      </div>
    );
  }

  /* ─── Workout detail view ──────────────────────── */
  if (detailLog) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => setDetailLog(null)} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors hover:text-white text-white/50">
          <ChevronLeft size={16} /> Back to Workouts
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#00FFFF] mono-data">{detailLog.date}</p>
          <h1 className="text-4xl font-black font-display uppercase mt-1">Session Detail</h1>
          <p className="text-sm mt-2 text-white/60 font-header">
            <span className="mono-data text-white">{detailLog.duration || 0}</span> min {detailLog.caloriesBurned > 0 ? `• ${detailLog.caloriesBurned} kcal burned` : ''}
          </p>
        </div>
        {(detailLog.exercises || []).map((ex, i) => (
          <GlassPanel key={i} className="p-5 border-l-2 border-[#CCFF00]">
            <h3 className="font-bold text-lg font-header mb-4">{ex.name}</h3>
            {(ex.sets || []).length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 px-2 mb-2">
                  {['Set', 'Weight', 'Reps'].map(h => (
                    <span key={h} className="text-[10px] uppercase tracking-widest font-bold text-center text-white/40">{h}</span>
                  ))}
                </div>
                {ex.sets.map((s, j) => (
                  <div key={j} className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-center font-bold text-sm text-[#CCFF00] mono-data">{j + 1}</span>
                    <span className="text-center text-sm font-medium mono-data">{s.weight} kg</span>
                    <span className="text-center text-sm font-medium mono-data">{s.reps} reps</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-white/40">No set data recorded</p>
            )}
          </GlassPanel>
        ))}
      </div>
    );
  }

  /* ─── Template browser view ──────────────────────────── */
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-white/50">YOUR REGIMEN</p>
          <h1 className="text-5xl font-black font-display tracking-tighter uppercase">Workouts</h1>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="size-14 rounded-[20px] flex-center transition-all bg-[#CCFF00] text-[#121212] glow-lime hover:scale-105 active:scale-95">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold font-header uppercase tracking-wider">Programs</h2>
        </div>
        
        {templatesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
             {[1,2,3].map(i => <div key={i} className="skeleton h-64 min-w-[280px] rounded-[24px] shrink-0" />)}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState icon={Dumbbell} title="No Programs" subtitle="Create your first workout template to begin training." />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory rounded-xl -mx-4 px-4 lg:mx-0 lg:px-0">
            {filteredTemplates.map((template, idx) => (
              <div key={template.id} className="relative h-72 min-w-[300px] w-[300px] sm:w-[340px] shrink-0 rounded-[28px] overflow-hidden group snap-center border border-white/10 shadow-2xl">
                {/* Image Background */}
                <img src={IMAGES[idx % IMAGES.length]} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                  <span className="inline-block px-3 py-1 bg-[#CCFF00]/90 text-[#121212] rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 glow-lime shadow-lg">
                    {template.exercises?.length || 0} Exercises
                  </span>
                  <h3 className="font-display font-black text-3xl text-white uppercase leading-none tracking-tight mb-2 group-hover:text-[#00FFFF] transition-colors">{template.name}</h3>
                  {template.description && <p className="text-xs text-white/70 line-clamp-2 font-header">{template.description}</p>}
                  
                  <div className="flex items-center gap-3 mt-5">
                    <button onClick={() => startSession(template)} className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm tracking-wider uppercase py-3 rounded-xl hover:bg-[#00FFFF] hover:text-[#121212] hover:border-[#00FFFF] transition-all">
                      Start
                    </button>
                    <button onClick={() => deleteTemplate(template.id)} className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent logs */}
      {logs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-header uppercase tracking-wider">History</h2>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="text-xs rounded-xl px-3 py-2 outline-none border border-white/10 bg-white/5 text-white/80 focus:border-[#00FFFF] mono-data" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredLogs.slice(0, 6).map(log => (
              <GlassPanel key={log.id} onClick={() => setDetailLog(log)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors group">
                <div>
                  <p className="font-bold text-base font-header">{log.exercises?.[0]?.name || 'Workout Session'}</p>
                  <p className="text-[11px] mt-1 text-white/50 mono-data uppercase tracking-widest">
                    {log.date} <span className="mx-1">•</span> <span className="text-[#00FFFF] font-bold">{log.duration || 0} MIN</span>
                    {log.caloriesBurned > 0 && <span> <span className="mx-1">•</span> <span className="text-[#CCFF00] font-bold">{log.caloriesBurned} KCAL</span></span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronRight size={18} className="text-white/30 group-hover:text-[#00FFFF] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}

      <AddWorkoutTemplateModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={async (data) => { await createTemplate(data); setModalOpen(false); }} />
    </div>
  );
}
