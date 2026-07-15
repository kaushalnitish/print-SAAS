import React, { useState, useEffect } from 'react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { Settings, Save, CheckCircle2, Globe, Building2, User, Phone, ShieldAlert } from 'lucide-react';

export const DashboardSettings: React.FC = () => {
  const { currentShop, updateShopSettings } = useSaaS();

  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentShop) {
      setShopName(currentShop.name);
      setShopSlug(currentShop.slug);
      setAddress(currentShop.address);
      setPhone(currentShop.phone);
      setOwnerName(currentShop.ownerName);
      setEmail(currentShop.email);
    }
  }, [currentShop]);

  if (!currentShop) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !shopSlug) return;

    updateShopSettings(currentShop.id, {
      name: shopName,
      slug: shopSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      address,
      phone,
      ownerName,
      email
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Shop Settings</h1>
        <p className="text-slate-500 font-medium text-xs leading-normal">
          Customize your customer portal slug, counter details, and print queue settings.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Shop settings updated successfully! All active QR codes and URLs are synchronised.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Settings fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Config block */}
          <Card className="p-6 md:p-8 space-y-6" id="settings-general-card">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-slate-400" />
              <span>Counter Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Shop Name</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customer Slug</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/s/</span>
                  <input
                    type="text"
                    required
                    value={shopSlug}
                    onChange={(e) => setShopSlug(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Shop Location Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Owner details block */}
          <Card className="p-6 md:p-8 space-y-6" id="settings-owner-card">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <User className="w-5 h-5 text-slate-400" />
              <span>Owner Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side Settings Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-slate-50 border border-slate-150 space-y-4" id="settings-info-card">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Portal Bindings</span>
            </h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              When you alter your slug (e.g. from <span className="font-bold">"{currentShop.slug}"</span> to <span className="font-bold">"new-name"</span>), the counter portal is immediately updated. The old URL will return a fallback. Ensure you print and display the updated counter QR codes!
            </p>
          </Card>

          <button
            type="submit"
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4.5 h-4.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
