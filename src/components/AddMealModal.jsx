// ─── Dark‑themed AddMealModal (#6/#17) ────────────────────────────────────────
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Modal from './Modal';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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

export default function AddMealModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', mealType: 'Lunch', calories: '', protein: '', carbs: '', fats: '' });
  const [loading, setLoading] = useState(false);

  // ── Food search (#45) ──────────────────────────────────────────────────────
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
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
            Food Name <span style={{ color: '#ffb4ab' }}>*</span>
          </label>
          <div className="relative">
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Search or type food name…" autoFocus style={inputStyle} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {searching ? <Loader2 size={16} className="animate-spin" style={{ color: '#8b90a0' }} /> : <Search size={16} style={{ color: '#8b90a0' }} />}
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(65,71,85,0.3)' }}>
              {searchResults.map((food, i) => (
                <button key={i} type="button" onClick={() => selectFood(food)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors flex justify-between"
                  style={{ color: '#e5e2e1', borderBottom: '1px solid rgba(65,71,85,0.15)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75,142,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span className="font-medium truncate flex-1">{food.name}</span>
                  <span className="text-xs shrink-0 ml-3" style={{ color: '#42e355' }}>{food.calories} kcal/100g</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meal Type Pills */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>Meal Type</label>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('mealType', t)}
                className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                style={{
                  border: `1px solid ${form.mealType === t ? '#4b8eff' : 'rgba(65,71,85,0.4)'}`,
                  background: form.mealType === t ? 'rgba(75,142,255,0.12)' : 'transparent',
                  color: form.mealType === t ? '#adc6ff' : '#8b90a0',
                  fontFamily: "'Manrope', system-ui",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
            Calories <span style={{ color: '#ffb4ab' }}>*</span>
          </label>
          <input name="calories" type="number" min="0" value={form.calories}
            onChange={(e) => set('calories', e.target.value)} placeholder="350" style={inputStyle} />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'protein', label: 'Protein', ph: '25', color: '#42e355' },
            { key: 'carbs', label: 'Carbs', ph: '40', color: '#adc6ff' },
            { key: 'fats', label: 'Fats', ph: '12', color: '#ffb595' }].map(m => (
            <div key={m.key} className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: m.color }}>{m.label} (g)</label>
              <input type="number" min="0" value={form[m.key]}
                onChange={(e) => set(m.key, e.target.value)} placeholder={m.ph} style={{ ...inputStyle, textAlign: 'center' }} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(65,71,85,0.4)', color: '#8b90a0', fontFamily: "'Manrope', system-ui" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading || !form.name.trim() || !form.calories}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#001a41', fontFamily: "'Manrope', system-ui", boxShadow: '0 4px 16px rgba(75,142,255,0.3)' }}>
            {loading ? 'Saving…' : 'Log Meal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
