import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserCheck, Shield, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp-email' | 'otp-verify'

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // OTP states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Status & loading states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Refs for OTP input auto-focus
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Redirect authenticated users
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    }
  }, [navigate]);

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (authMode === 'otp-verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [authMode, countdown]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAuthMode('password');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Sign up handler
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('All fields are required');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      setSuccessMsg('Registration successful! Please login.');
      setName('');
      setPassword('');
      setActiveTab('login');
      setAuthMode('password');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Regular login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userName', data.user.name);
      
      if (data.user.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      setErrorMsg('Email is required');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setSuccessMsg('Verification code sent successfully!');
      setAuthMode('otp-verify');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      setSuccessMsg('Verification code resent successfully!');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userName', data.user.name);

      if (data.user.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index, value) => {
    if (isNaN(Number(value)) && value !== '') return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace key press
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl p-8">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            LEARNIFY
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {authMode === 'password'
              ? 'Secure portal access'
              : authMode === 'otp-email'
              ? 'Request verification code'
              : 'Verify your identity'}
          </p>
        </div>

        {/* Tab Controls (Only shown for password auth mode) */}
        {authMode === 'password' && (
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all duration-200 ${
                activeTab === 'login'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all duration-200 ${
                activeTab === 'register'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* Auth Forms */}
        {authMode === 'password' && activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
              Sign In
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">OR</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp-email');
                setOtpEmail(email);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full border border-slate-800 hover:bg-slate-800/40 py-3 rounded-xl font-bold text-slate-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <KeyRound size={16} />
              Login with OTP
            </button>
          </form>
        )}

        {authMode === 'password' && activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Portal Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 rounded-xl border font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    role === 'student'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <UserCheck size={16} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`py-3 rounded-xl border font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    role === 'instructor'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <Shield size={16} />
                  Instructor
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
              Register Account
            </button>
          </form>
        )}

        {/* OTP Email Form */}
        {authMode === 'otp-email' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <p className="text-sm text-slate-400 text-center leading-relaxed">
              Enter your registered email address to receive a secure 6-digit verification code.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-100 placeholder:text-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
              Send OTP Code
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-semibold py-2 transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </form>
        )}

        {/* OTP Verify Form */}
        {authMode === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center leading-relaxed">
              <p className="text-sm text-slate-400">
                A verification code has been sent to
              </p>
              <strong className="text-slate-200 text-sm block mt-1 break-all">{otpEmail}</strong>
            </div>

            {/* OTP Grid Inputs */}
            <div className="flex justify-between gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:bg-slate-950 rounded-xl text-center text-xl font-bold text-slate-100 outline-none transition-all duration-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
            >
              {loading && <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
              Verify & Sign In
            </button>

            {/* Timer and Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs font-bold hover:underline transition-all duration-200"
                >
                  <RefreshCw size={12} />
                  Resend Code
                </button>
              ) : (
                <span className="text-slate-500 text-xs font-semibold">
                  Resend code in <strong className="text-slate-400 font-bold">{countdown}s</strong>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp-email');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-semibold py-2 transition-all duration-200"
            >
              <ArrowLeft size={16} />
              Change Email Address
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
