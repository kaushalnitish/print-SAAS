import { supabase, isSupabaseConfigured } from './supabase';
import { Shop } from '../context/SaaSContext';
import { PrintJob } from '../types';

// Helper to format timestamps dynamically from ISO database dates
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

// ---------------------------------------------------------------------
// TYPE MAPPERS (Database Row <=> Frontend UI state)
// ---------------------------------------------------------------------
export function mapDbJobToJob(dbJob: any): PrintJob {
  const fileName = dbJob.file_name || dbJob.fileName || '';
  const fileSize = dbJob.file_size || dbJob.fileSize || '';
  const pages = dbJob.pages || 0;
  const copies = dbJob.copies || 1;
  const colorMode = dbJob.color_mode || dbJob.colorMode || 'bw';
  const paperSize = dbJob.paper_size || dbJob.paperSize || 'a4';
  const sideMode = dbJob.side_mode || dbJob.sideMode || 'single';

  return {
    id: dbJob.job_id || dbJob.id,
    token: dbJob.token,
    fileName,
    fileSize,
    pages,
    copies,
    colorMode: colorMode as 'bw' | 'color',
    paperSize: paperSize as 'a4' | 'a3',
    sideMode: sideMode as 'single' | 'double',
    status: dbJob.status as any,
    fileUrl: dbJob.file_url || dbJob.fileUrl,
    timestamp: dbJob.created_at || dbJob.createdAt ? formatTimestamp(dbJob.created_at || dbJob.createdAt) : 'Just now',
    createdAt: dbJob.created_at || dbJob.createdAt || new Date().toISOString(),
    file: {
      name: fileName,
      size: fileSize,
      pages: pages
    },
    settings: {
      copies: copies,
      colorMode: colorMode as any,
      paperSize: paperSize as any,
      sideMode: sideMode as any
    }
  };
}

