import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Mail, Lock, Code2, AlertCircle, ArrowRight, ShieldCheck, Key, Store } from 'lucide-react';
import { developerAuthService } from '../../services/developerAuthService';
import { SaaSNavbar } from '../../components/SaaSNavbar';

export const DeveloperLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const savedCreds = developerAuthService.getCredentials();

  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFillDefaults = () => {
    setEmail(savedCreds.email);
    setPasscode(savedCreds.passcode);
    setError('');
  };

  const handleDeveloperLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passcode) {
      setError('Please provide developer email and passcode.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const success = developerAuthService.login(email, passcode);
      if (success) {
        navigate('/developer');
      } else {
        setError('Authentication failed: Invalid Developer Email or Passcode.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-900/20 rounded-full blur-[140px] pointer-events-none" />

      <SaaSNavbar isDark={true} />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-[32px] p-8 md:p-10 shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
          
          {/* Top Badge & Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 mx-auto cursor-pointer group" title="Return Home">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-xl text-white tracking-tight block leading-none">PrintFlow</span>
                <span className="text-[10px] font-black text-indigo-400 block tracking-widest uppercase mt-1">SaaS Cloud</span>
              </div>
            </Link>

            <div className="pt-2 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-bold">
                <Code2 className="w-3.5 h-3.5" />
                <span>Developer Portal</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Developer Sign In</h1>
              <p className="text-xs text-slate-400 font-medium">
                Master console authentication for platform developers & SaaS engineers.
              </p>
            </div>
          </div>

          {/* Credentials Auto-Fill Banner */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Demo Developer Passcode</p>
              <p className="font-mono text-indigo-400 text-xs font-bold">{savedCreds.email} / ••••••••</p>
            </div>
            <button
              type="button"
              onClick={handleFillDefaults}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shrink-0 shadow-sm"
            >
              Autofill Demo
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Developer Login Form */}
          <form onSubmit={handleDeveloperLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Developer Email
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
                  placeholder="developer@printflow.local"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium text-sm placeholder-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Fixed Developer Passcode
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-medium text-sm placeholder-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
            >
              <span>{loading ? 'Validating Passcode...' : 'Enter Developer Console'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Navigation link footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
            <Link to="/login" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>Shop Owner Login</span>
            </Link>
            <Link to="/register" className="hover:text-indigo-400 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
