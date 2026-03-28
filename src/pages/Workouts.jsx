import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Search, Zap, MoreHorizontal, Check, Timer, Dumbbell, ChevronDown, ChevronUp, Trash2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useWorkoutTemplates, useWorkoutLogs } from '../hooks/useWorkouts';
import AddWorkoutTemplateModal from '../components/AddWorkoutTemplateModal';
import GlassPanel from '../components/GlassPanel';
import { EmptyState } from '../components/GlassPanel';
import { C } from '../lib/theme';

const inputStyle = {
  background: C.surfaceCont, color: C.onSurface, border: 'none',
  borderRadius: '0.5rem', padding: '0.35rem 0.5rem', textAlign: 'center',
  fontSize: '0.875rem', outline: 'none', width: '100%',
};

// ── Set row — manages its own weight/reps, reports up (#2) ───────────────────
function SetRow({ setNum, previous = '', weight, reps, done, onChange }) {
  return (
    <div className="grid gap-2 items-center rounded-lg p-2 transition-colors"
      style={{ gridTemplateColumns: '2rem 1fr 1fr 1fr 2rem', background: done ? 'rgba(66,227,85,0.06)' : 'rgba(14,14,14,0.5)' }}>
      <span className="text-center font-bold text-sm" style={{ color: C.primary }}>{setNum}</span>
      <span className="text-center text-xs italic" style={{ color: C.outline }}>{previous || '—'}</span>
      <input type="number" placeholder="kg" value={weight} onChange={e => onChange('weight', e.target.value)} style={inputStyle} />
      <input type="number" placeholder="reps" value={reps} onChange={e => onChange('reps', e.target.value)} style={inputStyle} />
      <button onClick={() => onChange('done', !done)} className="size-6 rounded-full border-2 flex items-center justify-center transition-all mx-auto"
        style={{ borderColor: done ? C.secondary : C.outlineV, background: done ? C.secondary : 'transparent' }}>
        {done && <Check size={12} color="#00390a" strokeWidth={3} />}
      </button>
    </div>
  );
}

