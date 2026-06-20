import React, { useMemo } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, ArrowRight, Zap } from 'lucide-react';

interface VolatilityAlert {
  symbol: string;
  name: string;
  percentage: number;
  direction: 'up' | 'down';
  rawMessage: string;
  timestamp: string;
}

interface VolatilityAlertsProps {
  dailyLogs: { timestamp: string; message: string; type: string }[];
  onCompanySelect: (symbol: string) => void;
}

export default function VolatilityAlerts({ dailyLogs, onCompanySelect }: VolatilityAlertsProps) {
  const alerts: VolatilityAlert[] = useMemo(() => {
    const list: VolatilityAlert[] = [];
    
    dailyLogs.forEach(log => {
      if (log.message.includes('[Volatility Alert]')) {
        try {
          // Format expected: "[Volatility Alert] TCS (TATA CONSULTANCY) stock value drifted by +5.23% over last..."
          const raw = log.message.replace('[Volatility Alert]', '').trim();
          
          // Match symbol, name and percentage
          // e.g., TCS (Tata Consultancy Services) and value drifted by +5.23% or -4.11%
          const pctMatches = raw.match(/([+\-]?\d+(\.\d+)?%)/);
          const symbolMatches = raw.match(/^([A-Z0-9_\-]+)\s*\(([^)]+)\)/);
          
          if (pctMatches) {
            const rawPct = pctMatches[1];
            const cleanPct = parseFloat(rawPct.replace('%', ''));
            const direction = cleanPct >= 0 ? 'up' : 'down';
            
            const symbol = symbolMatches ? symbolMatches[1] : 'STOCK';
            const name = symbolMatches ? symbolMatches[2] : 'NSE Listed Corp';
            
            list.push({
              symbol,
              name,
              percentage: Math.abs(cleanPct),
              direction,
              rawMessage: raw,
              timestamp: log.timestamp
            });
          }
        } catch (e) {
          console.error("Pattern mismatch parsing volatility alert raw log message", e);
        }
      }
    });

    return list;
  }, [dailyLogs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" id="volatility-alerts-feed">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/30 flex items-center justify-center">
            <Zap className="h-4 w-4 animate-bounce" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-sm">24H High-Volatility Warnings</h3>
            <p className="text-slate-500 text-[11px]">Calculated from daily logs & institutional tracking feeds</p>
          </div>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
          {alerts.length} Real-Time Alerts
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs font-mono border border-dashed border-slate-800 rounded-lg flex flex-col items-center gap-2">
          <AlertCircle className="h-5 w-5 text-slate-600 animate-pulse" />
          No heavy price fluctuations detected in the current 24H log cycle.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-3">
          {alerts.slice(0, 6).map((alert, index) => (
            <div 
              key={index}
              className="p-3.5 bg-slate-950 hover:bg-slate-850/60 border border-slate-850 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-450 tracking-wider text-xs">{alert.symbol}</span>
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alert.direction === 'up' 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/30' 
                      : 'bg-rose-950/80 text-rose-450 border border-rose-900/30'
                  }`}>
                    {alert.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {alert.direction === 'up' ? '+' : '-'}{alert.percentage}%
                  </span>
                </div>
                
                <div>
                  <h4 className="text-[11px] font-sans font-medium text-slate-300 truncate max-w-[170px]" title={alert.name}>
                    {alert.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Updated: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[9px] text-slate-550 font-mono">Institutional Watch</span>
                <button
                  onClick={() => onCompanySelect(alert.symbol)}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Drill Stock 
                  <ArrowRight className="h-3 w-3 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
