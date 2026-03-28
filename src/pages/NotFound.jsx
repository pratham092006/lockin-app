import React from 'react';
import { Link } from 'react-router-dom';
import { C } from '../lib/theme';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: C.bg, color: C.onSurface, fontFamily: "'Inter', system-ui" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 40%, rgba(0,122,255,0.08) 0%, transparent 50%),radial-gradient(circle at 70% 60%, rgba(66,227,85,0.04) 0%, transparent 50%)' }} />
      <div className="relative z-10 text-center p-8 rounded-3xl"
        style={{ background: 'rgba(42,42,42,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(65,71,85,0.2)', maxWidth: '28rem' }}>
        <div className="text-7xl mb-4">🧭</div>
        <h1 className="text-5xl font-black mb-2"
          style={{ fontFamily: "'Manrope', system-ui", background: 'linear-gradient(135deg, #adc6ff, #4b8eff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>
        <p className="text-lg font-semibold mb-1" style={{ fontFamily: "'Manrope', system-ui" }}>Page Not Found</p>
        <p className="text-sm mb-6" style={{ color: C.outline }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#001a41', fontFamily: "'Manrope', system-ui", boxShadow: '0 4px 20px rgba(75,142,255,0.35)' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
