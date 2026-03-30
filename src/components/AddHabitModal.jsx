import React, { useState } from 'react';
import Modal from './Modal';

const COLORS = ['#CCFF00', '#00FFFF', '#8B5CF6', '#F43F5E', '#EC4899', '#0ea5e9', '#14B8A6', '#F59E0B'];

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

export default function AddHabitModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#CCFF00' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: form.name.trim(), description: form.description.trim(), color: form.color });
      setForm({ name: '', description: '', color: '#CCFF00' });
      onClose();
    } catch (err) { console.error('Failed to create habit', err); }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Habit">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">
            Habit Name <span className="text-red-400">*</span>
          </label>
          <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Drink 8 glasses of water" autoFocus style={inputStyle} className="focus:border-[#CCFF00] focus:shadow-[0_0_8px_rgba(204,255,0,0.3)] placeholder:text-white/20" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Optional description…" rows={2}
            style={{ ...inputStyle, resize: 'none' }} className="focus:border-[#00FFFF] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] placeholder:text-white/20" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-widest block mb-2 text-white/50">Color Tag</label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map(color => (
              <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                className="size-10 rounded-full transition-all flex items-center justify-center shadow-sm"
                style={{
                  background: color,
                  border: form.color === color ? `3px solid #121212` : '2px solid transparent',
                  transform: form.color === color ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: form.color === color ? `0 0 0 2px ${color}, 0 0 16px ${color}80` : 'none',
                }} />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-2xl shadow-sm border mt-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold mb-3 text-white/50">Preview</p>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-3 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="size-10 rounded-xl shrink-0 flex items-center justify-center border" style={{ background: `${form.color}20`, borderColor: `${form.color}50` }}>
              <div className="size-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ background: form.color }} />
            </div>
            <span className="font-bold text-sm text-white font-header tracking-wide">
              {form.name || 'Your habit name'}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-white/10">
          <button type="button" onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all border shadow-sm text-white/70 bg-white/5 border-white/10 hover:bg-white/10 font-header tracking-wide">
            Cancel
          </button>
          <button type="submit" disabled={loading || !form.name.trim()}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 lv-btn-primary hover:scale-[1.02] active:scale-[0.98] font-header tracking-wide uppercase">
            {loading ? 'Creating…' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
