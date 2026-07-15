import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { supabaseAuth, supabaseDb, mapDbShopToShop, supabaseStorage } from '../lib/supabaseService';
import { PrintJob, JobStatus } from '../types';

export interface Shop {
  id?: string; // Internal database UUID
  shopId: string; // Legacy string ID (e.g., 'SH-1234' or 'PF-00001')
  slug?: string;
  shopSlug: string;
  name?: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  subscription: 'Starter' | 'Professional' | 'Enterprise' | 'Trial Active';
  customerPortalUrl: string;
  pairingKey: string;
  qrCode: string;
  printerStatus: 'online' | 'offline' | 'Not Connected';
  agentStatus: 'connected' | 'disconnected' | 'Not Installed';
  createdDate: string;
  printJobs: PrintJob[];
  jobs?: PrintJob[]; // Alias for backwards compatibility
  subscriptionStatus?: string;
}

interface SaaSContextType {
  shops: Shop[];
  currentShop: Shop | null;
  setCurrentShop: (shop: Shop | null) => void;
  activeOwner: { name: string; email: string; phone?: string } | null;
  currentOwner: { name: string; email: string; phone?: string } | null; // For DashboardShell and DashboardShops
  login: (email: string, password: string) => boolean | Promise<boolean>;
  register: (ownerName: string, businessName: string, email: string, phone: string, address: string, password?: string) => Shop | Promise<Shop>;
  logout: () => void | Promise<void>;
  getShopBySlug: (slug: string) => Shop | undefined;
  addJobToShop: (slug: string, job: Omit<PrintJob, 'id' | 'timestamp'>) => PrintJob | Promise<PrintJob>;
  updateJobStatus: (shopId: string, jobId: string, status: JobStatus) => void | Promise<void>;
  updateShopSettings: (shopId: string, updates: Partial<Shop>) => void | Promise<void>;
  clearShopJobs: (shopId: string) => void | Promise<void>;
  addBranch: (branchName: string, address: string, phone: string) => void | Promise<void>;
  deleteShop: (shopId: string) => void | Promise<void>;
  selectShop: (shopId: string) => void;
  isSupabaseConfigured: boolean;
  supabaseLoading: boolean;
}

const SaaSContext = createContext<SaaSContextType | undefined>(undefined);

// Automatic blank shop generator for fallback
export const getDemoShop = (): Shop => {
  return {
    id: '',
    shopId: '',
    slug: '',
    shopSlug: '',
    name: 'Print Shop',
    shopName: 'Print Shop',
    ownerName: 'Owner',
    email: '',
    phone: '',
    address: '',
    subscription: 'Starter',
    customerPortalUrl: '',
    pairingKey: '',
    qrCode: '',
    printerStatus: 'Not Connected',
    agentStatus: 'Not Installed',
    createdDate: new Date().toISOString().split('T')[0],
    printJobs: [],
    get jobs() {
      return this.printJobs;
    }
  } as any;
};

export const enrichShop = (shop: any): Shop => {
  if (!shop) return shop;
  const enriched = {
    ...shop,
    id: shop.id, 
    shopId: shop.shopId || shop.id,
    slug: shop.slug || shop.shopSlug,
    shopSlug: shop.shopSlug || shop.slug,
    name: shop.name || shop.shopName,
    shopName: shop.shopName || shop.name,
    printJobs: shop.printJobs || shop.jobs || [],
    jobs: shop.jobs || shop.printJobs || [],
    subscriptionStatus: shop.subscriptionStatus || 'active'
  };
  // Ensure getters/aliases stay connected
  Object.defineProperty(enriched, 'jobs', {
    get() {
      return this.printJobs;
    },
    configurable: true,
    enumerable: true
  });
  return enriched as Shop;
};

// No pre-seeded shops - strictly real Supabase integration
const initialShops: Shop[] = [];

