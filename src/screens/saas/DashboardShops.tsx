import React, { useState } from 'react';
import { 
  Building2, Plus, QrCode, Copy, Link as LinkIcon, Check, 
  Trash2, ShieldAlert, BadgeCheck, Smartphone, ExternalLink, Key
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const DashboardShops: React.FC = () => {
  const { currentOwner, shops, addBranch, deleteShop, currentShop, selectShop } = useSaaS();
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!currentOwner) return null;

  const handleCopyText = (text: string, type: 'id' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName) return;

    addBranch(
      newBranchName,
      newBranchAddress || 'Main Counter Desk',
      newBranchPhone || currentOwner.phone || ''
    );

    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Shops Manager</h1>
          <p className="text-slate-500 font-medium text-xs leading-normal">
            Configure your counter branches, print custom counter stickers, and retrieve pairing keys.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4.5 py-3 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Register New Branch</span>
        </button>
      </div>

      {/* Add New Branch Drawer / Modal Form */}
      {showAddForm && (
        <Card className="p-6 md:p-8 bg-white border border-indigo-150 animate-fadeIn" id="new-branch-card">
          <form onSubmit={handleCreateBranch} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg">Register a New Counter Desk</h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 font-bold hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Branch Name</label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. University Plaza Branch"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Physical Address</label>
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="e.g. Student Center Stalls, Block C"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Branch Phone</label>
                <input
                  type="tel"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="e.g. +91 99881 22334"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Initialize Branch Desk
            </button>
          </form>
        </Card>
      )}

      {/* List of Registered shops */}
      <div className="grid grid-cols-1 gap-8">
        {shops.map((shop) => {
          const isSelected = currentShop?.id === shop.id;
          return (
            <div 
              key={shop.id} 
              className={`bg-white rounded-3xl border p-6 md:p-8 flex flex-col lg:row justify-between gap-8 relative overflow-hidden transition-all ${
                isSelected 
                  ? 'border-indigo-200 shadow-lg shadow-indigo-600/5' 
                  : 'border-slate-150 shadow-sm'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
              )}

              {/* Shop info block */}
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{shop.name}</h3>
                      {isSelected ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => selectShop(shop.id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-full transition-colors"
                        >
                          Select Counter
                        </button>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-semibold leading-normal mt-0.5">{shop.address}</p>
                  </div>
                </div>

                {/* Grid details block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shop ID */}
                  <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shop ID</p>
                      <p className="font-mono text-slate-700 text-xs font-bold truncate max-w-[180px]">{shop.id}</p>
                    </div>
                    <button
                      onClick={() => handleCopyText(shop.id, 'id')}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy Shop ID"
                    >
                      {copiedId === shop.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Pairing Key */}
                  <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span>Pairing Key</span>
                      </p>
                      <p className="font-mono text-slate-700 text-xs font-bold truncate max-w-[180px]">{shop.pairingKey}</p>
                    </div>
                    <button
                      onClick={() => handleCopyText(shop.pairingKey, 'key')}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy Pairing Key"
                    >
                      {copiedKey === shop.pairingKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Customer Portal URL Link */}
                  <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl md:col-span-2 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Customer Portal URL</span>
                      </p>
                      <p className="text-indigo-600 text-xs font-bold truncate max-w-[320px]">
                        {window.location.origin}/#/s/{shop.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`#/s/${shop.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Open Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${shop.subscriptionStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold text-slate-500 capitalize">
                    Subscription: {shop.subscriptionStatus === 'active' ? `${shop.subscription || 'Starter'} Plan Active` : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* QR Visual Card */}
              <div className="w-full lg:w-64 bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Counter Counter sticker</p>
                
                {/* Visual Representation of QR Code */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm inline-flex flex-col items-center gap-1">
                  <div className="w-32 h-32 text-slate-900">
                    <QrCode className="w-full h-full stroke-[1.5]" />
                  </div>
                  <span className="text-[9px] font-black tracking-tight text-slate-400 font-mono">pf.cloud/s/{shop.slug}</span>
                </div>

                <div className="space-y-2 w-full">
                  <a
                    href={`#/s/${shop.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Test Scan Portal</span>
                  </a>

                  {shops.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete branch "${shop.name}"?`)) {
                          deleteShop(shop.id);
                        }
                      }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs py-2 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Desk</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
