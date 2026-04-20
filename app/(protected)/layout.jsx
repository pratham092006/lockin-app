"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../src/components/Layout.jsx';
import { useAuth } from '../../src/hooks/useAuth.jsx';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#131313' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#4b8eff', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-semibold" style={{ color: '#8b90a0', fontFamily: "'Inter', system-ui" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }) {
  const { user, loading, profile, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!profileLoading && profile && !profile.onboardingDone) {
      router.replace('/onboarding');
    }
  }, [loading, profile, profileLoading, router, user]);

  if (loading || (user && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  if (profile && !profile.onboardingDone) {
    return <LoadingScreen />;
  }

  return <Layout>{children}</Layout>;
}
