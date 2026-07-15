import React from 'react';
import { 
  Printer, Clock, CheckCircle2, AlertCircle, FileText, 
  Layers, Palette, Users, TrendingUp, RefreshCw, Smartphone
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingStatus } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { currentShop, updateJobStatus, isSupabaseConfigured } = useSaaS();

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
  
  const totalPages = jobs.reduce((sum, j) => sum + (j.file?.pages || 0) * (j.settings?.copies || 1), 0);

  const handleStatusChange = (jobId: string, nextStatus: TrackingStatus) => {
    updateJobStatus(currentShop.id, jobId, nextStatus);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 relative z-10 max-w-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Cloud Connected
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {currentShop.name}
          </h1>
          <p className="text-slate-350 text-xs font-medium leading-relaxed">
            Welcome to your unified console! You are running the <span className="text-indigo-300 font-bold">{currentShop.subscription || 'Starter'} Plan</span>. Customers scan your QR, upload, and appear on this board immediately.
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <a
            href={`#/s/${currentShop.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4.5 py-3 rounded-xl border border-slate-700 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span>Launch Portal</span>
          </a>
        </div>
      </div>

      {/* Grid of Quick statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4 border border-slate-100" id="stat-card-queue">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waiting Jobs</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{waitingJobs.length} jobs</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-slate-100" id="stat-card-printing">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Printer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Printing Jobs</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{printingJobs.length} jobs</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-slate-100" id="stat-card-completed">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed Today</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{completedToday.length} today</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border border-slate-100" id="stat-card-agent">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl relative">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Link</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">Connected</p>
          </div>
        </Card>
      </div>

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
                Share your Customer Portal URL or display the QR code at your counter to receive dynamic print jobs directly.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className={`bg-white border p-5 rounded-2xl transition-all flex flex-col md:row justify-between items-start md:items-center gap-4 ${
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
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                      >
                        Accept
                      </button>
                    )}

                    {job.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'printing')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                      >
                        Start Printing
                      </button>
                    )}

                    {job.status === 'printing' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                      >
                        Complete
                      </button>
                    )}

                    {job.status !== 'completed' && job.status !== 'ready' && job.status !== 'picked_up' && job.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'cancelled')}
                        className="border border-red-100 hover:bg-red-50 text-red-600 font-extrabold text-xs px-3 py-2 rounded-xl transition-all"
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
