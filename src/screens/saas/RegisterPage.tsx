import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Shield, ArrowRight, User, Building2, Mail, Phone, Lock, MapPin, Percent, Zap } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { SaaSNavbar } from '../../components/SaaSNavbar';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useSaaS();

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gst, setGst] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBypass = async () => {
    try {
      setLoading(true);
      await register(
        ownerName || 'Demo Owner',
        businessName || 'Print Shop Center',
        email || 'owner@printflow.cloud',
        phone || '+1 555-0192',
        address || 'Counter 1',
        password || 'password123'
      );
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const fullAddress = `${address || 'Main St'}, ${city || 'City'}, ${state || 'State'}${gst ? ` (GSTIN: ${gst})` : ''}`;
      
      await register(
        ownerName || 'Demo Owner',
        businessName || 'Print Shop Center',
        email || 'owner@printflow.cloud',
        phone || '+1 555-0192',
        fullAddress,
        password || 'password123'
      );
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SaaSNavbar currentPage="register" />
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[36px] border border-slate-100 shadow-xl shadow-slate-900/5 space-y-6 relative overflow-hidden">
          {/* Visual background gradient accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-100/60 rounded-full blur-[45px] pointer-events-none" />

          <div className="relative z-10 text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 mx-auto focus:outline-none cursor-pointer group" title="Go to Home">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Printer className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 block text-left leading-none">PrintFlow</span>
                <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase text-left mt-0.5">Cloud</span>
              </div>
            </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Print Shop</h1>
            <p className="text-slate-500 font-medium text-sm">Launch your commercial print queue counter instantly.</p>
          </div>
        </div>

        {/* Prominent Bypass Action Box */}
        <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl space-y-2 relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-100" />
              <span>Instant Demo / Bypass Registration</span>
            </div>
            <p className="text-[11px] text-indigo-700/90 font-medium">
              Skip registration form filling and immediately jump into the Owner Dashboard Console.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBypass}
            disabled={loading}
            className="px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-[1.01]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bypass & Open Console</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Owner Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Business Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Elite Print Center"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@elitecopy.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (650) 555-0199"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Business Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, Suite, Shop number"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Palo Alto"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. California"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">GST (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Percent className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="e.g. 07AAAAA1111A1Z1"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirm Password (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] disabled:opacity-75 disabled:pointer-events-none"
          >
            <span>{loading ? 'Initializing Shop...' : 'Register & Initialize Shop'}</span>
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-slate-400 relative z-10 pt-4 border-t border-slate-100">
          <span>Already have a shop counter? </span>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};
