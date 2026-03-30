import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { C } from '../lib/theme';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  // Close when clicking outside the card
  const handleOverlayClick = useCallback((e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const maxW = { sm: '28rem', md: '32rem', lg: '42rem', xl: '56rem' }[size] || '32rem';

  return (
    <div className="fixed inset-0 z-50" style={{ isolation: 'isolate' }}>
      {/* Backdrop blur layer (non-interactive) */}
      <div className="fixed inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', pointerEvents: 'none' }} />

      {/* Scrollable overlay — handles both scrolling and click-outside */}
      <div
        className="fixed inset-0 overflow-y-auto overscroll-contain z-10"
        onClick={handleOverlayClick}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Centering wrapper — min-height + flex so card is centered when short, scrollable when tall */}
        <div
          className="flex items-center justify-center px-4"
          style={{ minHeight: '100%', padding: '2rem 1rem' }}
        >
          {/* Card */}
          <div
            ref={cardRef}
            className="relative w-full animate-fade-in-scale rounded-3xl shadow-2xl glass-panel"
            style={{
              maxWidth: maxW,
              background: 'rgba(30,30,30,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-lg font-bold font-header text-white">
                {title}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-white/10 text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 text-white/80">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
