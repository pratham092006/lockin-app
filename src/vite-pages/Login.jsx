"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.jsx';
import { 
  Eye, EyeOff, Mail, Lock, User,
  ArrowRight, Loader2, Plus, Settings, Menu
} from 'lucide-react';
import { toast } from 'sonner';
import styles from './Login.module.css';

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
    <div className={styles.authPage}>
      <main className={styles.authShell}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.authCard}
        >
          <div className={styles.topBar}>
            <button type="button" className={styles.iconButtonDark}>
              <Menu size={16} />
            </button>
            <button type="button" className={styles.iconButtonSoft}>
              <Settings size={15} />
            </button>
            <button type="button" className={styles.scenarioButton}>
              <Plus size={14} /> New scenario
            </button>
          </div>

          <div className={styles.heroBlock}>
            <h1 className={styles.heroTitle}>
              Start <strong className="font-extrabold">LockIn</strong> in
              <br />
              Minutes with <strong className="font-extrabold">Your Goals</strong>
            </h1>
            <p className={styles.heroSubtitle}>Sign in to continue or create a new account.</p>
          </div>

          <div className={styles.tabWrap}>
            <div className={styles.tabTrack}>
              {[
                { id: 'signin', label: 'Sign in' },
                { id: 'signup', label: 'Create account' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={tab === t.id ? styles.tabButtonActive : styles.tabButton}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handle} className={styles.form}>
            {tab === 'signup' ? (
              <div className={styles.field}>
                <User size={16} className={styles.fieldIcon} />
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className={styles.fieldInput}
                />
              </div>
            ) : null}

            <div className={styles.field}>
              <Mail size={16} className={styles.fieldIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={styles.fieldInput}
              />
            </div>

            <div className={styles.field}>
              <Lock size={16} className={styles.fieldIcon} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.fieldInput}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className={styles.passwordToggle}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {tab === 'signin' ? (
              <div className={styles.forgotRow}>
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
                  className={styles.forgotButton}
                >
                  Forgot password?
                </button>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className={styles.submitButton}
            >
              {busy ? (
                <>
                  <Loader2 size={16} className={styles.spinner} /> Processing
                </>
              ) : (
                <>
                  {tab === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} className={styles.arrowIcon} />
                </>
              )}
            </button>

            <p className={styles.switchText}>
              {tab === 'signin' ? (
                <>
                  No account yet?{' '}
                  <button type="button" onClick={() => setTab('signup')} className={styles.switchLink}>
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('signin')} className={styles.switchLink}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </motion.div>

        <p className={styles.credit}>Developed by Pratham Pingle</p>
      </main>
    </div>
  );
}
