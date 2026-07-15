import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrintFile, PrintSettings, OrderState, ShopInfo, UploadStep, TrackingStatus, JobStatus, PrintJob } from '../types';
import { useSaaS } from './SaaSContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { supabaseDb, supabaseStorage } from '../lib/supabaseService';

interface PrintFlowContextType {
  shopInfo: ShopInfo;
  file: PrintFile | null;
  setFile: (file: PrintFile | null) => void;
  settings: PrintSettings;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  order: OrderState | null;
  setOrder: (order: OrderState | null) => void;
  uploadProgress: number;
  uploadStep: UploadStep;
  isUploading: boolean;
  startUpload: (onComplete: () => void) => void;
  resetFlow: () => void;
  simulateTracking: boolean;
  setSimulateTracking: (simulate: boolean) => void;
  uploadError: string | null;
  setUploadError: (err: string | null) => void;
}

const defaultSettings: PrintSettings = {
  copies: 1,
  colorMode: 'bw',
  paperSize: 'a4',
  sideMode: 'single',
};

const defaultShop: ShopInfo = {
  name: 'PrintFlow Hub',
  tagline: 'Frictionless, contact-free instant printing.',
  logo: 'Printer',
  address: '427 University Avenue, Palo Alto, CA',
  phone: '(650) 555-0192',
};

const PrintFlowContext = createContext<PrintFlowContextType | undefined>(undefined);

