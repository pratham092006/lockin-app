import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => { 
      document.removeEventListener('keydown', onEsc); 
      document.body.style.overflow = ''; 
    };
  }, [isOpen, onClose]);

  const maxW = { 
    sm: 'max-w-md', 
    md: 'max-w-lg', 
    lg: 'max-w-2xl', 
    xl: 'max-w-4xl' 
  }[size] || 'max-w-lg';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full z-10 overflow-hidden",
              "bg-[#121212]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.5)]",
              maxW
            )}
          >
            {/* Decorative background glow */}
            <div className="absolute -top-24 -right-24 size-48 bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-24 -left-24 size-48 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative z-10">
              <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white">
                {title}
              </h2>
              <button 
                onClick={onClose} 
                className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-8 text-white/70 relative z-10 custom-scrollbar max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
