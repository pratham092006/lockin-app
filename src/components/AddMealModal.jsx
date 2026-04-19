import React, { useState } from 'react';
import { Search, Loader2, Utensils, Flame, Zap, PieChart, Activity } from 'lucide-react';
import Modal from './Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = [
  { id: 'Breakfast', icon: <Activity size={12} /> },
  { id: 'Lunch', icon: <Utensils size={12} /> },
  { id: 'Dinner', icon: <Utensils size={12} /> },
  { id: 'Snack', icon: <Activity size={12} /> }
];

export default function AddMealModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', mealType: 'Lunch', calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(false);

  // ── Food search logic ──────────────────────────────────────────────────
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchFood = async (query) => {
    if (query.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5`);
      const data = await res.json();
      setSearchResults((data.products || []).map(p => ({
        name: p.product_name || 'Unknown',
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round(p.nutriments?.proteins_100g || 0),
        carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
        fats: Math.round(p.nutriments?.fat_100g || 0),
      })).filter(p => p.name && p.name !== 'Unknown'));
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const handleNameChange = (val) => {
    setForm(prev => ({ ...prev, name: val }));
    clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => searchFood(val), 400));
  };

  const selectFood = (food) => {
    setForm(prev => ({ ...prev, name: food.name, calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fats: String(food.fats) }));
    setSearchResults([]);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.calories) return;
    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(), mealType: form.mealType,
        calories: Number(form.calories) || 0, protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0, fats: Number(form.fats) || 0,
      });
      setForm({ name: '', mealType: 'Lunch', calories: '', protein: '', carbs: '', fats: '' });
      onClose();
    } catch (err) { console.error('Failed to log meal', err); }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Meal">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Food Search Section */}
        <div className="space-y-4 relative">
          <div className="flex items-center gap-2 mb-2">
            <Search size={14} className="text-cyan-400" />
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Food Search
            </label>
          </div>
          <div className="relative group">
            <Input 
              value={form.name} 
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Search for food..." 
              autoFocus 
              className="h-14 pr-12 text-lg font-bold tracking-tight placeholder:text-white/10"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {searching ? (
                <Loader2 size={18} className="animate-spin text-cyan-400" />
              ) : (
                <Search size={18} className="text-white/10 group-focus-within:text-cyan-400/50 transition-colors" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-full mt-3 z-50 rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-2xl p-1"
              >
                {searchResults.map((food, i) => (
                  <button 
                    key={i} 
                    type="button" 
                    onClick={() => selectFood(food)}
                    className="w-full text-left px-5 py-4 rounded-xl transition-all flex justify-between items-center hover:bg-white/5 group/item"
                  >
                    <span className="font-bold text-sm text-white/80 group-hover/item:text-white truncate flex-1">{food.name}</span>
                    <span className="text-[10px] font-bold tracking-widest shrink-0 ml-4 px-2.5 py-1 rounded-lg text-lime-400 bg-lime-400/10 border border-lime-400/20">
                      {food.calories} kcal
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Meal Type */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Meal Time</label>
          <div className="flex gap-2">
            {MEAL_TYPES.map(t => (
              <button 
                key={t.id} 
                type="button" 
                onClick={() => set('mealType', t.id)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-2 h-16 rounded-2xl transition-all duration-300 border font-bold uppercase text-[9px] tracking-widest",
                  form.mealType === t.id 
                    ? "bg-white text-black border-transparent" 
                    : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white/40 hover:bg-white/[0.04]"
                )}
              >
                {t.icon}
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Calories</label>
            </div>
            <Input 
              name="calories" 
              type="number" 
              min="0" 
              value={form.calories}
              onChange={(e) => set('calories', e.target.value)} 
              placeholder="0 kcal" 
              className="h-14 font-bold text-2xl text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-widest text-lime-400/70 text-center block">PRO</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.protein}
                  onChange={(e) => set('protein', e.target.value)} 
                  placeholder="0" 
                  className="h-14 text-center font-bold"
                />
             </div>
             <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/70 text-center block">CHO</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.carbs}
                  onChange={(e) => set('carbs', e.target.value)} 
                  placeholder="0" 
                  className="h-14 text-center font-bold"
                />
             </div>
             <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-widest text-rose-400/70 text-center block">FAT</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={form.fats}
                  onChange={(e) => set('fats', e.target.value)} 
                  placeholder="0" 
                  className="h-14 text-center font-bold"
                />
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-bold uppercase text-xs tracking-widest text-white/40"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !form.name.trim() || !form.calories}
            className="flex-1 h-14 rounded-2xl font-bold uppercase text-xs tracking-widest bg-white text-black hover:bg-white/90"
          >
            {loading ? 'Logging...' : 'Log Meal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
