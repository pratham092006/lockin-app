// ─── GlassPanel — shared glassmorphism container (#50) ────────────────────────
import React from 'react';

export default function GlassPanel({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[2rem] ${className}`}
      style={{
        background: 'rgba(42,42,42,0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(65,71,85,0.15)',
        borderLeft: '1px solid rgba(65,71,85,0.15)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── EmptyState — standardized empty state pattern (#31) ──────────────────────
export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <GlassPanel className="p-12 flex flex-col items-center text-center">
      {Icon && (
        <div
          className="size-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(42,42,42,0.6)' }}
        >
          <Icon size={28} color="#8b90a0" />
        </div>
      )}
      <p className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui" }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-sm mt-1" style={{ color: '#8b90a0' }}>
          {subtitle}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4b8eff, #42e355)',
            color: '#0e0e0e',
            fontFamily: "'Manrope', system-ui",
          }}
        >
          {action}
        </button>
      )}
    </GlassPanel>
  );
}
