import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout.jsx';

// #58 — Code splitting: lazy load all pages
const Dashboard  = lazy(() => import('./pages/Dashboard.jsx'));
const Workouts   = lazy(() => import('./pages/Workouts.jsx'));
const Nutrition  = lazy(() => import('./pages/Nutrition.jsx'));
const Habits     = lazy(() => import('./pages/Habits.jsx'));
const Settings   = lazy(() => import('./pages/Settings.jsx'));
const Login      = lazy(() => import('./pages/Login.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const NotFound   = lazy(() => import('./pages/NotFound.jsx'));

// ── Loading Fallback ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#131313' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4b8eff', borderTopColor: 'transparent' }} />
        <p className="text-sm font-semibold" style={{ color: '#8b90a0', fontFamily: "'Inter', system-ui" }}>Loading…</p>
      </div>
    </div>
  );
}

// ── Auth Guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Onboarding Guard ────────────────────────────────────────────────────────
function RequireOnboarding({ children }) {
  const { profile, profileLoading } = useAuth();
  if (profileLoading) return <LoadingScreen />;
  if (profile && !profile.onboardingDone) return <Navigate to="/onboarding" replace />;
  return children;
}

// #54 — sets page title per route
function PageTitle({ title }) {
  React.useEffect(() => { document.title = `${title} — LockIn`; }, [title]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<><PageTitle title="Sign In" /><Login /></>} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <RequireAuth>
              <PageTitle title="Onboarding" />
              <Onboarding />
            </RequireAuth>
          } />

          {/* Protected + Layout */}
          <Route element={
            <RequireAuth>
              <RequireOnboarding>
                <Layout />
              </RequireOnboarding>
            </RequireAuth>
          }>
            <Route index element={<><PageTitle title="Dashboard" /><Dashboard /></>} />
            <Route path="workouts" element={<><PageTitle title="Workouts" /><Workouts /></>} />
            <Route path="nutrition" element={<><PageTitle title="Nutrition" /><Nutrition /></>} />
            <Route path="habits" element={<><PageTitle title="Habits" /><Habits /></>} />
            <Route path="settings" element={<><PageTitle title="Settings" /><Settings /></>} />
          </Route>

          {/* 404 (#55) */}
          <Route path="*" element={<><PageTitle title="Not Found" /><NotFound /></>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
