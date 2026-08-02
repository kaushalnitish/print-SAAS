import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSaaS, Shop } from '../../context/SaaSContext';
import { developerAuthService } from '../../services/developerAuthService';
import { Card } from '../../components/Card';
import { 
  Building2, Search, Filter, QrCode, Copy, Check, ExternalLink, 
  Play, Pause, RefreshCw, Power, RotateCcw, Download, Trash2, 
  FileText, User, Phone, Mail, MapPin, Key, Shield, ArrowUpRight, 
  CheckCircle2, AlertCircle, Clock, ChevronRight, Layers, Printer, 
  CreditCard, Settings, Activity, ArrowLeft, Send, Sparkles, X, 
  Database, Archive, Sliders, Lock, Unlock, HardDrive, CheckCircle,
  Code2, Eye, LogOut, Cpu, Radio, ShieldCheck, ToggleLeft, ToggleRight, DollarSign,
  TrendingUp, HelpCircle
} from 'lucide-react';

export const DeveloperConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const { shops, currentShop, selectShop, updateShopSettings, deleteShop } = useSaaS();

  // Session check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(developerAuthService.isAuthenticated());
  const developerSession = developerAuthService.getSession();

  // Console active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'settings' | 'logs'>('overview');

  // Display toggles & filters
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Developer Credentials Form
  const [showDevSettingsModal, setShowDevSettingsModal] = useState(false);
  const [newDevEmail, setNewDevEmail] = useState(developerSession?.email || 'developer@printflow.local');
  const [newDevPasscode, setNewDevPasscode] = useState('');
  const [devSettingsNotice, setDevSettingsNotice] = useState<string | null>(null);

  // Shop Edit Pricing Modal
  const [editingPricingShop, setEditingPricingShop] = useState<Shop | null>(null);
  const [priceA4BW, setPriceA4BW] = useState('2.00');
  const [priceA4Color, setPriceA4Color] = useState('10.00');
  const [priceA3BW, setPriceA3BW] = useState('5.00');
  const [priceA3Color, setPriceA3Color] = useState('25.00');
  const [priceGST, setPriceGST] = useState('18');

  // Toast notice
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Global Settings State
  const [demoPaymentEnabled, setDemoPaymentEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementBanner, setAnnouncementBanner] = useState('PrintFlow SaaS v2.4.0 Engine Active. All Desktop Print Agents synced.');
  const [agentVersion, setAgentVersion] = useState('2.4.1-stable');

  useEffect(() => {
    setIsAuthenticated(developerAuthService.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-800/80 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Developer Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              The Developer Console requires authenticated fixed passcode credentials.
            </p>
          </div>
          <button
            onClick={() => navigate('/developer-login')}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <Code2 className="w-4 h-4" />
            <span>Developer Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogout = () => {
    developerAuthService.logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  // Update Developer Credentials
  const handleSaveDevCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevEmail || !newDevPasscode || newDevPasscode.length < 4) {
      setDevSettingsNotice('Please enter a valid email and passcode (at least 4 characters).');
      return;
    }

    const updated = developerAuthService.updateCredentials(newDevEmail, newDevPasscode);
    if (updated) {
      setDevSettingsNotice('Developer Email & Passcode updated successfully!');
      setTimeout(() => {
        setShowDevSettingsModal(false);
        setDevSettingsNotice(null);
        setNewDevPasscode('');
        showToast('Developer credentials updated!');
      }, 1200);
    } else {
      setDevSettingsNotice('Failed to update developer credentials.');
    }
  };

  // Shop Impersonation: Open Shop Dashboard as Owner
  const handleImpersonateShop = (shop: Shop) => {
    developerAuthService.setImpersonatedShop(shop.id || shop.shopId);
    selectShop(shop.id || shop.shopId);
    showToast(`Entering Shop Owner Dashboard for: ${shop.shopName}`);
    navigate('/dashboard');
  };

  // Actions on Shop
  const handleToggleShopStatus = (shop: Shop) => {
    const currentSub = shop.subscriptionStatus || 'active';
    const newStatus = currentSub === 'Suspended' ? 'active' : 'Suspended';
    updateShopSettings(shop.shopId || shop.id, { subscriptionStatus: newStatus });
    showToast(`Shop [${shop.shopName}] status updated to: ${newStatus.toUpperCase()}`);
  };

  const handleResetPairingKey = (shop: Shop) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'PF-';
    for (let i = 0; i < 8; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateShopSettings(shop.shopId || shop.id, { pairingKey: key });
    showToast(`Pairing key regenerated for ${shop.shopName}: [${key}]`);
  };

  const handleDeleteShopClick = (shop: Shop) => {
    if (window.confirm(`Are you sure you want to delete shop "${shop.shopName}"? This action cannot be undone.`)) {
      deleteShop(shop.shopId || shop.id);
      showToast(`Shop "${shop.shopName}" removed.`);
    }
  };

  // Helper for job price estimation
  const calculateJobPrice = (job: any): number => {
    if (job.totalPrice && typeof job.totalPrice === 'number') return job.totalPrice;
    const pages = job.pages || 1;
    const copies = job.copies || 1;
    const rate = job.colorMode === 'color' ? 10 : 2;
    return pages * copies * rate;
  };

  // Metrics Calculations
  const totalShopsCount = shops.length;
  const onlineAgentsCount = shops.filter(s => s.agentStatus === 'connected').length;
  const offlineAgentsCount = totalShopsCount - onlineAgentsCount;
  const totalJobsCount = shops.reduce((acc, s) => acc + (s.printJobs?.length || 0), 0);
  const totalRevenueINR = shops.reduce((acc, s) => {
    const jobs = s.printJobs || [];
    return acc + jobs.reduce((jAcc, j) => jAcc + calculateJobPrice(j), 0);
  }, 0);

  // Filtered Shops
  const filteredShopsList = shops.filter(shop => {
    if (filterStatus === 'ONLINE' && shop.agentStatus !== 'connected') return false;
    if (filterStatus === 'OFFLINE' && shop.agentStatus === 'connected') return false;
    if (filterStatus === 'SUSPENDED' && shop.subscriptionStatus !== 'Suspended') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (shop.shopName || shop.name || '').toLowerCase().includes(q);
      const matchOwner = (shop.ownerName || '').toLowerCase().includes(q);
      const matchEmail = (shop.email || '').toLowerCase().includes(q);
      const matchSlug = (shop.shopSlug || shop.slug || '').toLowerCase().includes(q);
      const matchId = (shop.shopId || shop.id || '').toLowerCase().includes(q);
      return matchName || matchOwner || matchEmail || matchSlug || matchId;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-600 selection:text-white pb-16">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Printer className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">PrintFlow</span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-950 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-800/80">
                Developer Console
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Master SaaS Engine & Tenant Control Center</p>
          </div>
        </div>

        {/* Console Action Buttons & Dev Identity */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-indigo-300">{developerSession?.email}</span>
          </div>

          <button
            onClick={() => setShowDevSettingsModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-extrabold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Developer Security</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-extrabold transition-all border border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
            title="Log Out Developer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'shops'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Shop Management ({shops.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Global Settings & Demo Config</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: PLATFORM OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top SaaS Status Banner */}
            <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SaaS Master Control Active</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Platform Engine & Tenant Telemetry
                </h1>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  {announcementBanner}
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10 shrink-0">
                <div className="px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block">System Health</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Operational 100%
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('shops')}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Manage All Shops</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Shops</span>
                  <Building2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white">{totalShopsCount}</div>
                <p className="text-[11px] text-slate-400 font-medium">Active tenant outlets</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Connected Agents</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">{onlineAgentsCount} <span className="text-xs font-bold text-slate-500">/ {totalShopsCount}</span></div>
                <p className="text-[11px] text-emerald-400/80 font-medium">{offlineAgentsCount} offline agents</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Print Jobs</span>
                  <Printer className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white">{totalJobsCount}</div>
                <p className="text-[11px] text-slate-400 font-medium">Processed across tenants</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-300">₹{totalRevenueINR.toFixed(2)}</div>
                <p className="text-[11px] text-slate-400 font-medium">Demo Mode orders sum</p>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Subscription Overview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Subscriptions Breakdown</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Plans</span>
                </div>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-300">Starter Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold">
                      {shops.filter(s => s.subscription === 'Starter').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-300">Professional Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                      {shops.filter(s => s.subscription === 'Professional').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-300">Enterprise Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 font-bold">
                      {shops.filter(s => s.subscription === 'Enterprise').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Platform Engine Config */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Realtime Print Agent Engine</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Agent Binary Version</span>
                      <span className="font-mono text-emerald-400">{agentVersion}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Auto-updates enabled across connected desktop agents.</p>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Razorpay Mode</span>
                      <span className="font-mono text-amber-400">DEMO MODE</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Simulated payments active for customer workflow validation.</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Developer Actions */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Developer Security</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Update fixed passcode credentials or configure developer settings for MVP session management.
                </p>
                <button
                  onClick={() => setShowDevSettingsModal(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Developer Email & Passcode</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SHOP MANAGEMENT & IMPERSONATION */}
        {/* ========================================================================= */}
        {activeTab === 'shops' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>Shop Tenant Directory ({filteredShopsList.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Inspect, manage, change pricing, generate keys, or open any shop dashboard as owner.
                </p>
              </div>

              {/* Filters & View Toggle */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shop, owner, slug..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ONLINE">Agents Online</option>
                  <option value="OFFLINE">Agents Offline</option>
                  <option value="SUSPENDED">Suspended Shops</option>
                </select>

                <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Grid Cards View"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Table View"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Cards View */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShopsList.map((shop) => {
                  const isOnline = shop.agentStatus === 'connected';
                  const isSuspended = shop.subscriptionStatus === 'Suspended';
                  const shopJobs = shop.printJobs || [];
                  const revenue = shopJobs.reduce((acc, j) => acc + calculateJobPrice(j), 0);

                  return (
                    <div 
                      key={shop.id || shop.shopId}
                      className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 space-y-5 transition-all shadow-xl shadow-black/40 flex flex-col justify-between"
                    >
                      {/* Top Header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-white tracking-tight">{shop.shopName || shop.name}</h3>
                              {isSuspended && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-black uppercase">
                                  Suspended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">Owner: {shop.ownerName}</p>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0 ${
                            isOnline 
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80' 
                              : 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                          }`}>
                            {isOnline ? 'Agent Online' : 'Agent Offline'}
                          </span>
                        </div>

                        {/* Metadata Rows */}
                        <div className="space-y-2 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Shop ID / Slug</span>
                            <span className="font-mono text-indigo-400 font-bold">{shop.shopSlug || shop.slug || shop.shopId}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Customer Portal</span>
                            <a 
                              href={`/#/s/${shop.shopSlug || shop.slug}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline font-bold flex items-center gap-1 text-[11px]"
                            >
                              <span>/s/{shop.shopSlug || shop.slug}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Pairing Key</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-slate-300 font-bold">{shop.pairingKey}</span>
                              <button
                                onClick={() => handleCopy(shop.pairingKey, shop.shopId)}
                                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                title="Copy Pairing Key"
                              >
                                {copiedKey === shop.shopId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2">
                            <span className="text-slate-500 font-semibold">Print Queue / Jobs</span>
                            <span className="font-bold text-slate-200">{shopJobs.length} jobs</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Shop Revenue</span>
                            <span className="font-extrabold text-amber-400">₹{revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Actions Footer */}
                      <div className="space-y-2 pt-2">
                        {/* Impersonation Button */}
                        <button
                          onClick={() => handleImpersonateShop(shop)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Open Shop Dashboard (Impersonate)</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleToggleShopStatus(shop)}
                            className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSuspended
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isSuspended ? 'Resume Shop' : 'Suspend Shop'}</span>
                          </button>

                          <button
                            onClick={() => handleResetPairingKey(shop)}
                            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                            <span>New Pairing Key</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleDeleteShopClick(shop)}
                            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Shop</span>
                          </button>

                          <span className="text-[10px] text-slate-500 font-mono">Plan: {shop.subscription || 'Starter'}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Shop Name & Owner</th>
                        <th className="p-4">Slug / Portal</th>
                        <th className="p-4">Agent Status</th>
                        <th className="p-4">Pairing Key</th>
                        <th className="p-4">Jobs / Revenue</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs font-semibold text-slate-300">
                      {filteredShopsList.map((shop) => {
                        const isOnline = shop.agentStatus === 'connected';
                        const revenue = (shop.printJobs || []).reduce((acc, j) => acc + calculateJobPrice(j), 0);

                        return (
                          <tr key={shop.id || shop.shopId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-bold text-white">
                              <div>{shop.shopName || shop.name}</div>
                              <div className="text-[11px] text-slate-400 font-normal">{shop.ownerName} • {shop.email}</div>
                            </td>

                            <td className="p-4 font-mono text-indigo-400">
                              <a href={`/#/s/${shop.shopSlug || shop.slug}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                <span>/s/{shop.shopSlug || shop.slug}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            </td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </td>

                            <td className="p-4 font-mono text-slate-300">
                              {shop.pairingKey}
                            </td>

                            <td className="p-4">
                              <div>{shop.printJobs?.length || 0} jobs</div>
                              <div className="text-amber-400 font-bold">₹{revenue.toFixed(2)}</div>
                            </td>

                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleImpersonateShop(shop)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Impersonate</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GLOBAL SETTINGS & DEMO CONFIG */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Box 1: Razorpay & Demo Payment Mode Control */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Payment Engine & Razorpay Demo Mode</h3>
                    <p className="text-xs text-slate-400 font-medium">Global payment Gateway simulation parameters.</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-white block">Razorpay DEMO MODE</span>
                      <span className="text-xs text-slate-400 font-medium">Bypasses real API key requirements for testing.</span>
                    </div>
                    <button
                      onClick={() => {
                        setDemoPaymentEnabled(!demoPaymentEnabled);
                        showToast(`Razorpay Demo Mode ${!demoPaymentEnabled ? 'ACTIVATED' : 'DEACTIVATED'}`);
                      }}
                      className="cursor-pointer text-indigo-400"
                    >
                      {demoPaymentEnabled ? (
                        <ToggleRight className="w-9 h-9 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Demo Mode Active</span>
                    </p>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      All Customer Portal checkouts execute simulated payments instantly. Token Generation and Desktop Print Queues automatically trigger without requiring live Razorpay API keys.
                    </p>
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-white block">Maintenance Mode</span>
                    <span className="text-xs text-slate-400 font-medium">Temporary maintenance notice across portals.</span>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(`Maintenance mode ${!maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className="cursor-pointer text-indigo-400"
                  >
                    {maintenanceMode ? (
                      <ToggleRight className="w-9 h-9 text-rose-500" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: Developer Credentials & Security */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Developer Security Passcode</h3>
                    <p className="text-xs text-slate-400 font-medium">Change master Developer login credentials.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveDevCredentials} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                      Developer Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newDevEmail}
                      onChange={(e) => setNewDevEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                      New Developer Passcode
                    </label>
                    <input
                      type="password"
                      required
                      value={newDevPasscode}
                      onChange={(e) => setNewDevPasscode(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {devSettingsNotice && (
                    <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-xl text-xs font-semibold text-indigo-300">
                      {devSettingsNotice}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Save New Developer Passcode</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Developer Security Settings Modal */}
      {showDevSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowDevSettingsModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Developer Credentials</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Update the Developer Email and Fixed Passcode used for Developer Console logins.
              </p>
            </div>

            <form onSubmit={handleSaveDevCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Developer Email
                </label>
                <input
                  type="email"
                  required
                  value={newDevEmail}
                  onChange={(e) => setNewDevEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  New Passcode
                </label>
                <input
                  type="password"
                  required
                  value={newDevPasscode}
                  onChange={(e) => setNewDevPasscode(e.target.value)}
                  placeholder="Enter new passcode"
                  className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {devSettingsNotice && (
                <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-xl text-xs font-semibold text-indigo-300">
                  {devSettingsNotice}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Update Credentials Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
