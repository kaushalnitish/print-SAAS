import React from 'react';
import { Card } from '../../components/Card';
import { CreditCard, CheckCircle2, Shield, AlertCircle, Building2, Calendar } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

const PLAN_DETAILS = {
  Starter: {
    name: 'Starter Plan',
    price: '$29',
    limit: '1 Counter Desk',
    priceDesc: '/ mo'
  },
  Professional: {
    name: 'Professional Plan',
    price: '$79',
    limit: '5 Counter Desks',
    priceDesc: '/ mo'
  },
  Enterprise: {
    name: 'Enterprise Plan',
    price: 'Custom',
    limit: 'Unlimited',
    priceDesc: ' Pricing'
  }
};

export const DashboardSubscription: React.FC = () => {
  const { currentShop } = useSaaS();

  if (!currentShop) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-lg">No Active Shop found</h3>
        <p className="text-slate-400 text-xs font-semibold">Please create a shop first to view subscription info.</p>
      </div>
    );
  }

  const activePlanKey = (currentShop.subscription || 'Starter') as keyof typeof PLAN_DETAILS;
  const activePlan = PLAN_DETAILS[activePlanKey] || PLAN_DETAILS.Starter;

  // Calculate standard 30-day trial renewal date based on actual shop registration timestamp
  const renewDate = currentShop.createdDate 
    ? new Date(new Date(currentShop.createdDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString([], { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }) 
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString([], { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-slate-500 font-medium text-xs leading-normal">
          Manage your subscription plans, invoice history, and shop counter limits.
        </p>
      </div>

      {/* Active Subscription State Block */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none flex flex-col md:row justify-between items-start md:items-center gap-6 relative overflow-hidden" id="billing-status-card">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-25 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{currentShop.subscriptionStatus === 'active' ? 'Subscription Active' : 'Trial Period'}</span>
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-xl text-white">{activePlan.name} - Active</h3>
            <p className="text-slate-400 text-xs font-semibold">Your active counter plan is fully operational. Secure automatic print agent pairing is online.</p>
          </div>

          <div className="flex gap-4 border-t border-slate-800/80 pt-4 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Renew Date: {renewDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Counter Limit: {activePlan.limit}</span>
            </span>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0 relative z-10 space-y-2">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Plan Price</p>
          <p className="text-3xl font-black text-white tracking-tight">{activePlan.price}<span className="text-sm font-semibold text-slate-400">{activePlan.priceDesc}</span></p>
          <p className="text-[10px] font-bold text-slate-500">Billed monthly with zero-overage guarantee</p>
        </div>
      </Card>

      {/* Pricing comparison table / grids */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg">Compare Pricing Tiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4 opacity-75">
            <div className="space-y-1">
              <h4 className="font-black text-slate-800 text-base">Professional Counter</h4>
              <p className="text-slate-400 text-xs font-semibold">Multiple counter desks with branch-isolated sub-queues.</p>
            </div>
            <p className="font-mono font-black text-slate-400 text-lg">$79 / mo — Coming Soon</p>
            <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500 font-semibold">
              <p>• Up to 5 Branch Shop Desks</p>
              <p>• Advanced Customer Analytics charts</p>
              <p>• Priority print-spooler throughput</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-4 opacity-75">
            <div className="space-y-1">
              <h4 className="font-black text-slate-800 text-base">Enterprise Fleet</h4>
              <p className="text-slate-400 text-xs font-semibold">High-availability custom cluster configurations.</p>
            </div>
            <p className="font-mono font-black text-slate-400 text-lg">Custom Quoting — Coming Soon</p>
            <div className="border-t border-slate-100 pt-4 text-xs space-y-2 text-slate-500 font-semibold">
              <p>• Unlimited Sub-Branch Nodes</p>
              <p>• Custom Domain White-labeling</p>
              <p>• Direct third-party print integrations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
