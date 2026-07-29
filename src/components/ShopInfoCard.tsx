import React, { useState } from 'react';
import { 
  Building2, Key, Calendar, ShieldCheck, Cpu, 
  Printer, Check, Copy, Sparkles, Hash
} from 'lucide-react';
import { Shop } from '../context/SaaSContext';

interface ShopInfoCardProps {
  shop: Shop;
}

export const ShopInfoCard: React.FC<ShopInfoCardProps> = ({ shop }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const shopName = shop.name || shop.shopName || 'Main Counter Shop';
  const shopId = shop.id || shop.shopId || 'PF-00001';
  const shopKey = `sk_${(shop.id || shop.shopId || 'pf001').slice(0, 8)}`;
  const pairingKey = shop.pairingKey || 'PK-9821-4402';
  const createdDate = shop.createdDate || 'March 14, 2026';
  const defaultPrinter = 'HP LaserJet Pro 4004dn';

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Shop Information</h2>
            <span className="text-[10px] uppercase font-extrabold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {shop.subscription || 'Pro Shop'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Important details, credentials, and pairing status for your print shop.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Shop Name */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Shop Name</span>
          </p>
          <p className="font-bold text-slate-900 text-sm truncate">{shopName}</p>
        </div>

        {/* Shop ID */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1 relative">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>Shop ID</span>
            </p>
            <button
              onClick={() => handleCopy(shopId, 'id')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'id' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono font-bold text-slate-800 text-xs truncate">{shopId}</p>
        </div>

        {/* Shop Key */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Shop Key</span>
            </p>
            <button
              onClick={() => handleCopy(shopKey, 'key')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'key' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'key' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono font-bold text-slate-800 text-xs truncate">
            {shopKey}
          </p>
        </div>

        {/* Pairing Key */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pairing Key</span>
            </p>
            <button
              onClick={() => handleCopy(pairingKey, 'pairing')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'pairing' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'pairing' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono font-black text-indigo-600 text-sm tracking-wider truncate">
            {pairingKey}
          </p>
        </div>

        {/* Subscription Plan & Status */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Subscription Plan & Status</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{shop.subscription || 'Pro Shop'}</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Active
            </span>
          </div>
        </div>

        {/* Desktop Agent Status */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Desktop Agent Status</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 text-xs">Connected & Listening</span>
          </div>
        </div>

        {/* Connected Printer */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Connected Printer</span>
          </p>
          <p className="font-bold text-slate-900 text-xs truncate">{defaultPrinter}</p>
        </div>

        {/* Registration Date */}
        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-1">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Registration Date</span>
          </p>
          <p className="font-bold text-slate-900 text-xs">{createdDate}</p>
        </div>
      </div>
    </div>
  );
};