export function mapDbShopToShop(dbShop: any, dbJobs: any[] = []): Shop {
  const printJobs = (dbJobs || []).map(mapDbJobToJob);
  const portalUrl = dbShop.customer_portal_url || `${window.location.origin}${window.location.pathname === '/' ? '' : window.location.pathname}#/s/${dbShop.shop_slug}`;
  
  return {
    id: dbShop.id, // Internal database UUID
    shopId: dbShop.shop_id, // Front-facing string ID e.g., 'SH-1234'
    slug: dbShop.shop_slug,
    shopSlug: dbShop.shop_slug,
    name: dbShop.shop_name,
    shopName: dbShop.shop_name,
    ownerName: dbShop.owner_name || 'Valued Owner',
    email: dbShop.owner_email || 'demo@printflow.cloud',
    phone: dbShop.phone,
    address: dbShop.address,
    subscription: dbShop.subscription as any,
    customerPortalUrl: portalUrl,
    pairingKey: dbShop.pairing_key,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`,
    printerStatus: dbShop.printer_status as any,
    agentStatus: dbShop.agent_status as any,
    createdDate: dbShop.created_at ? new Date(dbShop.created_at).toISOString().split('T')[0] : '',
    printJobs: printJobs,
    get jobs() {
      return this.printJobs;
    }
  };
}

// ---------------------------------------------------------------------
// AUTHENTICATION FOUNDATION SERVICES
// ---------------------------------------------------------------------
export const supabaseAuth = {
  async signUp(email: string, password: string, name: string, phone: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      if (error) throw error;
      const user = data.user;
      const res = {
        uid: user?.id || '',
        email: user?.email || email,
        name: name,
        phone: phone
      };
      localStorage.setItem('printflow_user', JSON.stringify(res));
      return { user: res };
    }

    const mockUser = {
      uid: 'mvp-user-id',
      email,
      name,
      phone
    };
    localStorage.setItem('printflow_user', JSON.stringify(mockUser));
    return { user: mockUser };
  },

  async signIn(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      const user = data.user;
      const res = {
        uid: user?.id || '',
        email: user?.email || email,
        name: user?.user_metadata?.name || 'Valued Owner',
        phone: user?.user_metadata?.phone || ''
      };
      localStorage.setItem('printflow_user', JSON.stringify(res));
      return { user: res };
    }

    const mockUser = {
      uid: 'mvp-user-id',
      email: email || 'demo@printflow.cloud',
      name: 'Valued Owner',
      phone: ''
    };
    localStorage.setItem('printflow_user', JSON.stringify(mockUser));
    return { user: mockUser };
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(err => console.error(err));
    }
    localStorage.removeItem('printflow_user');
  },

  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            uid: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || 'Valued Owner',
            phone: user.user_metadata?.phone || ''
          };
        }
      } catch (err) {
        console.error('Error fetching Supabase user, clearing session:', err);
      }
      localStorage.removeItem('printflow_user');
      return null;
    }

    const data = localStorage.getItem('printflow_user');
    if (data) return JSON.parse(data);
    
    const demoUser = {
      uid: 'mvp-user-id',
      email: 'demo@printflow.cloud',
      name: 'Valued Owner',
      phone: '123-456-7890'
    };
    localStorage.setItem('printflow_user', JSON.stringify(demoUser));
    return demoUser;
  }
};

// ---------------------------------------------------------------------
// DATABASE CRUD SERVICES (Shops & Print Jobs)
// ---------------------------------------------------------------------
export const supabaseDb = {
  // Fetch all shops with print jobs
  async fetchShops(): Promise<Shop[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    
    try {
      // 1. Fetch shops directly
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (shopsError) throw shopsError;
      if (!shopsData) return [];
      
      // 2. Fetch print jobs for all returned shops
      const shopUuids = shopsData.map(s => s.id);
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select('*')
        .in('shop_id', shopUuids)
        .order('created_at', { ascending: false });
        
      if (jobsError) throw jobsError;
      
      // Map database rows into frontend-ready structures
      return shopsData.map(shopRow => {
        const matchingJobs = (jobsData || []).filter(jobRow => jobRow.shop_id === shopRow.id);
        return mapDbShopToShop(shopRow, matchingJobs);
      });
    } catch (err) {
      console.error('Supabase error fetching shops:', err);
      throw err;
    }
  },

  // Create a new shop branch
  async createShop(shop: Omit<Shop, 'printJobs' | 'jobs' | 'createdDate'>, ownerId: string): Promise<Shop> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    
    const dbPayload = {
      shop_id: shop.shopId,
      shop_slug: shop.shopSlug,
      shop_name: shop.shopName,
      owner_id: ownerId,
      owner_name: shop.ownerName || 'Valued Owner',
      owner_email: shop.email || 'demo@printflow.cloud',
      phone: shop.phone,
      address: shop.address,
      subscription: shop.subscription,
      pairing_key: shop.pairingKey,
      printer_status: shop.printerStatus,
      agent_status: shop.agentStatus
    };
    
    const { data: insertedShop, error } = await supabase
      .from('shops')
      .insert(dbPayload)
      .select('*')
      .single();
      
    if (error) throw error;
    return mapDbShopToShop(insertedShop, []);
  },

  // Update shop metadata/settings
  async updateShop(shopUuid: string, updates: Partial<Shop>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const dbPayload: any = {};
    if (updates.shopName !== undefined) dbPayload.shop_name = updates.shopName;
    if (updates.shopSlug !== undefined) dbPayload.shop_slug = updates.shopSlug;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.address !== undefined) dbPayload.address = updates.address;
    if (updates.subscription !== undefined) dbPayload.subscription = updates.subscription;
    if (updates.printerStatus !== undefined) dbPayload.printer_status = updates.printerStatus;
    if (updates.agentStatus !== undefined) dbPayload.agent_status = updates.agentStatus;
    
    if (Object.keys(dbPayload).length === 0) return;
    
    const { error } = await supabase
      .from('shops')
      .update(dbPayload)
      .eq('id', shopUuid);
      
    if (error) throw error;
  },

  // Delete a shop branch
  async deleteShop(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopUuid);
      
    if (error) throw error;
  },

  // Add a new walk-in customer print job
  async createPrintJob(shopUuid: string, job: Omit<PrintJob, 'id' | 'timestamp'> & { id?: string }): Promise<PrintJob> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    
    const generatedJobId = job.id || `job-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const dbPayload = {
      job_id: generatedJobId,
      token: job.token,
      file_name: job.fileName,
      file_size: job.fileSize,
      pages: job.pages,
      copies: job.copies,
      color_mode: job.colorMode,
      paper_size: job.paperSize,
      side_mode: job.sideMode,
      status: job.status || 'submitted',
      file_url: job.fileUrl || null,
      shop_id: shopUuid
    };
    
    const { data: insertedJob, error } = await supabase
      .from('print_jobs')
      .insert(dbPayload)
      .select('*')
      .single();
      
    if (error) throw error;
    return mapDbJobToJob(insertedJob);
  },

  // Update a print job status
  async updatePrintJobStatus(jobId: string, status: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('print_jobs')
      .update({ status })
      .eq('job_id', jobId);
      
    if (error) throw error;
  },

  // Clear all jobs for a shop branch
  async clearShopJobs(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('print_jobs')
      .delete()
      .eq('shop_id', shopUuid);
      
    if (error) throw error;
  }
};

// ---------------------------------------------------------------------
// 6. STORAGE COMPONENT SERVICES
// ---------------------------------------------------------------------
export const supabaseStorage = {
  async ensureBucketExists(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    try {
      // 1. List existing buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('⚠️ [Storage Diagnostic] Unable to list storage buckets:', listError.message);
        // Fallback: try creating it anyway if listing fails (could be restriction on listing)
      }
      
      const bucketExists = buckets && buckets.some(b => b.id === 'print-files');
      
      if (!bucketExists) {
        console.log('ℹ️ [Storage Setup] "print-files" bucket not found. Initiating dynamic auto-creation...');
        
        const { error: createError } = await supabase.storage.createBucket('print-files', {
          public: true,
          fileSizeLimit: 52428800, // 50MB limit
          allowedMimeTypes: [
            'application/pdf', 
            'image/jpeg', 
            'image/jpg',
            'image/png', 
            'image/webp',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        });
        
        if (createError) {
          console.warn(
            '⚠️ [Storage Setup] Programmatic auto-creation of bucket "print-files" returned an error: ' +
            createError.message + '\nThis is expected if your API key has restricted administrative roles. ' +
            'Please ensure you run the SQL migration inside /supabase-schema.sql inside your Supabase dashboard SQL editor ' +
            'to guarantee the bucket and its RLS policies are fully provisioned.'
          );
        } else {
          console.log('%c✅ [Storage Setup] "print-files" bucket successfully created and configured as public.', 'color: #10b981; font-weight: bold;');
        }
      } else {
        console.log('✅ [Storage Diagnostic] "print-files" storage bucket exists and is ready.');
      }
    } catch (err: any) {
      console.warn('⚠️ [Storage Setup] Critical exception during bucket verification:', err?.message || err);
    }
  }
};
