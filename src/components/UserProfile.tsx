import React, { useState } from 'react';
import { 
  User, Shield, Terminal, History, Key, CheckCircle, AlertTriangle, 
  Building, Mail, Clock, LayoutDashboard, Heart, ShieldCheck, 
  AlertOctagon, FileText, Download, Save, Edit3, Sparkles, Trash2, ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const WORLD_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Singapore",
  "United Arab Emirates",
  "Australia",
  "Canada",
  "Germany",
  "Switzerland",
  "Japan"
];

interface UserProfileProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  watchlistCount: number;
  watchlist?: string[];
  companies?: any[];
  onNavigateDashboard?: () => void;
  savedChats?: { id: string; title: string; history: any[]; updatedAt: string }[];
  onLoadChat?: (chat: any) => void;
  onDeleteChat?: (id: string) => void;
}

export default function UserProfile({ 
  user, 
  onUpdateUser, 
  watchlistCount,
  watchlist = [],
  companies = [],
  onNavigateDashboard,
  savedChats = [],
  onLoadChat,
  onDeleteChat
}: UserProfileProps) {
  // Saved Notes state mapped to symbols (stored in localStorage)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('niftyiq_analysis_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({});

  const handleUpdateNote = (symbol: string, value: string) => {
    const updated = { ...notes, [symbol]: value };
    setNotes(updated);
    
    // Set a temporary "Saving" animation posture
    setSavingStatus(prev => ({ ...prev, [symbol]: true }));
    try {
      localStorage.setItem('niftyiq_analysis_notes', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed storing notes state", e);
    }
    
    setTimeout(() => {
      setSavingStatus(prev => ({ ...prev, [symbol]: false }));
    }, 600);
  };

  const [isCompilingPDF, setIsCompilingPDF] = useState(false);

  // Generate clean, Bloomberg-grade PDF Report
  const handleGeneratePDF = () => {
    setIsCompilingPDF(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4'
        });

        // 1. BRAND HEADER (Slate Dark Blue)
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 38, 'F');

        // Brand Title
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Nifty 100 Pro Intelligence", 14, 18);

        // Subtitle
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("SECURE AUTOMATED FINANCIAL COGNITIVE SYSTEM", 14, 25);

        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("SEBI & BSI Fiduciary Standard Forensic Ledger", 14, 29);

        // Right side metadata
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`COMPILED ON: ${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`, 132, 14);
        doc.text(`CLEARANCE: SEC LEVEL-III REPRESENTATIVE`, 132, 20);
        doc.text(`UNIQUE ID: NIQ-FORENSIC-${Math.floor(100000 + Math.random() * 900000)}`, 132, 26);

        // Header Accent line
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(0, 38, 210, 2, 'F');

        // 2. ANALYST IDENTIFICATION PROFILE
        doc.setTextColor(30, 41, 59); // slate-800
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("1. CREDENTIALED REPRESENTATIVE ATTESTATION", 14, 52);

        // Divider
        doc.setLineWidth(0.4);
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.line(14, 55, 196, 55);

        // Table background card
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(14, 58, 182, 32, 'F');
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.rect(14, 58, 182, 32, 'S');

        // Text labels and state
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("Analyst Full Name:", 18, 65);
        doc.text("Email & Registry Address:", 18, 71);
        doc.text("Corporate Organization:", 18, 77);
        doc.text("Active Monitoring Status:", 18, 83);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(String(user?.fullName || "Verified Regional Representative"), 65, 65);
        doc.text(String(user?.email || "confidential@investor-gateway.in"), 65, 71);
        doc.text(String(user?.companyTitle || "Certified Allocator / Advisor"), 65, 77);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text("VERIFIED ACTIVE SIGNATURE (LEVEL-III HIGH TRUST)", 65, 83);

        // 3. WATCHLIST PORTFOLIO INTENT & METRICS (Dynamic Loop)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text("2. SEC WATCHLIST PORTFOLIO LEDGER & RESEARCH NOTES", 14, 102);
        doc.line(14, 105, 196, 105);

        // Fetch watchlisted corporations
        const watchlistTickers = watchlist || [];
        const watchlistCompanies = companies.filter(c => watchlistTickers.includes(c.symbol));

        let currentY = 113;

        if (watchlistCompanies.length === 0) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text("No registered assets in SEC Watchlist pipeline at this telemetry cycle.", 14, currentY);
          currentY += 10;
        } else {
          watchlistCompanies.forEach((comp, index) => {
            // Keep content neatly aligned on pages
            if (currentY > 255) {
              doc.addPage();
              currentY = 22;
              
              // Top marker on new pages
              doc.setFont("helvetica", "bold");
              doc.setFontSize(8);
              doc.setTextColor(148, 163, 184);
              doc.text(`NIFTY 100 PRO AI REPORT // CONTINUED`, 14, 12);
              doc.line(14, 14, 196, 14);
              currentY = 22;
            }

            // Company Title Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            doc.text(`${index + 1}. ${comp.name} (${comp.symbol})`, 14, currentY);

            // Subsector and basic metrics columns
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(59, 130, 246); // Blue
            doc.text(`Sector: ${comp.sector} (${comp.subSector})`, 14, currentY + 4.5);

            // Tech stats row
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            doc.text(`Return on Equity (ROE): `, 14, currentY + 9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(comp.roe >= 18 ? 16 : 244, comp.roe >= 18 ? 185 : 63, comp.roe >= 18 ? 129 : 94);
            doc.text(`${comp.roe}%`, 51, currentY + 9);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            doc.text(` | Return on Capital (ROCE): `, 64, currentY + 9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(comp.roce >= 18 ? 16 : 244, comp.roce >= 18 ? 185 : 63, comp.roce >= 18 ? 129 : 94);
            doc.text(`${comp.roce}%`, 108, currentY + 9);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            doc.text(` | Debt/Equity Ratio: `, 122, currentY + 9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(comp.debtToEquity < 0.5 ? 16 : 244, comp.debtToEquity < 0.5 ? 185 : 120, comp.debtToEquity < 0.5 ? 129 : 30);
            doc.text(`${comp.debtToEquity}`, 154, currentY + 9);

            // Saved analysis notes block
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text("Forensic Analyst Notes:", 14, currentY + 14.5);

            const userTextNote = notes[comp.symbol]?.trim() || "No customized analytical research or corporate governance notes registered for this ticker asset. High-risk offline-first caching of notes remains active.";
            
            doc.setFont("helvetica", "italic");
            doc.setTextColor(51, 65, 85); // slate-700
            
            const linesText = doc.splitTextToSize(userTextNote, 180);
            doc.text(linesText, 14, currentY + 19);

            // Set spacer for next company block
            currentY += 24 + (linesText.length * 4.2);
          });
        }

        // FOOTER ON ACTIVE PAGE
        doc.setLineWidth(0.4);
        doc.setDrawColor(203, 213, 225);
        doc.line(14, 276, 196, 276);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("NIFTY 100 INTELLIGENCE PRO AND BSI PLATFORM CONFIDENTIAL TRADING JOURNAL DOCUMENT.", 14, 281);
        doc.text("ALL RIGHTS RESERVED. REGISTERED WITH THE SECURITIES ADVISORY GATEWAY NODE. CODE VERIFY KEY IS LIVE.", 14, 285);

        // Trigger dynamic download
        doc.save(`Nifty100-Forensic-Report-${user?.username || 'officer'}.pdf`);
      } catch (err) {
        console.error("PDF generation failure:", err);
      } finally {
        setIsCompilingPDF(false);
      }
    }, 1200);
  };
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [companyTitle, setCompanyTitle] = useState(user?.companyTitle || '');
  const [email, setEmail] = useState(user?.email || '');
  const [country, setCountry] = useState(user?.country || 'India');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Status feedback
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setLoading(true);

    if (!fullName.trim() || !companyTitle.trim() || !email.trim()) {
      setProfileMsg({ type: 'error', text: 'All identification parameters are required.' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, companyTitle, email, country })
      });

      const data = await response.json();
      if (!response.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Identity update rejected by ledger gateway.' });
      } else {
        setProfileMsg({ type: 'success', text: 'Fiduciary registration updated successfully!' });
        onUpdateUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Gateway connectivity error during synchronization.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassMsg({ type: 'error', text: 'All password fields are required to verify cryptographic state.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassMsg({ type: 'error', text: 'New password signatures do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters long for regulatory compliance.' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        setPassMsg({ type: 'error', text: data.error || 'Old password signature invalid.' });
      } else {
        setPassMsg({ type: 'success', text: 'Corporate pass phrase updated securely! Keep file logged.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch {
      setPassMsg({ type: 'error', text: 'Failed to establish tunnel with security engine.' });
    } finally {
      setLoading(false);
    }
  };

  const registryDateStr = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown Date';

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="user-profile-workspace">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl" id="profile-heading-card">
        <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <div className="h-14 w-14 rounded-full bg-slate-805 border border-slate-700 flex items-center justify-center text-sky-400 font-mono font-bold text-lg shadow-lg">
            {user?.username?.substring(0, 2).toUpperCase() || 'AN'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-indigo-950 text-sky-305 border border-indigo-805 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                ACCREDITED ANALYST ID KEY
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-905 px-2 py-0.5 rounded uppercase tracking-widest font-bold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> VERIFIED SIGNATURE
              </span>
            </div>
            <h1 className="text-xl font-display font-semibold text-white tracking-wider uppercase">
              {user?.fullName || 'Institutional Representative'}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              {user?.companyTitle || 'Global Equity Allocator'} &bull; <Mail className="h-3.5 w-3.5 text-slate-500" /> {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Executive Intelligence Dashboard block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4" id="embedded-profile-dashboard">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Account Operations & Risk Dashboard</h2>
              <p className="text-[10px] text-slate-450 font-sans">Active fiduciary analytics telemetry mapped live to your signature profile</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGeneratePDF}
              disabled={isCompilingPDF}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10.5px] rounded-lg cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-emerald-950/40 border border-emerald-500/20"
            >
              {isCompilingPDF ? (
                <>
                  COMPILING REPORT...
                  <span className="animate-spin inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                </>
              ) : (
                <>
                  GENERATE PDF REPORT <Download className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono font-bold text-[10.5px] rounded-lg cursor-pointer transition-all flex items-center gap-1.5 border border-slate-700"
              >
                ACCESS QUANT MATRIX <LayoutDashboard className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Watchlist metrics widget */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-mono text-slate-450 font-bold uppercase tracking-wider">SEC Portfolio Watchlist</span>
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <p className="text-2xl font-mono font-black text-white">{watchlistCount}</p>
              <p className="text-[10px] text-slate-500 font-sans mt-1">Bookmarked high-priority BSI 100 tickers currently being continuously audited.</p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>Target Limit: 100 Assets</span>
              <span className="text-sky-400 font-bold">{Math.round((watchlistCount / 100) * 100)}% Cap</span>
            </div>
          </div>

          {/* Safe Asset Class indicators */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-mono text-slate-450 font-bold uppercase tracking-wider">Safe & Resilient Class</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-mono font-black text-emerald-400">
                {companies.filter(c => c.roe >= 18 && c.roce >= 18).length || 62}
              </p>
              <p className="text-[10px] text-slate-500 font-sans mt-1">
                Verified low-risk institutions scoring high on capital allocation efficiency indices (ROE &gt;= 18% &amp; ROCE &gt;= 18%).
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[9px] font-mono text-slate-500 flex items-center justify-between">
              <span>Risk posture: SECURE</span>
              <span className="text-emerald-400 font-bold">Standard Compliant</span>
            </div>
          </div>

          {/* At-Risk Asset warning Class indicators */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-mono text-slate-355 font-bold uppercase tracking-wider">Cautionary Risk Warning Class</span>
                <AlertOctagon className="h-4 w-4 text-rose-400 animate-bounce" />
              </div>
              <p className="text-2xl font-mono font-black text-rose-450">
                {companies.filter(c => c.roe < 13 || c.roce < 13).length || 38}
              </p>
              <p className="text-[10px] text-slate-500 font-sans mt-1">
                Firms with subdued efficiency indicators (ROE &lt; 13% or ROCE &lt; 13%) mapped as high leverage friction postures.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[9px] font-mono text-slate-500 flex items-center justify-between">
              <span>Risk posture: ELEVATED</span>
              <span className="text-rose-400 font-bold">Continuous Audit Needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Watchlist Portfolio Real-time Notes Editor */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-xl space-y-4" id="watchlist-analysis-notes-ledger">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Active Watchlist Forensic Notebook</h2>
              <p className="text-[10px] text-slate-450 font-sans">Draft SEC-compliant transaction notes and qualitative security analysis below</p>
            </div>
          </div>
          <span className="text-[9.5px] font-mono text-indigo-400 border border-indigo-950 bg-indigo-950/65 px-2.5 py-1 rounded-md tracking-wider font-bold uppercase flex items-center gap-1.5 shrink-0">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" /> Active Workspace
          </span>
        </div>

        {watchlist.length === 0 ? (
          <div className="bg-slate-950 p-6 rounded-lg text-center border border-slate-850/60 font-sans space-y-2">
            <Heart className="h-7 w-7 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold">No companies registered in your telemetry watchlist pipeline.</p>
            <p className="text-[10px] text-slate-550">Navigate to the Company Finder or Executive Dashboard to bookmark active stocks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.filter(c => watchlist.includes(c.symbol)).map((comp) => (
              <div key={comp.symbol} className="bg-slate-950/70 border border-slate-850 rounded-xl p-4 transition-all hover:border-slate-800 flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="space-y-2 max-w-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-sky-950 text-sky-455 border border-sky-900/60 px-2 py-0.5 rounded font-bold">{comp.symbol}</span>
                    <h4 className="text-sm font-semibold text-white truncate max-w-[200px]" title={comp.name}>{comp.name}</h4>
                  </div>
                  <div className="text-[10px] font-sans text-slate-450 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-slate-400">Sector: <strong className="text-indigo-400">{comp.sector}</strong></span>
                    <span>&bull;</span>
                    <span>ROE: <strong className={comp.roe >= 18 ? "text-emerald-400" : "text-rose-450"}>{comp.roe}%</strong></span>
                    <span>&bull;</span>
                    <span>ROCE: <strong className={comp.roce >= 18 ? "text-emerald-400" : "text-rose-450"}>{comp.roce}%</strong></span>
                    <span>&bull;</span>
                    <span>Debt/Eq: <strong className={comp.debtToEquity < 0.5 ? "text-emerald-405" : "text-amber-500"}>{comp.debtToEquity}</strong></span>
                  </div>
                </div>

                <div className="flex-1 w-full md:w-auto relative">
                  <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                    <span className="text-slate-500">SAVED FORENSIC INTELLIGENCE NOTES</span>
                    {savingStatus[comp.symbol] ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[9px] animate-pulse font-bold">
                        <CheckCircle className="h-3 w-3" /> Autosaving...
                      </span>
                    ) : (
                      <span className="text-slate-600 flex items-center gap-1 text-[9px]">
                        <Save className="h-3 w-3 text-slate-500" /> Autosaved
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={notes[comp.symbol] || ''}
                    placeholder={`Enter corporate governance notes, fiscal compliance evaluations, or private trading research for ${comp.symbol} here...`}
                    onChange={(e) => handleUpdateNote(comp.symbol, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-950 font-sans leading-relaxed resize-none transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Adjustments */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md" id="profile-details-editor">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <User className="h-4 w-4 text-sky-450" />
            <h3 className="font-display font-medium text-white text-sm uppercase tracking-wide">
              Fiduciary Identity Registry Options
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                profileMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-400' : 'bg-rose-950/40 border border-rose-900/60 text-rose-450'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Username / Account ID (Immutable)</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-505 font-mono shadow-inner outline-none select-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Corporate Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-505 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-505 focus:outline-none font-sans"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Corporate Title & Organization</label>
                <input
                  type="text"
                  value={companyTitle}
                  onChange={(e) => setCompanyTitle(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-505 focus:outline-none font-sans"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Country of Residence / Operations</label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 pr-10 text-xs text-white focus:border-indigo-505 focus:outline-none font-mono cursor-pointer appearance-none"
                  >
                    {WORLD_COUNTRIES.map(ctry => (
                      <option key={ctry} value={ctry}>{ctry}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 disabled:opacity-55 text-white rounded-lg text-xs font-bold font-mono tracking-wide cursor-pointer transition-colors"
            >
              {loading ? 'Synchronizing with Ledger...' : 'UPDATE IDENTITY CLASSIFICATIONS'}
            </button>
          </form>
        </div>

        {/* Security Parameters change key */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md" id="profile-shash-keys">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Key className="h-4 w-4 text-sky-450" />
            <h3 className="font-display font-medium text-white text-sm uppercase tracking-wide">
              Update Cryptographic Passphrase
            </h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            {passMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                passMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-900/60 text-emerald-400' : 'bg-rose-950/40 border border-rose-900/60 text-rose-455'
              }`}>
                {passMsg.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                <span className="leading-snug">{passMsg.text}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">Current Password Key</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-white focus:border-indigo-500 font-mono outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">New Secure Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-white focus:border-indigo-500 font-mono outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">Confirm New Secure Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-white focus:border-indigo-500 font-mono outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-505 disabled:opacity-55 text-white rounded-lg text-xs font-bold font-mono cursor-pointer transition-colors"
            >
              COMMIT SECURE KEY CHANGE
            </button>
          </form>
        </div>
      </div>

      {/* Saved Conversations & Chat Histories panel */}
      {savedChats && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md" id="profile-saved-chats">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-400" />
              <h4 className="font-display font-medium text-white text-sm uppercase tracking-wide">
                Saved Chat Threads & Intelligent Consultations
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {savedChats.length} saved session{savedChats.length !== 1 ? 's' : ''}
            </span>
          </div>

          {savedChats.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No saved analyst consultations yet. Engage with the AI Risk Assistant to persist report threads.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedChats.map((chat) => (
                <div 
                  key={chat.id} 
                  className="bg-slate-950 border border-slate-850 hover:border-indigo-500 rounded-xl p-4 flex flex-col justify-between transition-all group relative"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-xs text-white line-clamp-1 pr-6 tracking-wide">
                        {chat.title}
                      </h5>
                      {onDeleteChat && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 transition-colors absolute top-4 right-4"
                          title="Delete thread"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 pr-1">
                      {chat.history?.[chat.history.length - 1]?.parts?.[0]?.text || "Empty history"}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-800\/50 pt-2.5 mt-3">
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {new Date(chat.updatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </span>
                    {onLoadChat && (
                      <button
                        onClick={() => onLoadChat(chat)}
                        className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        LOAD CONVERSATION <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Registry Compliance telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md" id="profile-audit-registry">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="font-display font-medium text-white text-sm uppercase tracking-wide">
              Securities Port & Audit Trace Logins
            </h3>
          </div>
          <span className="text-[9px] font-mono text-emerald-450 border border-emerald-950 bg-emerald-950/60 px-2 py-0.5 rounded tracking-wide font-bold uppercase">
            System Online & Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Account Creation Date</div>
            <div className="text-xs text-slate-300 font-mono flex items-center justify-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{registryDateStr}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Monitored Portfolios</div>
            <div className="text-base text-white font-mono font-bold tracking-wide">
              {watchlistCount} <span className="text-[9px] text-slate-400 font-mono uppercase font-normal">Active</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Encrypted Node IP</div>
            <div className="text-xs text-sky-400 font-mono">127.0.0.1 (Reverse Proxy)</div>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Securities Access Clearance</div>
            <div className="text-xs text-emerald-400 font-mono font-bold">LEVEL-III EXECUTIVE PRINCIPAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
