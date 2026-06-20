export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  fullName?: string;
  companyTitle?: string;
  country?: string;
}

export interface Company {
  symbol: string;
  name: string;
  sector: string;
  subSector: string;
  website: string;
  logo: string;
  bookValue: number;
  faceValue: number;
  roce: number;
  roe: number;
  about: string;
}

export interface YearData {
  yearLabel: string;
  fiscalYear: number;
  isTtm?: boolean;
}

export interface ProfitLoss {
  symbol: string;
  year: string;
  sales: number;
  expenses: number;
  operatingProfit: number;
  opmPct: number;
  otherIncome: number;
  interest: number;
  depreciation: number;
  pbt: number;
  taxPct: number;
  netProfit: number;
  eps: number;
  dividendPayoutPct: number;
}

export interface BalanceSheet {
  symbol: string;
  year: string;
  equityCapital: number;
  reserves: number;
  borrowings: number;
  otherLiabilities: number;
  totalLiabilities: number;
  fixedAssets: number;
  cwip: number;
  investments: number;
  otherAssets: number;
  totalAssets: number;
  debtToEquity: number;
}

export interface CashFlow {
  symbol: string;
  year: string;
  operatingActivity: number;
  investingActivity: number;
  financingActivity: number;
  netCashFlow: number;
  freeCashFlow: number;
}

export interface GrowthMetrics {
  symbol: string;
  sales3y: number;
  sales5y: number;
  sales10y: number;
  profit3y: number;
  profit5y: number;
  profit10y: number;
  cagr3y: number;
  cagr5y: number;
  cagr10y: number;
  roe3y: number;
  roe5y: number;
  roe10y: number;
}

export interface ProsCons {
  symbol: string;
  pros: string[];
  cons: string[];
}

export interface CybersecurityInsight {
  symbol: string;
  score: number; // 0-100 (high is secure)
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  lastAuditDate: string;
  dataleakChecks: 'Passed' | 'Action Required' | 'Warning';
  accountingAnomalies: number; // count of accounting warning signs
  threatAssessment: string;
  cyberRiskLabel: 'Low' | 'Medium' | 'High' | 'Critical';
  vulnerabilities: {
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
  }[];
}

export interface WatchlistItem {
  username: string;
  symbols: string[];
}
