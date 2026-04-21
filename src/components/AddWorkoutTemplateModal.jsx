import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Plus, Trash2, Dumbbell, ClipboardList, Target } from 'lucide-react';

export default function AddWorkoutTemplateModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: 10, weight: 0 }]);
  const [loading, setLoading] = useState(false);

  const addExercise = () => setExercises(p => [...p, { name: '', sets: 3, reps: 10, weight: 0 }]);
  const removeExercise = (i) => setExercises(p => p.filter((_, idx) => idx !== i));
  const updateExercise = (i, field, value) => {
    setExercises(p => p.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || exercises.every(ex => !ex.name.trim())) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(), 
        description: description.trim(),
        exercises: exercises.filter(ex => ex.name.trim()).map(ex => ({
          name: ex.name.trim(), 
          sets: Number(ex.sets) || 3, 
          reps: Number(ex.reps) || 10, 
          weight: Number(ex.weight) || 0,
        })),
      });
      setName(''); 
      setDescription(''); 
      setExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
      onClose();
    } catch (err) { 
      console.error('Failed to create routine', err); 
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Routine" size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Routine Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-cyan-400" />
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Routine Name</label>
            </div>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Upper Body" 
              autoFocus 
              className="h-14 font-bold tracking-tight text-xl"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList size={14} className="text-purple-400" />
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Description</label>
            </div>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="e.g. Focus on chest and back" 
              className="h-14 opacity-60"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} className="text-lime-400" />
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Exercises</label>
            </div>
            <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{exercises.length} TOTAL</span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {exercises.map((ex, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative"
                >
                  <div className="flex gap-4 items-center mb-4">
                    <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/30">
                       {i + 1}
                    </div>
                    <Input 
                      value={ex.name} 
                      onChange={(e) => updateExercise(i, 'name', e.target.value)}
                      placeholder="Exercise name" 
                      className="border-none bg-transparent focus:bg-white/5 h-12 font-bold"
                    />
                    {exercises.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeExercise(i)}
                        className="size-10 rounded-xl flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pl-12">
                    {[
                      { k: 'sets', l: 'SETS' }, 
                      { k: 'reps', l: 'REPS' }, 
                      { k: 'weight', l: 'KG' }
                    ].map(f => (
                      <div key={f.k} className="space-y-1">
                        <label className="text-[8px] font-bold tracking-widest uppercase text-white/20">{f.l}</label>
                        <Input 
                          type="number" 
                          min={f.k === 'weight' ? 0 : 1} 
                          value={ex[f.k]}
                          onChange={(e) => updateExercise(i, f.k, e.target.value)} 
                          className="h-10 text-center font-bold bg-black/20 border-white/5" 
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button 
            type="button" 
            onClick={addExercise}
            className="w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-white/[0.02] border border-dashed border-white/10 text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/20 transition-all"
          >
            <Plus size={18} /> Add Exercise
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-white/5">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-16 rounded-2xl font-bold uppercase text-xs tracking-widest text-white/40"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !name.trim()}
            className="flex-1 h-16 rounded-2xl font-bold uppercase text-xs tracking-widest bg-white text-black hover:bg-white/90"
          >
            {loading ? 'Creating...' : 'Create Routine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
