// ─── Mifflin-St Jeor TDEE Calculator (#52) ────────────────────────────────────
export function calculateTDEE({ age, gender, height, weight, activityLevel }) {
  let bmr = gender === 'female'
    ? (10 * weight) + (6.25 * height) - (5 * age) - 161
    : (10 * weight) + (6.25 * height) - (5 * age) + 5;
  return Math.round(bmr * activityLevel);
}

export const ACTIVITY_LEVELS = [
  { value: 1.2,   label: 'Sedentary',         desc: 'Desk job, little movement',   icon: '🪑' },
  { value: 1.375, label: 'Lightly Active',     desc: '1–3 workouts/week',           icon: '🚶' },
  { value: 1.55,  label: 'Moderately Active',  desc: '3–5 workouts/week',           icon: '🏃' },
  { value: 1.725, label: 'Very Active',        desc: '6–7 workouts/week',           icon: '💪' },
  { value: 1.9,   label: 'Athlete',            desc: 'Twice-daily training',        icon: '🏋️' },
];

export const GOALS = [
  { value: 'lose',     label: 'Lose Weight',    modifier: -500, icon: '📉', color: '#42e355' },
  { value: 'maintain', label: 'Stay Lean',      modifier: 0,    icon: '⚖️', color: '#adc6ff' },
  { value: 'gain',     label: 'Build Muscle',   modifier: 300,  icon: '💪', color: '#ffb595' },
];
