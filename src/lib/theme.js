/**
 * LockIn Design System - Core Tokens
 * 
 * Clean, Minimalist Dark Mode:
 * - Style: Solid / Subtle Borders
 * - Primary: White / High Contrast
 * - Background: Deep Charcoal (#0c0c0c)
 */

export const THEME = {
  colors: {
    background: '#0c0c0c',
    surface: '#141414',
    border: 'rgba(255, 255, 255, 0.05)',
    
    // Core Brand
    primary: '#FFFFFF',
    secondary: '#CCFF00', // Electric Lime (Subtle accent)
    
    // Accents
    purple: '#A855F7',
    pink: '#EC4899',
    
    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textMuted: 'rgba(255, 255, 255, 0.3)',
  },
  
  gradients: {
    dark: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
    habit: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  },
  
  typography: {
    display: "'Manrope', system-ui, sans-serif",
    header: "'Manrope', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  
  effects: {
    subtleShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    borderGlow: '0 0 0 1px rgba(255, 255, 255, 0.05)',
  }
};

// Simplified common class utility
export const glassClasses = "bg-[#141414] border border-white/5 rounded-[24px] shadow-2xl overflow-hidden";
