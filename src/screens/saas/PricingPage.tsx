import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Printer, Check, CheckCircle2, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: 'Is there really no payment required for the trial?', a: 'None! You can register, set up your shop, generate QR codes, and simulate customer portals instantly without specifying a credit card.' },
    { q: 'How do I pay after the trial ends?', a: 'Once the 14-day trial is finished, you will receive a prompt inside your Dashboard to input billing details. We support cards, UPI, and bank transfers.' },
    { q: 'What happens if I need to add more shops?', a: 'Our Starter Plan supports 1 physical shop. For multi-branch operations, you can upgrade to the Professional plan or reach out to our enterprise team.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* SaaS Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Printer className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-900">PrintFlow</span>
            <span className="text-xs font-semibold text-slate-400 block -mt-1 tracking-wider uppercase">Cloud</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600 text-sm">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link to="/features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/pricing" className="text-indigo-600 hover:text-indigo-700 transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-3.5">
          <Link to="/login" className="font-bold text-slate-600 hover:text-slate-900 text-sm px-4 py-2">
            Login
          </Link>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Pricing Header */}
      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Simple, Transparent Plans</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Choose the plan that fits your walk-in print volume. Turn walk-in document printing into an automated flow today.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 max-w-4xl mx-auto items-stretch">
          {/* Starter Card */}
          <div className="bg-white border-2 border-indigo-600 rounded-[32px] p-8 flex flex-col justify-between shadow-lg relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-full">
              Highly Recommended
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-black text-2xl text-slate-900">Starter</h3>
                <p className="text-slate-400 text-sm font-semibold">Perfect for standard counter stalls and print shops.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">₹299</span>
                <span className="text-slate-400 text-sm font-semibold">/ month</span>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">What is included:</p>
                <ul className="space-y-3.5 text-sm font-semibold text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[3]" />
                    <span>1 Registered Print Shop</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[3]" />
                    <span>Unlimited Print File Uploads</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[3]" />
                    <span>Instant Customer QR Codes</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[3]" />
                    <span>Interactive Status Timelines</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[3]" />
                    <span>Print Queue Desktop Agent</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => navigate('/register')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm py-4 rounded-xl transition-all"
              >
                Start 14-Day Free Trial
              </button>
            </div>
          </div>

          {/* Pro Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between shadow-sm opacity-80">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-black text-2xl text-slate-700">Professional</h3>
                <p className="text-slate-400 text-sm font-semibold">Ideal for expanding networks and university setups.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-400">Coming Soon</span>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">What will be included:</p>
                <ul className="space-y-3.5 text-sm font-semibold text-slate-500">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Up to 5 Shops / Branch Desks</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Advanced Revenue Reports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Custom domain binding</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button disabled className="w-full bg-slate-100 text-slate-400 font-extrabold text-sm py-4 rounded-xl cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-between shadow-sm opacity-80">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-black text-2xl text-slate-700">Enterprise</h3>
                <p className="text-slate-400 text-sm font-semibold">Custom SLAs and tailored integrations.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-400">Coming Soon</span>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enterprise-grade specs:</p>
                <ul className="space-y-3.5 text-sm font-semibold text-slate-500">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Unlimited Shop Multi-Tenancy</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Dedicated Cluster Provisioning</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-slate-300 shrink-0 stroke-[2]" />
                    <span>Enterprise SLA Agreement</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button disabled className="w-full bg-slate-100 text-slate-400 font-extrabold text-sm py-4 rounded-xl cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Small Faq slice */}
        <div className="max-w-3xl mx-auto space-y-8 pt-10">
          <h4 className="text-center font-black text-slate-900 text-xl tracking-tight">Pricing FAQ</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-1.5">
                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{faq.q}</span>
                </h5>
                <p className="text-slate-500 font-medium pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-900 text-slate-500 text-center py-12 px-6 border-t border-slate-800 text-xs font-semibold">
        <p>© 2026 PrintFlow Cloud Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};
