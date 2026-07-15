import React, { useState } from 'react';
import { useSaaS } from '../../context/SaaSContext';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { TrackingStatus } from '../../types';
import { FileText, Printer, Layers, Palette, RefreshCw, Clock, Filter, AlertCircle } from 'lucide-react';

export const DashboardQueue: React.FC = () => {
  const { currentShop, updateJobStatus } = useSaaS();
  const [filter, setFilter] = useState<TrackingStatus | 'all'>('all');

  if (!currentShop) return null;

  const jobs = currentShop.jobs || [];
  
  // Filter jobs based on status
  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const handleStatusChange = (jobId: string, nextStatus: TrackingStatus) => {
    updateJobStatus(currentShop.id, jobId, nextStatus);
  };

  const statusOptions: { value: TrackingStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Jobs' },
    { value: 'submitted', label: 'Pending' },
    { value: 'printing', label: 'Printing' },
    { value: 'ready', label: 'Ready' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Print Queue Logs</h1>
          <p className="text-slate-500 font-medium text-xs leading-normal">
            Track and change print status live as Walk-In customers send their document receipts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="p-3 bg-white border border-slate-150 flex items-center gap-2 flex-wrap" id="queue-filter-card">
        <span className="text-slate-400 p-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </span>
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
              filter === opt.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id={`filter-btn-${opt.value}`}
          >
            {opt.label}
          </button>
        ))}
      </Card>

      {/* Queue Listing */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700">No print jobs found</p>
          <p className="text-slate-400 text-xs font-semibold">
            No items match status: <span className="text-slate-700 font-bold capitalize">{filter === 'all' ? 'Any' : filter}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className={`bg-white border p-5 rounded-2xl transition-all flex flex-col md:row justify-between items-start md:items-center gap-4 ${
                job.status === 'printing' ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-150'
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

              <div className="flex items-center gap-4 shrink-0 justify-between w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                <div className="text-left md:text-right space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queue Status</p>
                  <StatusBadge status={job.status} />
                </div>

                <div className="flex items-center gap-2">
                  {(job.status === 'waiting' || job.status === 'submitted') && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'accepted')}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Accept
                    </button>
                  )}

                  {job.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'printing')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Start Printing
                    </button>
                  )}

                  {job.status === 'printing' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'completed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      Complete
                    </button>
                  )}

                  {job.status !== 'completed' && job.status !== 'ready' && job.status !== 'picked_up' && job.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'cancelled')}
                      className="border border-red-100 hover:bg-red-50 text-red-600 font-extrabold text-xs px-3 py-2 rounded-xl transition-all"
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
  );
};
