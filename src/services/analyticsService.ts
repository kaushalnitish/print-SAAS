// =====================================================================
// PRINTFLOW CLOUD SAAS - BUSINESS INTELLIGENCE & ANALYTICS SERVICE
// =====================================================================

export type TimeRangeFilter = 
  | 'today' 
  | 'yesterday' 
  | '7days' 
  | '30days' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisYear' 
  | 'lifetime' 
  | 'custom';

export interface AnalyticsMetrics {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  rejectedJobs: number;
  pendingJobs: number;
  averageJobsPerDay: number;
  averageJobsPerMonth: number;
  peakPrintingDay: string;
  peakPrintingHour: string;
  estimatedRevenue: number;
  totalPagesPrinted: number;
  timeLabel: string;
  mostActiveCustomer?: {
    name: string;
    phone: string;
    jobsCount: number;
    pagesCount: number;
  };
  lastActivityTime?: string;
  dailyTrend: { date: string; label: string; completed: number; pending: number; cancelled: number; total: number }[];
  monthlyTrend: { month: string; total: number; completed: number; revenue: number }[];
  yearlyTrend: { year: string; total: number; completed: number }[];
  dayOfWeekBreakdown: { day: string; count: number; percentage: number }[];
}

export interface ShopPerformanceMetric {
  shopId: string;
  shopName: string;
  ownerName: string;
  agentStatus: 'Online' | 'Offline';
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  cancelledJobs: number;
  estimatedRevenue: number;
  conversionRatePercent: number;
}

export interface CombinedAnalyticsMetrics {
  totalShops: number;
  activeShopsCount: number;
  combinedJobs: number;
  combinedCompletedJobs: number;
  combinedPendingJobs: number;
  combinedCancelledJobs: number;
  combinedRevenue: number;
  topPerformingShops: ShopPerformanceMetric[];
  dailyTrend: { date: string; label: string; total: number; completed: number; revenue: number }[];
  monthlyTrend: { month: string; total: number; completed: number; revenue: number }[];
  yearlyTrend: { year: string; total: number; completed: number }[];
}

/**
 * Returns Start and End Date bounds for given filter
 */
export function getDateBounds(filter: TimeRangeFilter, customFrom?: string, customTo?: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  let label = 'Lifetime';

  switch (filter) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      label = 'Today';
      break;
    case 'yesterday':
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
      label = 'Yesterday';
      break;
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      label = 'Last 7 Days';
      break;
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      label = 'Last 30 Days';
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      label = 'This Month';
      break;
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      label = 'Last Month';
      break;
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      label = 'This Year';
      break;
    case 'lifetime':
      start = new Date(2025, 0, 1, 0, 0, 0);
      label = 'Lifetime';
      break;
    case 'custom':
      if (customFrom) start = new Date(customFrom);
      if (customTo) {
        end = new Date(customTo);
        end.setHours(23, 59, 59);
      }
      label = customFrom && customTo ? `${customFrom} to ${customTo}` : 'Custom Date Range';
      break;
  }

  return { start, end, label };
}

/**
 * Deterministic helper to generate time-range statistics for any shop
 */
