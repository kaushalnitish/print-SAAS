import React from 'react';
import { 
  Printer, Clock, CheckCircle2, AlertCircle, FileText, 
  Layers, Palette, TrendingUp, RefreshCw, Smartphone, Cpu, Activity, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingStatus } from '../../types';
import { OwnerAnalyticsCard } from '../../components/analytics/OwnerAnalyticsCard';
import { CustomerPortalCard } from '../../components/CustomerPortalCard';
import { ShopInfoCard } from '../../components/ShopInfoCard';

export const DashboardOverview: React.FC = () => {
  const { currentShop, updateJobStatus } = useSaaS();

  if (!currentShop) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-lg">No Active Shop found</h3>
        <p className="text-slate-400 text-xs font-semibold">Please create a shop in the shops manager first.</p>
      </div>
    );
  }

  // Calculate statistics based on real print jobs
  const jobs = currentShop.jobs || [];
  const waitingJobs = jobs.filter(j => j.status === 'waiting' || j.status === 'accepted' || j.status === 'submitted');
  const printingJobs = jobs.filter(j => j.status === 'printing');
  const completedToday = jobs.filter(j => j.status === 'completed' || j.status === 'ready' || j.status === 'picked_up');
  const todayTotalJobs = jobs.length;
  
  const totalPages = jobs.reduce((sum, j) => sum + (j.file?.pages || 0) * (j.settings?.copies || 1), 0);
  const lastJob = jobs.length > 0 ? jobs[0] : null;
  const lastActivity = lastJob ? (lastJob.timestamp || 'Recently') : 'No activity yet today';

  const defaultPrinter = 'HP LaserJet Pro 4004dn';

  const handleStatusChange = (jobId: string, nextStatus: TrackingStatus) => {
    updateJobStatus(currentShop.id || currentShop.shopId, jobId, nextStatus);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Operational Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-slate-950/10">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live Print Hub Operational
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
              {currentShop.subscription || 'Pro Shop Plan'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {currentShop.name}
          </h1>
          <p className="text-slate-350 text-xs font-medium leading-relaxed">
            Your automated counter queue is active. Customers scan your shop's QR code to send documents directly to your local printer.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl relative z-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Desktop Agent</p>
            <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span>Connected & Listening</span>
            </p>
          </div>
        </div>
      </div>

      {/* Operational Business Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Waiting Jobs */}
        <Card className="p-5 flex items-center gap-4 border border-slate-200/80 bg-white" id="stat-card-queue">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Waiting Jobs</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{waitingJobs.length} <span className="text-xs font-bold text-slate-400">jobs</span></p>
            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">Awaiting dispatch</p>
          </div>
        </Card>

        {/* Printing Jobs */}
        <Card className="p-5 flex items-center gap-4 border border-slate-200/80 bg-white" id="stat-card-printing">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
            <Printer className="w-6 h-6 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Printing Jobs</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{printingJobs.length} <span className="text-xs font-bold text-slate-400">active</span></p>
            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">Feeding paper tray</p>
          </div>
        </Card>

        {/* Completed Jobs Today */}
        <Card className="p-5 flex items-center gap-4 border border-slate-200/80 bg-white" id="stat-card-completed">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Completed Today</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{completedToday.length} <span className="text-xs font-bold text-slate-400">jobs</span></p>
            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{totalPages} total pages</p>
          </div>
        </Card>

        {/* Today's Total Jobs */}
        <Card className="p-5 flex items-center gap-4 border border-slate-200/80 bg-white" id="stat-card-today-total">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Today's Total</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{todayTotalJobs} <span className="text-xs font-bold text-slate-400">submissions</span></p>
            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">Overall daily volume</p>
          </div>
        </Card>
      </div>

      {/* Operational Hardware & Activity Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Agent Status */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Desktop Agent Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-extrabold text-slate-900 text-xs">Connected & Active</p>
            </div>
          </div>
        </div>

        {/* Printer Status */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Connected Printer</p>
            <p className="font-extrabold text-slate-900 text-xs truncate mt-0.5">{defaultPrinter}</p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Last Activity</p>
            <p className="font-extrabold text-slate-900 text-xs truncate mt-0.5">{lastActivity}</p>
          </div>
        </div>
      </div>

      {/* Live Operational Workflow Pipeline */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Live Automatic Print Workflow</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">How your customer walk-ins transition from QR scan to hard copy sheet.</p>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800/60 self-start sm:self-auto">
            Zero-Touch Automation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">1</div>
            <p className="font-extrabold text-white text-xs">Customer Scans QR</p>
            <p className="text-[11px] text-slate-400 leading-normal">Walk-in customer scans counter QR code on their phone browser.</p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">2</div>
            <p className="font-extrabold text-white text-xs">Uploads Document</p>
            <p className="text-[11px] text-slate-400 leading-normal">Selects copies, color/BW, page range, and submits file to cloud queue.</p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">3</div>
            <p className="font-extrabold text-white text-xs">Desktop Agent Syncs</p>
            <p className="text-[11px] text-slate-400 leading-normal">Your PC agent receives job event instantly via encrypted WebSocket.</p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center">4</div>
            <p className="font-extrabold text-white text-xs">Automatic Printing</p>
            <p className="text-[11px] text-slate-400 leading-normal">Document prints immediately on default counter tray.</p>
          </div>
        </div>
      </div>

      {/* Dedicated Customer Portal QR Section */}
      <CustomerPortalCard shop={currentShop} />

      {/* Dedicated Shop Information Section */}
      <ShopInfoCard shop={currentShop} />

      {/* Analytics Breakdown */}
      <OwnerAnalyticsCard currentShop={currentShop} />

      {/* Main Queue Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-950 text-lg tracking-tight">Active Print Queue</h3>
            <p className="text-slate-400 text-xs font-semibold">Live stream of uploaded documents waiting to feed counter default tray.</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 font-bold px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Auto Refreshing</span>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <Printer className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-700">The print queue is currently empty</p>
              <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto leading-normal">
                Display the Customer Portal QR code at your shop counter to receive walk-in print jobs directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`bg-white border p-5 rounded-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  job.status === 'printing' 
                    ? 'border-indigo-200 bg-indigo-50/10 shadow-sm shadow-indigo-500/5' 
                    : 'border-slate-150'
                }`}
              >
                <div className="flex items-start gap-4 overflow-hidden w-full md:w-auto">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 shrink-0">
                    <FileText className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm truncate max-w-[200px]">{job.file?.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Token: {job.token}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        <span className="capitalize">{job.settings?.colorMode}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{job.settings?.copies} {job.settings?.copies === 1 ? 'copy' : 'copies'}</span>
                      </span>
                      <span>•</span>
                      <span>{job.file?.pages} {job.file?.pages === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span className="text-slate-400">{job.timestamp || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between w-full md:w-auto border-t md:border-none pt-4.5 md:pt-0">
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queue Status</p>
                    <StatusBadge status={job.status} />
                  </div>

                  {/* Actions based on status */}
                  <div className="flex items-center gap-2">
                    {(job.status === 'waiting' || job.status === 'submitted') && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'accepted')}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                    )}

                    {job.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'printing')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Start Printing
                      </button>
                    )}

                    {job.status === 'printing' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Complete
                      </button>
                    )}

                    {job.status !== 'completed' && job.status !== 'ready' && job.status !== 'picked_up' && job.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'cancelled')}
                        className="border border-red-100 hover:bg-red-50 text-red-600 font-extrabold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
                        title="Cancel/Decline order"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
