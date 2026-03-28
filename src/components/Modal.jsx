// ─── Dark‑themed Modal (#53) ──────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

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
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', pointerEvents: 'none' }} />

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
            className="relative w-full animate-fade-in-scale rounded-3xl shadow-2xl"
            style={{
              maxWidth: maxW,
              background: 'rgba(28,27,27,0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(65,71,85,0.25)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl"
              style={{ borderBottom: '1px solid rgba(65,71,85,0.2)', background: 'rgba(28,27,27,0.98)' }}>
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Manrope', system-ui", color: '#e5e2e1' }}>
                {title}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#8b90a0' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
