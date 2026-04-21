"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  Eye, EyeOff, Mail, Lock, User,
  ArrowRight, Loader2, Plus, Settings, Menu
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
    <div className="min-h-screen px-4 py-6 md:py-10">
      <main className="mx-auto max-w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-3"
        >
          <div className="rounded-[20px] bg-white border border-[#dfe6f1] px-4 h-16 flex items-center justify-between">
            <button className="size-9 rounded-full bg-[#11151d] text-white flex items-center justify-center">
              <Menu size={16} />
            </button>
            <button className="size-9 rounded-full border border-[#d6dfeb] text-[#161b23] flex items-center justify-center">
              <Settings size={15} />
            </button>
            <button className="h-9 px-3 rounded-full bg-[#f4f6fb] border border-[#e6ecf4] text-xs font-semibold text-[#151a22] flex items-center gap-1.5">
              <Plus size={14} /> New scenario
            </button>
          </div>

          <div className="pt-6 px-2 pb-2">
            <h1 className="text-[42px] leading-[0.92] text-[#131821]" style={{ fontFamily: 'var(--font-display)' }}>
              Start <strong className="font-extrabold">LockIn</strong> in
              <br />
              Minutes with <strong className="font-extrabold">Your Goals</strong>
            </h1>
            <p className="mt-3 text-sm text-[#6f7784]">Sign in to continue or create a new account.</p>
          </div>

          <div className="px-2 pt-3">
            <div className="rounded-full bg-[#f1f4f9] border border-[#e2e8f0] p-1 flex items-center gap-1">
              {[
                { id: 'signin', label: 'Sign in' },
                { id: 'signup', label: 'Create account' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'h-9 flex-1 rounded-full text-sm font-semibold transition-all',
                    tab === t.id ? 'bg-[#11151d] text-white' : 'text-[#6a7382] hover:text-[#1a202b]'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handle} className="p-4 md:p-5 space-y-4">
            {tab === 'signup' ? (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778192]" />
                <Input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className="pl-10"
                />
              </div>
            ) : null}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778192]" />
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778192]" />
              <Input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#748092] hover:text-[#1a202b]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {tab === 'signin' ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast.error('Please enter your email first.');
                      return;
                    }
                    setBusy(true);
                    try {
                      await resetPassword(email);
                      toast.success('Password reset email sent.');
                    } catch {
                      toast.error('Unable to send reset email.');
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="text-xs font-semibold text-[#667081] hover:text-[#12161d]"
                >
                  Forgot password?
                </button>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              glow={!busy}
              className="w-full h-12"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Processing
                </>
              ) : (
                <>
                  {tab === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-[#6b7584]">
              {tab === 'signin' ? (
                <>
                  No account yet?{' '}
                  <button type="button" onClick={() => setTab('signup')} className="font-semibold text-[#12161d] hover:underline">
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('signin')} className="font-semibold text-[#12161d] hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </motion.div>

        <p className="text-center mt-5 text-[11px] text-[#5f6877]">Developed by Pratham Pingle</p>
      </main>
    </div>
  );
}
