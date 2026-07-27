// =====================================================================
// PRINTFLOW ADMIN CONSOLE TYPES
// =====================================================================
// Super-Admin Control Center domain models for managing SaaS shops, customers,
// live printing workflows, compressed document archives, credentials, and billing.

export type AdminSubscriptionStatus = 'Active' | 'Trialing' | 'Past Due' | 'Suspended';
export type AdminAgentStatus = 'Online' | 'Offline';
export type AdminPrinterStatus = 'Ready' | 'Printing' | 'Offline' | 'Paper Jam' | 'Low Toner';

export interface AdminShopDetails {
  id: string; // Database UUID or internal key
  shopId: string; // Public shop ID, e.g. "PF-SH-8021"
  shopSlug: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  shopKey: string; // sk_live_...
  pairingKey: string;
  registrationDate: string;
  subscriptionPlan: 'Starter' | 'Professional' | 'Enterprise' | 'Trial Active';
  subscriptionStatus: AdminSubscriptionStatus;
  expiryDate: string;
  agentStatus: AdminAgentStatus;
  agentVersion: string;
  lastHeartbeat: string;
  connectedSince: string;
  printerName: string;
  printerStatus: AdminPrinterStatus;
  customerPortalUrl: string;
  qrCodeUrl: string;
  totalJobsProcessed: number;
  totalCustomersCount: number;
  restartRequired: boolean;
  disabled: boolean;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  shopId: string;
  shopName: string;
  totalJobs: number;
  pagesPrinted: number;
  totalSpent: number;
  lastActive: string;
}

export interface ArchivedDocument {
  id: string;
  fileName: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  uploadDate: string;
  completionDate: string;
  pages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: string;
  originalSizeMb: number;
  compressedSizeMb: number;
  compressionRatioPercent: number; // e.g. 85 for 85% reduction
  retentionDaysLeft: number;
  retentionPolicy: string; // "30 Days", "90 Days", "Permanent"
  status: 'Archived' | 'Restored';
  fileType: string;
  token: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  shopId: string;
  shopName: string;
  actor: string;
  category: 'security' | 'billing' | 'agent' | 'job' | 'system' | 'archive';
  action: string;
  details: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface LiveWorkflowJob {
  id: string;
  token: string;
  customerName: string;
  customerMobile: string;
  fileName: string;
  fileType: string;
  pages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: 'a4' | 'a3' | 'letter';
  sideMode: 'single' | 'double';
  printStatus: 'submitted' | 'waiting' | 'downloaded' | 'printing' | 'completed' | 'cancelled';
  currentStage: 'Uploaded' | 'Waiting' | 'Downloaded' | 'Printing' | 'Completed';
  uploadTime: string;
  completionTime?: string;
  shopId: string;
  shopName: string;
}