export const analyticsService = {
  /**
   * Compute analytics for a single shop
   */
  getShopAnalytics(shop: any, filter: TimeRangeFilter, customFrom?: string, customTo?: string): AnalyticsMetrics {
    const { start, end, label } = getDateBounds(filter, customFrom, customTo);
    const now = new Date();
    
    // Base multiplier according to filter scale
    let multiplier = 1;
    let daysCount = 1;

    switch (filter) {
      case 'today':
        multiplier = 1;
        daysCount = 1;
        break;
      case 'yesterday':
        multiplier = 0.9;
        daysCount = 1;
        break;
      case '7days':
        multiplier = 6.7;
        daysCount = 7;
        break;
      case '30days':
        multiplier = 28.4;
        daysCount = 30;
        break;
      case 'thisMonth':
        multiplier = 25.2;
        daysCount = 27;
        break;
      case 'lastMonth':
        multiplier = 31.0;
        daysCount = 30;
        break;
      case 'thisYear':
        multiplier = 280.0;
        daysCount = 210;
        break;
      case 'lifetime':
        multiplier = 380.0;
        daysCount = 365;
        break;
      case 'custom':
        const diffMs = Math.abs(end.getTime() - start.getTime());
        daysCount = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        multiplier = daysCount * 0.95;
        break;
    }

    // Seed modifier per shop ID
    const seed = (shop?.id || shop?.shopId || 'PF-SH-8001').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const shopBaseDaily = 12 + (seed % 15); // e.g. 12..26 jobs/day

    const totalJobs = Math.round(shopBaseDaily * multiplier);
    const completedJobs = Math.round(totalJobs * 0.88);
    const pendingJobs = Math.round(totalJobs * 0.05);
    const cancelledJobs = Math.round(totalJobs * 0.04);
    const rejectedJobs = Math.round(totalJobs * 0.03);

    const averageJobsPerDay = Math.round((totalJobs / daysCount) * 10) / 10;
    const averageJobsPerMonth = Math.round(averageJobsPerDay * 30);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const peakPrintingDay = daysOfWeek[seed % 7];
    
    const peakHours = ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '2:00 PM - 3:00 PM', '4:00 PM - 5:00 PM'];
    const peakPrintingHour = peakHours[seed % peakHours.length];

    const estPagesPerJob = 4.2;
    const totalPagesPrinted = Math.round(completedJobs * estPagesPerJob);
    const estimatedRevenue = Math.round(totalPagesPrinted * 0.25 * 100) / 100;

    // Generate daily trend slice (last 7 data points)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayTotal = Math.max(4, Math.round(shopBaseDaily * (0.8 + Math.sin(i + seed) * 0.3)));
      const dayComp = Math.round(dayTotal * 0.89);
      const dayPend = Math.round(dayTotal * 0.06);
      const dayCanc = dayTotal - dayComp - dayPend;

      dailyTrend.push({
        date: d.toISOString().split('T')[0],
        label: dayLabel,
        total: dayTotal,
        completed: dayComp,
        pending: dayPend,
        cancelled: Math.max(0, dayCanc),
      });
    }

    // Monthly Trend (6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentM = now.getMonth();
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentM - i + 12) % 12;
      const mName = monthNames[mIdx];
      const mTotal = Math.round(shopBaseDaily * 30 * (0.85 + ((i + seed) % 5) * 0.08));
      const mComp = Math.round(mTotal * 0.88);
      monthlyTrend.push({
        month: mName,
        total: mTotal,
        completed: mComp,
        revenue: Math.round(mComp * 4.2 * 0.25),
      });
    }

    // Yearly Trend
    const yearlyTrend = [
      { year: '2024', total: Math.round(shopBaseDaily * 280), completed: Math.round(shopBaseDaily * 280 * 0.87) },
      { year: '2025', total: Math.round(shopBaseDaily * 340), completed: Math.round(shopBaseDaily * 340 * 0.88) },
      { year: '2026', total: Math.round(shopBaseDaily * 390), completed: Math.round(shopBaseDaily * 390 * 0.90) },
    ];

    // Day of week breakdown
    const dayOfWeekBreakdown = daysOfWeek.map((day, idx) => {
      const weight = [18, 16, 17, 19, 15, 8, 7][idx];
      return {
        day,
        count: Math.round((totalJobs * weight) / 100),
        percentage: weight,
      };
    });

    const customersList = [
      { name: 'Marcus Vance', phone: '+1 (555) 019-2834', jobsCount: Math.round(totalJobs * 0.08), pagesCount: Math.round(totalPagesPrinted * 0.09) },
      { name: 'Sarah Jenkins', phone: '+1 (555) 482-9910', jobsCount: Math.round(totalJobs * 0.06), pagesCount: Math.round(totalPagesPrinted * 0.07) },
      { name: 'David K. Miller', phone: '+1 (555) 302-8819', jobsCount: Math.round(totalJobs * 0.05), pagesCount: Math.round(totalPagesPrinted * 0.05) },
    ];

    return {
      totalJobs,
      completedJobs,
      cancelledJobs,
      rejectedJobs,
      pendingJobs,
      averageJobsPerDay,
      averageJobsPerMonth,
      peakPrintingDay,
      peakPrintingHour,
      estimatedRevenue,
      totalPagesPrinted,
      timeLabel: label,
      mostActiveCustomer: customersList[seed % customersList.length],
      lastActivityTime: '2 minutes ago',
      dailyTrend,
      monthlyTrend,
      yearlyTrend,
      dayOfWeekBreakdown,
    };
  },

  /**
   * Compute Combined Analytics across ALL shops
   */
  getCombinedAnalytics(shops: any[], filter: TimeRangeFilter, customFrom?: string, customTo?: string): CombinedAnalyticsMetrics {
    const { label } = getDateBounds(filter, customFrom, customTo);

    const totalShops = shops.length || 1;
    const activeShopsCount = shops.filter((s) => s.agentStatus === 'connected' || s.agentStatus === 'Online' || s.status === 'active').length || totalShops;

    const shopMetricsList: ShopPerformanceMetric[] = shops.map((s, idx) => {
      const stats = analyticsService.getShopAnalytics(s, filter, customFrom, customTo);
      return {
        shopId: s.shopId || s.id || `PF-SH-800${idx + 1}`,
        shopName: s.shopName || s.name || `PrintFlow Station ${idx + 1}`,
        ownerName: s.ownerName || 'Merchant Partner',
        agentStatus: s.agentStatus === 'connected' || s.agentStatus === 'Online' ? 'Online' : 'Offline',
        totalJobs: stats.totalJobs,
        completedJobs: stats.completedJobs,
        pendingJobs: stats.pendingJobs,
        cancelledJobs: stats.cancelledJobs,
        estimatedRevenue: stats.estimatedRevenue,
        conversionRatePercent: Math.round((stats.completedJobs / Math.max(1, stats.totalJobs)) * 100),
      };
    });

    const combinedJobs = shopMetricsList.reduce((acc, curr) => acc + curr.totalJobs, 0);
    const combinedCompletedJobs = shopMetricsList.reduce((acc, curr) => acc + curr.completedJobs, 0);
    const combinedPendingJobs = shopMetricsList.reduce((acc, curr) => acc + curr.pendingJobs, 0);
    const combinedCancelledJobs = shopMetricsList.reduce((acc, curr) => acc + curr.cancelledJobs, 0);
    const combinedRevenue = shopMetricsList.reduce((acc, curr) => acc + curr.estimatedRevenue, 0);

    // Top performing shops sorted by completed jobs
    const topPerformingShops = [...shopMetricsList].sort((a, b) => b.completedJobs - a.completedJobs);

    // Combined daily trend (sum of first shop + aggregated scalar)
    const baseFirstShop = analyticsService.getShopAnalytics(shops[0] || {}, filter, customFrom, customTo);
    const shopScale = totalShops * 0.95;

    const dailyTrend = baseFirstShop.dailyTrend.map((d) => ({
      date: d.date,
      label: d.label,
      total: Math.round(d.total * shopScale),
      completed: Math.round(d.completed * shopScale),
      revenue: Math.round(d.completed * shopScale * 4.2 * 0.25),
    }));

    const monthlyTrend = baseFirstShop.monthlyTrend.map((m) => ({
      month: m.month,
      total: Math.round(m.total * shopScale),
      completed: Math.round(m.completed * shopScale),
      revenue: Math.round(m.revenue * shopScale),
    }));

    const yearlyTrend = baseFirstShop.yearlyTrend.map((y) => ({
      year: y.year,
      total: Math.round(y.total * shopScale),
      completed: Math.round(y.completed * shopScale),
    }));

    return {
      totalShops,
      activeShopsCount,
      combinedJobs,
      combinedCompletedJobs,
      combinedPendingJobs,
      combinedCancelledJobs,
      combinedRevenue,
      topPerformingShops,
      dailyTrend,
      monthlyTrend,
      yearlyTrend,
    };
  }
};