// ── Exercise card (#2/#9 — saves sets data) ──────────────────────────────────
function ExerciseCard({ exercise, exerciseSets, onSetsChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const sets = exerciseSets || [{ weight: '', reps: '', done: false }];
  const tagColor = exercise.type === 'compound' ? C.secondary : C.tertiary;
  const tagLabel = exercise.type === 'compound' ? 'Compound Movement' : 'Isolation';

  const addSet = () => onSetsChange([...sets, { weight: '', reps: '', done: false }]);
  const updateSet = (i, field, value) => {
    const next = sets.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    onSetsChange(next);
  };

  return (
    <GlassPanel className="p-5" style={{ borderRadius: '1rem' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{exercise.name}</h3>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold mt-1" style={{ color: tagColor }}>
            <Zap size={11} /> {tagLabel}
          </span>
        </div>
        <button onClick={() => setCollapsed(v => !v)} style={{ color: C.outline }}>
          {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="grid gap-2 px-2 mb-2" style={{ gridTemplateColumns: '2rem 1fr 1fr 1fr 2rem' }}>
            {['Set', 'Prev', 'Wt', 'Reps', '✓'].map(h => (
              <span key={h} className="text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: C.outline }}>{h}</span>
            ))}
          </div>
          <div className="space-y-2">
            {sets.map((s, i) => (
              <SetRow key={i} setNum={i + 1} weight={s.weight} reps={s.reps} done={s.done}
                onChange={(field, val) => updateSet(i, field, val)} />
            ))}
          </div>
          <button onClick={addSet}
            className="w-full mt-4 py-2 text-xs font-bold flex items-center justify-center gap-1 rounded-lg transition-colors"
            style={{ color: C.outline, border: `1px solid ${C.outlineV}` }}>
            <Plus size={14} /> Add Set
          </button>
        </>
      )}
    </GlassPanel>
  );
}

// ── Rest Timer (#46) ─────────────────────────────────────────────────────────
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
    <GlassPanel className="p-4 flex items-center justify-between" style={{ borderRadius: '1rem' }}>
      <div className="flex items-center gap-3">
        <Timer size={18} style={{ color: running && remaining > 0 ? C.secondary : C.outline }} />
        <span className="text-2xl font-black tabular-nums"
          style={{ fontFamily: "'Manrope', system-ui", color: remaining <= 0 ? C.secondary : C.onSurface }}>
          {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
        </span>
        {remaining <= 0 && <span className="text-xs font-bold" style={{ color: C.secondary }}>GO!</span>}
      </div>
      <div className="flex items-center gap-2">
        {[60, 90, 120].map(s => (
          <button key={s} onClick={() => reset(s)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            style={{ background: seconds === s ? 'rgba(75,142,255,0.15)' : 'transparent', color: seconds === s ? C.primary : C.outline }}>
            {s}s
          </button>
        ))}
        <button onClick={() => setRunning(r => !r)} className="p-1.5 rounded-lg" style={{ color: C.primary }}>
          {running ? <Pause size={16} /> : <Play size={16} />}
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
  const [search, setSearch]               = useState('');
  const [elapsed, setElapsed]             = useState(0);
  const [caloriesInput, setCaloriesInput] = useState('');
  const [dateFilter, setDateFilter]       = useState('');  // #16
  const [detailLog, setDetailLog]         = useState(null); // #42
  const timerRef = useRef(null);

  // #3 fix — timer in useEffect with proper cleanup
  useEffect(() => {
    if (!activeSession) return;
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 60000);
    return () => clearInterval(timerRef.current);
  }, [activeSession]);

  const startSession = (template) => {
    setActiveSession(template);
    setElapsed(0);
    setCaloriesInput('');
    // Initialize sets for each exercise
    const initSets = {};
    (template.exercises || []).forEach((ex, i) => {
      initSets[i] = Array.from({ length: ex.sets || 3 }, () => ({ weight: '', reps: '', done: false }));
    });
    setSessionSets(initSets);
  };

  // #2/#9 — collect per-set data on finish
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
      caloriesBurned: Number(caloriesInput) || 0, // #11
    });
    setActiveSession(null);
    setSessionSets({});
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // #16 — date filter for logs
  const filteredLogs = dateFilter
    ? logs.filter(l => l.date === dateFilter)
    : logs;

  /* ─── Active Session view ──────────────────────────── */
  if (activeSession) {
    return (
      <div className="space-y-5 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>
        <section>
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.primary }}>ACTIVE SESSION</p>
          <h1 className="text-4xl font-extrabold tracking-tight mt-0.5"
            style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
            {activeSession.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.onSurfaceV }}>
            {activeSession.description || 'Strength & Hypertrophy Focus'} · {elapsed} min
          </p>
        </section>

        {/* Rest Timer (#46) */}
        <RestTimer />

        {/* Exercise cards with state */}
        <div className="space-y-5">
          {(activeSession.exercises || []).map((ex, i) => (
            <ExerciseCard key={i} exercise={ex} exerciseSets={sessionSets[i]}
              onSetsChange={(sets) => setSessionSets(prev => ({ ...prev, [i]: sets }))} />
          ))}
          {(!activeSession.exercises || activeSession.exercises.length === 0) && (
            <GlassPanel className="p-8 text-center" style={{ borderRadius: '1rem' }}>
              <p style={{ color: C.outline }}>No exercises in this template.</p>
            </GlassPanel>
          )}
        </div>

        {/* Calories burned input (#11) */}
        <GlassPanel className="p-4 flex items-center gap-4" style={{ borderRadius: '1rem' }}>
          <Flame size={18} style={{ color: C.tertiary }} />
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.outline }}>Calories Burned</label>
            <input type="number" placeholder="Estimate…" value={caloriesInput} onChange={e => setCaloriesInput(e.target.value)}
              style={{ ...inputStyle, textAlign: 'left', width: '100%', padding: '0.4rem 0' }} />
          </div>
        </GlassPanel>

        <button onClick={finishSession}
          className="w-full py-4 rounded-2xl font-extrabold uppercase tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'rgba(53,53,52,0.6)', border: `1px solid ${C.outlineV}`, color: C.secondary,
            fontFamily: "'Manrope', system-ui", boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          Finish Workout
        </button>
      </div>
    );
  }

  /* ─── Workout detail view (#42) ──────────────────────── */
  if (detailLog) {
    return (
      <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>
        <button onClick={() => setDetailLog(null)} className="flex items-center gap-1 text-sm" style={{ color: C.primary }}>
          <ChevronLeft size={16} /> Back to Workouts
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.outline }}>{detailLog.date}</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: "'Manrope', system-ui" }}>
            Workout Details
          </h1>
          <p className="text-sm mt-1" style={{ color: C.onSurfaceV }}>
            {detailLog.duration || 0} min{detailLog.caloriesBurned > 0 ? ` · ${detailLog.caloriesBurned} kcal` : ''}
          </p>
        </div>
        {(detailLog.exercises || []).map((ex, i) => (
          <GlassPanel key={i} className="p-5" style={{ borderRadius: '1rem' }}>
            <h3 className="font-bold text-lg mb-3" style={{ fontFamily: "'Manrope', system-ui" }}>{ex.name}</h3>
            {(ex.sets || []).length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 px-2 mb-1">
                  {['Set', 'Weight', 'Reps'].map(h => (
                    <span key={h} className="text-[10px] uppercase tracking-widest font-bold text-center" style={{ color: C.outline }}>{h}</span>
                  ))}
                </div>
                {ex.sets.map((s, j) => (
                  <div key={j} className="grid grid-cols-3 gap-2 p-2 rounded-lg" style={{ background: 'rgba(14,14,14,0.5)' }}>
                    <span className="text-center font-bold text-sm" style={{ color: C.primary }}>{j + 1}</span>
                    <span className="text-center text-sm" style={{ color: C.onSurface }}>{s.weight} kg</span>
                    <span className="text-center text-sm" style={{ color: C.onSurface }}>{s.reps} reps</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.outline }}>No set data recorded</p>
            )}
          </GlassPanel>
        ))}
      </div>
    );
  }

  /* ─── Template browser view ──────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', system-ui" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: C.primaryC }}>ALL TEMPLATES</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-0.5" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>Workouts</h1>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="size-12 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', boxShadow: '0 8px 24px rgba(75,142,255,0.35)' }}>
          <Plus size={22} color="#00285c" strokeWidth={3} />
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search size={18} color={C.outline} /></div>
        <input type="text" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl outline-none text-sm"
          style={{ background: C.surfaceLowest, color: C.onSurface, border: 'none' }} />
      </div>

      <button onClick={() => setModalOpen(true)}
        className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #adc6ff, #4b8eff)', color: '#00285c', boxShadow: '0 6px 24px rgba(75,142,255,0.3)', fontFamily: "'Manrope', system-ui" }}>
        <Plus size={20} /> Create Custom Workout Plans
      </button>

      {templatesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState icon={Dumbbell} title="No Templates Yet" subtitle="Create your first workout template to get started." />
      ) : (
        <div className="space-y-4 stagger-children">
          {filteredTemplates.map(template => (
            <GlassPanel key={template.id} className="p-5 group" style={{ borderRadius: '1rem' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>{template.name}</h3>
                  {template.description && <p className="text-sm mt-0.5 truncate" style={{ color: C.onSurfaceV }}>{template.description}</p>}
                  <p className="text-xs mt-2 font-semibold uppercase tracking-widest" style={{ color: C.secondary }}>{template.exercises?.length || 0} exercises</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {/* #28 — always visible on mobile */}
                  <button onClick={() => deleteTemplate(template.id)}
                    className="p-1.5 rounded-lg transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                    style={{ color: '#ffb4ab' }}>
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => startSession(template)}
                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
                    style={{ background: 'rgba(75,142,255,0.15)', color: C.primary, border: '1px solid rgba(75,142,255,0.2)', fontFamily: "'Manrope', system-ui" }}>
                    Start
                  </button>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* Recent logs with date filter (#16) */}
      {logs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: C.outline }}>RECENT SESSIONS</p>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="text-xs rounded-lg px-2 py-1 outline-none"
              style={{ background: C.surfaceHigh, color: C.onSurface, border: 'none' }} />
          </div>
          <div className="space-y-3">
            {filteredLogs.slice(0, 5).map(log => (
              <div key={log.id} onClick={() => setDetailLog(log)}
                className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(32,31,31,0.7)', border: '1px solid rgba(65,71,85,0.2)' }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.onSurface }}>
                    {log.exercises?.[0]?.name || 'Workout'}
                  </p>
                  <p className="text-xs" style={{ color: C.outline }}>
                    {log.date} · {log.duration || 0} min
                    {log.caloriesBurned > 0 && ` · ${log.caloriesBurned} kcal`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: C.secondary }}>{log.exercises?.length || 0} exercises</span>
                  <ChevronRight size={16} style={{ color: C.outline }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddWorkoutTemplateModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={async (data) => { await createTemplate(data); setModalOpen(false); }} />
    </div>
  );
}
