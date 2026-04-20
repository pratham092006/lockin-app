"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  Eye, EyeOff, Mail, Lock, User, 
  ArrowRight, Loader2, ShieldCheck, 
  Zap, Globe, Cpu, Fingerprint
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const { user, loading, signIn, signUp, resetPassword } = useAuth();

  const [tab,      setTab]      = useState('signin'); // 'signin' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handle = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === 'signup') {
        await signUp({ email, password, name });
        toast.success('Account created successfully. Verify your email to login.');
        setTab('signin');
      } else {
        await signIn({ email, password });
        toast.success('Signed in successfully.');
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a] selection:bg-cyan-500/30 selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] size-[600px] bg-cyan-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[600px] bg-purple-600/10 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[10%] size-[300px] bg-lime-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-lg px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Branding */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Sign in to your account</p>
          </div>
        </motion.header>

        {/* Auth Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Tab Switcher */}
          <div className="flex bg-black/40 border-b border-white/5">
            {[
              { id: 'signin', label: 'SIGN IN' },
              { id: 'signup', label: 'CREATE ACCOUNT' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); }}
                className={cn(
                  "flex-1 py-5 text-[10px] font-black transition-all font-header uppercase tracking-[0.2em] relative",
                  tab === t.id ? "text-cyan-400" : "text-white/20 hover:text-white/40"
                )}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div 
                    layoutId="auth-tab-glow" 
                    className="absolute inset-x-4 bottom-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#00FFFF]" 
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="p-10 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black font-display text-white uppercase tracking-tight leading-none">
                {tab === 'signin' ? 'Login' : 'Get Started'}
              </h2>
              <p className="text-sm text-white/40 font-medium">
                {tab === 'signin'
                  ? 'Sign in to your LockIn account.'
                  : 'Join the community and start tracking your goals.'}
              </p>
            </div>

            {tab === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">Full Identity</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/10" />
                  <Input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="E.G. JOHN DOE"
                    className="pl-12 h-14 font-black uppercase placeholder:text-white/5 bg-white/[0.01] border-white/10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-1">Global Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/10" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="pl-12 h-14 font-black uppercase placeholder:text-white/5 bg-white/[0.01] border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Secret Access Key</label>
                {tab === 'signin' && (
                  <button type="button"
                    onClick={async () => {
                      if (!email) { toast.error('ENTER EMAIL FIRST.'); return; }
                      setBusy(true);
                      try { await resetPassword(email); toast.success('ACCESS KEY RESET PROTOCOL SENT.'); }
                      catch (err) { toast.error('FAILED TO INITIATE RESET.'); }
                      finally { setBusy(false); }
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-colors">
                    LOST KEY?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/10" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 pr-14 h-14 font-black uppercase placeholder:text-white/5 bg-white/[0.01] border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/20 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              glow={!busy}
              className="w-full h-16 rounded-2xl font-black uppercase text-xs tracking-[0.2em] mt-6"
            >
              {busy
                ? <><Loader2 size={18} className="animate-spin mr-2" /> PROCESSING...</>
                : <>{tab === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} className="ml-2" /></>
              }
            </Button>

            <div className="pt-6 flex justify-center items-center gap-4 text-white/10">
               <div className="h-px w-full bg-white/5" />
               <div className="flex gap-3">
                  <ShieldCheck size={14} />
                  <Globe size={14} />
                  <Zap size={14} />
               </div>
               <div className="h-px w-full bg-white/5" />
            </div>

            <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] mt-2 group">
              {tab === 'signin' ? (
                <>No identity detected?{' '}
                  <button type="button" onClick={() => setTab('signup')}
                    className="text-cyan-400 hover:text-white transition-colors">
                    REGISTER NOW
                  </button>
                </>
              ) : (
                <>Identity already synced?{' '}
                  <button type="button" onClick={() => setTab('signin')}
                    className="text-cyan-400 hover:text-white transition-colors">
                    ACCESS LOGIN
                  </button>
                </>
              )}
            </p>
          </form>
        </motion.div>

        {/* Global Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center gap-6 justify-center opacity-20 mb-6">
             <div className="flex items-center gap-2">
                <Cpu size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Core.v8</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Network.Stable</span>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            Developed by Pratham Pingle
          </p>
        </motion.div>
      </main>
    </div>
  );
}
