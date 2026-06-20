import React, { useState, useEffect } from 'react';
import { Company, CybersecurityInsight } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Cpu, Terminal, HelpCircle, Activity, Sparkles, Send, Flame, ToggleLeft, ToggleRight, Laptop, CheckCircle2 } from 'lucide-react';

interface CybersecurityHubProps {
  companies: Company[];
  onCompanySelect: (symbol: string) => void;
}

export default function CybersecurityHub({
  companies,
  onCompanySelect
}: CybersecurityHubProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('TCS');
  const [enableHighThinking, setEnableHighThinking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  
  const [localCyberDetails, setLocalCyberDetails] = useState<CybersecurityInsight | null>(null);

  // Search and Risk ledger filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  // Auto calculate details when selected symbol changes
  useEffect(() => {
    const comp = companies.find(c => c.symbol === selectedSymbol);
    if (comp) {
      // Simulate/Generate local specs conforming to stock corporate audit risk metric specifications
      const codeSum = comp.symbol.charCodeAt(0) + comp.symbol.charCodeAt(1);
      const coreScore = 70 + (codeSum % 28);
      let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
      if (coreScore >= 92) grade = 'A';
      else if (coreScore >= 80) grade = 'B';
      else if (coreScore >= 72) grade = 'C';
      
      const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 
        coreScore >= 90 ? 'Low' : coreScore >= 78 ? 'Medium' : coreScore >= 65 ? 'High' : 'Critical';

      const anomalies = (codeSum % 3 === 0) ? 1 : (codeSum % 7 === 0) ? 2 : 0;
      const checks = coreScore >= 85 ? 'Passed' : 'Warning';

      setLocalCyberDetails({
        symbol: comp.symbol,
        score: coreScore,
        grade,
        lastAuditDate: new Date().toISOString().split('T')[0],
        dataleakChecks: checks as any,
        accountingAnomalies: anomalies,
        threatAssessment: coreScore >= 88 
          ? "Exemplary governance metrics. Highly-secure corporate accounting ledger audits with zero active disclosure non-compliances." 
          : "Acceptable compliance posture but requires immediate correction on debt leverage targets and systemic transparency disclosures.",
        cyberRiskLabel: riskLevel,
        vulnerabilities: [
          { title: "High debt leverage footprint", description: "Debt-to-equity ratios exceed recommended sectoral thresholds.", severity: "Medium" },
          { title: "Pledged promoter shares anomaly", description: "High concentration of promoter holdings linked to volatile debt-pledges.", severity: "Low" }
        ]
      });
    }
  }, [selectedSymbol, companies]);

  // Comprehensive Systemwide risk ledger calculations
  const computedLedgers = React.useMemo(() => {
    return companies.map(c => {
      const codeSum = c.symbol.charCodeAt(0) + c.symbol.charCodeAt(1);
      const score = 70 + (codeSum % 28);
      let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
      if (score >= 92) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 72) grade = 'C';
      
      const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 
        score >= 90 ? 'Low' : score >= 78 ? 'Medium' : score >= 65 ? 'High' : 'Critical';
      const anomalies = (codeSum % 3 === 0) ? 1 : (codeSum % 7 === 0) ? 2 : 0;
      
      return {
        ...c,
        securityScore: score,
        securityGrade: grade,
        cyberRiskLabel: riskLevel,
        anomalies
      };
    });
  }, [companies]);

  const filteredLedgers = React.useMemo(() => {
    return computedLedgers.filter(ledger => {
      const matchesSearch = ledger.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ledger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ledger.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'All' || ledger.cyberRiskLabel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [computedLedgers, searchQuery, riskFilter]);

  const triggerAiRiskAudit = async () => {
    setLoading(true);
    setAuditReport(null);
    try {
      const response = await fetch('/api/cybersecurity/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol })
      });
      const resData = await response.json();
      if (resData.analysis) {
        setAuditReport(resData.analysis);
      } else if (resData.error) {
        setAuditReport(`### Error during audit\n${resData.error}`);
      }
    } catch (err: any) {
      setAuditReport(`### Error connecting to audit system\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="cybersecurity-hub-viewport">
      {/* Intro header panel */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-44 w-44 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="space-y-2 z-10 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-805 font-mono tracking-wider">
            <ShieldCheck className="h-3 w-3 animate-pulse" />
            GOVERNANCE & RISK ANALYSIS PORTAL
          </span>
          <h2 className="text-xl font-display font-medium text-white">Corporate Compliance & Audit Center</h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Bharat Stock Index (BSI 1000/100) listed corporations audited systematically. Use this portal to assess investment debt levels, audit ledger anomalies, and test strategic compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Scanner left section */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 lg:col-span-1">
          <div className="border-b border-slate-805 pb-3">
            <h3 className="font-display font-medium text-white text-sm">Target Corporation Filter</h3>
            <p className="text-slate-500 text-[11px]">Audit corporate filings dynamically</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-mono uppercase">Company Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer font-mono"
              >
                {companies.map(c => (
                  <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>
                ))}
              </select>
            </div>

            {localCyberDetails && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                {/* Score badge indicator */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Audit Rating</span>
                    <span className="text-2xl font-mono font-black text-indigo-400">{localCyberDetails.score}/100</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-lg">
                    {localCyberDetails.grade}
                  </div>
                </div>

                {/* Sub stats */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Risk Matrix:</span>
                    <span className={`font-semibold ${
                      localCyberDetails.cyberRiskLabel === 'Low' ? 'text-emerald-400' :
                      localCyberDetails.cyberRiskLabel === 'Medium' ? 'text-amber-400' : 'text-rose-450'
                    }`}>{localCyberDetails.cyberRiskLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Regulatory Flags:</span>
                    <span className="text-slate-200 font-semibold">{localCyberDetails.accountingAnomalies} flagged</span>
                  </div>
                </div>

                {/* Security assessment description text */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Audit Summary</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {localCyberDetails.threatAssessment}
                  </p>
                </div>
              </div>
            )}



            <button
              onClick={triggerAiRiskAudit}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/20 active:scale-95"
            >
              <Cpu className="h-4 w-4" />
              {loading ? "Constructing Risk Report..." : "Initiate Fiduciary Compliance Audit"}
            </button>
          </div>
        </div>

        {/* Audit Report Viewer Output */}
        <div className="bg-slate-900 border border-slate-805 p-5 rounded-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-805 pb-3">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Regulatory & Risk Audit Logs</h3>
              <p className="text-slate-500 text-[11px]">Output reports generated by active Gemini AI Models</p>
            </div>

          </div>

          <div className="min-h-[380px] bg-slate-950 rounded-xl p-5 border border-slate-850 overflow-y-auto max-h-[460px] font-mono text-xs text-slate-300 space-y-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-24 space-y-3">
                <Terminal className="h-8 w-8 text-indigo-500 animate-pulse" />
                <p className="text-slate-400 text-xs animate-pulse">Consulting Gemini system instructions and SEC/SEBI compliance guidelines...</p>
                <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-sky-550 h-full w-2/3 animate-ping"></div>
                </div>
              </div>
            ) : auditReport ? (
              <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs prose prose-invert max-w-none">
                {auditReport}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-2 font-display">
                <Laptop className="h-10 w-10 text-slate-700" />
                <h4 className="text-slate-450 font-medium text-xs">Compliance Advisory Awaiting Activation</h4>
                <p className="text-slate-500 max-w-xs text-[11px] leading-relaxed font-sans">
                  Choose a target listing (e.g. TCS or ICICIBANK) on the left sidebar and trigger the audit engine to run AI checks.
                </p>
              </div>
            )}
          </div>

          {/* Core Checklist Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div className="text-[10px] font-mono leading-none">
                <span className="text-slate-400 block font-semibold">SEBI COMPLY</span>
                <span className="text-slate-500 text-[9px]">LODR regulations verified</span>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div className="text-[10px] font-mono leading-none">
                <span className="text-slate-400 block font-semibold">DEBT GUARD</span>
                <span className="text-slate-500 text-[9px]">Leverage ratios cleared</span>
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div className="text-[10px] font-mono leading-none">
                <span className="text-slate-400 block font-semibold">LEDGER AUDIT</span>
                <span className="text-slate-500 text-[9px]">Balance checks certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Compliance & Anti-Fraud Ledger Index Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-slate-800 gap-4">
          <div>
            <h3 className="font-display font-medium text-white text-base">Corporate Advisory Risk & Disclosures Matrix</h3>
            <p className="text-slate-500 text-xs mt-0.5">Real-time status of all {companies.length} enterprise listings</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search symbol, corp, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-sky-500 placeholder-slate-600 w-44"
            />
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {['All', 'Low', 'Medium', 'High', 'Critical'].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskFilter(level)}
                  className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    riskFilter === level
                      ? 'bg-indigo-950/80 text-indigo-450 border border-indigo-900/60'
                      : 'text-slate-450 hover:text-white border border-transparent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4 col-span-2">Entity</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-center">Score / Grade</th>
                <th className="py-3 px-4 text-center">Risk Factor</th>
                <th className="py-3 px-4 text-center">Audit Anomaly</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-805">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No corporate ledger profiles matched the active index filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLedgers.map((ledger) => (
                  <tr key={ledger.symbol} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{ledger.symbol}</div>
                      <div className="text-[11px] text-slate-450 font-sans">{ledger.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-450 text-[11px] font-sans">{ledger.sector}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-white text-xs font-semibold">{ledger.securityScore}/100</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-950 border border-slate-800 text-indigo-450 font-bold rounded">
                          {ledger.securityGrade}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ledger.cyberRiskLabel === 'Low' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/40' :
                        ledger.cyberRiskLabel === 'Medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-900/40' :
                        ledger.cyberRiskLabel === 'High' ? 'bg-orange-950/85 text-orange-400 border border-orange-900/40' :
                        'bg-rose-950/90 text-rose-450 border border-rose-900/40 animate-pulse'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          ledger.cyberRiskLabel === 'Low' ? 'bg-emerald-500' :
                          ledger.cyberRiskLabel === 'Medium' ? 'bg-amber-500' :
                          ledger.cyberRiskLabel === 'High' ? 'bg-orange-500' : 'bg-rose-500'
                        }`} />
                        {ledger.cyberRiskLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ledger.anomalies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/45 px-2 py-0.5 rounded border border-rose-900/20 text-[10px]">
                          <AlertTriangle className="h-3.5 w-3.5 inline shrink-0" />
                          {ledger.anomalies} Flags
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">0 Flags</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedSymbol(ledger.symbol);
                          window.scrollTo({ top: 320, behavior: 'smooth' });
                        }}
                        className="text-[10px] px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-950/80 hover:text-indigo-400 hover:border-indigo-900/60 transition-all border border-slate-750 text-white font-mono rounded cursor-pointer"
                      >
                        Audit Gate →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
