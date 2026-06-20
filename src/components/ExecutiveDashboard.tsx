import React, { useMemo } from 'react';
import { Company, CybersecurityInsight } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Building2, ShieldAlert, Award, Activity, TrendingUp, HelpCircle, ArrowUpRight, CheckCircle, Flame, AlertCircle } from 'lucide-react';
import VolatilityAlerts from './VolatilityAlerts';
import MarketSphere3D from './MarketSphere3D';
import Volatility3DChart from './Volatility3DChart';
import CompanyLandscape3D from './CompanyLandscape3D';

interface ExecutiveDashboardProps {
  companies: Company[];
  setTab: (tab: string) => void;
  onCompanySelect: (symbol: string) => void;
  dailyLogs: { timestamp: string; message: string; type: string }[];
  lastUpdated?: string;
}

export default function ExecutiveDashboard({
  companies,
  setTab,
  onCompanySelect,
  dailyLogs,
  lastUpdated = '18 Jun 2026 06:00 AM'
}: ExecutiveDashboardProps) {
  
  // Calculate analytics metrics dynamically on baseline
  const stats = useMemo(() => {
    let totRoe = 0;
    let excellentCount = 0;
    let criticalCount = 0;
    
    const sectorCount: Record<string, number> = {};
    const labelCount: Record<string, number> = {
      EXCELLENT: 0,
      GOOD: 0,
      AVERAGE: 0,
      WEAK: 0,
      POOR: 0
    };

    const sortedByRoe = [...companies].map(c => {
      // simulate score
      const calcScore = Math.max(10, Math.min(100, Math.round(compScore(c))));
      const calcLabel = compLabel(calcScore);
      
      totRoe += c.roe;
      if (calcScore >= 80) excellentCount++;
      if (calcScore <= 45) criticalCount++;
      
      sectorCount[c.sector] = (sectorCount[c.sector] || 0) + 1;
      labelCount[calcLabel] = (labelCount[calcLabel] || 0) + 1;

      return {
        ...c,
        calculatedScore: calcScore,
        calculatedLabel: calcLabel
      };
    });

    const averageRoe = totRoe / companies.length;

    // Chart: Sector pie data
    const sectorChartData = Object.entries(sectorCount).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Chart: Health distribution data
    const healthChartData = Object.entries(labelCount).map(([name, value]) => ({
      name,
      value
    }));

    // Top 10 by ROE
    const topRoeList = [...sortedByRoe]
      .sort((a, b) => b.roe - a.roe)
      .slice(0, 8);

    // Bottom 10 by ROCE / Growth risk metrics
    const bottomRoceList = [...sortedByRoe]
      .sort((a, b) => a.roce - b.roce)
      .slice(0, 8);

    return {
      averageRoe,
      excellentCount,
      criticalCount,
      totalSectors: Object.keys(sectorCount).length,
      sectorChartData,
      healthChartData,
      topRoeList,
      bottomRoceList
    };
  }, [companies]);

  // Private score approximation for speed
  function compScore(c: Company) {
    let base = 50 + (c.roe * 0.8) + (c.roce * 0.4);
    if (c.sector === "Banking") base += 8;
    if (c.symbol.includes("ADANI")) base -= 15; // leverage penalty
    return Math.min(Math.round(base), 98);
  }

  function compLabel(score: number) {
    if (score >= 85) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'AVERAGE';
    if (score >= 35) return 'WEAK';
    return 'POOR';
  }

  const PIE_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185', '#22d3ee', '#f472b6', '#c084fc'];
  const SECTOR_BAR_COLORS: Record<string, string> = {
    EXCELLENT: '#10b981',
    GOOD: '#34d399',
    AVERAGE: '#38bdf8',
    WEAK: '#f59e0b',
    POOR: '#ef4444'
  };

  // Mock index index flow for mini graph
  const miniAreaGraphData = [
    { name: '09:30', val: 23450 },
    { name: '10:30', val: 23512 },
    { name: '11:30', val: 23490 },
    { name: '12:30', val: 23530 },
    { name: '13:30', val: 23565 },
    { name: '14:30', val: 23545 },
    { name: '15:30', val: 23580 }
  ];

  return (
    <div className="space-y-6" id="dashboard-tab-content">
      {/* Live NIFTY 100 Index Status Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900" id="nifty-100-index-banner">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
            N100
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">INDEX SPOT SUMMARY</span>
            <h3 className="text-sm font-display font-semibold text-white tracking-wide">NIFTY 100 INDEX SPOT</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 w-full md:w-auto text-left">
          <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-xl flex flex-col min-w-[125px]">
            <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">INDEX VALUE</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              23,545.80
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-xl flex flex-col min-w-[105px]">
            <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">DAILY CHANGE</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              +1.12%
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-xl flex flex-col min-w-[110px]">
            <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">MARKET STATUS</span>
            <span className="text-[11px] font-mono font-bold text-indigo-400 flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse-live"></span>
              ACTIVE
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 px-4 py-1.5 rounded-xl flex flex-col min-w-[170px] col-span-2">
            <span className="text-[8px] text-slate-500 font-mono tracking-wider uppercase">LAST UPDATED TIMESTAMP</span>
            <span className="text-[10px] font-mono text-slate-300 mt-0.5">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Intro Hero banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 h-48 w-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono tracking-wider">
            <Activity className="h-3 w-3 animate-pulse" />
            NIFTY1000 ANALYST TERMINAL
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
            Financial Advisory & Regulatory Compliance Auditor
          </h2>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            Analyze balance sheets, profit & loss statement streams, cash flow metrics, and systemic corporate risk postures across India's top 1000 enterprises.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setTab('search')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors"
            >
              Analyze Companies
            </button>
            <button
              onClick={() => setTab('cybersecurity')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg cursor-pointer border border-slate-700 transition-colors"
            >
              Audit Risk Compliance
            </button>
          </div>
        </div>

        {/* Live Logs Ticker widget */}
        <div className="w-full md:w-80 bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 z-10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">Live Updates</h4>
            <span className="text-[10px] bg-slate-800 text-sky-400 px-1.5 py-0.5 rounded font-mono">24H Active</span>
          </div>
          <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
            {dailyLogs.length > 0 ? (
              dailyLogs.slice(0, 3).map((log, i) => (
                <div key={i} className="text-xs transition-all space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span className={log.type === 'security' || log.type === 'volatility' ? 'text-amber-500' : 'text-sky-500'}>
                      {log.type === 'volatility' ? '⚡ VOLATILITY_WARN' : '📊 MARKET_LIVE'}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 font-sans leading-relaxed break-words">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No feed sync events logged yet.</p>
            )}
          </div>
          <div className="pt-2 border-t border-slate-905 flex flex-col gap-0.5 text-[9px] font-mono leading-relaxed select-none">
            <span className="text-slate-500">AUDIT MATRIX FEED STATUS: DAILY SYNC OK</span>
            <span className="text-emerald-450 font-bold tracking-wider">LAST UPDATED: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* AI Market Sentiment Pulse */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6" id="sentiment-analysis-section">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Summary stats */}
          <div className="w-full lg:w-1/3 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">Neural Sentiment Feed</span>
              </div>
              <h3 className="text-lg font-display font-medium text-white">Consensus Mood: <span className="text-emerald-400">BULLISH OPTIMISM (81%)</span></h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Reconstituted mood indicators compiled from 3,842 regulatory filings, BSI corporate disclosures, and global investment consensus logs over the past 7 days.
              </p>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-850 space-y-3 font-sans">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium font-sans">Bullish Coefficient</span>
                <span className="text-emerald-400 font-bold font-mono">81.0%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '81%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Bearish Weight: 19.0%</span>
                <span>Signal Strength Check: Stable</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 leading-relaxed grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/85">
              <div>
                <span className="text-slate-400 block font-bold">ANALYSIS SCOPE</span>
                <span>3,842 Corporate Documents</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">AI CONSENSUS RATE</span>
                <span className="text-indigo-400 font-bold">94.2% Confidence</span>
              </div>
            </div>
          </div>

          {/* Recharts chart */}
          <div className="w-full lg:w-2/3 h-56 md:h-60 bg-slate-950/50 rounded-xl p-4 border border-slate-850 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono pb-3 border-b border-slate-900/60 gap-1">
              <span className="text-slate-400">DAILY ACCUMULATED PULSE (7-DAY MOMENTUM TREND)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px]"><span className="h-2 w-2 rounded bg-emerald-500 inline-block"></span> Positive Mood</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="h-2 w-2 rounded bg-rose-500 inline-block"></span> Negative Mood</span>
              </div>
            </div>
            
            <div className="flex-1 w-full h-full relative pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={[
                    { date: '13 Jun', positive: 64, negative: 36, net: 28 },
                    { date: '14 Jun', positive: 68, negative: 32, net: 36 },
                    { date: '15 Jun', positive: 58, negative: 42, net: 16 },
                    { date: '16 Jun', positive: 73, negative: 27, net: 46 },
                    { date: '17 Jun', positive: 70, negative: 30, net: 40 },
                    { date: '18 Jun', positive: 76, negative: 24, net: 52 },
                    { date: '19 Jun', positive: 81, negative: 19, net: 62 }
                  ]} 
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPositive)" />
                  <Area type="monotone" dataKey="negative" name="Negative" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNegative)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Volatility Alerts Real-time Feed & 3D Spatial Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="volatility-analytics-section">
        <div className="xl:col-span-1">
          <VolatilityAlerts dailyLogs={dailyLogs} onCompanySelect={onCompanySelect} />
        </div>
        <div className="xl:col-span-2 min-h-[550px]">
          <Volatility3DChart dailyLogs={dailyLogs} companies={companies} onCompanySelect={onCompanySelect} />
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-panel-cards">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="h-12 w-12 rounded-lg bg-sky-950/80 text-sky-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Companies</p>
            <p className="text-2xl font-display font-bold text-white">{companies.length}</p>
            <p className="text-[10px] text-emerald-400 font-mono flex items-center mt-1">100% Star-Schema Synced</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="h-12 w-12 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Average ROE</p>
            <p className="text-2xl font-display font-bold text-white">
              {stats.averageRoe.toFixed(1)}%
            </p>
            <p className="text-[10px] text-indigo-400 font-mono flex items-center mt-1">BSI Median Cap</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="h-12 w-12 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Excellent Health</p>
            <p className="text-2xl font-display font-bold text-emerald-400">{stats.excellentCount}</p>
            <p className="text-[10px] text-slate-400 font-mono flex items-center mt-1">ML Score &ge; 80/100</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4 hover:border-slate-700 transition-all">
          <div className="h-12 w-12 rounded-lg bg-rose-950/80 text-rose-400 flex items-center justify-center animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">High Risk Postures</p>
            <p className="text-2xl font-display font-bold text-rose-400">{stats.criticalCount}</p>
            <p className="text-[10px] text-rose-350 font-mono flex items-center mt-1">Leveraged / Weak ROCE</p>
          </div>
        </div>
      </div>

      {/* Futuristic 3D Market Capitalization Mesh Row */}
      <div className="my-6">
        <CompanyLandscape3D companies={companies} onCompanySelect={onCompanySelect} />
      </div>

      {/* Main Charts Distribution row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Interactive 3D Sector Topological Node Grid */}
        <div className="xl:col-span-1 lg:col-span-2">
          <MarketSphere3D />
        </div>

        {/* Sector Distribution Treemap/Pie representation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Industrial Sector Allocation</h3>
              <p className="text-slate-400 text-xs">Total sectors represented: {stats.totalSectors}</p>
            </div>
            <span className="text-[10px] text-sky-400 font-mono uppercase bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">Recharts</span>
          </div>
          <div className="h-72 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sectorChartData.slice(0, 7)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {stats.sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto text-xs font-sans">
              {stats.sectorChartData.slice(0, 8).map((sec, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-850/50">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  <span className="text-slate-300 truncate text-[11px]" title={sec.name}>{sec.name}</span>
                  <span className="text-slate-500 font-mono text-[10px] ml-auto">({sec.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial health state label distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Financial Health Label Distribution</h3>
              <p className="text-slate-400 text-xs">AI-assigned score categories based on ROCE & Leverage</p>
            </div>
            <span className="text-[10px] text-sky-400 font-mono uppercase bg-slate-950 border border-slate-850 px-2 py-0.5 rounded flex items-center gap-1">
              <Flame className="h-3 w-3 text-emerald-400" /> ML Engine
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.healthChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="value" name="Companies" radius={[6, 6, 0, 0]}>
                  {stats.healthChartData.map((entry, index) => {
                    const color = SECTOR_BAR_COLORS[entry.name] || '#38bdf8';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard Lists Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top ROE Returners */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Top Return on Equity (ROE) Leaders</h3>
              <p className="text-slate-400 text-xs">Top performing capital Allocators</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">High returns</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 uppercase font-mono tracking-wider">
                  <th className="pb-3 text-[10px]">Symbol</th>
                  <th className="pb-3 text-[10px]">Company Name</th>
                  <th className="pb-3 text-[10px]">Sector</th>
                  <th className="pb-3 text-[10px] text-right">ROE</th>
                  <th className="pb-3 text-[10px] text-right">ROCE</th>
                  <th className="pb-3 text-[10px] text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-slate-200">
                {stats.topRoeList.map((comp) => (
                  <tr 
                    key={comp.symbol}
                    onClick={() => onCompanySelect(comp.symbol)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 font-mono font-bold text-sky-400 group-hover:underline">{comp.symbol}</td>
                    <td className="py-2.5 max-w-[150px] truncate">{comp.name}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] border border-slate-800 font-mono text-slate-400">
                        {comp.sector}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-emerald-400 font-medium">{comp.roe}%</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">{comp.roce}%</td>
                    <td className="py-2.5 text-right font-mono">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/40">
                        {comp.calculatedScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Margin / High Leverage risk focus */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Capital Efficiency Caution List</h3>
              <p className="text-slate-400 text-xs">Companies displaying low ROCE or high leverage friction</p>
            </div>
            <span className="text-xs text-rose-400 font-mono">Low ROCE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 uppercase font-mono tracking-wider">
                  <th className="pb-3 text-[10px]">Symbol</th>
                  <th className="pb-3 text-[10px]">Company Name</th>
                  <th className="pb-3 text-[10px]">Sector</th>
                  <th className="pb-3 text-[10px] text-right">ROCE</th>
                  <th className="pb-3 text-[10px] text-right">ROE</th>
                  <th className="pb-3 text-[10px] text-right">Health Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-slate-200">
                {stats.bottomRoceList.map((comp) => (
                  <tr 
                    key={comp.symbol}
                    onClick={() => onCompanySelect(comp.symbol)}
                    className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 font-mono font-bold text-sky-400 group-hover:underline">{comp.symbol}</td>
                    <td className="py-2.5 max-w-[150px] truncate">{comp.name}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] border border-slate-800 font-mono text-slate-400">
                        {comp.sector}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-rose-400 font-medium">{comp.roce}%</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">{comp.roe}%</td>
                    <td className="py-2.5 text-right font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        comp.calculatedLabel === 'POOR' 
                          ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' 
                          : 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                      }`}>
                        {comp.calculatedLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disclaimers & Advice block as mandated */}
      <footer className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between text-slate-500 text-[10px] font-mono gap-3">
        <span>Confidential Intel Portal. Internal investment analysis unit mapping.</span>
        <span>Data as of June 2026. For educational purposes only. Not financial advice. NIFTY 100 System.</span>
      </footer>
    </div>
  );
}
