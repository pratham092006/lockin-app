// ─── Error Boundary (#38) ─────────────────────────────────────────────────────
import React from 'react';
import { C } from '../lib/theme';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ background: C.bg, color: C.onSurface, fontFamily: "'Inter', system-ui" }}>
          <div className="text-6xl mb-6">😵</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Manrope', system-ui" }}>
            Something went wrong
          </h1>
          <p className="text-sm mb-6 text-center max-w-md" style={{ color: C.outline }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <pre className="text-xs mb-6 p-4 rounded-xl max-w-lg overflow-auto"
            style={{ background: 'rgba(14,14,14,0.8)', color: C.error, border: '1px solid rgba(147,0,10,0.3)' }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4b8eff, #adc6ff)', color: '#001a41', fontFamily: "'Manrope', system-ui" }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
