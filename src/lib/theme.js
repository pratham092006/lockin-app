// ─── AuraFit Premium Dark Mode Design System ──────────────────────────────────
// Note: We are phasing out these JS constants in favor of Tailwind CSS variables.
// They are retained here to prevent the UI from breaking during the migration.
export const C = {
  bg:          '#121212',
  surfaceLowest:'rgba(255,255,255,0.02)',
  surfaceLow:  'rgba(255,255,255,0.03)',
  surfaceCont: 'rgba(255,255,255,0.05)',
  surfaceHigh: 'rgba(255,255,255,0.08)',
  surfaceHighest:'rgba(255,255,255,0.1)',
  
  onSurface:   '#F8F9FA',
  onSurfaceV:  'rgba(255,255,255,0.6)', // deeper gray for contrast
  outline:     'rgba(255,255,255,0.1)',
  outlineV:    'rgba(255,255,255,0.05)',
  
  // Neon Cyan
  primary:     '#00FFFF',
  primaryC:    '#00FFFF', 
  
  // Electric Lime
  secondary:   '#CCFF00',
  secondaryC:  '#CCFF00',
  
  // Purple/Pink Heatmap vibe
  tertiary:    '#A855F7',
  tertiaryC:   '#A855F7',
  
  // Action/Error
  coral:       '#EC4899', // Pinkish red for errors
  coralC:      '#EC4899',
  
  error:       '#EF4444',
  errorC:      '#EF4444',
};

export const glassBorder = {
  borderTop:  '1px solid rgba(255,255,255,0.08)',
  borderLeft: '1px solid rgba(255,255,255,0.08)',
};
