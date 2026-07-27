import React, { useState, useEffect } from 'react';
import { useSaaS, Shop } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { adminConsoleService } from '../../services/adminConsoleService';
import { AdminAnalyticsSection } from '../../components/analytics/AdminAnalyticsSection';
import { 
  AdminShopDetails, 
  AdminCustomer, 
  ArchivedDocument, 
  AdminActivityLog, 
  LiveWorkflowJob,
  AdminSubscriptionStatus 
} from '../../types/admin';
import { 
  Building2, Search, Filter, QrCode, Copy, Check, ExternalLink, 
  Play, Pause, RefreshCw, Power, RotateCcw, Download, Trash2, 
  FileText, User, Phone, Mail, MapPin, Key, Shield, ArrowUpRight, 
  CheckCircle2, AlertCircle, Clock, ChevronRight, Layers, Printer, 
  CreditCard, Settings, Activity, ArrowLeft, Send, Sparkles, X, 
  Database, Archive, Sliders, Lock, Unlock, HardDrive, CheckCircle
} from 'lucide-react';

export const DashboardAdminConsole: React.FC = () => {
  const { shops, currentShop, selectShop, updateShopSettings, updateJobStatus } = useSaaS();

  // Active view state
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [shopWorkspaceTab, setShopWorkspaceTab] = useState<
    'overview' | 'workflow' | 'customers' | 'jobs' | 'archive' | 'agent' | 'billing' | 'credentials' | 'support' | 'logs'
  >('overview');

  // Display toggles & filters
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for administrative documents & activity
  const [archives, setArchives] = useState<ArchivedDocument[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);

  // Modals & Notices
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [qrModalShop, setQrModalShop] = useState<AdminShopDetails | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');

  // Load initial dataset
  useEffect(() => {
    if (shops && shops.length > 0) {
      setArchives(adminConsoleService.getInitialArchives(shops));
      setCustomers(adminConsoleService.getInitialCustomers(shops));
      setLogs(adminConsoleService.getInitialLogs(shops));
    }
  }, [shops]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Convert shops list into AdminShopDetails list
  const adminShops: AdminShopDetails[] = (shops || []).map((s) => adminConsoleService.mapShopToAdminDetails(s));

  // Filtered shops list
  const filteredShops = adminShops.filter((shop) => {
    if (filterStatus === 'ONLINE' && shop.agentStatus !== 'Online') return false;
    if (filterStatus === 'OFFLINE' && shop.agentStatus !== 'Offline') return false;
    if (filterStatus === 'ENTERPRISE' && shop.subscriptionPlan !== 'Enterprise') return false;
    if (filterStatus === 'SUSPENDED' && shop.subscriptionStatus !== 'Suspended') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shop.shopName.toLowerCase().includes(q);
      const matchOwner = shop.ownerName.toLowerCase().includes(q);
      const matchEmail = shop.email.toLowerCase().includes(q);
      const matchPhone = shop.phone.toLowerCase().includes(q);
      const matchId = shop.shopId.toLowerCase().includes(q);
      const matchKey = shop.pairingKey.toLowerCase().includes(q);
      return matchName || matchOwner || matchEmail || matchPhone || matchId || matchKey;
    }
    return true;
  });

  // Selected Active Shop for Deep Workspace
  const activeAdminShop = adminShops.find((s) => s.id === selectedShopId || s.shopId === selectedShopId) || adminShops[0];
  const activeSaaSShop = shops.find((s) => s.id === activeAdminShop?.id || s.shopId === activeAdminShop?.shopId);

  // Live jobs for active shop
  const liveJobs: LiveWorkflowJob[] = activeSaaSShop ? adminConsoleService.mapLiveJobs(activeSaaSShop) : [];

  // Filtered Archives
  const shopArchives = archives.filter((a) => !selectedShopId || a.shopId === activeAdminShop?.shopId);

  // Filtered Customers
  const shopCustomers = customers.filter((c) => !selectedShopId || c.shopId === activeAdminShop?.shopId);

  // Filtered Activity Logs
  const shopLogs = logs.filter((l) => !selectedShopId || l.shopId === activeAdminShop?.shopId);

  // Admin Actions
  const handleResetPairingKey = (shopId: string) => {
    const newKey = adminConsoleService.generatePairingKey();
    if (activeSaaSShop) {
      updateShopSettings(activeSaaSShop.shopId, { pairingKey: newKey });
    }
    showToast(`Pairing key reset successfully! New Pairing Key: [${newKey}]`);
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        shopId,
        shopName: activeAdminShop?.shopName || 'Shop',
        actor: 'Super Admin',
        category: 'security',
        action: 'Reset Shop Pairing Key',
        details: `Pairing key regenerated: ${newKey}`,
        severity: 'info',
      },
      ...prev,
    ]);
  };

  const handleGenerateShopKey = (shopId: string) => {
    const newShopKey = adminConsoleService.generateShopKey();
    showToast(`New API Shop Key generated: ${newShopKey}`);
  };

  const handleToggleShopDisabled = (shopId: string) => {
    const nextDisabled = !activeAdminShop?.disabled;
    showToast(`Shop state updated: ${nextDisabled ? 'DISABLED' : 'ENABLED'}`);
  };

  const handleToggleSubscription = (status: AdminSubscriptionStatus) => {
    if (activeSaaSShop) {
      updateShopSettings(activeSaaSShop.shopId, { subscriptionStatus: status.toLowerCase() });
    }
    showToast(`Subscription status updated to '${status}'.`);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    showToast(`Admin message broadcasted to shop '${activeAdminShop?.shopName}': "${broadcastMessage}"`);
    setBroadcastMessage('');
  };

  const handleRestoreArchive = (archId: string) => {
    setArchives((prev) =>
      prev.map((a) => (a.id === archId ? { ...a, status: 'Restored' } : a))
    );
    showToast(`Archived document restored back to print queue pipeline.`);
  };

  const handleDeleteArchive = (archId: string) => {
    setArchives((prev) => prev.filter((a) => a.id !== archId));
    showToast(`Compressed archive record deleted.`);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>PrintFlow Admin Console</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">• Private Super-Admin Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Enterprise Admin Workspace</h1>
          <p className="text-slate-500 font-medium text-xs leading-normal max-w-2xl mt-0.5">
            Central management for registered shops, live workflow pipelines, compressed document archives, credentials, agent status, and customer support.
          </p>
        </div>

        {/* Global Search Bar (Section 8) */}
        <div className="w-full lg:w-auto flex items-center gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shops, owners, phones, IDs..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-sm"
            />
          </div>

          {selectedShopId && (
            <button
              onClick={() => setSelectedShopId(null)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Shops</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastNotice && (
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl flex items-center justify-between border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-slate-400 hover:text-white font-extrabold text-xs px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW MODE A: MAIN ALL REGISTERED SHOPS DIRECTORY (If no active shop workspace is opened) */}
      {!selectedShopId ? (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border border-slate-200/80 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Registered Shops</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{adminShops.length}</span>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">100% Active Merchants</p>
              </div>
            </Card>

            <Card className="p-4 border border-slate-200/80 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Desktop Agents Online</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">
                  {adminShops.filter((s) => s.agentStatus === 'Online').length}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1">/ {adminShops.length} online</span>
              </div>
            </Card>

            <Card className="p-4 border border-slate-200/80 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Print Jobs Analytics</span>
                <Printer className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">
                  {adminShops.reduce((acc, s) => acc + (s.totalJobsProcessed || 120), 0).toLocaleString()}
                </span>
                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">Network Print Jobs Processed</p>
              </div>
            </Card>

            <Card className="p-4 border border-slate-200/80 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Compressed Archives</span>
                <Archive className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{archives.length}</span>
                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">Avg 86% Storage Reduction</p>
              </div>
            </Card>
          </div>

          {/* Primary Admin Print Jobs Analytics Module */}
          <AdminAnalyticsSection shops={adminShops} />

          {/* Directory Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-700 mr-2">Filter Shops:</span>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({adminShops.length})
              </button>
              <button
                onClick={() => setFilterStatus('ONLINE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === 'ONLINE' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Online Agents
              </button>
              <button
                onClick={() => setFilterStatus('ENTERPRISE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filterStatus === 'ENTERPRISE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Enterprise
              </button>
            </div>

            {/* Layout Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {/* SECTION 1: REGISTERED SHOPS - CARDS OR TABLE */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredShops.map((shop) => (
                <Card key={shop.id} className="p-6 border border-slate-200/80 bg-white space-y-5 hover:shadow-lg transition-all">
                  {/* Shop Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-lg">{shop.shopName}</h3>
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                          {shop.subscriptionPlan}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Owner: <span className="text-slate-800 font-bold">{shop.ownerName}</span> ({shop.email})
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          shop.agentStatus === 'Online'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${shop.agentStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>Agent {shop.agentStatus}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Last pulse: {shop.lastHeartbeat}</span>
                    </div>
                  </div>

                  {/* Shop Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 font-medium">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shop ID</span>
                      <span className="font-mono font-bold text-slate-900">{shop.shopId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pairing Key</span>
                      <span className="font-mono font-bold text-indigo-600">{shop.pairingKey}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Printer</span>
                      <span className="font-bold text-slate-800 truncate block">{shop.printerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                      <span className="text-slate-800 font-bold">{shop.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Date</span>
                      <span className="text-slate-800 font-bold">{shop.registrationDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Agent Version</span>
                      <span className="font-mono text-slate-700">{shop.agentVersion}</span>
                    </div>
                  </div>

                  {/* Address & Credentials Summary */}
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                      <Key className="w-3 h-3 text-slate-500" />
                      <span>{shop.shopKey}</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <a
                        href={shop.customerPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Portal</span>
                      </a>

                      <button
                        onClick={() => handleCopy(shop.customerPortalUrl, `portal-${shop.id}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Copy Customer Portal Link"
                      >
                        {copiedKey === `portal-${shop.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setQrModalShop(shop)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="View & Download QR Code"
                      >
                        <QrCode className="w-4 h-4 text-indigo-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedShopId(shop.id);
                        selectShop(shop.shopId);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <span>Open Shop</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Table View */
            <Card className="p-0 border border-slate-200/80 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                    <tr>
                      <th className="py-3.5 px-4">Shop & Owner</th>
                      <th className="py-3.5 px-4">Contact & Address</th>
                      <th className="py-3.5 px-4">Credentials & Keys</th>
                      <th className="py-3.5 px-4">Plan & Renewal</th>
                      <th className="py-3.5 px-4">Agent Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-sm">{shop.shopName}</div>
                          <div className="text-slate-500">{shop.ownerName}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-800 font-bold">{shop.email}</div>
                          <div className="text-slate-500">{shop.phone}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div>ID: <span className="font-bold text-slate-900">{shop.shopId}</span></div>
                          <div>Pairing: <span className="font-bold text-indigo-600">{shop.pairingKey}</span></div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                            {shop.subscriptionPlan}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">Renews: {shop.expiryDate}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              shop.agentStatus === 'Online'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            ● Agent {shop.agentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedShopId(shop.id);
                              selectShop(shop.shopId);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Open Shop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* VIEW MODE B: SECTION 2 - DEEP SHOP WORKSPACE (Tabs: Overview, Live Workflow, Customers, Print Jobs, Document Archive, Desktop Agent, Billing, Settings, Activity Logs) */
        <div className="space-y-6">
          {/* Active Shop Top Workspace Navigation Bar */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedShopId(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
                  title="Back to All Shops Directory"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{activeAdminShop.shopName}</h2>
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] font-bold">
                      {activeAdminShop.subscriptionPlan} Plan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Shop ID: <span className="font-mono text-slate-900 font-bold">{activeAdminShop.shopId}</span> • Owner: {activeAdminShop.ownerName} ({activeAdminShop.email})
                  </p>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="flex items-center gap-2">
                <a
                  href={activeAdminShop.customerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Customer Portal</span>
                </a>
                <button
                  onClick={() => handleResetPairingKey(activeAdminShop.shopId)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Pairing</span>
                </button>
              </div>
            </div>

            {/* SECTION 2 TABS RAIL */}
            <div className="flex border-b border-slate-200/80 gap-1 overflow-x-auto pb-px">
              {[
                { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
                { id: 'workflow', label: 'Live Workflow', icon: <Play className="w-4 h-4" /> },
                { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
                { id: 'jobs', label: 'Print Jobs', icon: <FileText className="w-4 h-4" /> },
                { id: 'archive', label: 'Document Archive', icon: <Archive className="w-4 h-4" /> },
                { id: 'agent', label: 'Desktop Agent', icon: <Printer className="w-4 h-4" /> },
                { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'credentials', label: 'Credentials', icon: <Key className="w-4 h-4" /> },
                { id: 'support', label: 'Support Center', icon: <Shield className="w-4 h-4" /> },
                { id: 'logs', label: 'Activity Logs', icon: <Activity className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setShopWorkspaceTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold border-b-2 transition-all shrink-0 cursor-pointer ${
                    shopWorkspaceTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {shopWorkspaceTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 border border-slate-200/80 space-y-5 lg:col-span-2">
                <h3 className="font-extrabold text-slate-900 text-base">Shop Health & Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Agent Status</span>
                    <div className="text-sm font-black text-emerald-600 mt-1">● {activeAdminShop.agentStatus}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Jobs</span>
                    <div className="text-sm font-black text-slate-900 mt-1">{activeAdminShop.totalJobsProcessed} processed</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Customers</span>
                    <div className="text-sm font-black text-slate-900 mt-1">{activeAdminShop.totalCustomersCount} customers</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pairing Key</span>
                    <div className="text-sm font-mono font-black text-indigo-600 mt-1">{activeAdminShop.pairingKey}</div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="font-extrabold text-slate-800 text-sm">Business Location & Contact Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{activeAdminShop.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{activeAdminShop.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{activeAdminShop.address}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* QR Code Quick Panel */}
              <Card className="p-6 border border-slate-200/80 space-y-4 text-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Customer Portal QR Code</h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto">
                  <img src={activeAdminShop.qrCodeUrl} alt="QR Code" className="w-40 h-40 object-contain mx-auto" />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopy(activeAdminShop.customerPortalUrl, 'qr-url')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    {copiedKey === 'qr-url' ? 'Copied Link!' : 'Copy Portal URL'}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: SECTION 3 - LIVE WORKFLOW */}
          {shopWorkspaceTab === 'workflow' && (
            <Card className="p-6 border border-slate-200/80 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Realtime Printing Pipeline Visualizer</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Live document stage updates: Customer Uploaded → Waiting → Downloaded → Printing → Completed
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                  ● REALTIME BACKEND ACTIVE
                </span>
              </div>

              {/* Stage Stepper Banner */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-slate-900 text-white rounded-2xl text-center text-xs font-extrabold">
                <div className="p-2 bg-indigo-900/80 text-indigo-200 rounded-xl">1. Uploaded</div>
                <div className="p-2 bg-amber-900/80 text-amber-200 rounded-xl">2. Waiting</div>
                <div className="p-2 bg-blue-900/80 text-blue-200 rounded-xl">3. Downloaded</div>
                <div className="p-2 bg-purple-900/80 text-purple-200 rounded-xl">4. Printing</div>
                <div className="p-2 bg-emerald-900/80 text-emerald-200 rounded-xl">5. Completed</div>
              </div>

              {/* Live Jobs List */}
              <div className="space-y-4">
                {liveJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs">
                    No active print jobs currently in pipeline for this shop.
                  </div>
                ) : (
                  liveJobs.map((job) => (
                    <div key={job.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-mono font-black">
                            {job.token}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{job.fileName}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Customer: <span className="font-bold text-slate-800">{job.customerName}</span> ({job.customerMobile})
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">
                          Stage: {job.currentStage}
                        </span>
                      </div>

                      {/* Document Details Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-150">
                        <div>Pages: <span className="text-slate-900 font-bold">{job.pages}</span></div>
                        <div>Copies: <span className="text-slate-900 font-bold">{job.copies}</span></div>
                        <div>Color: <span className="text-slate-900 font-bold uppercase">{job.colorMode}</span></div>
                        <div>Paper: <span className="text-slate-900 font-bold uppercase">{job.paperSize}</span></div>
                        <div>Uploaded: <span className="text-slate-900 font-bold">{job.uploadTime}</span></div>
                        <div>Completion: <span className="text-slate-900 font-bold">{job.completionTime || 'In Progress'}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* TAB 3: CUSTOMERS */}
          {shopWorkspaceTab === 'customers' && (
            <Card className="p-6 border border-slate-200/80 space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Customer Directory</h3>
                <span className="text-xs font-bold text-slate-500">{shopCustomers.length} Customers</span>
              </div>

              <div className="divide-y divide-slate-100">
                {shopCustomers.map((cust) => (
                  <div key={cust.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{cust.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {cust.email} • {cust.phone}
                      </p>
                    </div>
                    <div className="text-right text-xs font-medium text-slate-600">
                      <div>Total Jobs: <span className="font-bold text-slate-900">{cust.totalJobs}</span> ({cust.pagesPrinted} pages)</div>
                      <div className="text-[10px] text-slate-400">Last active: {cust.lastActive}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: PRINT JOBS */}
          {shopWorkspaceTab === 'jobs' && (
            <Card className="p-6 border border-slate-200/80 space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base">Print Jobs History</h3>
                <span className="text-xs font-bold text-slate-500">{liveJobs.length} Jobs Recorded</span>
              </div>

              <div className="space-y-3">
                {liveJobs.map((j) => (
                  <div key={j.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{j.fileName}</span>
                      <p className="text-[11px] text-slate-500">{j.customerName} • {j.pages} pgs • {j.uploadTime}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
                      {j.printStatus}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 5: SECTION 4 - DOCUMENT ARCHIVE */}
          {shopWorkspaceTab === 'archive' && (
            <Card className="p-6 border border-slate-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Archive className="w-5 h-5 text-indigo-600" />
                    <span>Compressed Document Archive Vault</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Automated compressed file backups created post-completion. Storage optimized up to 88% reduction.
                  </p>
                </div>

                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700">
                  Storage Reduction: <span className="font-black">86% Average</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {shopArchives.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs">
                    No completed document archives currently stored for this shop.
                  </div>
                ) : (
                  shopArchives.map((arch) => (
                    <div key={arch.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{arch.fileName}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              Customer: <span className="font-bold text-slate-800">{arch.customerName}</span> ({arch.customerPhone}) • Uploaded: {arch.uploadDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreArchive(arch.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteArchive(arch.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                            title="Delete Archive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Compression Specs Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-slate-600">
                        <div>Original: <span className="text-slate-900 font-bold">{arch.originalSizeMb} MB</span></div>
                        <div>Compressed: <span className="text-emerald-600 font-bold">{arch.compressedSizeMb} MB</span></div>
                        <div>Saved: <span className="text-indigo-600 font-bold">{arch.compressionRatioPercent}%</span></div>
                        <div>Retention: <span className="text-slate-800 font-bold">{arch.retentionPolicy}</span></div>
                        <div>Status: <span className="text-indigo-700 font-bold">{arch.status}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* TAB 6: SECTION 5 - DESKTOP AGENT */}
          {shopWorkspaceTab === 'agent' && (
            <Card className="p-6 border border-slate-200/80 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Desktop Agent Control</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Clean business agent status monitor and spooler state.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                  ● AGENT {activeAdminShop.agentStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 text-xs font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>Agent Version:</span>
                    <span className="font-mono font-bold text-slate-900">{activeAdminShop.agentVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Heartbeat:</span>
                    <span className="font-bold text-slate-900">{activeAdminShop.lastHeartbeat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Since:</span>
                    <span className="font-bold text-slate-900">{activeAdminShop.connectedSince}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pairing Status:</span>
                    <span className="font-bold text-emerald-600">Paired & Authenticated</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 text-xs font-medium text-slate-700">
                  <div className="flex justify-between">
                    <span>Current Hardware Printer:</span>
                    <span className="font-bold text-slate-900">{activeAdminShop.printerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Printer Hardware Status:</span>
                    <span className="font-bold text-emerald-600">{activeAdminShop.printerStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Job in Spooler:</span>
                    <span className="font-bold text-slate-900">Idle (0 active)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restart Required:</span>
                    <span className="font-bold text-slate-500">No</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 7: BILLING */}
          {shopWorkspaceTab === 'billing' && (
            <Card className="p-6 border border-slate-200/80 space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base">Subscription & SaaS Billing</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs font-medium">
                <div className="flex justify-between">
                  <span>Current Plan:</span>
                  <span className="font-bold text-slate-900">{activeAdminShop.subscriptionPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subscription Status:</span>
                  <span className="font-bold text-emerald-600">{activeAdminShop.subscriptionStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Renewal Date:</span>
                  <span className="font-bold text-slate-900">{activeAdminShop.expiryDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleSubscription('Active')}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Renew Subscription
                </button>
                <button
                  onClick={() => handleToggleSubscription('Suspended')}
                  className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Suspend Subscription
                </button>
              </div>
            </Card>
          )}

          {/* TAB 8: SECTION 6 - SHOP CREDENTIALS */}
          {shopWorkspaceTab === 'credentials' && (
            <Card className="p-6 border border-slate-200/80 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <span>Secure Shop Credentials & Keys</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Super-admin security tokens for desktop agent pairing and REST API authentication.
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Shop ID</span>
                  <div className="flex justify-between items-center font-mono font-bold text-slate-900 text-sm">
                    <span>{activeAdminShop.shopId}</span>
                    <button
                      onClick={() => handleCopy(activeAdminShop.shopId, 'shop-id')}
                      className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pairing Key</span>
                  <div className="flex justify-between items-center font-mono font-bold text-indigo-600 text-sm">
                    <span>{activeAdminShop.pairingKey}</span>
                    <button
                      onClick={() => handleCopy(activeAdminShop.pairingKey, 'pairing-key')}
                      className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Shop Secret Key</span>
                  <div className="flex justify-between items-center font-mono font-bold text-slate-900 text-sm">
                    <span>{activeAdminShop.shopKey}</span>
                    <button
                      onClick={() => handleCopy(activeAdminShop.shopKey, 'shop-key')}
                      className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleResetPairingKey(activeAdminShop.shopId)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Reset Pairing Key
                  </button>
                  <button
                    onClick={() => handleGenerateShopKey(activeAdminShop.shopId)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Generate New Shop Key
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 9: SECTION 7 - SUPPORT CENTER */}
          {shopWorkspaceTab === 'support' && (
            <Card className="p-6 border border-slate-200/80 space-y-6">
              <h3 className="font-extrabold text-slate-900 text-base">Support Center & Administrative Tools</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href={activeAdminShop.customerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 space-y-2 transition-colors block"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Open Customer Portal</span>
                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Launch live customer upload experience.</p>
                </a>

                <button
                  onClick={() => handleResetPairingKey(activeAdminShop.shopId)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 space-y-2 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                    <span>Reset Desktop Agent</span>
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Re-issue pairing key and reset handshake.</p>
                </button>

                <button
                  onClick={() => handleToggleShopDisabled(activeAdminShop.shopId)}
                  className="p-4 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-200 space-y-2 text-left transition-colors cursor-pointer"
                >
                  <div className="font-bold text-rose-900 text-xs flex items-center justify-between">
                    <span>Disable / Enable Shop</span>
                    <Power className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-rose-700">Temporarily freeze print shop access.</p>
                </button>
              </div>

              {/* Broadcast Notification Input */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Send Admin Broadcast Notification</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter urgent message for shop terminal..."
                    className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    onClick={handleSendBroadcast}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 10: ACTIVITY LOGS */}
          {shopWorkspaceTab === 'logs' && (
            <Card className="p-6 border border-slate-200/80 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Activity Audit Logs</h3>
              <div className="divide-y divide-slate-100 font-mono text-xs">
                {shopLogs.map((l) => (
                  <div key={l.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">[{l.actor}]</span> {l.action} - <span className="text-slate-500">{l.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalShop && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">{qrModalShop.shopName}</h3>
              <button onClick={() => setQrModalShop(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <img src={qrModalShop.qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto object-contain" />
            </div>
            <div className="space-y-2">
              <a
                href={qrModalShop.qrCodeUrl}
                download={`QR_${qrModalShop.shopId}.png`}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
