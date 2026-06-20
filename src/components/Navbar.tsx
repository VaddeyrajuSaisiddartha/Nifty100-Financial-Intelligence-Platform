import React from 'react';
import { ShieldCheck, Search, Database, BarChart3, Star, MessageSquareCode, LogOut, User as UserIcon, RefreshCw, Activity, Scale, Sun, Moon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  marketIndex: number;
  onTriggerDailyUpdate: () => void;
  isUpdatingIndex: boolean;
  watchlistCount: number;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function Navbar({
  currentTab,
  setTab,
  user,
  onLogout,
  marketIndex,
  onTriggerDailyUpdate,
  isUpdatingIndex,
  watchlistCount,
  theme,
  setTheme
}: NavbarProps) {
  // Local state to trigger a flash of green/red whenever index changes
  const [flashType, setFlashType] = React.useState<'up' | 'down' | null>(null);
  const prevIndexRef = React.useRef(marketIndex);

  React.useEffect(() => {
    if (prevIndexRef.current !== marketIndex) {
      const type = marketIndex > prevIndexRef.current ? 'up' : 'down';
      setFlashType(type);
      prevIndexRef.current = marketIndex;

      const flagTimer = setTimeout(() => {
        setFlashType(null);
      }, 1200);
      return () => clearTimeout(flagTimer);
    }
  }, [marketIndex]);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      {/* Real-time Ticker Ribbon */}
      <div className="bg-slate-900 text-slate-400 text-xs py-1.5 px-4 border-b border-slate-800/60 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 md:gap-4 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NIFTY 100 INDEX:
            </span>
            <span className={`px-2 py-0.5 rounded transition-all duration-300 transform font-bold tracking-wider ${
              flashType === 'up' 
                ? 'text-emerald-400 bg-emerald-950 border border-emerald-500/50 scale-105 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse' 
                : flashType === 'down' 
                ? 'text-rose-450 bg-rose-950 border border-rose-500/50 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse' 
                : 'text-emerald-400 font-semibold'
            }`}>
              {marketIndex.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-sky-400 animate-pulse-live" />
              Platform: <span className="text-sky-400">Live Terminals</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Source: <span className="text-amber-500">Secured Daily Journal API</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTriggerDailyUpdate}
              disabled={isUpdatingIndex}
              className={`flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-white px-2.5 py-0.5 rounded border border-slate-700 cursor-pointer transition-all ${isUpdatingIndex ? 'opacity-70' : ''}`}
            >
              <RefreshCw className={`h-3 w-3 text-amber-400 ${isUpdatingIndex ? 'animate-spin' : ''}`} />
              {isUpdatingIndex ? 'Syncing...' : 'Fetch Feeds'}
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-indigo-300 hover:text-indigo-200 px-2.5 py-0.5 rounded border border-slate-700 cursor-pointer transition-all uppercase font-mono text-[10px] tracking-wider"
              title="Toggle color theme layer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3 w-3 text-amber-400 animate-pulse" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3 w-3 text-purple-400 animate-pulse" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand - NiftyIQ Premium Fintech Identity */}
        <div 
          onClick={() => setTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer select-none group"
          id="navbar-brand-logo"
        >
          <div className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-slate-950/80 group-hover:border-slate-700 transition-all relative overflow-hidden">
            {/* Ambient indicator */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/40 to-emerald-950/40 opacity-0 group-hover:opacity-105 transition-opacity" />
            <svg className="h-7 w-7 relative z-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Hexagonal Outer Frame */}
              <path d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z" stroke="url(#nifty-hex-grad)" strokeWidth="1.5" strokeLinejoin="round" />
              {/* Inner Glowing Hexagon */}
              <path d="M16 5.5 L26 11.2 V20.8 L16 26.5 L6 20.8 V11.2 Z" stroke="url(#nifty-hex-glow)" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
              
              {/* "N" and "100" Intertwined ascending trend elements */}
              {/* Left Pillar (representing the "1") */}
              <rect x="9" y="13" width="2.5" height="10" rx="1.2" fill="url(#nifty-left-pillar)" />
              {/* Middle Circle (representing the first "0") */}
              <circle cx="16" cy="18" r="3.2" stroke="url(#nifty-circle-grad)" strokeWidth="2" />
              <circle cx="16" cy="18" r="1.2" fill="#10b981" />
              {/* Right Circle (representing the second "0" or node of stock growth) */}
              <circle cx="23" cy="13" r="3.2" stroke="url(#nifty-circle-grad)" strokeWidth="2" />
              <circle cx="23" cy="13" r="1" fill="#3b82f6" />
              
              {/* Dynamic Connecting Bridge Line (Ascending Path) */}
              <path d="M10 21 L16 18 L23 13 L27 9" stroke="url(#nifty-trend-line)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M22 9H27V13" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

              <defs>
                <linearGradient id="nifty-hex-grad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="nifty-hex-glow" x1="16" y1="5.5" x2="16" y2="26.5" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="nifty-left-pillar" x1="10.25" y1="13" x2="10.25" y2="23" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="nifty-circle-grad" x1="12.8" y1="14.8" x2="26.2" y2="14.8" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="nifty-trend-line" x1="10" y1="21" x2="27" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight flex items-center leading-none">
              Nifty 100 <span className="text-emerald-400 font-sans font-black tracking-tight ml-1">Intelligence</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-sky-400 border border-indigo-900/60 uppercase ml-2 tracking-widest font-bold">
                PRO AI
              </span>
            </h1>
            <p className="text-[9px] font-mono text-slate-400 tracking-wider mt-0.5 uppercase">Financial Intelligence Node</p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="hidden lg:flex items-center gap-1" id="navbar-navigation-tabs">
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: Database },
            { id: 'search', label: 'Company Finder', icon: Search },
            { id: 'sectors', label: 'Sector Analytics', icon: BarChart3 },
            { id: 'comparison', label: 'Stock Comparison', icon: Scale },
            { id: 'cybersecurity', label: 'Fiduciary Risk & Audit', icon: ShieldCheck },
            { id: 'watchlist', label: `Watchlist (${watchlistCount})`, icon: Star },
            { id: 'assistance', label: 'AI Risk Assistant', icon: MessageSquareCode },
            { id: 'profile', label: 'My Profile', icon: UserIcon },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'text-white bg-slate-800/80 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${active ? 'text-sky-500' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Session Profile Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-805 pl-3.5 pr-1.5 py-1.5 rounded-xl hover:border-indigo-805 transition-all duration-300">
              <button 
                onClick={() => setTab('profile')}
                className="flex flex-col text-right cursor-pointer text-slate-300 hover:text-white transition-colors"
                title="View analyst identity profile"
              >
                <span className="text-xs font-semibold font-sans truncate max-w-[140px] block">
                  {user.fullName || `@${user.username}`}
                </span>
                <span className="text-[9px] text-slate-550 font-mono truncate max-w-[160px] block uppercase">
                  {user.companyTitle || 'Lead Allocator'}
                </span>
              </button>
              <button 
                onClick={() => setTab('watchlist')}
                className="h-8 w-8 rounded-lg bg-sky-950/80 text-sky-400 flex items-center justify-center relative hover:bg-sky-900 transition-colors"
                title="My Watchlist"
              >
                <Star className="h-4 w-4" />
                {watchlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {watchlistCount}
                  </span>
                )}
              </button>
              <button
                id="btn-navbar-logout"
                onClick={onLogout}
                className="h-8 px-2.5 rounded-lg text-xs text-rose-450 hover:bg-rose-950/40 hover:text-rose-300 border border-transparent hover:border-rose-900/40 transition-all flex items-center gap-1 cursor-pointer"
                title="Logout from analyst terminal"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Exit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTab('auth')}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 font-medium text-xs text-white px-4 py-2.5 rounded-xl hover:from-sky-500 hover:to-indigo-500 transition-all font-mono hover:shadow-lg hover:shadow-indigo-900/30 cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              ANALYST LOGIN
            </button>
          )}
        </div>
      </div>

      {/* Small Screen Secondary Navigation Option */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-950 flex items-center justify-around py-2 px-1">
        {[
          { id: 'dashboard', label: 'Monitor', icon: Database },
          { id: 'search', label: 'Finder', icon: Search },
          { id: 'sectors', label: 'Sectors', icon: BarChart3 },
          { id: 'comparison', label: 'Compare', icon: Scale },
          { id: 'cybersecurity', label: 'Risk', icon: ShieldCheck },
          { id: 'watchlist', label: 'Watch', icon: Star },
          { id: 'assistance', label: 'AI Help', icon: MessageSquareCode },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ].map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-medium py-1 px-2.5 rounded-md transition-all ${
                active ? 'text-sky-400 bg-slate-900' : 'text-slate-400'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
