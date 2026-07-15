import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Printer, ArrowRight, Play, CheckCircle, Smartphone, 
  Settings, BarChart3, Clock, Share2, Shield, MessageSquare, 
  Mail, HelpCircle, ChevronDown, Sparkles, Building2, QrCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSaaS } from '../../context/SaaSContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useSaaS();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleStartTrial = (e: React.MouseEvent) => {
    e.preventDefault();
    // Bypass authentication by logging into the Demo Shop
    login('demo@printflow.cloud', 'demo');
    navigate('/dashboard');
  };

  const steps = [
    { title: 'Register Account', desc: 'Shop owner registers business name and sets up contact details in seconds.' },
    { title: 'Shop Created', desc: 'An instant, customized Customer Portal is provisioned specifically for your shop.' },
    { title: 'QR Generated', desc: 'Download your high-contrast QR code to display proudly on your shop counter.' },
    { title: 'Install Print Agent', desc: 'Pair your local desktop or terminal printer with our lightweight agent in one click.' },
    { title: 'Customer Scans QR', desc: 'Walking into your shop, the customer scans the counter QR code with their mobile phone.' },
    { title: 'Customer Uploads File', desc: 'Customer selects PDF or Docx, specifies copies, color settings, and uploads instantly.' },
    { title: 'Owner Receives Job', desc: 'The job instantly slides into your Owner Dashboard with complete receipt token info.' },
    { title: 'Prints Automatically', desc: 'Connected printer fires automatically, printing paper sheets with zero manual hassle.' },
  ];

  const features = [
    { icon: <Building2 className="w-6 h-6 text-indigo-500" />, title: 'Multi-Tenant System', desc: 'Instantly create and isolate unique printing portals for multiple sub-shops or branch outlets.' },
    { icon: <QrCode className="w-6 h-6 text-emerald-500" />, title: 'Unique QR Code', desc: 'Print counter stickers. Customers scan to land directly in your private shop portal.' },
    { icon: <Settings className="w-6 h-6 text-blue-500" />, title: 'Owner Dashboard', desc: 'Real-time job streams, analytics graphs, active counters, and printer settings.' },
    { icon: <Smartphone className="w-6 h-6 text-amber-500" />, title: 'Customer Portal', desc: 'Responsive, zero-install instant file upload with accurate page estimations.' },
    { icon: <Clock className="w-6 h-6 text-purple-500" />, title: 'Live Queue Tracking', desc: 'Customers track their position, estimated wait, and active status in real-time.' },
    { icon: <BarChart3 className="w-6 h-6 text-pink-500" />, title: 'Print Analytics', desc: 'Track sales performance, page counts, color choices, and popular peak hours.' },
    { icon: <Printer className="w-6 h-6 text-rose-500" />, title: 'Automatic Job Queue', desc: 'Queue orders logically. Print automatically as printers complete prior documents.' },
    { icon: <Sparkles className="w-6 h-6 text-violet-500" />, title: 'Lightweight Agent', desc: 'No complex drivers. Pair print terminals directly using an automated secure agent key.' },
    { icon: <MessageSquare className="w-6 h-6 text-cyan-500" />, title: 'No WhatsApp Clutter', desc: 'Keep your personal WhatsApp numbers clean. No messy customer chat downloads.' },
    { icon: <Mail className="w-6 h-6 text-teal-500" />, title: 'No Email Overhead', desc: 'Say goodbye to "Please check email, I sent pdf." Clients print direct from their mobile.' }
  ];

  const faqs = [
    { q: 'How does automatic printing work without drivers?', a: 'PrintFlow uses a lightweight print terminal agent that connects with our cloud. It runs silently in the background, pulls active jobs from your cloud queue, and feeds them directly to your standard local default printer.' },
    { q: 'Do customers need to install an app on their phone?', a: 'No! The customer portal is a standard web application. They simply scan your counter QR, upload files in Safari or Chrome, configure settings, and send.' },
    { q: 'Is my data and customer documents secure?', a: 'Yes. Files are securely processed, printed, and deleted automatically from the temporary cache after completion to ensure privacy and safety.' },
    { q: 'What printers are supported by the Print Agent?', a: 'Any standard inkjet or laser printer (HP, Canon, Epson, Brother) connected to a Windows or macOS computer is fully compatible.' },
    { q: 'Can I customize my customer portal URL?', a: 'Absolutely! You can choose your unique brand slug (e.g. printflow.cloud/s/your-shop-name) and update it anytime in your dashboard.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* SaaS Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
            <Printer className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-900">PrintFlow</span>
            <span className="text-xs font-semibold text-slate-400 block -mt-1 tracking-wider uppercase">Cloud</span>
          </div>
        </div>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600 text-sm">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link to="/features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3.5">
          <Link to="/login" className="font-bold text-slate-600 hover:text-slate-900 text-sm px-4 py-2 transition-colors">
            Login
          </Link>
          <button 
            onClick={handleStartTrial}
            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4.5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
          >
            Start Free Trial
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[-10%] left-[5%] w-[40%] aspect-square rounded-full bg-gradient-to-tr from-indigo-100 to-transparent blur-[80px]" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-indigo-50 to-transparent blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600"
          >
            <Sparkles className="w-4 h-4 fill-indigo-100 text-indigo-600 animate-pulse" />
            <span>Introducing Sprint 2 Tenant Upgrades</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]"
          >
            Stop Taking Print Orders <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600">
              on WhatsApp.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Customers scan a QR code, upload files, choose print settings and your printer is ready for automatic printing. Zero app install, zero chat friction.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={handleStartTrial}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.01] group gap-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base px-8 py-4 rounded-2xl border border-slate-200 transition-all gap-2"
            >
              <Play className="w-4 h-4 fill-slate-800" />
              <span>Watch Demo Video</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 md:py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-600">The Workflow</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Frictionless from click to sheet.</h3>
            <p className="text-slate-500 font-medium text-lg">See how PrintFlow simplifies the printing operations for both owners and walk-in customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-2 right-4 text-8xl font-black text-slate-50 select-none pointer-events-none">
                  {idx + 1}
                </div>
                <div className="relative z-10 space-y-2.5">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-black">
                    0{idx + 1}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{step.title}</h4>
                  <p className="text-slate-400 text-sm font-semibold leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-600">Full Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Purpose-built for local print businesses.</h3>
            <p className="text-slate-500 font-medium text-lg">Every feature you need to run, track, and scale your automated counter. No tech overhead.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-slate-50/55 rounded-3xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0 h-12 w-12 flex items-center justify-center">
                  {feat.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 text-base">{feat.title}</h4>
                  <p className="text-slate-500 font-medium text-xs leading-normal">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 md:py-28 bg-slate-900 text-white rounded-[40px] md:rounded-[56px] mx-0 md:mx-6 my-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30%] aspect-square bg-white rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] aspect-square bg-indigo-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-400">Simple Pricing</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">Unlock automatic counters.</h3>
            <p className="text-slate-400 font-medium text-lg">Start with our launch plan. Expand as your customer volume doubles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-[32px] p-8 border border-slate-700/60 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 right-6 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Active Plan
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-black text-xl text-white">Starter</h4>
                  <p className="text-slate-400 text-sm">Perfect for single counters & local print counters.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹299</span>
                  <span className="text-slate-400 text-sm font-semibold">/ month</span>
                </div>

                <div className="border-t border-slate-700/50 pt-6">
                  <ul className="space-y-3.5 text-sm font-semibold text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>1 Physical Shop</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Unlimited Print File Uploads</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Dynamic Counter QR Code</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Live Print Queue Tracker</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Lightweight Print Terminal Agent</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={handleStartTrial}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-sm py-4 rounded-xl transition-all shadow-md shadow-indigo-500/10"
                >
                  Start 14-Day Trial
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-800/30 rounded-[32px] p-8 border border-slate-700/30 flex flex-col justify-between opacity-85">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-black text-xl text-white">Professional</h4>
                  <p className="text-slate-400 text-sm">Best for university stalls & multi-branch setups.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-300">Coming Soon</span>
                </div>

                <div className="border-t border-slate-700/20 pt-6">
                  <ul className="space-y-3.5 text-sm font-semibold text-slate-400">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Up to 5 Shops / Counter Desks</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Advanced Revenue Analytics</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Custom Domain Portal URL</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Priority Print Queue Routing</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>24/7 Premium Support Desk</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button disabled className="w-full bg-slate-700 text-slate-400 font-extrabold text-sm py-4 rounded-xl cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-800/30 rounded-[32px] p-8 border border-slate-700/30 flex flex-col justify-between opacity-85">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-black text-xl text-white">Enterprise</h4>
                  <p className="text-slate-400 text-sm">For major university print centers & retail chains.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-300">Coming Soon</span>
                </div>

                <div className="border-t border-slate-700/20 pt-6">
                  <ul className="space-y-3.5 text-sm font-semibold text-slate-400">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Unlimited Shop Multi-Tenancy</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Dedicated Server Cluster</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Custom Hardware & Print Node Integration</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Custom SLA Guarantees</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button disabled className="w-full bg-slate-700 text-slate-400 font-extrabold text-sm py-4 rounded-xl cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase tracking-widest font-black text-indigo-600">Questions & Answers</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Got Questions? We got answers.</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`border rounded-[24px] overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-slate-300 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5.5 flex items-center justify-between text-left outline-none font-bold text-slate-900 text-lg"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : ''}`} />
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-[300px] opacity-100 border-t border-slate-200/50' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <p className="px-6 py-5.5 text-slate-500 font-medium text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 px-6 py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">PrintFlow</span>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-normal">
              Stop taking print files via chat. Empower your business counters with automatic printing and real-time cloud tracking.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-white text-sm font-bold uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><button onClick={handleStartTrial} className="text-left hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">Start Trial</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-white text-sm font-bold uppercase tracking-wider">Legal</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SLA Agreement</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-white text-sm font-bold uppercase tracking-wider">Contact</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/contact" className="hover:text-white transition-colors">Support Desk</Link></li>
              <li className="text-slate-500">HQ: Palo Alto, CA</li>
              <li className="text-slate-500">Support: support@printflow.cloud</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800/80 mt-12 pt-8 flex flex-col md:row justify-between items-center text-xs font-semibold text-slate-500">
          <p>© 2026 PrintFlow Cloud Technologies. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with Google AI Studio.</p>
        </div>
      </footer>
    </div>
  );
};
