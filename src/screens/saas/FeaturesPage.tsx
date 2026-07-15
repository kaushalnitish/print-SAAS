import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, CheckCircle, Smartphone, Settings, BarChart3, 
  Clock, Sparkles, Building2, QrCode, MessageSquare, Mail, HelpCircle, ArrowRight
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const details = [
    {
      title: 'Multi-Tenant Shop Manager',
      desc: 'Register as an owner and support multiple print counters or separate branch coordinates instantly. Switch between distinct print queues inside a single dashboard interface.',
      bulletpoints: ['Independent settings for separate branches', 'Shared owner logs', 'Multi-user tenant logins (coming soon)']
    },
    {
      title: 'Automatic Page Estimation',
      desc: 'No more guessing print file properties. Our Customer Portal performs cloud-level inspection of files to extract accurate paper requirements, page counters, color profiles, and size specs.',
      bulletpoints: ['Failsafe docx and pdf estimators', 'Limits files larger than 100MB', 'Custom setting restrictions']
    },
    {
      title: 'Counter QR Generation',
      desc: 'Download your pre-configured, high-resolution QR codes dynamically. Tape them on glass partitions or wood countertops. When clients scan, they land instantly in your branded app.',
      bulletpoints: ['Includes pairing key placeholders', 'Universal mobile phone compatibility', 'Static counter stickers']
    },
    {
      title: 'The Print Agent Core',
      desc: 'Our lightweight agent pairs in one click. No need for complex network wiring or dedicated static IPs. The agent sits inside your terminal OS and automatically controls the paper tray.',
      bulletpoints: ['Windows & macOS compatible', 'Secure pairing keys protect your queue', 'Offline print recovery safeguards']
    }
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
          <Link to="/features" className="text-indigo-600 hover:text-indigo-700 transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
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

      {/* Main Feature Content */}
      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Our Core Capabilities</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Eliminate WhatsApp downloading and manual file sorting. PrintFlow is designed to make local walk-in printing run like a self-service machine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
          {details.map((feat, index) => (
            <div key={index} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm">
                  0{index + 1}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{feat.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{feat.desc}</p>
              </div>

              <div className="border-t border-slate-100 mt-6 pt-6 space-y-2.5">
                {feat.bulletpoints.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Promo banner */}
        <div className="bg-indigo-650 text-white p-10 md:p-14 rounded-[36px] flex flex-col md:row justify-between items-center gap-8 relative overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900">
          <div className="space-y-3 max-w-lg">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">Ready to automate your print counter?</h3>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed">
              No long term contracts. Start your 14-day free trial today. It takes less than 60 seconds to launch.
            </p>
          </div>
          <Link 
            to="/register"
            className="bg-white text-slate-900 hover:bg-indigo-50 font-black px-8 py-4.5 rounded-2xl shadow-lg shadow-black/10 inline-flex items-center gap-2"
          >
            <span>Create My Shop Now</span>
            <ArrowRight className="w-5 h-5 text-slate-900" />
          </Link>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-900 text-slate-500 text-center py-12 px-6 border-t border-slate-800 text-xs font-semibold">
        <p>© 2026 PrintFlow Cloud Technologies. Built for local shops worldwide.</p>
      </footer>
    </div>
  );
};
