// =====================================================================
// PRINTFLOW DATABASE & DOMAIN TYPES
// =====================================================================
// This file declares the core types for our Supabase backend integration.
// It maps database rows directly into frontend domain models.

export type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise' | 'Trial Active';
export type PrinterStatus = 'online' | 'offline' | 'Not Connected';
export type AgentStatus = 'connected' | 'disconnected' | 'Not Installed';
export type JobStatus = 'submitted' | 'waiting' | 'accepted' | 'printing' | 'completed' | 'ready' | 'picked_up' | 'cancelled';

export interface PrintJob {
  id: string;
  token: string;
  fileName: string;
  fileSize: string;
  pages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: 'a4' | 'a3';
  sideMode: 'single' | 'double';
  status: JobStatus;
  timestamp: string;
  fileUrl?: string;
  
  // For backwards/nested compatibility
  file?: {
    name: string;
    size: number | string;
    pages: number;
  };
  settings?: {
    copies: number;
    colorMode: 'bw' | 'color';
    paperSize: 'a4' | 'a3';
    sideMode: 'single' | 'double';
  };
  createdAt?: string;
}

/**
 * 1. USER PROFILE TYPE
 * Maps to the public.profiles table (linked to auth.users)
 */
export interface DBUser {
  id: string; // Auth UUID
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

/**
 * 2. SUBSCRIPTION DETAILS TYPE
 */
export interface DBSubscription {
  id: string;
  shopId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd: string;
  maxDailyJobs: number;
  currentDailyJobs: number;
}

/**
 * 3. SHOP BRANCH TYPE
 * Maps to the public.shops table
 */
export interface DBShop {
  id: string; // Internal database UUID
  shopId: string; // Front-facing custom string ID, e.g., 'SH-1234'
  shopSlug: string;
  shopName: string;
  ownerId: string; // Foreign key referencing DBUser.id
  phone: string;
  address: string;
  subscription: SubscriptionPlan;
  pairingKey: string;
  printerStatus: PrinterStatus;
  agentStatus: AgentStatus;
  createdAt: string;
}

/**
 * 4. PRINT JOB TYPE
 * Maps to the public.print_jobs table
 */
export interface DBPrintJob {
  id: string; // UUID primary key
  jobId: string; // Front-facing ID, e.g., 'job-demo-1'
  token: string; // Client pick-up code, e.g., 'PF-1001'
  fileName: string;
  fileSize: string;
  pages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: 'a4' | 'a3';
  sideMode: 'single' | 'double';
  status: JobStatus;
  shopId: string; // Foreign key referencing DBShop.id
  createdAt: string;
}

/**
 * 5. PRINT QUEUE TYPE
 * Virtual view or real-time query grouping of job order in a specific shop
 */
export interface DBPrintQueue {
  shopId: string;
  activeJobsCount: number;
  waitingJobsCount: number;
  estimatedWaitMinutes: number;
  queuePosition: number;
}

/**
 * 6. PRINT AGENT TYPE
 * Desktop print client configuration connecting physical printers to the cloud
 */
export interface DBPrintAgent {
  id: string;
  shopId: string;
  agentVersion: string;
  osPlatform: string;
  status: AgentStatus;
  lastConnectedAt: string;
  printerName: string;
}
