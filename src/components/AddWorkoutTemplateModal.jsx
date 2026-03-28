// ─── Dark‑themed AddWorkoutTemplateModal (#18) ────────────────────────────────
import React, { useState } from 'react';
import Modal from './Modal';
import { Plus, Trash2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  background: 'rgba(14,14,14,0.8)',
  border: '1px solid rgba(65,71,85,0.4)',
  borderRadius: '0.75rem',
  padding: '0.65rem 1rem',
  color: '#e5e2e1',
  fontFamily: "'Inter', system-ui",
  fontSize: '0.875rem',
  outline: 'none',
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
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
            Template Name <span style={{ color: '#ffb4ab' }}>*</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" autoFocus style={inputStyle} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional…" style={inputStyle} />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>Exercises</label>
          {exercises.map((ex, i) => (
            <div key={i} className="p-4 rounded-xl space-y-3"
              style={{ background: 'rgba(14,14,14,0.5)', border: '1px solid rgba(65,71,85,0.2)' }}>
              <div className="flex gap-2 items-center">
                <input value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)}
                  placeholder="Exercise name" style={{ ...inputStyle, flex: 1 }} />
                {exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(i)}
                    className="p-1.5 rounded-lg transition-all" style={{ color: '#ffb4ab' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ k: 'sets', l: 'Sets' }, { k: 'reps', l: 'Reps' }, { k: 'weight', l: 'kg' }].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#8b90a0' }}>{f.l}</label>
                    <input type="number" min={f.k === 'weight' ? 0 : 1} value={ex[f.k]}
                      onChange={(e) => updateExercise(i, f.k, e.target.value)} style={smallInputStyle} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={addExercise}
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{ border: '2px dashed rgba(65,71,85,0.4)', color: '#8b90a0', fontFamily: "'Manrope', system-ui" }}>
            <Plus size={16} /> Add Exercise
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(65,71,85,0.4)', color: '#8b90a0', fontFamily: "'Manrope', system-ui" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !name.trim()}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#001a41', fontFamily: "'Manrope', system-ui", boxShadow: '0 4px 16px rgba(75,142,255,0.3)' }}>
            {loading ? 'Creating…' : 'Create Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
