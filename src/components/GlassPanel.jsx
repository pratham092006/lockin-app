import React from 'react';
import { C } from '../lib/theme';

export default function GlassPanel({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <GlassPanel className="p-12 flex flex-col items-center text-center">
      {Icon && (
        <div
          className="size-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          <Icon size={28} style={{ color: C.outline }} />
        </div>
      )}
      <p className="font-bold text-lg" style={{ fontFamily: "'Manrope', system-ui", color: C.onSurface }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-sm mt-1" style={{ color: C.outline }}>
          {subtitle}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-6 lv-btn-primary"
        >
          {action}
        </button>
      )}
    </GlassPanel>
  );
}