export function SaaSProvider({ children }: { children: React.ReactNode }) {
  const [supabaseLoading, setSupabaseLoading] = useState(isSupabaseConfigured);
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShopState] = useState<Shop | null>(null);
  const [activeOwner, setActiveOwner] = useState<{ name: string; email: string; phone?: string } | null>(null);

  // ---------------------------------------------------------------------
  // 1. INITIALIZATION: AUTH STATE RESOLUTION & DB LOAD
  // ---------------------------------------------------------------------
  useEffect(() => {
    const initialize = async () => {
      if (isSupabaseConfigured) {
        try {
          // Dynamic Storage Bucket verification
          await supabaseStorage.ensureBucketExists();
          
          // Always fetch public shops first, so the public customer portal works in any browser tab!
          const dbShops = await supabaseDb.fetchShops();
          setShops(dbShops);

          const user = await supabaseAuth.getCurrentUser();
          if (user) {
            setActiveOwner({ name: user.name, email: user.email, phone: user.phone });
            
            if (dbShops.length > 0) {
              // Restore previously selected shop if matched
              const saved = localStorage.getItem('printflow_current_shop');
              if (saved) {
                try {
                  const parsed = JSON.parse(saved);
                  const matched = dbShops.find(s => s.id === parsed.id || s.shopId === parsed.shopId);
                  setCurrentShopState(matched || dbShops[0]);
                } catch {
                  setCurrentShopState(dbShops[0]);
                }
              } else {
                setCurrentShopState(dbShops[0]);
              }
            } else {
              setCurrentShopState(null);
            }
          } else {
            // Unauthenticated but Supabase is configured (e.g. walk-in Customer Portal user).
            // Do NOT call restoreLocalFallback() or clear shops, as we want to keep the public dbShops loaded!
            const saved = localStorage.getItem('printflow_current_shop');
            if (saved && dbShops.length > 0) {
              try {
                const parsed = JSON.parse(saved);
                const matched = dbShops.find(s => s.id === parsed.id || s.shopId === parsed.shopId);
                setCurrentShopState(matched || null);
              } catch {
                setCurrentShopState(null);
              }
            } else {
              setCurrentShopState(null);
            }
            setActiveOwner(null);
          }
        } catch (error) {
          console.error('Failed to initialize Supabase connection:', error);
          setShops([]);
          setCurrentShopState(null);
          setActiveOwner(null);
        } finally {
          setSupabaseLoading(false);
        }
      } else {
        restoreLocalFallback();
        setSupabaseLoading(false);
      }
    };

    initialize();
  }, []);

  // ---------------------------------------------------------------------
  // 1b. SUPABASE REALTIME SUBSCRIPTION FOR PRINT JOBS
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    console.log('Setting up Supabase Realtime subscription for print_jobs changes...');

    const channel = supabase
      .channel('public-print-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_jobs',
        },
        async (payload) => {
          console.log('Realtime print_jobs update received:', payload);
          try {
            const dbShops = await supabaseDb.fetchShops();
            setShops(dbShops);
            
            // Re-sync current shop in state using a functional state update to avoid stale closures
            setCurrentShopState((prevCurrent) => {
              if (prevCurrent) {
                const matched = dbShops.find(s => s.id === prevCurrent.id || s.shopId === prevCurrent.shopId);
                return matched ? matched : prevCurrent;
              }
              return null;
            });
          } catch (err) {
            console.error('Error auto-syncing database changes via Realtime:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Supabase Realtime subscription status: ${status}`);
      });

    return () => {
      console.log('Teardown Supabase Realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [isSupabaseConfigured]);

  // Helper to load localStorage preseeds
  const restoreLocalFallback = () => {
    if (isSupabaseConfigured) {
      setShops([]);
      setCurrentShopState(null);
      setActiveOwner(null);
      return;
    }

    // Restore shops
    const savedShops = localStorage.getItem('printflow_shops');
    if (savedShops) {
      try {
        const parsed = JSON.parse(savedShops);
        if (parsed && parsed.length > 0) {
          if (!parsed.some((s: any) => s.shopId === 'PF-00001' || s.id === 'PF-00001')) {
            parsed.unshift(getDemoShop());
          }
          setShops(parsed.map(enrichShop));
        } else {
          setShops([getDemoShop(), ...initialShops].map(enrichShop));
        }
      } catch {
        setShops([getDemoShop(), ...initialShops].map(enrichShop));
      }
    } else {
      setShops([getDemoShop(), ...initialShops].map(enrichShop));
    }

    // Restore current shop
    const savedCurrent = localStorage.getItem('printflow_current_shop');
    if (savedCurrent) {
      try {
        setCurrentShopState(enrichShop(JSON.parse(savedCurrent)));
      } catch {
        setCurrentShopState(getDemoShop());
      }
    } else {
      setCurrentShopState(getDemoShop());
    }

    // Restore owner
    const savedOwner = localStorage.getItem('printflow_active_owner');
    if (savedOwner) {
      try {
        setActiveOwner(JSON.parse(savedOwner));
      } catch {
        setActiveOwner({ name: 'Demo Owner', email: 'demo@printflow.cloud', phone: '+91 98765 43210' });
      }
    } else {
      setActiveOwner({ name: 'Demo Owner', email: 'demo@printflow.cloud', phone: '+91 98765 43210' });
    }
  };

  // ---------------------------------------------------------------------
  // 2. BACKUP LOCAL PERSISTENCE SYNCERS (For Fallback Mode / Cache Backup)
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (shops.length > 0) {
      localStorage.setItem('printflow_shops', JSON.stringify(shops));
    }
  }, [shops]);

  useEffect(() => {
    if (currentShop) {
      localStorage.setItem('printflow_current_shop', JSON.stringify(currentShop));
    } else {
      localStorage.removeItem('printflow_current_shop');
    }
  }, [currentShop]);

  useEffect(() => {
    if (activeOwner) {
      localStorage.setItem('printflow_active_owner', JSON.stringify(activeOwner));
    } else {
      localStorage.removeItem('printflow_active_owner');
    }
  }, [activeOwner]);

  // Handle calculating portal URLs dynamically for the local fallback list
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const host = window.location.origin;
      const pathPrefix = window.location.pathname === '/' ? '' : window.location.pathname;
      
      setShops((prevShops) => {
        return prevShops.map((shop) => {
          const portalUrl = `${host}${pathPrefix}#/s/${shop.shopSlug}`;
          return enrichShop({
            ...shop,
            customerPortalUrl: portalUrl,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`
          });
        });
      });
    }
  }, []);

  // ---------------------------------------------------------------------
  // 3. SERVICE INTERFACES
  // ---------------------------------------------------------------------
  const setCurrentShop = (shop: Shop | null) => {
    setCurrentShopState(shop ? enrichShop(shop) : null);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        setSupabaseLoading(true);
        await supabaseAuth.signIn(email, password);
        const user = await supabaseAuth.getCurrentUser();
        if (user) {
          setActiveOwner({ name: user.name, email: user.email, phone: user.phone });
          const dbShops = await supabaseDb.fetchShops();
          setShops(dbShops);
          if (dbShops.length > 0) {
            setCurrentShopState(dbShops[0]);
          } else {
            setCurrentShopState(null);
          }
          return true;
        }
        return false;
      } catch (err) {
        console.error('Supabase authentication failed:', err);
        throw err;
      } finally {
        setSupabaseLoading(false);
      }
    } else {
      // Local demo fallback
      const shop = shops.find((s) => s.email.toLowerCase() === email.toLowerCase());
      if (shop) {
        setCurrentShop(shop);
        setActiveOwner({ name: shop.ownerName, email: shop.email, phone: shop.phone });
        return true;
      }
      if (email && password) {
        const defaultShop = shops[0] || getDemoShop();
        setCurrentShop(defaultShop);
        setActiveOwner({ name: defaultShop.ownerName, email: defaultShop.email, phone: defaultShop.phone });
        return true;
      }
      return false;
    }
  };

  const register = async (
    ownerName: string,
    businessName: string,
    email: string,
    phone: string,
    address: string,
    password?: string
  ): Promise<Shop> => {
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let finalSlug = slug;
    let counter = 1;
    while (shops.some((s) => s.shopSlug === finalSlug || s.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const host = window.location.origin;
    const pathPrefix = window.location.pathname === '/' ? '' : window.location.pathname;
    const portalUrl = `${host}${pathPrefix}#/s/${finalSlug}`;
    const generatedShopId = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const keys = ['A', 'B', 'C', 'X', 'Y', 'Z', 'Q', 'W'];
    const generatedKey = `PRNT-FLW-${keys[Math.floor(Math.random() * keys.length)]}${keys[Math.floor(Math.random() * keys.length)]}${Math.floor(10 + Math.random() * 90)}-${keys[Math.floor(Math.random() * keys.length)]}${Math.floor(100 + Math.random() * 900)}`;

    const freshShop = enrichShop({
      shopId: generatedShopId,
      shopSlug: finalSlug,
      shopName: businessName,
      ownerName: ownerName,
      email: email,
      phone: phone,
      address: address,
      subscription: 'Starter',
      customerPortalUrl: portalUrl,
      pairingKey: generatedKey,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`,
      printerStatus: 'online',
      agentStatus: 'connected',
      createdDate: new Date().toISOString().split('T')[0],
      printJobs: [],
      jobs: []
    });

    if (isSupabaseConfigured) {
      try {
        setSupabaseLoading(true);
        // Step 1: Sign up user
        await supabaseAuth.signUp(email, password || 'password123', ownerName, phone);
        // Step 2: Sign in user immediately
        await supabaseAuth.signIn(email, password || 'password123');
        const user = await supabaseAuth.getCurrentUser();
        if (!user) throw new Error('User profile resolution failed after signup.');
        
        setActiveOwner({ name: user.name, email: user.email, phone: user.phone });
        
        // Step 3: Insert shop row
        const inserted = await supabaseDb.createShop(freshShop, user.uid);
        
        // Step 4: Refresh state
        const dbShops = await supabaseDb.fetchShops();
        setShops(dbShops);
        setCurrentShopState(inserted);
        return inserted;
      } catch (err) {
        console.error('Supabase shop registration failed:', err);
        throw err;
      } finally {
        setSupabaseLoading(false);
      }
    } else {
      // Local fallback
      setShops((prev) => [freshShop, ...prev]);
      setCurrentShop(freshShop);
      setActiveOwner({ name: ownerName, email: email, phone: phone });
      return freshShop;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        setSupabaseLoading(true);
        await supabaseAuth.signOut();
      } catch (err) {
        console.error('Supabase Sign Out failed:', err);
      } finally {
        setSupabaseLoading(false);
      }
    }
    
    // Clear credentials
    setCurrentShop(null);
    setActiveOwner(null);
    
    // Clear current shop storage cache
    localStorage.removeItem('printflow_current_shop');
    localStorage.removeItem('printflow_active_owner');
  };

  const getShopBySlug = (slug: string): Shop | undefined => {
    const shop = shops.find((s) => s.shopSlug.toLowerCase() === slug.toLowerCase() || s.slug?.toLowerCase() === slug.toLowerCase());
    return shop ? enrichShop(shop) : undefined;
  };

  const addJobToShop = async (slug: string, job: Omit<PrintJob, 'id' | 'timestamp'>): Promise<PrintJob> => {
    const generatedJobId = `job-${Date.now()}`;
    const newJob: PrintJob = {
      ...job,
      id: generatedJobId,
      timestamp: 'Just now'
    };

    if (isSupabaseConfigured) {
      const matchedShop = shops.find(s => s.shopSlug.toLowerCase() === slug.toLowerCase() || s.slug?.toLowerCase() === slug.toLowerCase());
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!matchedShop) {
        throw new Error('This print shop center could not be found.');
      }
      
      if (!matchedShop.id || !uuidRegex.test(matchedShop.id)) {
        throw new Error('This print shop branch is not fully registered. Please contact support.');
      }

      try {
        // Push job record to Supabase
        const insertedJob = await supabaseDb.createPrintJob(matchedShop.id, {
          ...job,
          id: generatedJobId
        });
        
        // Re-fetch to ensure reliable sync
        const dbShops = await supabaseDb.fetchShops();
        setShops(dbShops);
        const updatedCurrent = dbShops.find(s => s.id === matchedShop.id);
        if (updatedCurrent) setCurrentShopState(updatedCurrent);
        return insertedJob;
      } catch (err) {
        console.error('Failed to create remote print job in Supabase:', err);
        throw err;
      }
    }

    // Optmistic local update
    setShops((prevShops) => {
      return prevShops.map((shop) => {
        if (shop.shopSlug.toLowerCase() === slug.toLowerCase() || shop.slug?.toLowerCase() === slug.toLowerCase()) {
          return enrichShop({
            ...shop,
            printJobs: [newJob, ...shop.printJobs]
          });
        }
        return shop;
      });
    });

    if (currentShop && (currentShop.shopSlug.toLowerCase() === slug.toLowerCase() || currentShop.slug?.toLowerCase() === slug.toLowerCase())) {
      setCurrentShopState((prev) => {
        if (!prev) return null;
        return enrichShop({
          ...prev,
          printJobs: [newJob, ...prev.printJobs]
        });
      });
    }

    return newJob;
  };

  const updateJobStatus = async (
    shopId: string, 
    jobId: string, 
    status: JobStatus
  ) => {
    // Optimistic local state update
    setShops((prevShops) => {
      return prevShops.map((shop) => {
        if (shop.shopId === shopId || shop.id === shopId) {
          const updatedJobs = shop.printJobs.map((job) => {
            if (job.id === jobId) {
              return { ...job, status };
            }
            return job;
          });
          return enrichShop({ ...shop, printJobs: updatedJobs });
        }
        return shop;
      });
    });

    if (currentShop && (currentShop.shopId === shopId || currentShop.id === shopId)) {
      setCurrentShopState((prev) => {
        if (!prev) return null;
        const updatedJobs = prev.printJobs.map((job) => {
          if (job.id === jobId) {
            return { ...job, status };
          }
          return job;
        });
        return enrichShop({ ...prev, printJobs: updatedJobs });
      });
    }

    if (isSupabaseConfigured) {
      try {
        await supabaseDb.updatePrintJobStatus(jobId, status);
      } catch (err) {
        console.error('Failed to sync job status to Supabase:', err);
      }
    }
  };

  const updateShopSettings = async (shopId: string, updates: Partial<Shop>) => {
    // Optimistic local update
    setShops((prevShops) => {
      return prevShops.map((shop) => {
        if (shop.shopId === shopId || shop.id === shopId) {
          const host = window.location.origin;
          const pathPrefix = window.location.pathname === '/' ? '' : window.location.pathname;
          const finalSlug = updates.shopSlug || updates.slug || shop.shopSlug;
          const portalUrl = `${host}${pathPrefix}#/s/${finalSlug}`;
          return enrichShop({
            ...shop,
            ...updates,
            customerPortalUrl: portalUrl,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`
          });
        }
        return shop;
      });
    });

    if (currentShop && (currentShop.shopId === shopId || currentShop.id === shopId)) {
      setCurrentShopState((prev) => {
        if (!prev) return null;
        const host = window.location.origin;
        const pathPrefix = window.location.pathname === '/' ? '' : window.location.pathname;
        const finalSlug = updates.shopSlug || updates.slug || prev.shopSlug;
        const portalUrl = `${host}${pathPrefix}#/s/${finalSlug}`;
        return enrichShop({
          ...prev,
          ...updates,
          customerPortalUrl: portalUrl,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`
        });
      });
    }

    if (isSupabaseConfigured) {
      try {
        const target = shops.find(s => s.shopId === shopId || s.id === shopId);
        if (target?.id) {
          await supabaseDb.updateShop(target.id, updates);
        }
      } catch (err) {
        console.error('Failed to sync settings update to Supabase:', err);
      }
    }
  };

  const clearShopJobs = async (shopId: string) => {
    // Optimistic local state wipe
    setShops((prevShops) => {
      return prevShops.map((shop) => {
        if (shop.shopId === shopId || shop.id === shopId) {
          return enrichShop({ ...shop, printJobs: [] });
        }
        return shop;
      });
    });

    if (currentShop && (currentShop.shopId === shopId || currentShop.id === shopId)) {
      setCurrentShopState((prev) => {
        if (!prev) return null;
        return enrichShop({ ...prev, printJobs: [] });
      });
    }

    if (isSupabaseConfigured) {
      try {
        const target = shops.find(s => s.shopId === shopId || s.id === shopId);
        if (target?.id) {
          await supabaseDb.clearShopJobs(target.id);
        }
      } catch (err) {
        console.error('Failed to clear print jobs in Supabase:', err);
      }
    }
  };

  const selectShop = (shopId: string) => {
    const shop = shops.find((s) => s.shopId === shopId || s.id === shopId);
    if (shop) {
      setCurrentShop(shop);
    }
  };

  const addBranch = async (branchName: string, address: string, phone: string) => {
    if (!activeOwner) return;
    const slug = branchName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let finalSlug = slug;
    let counter = 1;
    while (shops.some((s) => s.shopSlug === finalSlug || s.slug === finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const host = window.location.origin;
    const pathPrefix = window.location.pathname === '/' ? '' : window.location.pathname;
    const portalUrl = `${host}${pathPrefix}#/s/${finalSlug}`;
    const generatedShopId = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
    const keys = ['A', 'B', 'C', 'X', 'Y', 'Z', 'Q', 'W'];
    const generatedKey = `PRNT-FLW-${keys[Math.floor(Math.random() * keys.length)]}${keys[Math.floor(Math.random() * keys.length)]}${Math.floor(10 + Math.random() * 90)}-${keys[Math.floor(Math.random() * keys.length)]}${Math.floor(100 + Math.random() * 900)}`;

    const freshShop = enrichShop({
      shopId: generatedShopId,
      shopSlug: finalSlug,
      shopName: branchName,
      ownerName: activeOwner.name,
      email: activeOwner.email,
      phone: phone,
      address: address,
      subscription: 'Starter',
      customerPortalUrl: portalUrl,
      pairingKey: generatedKey,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`,
      printerStatus: 'online',
      agentStatus: 'connected',
      createdDate: new Date().toISOString().split('T')[0],
      printJobs: [],
      jobs: []
    });

    if (isSupabaseConfigured) {
      try {
        setSupabaseLoading(true);
        const user = await supabaseAuth.getCurrentUser();
        if (!user) throw new Error('Unauthenticated user cannot create a branch.');
        
        const inserted = await supabaseDb.createShop(freshShop, user.uid);
        const dbShops = await supabaseDb.fetchShops();
        setShops(dbShops);
        setCurrentShopState(inserted);
      } catch (err) {
        console.error('Failed to create branch in Supabase:', err);
        throw err;
      } finally {
        setSupabaseLoading(false);
      }
    } else {
      // Local fallback
      setShops((prev) => [freshShop, ...prev]);
      setCurrentShop(freshShop);
    }
  };

  const deleteShop = async (shopId: string) => {
    const target = shops.find(s => s.shopId === shopId || s.id === shopId);
    
    // Update local state first (optimistic)
    setShops((prev) => {
      const updated = prev.filter((s) => s.shopId !== shopId && s.id !== shopId);
      if (updated.length === 0) {
        const demo = getDemoShop();
        setCurrentShopState(demo);
        return [demo];
      }
      if (currentShop && (currentShop.shopId === shopId || currentShop.id === shopId)) {
        setCurrentShopState(updated[0]);
      }
      return updated;
    });

    if (isSupabaseConfigured && target?.id) {
      try {
        await supabaseDb.deleteShop(target.id);
        const dbShops = await supabaseDb.fetchShops();
        setShops(dbShops);
        if (dbShops.length > 0) {
          if (currentShop && (currentShop.id === target.id || currentShop.shopId === target.shopId)) {
            setCurrentShopState(dbShops[0]);
          }
        } else {
          setCurrentShopState(null);
        }
      } catch (err) {
        console.error('Failed to delete shop in Supabase:', err);
      }
    }
  };

  return (
    <SaaSContext.Provider
      value={{
        shops,
        currentShop,
        setCurrentShop,
        activeOwner,
        currentOwner: activeOwner,
        login,
        register,
        logout,
        getShopBySlug,
        addJobToShop,
        updateJobStatus,
        updateShopSettings,
        clearShopJobs,
        addBranch,
        deleteShop,
        selectShop,
        isSupabaseConfigured,
        supabaseLoading
      }}
    >
      {children}
    </SaaSContext.Provider>
  );
}

export function useSaaS() {
  const context = useContext(SaaSContext);
  if (!context) {
    throw new Error('useSaaS must be used within a SaaSProvider');
  }
  return context;
}
