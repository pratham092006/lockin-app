import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

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
      style={{ background: '#131313', color: '#e5e2e1', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(0,122,255,0.12) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(66,227,85,0.06) 0%, transparent 50%)
        `
      }} />
      <div className="fixed pointer-events-none" style={{ top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(173,198,255,0.07)', filter: 'blur(120px)', borderRadius: '100%' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(66,227,85,0.04)', filter: 'blur(120px)', borderRadius: '100%' }} />

      <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Branding with Logo */}
          <header className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="LockIn" className="h-12 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
              <h1
                className="text-4xl font-extrabold tracking-tighter"
                style={{
                  fontFamily: "'Manrope', system-ui",
                  background: 'linear-gradient(135deg, #adc6ff 0%, #4b8eff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                LockIn
              </h1>
            </div>
            <p className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: '#c1c6d7' }}>
              Your Daily Vitality Dashboard
            </p>
          </header>

          {/* Glass card */}
          <div
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'rgba(42,42,42,0.4)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderTop: '1px solid rgba(139,144,160,0.2)',
              borderLeft: '1px solid rgba(139,144,160,0.2)',
            }}
          >
            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom: '1px solid rgba(65,71,85,0.3)' }}>
              {[
                { id: 'signin', label: 'Sign In' },
                { id: 'signup', label: 'Create Account' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
                  className="flex-1 py-4 text-sm font-bold transition-colors"
                  style={{
                    fontFamily: "'Manrope', system-ui",
                    color: tab === t.id ? '#adc6ff' : '#8b90a0',
                    borderBottom: tab === t.id ? '2px solid #4b8eff' : '2px solid transparent',
                    background: 'transparent',
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handle} className="p-8 space-y-5">
              <div className="text-center mb-2">
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Manrope', system-ui", color: '#e5e2e1' }}
                >
                  {tab === 'signin' ? 'Welcome back 👋' : 'Start your journey'}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#8b90a0' }}>
                  {tab === 'signin'
                    ? 'Sign in to your account to continue.'
                    : 'Create an account to track your health goals.'}
                </p>
              </div>

              {/* Name (sign-up only) */}
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b90a0' }} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(14,14,14,0.8)',
                        border: '1px solid rgba(65,71,85,0.4)',
                        color: '#e5e2e1',
                      }}
                      onFocus={e => e.target.style.borderColor = '#4b8eff'}
                      onBlur={e => e.target.style.borderColor = 'rgba(65,71,85,0.4)'}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b90a0' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(14,14,14,0.8)',
                      border: '1px solid rgba(65,71,85,0.4)',
                      color: '#e5e2e1',
                    }}
                    onFocus={e => e.target.style.borderColor = '#4b8eff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(65,71,85,0.4)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b90a0' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8b90a0' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(14,14,14,0.8)',
                      border: '1px solid rgba(65,71,85,0.4)',
                      color: '#e5e2e1',
                    }}
                    onFocus={e => e.target.style.borderColor = '#4b8eff'}
                    onBlur={e => e.target.style.borderColor = 'rgba(65,71,85,0.4)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#8b90a0' }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {tab === 'signup' && (
                  <p className="text-xs" style={{ color: '#8b90a0' }}>Use at least 6 characters.</p>
                )}
                {tab === 'signin' && (
                  <button type="button"
                    onClick={async () => {
                      if (!email) { setError('Enter your email first.'); return; }
                      setError(''); setBusy(true);
                      try { await resetPassword(email); setSuccess('Password reset email sent! Check your inbox.'); }
                      catch (err) { setError(err?.message || 'Failed to send reset email.'); }
                      finally { setBusy(false); }
                    }}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#adc6ff' }}>
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Error / Success messages */}
              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(147,0,10,0.2)', color: '#ffb4ab', border: '1px solid rgba(147,0,10,0.4)' }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(4,195,57,0.12)', color: '#42e355', border: '1px solid rgba(4,195,57,0.3)' }}
                >
                  {success}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #4b8eff, #adc6ff)',
                  color: '#001a41',
                  fontFamily: "'Manrope', system-ui",
                  boxShadow: '0 4px 24px rgba(75,142,255,0.35)',
                }}
              >
                {busy
                  ? <><Loader2 size={18} className="animate-spin" /> {tab === 'signin' ? 'Signing in…' : 'Creating account…'}</>
                  : <>{tab === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
                }
              </button>

              {/* Switch tab link */}
              <p className="text-center text-xs" style={{ color: '#8b90a0' }}>
                {tab === 'signin' ? (
                  <>Don&apos;t have an account?{' '}
                    <button type="button" onClick={() => setTab('signup')}
                      className="font-semibold transition-colors"
                      style={{ color: '#adc6ff' }}>
                      Create one
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => setTab('signin')}
                      className="font-semibold transition-colors"
                      style={{ color: '#adc6ff' }}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </form>
          </div>

          {/* Dots */}
          <div className="mt-10 flex justify-center" style={{ opacity: 0.35 }}>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#adc6ff' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#42e355' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#adc6ff' }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
