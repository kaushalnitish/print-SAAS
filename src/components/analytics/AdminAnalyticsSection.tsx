import React, { useState } from 'react';
import { TimeRangeFilter, analyticsService } from '../../services/analyticsService';
import { Card } from '../Card';
import { 
  BarChartVisualizer, 
  LineChartVisualizer, 
  StatusDistributionVisualizer 
} from './AnalyticsCharts';
import { 
  Building2, Calendar, ChevronDown, Filter, Layers, 
  Printer, TrendingUp, User, Activity, DollarSign, Sparkles, CheckCircle2 
} from 'lucide-react';

interface AdminAnalyticsSectionProps {
  shops: any[];
}

export const AdminAnalyticsSection: React.FC<AdminAnalyticsSectionProps> = ({ shops }) => {
  const [mode, setMode] = useState<'combined' | 'single'>('combined');
  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.id || shops[0]?.shopId || '');
  const [timeFilter, setTimeFilter] = useState<TimeRangeFilter>('30days');
  const [customFrom, setCustomFrom] = useState<string>('2026-07-01');
  const [customTo, setCustomTo] = useState<string>('2026-07-27');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  // Active shop object for Single Shop Analytics
  const activeShop = shops.find((s) => s.id === selectedShopId || s.shopId === selectedShopId) || shops[0] || {};

  // Compute stats according to selected mode and time filter
  const combinedStats = analyticsService.getCombinedAnalytics(shops, timeFilter, customFrom, customTo);
  const singleShopStats = analyticsService.getShopAnalytics(activeShop, timeFilter, customFrom, customTo);

  const filterButtons: { id: TimeRangeFilter; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7days', label: '7 Days' },
    { id: '30days', label: '30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'lifetime', label: 'Lifetime' },
  ];

  return (
    <Card className="p-6 md:p-8 border border-slate-200/80 bg-white space-y-6 shadow-sm hover:shadow-md transition-all">
      {/* Analytics Mode & Header Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise Admin Analytics</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">• SaaS Business Intelligence</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Print Network Analytics Console</h2>
          <p className="text-slate-500 font-medium text-xs mt-0.5">
            Operational intelligence for registered merchant locations and total cloud print job throughput.
          </p>
        </div>

        {/* Mode Switcher Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setMode('combined')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'combined'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Combined Analytics
          </button>
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Shop Analytics
          </button>
        </div>
      </div>

      {/* Single Shop Dropdown Selector (Only shown in Single Shop mode) */}
      {mode === 'single' && (
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="w-full sm:w-80">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                Select Shop Location
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm"
              >
                {shops.map((s) => (
                  <option key={s.id || s.shopId} value={s.id || s.shopId}>
                    {s.shopName || s.name} ({s.ownerName || 'Merchant'}) - ID: {s.shopId || s.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-150">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Owner</span>
              <span className="text-slate-900 font-black">{activeShop.ownerName || 'Merchant'}</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Agent Status</span>
              <span className={`font-black ${activeShop.agentStatus === 'Online' || activeShop.agentStatus === 'connected' ? 'text-emerald-600' : 'text-slate-500'}`}>
                ● {activeShop.agentStatus || 'Online'}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Last Activity</span>
              <span className="text-slate-900 font-black">{singleShopStats.lastActivityTime || 'Just now'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <span className="text-xs font-black text-slate-400 mr-1 shrink-0">Filter Period:</span>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                setTimeFilter(btn.id);
                setShowCustomRange(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                timeFilter === btn.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCustomRange(!showCustomRange)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shrink-0 ${
            showCustomRange || timeFilter === 'custom'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
          Custom Range
        </button>
      </div>

      {/* Custom Date Range Drawer */}
      {showCustomRange && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setTimeFilter('custom');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setTimeFilter('custom');
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
            />
          </div>
          <button
            onClick={() => {
              setTimeFilter('custom');
              setShowCustomRange(false);
            }}
            className="px-4 py-1.5 bg-indigo-600 text-white font-black rounded-xl"
          >
            Apply
          </button>
        </div>
      )}

      {/* MODE 1: COMBINED ANALYTICS DISPLAY */}
      {mode === 'combined' && (
        <div className="space-y-6">
          {/* Combined Top KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Shops</span>
              <p className="text-2xl font-black">{combinedStats.totalShops}</p>
              <span className="text-[10px] text-emerald-400 font-extrabold block">
                {combinedStats.activeShopsCount} Active & Online
              </span>
            </div>

            <div className="p-4 bg-indigo-50/80 border border-indigo-100/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">Combined Jobs</span>
              <p className="text-2xl font-black text-indigo-950">{combinedStats.combinedJobs.toLocaleString()}</p>
              <span className="text-[10px] text-indigo-700 font-bold block">Across all locations</span>
            </div>

            <div className="p-4 bg-emerald-50/80 border border-emerald-100/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Combined Completed</span>
              <p className="text-2xl font-black text-emerald-950">{combinedStats.combinedCompletedJobs.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-700 font-black block">
                {Math.round((combinedStats.combinedCompletedJobs / Math.max(1, combinedStats.combinedJobs)) * 100)}% Conversion
              </span>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-100/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Combined Pending</span>
              <p className="text-2xl font-black text-amber-950">{combinedStats.combinedPendingJobs.toLocaleString()}</p>
              <span className="text-[10px] text-amber-700 font-bold block">Active queue spool</span>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-indigo-300 tracking-wider">Combined Revenue (Est.)</span>
              <p className="text-2xl font-black text-white">${combinedStats.combinedRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-400 font-extrabold block">Page volume revenue</span>
            </div>
          </div>

          {/* Combined Trend Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LineChartVisualizer
                title="Daily Combined Printing Trend"
                subtitle="Aggregated completed volume across all locations"
                data={combinedStats.dailyTrend.map((d) => ({ label: d.label, value: d.completed }))}
              />
            </div>

            <BarChartVisualizer
              title="Monthly Printing Trend"
              subtitle="6-month combined output"
              data={combinedStats.monthlyTrend.map((m) => ({ label: m.month, value: m.completed }))}
              color="emerald"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartVisualizer
              title="Yearly Printing Growth Trend"
              subtitle="Annual multi-year volume projection"
              data={combinedStats.yearlyTrend.map((y) => ({ label: y.year, value: y.completed }))}
              color="slate"
            />

            {/* Top Performing Shops Ranking Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Top Performing Shops</h4>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5">Ranked by completed print throughput</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-xl">
                  {combinedStats.topPerformingShops.length} Shops
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {combinedStats.topPerformingShops.map((shop, idx) => (
                  <div key={shop.shopId} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-extrabold text-slate-900">{shop.shopName}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">Owner: {shop.ownerName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 block">{shop.completedJobs.toLocaleString()} jobs</span>
                      <span className="text-[10px] text-emerald-600 font-bold">${shop.estimatedRevenue.toLocaleString()} est.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: SINGLE SHOP ANALYTICS DISPLAY */}
      {mode === 'single' && (
        <div className="space-y-6">
          {/* Single Shop KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Jobs</span>
              <p className="text-2xl font-black">{singleShopStats.totalJobs.toLocaleString()}</p>
              <span className="text-[10px] text-indigo-300 font-semibold block">{singleShopStats.timeLabel}</span>
            </div>

            <div className="p-4 bg-emerald-50/80 border border-emerald-100/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Completed</span>
              <p className="text-2xl font-black text-emerald-950">{singleShopStats.completedJobs.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-700 font-black block">
                {Math.round((singleShopStats.completedJobs / Math.max(1, singleShopStats.totalJobs)) * 100)}% Success
              </span>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-100/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Pending</span>
              <p className="text-2xl font-black text-amber-950">{singleShopStats.pendingJobs.toLocaleString()}</p>
              <span className="text-[10px] text-amber-700 font-bold block">In spool</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Cancelled</span>
              <p className="text-2xl font-black text-slate-800">{singleShopStats.cancelledJobs.toLocaleString()}</p>
              <span className="text-[10px] text-slate-400 font-semibold block">User cancelled</span>
            </div>

            <div className="p-4 bg-rose-50/80 border border-rose-100/80 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">Rejected</span>
              <p className="text-2xl font-black text-rose-950">{singleShopStats.rejectedJobs.toLocaleString()}</p>
              <span className="text-[10px] text-rose-700 font-semibold block">Merchant declined</span>
            </div>
          </div>

          {/* Operational Metrics Sub-Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Jobs / Day</span>
              <span className="text-slate-900 font-black text-base">{singleShopStats.averageJobsPerDay} jobs/day</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Jobs / Month</span>
              <span className="text-slate-900 font-black text-base">{singleShopStats.averageJobsPerMonth.toLocaleString()} jobs/mo</span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Most Active Customer</span>
              <span className="text-indigo-600 font-black text-sm block truncate">
                {singleShopStats.mostActiveCustomer?.name || 'Marcus Vance'}
              </span>
              <span className="text-[10px] text-slate-400 block font-normal">
                {singleShopStats.mostActiveCustomer?.jobsCount} jobs ({singleShopStats.mostActiveCustomer?.pagesCount} pgs)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Peak Printing Time</span>
              <span className="text-indigo-600 font-black text-sm block">
                {singleShopStats.peakPrintingDay} • {singleShopStats.peakPrintingHour}
              </span>
            </div>
          </div>

          {/* Single Shop Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartVisualizer
              title={`${activeShop.shopName || 'Shop'} Daily Trend`}
              subtitle="Daily completed volume timeline"
              data={singleShopStats.dailyTrend.map((d) => ({ label: d.label, value: d.completed }))}
            />

            <BarChartVisualizer
              title="Day of Week Activity"
              subtitle={`Peak day: ${singleShopStats.peakPrintingDay}`}
              data={singleShopStats.dayOfWeekBreakdown.map((d) => ({ label: d.day.slice(0, 3), value: d.count }))}
              color="indigo"
            />
          </div>

          <StatusDistributionVisualizer
            completed={singleShopStats.completedJobs}
            pending={singleShopStats.pendingJobs}
            cancelled={singleShopStats.cancelledJobs}
            rejected={singleShopStats.rejectedJobs}
          />
        </div>
      )}
    </Card>
  );
};
