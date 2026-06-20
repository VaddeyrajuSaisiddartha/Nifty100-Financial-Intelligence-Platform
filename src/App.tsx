import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CompanySearch from './components/CompanySearch';
import CompanyDetail from './components/CompanyDetail';
import SectorAnalytics from './components/SectorAnalytics';
import CybersecurityHub from './components/CybersecurityHub';
import AiChatbot from './components/AiChatbot';
import LoginAuth from './components/LoginAuth';
import CompanyComparison from './components/CompanyComparison';
import UserProfile from './components/UserProfile';
import { Company, User } from './types';
import { Star, ShieldAlert, Cpu, Database, Trash2, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setTab] = useState<string>('dashboard');
  const [selectedCompanySymbol, setSelectedCompanySymbol] = useState<string | null>(null);

  // Theme support & saved chat streams
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('niq_theme') as 'dark' | 'light') || 'dark');
  const [savedChats, setSavedChats] = useState<{ id: string; title: string; history: Message[]; updatedAt: string }[]>([]);

  useEffect(() => {
    localStorage.setItem('niq_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
  }, [theme]);

  const fetchSavedChats = async () => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) return;
    try {
      const response = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedChats(data);
      }
    } catch (e) {
      console.log('Saved chats fetch skipped');
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedChats();
    } else {
      setSavedChats([]);
    }
  }, [user]);

  // Synchronize internal layout transitions to Browser History so standard Back operations work gracefully inside our SPA!
  useEffect(() => {
    // 1. Initialize first history entry if empty
    if (!window.history.state) {
      window.history.replaceState({ tab: currentTab, symbol: selectedCompanySymbol }, '');
    }

    // 2. Listen to browser popstate (back/forward clicks)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { tab, symbol } = event.state;
        if (tab) {
          setTab(tab);
        }
        setSelectedCompanySymbol(symbol !== undefined ? symbol : null);
      } else {
        // Fallback to default
        setTab('dashboard');
        setSelectedCompanySymbol(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 3. Push a new state only if the state changed from user action (not popstate)
  useEffect(() => {
    const currentState = window.history.state;
    const hasStateChanged = !currentState || 
      currentState.tab !== currentTab || 
      currentState.symbol !== selectedCompanySymbol;

    if (hasStateChanged) {
      window.history.pushState({ tab: currentTab, symbol: selectedCompanySymbol }, '');
    }
  }, [currentTab, selectedCompanySymbol]);

  // Core collections
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [dailyLogs, setDailyLogs] = useState<{ timestamp: string; message: string; type: string }[]>([]);
  const [marketIndex, setMarketIndex] = useState<number>(23580.45);
  const [lastUpdated, setLastUpdated] = useState<string>('18 Jun 2026 06:00 AM');
  
  // Loading & Action states
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [isUpdatingIndex, setIsUpdatingIndex] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // On mount check Session Profile & populate listings
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    const headers: Record<string, string> = {};
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }

    // 1. Fetch live user profile if session exists
    fetch('/api/profile', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then(resData => {
        if (resData.username) {
          setUser(resData);
          localStorage.setItem('auth_user', JSON.stringify(resData));
        }
      })
      .catch(err => {
        console.log("Profile handshake skipped (guest status)");
        if (savedToken) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      });

    // 2. Fetch all companies data
    fetch('/api/all_companies')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) {
          setCompanies(resData);
          // Calculate unique sectors
          const uniqueSectors = Array.from(new Set(resData.map((c: Company) => c.sector)));
          setSectors(uniqueSectors);
        }
        setLoadingCompanies(false);
      })
      .catch(err => {
        console.error("Failed to fetch initial company rosters", err);
        setLoadingCompanies(false);
      });

    // 3. Fetch Watchlist & logs
    fetchWatchlist(savedToken || undefined);
    fetchDailyLogsAndIndex();
  }, []);

  const fetchWatchlist = (token?: string) => {
    const activeToken = token || localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    fetch('/api/watchlist', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized watchlist fetch');
        return res.json();
      })
      .then(resData => {
        if (Array.isArray(resData)) {
          setWatchlist(resData);
        }
      })
      .catch(err => console.log("Watchlist sync skipped"));
  };

  const fetchDailyLogsAndIndex = () => {
    fetch('/api/logs_and_index')
      .then(res => res.json())
      .then(resData => {
        if (resData.marketIndex) {
          setMarketIndex(resData.marketIndex);
        }
        if (Array.isArray(resData.logs)) {
          setDailyLogs(resData.logs);
        }
        if (resData.lastUpdated) {
          setLastUpdated(resData.lastUpdated);
        }
      })
      .catch(err => console.log("Logs fetch skipped"));
  };

  // Toggle watchlist item securely with DB update
  const handleToggleWatchlist = async (symbol: string) => {
    const savedToken = localStorage.getItem('auth_token');
    if (!user || !savedToken) {
      // Force direct alert of login required to protect analyst entries
      setTab('auth');
      return;
    }

    try {
      const response = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ symbol })
      });
      const resData = await response.json();
      if (Array.isArray(resData.watchlist)) {
        setWatchlist(resData.watchlist);
      } else if (Array.isArray(resData.updatedList)) {
        setWatchlist(resData.updatedList);
      }
    } catch (err) {
      console.error("Error toggling watchlist selection", err);
    }
  };

  const handleSaveChat = async (title: string, messagesList: Message[]) => {
    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ title, history: messagesList })
      });
      if (response.ok) {
        fetchSavedChats();
      }
    } catch (e) {
      console.error("Save chat session failed", e);
    }
  };

  const handleDeleteSavedChat = async (id: string) => {
    const activeToken = localStorage.getItem('auth_token');
    if (!activeToken) return;
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.ok) {
        fetchSavedChats();
      }
    } catch (e) {
      console.error("Delete chat session failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setWatchlist([]);
      setTab('dashboard');
    } catch (err) {
      console.error("Failed to gracefully close session", err);
    }
  };

  // Run simulated daily market feed incremental updates
  const handleTriggerDailyUpdate = async () => {
    setIsUpdatingIndex(true);
    try {
      const response = await fetch('/api/trigger_daily_update', { method: 'POST' });
      const resData = await response.json();
      if (resData.marketIndex) {
        setMarketIndex(resData.marketIndex);
      }
      // Re-fetch log entries
      fetchDailyLogsAndIndex();
    } catch (err) {
      console.error("Daily cron replication failed", err);
    } finally {
      setIsUpdatingIndex(false);
    }
  };

  // Send message to chatbot endpoint
  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim() || chatLoading) return;

    const updatedUserMsg: Message = {
      role: 'user',
      parts: [{ text: msgText }]
    };

    setChatHistory(prev => [...prev, updatedUserMsg]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          history: [...chatHistory, updatedUserMsg]
        })
      });

      const resData = await response.json();
      if (resData.reply) {
        setChatHistory(prev => [...prev, {
          role: 'model',
          parts: [{ text: resData.reply }]
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          role: 'model',
          parts: [{ text: "System experienced a protocol failure reading knowledge nodes. Please check security logs." }]
        }]);
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        role: 'model',
        parts: [{ text: `Gateway Connection interrupted: ${err.message}` }]
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAskWithContext = (msgText: string) => {
    setTab('assistance');
    handleSendMessage(msgText);
  };

  // Direct details trigger
  const handleCompanySelect = (symbol: string) => {
    setSelectedCompanySymbol(symbol);
  };

  // Render sub sections based on selected states
  const renderActiveTab = () => {
    if (selectedCompanySymbol) {
      return (
        <CompanyDetail
          symbol={selectedCompanySymbol}
          onBack={() => setSelectedCompanySymbol(null)}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onAskChatWithContext={handleAskWithContext}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            companies={companies}
            setTab={setTab}
            onCompanySelect={handleCompanySelect}
            dailyLogs={dailyLogs}
            lastUpdated={lastUpdated}
          />
        );
      case 'search':
        return (
          <CompanySearch
            companies={companies}
            sectors={sectors}
            onCompanySelect={handleCompanySelect}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        );
      case 'sectors':
        return (
          <SectorAnalytics
            companies={companies}
            onCompanySelect={handleCompanySelect}
          />
        );
      case 'comparison':
        return (
          <CompanyComparison
            companies={companies}
            onCompanySelect={handleCompanySelect}
          />
        );
      case 'cybersecurity':
        return (
          <CybersecurityHub
            companies={companies}
            onCompanySelect={handleCompanySelect}
          />
        );
      case 'assistance':
        return (
          <AiChatbot
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            onClearHistory={() => setChatHistory([])}
            contextActiveCompany={selectedCompanySymbol || undefined}
            onSaveChat={(title) => handleSaveChat(title, chatHistory)}
            savedChats={savedChats}
            onLoadChat={(chat) => setChatHistory(chat.history)}
          />
        );
      case 'watchlist':
        return renderWatchlistTab();
      case 'profile':
        if (!user) {
          return (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12" id="profile-guest-gate">
              <ShieldAlert className="h-10 w-10 text-indigo-455 mx-auto animate-pulse" />
              <h3 className="font-display text-white font-medium text-sm">Secured Analyst Profile Panel</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">
                Authorization is required to register analyst credentials or trace audit parameters. Sign in to your authorized Analyst identity.
              </p>
              <button
                onClick={() => setTab('auth')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors font-mono"
              >
                Access Login Gateway
              </button>
            </div>
          );
        }
        return (
          <UserProfile
            user={user}
            onUpdateUser={setUser}
            watchlistCount={watchlist.length}
            watchlist={watchlist}
            companies={companies}
            onNavigateDashboard={() => setTab('dashboard')}
            savedChats={savedChats}
            onLoadChat={(chat) => {
              setChatHistory(chat.history);
              setTab('assistance');
            }}
            onDeleteChat={handleDeleteSavedChat}
          />
        );
      case 'auth':
        return (
          <LoginAuth
            onLoginSuccess={(userData, token) => {
              setUser(userData);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('auth_user', JSON.stringify(userData));
              fetchWatchlist(token);
              setTab('dashboard');
            }}
          />
        );
      default:
        return <div className="text-white text-xs">Sandbox error context.</div>;
    }
  };

  // Watchlist dedicated panel layout
  const renderWatchlistTab = () => {
    if (!user) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12" id="watchlist-guest-gate">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="font-display text-white font-medium text-sm">Secured Watchlist Storage</h3>
          <p className="text-slate-400 text-xs leading-relaxed font-sans">
            Authentication is required to save corporate portfolios across sessions. Sign in to your authorized Analyst identity token.
          </p>
          <button
            onClick={() => setTab('auth')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors"
          >
            Access Login Gateway
          </button>
        </div>
      );
    }

    const watchlistedCompanies = companies.filter(c => watchlist.includes(c.symbol));

    return (
      <div className="space-y-6" id="saved-watchlist-tab">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
          <h2 className="text-base font-display text-white font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            My Monitored Enterprise Watchlist
          </h2>
          <p className="text-xs text-slate-500">
            Selected corporations displaying priority alerts or capital allocation monitoring.
          </p>
        </div>

        {watchlistedCompanies.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 py-16 text-center rounded-2xl">
            <Star className="h-8 w-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-400 text-xs italic font-sans">Your watchlist tracker is empty.</p>
            <button
              onClick={() => setTab('search')}
              className="mt-3 text-xs text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Add stocks from screener search &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlistedCompanies.map(c => (
              <div 
                key={c.symbol}
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div onClick={() => setSelectedCompanySymbol(c.symbol)} className="cursor-pointer flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                    <img src={c.logo} alt={c.symbol} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white tracking-wider flex items-center gap-1">
                      {c.symbol}
                    </h4>
                    <p className="text-slate-400 text-xs font-display truncate w-40">{c.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-500 block text-[9px] uppercase">ROE %</span>
                    <span className="text-emerald-400 font-bold">{c.roe}%</span>
                  </div>
                  <button
                    onClick={() => handleToggleWatchlist(c.symbol)}
                    className="text-slate-550 hover:text-rose-400 p-1.5 rounded transition-colors cursor-pointer"
                    title="Remove pinning"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans relative overflow-hidden selection:bg-rose-600 selection:text-white" id="main-application-frame">
        {/* Corporate grid alignment structure background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(2,6,23,1)_100%)] z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 z-0" />
        
        <div className="w-full max-w-lg p-4 relative z-10">
          <LoginAuth
            onLoginSuccess={(userData, token) => {
              setUser(userData);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('auth_user', JSON.stringify(userData));
              fetchWatchlist(token);
              setTab('dashboard');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" id="main-application-frame">
      {/* Global Header */}
      <Navbar
        currentTab={selectedCompanySymbol ? 'search' : currentTab}
        setTab={(tab) => {
          setSelectedCompanySymbol(null);
          setTab(tab);
        }}
        user={user}
        onLogout={handleLogout}
        marketIndex={marketIndex}
        onTriggerDailyUpdate={handleTriggerDailyUpdate}
        isUpdatingIndex={isUpdatingIndex}
        watchlistCount={watchlist.length}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Workspace viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
        {loadingCompanies ? (
          <div className="grid place-items-center py-36">
            <div className="text-center space-y-4">
              <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 font-mono text-xs tracking-wider">Syncing BSI100 corporate ledger structures...</p>
            </div>
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
    </div>
  );
}
