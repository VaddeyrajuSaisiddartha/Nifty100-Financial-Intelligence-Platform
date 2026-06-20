import React, { useState, useMemo } from 'react';
import { Company } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, ShieldCheck, Grid, List, Check, Star, CornerDownRight } from 'lucide-react';

interface CompanySearchProps {
  companies: Company[];
  sectors: string[];
  onCompanySelect: (symbol: string) => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

type SortField = 'symbol' | 'roe' | 'roce' | 'healthScore' | 'bookValue';
type SortOrder = 'asc' | 'desc';

export default function CompanySearch({
  companies,
  sectors,
  onCompanySelect,
  watchlist,
  onToggleWatchlist
}: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedHealthLabel, setSelectedHealthLabel] = useState('');
  const [minRoe, setMinRoe] = useState<number | ''>('');
  const [sortField, setSortField] = useState<SortField>('healthScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-filter matching
  const filteredAndSorted = useMemo(() => {
    let result = [...companies].map(c => {
      // Calculate scores on the fly for complete sort coverage
      const score = Math.max(10, Math.min(100, Math.round(50 + (c.roe * 0.8) + (c.roce * 0.4) + (c.sector === "Banking" ? 8 : 0))));
      const healthLabel = score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'AVERAGE' : score >= 35 ? 'WEAK' : 'POOR';
      const cyberScore = Math.round(70 + ((c.symbol.charCodeAt(0) + c.symbol.charCodeAt(1)) % 28));
      return {
        ...c,
        healthScore: score,
        healthLabel,
        cyberSecurityScore: cyberScore
      };
    });

    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        c.symbol.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) ||
        c.subSector.toLowerCase().includes(q)
      );
    }

    if (selectedSector) {
      result = result.filter(c => c.sector === selectedSector);
    }

    if (selectedHealthLabel) {
      result = result.filter(c => c.healthLabel === selectedHealthLabel);
    }