export function PrintFlowProvider({ children }: { children: React.ReactNode }) {
  const [shopInfo, setShopInfo] = useState<ShopInfo>(defaultShop);
  const [file, setFile] = useState<PrintFile | null>(null);
  const [settings, setSettings] = useState<PrintSettings>(defaultSettings);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<UploadStep>('preparing');
  const [isUploading, setIsUploading] = useState(false);
  const [simulateTracking, setSimulateTracking] = useState(!isSupabaseConfigured);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { getShopBySlug, addJobToShop, updateJobStatus, shops } = useSaaS();

  // Multi-tenant resolver: Sync shop info based on the current URL path slug (e.g. /s/quickprint)
  useEffect(() => {
    const resolveShop = () => {
      const match = window.location.hash.match(/\/s\/([^/]+)/);
      if (match && match[1]) {
        const slug = match[1];
        const tenant = getShopBySlug(slug);
        if (tenant) {
          setShopInfo({
            name: tenant.shopName,
            tagline: `Premium high-speed printing at ${tenant.shopName}.`,
            logo: 'Printer',
            address: tenant.address,
            phone: tenant.phone,
          });
        }
      }
    };

    resolveShop();

    // Listen for hash changes
    window.addEventListener('hashchange', resolveShop);
    return () => window.removeEventListener('hashchange', resolveShop);
  }, [getShopBySlug]);

  // Legacy search param query backup check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantName = params.get('tenant') || params.get('shop');
    if (tenantName && !window.location.hash.includes('/s/')) {
      const formattedName = decodeURIComponent(tenantName).trim();
      setShopInfo((prev) => ({
        ...prev,
        name: formattedName,
        tagline: `Premium high-speed printing at ${formattedName}.`,
      }));
    }
  }, []);

  const updateSettings = (newSettings: Partial<PrintSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetFlow = () => {
    setFile(null);
    setSettings(defaultSettings);
    setOrder(null);
    setUploadProgress(0);
    setUploadStep('preparing');
    setIsUploading(false);
    setUploadError(null);
  };

  const startUpload = async (onComplete: () => void) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep('preparing');
    setUploadError(null);

    let progressVal = 0;
    const progressTimer = setInterval(() => {
      progressVal = Math.min(progressVal + 2, 90);
      setUploadProgress(progressVal);
      if (progressVal < 15) {
        setUploadStep('preparing');
      } else if (progressVal < 65) {
        setUploadStep('uploading');
      } else if (progressVal < 85) {
        setUploadStep('processing');
      } else {
        setUploadStep('finalizing');
      }
    }, 100);

    try {
      // 1. Pre-retrieve the shop tenant and validate it
      const match = window.location.hash.match(/\/s\/([^/]+)/);
      const slug = match ? match[1] : 'demo-print-shop';
      const tenant = getShopBySlug(slug);

      if (!tenant) {
        throw new Error('Target print shop branch not found.');
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isSupabaseConfigured && (!tenant.id || !uuidRegex.test(tenant.id))) {
        throw new Error('This print shop branch is not fully registered and cannot receive print jobs. Please contact support.');
      }

      // 2. Generate a unique Job ID (UUID) for both database primary key and storage folder nesting
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };
      
      const jobUuid = generateUUID();
      let fileUrl = '';
      const rawFile = file.rawFile;

      if (isSupabaseConfigured && supabase) {
        if (!rawFile) {
          throw new Error('No raw file associated with this print job.');
        }

        // Ensure the bucket exists dynamically before uploading (failsafe layer)
        await supabaseStorage.ensureBucketExists();

        // Upload the file to Supabase Storage bucket 'print-files' with structured layout: {shop_id}/{job_id}/original.{ext}
        const fileExt = rawFile.name.split('.').pop()?.toLowerCase() || '';
        const filePathToUpload = `${tenant.id}/${jobUuid}/original.${fileExt}`;

        // Attempting upload
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('print-files')
          .upload(filePathToUpload, rawFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadErr) {
          console.error('Supabase Storage Error:', uploadErr);
          throw new Error(`Storage upload failed: ${uploadErr.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('print-files')
          .getPublicUrl(filePathToUpload);

        fileUrl = urlData.publicUrl;
      } else {
        // Safe cloud connection offline message
        throw new Error("Our cloud connection is temporarily offline. Please check your internet connection and try again.");
      }

      const randomToken = `PF-${Math.floor(1000 + Math.random() * 9000)}`;

      // Automatically calculate queue position based on waiting/submitted/printing/accepted jobs in Supabase or context
      let activeJobsCount = 0;
      if (isSupabaseConfigured && supabase) {
        const { data: activeJobs, error: countError } = await supabase
          .from('print_jobs')
          .select('id')
          .eq('shop_id', tenant.id)
          .in('status', ['waiting', 'submitted', 'printing', 'accepted']);
        if (!countError && activeJobs) {
          activeJobsCount = activeJobs.length;
        } else {
          activeJobsCount = tenant.printJobs.filter(
            (j) => j.status === 'waiting' || j.status === 'submitted' || j.status === 'printing' || j.status === 'accepted'
          ).length;
        }
      } else {
        activeJobsCount = tenant.printJobs.filter(
          (j) => j.status === 'waiting' || j.status === 'submitted' || j.status === 'printing' || j.status === 'accepted'
        ).length;
      }

      const initialQueue = activeJobsCount + 1;
      const waitMin = initialQueue * 2;

      const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
      };

      const jobPayload = {
        id: jobUuid,
        token: randomToken,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        pages: file.pages,
        copies: settings.copies,
        colorMode: settings.colorMode,
        paperSize: settings.paperSize,
        sideMode: settings.sideMode,
        status: 'waiting' as const,
        fileUrl: fileUrl,
      };

      let createdJob: PrintJob;
      if (isSupabaseConfigured && supabase) {
        createdJob = await supabaseDb.createPrintJob(tenant.id, jobPayload);
      } else {
        // Simulated local fallback
        const offlineJob: PrintJob = {
          id: jobUuid,
          ...jobPayload,
          timestamp: 'Just now',
          createdAt: new Date().toISOString()
        };
        createdJob = offlineJob;
        await addJobToShop(slug, jobPayload);
      }

      // Finish progress animation
      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploadStep('finalizing');
      
      const newOrder: OrderState = {
        token: createdJob.token,
        queuePosition: initialQueue,
        estimatedWaitMinutes: waitMin,
        status: 'waiting',
        file: file,
        settings: settings,
      };

      setOrder(newOrder);
      setIsUploading(false);
      onComplete();

    } catch (err: any) {
      clearInterval(progressTimer);
      setIsUploading(false);
      setUploadError(err?.message || 'An unexpected error occurred during print job submission.');
    }
  };

  // 1. Live order status synchronizer: Keep order state fully synchronized with the global SaaS context shops list
  useEffect(() => {
    if (!order) return;

    const match = window.location.hash.match(/\/s\/([^/]+)/);
    if (!match || !match[1]) return;
    const slug = match[1];

    const tenant = getShopBySlug(slug);
    if (!tenant) return;

    // Find our active job in the shop's print jobs list
    const activeJob = tenant.printJobs.find((j) => j.token === order.token);
    if (!activeJob) return;

    // Sort active queue jobs (waiting + accepted) oldest first (by createdAt or ID)
    const activeQueueJobs = tenant.printJobs
      .filter((j) => j.status === 'waiting' || j.status === 'accepted')
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

    const position = activeQueueJobs.findIndex((j) => j.id === activeJob.id) + 1;

    // Map DB status to UI tracking status
    let uiStatus: TrackingStatus = 'submitted';
    if (activeJob.status === 'waiting' || activeJob.status === 'accepted') {
      uiStatus = 'waiting';
    } else if (activeJob.status === 'printing') {
      uiStatus = 'printing';
    } else if (
      activeJob.status === 'completed' ||
      activeJob.status === 'ready' ||
      activeJob.status === 'picked_up'
    ) {
      uiStatus = 'ready';
    } else if (activeJob.status === 'cancelled') {
      uiStatus = 'cancelled' as any;
    }

    const calculatedQueuePos = position > 0 ? position : 0;
    const calculatedWait = calculatedQueuePos * 2;

    if (
      order.status !== uiStatus ||
      order.queuePosition !== calculatedQueuePos ||
      order.estimatedWaitMinutes !== calculatedWait
    ) {
      setOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: uiStatus,
          queuePosition: calculatedQueuePos,
          estimatedWaitMinutes: calculatedWait,
        };
      });
    }
  }, [shops, order?.token]);

  // Live order status simulation removed for production - status updates now strictly follow manual database changes.

  return (
    <PrintFlowContext.Provider
      value={{
        shopInfo,
        file,
        setFile,
        settings,
        updateSettings,
        order,
        setOrder,
        uploadProgress,
        uploadStep,
        isUploading,
        startUpload,
        resetFlow,
        simulateTracking,
        setSimulateTracking,
        uploadError,
        setUploadError,
      }}
    >
      {children}
    </PrintFlowContext.Provider>
  );
}

export function usePrintFlow() {
  const context = useContext(PrintFlowContext);
  if (!context) {
    throw new Error('usePrintFlow must be used within a PrintFlowProvider');
  }
  return context;
}
