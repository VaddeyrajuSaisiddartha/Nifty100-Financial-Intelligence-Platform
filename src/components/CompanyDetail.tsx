import React, { useState, useEffect } from 'react';
import { Company, ProfitLoss, BalanceSheet, CashFlow, GrowthMetrics, ProsCons, CybersecurityInsight } from '../types';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, ExternalLink, ShieldCheck, Star, Bot, Sparkles, BookOpen, ThumbsUp, ThumbsDown, HelpCircle, Calendar, DollarSign, BrainCircuit, ShieldAlert, Download, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CompanyDetailProps {
  symbol: string;
  onBack: () => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onAskChatWithContext: (message: string) => void;
}

export default function CompanyDetail({
  symbol,
  onBack,
  watchlist,
  onToggleWatchlist,
  onAskChatWithContext
}: CompanyDetailProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    company: Company & { healthScore: number; healthLabel: string };
    profitLoss: ProfitLoss[];
    balanceSheet: BalanceSheet[];
    cashFlow: CashFlow[];
    growth: GrowthMetrics;
    prosCons: ProsCons;
    cybersecurity: CybersecurityInsight;
  } | null>(null);

  const [activeSheetTab, setActiveSheetTab] = useState<'pl' | 'bs' | 'cf'>('pl');
  const [chatPrompt, setChatPrompt] = useState('');
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [isCompilingPDF, setIsCompilingPDF] = useState(false);

  const handleExportPDF = () => {
    if (!data) return;
    setIsCompilingPDF(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const { company, profitLoss, balanceSheet, cashFlow, growth, prosCons } = data;

      // Color Palette Definition matching modern NiftyIQ fintech styling
      const primaryColor = [15, 23, 42];   // Slate 900
      const secondaryColor = [30, 41, 59]; // Slate 800
      const accentGreen = [16, 185, 129];  // Emerald 500
      const accentBlue = [59, 130, 246];   // blue 500
      const textDark = [51, 65, 85];       // Slate 700
      const lightGray = [241, 245, 249];    // Slate 100

      // PAGE 1: COVER & OVERVIEW
      // Header Banner Background
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 45, 'F');

      // Title & Logo mark
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('Nifty 100 Intelligence', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text('FIDUCIARY AI SYSTEMS & INTEL ANALYTICS PLATFORM', 15, 26);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`REPORT ID: NIQ-GEN-${company.symbol}-${new Date().getFullYear()}`, 15, 34);
      const generatedDate = new Date().toLocaleString();
      doc.text(`EXPORT TIME: ${generatedDate} (UTC)`, 130, 34);

      // Main header line divider
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(1.5);
      doc.line(15, 45, 195, 45);

      // Section: Corporate Profile & Metadata
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`${company.name} (${company.symbol}) Executive Intelligence Brief`, 15, 58);

      doc.setLineWidth(0.5);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 62, 195, 62);

      // Corporate info blocks grid
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('CLASSIFICATION CATEGORY:', 15, 72);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${company.sector} > ${company.subSector}`, 15, 77);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('STOCK EXCHANGE TICKER:', 110, 72);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${company.symbol} (NSE India Registered)`, 110, 77);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('RETURN ON EQUITY (ROE):', 15, 87);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`${company.roe}%`, 15, 92);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('ROCE SECURITY RATIO:', 110, 87);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`${company.roce}%`, 110, 92);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('BOOK VALUE RATIO:', 15, 102);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${company.bookValue}`, 15, 107);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('FACE VALUE RATIO:', 110, 102);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${company.faceValue}`, 110, 107);

      // Section: Risk Profiling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('CORPORATE SECURITY RISK CLASSIFICATION:', 15, 122);
      
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(15, 126, 180, 24, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text(`RISK STATUS: ${riskLevel}  [${riskRating}]`, 20, 133);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(127, 29, 29);
      doc.text(riskDescription, 20, 140);

      // Company Overview Corporate description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('EXECUTIVE PROFILE BRIEF:', 15, 162);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitAbout = doc.splitTextToSize(company.about, 180);
      doc.text(splitAbout, 15, 168);

      // Section: Pros and Cons table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('RISK ANALYSIS - CORPORATE STRENGTHS & THREATS:', 15, 215);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(16, 185, 129);
      doc.text('KEY CAPITAL ADVANTAGES / PROS:', 15, 222);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      let currentY = 227;
      prosCons.pros.slice(0, 3).forEach((pro) => {
        doc.text(`• ${pro}`, 15, currentY);
        currentY += 5;
      });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text('KEY CAPITAL CONSTRAINTS / CONS:', 15, currentY + 3);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      let consY = currentY + 8;
      prosCons.cons.slice(0, 3).forEach((con) => {
        doc.text(`• ${con}`, 15, consY);
        consY += 5;
      });

      // Page footer watermark
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL. EXCLUSIVELY LICENSED TO NIFTY 100 PRO SYSTEM SUBSCRIPTION PLATFORM.', 15, 287);
      doc.text('Page 1 of 2', 185, 287);

      // PAGE 2: FINANCIAL STATEMENTS MATRIX LOG
      doc.addPage();

      // Top banner minimal header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`${company.name} (${company.symbol}) Historic Financial Ledger`, 15, 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('PROFIT & LOSS MATRIX SUMMARY', 15, 32);

      // Table Draw Profit Loss
      let plY = 38;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, plY, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      
      doc.text('Fiscal Year', 18, plY + 5.5);
      doc.text('Revenues (Cr)', 45, plY + 5.5);
      doc.text('Expenses (Cr)', 80, plY + 5.5);
      doc.text('OPM %', 115, plY + 5.5);
      doc.text('Net Profit (Cr)', 145, plY + 5.5);
      doc.text('Diluted EPS', 175, plY + 5.5);

      plY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      profitLoss.forEach((pl, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, plY, 180, 7, 'F');
        }
        doc.text(pl.year, 18, plY + 5);
        doc.text(`INR ${pl.sales}`, 45, plY + 5);
        doc.text(`INR ${pl.expenses}`, 80, plY + 5);
        doc.text(`${pl.opmPct}%`, 115, plY + 5);
        doc.text(`INR ${pl.netProfit}`, 145, plY + 5);
        doc.text(`INR ${pl.eps}`, 175, plY + 5);
        plY += 7;
      });

      // Section: Balance Sheet
      let bsY = plY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('BALANCE SHEET EQUITY CAPITAL & RESERVES SUMMARY', 15, bsY);

      bsY += 6;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, bsY, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);

      doc.text('Fiscal Year', 18, bsY + 5.5);
      doc.text('Equity Capital (Cr)', 45, bsY + 5.5);
      doc.text('Reserves (Cr)', 80, bsY + 5.5);
      doc.text('Borrowings (Cr)', 115, bsY + 5.5);
      doc.text('Total Assets (Cr)', 145, bsY + 5.5);
      doc.text('Debt/Equity Ratio', 175, bsY + 5.5);

      bsY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      balanceSheet.forEach((bs, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, bsY, 180, 7, 'F');
        }
        doc.text(bs.year, 18, bsY + 5);
        doc.text(`INR ${bs.equityCapital}`, 45, bsY + 5);
        doc.text(`INR ${bs.reserves}`, 80, bsY + 5);
        doc.text(`INR ${bs.borrowings}`, 115, bsY + 5);
        doc.text(`INR ${bs.totalAssets}`, 145, bsY + 5);
        doc.text(`${bs.debtToEquity.toFixed(2)}x`, 175, bsY + 5);
        bsY += 7;
      });

      // Section: Growth CAGR Metrics
      let growthY = bsY + 12;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('COMPOUNDED ANNUAL SECURITY GROWTH CAGR %', 15, growthY);

      growthY += 6;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, growthY, 180, 26, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      
      doc.text('Sales Growth Rates:', 20, growthY + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(`10 YR: ${growth.sales10y || 'N/A'}%  |  5 YR: ${growth.sales5y}%  |  3 YR: ${growth.sales3y}%  |  CAGR 3Y: ${growth.cagr3y}%`, 20, growthY + 13);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Compounded Profit Growth Rates:', 20, growthY + 19);
      doc.setFont('helvetica', 'normal');
      doc.text(`10 YR: ${growth.profit10y || 'N/A'}%  |  5 YR: ${growth.profit5y}%  |  3 YR: ${growth.profit3y}%  |  ROE 3Y: ${growth.roe3y}%`, 20, growthY + 24);

      // Section: Certification signature box bottom
      let certY = growthY + 36;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, certY, 180, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('Nifty 100 Fiduciary Certification Statement:', 18, certY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('This digital report compiles verified security analysis indicators.', 18, certY + 11);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('CONFIDENTIAL. EXCLUSIVELY LICENSED TO NIFTY 100 PRO SYSTEM SUBSCRIPTION PLATFORM.', 15, 287);
      doc.text('Page 2 of 2', 185, 287);

      doc.save(`Nifty100_Report_${company.symbol}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompilingPDF(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setLoadingSummary(true);
    
    // Fetch main company financial structures
    fetch(`/api/company/${symbol}`)
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load company details", err);
        setLoading(false);
      });

    // Fetch dynamic AI-Generated company summary
    fetch(`/api/company/${symbol}/summary`)
      .then(res => res.json())
      .then(summaryData => {
        if (summaryData.summary) {
          setSummary(summaryData.summary);
        } else {
          setSummary('Unable to render financial analyst summary at this time.');
        }
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error("Failed to load analyst summary", err);
        setSummary('Gateway Connection interrupted while resolving analyst summary.');
        setLoadingSummary(false);
      });
  }, [symbol]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4" id="company-detail-loading">
        <div className="h-12 w-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center animate-spin mx-auto">
          <BrainCircuit className="h-6 w-6 text-sky-400" />
        </div>
        <p className="text-slate-400 font-mono text-xs animate-pulse">Running Star-Schema query for {symbol} financial logs...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center space-y-4">
        <p className="text-rose-400 text-xs italic">Record or symbol {symbol} couldn't be resolved.</p>
        <button onClick={onBack} className="text-xs text-sky-400 hover:underline flex items-center gap-1 mx-auto">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const { company, profitLoss, balanceSheet, cashFlow, growth, prosCons, cybersecurity } = data;
  const isFav = watchlist.includes(company.symbol);

  // Prepare Radar CAGR data
  const radarData = [
    { subject: 'Sales Growth %', '10Y': growth.sales10y, '5Y': growth.sales5y, '3Y': growth.sales3y },
    { subject: 'Profit Growth %', '10Y': growth.profit10y, '5Y': growth.profit5y, '3Y': growth.profit3y },
    { subject: 'Stock CAGR %', '10Y': growth.cagr10y, '5Y': growth.cagr5y, '3Y': growth.cagr3y },
    { subject: 'ROE %', '10Y': growth.roe10y, '5Y': growth.roe5y, '3Y': growth.roe3y },
  ];

  // Helper calculation for net profit margin trends
  const marginData = profitLoss
    .filter(item => item.year !== 'TTM')
    .map((item, idx) => {
      const bsItem = balanceSheet[idx] || balanceSheet[balanceSheet.length - 1] || {};
      const npmVal = item.sales > 0 ? parseFloat(((item.netProfit / item.sales) * 100).toFixed(1)) : 0;
      return {
        year: item.year,
        opm: item.opmPct,
        npm: npmVal
      };
    });

  // Health Doughnut Chart data
  const healthGaugeValue = company.healthScore;
  const healthDoughnutData = [
    { name: 'Score', value: healthGaugeValue },
    { name: 'Remaining', value: 100 - healthGaugeValue }
  ];

  const handleSendChatPrompt = () => {
    if (!chatPrompt.trim()) return;
    onAskChatWithContext(chatPrompt);
    setChatPrompt('');
  };

  const latestBS = balanceSheet[balanceSheet.length - 1] || { debtToEquity: 0 };
  const dToE = latestBS.debtToEquity || 0;
  
  let riskLevel = "MODERATE RISK";
  let riskRating = "BBB Fiduciary Guard";
  let riskBadgeColor = "text-amber-400 bg-amber-955/40 border border-amber-900/50";
  let riskDescription = "Stable balance sheet gearing ratios. Yield parameters are optimized but monitoring is recommended.";

  if (company.roe >= 18 && dToE < 0.5) {
    riskLevel = "LOW RISK";
    riskRating = "AAA Fiduciary Guard";
    riskBadgeColor = "text-emerald-400 bg-emerald-955/40 border border-emerald-900/50";
    riskDescription = "Robust capital returns paired with trace gearing level provides an excellent margin of safety.";
  } else if (company.roe < 12 || dToE >= 1.0) {
    riskLevel = "HIGH RISK";
    riskRating = "CCC Fiduciary Guard";
    riskBadgeColor = "text-rose-400 bg-rose-955/40 border border-rose-900/50";
    riskDescription = "Elevated asset leverage or substandard return rate demands deep forensic accounting audit.";
  }

  return (
    <div className="space-y-6" id="company-detail-viewport">
      {/* Detail Header / Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800/85 p-5 rounded-xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Listings
        </button>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 shrink-0">
            <img src={company.logo} alt={company.symbol} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-medium text-white">{company.name}</h2>
              <span className="font-mono text-xs font-bold text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {company.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{company.sector} &bull; {company.subSector}</span>
              <span className="text-slate-500">|</span>
              <a href={company.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-0.5">
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {data && (
            <button
              onClick={handleExportPDF}
              disabled={isCompilingPDF}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              {isCompilingPDF ? (
                <>
                  EXPORTING REPORT...
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Company PDF
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onToggleWatchlist(company.symbol)}
            className={`flex items-center gap-1.5 bg-slate-800 border border-slate-750 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${isFav ? 'text-amber-400' : 'text-slate-300'}`}
          >
            <Star className={`h-4.5 w-4.5 ${isFav ? 'fill-amber-400' : ''}`} />
            {isFav ? 'Saved in Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Profile summary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* About Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl md:col-span-2 space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5 leading-none">
              <BookOpen className="h-4 w-4 text-sky-400" />
              Corporate Profile
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed max-h-32 overflow-y-auto pr-1">{company.about}</p>
          </div>
          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-2">
            WEBSITE: <a href={company.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{company.website}</a>
          </div>
        </div>

        {/* Dynamic Fiduciary Risk Indicator */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5 leading-none">
              <ShieldAlert className="h-4 w-4 text-rose-450" />
              Risk Assessment
            </h3>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold font-mono border ${riskBadgeColor}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
              {riskLevel}
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              {riskDescription}
            </p>
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center pt-2 border-t border-slate-850">
            <span>Rating:</span>
            <span className="text-slate-300 font-bold">{riskRating}</span>
          </div>
        </div>

        {/* DuPont parameters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 font-mono text-xs flex flex-col justify-between">
          <div>
            <h4 className="text-slate-400 uppercase tracking-wider text-[10px] font-bold pb-2">Key Capital Ratios</h4>
            <div className="space-y-2 divide-y divide-slate-850">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 text-[11px]">ROE:</span>
                <span className="text-emerald-400 font-bold text-[11px]">{company.roe}%</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 text-[11px]">ROCE:</span>
                <span className="text-sky-400 font-bold text-[11px]">{company.roce}%</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 text-[11px]">Latest D/E:</span>
                <span className={`${dToE >= 1.0 ? 'text-rose-450' : 'text-slate-300'} font-bold text-[11px]`}>{dToE.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 text-[11px]">Book Value:</span>
                <span className="text-slate-300 text-[11px]">INR {company.bookValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium AI Analyst Summary Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden" id="ai-analyst-summary">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-450 animate-pulse" />
          <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5 shadow-sm">
            AI-Generated Company Genius Summarizer
            <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Smart summary
            </span>
          </h3>
        </div>
        
        {loadingSummary ? (
          <div className="flex items-center gap-2.5 text-slate-500 font-mono text-xs py-3 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
            Running dynamic SWOT and Nifty benchmarking reports...
          </div>
        ) : (
          <div className="text-slate-350 text-xs leading-relaxed space-y-3">
            {summary.split('\n\n').map((paragraph, pIdx) => {
              const parts = paragraph.split('**');
              return (
                <p key={pIdx}>
                  {parts.map((part, partIdx) => {
                    if (partIdx % 2 === 1) {
                      return <strong key={partIdx} className="text-indigo-400 font-semibold">{part}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* 8 Charts Grid */}
      <div className="space-y-4" id="eight-visual-indicators-grid">
        <h3 className="text-base font-display font-medium text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          8 Interactive Financial Indicators
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Revenue & Profit Trend */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">1. Revenue & Profit Trend</span>
              <span className="text-slate-500">INR Crores</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profitLoss.filter(item => item.year !== 'TTM')}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="sales" name="Sales Revenue" fill="#1f4e79" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Balance Sheet Composition */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">2. Balance Sheet Composition</span>
              <span className="text-slate-500">Stacked Liabilities</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={balanceSheet}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="reserves" name="Equity & Reserves" fill="#34d399" stackId="liab" />
                  <Bar dataKey="borrowings" name="Borrowings" fill="#ef4444" stackId="liab" />
                  <Bar dataKey="otherLiabilities" name="Other Liab." fill="#f59e0b" stackId="liab" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Cash Flow breakdown */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">3. Cash Flow Waterfall</span>
              <span className="text-slate-500">Activities flow</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cashFlow}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="operatingActivity" name="Operating" fill="#10b981" />
                  <Bar dataKey="investingActivity" name="Investing" fill="#2563eb" />
                  <Bar dataKey="financingActivity" name="Financing" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: EPS & Dividend History */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">4. EPS & Dividend History</span>
              <span className="text-slate-500">Payout % vs earning value</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={profitLoss.filter(item => item.year !== 'TTM')}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="eps" name="EPS Value" stroke="#38bdf8" strokeWidth={2} />
                  <Line type="monotone" dataKey="dividendPayoutPct" name="Dividend Payout %" stroke="#a78bfa" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Debt vs Equity */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">5. Debt vs Equity reserves</span>
              <span className="text-slate-500">Risk comparison area</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={balanceSheet}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="reserves" name="Equity reserves" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" />
                  <Area type="monotone" dataKey="borrowings" name="Borrowings" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: CAGR Radar Spider chart */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">6. CAGR metrics spider view</span>
              <span className="text-slate-505">10Y vs 5Y vs 3Y epochs</span>
            </div>
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width={260} height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 45]} fontSize={8} />
                  <Radar name="10Y Epoch" dataKey="10Y" stroke="#60a5fa" fill="#3b82f6" fillOpacity={0.15} />
                  <Radar name="5Y Epoch" dataKey="5Y" stroke="#34d399" fill="#10b981" fillOpacity={0.15} />
                  <Radar name="3Y Epoch" dataKey="3Y" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 7: Margin Trend */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">7. Margin Trend Comparison</span>
              <span className="text-slate-500">NPM % vs OPM %</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={marginData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="opm" name="Operating Margin (OPM %)" stroke="#f59e0b" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="npm" name="Net Margin (NPM %)" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 8: Health score speedometer gauge */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold uppercase">8. ML Health Rating speedometer</span>
              <span className="text-slate-500">Gauge indicator</span>
            </div>
            <div className="h-64 flex flex-col items-center justify-center relative">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDoughnutData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#334155" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute bottom-12 text-center">
                <span className="text-4xl font-display font-black text-white">{company.healthScore}</span>
                <p className="text-[10px] text-emerald-400 font-mono tracking-widest">{company.healthLabel}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-mono text-center">Capital structure audit health index</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pros and Cons panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-display font-medium text-emerald-400 text-sm flex items-center gap-1.5 leading-none">
            <ThumbsUp className="h-4.5 w-4.5 text-emerald-500" />
            Vetted Benefits (Pros)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {prosCons.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">&bull;</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h3 className="font-display font-medium text-rose-400 text-sm flex items-center gap-1.5 leading-none">
            <ThumbsDown className="h-4.5 w-4.5 text-rose-500" />
            Auditable Friction points (Cons)
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {prosCons.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">&bull;</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Statements Table detail sheets split rendering */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <h4 className="text-sm font-display text-white font-medium">Star-Schema Historic Data Sheets</h4>
          
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSheetTab('pl')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md cursor-pointer ${activeSheetTab === 'pl' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Profit &amp; Loss
            </button>
            <button
              onClick={() => setActiveSheetTab('bs')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md cursor-pointer ${activeSheetTab === 'bs' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setActiveSheetTab('cf')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md cursor-pointer ${activeSheetTab === 'cf' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Cash Flow
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          {activeSheetTab === 'pl' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500">
                  <th className="pb-3 text-left">P&amp;L Metric (INR Cr)</th>
                  {profitLoss.map(item => (
                    <th key={item.year} className="pb-3 text-right font-bold text-slate-350">{item.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans font-medium text-slate-200">Sales Turnover</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right font-medium text-slate-200">{item.sales.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-slate-400">Total Expenses</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right text-slate-400">{item.expenses.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30 font-semibold bg-indigo-950/20">
                  <td className="py-2.5 font-sans text-white">Operating Profit</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right">{item.operatingProfit.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-emerald-400 font-medium">OPM %</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right text-emerald-400 font-semibold">{item.opmPct}%</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-slate-400">Interest debt cost</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right text-slate-400">{item.interest}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30 font-bold bg-emerald-950/20">
                  <td className="py-2.5 font-sans text-white">Net Profit Margin</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right text-emerald-400">{item.netProfit.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-slate-450">Earning Per share (EPS)</td>
                  {profitLoss.map(item => <td key={item.year} className="py-2.5 text-right font-bold text-sky-400">{item.eps}</td>)}
                </tr>
              </tbody>
            </table>
          )}

          {activeSheetTab === 'bs' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500">
                  <th className="pb-3 text-left">Balance Sheet Metric</th>
                  {balanceSheet.map(item => (
                    <th key={item.year} className="pb-3 text-right font-bold text-slate-350">{item.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans font-medium text-slate-200">Share Equity Capital</td>
                  {balanceSheet.map(item => <td key={item.year} className="py-2.5 text-right">{item.equityCapital}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-slate-400">Reserves &amp; Surplus</td>
                  {balanceSheet.map(item => <td key={item.year} className="py-2.5 text-right text-slate-400">{item.reserves.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-rose-400 font-medium">Long Term Borrowings</td>
                  {balanceSheet.map(item => <td key={item.year} className="py-2.5 text-right text-rose-400 font-semibold">{item.borrowings.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30 font-semibold bg-slate-950/20">
                  <td className="py-2.5 font-sans text-white">Total Asset Base</td>
                  {balanceSheet.map(item => <td key={item.year} className="py-2.5 text-right">{item.totalAssets.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-slate-450">Debt-to-Equity (D/E)</td>
                  {balanceSheet.map(item => <td key={item.year} className="py-2.5 text-right font-bold text-amber-500">{item.debtToEquity}</td>)}
                </tr>
              </tbody>
            </table>
          )}

          {activeSheetTab === 'cf' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500">
                  <th className="pb-3 text-left">Cash Flow Metric</th>
                  {cashFlow.map(item => (
                    <th key={item.year} className="pb-3 text-right font-bold text-slate-350">{item.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 text-slate-300">
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans font-medium text-emerald-400">Operating Activities</td>
                  {cashFlow.map(item => <td key={item.year} className="py-2.5 text-right text-emerald-400 font-medium">{item.operatingActivity.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-sky-400">Investing Activities</td>
                  {cashFlow.map(item => <td key={item.year} className="py-2.5 text-right text-sky-400">{item.investingActivity.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-amber-500">Financing Activities</td>
                  {cashFlow.map(item => <td key={item.year} className="py-2.5 text-right text-amber-500">{item.financingActivity.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30 font-bold bg-slate-950/20">
                  <td className="py-2.5 font-sans text-white">Net Cash Flow</td>
                  {cashFlow.map(item => <td key={item.year} className="py-2.5 text-right">{item.netCashFlow.toLocaleString()}</td>)}
                </tr>
                <tr className="hover:bg-slate-850/30">
                  <td className="py-2.5 font-sans text-emerald-500 font-semibold">Free Cash Flow (FCF)</td>
                  {cashFlow.map(item => <td key={item.year} className="py-2.5 text-right text-emerald-450 font-semibold">{item.freeCashFlow.toLocaleString()}</td>)}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Contextual Chat Assist widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-display font-medium text-white">Ask context AI assist for {company.symbol}</h3>
        </div>
        <p className="text-slate-400 text-xs text-slate-350">
          Inquire about DuPont return margins, sector peer performance, or valuation checks for {company.name}.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask AI: "Explain ${company.symbol}'s OPM trend and capital risk profile..."`}
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatPrompt()}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button 
            onClick={handleSendChatPrompt}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 cursor-pointer"
          >
            Ask Intel Bot
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 font-mono">
          <span>Suggestions:</span>
          <button onClick={() => setChatPrompt(`Evaluate ${company.symbol}'s free cash flow quality.`)} className="hover:text-slate-300">FCF Quality</button>
          <span>&bull;</span>
          <button onClick={() => setChatPrompt(`Explain ${company.symbol}'s capital risk structure.`)} className="hover:text-slate-300">Debt Structure</button>
        </div>
      </div>
    </div>
  );
}
