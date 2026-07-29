import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Mail, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSaaS();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Validate admin authorization
      // For system security, check if email corresponds to admin identity or admin domain
      const isAdminCredentials = email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@printflow.cloud';
      
      if (!isAdminCredentials) {
        setError('Unauthorized: Invalid administrator credentials. Shop owner accounts cannot access the admin console.');
        setLoading(false);
        return;
      }

      const success = await login(email, password);
      if (success) {
        // Authorize admin session explicitly
        localStorage.setItem('printflow_admin_auth', 'true');
        localStorage.setItem('printflow_user_role', 'admin');
        navigate('/dashboard/admin');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Authentication error. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-100 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Subtle ambient light gradient effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-[28px] p-8 md:p-10 shadow-2xl shadow-black/80 space-y-8 relative z-10">
        
        {/* Header - Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <span>PrintFlow Cloud</span>
              <span className="text-[10px] uppercase font-black bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-800/60">
                Admin
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Sign in to central administration
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-semibold flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Forgot Password Modal Notice */}
        {showForgotNotice && (
          <div className="p-4 bg-indigo-950/80 border border-indigo-800/80 rounded-2xl text-indigo-200 text-xs font-medium space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Password Recovery</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300">
              To maintain system compliance, administrator password resets require security operation approval. Contact your operations lead or platform superuser.
            </p>
            <button
              onClick={() => setShowForgotNotice(false)}
              className="text-[11px] font-bold text-indigo-400 hover:underline pt-1 block cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@printflow.cloud"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium text-sm placeholder-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium text-sm placeholder-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Security Footer Badge */}
        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-slate-500 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>256-Bit Encrypted Administrative Session</span>
        </div>
      </div>
    </div>
  );
};
