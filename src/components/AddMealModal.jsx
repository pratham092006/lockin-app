import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Modal from './Modal';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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

export default function AddMealModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', mealType: 'Lunch', calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(false);

  // ── Food search ──────────────────────────────────────────────────────
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
    <Modal isOpen={isOpen} onClose={onClose} title="Log a Meal">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Food Name + Search */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
            Food Name <span className="text-red-400">*</span>
          </label>
          <div className="relative border border-white/10 rounded-xl overflow-visible">
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Search or type food name…" autoFocus style={inputStyle}
              className="focus:border-[#00FFFF] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] placeholder:text-white/20 border-none m-0" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {searching ? <Loader2 size={16} className="animate-spin text-[#00FFFF]" /> : <Search size={16} className="text-white/30" />}
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-3xl glass-panel"
              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {searchResults.map((food, i) => (
                <button key={i} type="button" onClick={() => selectFood(food)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center hover:bg-white/10"
                  style={{ color: '#FFFFFF', borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="font-bold truncate flex-1 font-header">{food.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest shrink-0 ml-3 px-2 py-1 rounded-md text-[#CCFF00] bg-[#CCFF00]/10 mono-data">{food.calories} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meal Type Pills */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Meal Type</label>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('mealType', t)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all border mono-data"
                style={{
                  borderColor: form.mealType === t ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  background: form.mealType === t ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                  color: form.mealType === t ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                  boxShadow: form.mealType === t ? '0 0 12px rgba(0,255,255,0.2)' : 'none'
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
            Calories <span className="text-red-400">*</span>
          </label>
          <input name="calories" type="number" min="0" value={form.calories}
            onChange={(e) => set('calories', e.target.value)} placeholder="350" style={inputStyle} className="focus:border-[#CCFF00] placeholder:text-white/20 font-black text-lg" />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'protein', label: 'Protein', ph: '25', color: '#CCFF00' },
            { key: 'carbs', label: 'Carbs', ph: '40', color: '#00FFFF' },
            { key: 'fats', label: 'Fats', ph: '12', color: '#A855F7' }].map(m => (
            <div key={m.key} className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest block text-center" style={{ color: m.color }}>{m.label}</label>
              <input type="number" min="0" value={form[m.key]}
                onChange={(e) => set(m.key, e.target.value)} placeholder={m.ph} style={{ ...inputStyle, textAlign: 'center' }} className={`placeholder:text-white/20 font-bold focus:border-[${m.color}]`} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-white/10 mt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 text-white/70 hover:bg-white/10">
            Cancel
          </button>
          <button type="submit" disabled={loading || !form.name.trim() || !form.calories}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 lv-btn-primary hover:scale-[1.02] active:scale-[0.98]">
            {loading ? 'Saving…' : 'Log Meal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
