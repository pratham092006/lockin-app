import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  CalendarCheck,
  Settings,
  Menu,
  X,
  UserCircle2,
  LogOut,
  Plus,
  Circle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard', short: 'Dash' },
  { path: '/workouts',  icon: Dumbbell,        label: 'Workouts',  short: 'Gym' },
  { path: '/nutrition', icon: Utensils,        label: 'Nutrition', short: 'Meal' },
  { path: '/habits',    icon: CalendarCheck,   label: 'Habits',    short: 'Habits' },
  { path: '/settings',  icon: Settings,        label: 'Settings',  short: 'Settings' },
];

function Sidebar({ open, onClose, user }) {
  const { signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-[#10151d]/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-80 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden p-4",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="glass-panel h-full p-3 flex flex-col">
          <div className="rounded-[20px] bg-white px-4 h-16 border border-[#e2e8f0] flex items-center justify-between">
            <button className="size-9 rounded-full bg-[#11151d] text-white flex items-center justify-center">
              <Menu size={16} />
            </button>

            <button
              className="size-9 rounded-full border border-[#d6dfeb] text-[#161b23] flex items-center justify-center"
              title="Settings"
            >
              <Settings size={15} />
            </button>

            <button className="h-9 px-3 rounded-full bg-[#f4f6fb] border border-[#e6ecf4] text-xs font-semibold text-[#151a22] flex items-center gap-1.5">
              <Plus size={14} /> New scenario
            </button>

            <button onClick={onClose} className="lg:hidden size-9 rounded-full border border-[#d6dfeb] text-[#161b23] flex items-center justify-center">
              <X size={15} />
            </button>
          </div>

          <div className="px-3 pt-6 pb-2">
            <h1 className="text-[38px] leading-[0.9] font-normal tracking-tight text-[#151a22]" style={{ fontFamily: "var(--font-display)" }}>
              My <strong className="font-extrabold">Organization</strong>
            </h1>
          </div>

          <div className="px-3 pb-4">
            <div className="rounded-full bg-[#f1f4f9] border border-[#e2e8f0] p-1 flex items-center gap-1">
              <div className="h-9 px-4 rounded-full bg-[#11151d] text-white text-sm font-medium flex items-center">Organization</div>
              <div className="h-9 px-4 rounded-full text-[#5f6876] text-sm font-medium flex items-center">Teams</div>
            </div>
          </div>

          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-2.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "group h-11 rounded-2xl border px-4 text-sm font-medium flex items-center justify-between transition-all",
                    isActive
                      ? "bg-[#e5ebf3] border-[#d4dce9] text-[#12161d]"
                      : "bg-white border-transparent text-[#5d6777] hover:border-[#d4dce9]"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon size={16} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive ? <Circle size={8} className="fill-[#11151d] text-[#11151d]" /> : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[20px] border border-[#dbe3ee] bg-[#eef2f7] p-3.5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-white border border-[#d7deea] flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 size={18} className="text-[#596375]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#151a22] truncate leading-none">{user?.displayName || 'User'}</p>
                <p className="text-[11px] text-[#6d7786] truncate mt-0.5">Standard plan</p>
              </div>
              <button
                onClick={async () => {
                  await signOutUser();
                  navigate('/login');
                }}
                className="ml-auto h-8 px-2.5 rounded-xl border border-[#d7deea] bg-white text-[#5d6676] hover:text-[#151a22]"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'DASHBOARD';

  return (
    <header className="sticky top-0 z-30 h-20 px-3 md:px-4">
      <div className="glass-panel h-full px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={cn(
            "lg:hidden flex items-center justify-center size-10 rounded-full transition-all border",
            "bg-[#11151d] border-[#11151d] text-white"
          )}
        >
          <Menu size={18} />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-[#596376]">Workspace</h2>
          <h3 className="text-2xl leading-tight text-[#131821]" style={{ fontFamily: 'var(--font-display)' }}>
            {currentPath === 'Dashboard' ? (
              <>
                Statistics <strong className="font-bold">Overview</strong>
              </>
            ) : (
              <>
                {currentPath} <strong className="font-bold">Module</strong>
              </>
            )}
          </h3>
        </div>
      </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex h-10 px-4 rounded-full bg-[#f2f5fa] border border-[#d8e1ed] items-center text-xs font-semibold text-[#5a6473]">
            {new Date().getFullYear()}
          </div>

          <div className="size-10 rounded-full bg-white border border-[#d7deea] flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 size={18} className="text-[#596375]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 lg:hidden flex justify-around items-center h-16 px-2 rounded-3xl glass-panel">
      
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={cn(
              "relative z-10 flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90",
              isActive ? "bg-[#11151d] text-white" : "text-[#5f6876]"
            )}
          >
            <item.icon 
              size={18} 
              strokeWidth={isActive ? 2.4 : 2} 
              className="transition-all duration-300"
            />
            <span className={cn(
              "text-[9px] font-semibold mt-1 transition-all",
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {item.short}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex relative text-[#151a22] selection:bg-[#c7d4e4]/70">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      <main className="flex-1 flex flex-col lg:ml-72 relative z-10 w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto px-3 md:px-4 py-4 pb-28 lg:pb-10 custom-scrollbar">
          <div className="soft-bridge glass-card rounded-[28px] border border-white/70 shadow-[0_24px_50px_rgba(17,21,29,0.12)] p-6 md:p-8 max-w-6xl mx-auto w-full text-[#12161d]">
            <Outlet />
          </div>
          
          <div className="mt-8 flex flex-col items-center opacity-60 pb-2">
             <p className="text-[11px] font-medium text-[#4d5868]">Developed by Pratham Pingle</p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
