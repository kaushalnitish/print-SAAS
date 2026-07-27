import { 
  AdminShopDetails, 
  AdminCustomer, 
  ArchivedDocument, 
  AdminActivityLog, 
  LiveWorkflowJob 
} from '../types/admin';
import { Shop } from '../context/SaaSContext';

export const adminConsoleService = {
  /**
   * Format a SaaS shop model into full super-admin shop details
   */
  mapShopToAdminDetails(shop: Shop): AdminShopDetails {
    const totalJobs = shop.printJobs ? shop.printJobs.length : 0;
    const isOnline = shop.agentStatus === 'connected' || shop.printerStatus === 'online';

    return {
      id: shop.id || shop.shopId || 'shop-uuid-1',
      shopId: shop.shopId || 'PF-SH-8001',
      shopSlug: shop.shopSlug || 'copy-center',
      shopName: shop.shopName || shop.name || 'PrintFlow Station',
      ownerName: shop.ownerName || 'Print Shop Owner',
      email: shop.email || 'owner@printflow.cloud',
      phone: shop.phone || '+1 (555) 234-5678',
      address: shop.address || '101 Main Street, Suite 4B, Metro',
      shopKey: `sk_live_pf${(shop.shopId || '8001').replace(/[^0-9]/g, '')}90234a`,
      pairingKey: shop.pairingKey || '892-104',
      registrationDate: shop.createdDate || '2026-01-15',
      subscriptionPlan: (shop.subscription as any) || 'Enterprise',
      subscriptionStatus: (shop.subscriptionStatus as any) || 'Active',
      expiryDate: '2027-01-15',
      agentStatus: isOnline ? 'Online' : 'Offline',
      agentVersion: 'v1.2.4-stable',
      lastHeartbeat: isOnline ? '30 seconds ago' : '2 hours ago',
      connectedSince: 'July 10, 2026',
      printerName: 'HP LaserJet Pro M428dw (Network)',
      printerStatus: isOnline ? 'Ready' : 'Offline',
      customerPortalUrl: shop.customerPortalUrl || `${window.location.origin}/p/${shop.shopSlug || 'shop'}`,
      qrCodeUrl: shop.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shop.customerPortalUrl || `${window.location.origin}/p/${shop.shopSlug || 'shop'}`)}`,
      totalJobsProcessed: totalJobs + 142,
      totalCustomersCount: Math.max(12, totalJobs * 2 + 5),
      restartRequired: false,
      disabled: false,
    };
  },

  /**
   * Get initial compressed document archives
   */
  getInitialArchives(shops: Shop[]): ArchivedDocument[] {
    const now = Date.now();
    const isoDate = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString().split('T')[0];

    return [
      {
        id: 'arch-1001',
        fileName: 'Q2_Financial_Audit_Report.pdf',
        customerName: 'Marcus Vance',
        customerPhone: '+1 (555) 019-2834',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        uploadDate: isoDate(1),
        completionDate: isoDate(1),
        pages: 14,
        copies: 2,
        colorMode: 'bw',
        paperSize: 'A4',
        originalSizeMb: 12.4,
        compressedSizeMb: 1.8,
        compressionRatioPercent: 85,
        retentionDaysLeft: 89,
        retentionPolicy: '90 Days',
        status: 'Archived',
        fileType: 'PDF',
        token: 'ARCH-9812',
      },
      {
        id: 'arch-1002',
        fileName: 'Architectural_Blueprints_Floor3.pdf',
        customerName: 'Sarah Jenkins',
        customerPhone: '+1 (555) 482-9910',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        uploadDate: isoDate(3),
        completionDate: isoDate(3),
        pages: 8,
        copies: 5,
        colorMode: 'color',
        paperSize: 'A3',
        originalSizeMb: 28.6,
        compressedSizeMb: 3.2,
        compressionRatioPercent: 88,
        retentionDaysLeft: 87,
        retentionPolicy: '90 Days',
        status: 'Archived',
        fileType: 'PDF',
        token: 'ARCH-9813',
      },
      {
        id: 'arch-1003',
        fileName: 'Legal_Contract_Agreement_Signed.pdf',
        customerName: 'David K. Miller',
        customerPhone: '+1 (555) 302-8819',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        uploadDate: isoDate(5),
        completionDate: isoDate(5),
        pages: 6,
        copies: 1,
        colorMode: 'bw',
        paperSize: 'A4',
        originalSizeMb: 5.1,
        compressedSizeMb: 0.7,
        compressionRatioPercent: 86,
        retentionDaysLeft: 25,
        retentionPolicy: '30 Days',
        status: 'Archived',
        fileType: 'PDF',
        token: 'ARCH-9814',
      },
      {
        id: 'arch-1004',
        fileName: 'Marketing_Brochure_HighRes_Final.pdf',
        customerName: 'Elena Rostova',
        customerPhone: '+1 (555) 912-4432',
        shopId: shops[1]?.shopId || 'PF-SH-8002',
        shopName: shops[1]?.shopName || 'Downtown Express Print',
        uploadDate: isoDate(7),
        completionDate: isoDate(7),
        pages: 4,
        copies: 50,
        colorMode: 'color',
        paperSize: 'Letter',
        originalSizeMb: 42.1,
        compressedSizeMb: 4.8,
        compressionRatioPercent: 88,
        retentionDaysLeft: 83,
        retentionPolicy: '90 Days',
        status: 'Archived',
        fileType: 'PDF',
        token: 'ARCH-9815',
      },
    ];
  },

  /**
   * Get initial customer directory records
   */
  getInitialCustomers(shops: Shop[]): AdminCustomer[] {
    return [
      {
        id: 'cust-1',
        name: 'Marcus Vance',
        phone: '+1 (555) 019-2834',
        email: 'marcus.vance@enterprise.com',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        totalJobs: 18,
        pagesPrinted: 142,
        totalSpent: 42.50,
        lastActive: 'Yesterday at 3:14 PM',
      },
      {
        id: 'cust-2',
        name: 'Sarah Jenkins',
        phone: '+1 (555) 482-9910',
        email: 'sjenkins@architects.io',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        totalJobs: 9,
        pagesPrinted: 84,
        totalSpent: 68.00,
        lastActive: '3 days ago',
      },
      {
        id: 'cust-3',
        name: 'David K. Miller',
        phone: '+1 (555) 302-8819',
        email: 'd.miller@lawpartners.org',
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        totalJobs: 24,
        pagesPrinted: 310,
        totalSpent: 93.00,
        lastActive: '5 days ago',
      },
      {
        id: 'cust-4',
        name: 'Elena Rostova',
        phone: '+1 (555) 912-4432',
        email: 'elena@brandstudio.co',
        shopId: shops[1]?.shopId || 'PF-SH-8002',
        shopName: shops[1]?.shopName || 'Downtown Express Print',
        totalJobs: 5,
        pagesPrinted: 200,
        totalSpent: 120.00,
        lastActive: '1 week ago',
      },
    ];
  },

  /**
   * Get initial admin audit activity logs
   */
  getInitialLogs(shops: Shop[]): AdminActivityLog[] {
    const now = Date.now();
    const isoTime = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();

    return [
      {
        id: 'log-1',
        timestamp: isoTime(5),
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        actor: 'Super Admin',
        category: 'security',
        action: 'Generated New Pairing Key',
        details: 'Pairing key re-issued for shop terminal authentication.',
        severity: 'info',
      },
      {
        id: 'log-2',
        timestamp: isoTime(25),
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        actor: 'Desktop Agent Daemon',
        category: 'agent',
        action: 'Agent Handshake Reconnected',
        details: 'Windows 11 agent daemon re-established WebSocket session v1.2.4.',
        severity: 'info',
      },
      {
        id: 'log-3',
        timestamp: isoTime(120),
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        actor: 'System Archive Worker',
        category: 'archive',
        action: 'Document Auto-Compressed & Archived',
        details: 'Q2_Financial_Audit_Report.pdf compressed from 12.4MB to 1.8MB (85% reduction).',
        severity: 'info',
      },
      {
        id: 'log-4',
        timestamp: isoTime(480),
        shopId: shops[0]?.shopId || 'PF-SH-8001',
        shopName: shops[0]?.shopName || 'Metro Print Hub',
        actor: 'SaaS Billing System',
        category: 'billing',
        action: 'Subscription Renewed',
        details: 'Enterprise plan successfully renewed for 12 months.',
        severity: 'info',
      },
    ];
  },

  /**
   * Helper to map shop jobs to live workflow objects
   */
  mapLiveJobs(shop: Shop): LiveWorkflowJob[] {
    const jobs = shop.printJobs || [];
    return jobs.map((j) => {
      let stage: 'Uploaded' | 'Waiting' | 'Downloaded' | 'Printing' | 'Completed' = 'Uploaded';
      if (j.status === 'waiting') stage = 'Waiting';
      if (j.status === 'accepted') stage = 'Downloaded';
      if (j.status === 'printing') stage = 'Printing';
      if (j.status === 'completed' || j.status === 'ready' || j.status === 'picked_up') stage = 'Completed';

      return {
        id: j.id,
        token: j.token,
        customerName: 'Walk-In Customer',
        customerMobile: '+1 (555) 019-2834',
        fileName: j.fileName,
        fileType: j.fileName.split('.').pop()?.toUpperCase() || 'PDF',
        pages: j.pages,
        copies: j.copies,
        colorMode: j.colorMode,
        paperSize: j.paperSize as any,
        sideMode: j.sideMode,
        printStatus: (j.status === 'ready' || j.status === 'picked_up') ? 'completed' : (j.status as any),
        currentStage: stage,
        uploadTime: j.timestamp || 'Just now',
        completionTime: stage === 'Completed' ? '1 min ago' : undefined,
        shopId: shop.shopId,
        shopName: shop.shopName,
      };
    });
  },

  /**
   * Generate a fresh 6-digit shop pairing key
   */
  generatePairingKey(): string {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    return `${p1}-${p2}`;
  },

  /**
   * Generate a fresh shop key (e.g. sk_live_...)
   */
  generateShopKey(): string {
    const randomHex = Math.random().toString(36).substring(2, 12);
    return `sk_live_pf_${randomHex}`;
  }
};
