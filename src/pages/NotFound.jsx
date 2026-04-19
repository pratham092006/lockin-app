import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, WifiOff, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] size-[500px] bg-white/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] size-[500px] bg-white/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
           
           <div className="flex justify-center mb-10">
              <div className="size-24 rounded-[32px] flex items-center justify-center bg-white/5 text-white/40 border border-white/10">
                 <WifiOff size={40} />
              </div>
           </div>

           <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                 <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Error 404</p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Page Not Found</h1>
              <p className="text-sm text-white/40 font-medium leading-relaxed">
                 The page you are looking for has been moved or no longer exists.
              </p>
           </div>

           <Link to="/">
             <Button className="w-full h-16 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90">
                <Home size={18} className="mr-2" /> Back to Dashboard
             </Button>
           </Link>

           <div className="mt-12 pt-8 border-t border-white/5 opacity-20">
              <p className="text-[10px] font-bold uppercase tracking-widest">Developed by Pratham Pingle</p>
           </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
