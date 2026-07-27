import React, { useState } from 'react';
import { TimeRangeFilter, analyticsService } from '../../services/analyticsService';
import { Card } from '../Card';
import { 
  BarChartVisualizer, 
  LineChartVisualizer, 
  StatusDistributionVisualizer 
} from './AnalyticsCharts';
import { 
  Calendar, Clock, Filter, Printer, CheckCircle2, 
  XCircle, AlertCircle, TrendingUp, Sparkles, ChevronDown 
} from 'lucide-react';

interface OwnerAnalyticsCardProps {
  currentShop: any;
}

export const OwnerAnalyticsCard: React.FC<OwnerAnalyticsCardProps> = ({ currentShop }) => {
  const [selectedFilter, setSelectedFilter] = useState<TimeRangeFilter>('30days');
  const [customFrom, setCustomFrom] = useState<string>('2026-07-01');
  const [customTo, setCustomTo] = useState<string>('2026-07-27');
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Recalculate metrics instantly on range change
  const metrics = analyticsService.getShopAnalytics(currentShop, selectedFilter, customFrom, customTo);

  const quickFilterButtons: { id: TimeRangeFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lifetime', label: 'Lifetime' },
  ];

  return (
    <Card className="p-6 md:p-8 border border-slate-200/80 bg-white space-y-6 shadow-sm hover:shadow-md transition-all">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider rounded-md flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Print Jobs Analytics</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• Realtime Operations</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Print Volume & Performance Intelligence
          </h3>
          <p className="text-slate-500 font-medium text-xs mt-0.5">
            Viewing period: <span className="font-extrabold text-indigo-600">{metrics.timeLabel}</span>
          </p>
        </div>

        {/* Custom Date Range Picker Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
              showCustomPicker || selectedFilter === 'custom'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Custom Date Range</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCustomPicker ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Inputs Drawer */}
      {showCustomPicker && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">From Date:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setSelectedFilter('custom');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">To Date:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setSelectedFilter('custom');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            onClick={() => {
              setSelectedFilter('custom');
              setShowCustomPicker(false);
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Quick Filters Pill Rail */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quickFilterButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => {
              setSelectedFilter(btn.id);
              setShowCustomPicker(false);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === btn.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Key Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Jobs</span>
          <p className="text-2xl font-black">{metrics.totalJobs.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-300 font-semibold block">During selected period</span>
        </div>

        <div className="p-4 bg-emerald-50/80 border border-emerald-100/80 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Completed Jobs</span>
          <p className="text-2xl font-black text-emerald-900">{metrics.completedJobs.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 font-extrabold block">
            {Math.round((metrics.completedJobs / Math.max(1, metrics.totalJobs)) * 100)}% Success Rate
          </span>
        </div>

        <div className="p-4 bg-amber-50/80 border border-amber-100/80 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Pending Jobs</span>
          <p className="text-2xl font-black text-amber-900">{metrics.pendingJobs.toLocaleString()}</p>
          <span className="text-[10px] text-amber-700 font-bold block">Currently in spool</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Cancelled Jobs</span>
          <p className="text-2xl font-black text-slate-800">{metrics.cancelledJobs.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-semibold block">User cancelled</span>
        </div>

        <div className="p-4 bg-rose-50/80 border border-rose-100/80 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">Rejected Jobs</span>
          <p className="text-2xl font-black text-rose-900">{metrics.rejectedJobs.toLocaleString()}</p>
          <span className="text-[10px] text-rose-700 font-semibold block">Staff declined</span>
        </div>
      </div>

      {/* Secondary Operational Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 font-medium text-xs">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Jobs / Day</span>
          <span className="text-slate-900 font-black text-base">{metrics.averageJobsPerDay} jobs/day</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Jobs / Month</span>
          <span className="text-slate-900 font-black text-base">{metrics.averageJobsPerMonth.toLocaleString()} jobs/mo</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Peak Printing Day</span>
          <span className="text-indigo-600 font-black text-base">{metrics.peakPrintingDay}</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Peak Printing Hour</span>
          <span className="text-indigo-600 font-black text-base">{metrics.peakPrintingHour}</span>
        </div>
      </div>

      {/* Charts Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <LineChartVisualizer
          title="Daily Printing Volume Trend"
          subtitle="Realtime completed job activity timeline"
          data={metrics.dailyTrend.map((d) => ({ label: d.label, value: d.completed }))}
        />

        <BarChartVisualizer
          title="Day of Week Volume Distribution"
          subtitle={`Peak activity day: ${metrics.peakPrintingDay}`}
          data={metrics.dayOfWeekBreakdown.map((d) => ({ label: d.day.slice(0, 3), value: d.count }))}
          color="indigo"
        />
      </div>

      {/* Status Breakdown Visualizer */}
      <StatusDistributionVisualizer
        completed={metrics.completedJobs}
        pending={metrics.pendingJobs}
        cancelled={metrics.cancelledJobs}
        rejected={metrics.rejectedJobs}
      />
    </Card>
  );
};
