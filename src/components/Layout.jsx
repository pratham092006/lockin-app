import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Dumbbell, Utensils, CalendarCheck,
  Settings, Menu, X, UserCircle2, LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { C } from '../lib/theme';

const NAV_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/workouts',  icon: Dumbbell,        label: 'Workouts'  },
  { path: '/nutrition', icon: Utensils,         label: 'Nutrition' },
  { path: '/habits',    icon: CalendarCheck,   label: 'Habits'    },
  { path: '/settings',  icon: Settings,        label: 'Settings'  },
];

function Sidebar({ open, onClose, user }) {
  const { signOutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRight: '1px solid rgba(65,71,85,0.2)' }}>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(65,71,85,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="LockIn" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl font-extrabold tracking-tighter"
              style={{ fontFamily: "'Manrope', system-ui", background: 'linear-gradient(135deg, #adc6ff 0%, #4b8eff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              LockIn
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg transition-colors" style={{ color: C.outline }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
              style={({ isActive }) => isActive
                ? { background: 'rgba(75,142,255,0.15)', color: C.primary, boxShadow: '0 0 15px rgba(0,122,255,0.15)' }
                : { color: C.outline }}>
              <Icon size={20} className="shrink-0" />
              <span style={{ fontFamily: "'Inter', system-ui" }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* #27 — Sign out in sidebar */}
        <div className="px-3 mb-2">
          <button onClick={async () => { await signOutUser(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all"
            style={{ color: C.error }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>

        {/* User snippet */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(65,71,85,0.15)' }}>
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(42,42,42,0.4)' }}>
            <div className="size-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4b8eff, #42e355)', flexShrink: 0 }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : <UserCircle2 size={22} color="#0e0e0e" />}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.onSurface, fontFamily: "'Manrope', system-ui" }}>
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: C.outline }}>{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }) {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6"
      style={{ background: 'rgba(19,19,19,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(65,71,85,0.12)' }}>
      <div className="flex items-center gap-3 lg:hidden">
        <button onClick={onMenuClick} className="p-2 rounded-xl transition-colors"
          style={{ color: C.onSurfaceV, background: 'rgba(42,42,42,0.4)' }}>
          <Menu size={22} />
        </button>
        <img src="/logo.png" alt="LockIn" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
        <span className="text-lg font-extrabold tracking-tighter"
          style={{ fontFamily: "'Manrope', system-ui", background: 'linear-gradient(135deg, #adc6ff 0%, #4b8eff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LockIn
        </span>
      </div>
      <div className="hidden lg:block">
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: C.outline }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      {/* #26 — removed bell icon, only user menu */}
      <div className="relative">
        <button onClick={() => setShowMenu(v => !v)} className="p-2 rounded-full transition-colors" style={{ color: C.outline }}>
          <UserCircle2 size={20} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-12 rounded-2xl shadow-2xl py-2 z-50 min-w-48"
            style={{ background: 'rgba(30,30,30,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(65,71,85,0.3)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(65,71,85,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: C.onSurface }}>{user?.displayName}</p>
              <p className="text-xs" style={{ color: C.outline }}>{user?.email}</p>
            </div>
            <button onClick={async () => { await signOutUser(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5"
              style={{ color: '#ffb4ab' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// #25 — mobile bottom nav now includes Settings
function BottomNav() {
  const BOTTOM_ITEMS = [
    { path: '/',          icon: LayoutDashboard, label: 'Home' },
    { path: '/workouts',  icon: Dumbbell,        label: 'Train' },
    { path: '/nutrition', icon: Utensils,         label: 'Food' },
    { path: '/habits',    icon: CalendarCheck,   label: 'Habits' },
    { path: '/settings',  icon: Settings,        label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 lg:hidden flex justify-around items-center h-20 px-2"
      style={{ background: 'rgba(19,19,19,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.05)', borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
      {BOTTOM_ITEMS.map(({ path, icon: Icon, label }) => (
        <NavLink key={path} to={path} end={path === '/'}
          className="flex flex-col items-center justify-center transition-all duration-150 active:scale-90 px-2 py-1.5 rounded-2xl"
          style={({ isActive }) => isActive
            ? { color: '#4b8eff', background: 'rgba(75,142,255,0.12)', boxShadow: '0 0 15px rgba(0,122,255,0.18)' }
            : { color: '#8b90a0' }}>
          {({ isActive }) => (
            <>
              <Icon size={20} fill={isActive ? 'currentColor' : 'none'} />
              <span className="text-[9px] uppercase tracking-widest font-semibold mt-0.5"
                style={{ fontFamily: "'Inter', system-ui" }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: '#131313', color: '#e5e2e1' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 15% 25%, rgba(0,122,255,0.07) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(66,227,85,0.04) 0%, transparent 45%)' }} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <main className="flex-1 flex flex-col lg:ml-64 relative z-10">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6 pb-28 lg:pb-8">
          <div className="max-w-5xl mx-auto w-full"><Outlet /></div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
