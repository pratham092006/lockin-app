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
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(18,18,18,0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="LockIn" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-xl tracking-tighter gradient-text"
              style={{ fontFamily: 'var(--font-display)' }}>
              LockIn
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: C.outline }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-semibold transition-all duration-300 ${isActive ? 'glow-cyan' : 'hover:bg-white/5'}`}
              style={({ isActive }) => isActive
                ? { background: 'rgba(0,255,255,0.1)', color: '#00FFFF' }
                : { color: 'rgba(255,255,255,0.6)' }}>
              <item.icon size={20} className="shrink-0" />
              <span style={{ fontFamily: 'var(--font-header)', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '12px' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 mb-4">
          <button onClick={async () => { await signOutUser(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-semibold transition-all hover:bg-white/5"
            style={{ color: C.errorC }}>
            <LogOut size={20} /> <span style={{ fontFamily: 'var(--font-header)', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '12px' }}>Sign Out</span>
          </button>
        </div>

        {/* User snippet */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-[16px] border border-white/5 bg-white/5 transition-colors hover:bg-white/10">
            <div className="size-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center glow-lime"
              style={{ background: 'linear-gradient(135deg, #00FFFF, #CCFF00)' }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : <UserCircle2 size={22} color="#121212" />}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white" style={{ fontFamily: 'var(--font-header)' }}>
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs truncate mono-data" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email || ''}</p>
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
      style={{ background: 'rgba(18,18,18,0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 lg:hidden">
        <button onClick={onMenuClick} className="p-2 rounded-xl transition-colors hover:bg-white/10"
          style={{ color: '#F8F9FA', background: 'rgba(255,255,255,0.05)' }}>
          <Menu size={22} />
        </button>
        <span className="text-lg tracking-tighter gradient-text"
          style={{ fontFamily: 'var(--font-display)' }}>
          LockIn
        </span>
      </div>
      <div className="hidden lg:block">
        <p className="text-xs uppercase tracking-widest font-bold mono-data" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()}
        </p>
      </div>
      <div className="relative">
        <button onClick={() => setShowMenu(v => !v)} className="p-2 rounded-full transition-colors hover:bg-white/10" style={{ color: '#F8F9FA' }}>
          <UserCircle2 size={20} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-12 rounded-[20px] py-2 z-50 min-w-48 glow-cyan"
            style={{ background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,255,255,0.15)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-header)' }}>{user?.displayName}</p>
              <p className="text-[10px] mono-data" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email}</p>
            </div>
            <button onClick={async () => { await signOutUser(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-white/5 font-bold"
              style={{ color: C.errorC, fontFamily: 'var(--font-header)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function BottomNav() {
  const BOTTOM_ITEMS = [
    { path: '/',          icon: LayoutDashboard, label: 'Home' },
    { path: '/workouts',  icon: Dumbbell,        label: 'Train' },
    { path: '/nutrition', icon: Utensils,         label: 'Food' },
    { path: '/habits',    icon: CalendarCheck,   label: 'Habits' },
    { path: '/settings',  icon: Settings,        label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 lg:hidden flex justify-around items-center h-20 px-4"
      style={{ background: 'rgba(18,18,18,0.85)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(255,255,255,0.08)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
      {BOTTOM_ITEMS.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'}
          className={({ isActive }) => `flex flex-col items-center justify-center transition-all duration-300 active:scale-95 px-3 py-2 rounded-[20px] ${isActive ? 'glow-cyan' : ''}`}
          style={({ isActive }) => isActive
            ? { color: '#00FFFF', background: 'rgba(0,255,255,0.1)' }
            : { color: 'rgba(255,255,255,0.4)' }}>
          {({ isActive }) => (
            <>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'rgba(0,255,255,0.2)' : 'none'} />
              <span className="text-[9px] uppercase font-bold mt-1"
                style={{ fontFamily: 'var(--font-header)', letterSpacing: '0.05em' }}>{item.label}</span>
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
    <div className="min-h-screen flex relative bg-[#121212]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <main className="flex-1 flex flex-col lg:ml-64 relative z-10 w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8 py-6 pb-28 lg:pb-8">
          <div className="max-w-5xl mx-auto w-full"><Outlet /></div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
