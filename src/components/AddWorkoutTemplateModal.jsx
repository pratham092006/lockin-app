import React, { useState } from 'react';
import Modal from './Modal';
import { Plus, Trash2 } from 'lucide-react';

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
  transition: 'all 0.2s',
};

const smallInputStyle = { ...inputStyle, textAlign: 'center', padding: '0.5rem 0.5rem' };

export default function AddWorkoutTemplateModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: 10, weight: 0 }]);
  const [loading, setLoading] = useState(false);

  const addExercise = () => setExercises(p => [...p, { name: '', sets: 3, reps: 10, weight: 0 }]);
  const removeExercise = (i) => setExercises(p => p.filter((_, idx) => idx !== i));
  const updateExercise = (i, field, value) => setExercises(p => p.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || exercises.every(ex => !ex.name.trim())) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(), description: description.trim(),
        exercises: exercises.filter(ex => ex.name.trim()).map(ex => ({
          name: ex.name.trim(), sets: Number(ex.sets) || 3, reps: Number(ex.reps) || 10, weight: Number(ex.weight) || 0,
        })),
      });
      setName(''); setDescription(''); setExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
      onClose();
    } catch (err) { console.error('Failed to create template', err); }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Workout Template" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">
            Template Name <span className="text-red-400">*</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" autoFocus style={inputStyle} className="focus:border-[#00FFFF] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] placeholder:text-white/20" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional…" style={inputStyle} className="focus:border-[#00FFFF] placeholder:text-white/20" />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Exercises</label>
          {exercises.map((ex, i) => (
            <div key={i} className="p-4 rounded-2xl space-y-3 bg-white/5 border border-white/5 shadow-inner">
              <div className="flex gap-2 items-center">
                <input value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)}
                  placeholder="Exercise name" style={{ ...inputStyle, flex: 1 }} className="focus:border-[#00FFFF] placeholder:text-white/20 font-bold" />
                {exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(i)}
                    className="p-3 rounded-xl transition-all hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-transparent hover:border-red-500/30">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ k: 'sets', l: 'Sets' }, { k: 'reps', l: 'Reps' }, { k: 'weight', l: 'kg' }].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] font-bold uppercase tracking-widest block text-center mb-1 text-white/50">{f.l}</label>
                    <input type="number" min={f.k === 'weight' ? 0 : 1} value={ex[f.k]}
                      onChange={(e) => updateExercise(i, f.k, e.target.value)} style={smallInputStyle} className="focus:border-[#00FFFF] font-bold" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={addExercise}
            className="w-full py-3.5 mt-2 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white/10 hover:border-white/40 text-white/60 border border-dashed border-white/20">
            <Plus size={16} strokeWidth={2.5} /> Add Exercise
          </button>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 text-white/70 hover:bg-white/10">
            Cancel
          </button>
          <button type="submit" disabled={loading || !name.trim()}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 lv-btn-primary hover:scale-[1.02] active:scale-[0.98]">
            {loading ? 'Creating…' : 'Create Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