    if (minRoe !== '') {
      result = result.filter(c => c.roe >= minRoe);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      } else {
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return result;
  }, [companies, searchTerm, selectedSector, selectedHealthLabel, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6" id="company-finder-panel">
      {/* Search Header and filters bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative space-y-4">
        <h2 className="text-lg font-display text-white font-medium flex items-center gap-2">
          <Search className="h-4.5 w-4.5 text-sky-400" />
          Enterprise Screener & Stock Search
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Plain Text input search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Symbol or Company Name (e.g., TCS, ICICI)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
            />
          </div>

          {/* Sector classification selector */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="">All Sectors</option>
              {sectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Health zone category selector */}
          <div className="relative">
            <select
              value={selectedHealthLabel}
              onChange={(e) => setSelectedHealthLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="">All Health Categories</option>
              <option value="EXCELLENT">EXCELLENT (&ge; 85)</option>
              <option value="GOOD">GOOD (70 - 84)</option>
              <option value="AVERAGE">AVERAGE (50 - 69)</option>
              <option value="WEAK">WEAK (35 - 49)</option>
              <option value="POOR">POOR (&lt; 35)</option>
            </select>
          </div>

          {/* Minimum ROE requirement filter */}
          <div className="relative">
            <select
              value={minRoe}
              onChange={(e) => setMinRoe(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-555 focus:ring-1 focus:ring-emerald-950 transition-all cursor-pointer font-sans"
            >
              <option value="">All ROE Levels</option>
              <option value="12">Min 12% ROE</option>
              <option value="15">Min 15% ROE</option>
              <option value="18">Min 18% ROE</option>
              <option value="22">Min 22% ROE</option>
              <option value="25">Min 25% ROE</option>
            </select>
          </div>
        </div>

        {/* Sort triggers and view mode selectors row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Sort by:</span>
            {[
              { field: 'healthScore', label: 'ML Health Rating' },
              { field: 'roe', label: 'Return on Equity (ROE)' },
              { field: 'roce', label: 'ROCE %' },
              { field: 'bookValue', label: 'Book Value' },
              { field: 'symbol', label: 'Symbol Name' }
            ].map((btn) => {
              const active = sortField === btn.field;
              return (
                <button
                  key={btn.field}
                  onClick={() => handleSort(btn.field as SortField)}
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                    active 
                      ? 'bg-sky-950 text-sky-400 border-sky-800' 
                      : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                  {active && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850">
            <button
              onClick={() => setViewMode('grid')}
              className={`h-7 w-7 rounded flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-7 w-7 rounded flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List items viewports */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
          <span>Found {filteredAndSorted.length} matching corporate listings</span>
          <span>Currency unit: INR Crores (Cr)</span>
        </div>

        {filteredAndSorted.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 py-12 text-center rounded-2xl">
            <p className="text-slate-400 text-xs italic">No enterprise matches your active search constraints.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedSector(''); setSelectedHealthLabel(''); }}
              className="mt-3 text-xs text-sky-500 hover:underline"
            >
              Reset Search Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View layout with gorgeous cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="screener-grid-layout">
            {filteredAndSorted.map((c) => {
              const isFav = watchlist.includes(c.symbol);
              const labelColor = 
                c.healthLabel === 'EXCELLENT' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                c.healthLabel === 'GOOD' ? 'bg-emerald-900/10 text-emerald-300 border-emerald-900/30' :
                c.healthLabel === 'AVERAGE' ? 'bg-sky-950/40 text-sky-400 border-sky-800/40' :
                c.healthLabel === 'WEAK' ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' :
                'bg-rose-950/40 text-rose-400 border-rose-800/40';

              return (
                <div 
                  key={c.symbol}
                  className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-950/10 transition-all flex flex-col justify-between space-y-4 group relative"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleWatchlist(c.symbol); }}
                    className="absolute top-4 right-4 h-7 w-7 rounded-lg bg-slate-950/60 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 text-xs text-slate-400 cursor-pointer"
                    title={isFav ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Star className={`h-4.5 w-4.5 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                  </button>

                  <div onClick={() => onCompanySelect(c.symbol)} className="cursor-pointer space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                        <img src={c.logo} alt={c.symbol} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-mono font-bold text-white tracking-wider group-hover:text-sky-400 flex items-center gap-1.5 transition-colors">
                          {c.symbol}
                          <span className="text-[9px] px-1 bg-slate-950 rounded border border-slate-800 text-slate-400 uppercase font-light">
                            NSE
                          </span>
                        </h3>
                        <p className="text-slate-400 text-xs truncate w-48 font-display">{c.name}</p>
                      </div>
                    </div>

                    {/* Industrial context description excerpt */}
                    <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                      {c.about}
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850/60 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500">ROE:</span>
                        <span className="text-slate-200 font-medium ml-1.5">{c.roe}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500">ROCE:</span>
                        <span className="text-slate-200 font-medium ml-1.5">{c.roce}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Book V:</span>
                        <span className="text-slate-200 ml-1.5">{c.bookValue}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Face V:</span>
                        <span className="text-slate-200 ml-1.5">{c.faceValue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-850/60">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border tracking-wider uppercase ${labelColor}`}>
                      {c.healthLabel}
                    </span>
                    <button
                      onClick={() => onCompanySelect(c.symbol)}
                      className="text-xs text-sky-400 group-hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Audit Details
                      <CornerDownRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View layout with clean horizontal records */
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" id="screener-list-layout">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-505 bg-slate-950 font-mono uppercase tracking-wider text-[10px]">
                    <th className="p-4">Symbol</th>
                    <th className="py-4 px-2">Company Name</th>
                    <th className="py-4 px-2">Sector & Sub-Sector</th>
                    <th className="py-4 px-2 text-right">ROE</th>
                    <th className="py-4 px-2 text-right">ROCE</th>
                    <th className="py-4 px-2 text-right">Book Value</th>
                    <th className="py-4 px-2 text-center">Health Rating</th>
                    <th className="p-4 text-center">Pin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-805 text-slate-200">
                  {filteredAndSorted.map((c) => {
                    const isFav = watchlist.includes(c.symbol);
                    return (
                      <tr 
                        key={c.symbol} 
                        onClick={() => onCompanySelect(c.symbol)}
                        className="hover:bg-slate-850/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-4 font-mono font-bold text-sky-400 group-hover:underline">
                          {c.symbol}
                        </td>
                        <td className="py-3 px-2 font-display">{c.name}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="text-slate-300">{c.sector}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{c.subSector}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-semibold text-emerald-400">{c.roe}%</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-300">{c.roce}%</td>
                        <td className="py-3 px-2 text-right font-mono text-slate-400">INR {c.bookValue}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider font-sans border uppercase ${
                            c.healthLabel === 'EXCELLENT' ? 'bg-emerald-950/45 text-emerald-400 border-emerald-900/40' :
                            c.healthLabel === 'GOOD' ? 'bg-emerald-950/15 text-emerald-300 border-emerald-950/30' :
                            c.healthLabel === 'AVERAGE' ? 'bg-sky-950/45 text-sky-400 border-sky-850/40' :
                            c.healthLabel === 'WEAK' ? 'bg-amber-950/45 text-amber-400 border-amber-850/40' :
                            'bg-rose-950/45 text-rose-400 border-rose-850/40'
                          }`}>
                            {c.healthLabel} ({c.healthScore})
                          </span>
                        </td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onToggleWatchlist(c.symbol)}
                            className="text-slate-400 hover:text-amber-400 cursor-pointer"
                          >
                            <Star className={`h-4.5 w-4.5 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
