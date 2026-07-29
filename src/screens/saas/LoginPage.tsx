import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Mail, Lock, ArrowRight, Store } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { SaaSNavbar } from '../../components/SaaSNavbar';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSaaS();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const success = await login(email, password);
      if (success) {
        // Store user role as shop owner
        localStorage.setItem('printflow_user_role', 'owner');
        localStorage.removeItem('printflow_admin_auth');
        navigate('/dashboard');
      } else {
        setError('Invalid login credentials. Please check your email and password.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Authentication failed. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SaaSNavbar currentPage="login" />
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[36px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden">
          {/* Visual background accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/70 rounded-full blur-[40px] pointer-events-none" />

          <div className="text-center space-y-3 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mx-auto cursor-pointer group" title="Go to Home">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Printer className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 block text-left leading-none">PrintFlow</span>
                <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase text-left mt-0.5">Cloud</span>
              </div>
            </Link>

            <div className="space-y-1 pt-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shop Owner Portal</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shop Owner Sign In</h1>
              <p className="text-slate-500 font-medium text-xs leading-relaxed">
                Sign in to manage your print queues, shop settings, and connected desktop print agent.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourprinthub.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] disabled:opacity-75 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Shop Owner'}</span>
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="text-center text-xs font-semibold text-slate-400 relative z-10 pt-4 border-t border-slate-100">
            <span>Don't have a shop registered yet? </span>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Register Your Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
