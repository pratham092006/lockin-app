// ─── Dark‑themed AddHabitModal (#19) ──────────────────────────────────────────
import React, { useState } from 'react';
import Modal from './Modal';

const COLORS = ['#42e355', '#4b8eff', '#ffb595', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'];

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

export default function AddHabitModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#42e355' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: form.name.trim(), description: form.description.trim(), color: form.color });
      setForm({ name: '', description: '', color: '#42e355' });
      onClose();
    } catch (err) { console.error('Failed to create habit', err); }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Habit">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
            Habit Name <span style={{ color: '#ffb4ab' }}>*</span>
          </label>
          <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Drink 8 glasses of water" autoFocus style={inputStyle} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…" rows={2}
            style={{ ...inputStyle, resize: 'none' }} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>Color Tag</label>
          <div className="flex gap-2.5 flex-wrap">
            {COLORS.map(color => (
              <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                className="size-8 rounded-full transition-all"
                style={{
                  background: color,
                  border: form.color === color ? '3px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                  transform: form.color === color ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: form.color === color ? `0 0 12px ${color}55` : 'none',
                }} />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(14,14,14,0.6)', border: '1px solid rgba(65,71,85,0.2)' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: '#8b90a0' }}>Preview</p>
          <div className="flex items-center gap-3">
            <div className="size-4 rounded-full shrink-0" style={{ background: form.color }} />
            <span className="font-semibold text-sm" style={{ color: '#e5e2e1' }}>
              {form.name || 'Your habit name'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(65,71,85,0.4)', color: '#8b90a0', fontFamily: "'Manrope', system-ui" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !form.name.trim()}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4b8eff, #42e355)', color: '#0e0e0e', fontFamily: "'Manrope', system-ui" }}>
            {loading ? 'Creating…' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
