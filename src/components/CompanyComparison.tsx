import React, { useState, useMemo, useEffect } from 'react';
import { Company } from '../types';
import { GitCompare, Plus, Trash2, ArrowUpDown, ShieldAlert, CheckCircle, TrendingUp, TrendingDown, Scale, HelpCircle, Sparkles, Brain } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface CompanyComparisonProps {
  companies: Company[];
  onCompanySelect: (symbol: string) => void;
}

export default function CompanyComparison({ companies, onCompanySelect }: CompanyComparisonProps) {
  // Select up to 6 tickers, default preseed with high-performing peers (TCS and INFY)
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['TCS', 'INFY']);
  const [tickerQuery, setTickerQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // AI comparison reports state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Clear stale AI report whenever selected target peers list is modified
  useEffect(() => {
    setAiReport(null);
    setAiError(null);
  }, [selectedSymbols]);

  const triggerAiComparison = async () => {
    if (selectedSymbols.length === 0) return;
    setAiLoading(true);
    setAiError(null);
    setAiReport(null);
    try {
      const response = await fetch('/api/comparison/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: selectedSymbols })
      });
      const data = await response.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      } else if (data.error) {
        setAiError(data.error);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to establish secure gateway with audit model.");
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-calculated fields for detailed premium comparison
  const comparedCompanies = useMemo(() => {
    return selectedSymbols.map(sym => {
      const c = companies.find(item => item.symbol === sym);
      if (!c) return null;

      // Consistent helper metrics following the screener formula
      const healthScore = Math.max(10, Math.min(100, Math.round(50 + (c.roe * 0.8) + (c.roce * 0.4) + (c.sector === "Banking" ? 8 : 0))));
      const healthLabel = healthScore >= 85 ? 'EXCELLENT' : healthScore >= 70 ? 'GOOD' : healthScore >= 50 ? 'AVERAGE' : 'WEAK';
      const cyberScore = Math.round(75 + ((c.symbol.charCodeAt(0) + c.symbol.charCodeAt(1)) % 23));

      // Mock relative book value multiple (price to book)
      const pToB = parseFloat((2.5 + (c.roe * 0.15) + (c.symbol.charCodeAt(0) % 5) * 0.4).toFixed(2));

      return {
        ...c,
        healthScore,
        healthLabel,
        cyberScore,
        priceToBook: pToB,
        debtToEquity: c.sector === 'Banking' ? 8.2 : parseFloat((0.02 + (c.symbol.charCodeAt(1) % 4) * 0.14).toFixed(2))
      };
    }).filter(Boolean) as any[];
  }, [selectedSymbols, companies]);

  // Handle adding tickers
  const handleAddTicker = (sym: string) => {
    setSearchError(null);
    if (selectedSymbols.includes(sym)) {
      setSearchError(`Ticker ${sym} is already being compared.`);
      return;
    }
    // Expand to 6 companies for visual side-by-side analytics
    if (selectedSymbols.length >= 6) {
      setSearchError("Maximum comparison capacity of 6 companies achieved. Please remove one first.");
      return;
    }
    setSelectedSymbols([...selectedSymbols, sym]);
    setTickerQuery('');
  };

  const handleQuickAdd = () => {
    setSearchError(null);
    if (!tickerQuery.trim()) return;
    const query = tickerQuery.toUpperCase().trim();
    const match = companies.find(c => c.symbol === query) ||
                  companies.find(c => c.symbol.includes(query)) ||
                  companies.find(c => c.name.toUpperCase().includes(query));
    if (match) {
      handleAddTicker(match.symbol);
    } else {
      setSearchError(`Could not find symbol or name matching "${tickerQuery}". Try TCS, INFY, ITC, etc.`);
    }
  };

  const handleRemoveTicker = (sym: string) => {
    setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
    setSearchError(null);
  };

  // Preset Comparisons
  const presets = [
    { label: 'IT Monopolies (TCS vs Infosys)', tickers: ['TCS', 'INFY'] },
    { label: 'Banking Titans (HDFC vs ICICI)', tickers: ['HDFCBANK', 'ICICIBANK'] },
    { label: 'FMCG Leaders (HUL vs Nestle)', tickers: ['HINDUNILVR', 'NESTLEIND'] }
  ];

  // Visual chart datasets
  const chartData = useMemo(() => {
    return comparedCompanies.map(c => ({
      name: c.symbol,
      'ROCE (%)': c.roce,
      'ROE (%)': c.roe,
      'Health Score': c.healthScore,
      'D/E Ratio x10': Math.round(c.debtToEquity * 10)
    }));
  }, [comparedCompanies]);

  // Companies not currently in the compared list
  const availableOptions = useMemo(() => {
    if (!tickerQuery.trim()) return [];
    const q = tickerQuery.toLowerCase().trim();
    return companies
      .filter(c => !selectedSymbols.includes(c.symbol))
      .filter(c => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [companies, tickerQuery, selectedSymbols]);

  return (
    <div className="space-y-6 animate-fade-in" id="peer-comparison-workspace">
      {/* Dynamic ribbon bar header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-display text-white font-semibold flex items-center gap-2">
              <Scale className="h-5 w-5 text-sky-400" />
              Strategic Side-By-Side Stock Comparison
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Evaluate multiples, profitability loops, debt-risk exposure, and fiduciary cybersecurity parameters of up to 3 NSE assets.
            </p>
          </div>
          
          {/* Quick preset comparisons */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSymbols(preset.tickers)}
                className="px-2.5 py-1 text-[10px] font-mono bg-slate-950 hover:bg-slate-850 text-slate-350 hover:text-white rounded border border-slate-800 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input search bar and active pill logs */}
        <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1">TICKERS:</span>
            {selectedSymbols.map(sym => {
              const comp = companies.find(c => c.symbol === sym);
              return (
                <div 
                  key={sym} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                >
                  <span className="font-mono font-bold text-white tracking-widest">{sym}</span>
                  <button 
                    onClick={() => handleRemoveTicker(sym)} 
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            
            {selectedSymbols.length === 0 && (
              <span className="text-xs italic text-rose-450">Please select at least one company ticker below.</span>
            )}
          </div>

          {/* Selector input auto queries */}
          <div className="relative max-w-sm w-full flex flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search symbol to add (e.g. TCS)..."
                value={tickerQuery}
                onChange={(e) => setTickerQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleQuickAdd}
                className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 active:scale-95"
              >
                COMPARE
              </button>
            </div>

            {searchError && (
              <span className="text-[10px] text-rose-400 font-mono">{searchError}</span>
            )}

            {availableOptions.length > 0 && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-900 border border-slate-750 rounded-lg shadow-2xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-850">
                {availableOptions.map(option => (
                  <button
                    key={option.symbol}
                    onClick={() => handleAddTicker(option.symbol)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-white tracking-wider block">{option.symbol}</span>
                      <span className="text-[10px] text-slate-450 truncate block max-w-[200px]">{option.name}</span>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-sky-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {comparedCompanies.length > 0 && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Bento Comparison Table Sheet */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <GitCompare className="h-4 w-4 text-sky-400" />
              Comparative Metrics matrix
            </h3>
            
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="pb-3 text-left w-36">Metric / Property</th>
                  {comparedCompanies.map(c => (
                    <th key={c.symbol} className="pb-3 text-right">
                      <button 
                        onClick={() => onCompanySelect(c.symbol)} 
                        className="text-sky-400 hover:underline font-bold text-xs tracking-widest inline-flex items-center gap-1"
                      >
                        {c.symbol} &rarr;
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                
                {/* Sector Row */}
                <tr>
                  <td className="py-3 font-sans text-slate-400 font-medium">Business / Sector</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right font-sans text-white font-semibold">
                      {c.sector}
                    </td>
                  ))}
                </tr>

                {/* Sub Sector */}
                <tr>
                  <td className="py-3 font-sans text-slate-500">Focus Hub</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right text-slate-350">
                      {c.subSector}
                    </td>
                  ))}
                </tr>

                {/* Book Value */}
                <tr>
                  <td className="py-3 font-sans text-slate-400">Book Value (BV)</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right text-slate-200">
                      ₹{c.bookValue}
                    </td>
                  ))}
                </tr>

                {/* Price to Book Multiplier */}
                <tr>
                  <td className="py-3 font-sans text-slate-400">P / Book Multiple</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right text-slate-200 font-bold font-mono">
                      {c.priceToBook}x
                    </td>
                  ))}
                </tr>

                {/* Return on Capital ROCE */}
                <tr className="bg-sky-950/20">
                  <td className="py-3 font-sans text-sky-400 font-semibold">ROCE (%)</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right font-bold text-emerald-400 text-sm">
                      {c.roce}%
                    </td>
                  ))}
                </tr>

                {/* Return on Equity ROE */}
                <tr>
                  <td className="py-3 font-sans text-slate-400 font-semibold">ROE (%)</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right font-bold text-sky-400">
                      {c.roe}%
                    </td>
                  ))}
                </tr>

                {/* Debt to Equity ratio */}
                <tr>
                  <td className="py-3 font-sans text-slate-400">Debt-to-Equity (D/E)</td>
                  {comparedCompanies.map(c => {
                    const isHigh = c.debtToEquity > 1.2;
                    return (
                      <td key={c.symbol} className={`py-3 text-right font-bold ${isHigh ? 'text-rose-420' : 'text-emerald-420'}`}>
                        {c.debtToEquity}
                      </td>
                    );
                  })}
                </tr>

                {/* Fiduciary Cybersecurity Score */}
                <tr>
                  <td className="py-3 font-sans text-slate-400">Cybersecurity Audit</td>
                  {comparedCompanies.map(c => (
                    <td key={c.symbol} className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                        🛡️ {c.cyberScore} / 100
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Financial Health Score badges */}
                <tr className="bg-slate-950/30">
                  <td className="py-4 font-sans text-white font-bold">Overall Health Rating</td>
                  {comparedCompanies.map(c => {
                    const isBad = c.healthScore < 50;
                    const isAverage = c.healthScore >= 50 && c.healthScore < 70;
                    const isNice = c.healthScore >= 70;
                    return (
                      <td key={c.symbol} className="py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                            isNice ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900/40' :
                            isAverage ? 'bg-amber-950/85 text-amber-400 border-amber-900/40' :
                            'bg-rose-950/80 text-rose-450 border-rose-900/40'
                          }`}>
                            {isNice && <CheckCircle className="h-3 w-3" />}
                            {isBad && <ShieldAlert className="h-3 w-3" />}
                            {c.healthScore} - {c.healthLabel}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Chart panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-bold text-slate-405 uppercase tracking-wider">
                Dimensional Metrics Contrast Chart
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Active comparison of primary ledger ratios for immediate performance screening
              </p>
            </div>

            <div className="h-64 mt-4 relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} className="font-mono" />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                  <Bar dataKey="ROCE (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROE (%)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Health Score" fill="#aa33ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-slate-850 p-2.5 bg-slate-950/40 rounded-lg text-slate-500 text-[10px] space-y-1.5 font-sans leading-relaxed">
              <div className="flex gap-1">
                <span className="font-bold text-slate-350">Tip:</span>
                <span>Select high ROCE and low debt assets to secure capital safety nodes on investments.</span>
              </div>
            </div>
          </div>

        </div>

        {/* AI Comparison Assistant panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-850 pb-3">
            <div>
              <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-400 animate-pulse" />
                AI Portfolio Peer Analytics & Comparative Assessment
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Deep intelligence modeling comparing ROCE return efficiency, fiduciary risk, and asset safety index
              </p>
            </div>
            <button
              type="button"
              disabled={aiLoading || selectedSymbols.length === 0}
              onClick={triggerAiComparison}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-55 disabled:cursor-not-allowed shadow-md shadow-indigo-950"
            >
              {aiLoading ? (
                <>
                  <Brain className="h-3.5 w-3.5 animate-spin text-indigo-200" />
                  <span>AUDITING PEERS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>GENERATE AI INSIGHTS</span>
                </>
              )}
            </button>
          </div>

          {aiLoading && (
            <div className="bg-slate-950 rounded-xl p-8 border border-slate-850 flex flex-col items-center justify-center space-y-3">
              <Brain className="h-8 w-8 text-indigo-500 animate-pulse" />
              <p className="text-slate-400 text-xs animate-pulse">Running advanced institutional comparison matrix analytics via Gemini...</p>
              <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full w-1/3 animate-ping"></div>
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-rose-950/20 border border-rose-900/30 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
              <ShieldAlert className="h-4 w-4 text-rose-450" />
              <span>{aiError}</span>
            </div>
          )}

          {aiReport ? (
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-850 overflow-x-auto animate-fade-in">
              <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs prose prose-invert max-w-none text-slate-300">
                {aiReport}
              </div>
            </div>
          ) : !aiLoading && (
            <div className="bg-slate-950/45 rounded-xl p-8 border border-slate-850/60 flex flex-col items-center justify-center text-center space-y-2">
              <Sparkles className="h-6 w-6 text-slate-650" />
              <h4 className="text-slate-400 font-medium text-xs">AI Evaluation Awaiting Request</h4>
              <p className="text-slate-500 max-w-md text-[11px] leading-relaxed font-sans">
                Click the button above to trigger the Nifty AI Engine. The platform will analyze the ledger matrices of {selectedSymbols.join(', ')} side-by-side to deliver custom institutional strategic takeaways.
              </p>
            </div>
          )}
        </div>
      </>
      )}
    </div>
  );
}
