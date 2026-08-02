import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, Home, Shield, Store, Sun, Moon, Code2 } from 'lucide-react';

interface SaaSNavbarProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'contact' | 'login' | 'register' | 'developer-login';
  isDark?: boolean;
  toggleTheme?: () => void;
}

export const SaaSNavbar: React.FC<SaaSNavbarProps> = ({ currentPage, isDark, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
      {/* Clickable Brand Logo */}
      <Link 
        to="/" 
        className="flex items-center gap-2.5 group cursor-pointer" 
        title="PrintFlow Cloud - Go to Home"
        aria-label="PrintFlow Cloud Homepage"
      >
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Printer className="w-5.5 h-5.5" />
        </div>
        <div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white block leading-none">PrintFlow</span>
          <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase mt-0.5">Cloud</span>
        </div>
      </Link>

      {/* Global Navigation Links */}
      <div className="hidden md:flex items-center gap-6 font-extrabold text-slate-600 dark:text-slate-300 text-sm">
        <Link 
          to="/" 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            currentPage === 'home'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black'
              : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
          title="Return to Home Page"
        >
          <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Home</span>
        </Link>

        <Link 
          to="/features" 
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentPage === 'features'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Features
        </Link>

        <Link 
          to="/pricing" 
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentPage === 'pricing'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pricing
        </Link>

        <Link 
          to="/contact" 
          className={`px-3 py-1.5 rounded-xl transition-all ${
            currentPage === 'contact'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Contact
        </Link>
      </div>

      {/* Auth Action CTAs */}
      <div className="flex items-center gap-2.5">
        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}

        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <span>Sign In</span>
        </button>

        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Create New Account</span>
        </button>

        <button
          onClick={() => navigate('/developer-login')}
          className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 dark:text-indigo-200 text-xs font-black px-3.5 py-2.5 rounded-xl border border-indigo-800/80 transition-all cursor-pointer"
          title="Developer Console Sign In"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Developer Sign In</span>
        </button>
      </div>
    </nav>
  );
};
