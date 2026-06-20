import React, { useMemo, useState } from 'react';
import { Company } from '../types';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Layers, HelpCircle, BarChart3, TrendingUp, Group, LayoutList, Trophy } from 'lucide-react';

interface SectorAnalyticsProps {
  companies: Company[];
  onCompanySelect: (symbol: string) => void;
}

export default function SectorAnalytics({
  companies,
  onCompanySelect
}: SectorAnalyticsProps) {
  const [selectedSector, setSelectedSector] = useState<string>('IT');

  const sectorAggregates = useMemo(() => {
    const sectorMap: Record<string, {
      name: string;
      totalSales: number;
      avgRoe: number;
      avgRoce: number;
      avgDebtToEquity: number;
      count: number;
      companies: Company[];
    }> = {};

    companies.forEach(c => {
      if (!sectorMap[c.sector]) {
        sectorMap[c.sector] = {
          name: c.sector,
          totalSales: 0,
          avgRoe: 0,
          avgRoce: 0,
          avgDebtToEquity: 0.3,
          count: 0,
          companies: []
        };
      }

      const item = sectorMap[c.sector];
      item.count += 1;
      item.avgRoe += c.roe;
      item.avgRoce += c.roce;
      item.companies.push(c);
      
      // Seed sales estimates based on sector patterns for bubble sizes
      item.totalSales += (c.sector === 'IT' ? 8500 : c.sector === 'Banking' ? 24000 : c.sector === 'Energy' ? 18000 : 5000);
    });

    return Object.values(sectorMap).map(sec => ({
      ...sec,
      avgRoe: parseFloat((sec.avgRoe / sec.count).toFixed(1)),
      avgRoce: parseFloat((sec.avgRoce / sec.count).toFixed(1)),
      avgDebtToEquity: parseFloat((sec.name === 'Energy' ? 1.4 : sec.name === 'Pharma' ? 0.35 : sec.name === 'Power' ? 2.1 : 0.42).toFixed(2))
    }));
  }, [companies]);

  // Sector list from aggregates
  const sectorList = useMemo(() => {
    return sectorAggregates.map(s => s.name);
  }, [sectorAggregates]);

  const topCompaniesInActiveSector = useMemo(() => {
    const activeSec = sectorAggregates.find(s => s.name === selectedSector);
    if (!activeSec) return [];

    return [...activeSec.companies]
      .sort((a, b) => b.roce - a.roce)
      .slice(0, 6);
  }, [sectorAggregates, selectedSector]);

  const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb7185', '#22d3ee', '#f472b6', '#c084fc'];

  return (
    <div className="space-y-6" id="sector-analytics-viewport">
      {/* Visual Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
        <h2 className="text-lg font-display text-white font-medium flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-400" />
          Sector Macro Comparison & Benchmarking
        </h2>
        <p className="text-slate-400 text-xs max-w-2xl">
          Conduct macro side-by-side asset comparison mapping average ROE against average ROCE returns across all sectors.
        </p>
      </div>

      {/* Bar Chart comparing ROE and ROCE card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Comparison Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Sector Capital Efficiency & Equity Returns Benchmarking</h3>
              <p className="text-slate-500 text-[11px]">Side-by-Side Comparison of Avg ROE (%) and Avg ROCE (%) by Sector Segment</p>
            </div>
            <span className="text-[10px] text-indigo-400 bg-slate-950 px-2 py-0.5 rounded font-mono uppercase">Recharts Bar</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorAggregates}
                margin={{ top: 20, right: 10, bottom: 10, left: -10 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }}
                  itemStyle={{ fontSize: '11px', color: '#ffffff' }}
                  labelStyle={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Bar dataKey="avgRoe" name="Average Return on Equity (ROE) %" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgRoce" name="Average Return on Capital Employed (ROCE) %" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrix scoring summary */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Sector Averages Scorecard
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {sectorAggregates.map((sec, idx) => (
              <div key={sec.name} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 hover:border-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-display font-medium text-white text-xs flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {sec.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">({sec.count} stocks)</span>
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-center bg-slate-900/60 p-1.5 rounded">
                  <div>
                    <p className="text-slate-500">ROE %</p>
                    <p className="text-emerald-400 font-semibold">{sec.avgRoe}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">ROCE %</p>
                    <p className="text-sky-400 font-semibold">{sec.avgRoce}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">D/E Ratio</p>
                    <p className="text-amber-500 font-semibold">{sec.avgDebtToEquity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector drilled detail breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector explorer filters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-display font-medium text-white text-sm">Industrial Driller</h3>
          <p className="text-xs text-slate-400">Select an industrial sector segment to view leading capital allocators rating parameters.</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {sectorList.map(sec => {
              const active = selectedSector === sec;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-2 text-xs font-mono font-medium rounded-lg border text-left cursor-pointer transition-colors ${
                    active 
                      ? 'bg-sky-950 text-sky-300 border-sky-850' 
                      : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {sec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill Table Visuals */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 lg:col-span-2">
          <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Trophy className="h-4.5 w-4.5 text-amber-400" />
            Top Performance Allocators in {selectedSector}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Company Title</th>
                  <th className="pb-3 text-right">ROCE</th>
                  <th className="pb-3 text-right">ROE</th>
                  <th className="pb-3 text-right">Book Value</th>
                  <th className="pb-3 text-center">Analyze</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/65 text-slate-300">
                {topCompaniesInActiveSector.map(c => (
                  <tr key={c.symbol} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-sky-400">{c.symbol}</td>
                    <td className="py-2.5 max-w-[170px] truncate">{c.name}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-400 font-semibold">{c.roce}%</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">{c.roe}%</td>
                    <td className="py-2.5 text-right font-mono text-slate-40s">INR {c.bookValue}</td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => onCompanySelect(c.symbol)}
                        className="text-[10px] text-sky-400 hover:underline font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                      >
                        Drill &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
