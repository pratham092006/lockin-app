import React, { useState } from 'react';
import Modal from './Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { Sparkles, Target, Palette } from 'lucide-react';

const COLORS = ['#CCFF00', '#00FFFF', '#8B5CF6', '#F43F5E', '#EC4899', '#0ea5e9', '#14B8A6', '#F59E0B'];

export default function AddHabitModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#CCFF00' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ 
        name: form.name.trim(), 
        description: form.description.trim(), 
        color: form.color 
      });
      setForm({ name: '', description: '', color: '#CCFF00' });
      onClose();
    } catch (err) { 
      console.error('Failed to create habit', err); 
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Protocol">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Habit Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-cyan-400" />
            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
              Protocol Identity
            </label>
          </div>
          <Input 
            value={form.name} 
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. MORNING HYDRATION" 
            autoFocus 
            className="h-14 text-lg font-black font-display uppercase tracking-tight placeholder:text-white/5"
          />
          <textarea 
            value={form.description} 
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Define optimization objective..." 
            rows={2}
            className={cn(
              "w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-white outline-none transition-all",
              "focus:border-cyan-500/50 focus:bg-white/[0.05] placeholder:text-white/10 resize-none"
            )}
          />
        </div>

        {/* Neural Tag / Color */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={14} className="text-purple-400" />
            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">
              Neural Signature
            </label>
          </div>
          <div className="flex gap-3 flex-wrap p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            {COLORS.map(color => (
              <button 
                key={color} 
                type="button" 
                onClick={() => setForm(f => ({ ...f, color }))}
                className={cn(
                  "size-10 rounded-xl transition-all duration-300 relative",
                  form.color === color ? "scale-110 shadow-lg" : "opacity-40 hover:opacity-100 scale-90"
                )}
                style={{ background: color }}
              >
                {form.color === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-2 rounded-full bg-black/40" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Preview */}
        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
             <Sparkles size={12} className="text-white/10" />
          </div>
          <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-4 text-white/20">Protocol Preview</p>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div 
              className="size-12 rounded-2xl shrink-0 flex items-center justify-center border transition-all duration-500" 
              style={{ background: `${form.color}15`, borderColor: `${form.color}30` }}
            >
              <div 
                className="size-4 rounded-full shadow-lg" 
                style={{ background: form.color, boxShadow: `0 0 15px ${form.color}80` }} 
              />
            </div>
            <div className="min-w-0">
               <span className="font-black text-xl text-white font-display tracking-tight uppercase leading-none block truncate">
                {form.name || 'Protocol.alpha'}
              </span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1 block">READY FOR SYNC</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="glass" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest text-white/40"
          >
            Abort
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !form.name.trim()}
            glow
            className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest"
          >
            {loading ? 'Initializing...' : 'Confirm Sync'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
