import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Mail, Phone, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

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
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 transition-colors">Contact</Link>
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

      {/* Main Container */}
      <main className="flex-1 py-16 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Contact info left */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Get in Touch</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">We are here to assist.</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Have a question about print queues, desktop agents, custom domains, or licensing? Shoot us a message or contact support.
            </p>
          </div>

          <div className="space-y-5 border-t border-slate-200/60 pt-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email support</p>
                <p className="font-bold text-slate-800 text-sm">support@printflow.cloud</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helpline hours</p>
                <p className="font-bold text-slate-800 text-sm">+91 (172) 555-8822</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Mon - Fri • 9 AM - 6 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headquarters</p>
                <p className="font-bold text-slate-800 text-sm">Suite 401, Linear Boulevard, Palo Alto, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form right */}
        <div className="md:col-span-7 bg-white p-8 md:p-10 rounded-[32px] border border-slate-100 shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-xl text-slate-900">Message Received!</h3>
                <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto">
                  Thank you for reaching out. One of our regional engineers will follow up at your email address: <span className="text-slate-800 font-bold">{email}</span> within 2 hours.
                </p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Send Us a Direct Message</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@yourbusiness.com"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">Your Message</label>
                <textarea 
                  required 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or print shop specifications..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold text-slate-800 text-sm resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl transition-all inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-900 text-slate-500 text-center py-12 px-6 border-t border-slate-800 text-xs font-semibold">
        <p>© 2026 PrintFlow Cloud Technologies. Support is always a scan away.</p>
      </footer>
    </div>
  );
};
