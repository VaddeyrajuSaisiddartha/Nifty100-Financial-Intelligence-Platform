import React, { useState } from 'react';
import { UserPlus, LogIn, ShieldAlert, Key, User as UserIcon, HelpCircle, Eye, EyeOff, Lock, Phone } from 'lucide-react';

interface LoginAuthProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function LoginAuth({
  onLoginSuccess
}: LoginAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Fields state
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // High-Security Personal Context fields
  const [fullName, setFullName] = useState('');
  const [companyTitle, setCompanyTitle] = useState('Student');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  
  // Forgot Password Validation Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Live password validation
  const hasCapital = /[A-Z]/.test(password);
  const hasSmall = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMinLength = password.length >= 8;
  const isPasswordValid = hasCapital && hasSmall && hasNumber && hasSpecial && isMinLength;

  const hasCapitalNew = /[A-Z]/.test(newPassword);
  const hasSmallNew = /[a-z]/.test(newPassword);
  const hasNumberNew = /[0-9]/.test(newPassword);
  const hasSpecialNew = /[^A-Za-z0-9]/.test(newPassword);
  const isMinLengthNew = newPassword.length >= 8;
  const isNewPasswordValid = hasCapitalNew && hasSmallNew && hasNumberNew && hasSpecialNew && isMinLengthNew;

  const WORLD_COUNTRIES = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Singapore', 'Germany', 'United Arab Emirates', 'Japan', 'France',
    'South Africa', 'Switzerland', 'Netherlands', 'Brazil', 'Saudi Arabia'
  ];

  const REGISTER_ROLES = [
    'Student',
    'Business Owner / Businessman',
    'Strategic Corporate Allocator',
    'Equity Research Analyst',
    'Portfolio Fund Manager',
    'Retail Investor',
    'Corporate Executive',
    'Financial Professional'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'forgot') {
      if (!email.trim() || !mobileNumber.trim() || !newPassword.trim()) {
        setErrorMsg('All validation fields are strictly required: Email, Mobile Number, and New Password.');
        return;
      }
      if (!isNewPasswordValid) {
        setErrorMsg('New password does not meet institutional strength credentials. It must be at least 8 characters long and contain: uppercase, lowercase, number, and special character.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Confirm password match failed.');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/forgot-password/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mobileNumber, newPassword })
        });
        const resData = await response.json();
        if (!response.ok) {
          setErrorMsg(resData.error || 'Verification check failed. Confirm Mobile Number fields match registered values.');
        } else {
          setSuccessMsg(resData.message);
          setTimeout(() => {
            setActiveTab('login');
            setNewPassword('');
            setConfirmNewPassword('');
            setSuccessMsg('Passphrase reset successful! Sign in now with your new credentials.');
          }, 2500);
        }
      } catch (err) {
        setErrorMsg('Gateway connection error. Verify authentication database server status.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'login') {
      if (!fullName.trim() || !password.trim()) {
        setErrorMsg('All credential fields must be filled: Full Legal Name and Secret Pass Phrase.');
        return;
      }
    }

    if (activeTab === 'register') {
      if (!fullName.trim() || !password.trim() || !confirmPassword.trim() || !email.trim() || !companyTitle.trim() || !mobileNumber.trim()) {
        setErrorMsg('All registration parameters are required: Full Legal Name, Secret Pass Phrase, Verify Pass Phrase, Corporate Role, Work Email, and Mobile Number.');
        return;
      }
      if (!isPasswordValid) {
        setErrorMsg('Password does not meet institutional strength credentials. It must be at least 8 characters long and contain at least: one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/login' : '/api/register';
      const body = activeTab === 'login' 
        ? { username: fullName, password } 
        : { username: fullName, mobileNumber, password, email, fullName, companyTitle, country: selectedCountry };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const resData = await response.json();
      if (!response.ok) {
        setErrorMsg(resData.error || 'Authentication check failed. Verify credentials.');
      } else {
        if (activeTab === 'register') {
          setSuccessMsg('Account authorized successfully! Loading secure workspace...');
          setTimeout(() => {
            onLoginSuccess(resData.user, resData.token);
          }, 1200);
        } else {
          setSuccessMsg('Authentication signature verified. Loading sandbox...');
          setTimeout(() => {
            onLoginSuccess(resData.user, resData.token);
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to reach authentication gateway. Please make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12" id="login-auth-card">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner with NiftyIQ Analyst credentials gateway */}
        <div className="bg-slate-950 p-6 text-center border-b border-slate-850 space-y-3 relative">
          <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/60" title="Securities Port Verification Active">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[8px] font-mono text-emerald-400 tracking-wider font-bold">PORT TERMINAL SECURED</span>
          </div>
          
          <div className="mx-auto h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-lg shadow-indigo-950/50 hover:border-slate-705 transition-all relative overflow-hidden">
            {/* Ambient indicator */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/40 to-emerald-950/40 opacity-100" />
            <svg className="h-9 w-9 relative z-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Hexagonal Outer Frame */}
              <path d="M16 2 L29 9.5 V22.5 L16 30 L3 22.5 V9.5 Z" stroke="url(#login-nifty-hex-grad)" strokeWidth="1.5" strokeLinejoin="round" />
              {/* Inner Glowing Hexagon */}
              <path d="M16 5.5 L26 11.2 V20.8 L16 26.5 L6 20.8 V11.2 Z" stroke="url(#login-nifty-hex-glow)" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
              
              {/* "N" and "100" Intertwined ascending trend elements */}
              {/* Left Pillar (representing the "1") */}
              <rect x="9" y="13" width="2.5" height="10" rx="1.2" fill="url(#login-nifty-left-pillar)" />
              {/* Middle Circle (representing the first "0") */}
              <circle cx="16" cy="18" r="3.2" stroke="url(#login-nifty-circle-grad)" strokeWidth="2" />
              <circle cx="16" cy="18" r="1.2" fill="#10b981" />
              {/* Right Circle (representing the second "0" or node of stock growth) */}
              <circle cx="23" cy="13" r="3.2" stroke="url(#login-nifty-circle-grad)" strokeWidth="2" />
              <circle cx="23" cy="13" r="1" fill="#3b82f6" />
              
              {/* Dynamic Connecting Bridge Line (Ascending Path) */}
              <path d="M10 21 L16 18 L23 13 L27 9" stroke="url(#login-nifty-trend-line)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M22 9H27V13" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

              <defs>
                <linearGradient id="login-nifty-hex-grad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="login-nifty-hex-glow" x1="16" y1="5.5" x2="16" y2="26.5" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="login-nifty-left-pillar" x1="10.25" y1="13" x2="10.25" y2="23" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="login-nifty-circle-grad" x1="12.8" y1="14.8" x2="26.2" y2="14.8" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <linearGradient id="login-nifty-trend-line" x1="10" y1="21" x2="27" y2="9" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="space-y-1">
            <div className="text-[9px] text-indigo-400 font-mono tracking-[0.2em] font-bold uppercase">
              Nifty 100 Pro Registry Terminal
            </div>
            <h2 className="text-base font-display font-bold text-white tracking-wide uppercase">
              MEMBER & ANALYST GATEWAY LOGIN
            </h2>
            <div className="text-[8px] text-slate-500 font-mono max-w-xs mx-auto leading-relaxed uppercase border-t border-slate-900 pt-1.5">
              RESTRICTED FOR ACCREDITED EQUITY RESEARCH ANALYST & INSTITUTIONAL SECTOR ALLOCATORS.
            </div>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'login' ? 'text-indigo-400 border-indigo-500 bg-slate-900/50' : 'text-slate-500 border-transparent hover:text-slate-350'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'register' ? 'text-indigo-400 border-indigo-500 bg-slate-900/50' : 'text-slate-500 border-transparent hover:text-slate-350'
            }`}
          >
            REGISTER DISCLOSURE
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === 'forgot' ? 'text-indigo-400 border-indigo-500 bg-slate-900/50' : 'text-slate-500 border-transparent hover:text-slate-350'
            }`}
          >
            RECOVER YOUR ACCOUNT
          </button>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/40 text-rose-450 rounded-xl text-xs flex items-start gap-2 animate-pulse leading-normal">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sub-form fields based on active tab state */}
          {activeTab === 'forgot' ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-900/40 rounded-xl">
                <p className="text-[11px] text-indigo-300 font-sans leading-relaxed">
                  Enter your registered Account Email and Mobile Number created at registration to verify identity and recover your account.
                </p>
              </div>

              {/* Account Email */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Your Account Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="e.g., yourname@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number verification */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Registered Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="Enter Registered Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">New Secret Pass Phrase</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    required
                  />
                </div>

                {/* New Password Strength indicator */}
                {newPassword.length > 0 && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 mt-1">
                    <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block">New Password strength:</span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono leading-none">
                      <span className={isMinLengthNew ? "text-emerald-400" : "text-rose-500"}>
                        {isMinLengthNew ? "✓" : "✗"} 8+ Chars
                      </span>
                      <span className={hasCapitalNew ? "text-emerald-400" : "text-rose-500"}>
                        {hasCapitalNew ? "✓" : "✗"} Capital
                      </span>
                      <span className={hasSmallNew ? "text-emerald-400" : "text-rose-500"}>
                        {hasSmallNew ? "✓" : "✗"} Lowercase
                      </span>
                      <span className={hasNumberNew ? "text-emerald-400" : "text-rose-500"}>
                        {hasNumberNew ? "✓" : "✗"} Number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono uppercase block">Verify New Pass Phrase</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* If tab is 'login' render login fields */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  {/* Full Name for Login */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Registered Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Enter Registered Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-mono uppercase block">Secret Pass Phrase</label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[10px] text-indigo-400 hover:underline hover:text-indigo-305 transition-colors font-mono uppercase"
                      >
                        Forgot Key?
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* If tab is 'register' render register fields */}
              {activeTab === 'register' && (
                <div className="space-y-4">
                  {/* Full Name for Registration at the top */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Full Legal Name (Primary ID)</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Enter your full legal name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Secret Pass Phrase</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>

                    {/* Dynamic Password strength indicator */}
                    {password.length > 0 && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 mt-2 animate-fade-in/10">
                        <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Credential Blueprint:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-none">
                          <div className="flex items-center gap-1.5">
                            <span className={isMinLength ? "text-emerald-450 font-bold" : "text-rose-500 font-bold"}>
                              {isMinLength ? "✓" : "✗"}
                            </span>
                            <span className={isMinLength ? "text-slate-300" : "text-slate-505"}>8+ Chars</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasCapital ? "text-emerald-450 font-bold" : "text-rose-500 font-bold"}>
                              {hasCapital ? "✓" : "✗"}
                            </span>
                            <span className={hasCapital ? "text-slate-300" : "text-slate-505"}>Capital</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasSmall ? "text-emerald-450 font-bold" : "text-rose-500 font-bold"}>
                              {hasSmall ? "✓" : "✗"}
                            </span>
                            <span className={hasSmall ? "text-slate-300" : "text-slate-505"}>Lowercase</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={hasNumber ? "text-emerald-450 font-bold" : "text-rose-500 font-bold"}>
                              {hasNumber ? "✓" : "✗"}
                            </span>
                            <span className={hasNumber ? "text-slate-300" : "text-slate-550"}>Number (0-9)</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2 mt-0.5 pt-1 border-t border-slate-900">
                            <span className={hasSpecial ? "text-emerald-450 font-bold" : "text-rose-500 font-bold"}>
                              {hasSpecial ? "✓" : "✗"}
                            </span>
                            <span className={hasSpecial ? "text-slate-300" : "text-slate-550"}>Special Char (!, @, #, $, %)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Verify Pass Phrase */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Verify Pass Phrase</label>
                    <div className="relative font-mono">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="•••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number (for discloser recovery) */}
                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Mobile Number (For disclosures/recovery)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="Enter Mobile Number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-605 focus:outline-none focus:border-sky-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Corporate Organization / Role drop down */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Corporate Organization / Role</label>
                    <div className="relative">
                      <select
                        value={companyTitle}
                        onChange={(e) => setCompanyTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono cursor-pointer appearance-none animate-fade-in"
                        required
                      >
                        {REGISTER_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Country of Residence/Registration (supporting worldwide accounts) */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Country of Residence / Operations</label>
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-4 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono cursor-pointer appearance-none"
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

                  {/* Work Email Address */}
                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] text-slate-400 font-mono uppercase block">Corporate Work Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="your.email@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-805 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
 
          {/* Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-mono tracking-wider transition-all select-none shadow-lg shadow-indigo-950/40 cursor-pointer"
          >
            {loading 
              ? "Running Handshake..." 
              : activeTab === 'login' 
                ? "SIGN IN AS GLOBAL MEMBER" 
                : activeTab === 'register' 
                  ? "REGISTER SECURE ACCOUNT" 
                  : "VERIFY & RESET PASSPHRASE"}
          </button>
        </form>

        {/* Security standard notice */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono space-y-1.5 leading-relaxed">
          <p className="flex items-center gap-1.5 text-slate-400 leading-none">
            <ShieldAlert className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            INDIAN SECURITIES ADVISORY STANDARD NOTICE
          </p>
          <p>
            This system complies with institutional accounting audit standards. Account access activities are securely registered to auditing sheets for regulatory transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
