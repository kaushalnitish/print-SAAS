import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SaaSProvider } from './context/SaaSContext';
import { PrintFlowProvider } from './context/PrintFlowContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { WifiOff, Mail, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';

// Walk-in Customer Portal Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { UploadingScreen } from './screens/UploadingScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { TrackingScreen } from './screens/TrackingScreen';

// SaaS Marketing & Admin Screens
import { LandingPage } from './screens/saas/LandingPage';
import { FeaturesPage } from './screens/saas/FeaturesPage';
import { PricingPage } from './screens/saas/PricingPage';
import { ContactPage } from './screens/saas/ContactPage';
import { LoginPage } from './screens/saas/LoginPage';
import { RegisterPage } from './screens/saas/RegisterPage';
import { DashboardShell } from './screens/saas/DashboardShell';
import { DashboardOverview } from './screens/saas/DashboardOverview';
import { DashboardQueue } from './screens/saas/DashboardQueue';
import { DashboardShops } from './screens/saas/DashboardShops';
import { DashboardSettings } from './screens/saas/DashboardSettings';
import { DashboardSubscription } from './screens/saas/DashboardSubscription';
import { DashboardAgent } from './screens/saas/DashboardAgent';

export default function App() {
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [bypassOfflineGuard, setBypassOfflineGuard] = useState(false);

  // Monitor actual Supabase connectivity in real-time instead of unreliable browser onLine flags
  useEffect(() => {
    let active = true;

    const verifySupabaseConnection = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (active) setIsOnline(false);
        return;
      }

      try {
        const { error } = await supabase.from('shops').select('id').limit(1);
        if (active) {
          if (error && (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch') || error.message.includes('network'))) {
            setIsOnline(false);
          } else {
            setIsOnline(true);
          }
        }
      } catch (err) {
        if (active) setIsOnline(false);
      }
    };

    verifySupabaseConnection();

    // Automatically check connection every 30 seconds
    const interval = setInterval(verifySupabaseConnection, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Determine if the merchant has ever registered a shop in this browser
  const hasRegistered = useMemo(() => {
    try {
      const savedShops = localStorage.getItem('printflow_shops');
      const savedOwner = localStorage.getItem('printflow_active_owner');
      const savedUser = localStorage.getItem('printflow_user');
      if (savedOwner || savedUser) return true;
      if (savedShops) {
        const parsed = JSON.parse(savedShops);
        // If they have any shop data
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }, []);

  // Manual reconnect handler
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setIsOnline(false);
      setRetryMessage('Supabase is not configured.');
      setIsRetrying(false);
      return;
    }

    try {
      const { error } = await supabase.from('shops').select('id').limit(1);
      if (error && (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch') || error.message.includes('network'))) {
        setIsOnline(false);
        setRetryMessage('We still cannot establish a connection. Please verify your internet and try again.');
      } else {
        setIsOnline(true);
      }
    } catch (err) {
      setIsOnline(false);
      setRetryMessage('We still cannot establish a connection. Please verify your internet and try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Open email client for customer support
  const handleContactSupport = () => {
    window.location.href = 'mailto:support@printflow.cloud?subject=PrintFlow%20Cloud%20Connection%20Assistance';
  };

  // Register shop handler for new merchants to experience the app in simulated offline mode
  const handleRegisterShop = () => {
    setBypassOfflineGuard(true);
    window.location.hash = '#/register';
  };

  // Decision rule: Show offline screen if:
  // - Cloud connection is missing AND we haven't bypassed the offline guard
  // - OR browser reports being completely offline (no internet connection)
  const shouldShowOfflineScreen = (!isSupabaseConfigured && !bypassOfflineGuard) || !isOnline;

  if (shouldShowOfflineScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 text-center space-y-8 shadow-[0_15px_40px_rgba(15,23,42,0.04)] relative overflow-hidden">
          {/* Decorative subtle background gradient */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="w-20 h-20 bg-indigo-50/70 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative">
            <WifiOff className="w-10 h-10 animate-pulse text-indigo-600" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-indigo-500 rounded-full" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Unable to connect to PrintFlow Cloud
            </h1>
            <p className="text-slate-500 font-medium text-xs leading-relaxed px-2">
              We couldn't connect to the cloud right now. Please check your internet connection or try again in a few moments.
            </p>
          </div>

          {retryMessage && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl text-[11px] font-semibold text-amber-800 leading-relaxed text-left animate-fadeIn">
              {retryMessage}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {hasRegistered ? (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Retry Connection</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleRegisterShop}
                className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Register Shop</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={handleContactSupport}
              className="w-full h-13 bg-white hover:bg-slate-50 text-slate-700 font-extrabold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Contact Support</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100/80 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Securing System Channel
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SaaSProvider>
      <PrintFlowProvider>
        <HashRouter>
          <Routes>
            {/* 1. Public SaaS Marketing Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. Protected Owner Console Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardShell />}>
              <Route index element={<DashboardOverview />} />
              <Route path="queue" element={<DashboardQueue />} />
              <Route path="shops" element={<DashboardShops />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="subscription" element={<DashboardSubscription />} />
              <Route path="agent" element={<DashboardAgent />} />
            </Route>

            {/* 3. Customer Portal Routes - isolated by unique shop slugs */}
            <Route path="/s/:shopSlug" element={<CustomerLayout />}>
              <Route index element={<WelcomeScreen />} />
              <Route path="upload" element={<UploadScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="preview" element={<PreviewScreen />} />
              <Route path="uploading" element={<UploadingScreen />} />
              <Route path="success" element={<SuccessScreen />} />
              <Route path="tracking" element={<TrackingScreen />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </PrintFlowProvider>
    </SaaSProvider>
  );
}
