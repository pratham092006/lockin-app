import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Dumbbell, Utensils, CalendarCheck,
  Settings, Menu, X, UserCircle2, LogOut, ChevronRight
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
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-md"
            onClick={onClose} 
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
          "bg-[#0a0a0a] border-r border-white/5 shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >

        {/* Logo Section */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                <span className="font-bold text-xs text-white">LI</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              LockIn
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-10 px-4 space-y-2.5 overflow-y-auto relative z-10 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between px-5 h-12 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-white" : "text-white/30"
                    )} 
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <div className="size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User / Footer Section */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 relative z-10">
          <div className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border border-transparent hover:border-white/5 hover:bg-white/[0.03]">
             <div className="size-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                 {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                 ) : (
                    <UserCircle2 size={24} className="text-white/40" />
                 )}
             </div>
             <div className="min-w-0">
               <p className="text-sm font-semibold text-white truncate leading-none">
                 {user?.displayName || 'USER'}
               </p>
               <p className="text-[10px] text-white/30 mt-1 truncate uppercase tracking-widest font-medium">Standard Plan</p>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4 px-1">
             <button 
               onClick={async () => { await signOutUser(); navigate('/login'); }}
               className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500/70 hover:text-white hover:bg-red-500 transition-all active:scale-95"
             >
               <LogOut size={14} /> SIGN OUT
             </button>
             
             <p className="py-4 text-[9px] font-black text-white/10 uppercase tracking-[0.3em] text-center border-t border-white/5">
                V1.0.4.PRO-ALPHA • STABLE
             </p>
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
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 md:px-10 bg-black border-b border-white/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className={cn(
            "lg:hidden flex items-center justify-center size-11 rounded-2xl transition-all border",
            "bg-white/5 border-white/10 text-white hover:bg-white/10"
          )}
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
           <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">{currentPath}</h2>
        </div>
        <div className="lg:hidden flex items-center gap-2.5">
           <span className="text-xl font-black uppercase font-display text-white tracking-widest">
             LI<span className="text-cyan-400">01</span>
           </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end">
           <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
             {new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
           </p>
           <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Synced</p>
        </div>
        <div className="size-11 rounded-full p-[1.5px] bg-white/10 group cursor-pointer hover:bg-cyan-500/30 transition-all border border-white/5">
           <div className="size-full rounded-full bg-black flex items-center justify-center overflow-hidden">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
             ) : (
                <UserCircle2 size={20} className="text-white/40" />
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
    <nav className="fixed bottom-0 w-full z-50 lg:hidden flex justify-around items-center h-20 px-4 pb-2">
      <div className="absolute inset-0 bg-black border-t border-white/5" />
      
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        
        return (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={cn(
              "relative z-10 flex flex-col items-center justify-center w-16 h-16 rounded-[22px] transition-all duration-500 active:scale-90",
              isActive ? "text-[#00FFFF]" : "text-white/30"
            )}
          >
            <item.icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={cn("transition-all duration-300", isActive && "drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]")}
            />
            <span className={cn(
              "text-[9px] font-semibold mt-1 transition-all",
              isActive ? "opacity-100" : "opacity-40"
            )}>
              {item.short}
            </span>
            {isActive && (
              <div className="absolute inset-x-4 bottom-1 h-[2px] bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
            )}
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
    <div className="min-h-screen flex relative bg-black text-white selection:bg-white/10">
      {/* Subtle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      
      <main className="flex-1 flex flex-col lg:ml-72 relative z-10 w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto px-6 md:px-10 py-10 pb-32 lg:pb-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto w-full"><Outlet /></div>
          
          {/* Developed Footnote */}
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center opacity-30">
             <p className="text-[10px] font-medium uppercase tracking-widest">Developed by Pratham Pingle</p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
