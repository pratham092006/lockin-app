import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { C } from '../lib/theme';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, resetPassword } = useAuth();

  const [tab,      setTab]      = useState('signin'); // 'signin' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      if (tab === 'signup') {
        await signUp({ email, password, name });
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setTab('signin');
      } else {
        await signIn({ email, password });
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{ background: '#121212', color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient blobs - Dark Theme */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(0,255,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(204,255,0,0.05) 0%, transparent 50%)
        `
      }} />
      <div className="fixed pointer-events-none" style={{ top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(0,255,255,0.03)', filter: 'blur(100px)', borderRadius: '100%' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(204,255,0,0.02)', filter: 'blur(100px)', borderRadius: '100%' }} />

      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Branding with Logo */}
          <header className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="LockIn" className="h-12 w-auto drop-shadow-[0_0_12px_rgba(0,255,255,0.3)]" onError={(e) => { e.target.style.display = 'none'; }} />
              <h1
                className="text-4xl font-extrabold tracking-tighter uppercase font-display"
                style={{ color: '#FFFFFF' }}
              >
                LockIn
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00FFFF]">
              Your Daily Vitality Dashboard
            </p>
          </header>

          {/* Glass card / Neomorphic panel */}
          <div
            className="rounded-[2rem] overflow-hidden glass-panel backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { id: 'signin', label: 'Sign In' },
                { id: 'signup', label: 'Create Account' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
                  className="flex-1 py-4 text-sm font-bold transition-colors font-header uppercase tracking-wider"
                  style={{
                    color: tab === t.id ? '#00FFFF' : 'rgba(255,255,255,0.4)',
                    borderBottom: tab === t.id ? `2px solid #00FFFF` : '2px solid transparent',
                    background: tab === t.id ? 'rgba(0,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handle} className="p-8 space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold font-header text-white">
                  {tab === 'signin' ? 'Welcome back 👋' : 'Start your journey'}
                </h2>
                <p className="text-[12px] mt-1 text-white/50 mono-data">
                  {tab === 'signin'
                    ? 'Sign in to your account to continue.'
                    : 'Create an account to track your health goals.'}
                </p>
              </div>

              {/* Name (sign-up only) */}
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.15)] placeholder:text-white/20 font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.15)] placeholder:text-white/20 font-bold mono-data"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">
                    Password
                  </label>
                   {tab === 'signin' && (
                    <button type="button"
                      onClick={async () => {
                        if (!email) { setError('Enter your email first.'); return; }
                        setError(''); setBusy(true);
                        try { await resetPassword(email); setSuccess('Password reset email sent! Check your inbox.'); }
                        catch (err) { setError(err?.message || 'Failed to send reset email.'); }
                        finally { setBusy(false); }
                      }}
                      className="text-[10px] font-bold transition-colors uppercase tracking-widest hover:text-[#00FFFF] pb-0.5 text-white/40">
                      Forgot?
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm outline-none transition-all focus:border-[#00FFFF] focus:shadow-[0_0_12px_rgba(0,255,255,0.15)] placeholder:text-white/20 font-bold"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="p-1 rounded-md transition-colors hover:bg-white/10 text-white/40 hover:text-white"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error / Success messages */}
              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-xs font-bold text-[#FF3366] bg-[#FF3366]/10 border border-[#FF3366]/20 shadow-[0_0_12px_rgba(255,51,102,0.1)]"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="rounded-xl px-4 py-3 text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 shadow-[0_0_12px_rgba(204,255,0,0.1)]"
                >
                  {success}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all glowing-cyan-btn disabled:opacity-50"
                style={{ background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)', boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
              >
                {busy
                  ? <><Loader2 size={18} className="animate-spin" /> {tab === 'signin' ? 'Signing in…' : 'Creating account…'}</>
                  : <>{tab === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
                }
              </button>

              {/* Switch tab link */}
              <p className="text-center text-[10px] uppercase font-bold tracking-widest mt-6 text-white/40">
                {tab === 'signin' ? (
                  <>Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => setTab('signup')}
                      className="transition-colors hover:text-[#00FFFF] text-[#00FFFF]">
                      Create one
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => setTab('signin')}
                      className="transition-colors hover:text-[#00FFFF] text-[#00FFFF]">
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>
          
          {/* Decorative Dots */}
          <div className="mt-8 flex justify-center opacity-40">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_#00FFFF]" style={{ background: '#00FFFF' }} />
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_#CCFF00]" style={{ background: '#CCFF00' }} />
              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_#FF3366]" style={{ background: '#FF3366' }} />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
