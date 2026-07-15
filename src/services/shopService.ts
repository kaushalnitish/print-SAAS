import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shop } from '../context/SaaSContext';
import { mapDbShopToShop } from '../lib/supabaseService';

export const shopService = {
  /**
   * Fetch all shops for the currently authenticated owner
   */
  async fetchShops(): Promise<Shop[]> {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[shopService] Supabase not connected. Fetching from local storage fallback.');
      return this._getLocalShops();
    }

    try {
      // Fetch shops from database
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (shopsError) throw shopsError;
      if (!shopsData) return [];

      const shopUuids = shopsData.map(s => s.id);
      
      // Fetch print jobs for these shops to compile complete frontend states
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select('*')
        .in('shop_id', shopUuids)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      return shopsData.map(shopRow => {
        const matchingJobs = (jobsData || []).filter(jobRow => jobRow.shop_id === shopRow.id);
        return mapDbShopToShop(shopRow, matchingJobs);
      });
    } catch (error) {
      console.error('[shopService] Failed to fetch shops from Supabase, returning local cache:', error);
      return this._getLocalShops();
    }
  },

  /**
   * Create a new shop/branch
   */
  async createShop(shop: Omit<Shop, 'printJobs' | 'jobs' | 'createdDate'>, ownerId: string): Promise<Shop> {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[shopService] Supabase not connected. Creating shop locally.');
      const newShop = {
        ...shop,
        id: shop.shopId,
        createdDate: new Date().toISOString().split('T')[0],
        printJobs: [],
        jobs: []
      } as Shop;
      const local = this._getLocalShops();
      this._saveLocalShops([newShop, ...local]);
      return newShop;
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

  /**
   * Update shop settings
   */
  async updateShop(shopUuid: string, updates: Partial<Shop>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[shopService] Supabase not connected. Updating shop locally.');
      const local = this._getLocalShops();
      const updated = local.map(s => {
        if (s.id === shopUuid || s.shopId === shopUuid) {
          return { ...s, ...updates };
        }
        return s;
      });
      this._saveLocalShops(updated);
      return;
    }

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

  /**
   * Delete shop branch
   */
  async deleteShop(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      console.log('[shopService] Supabase not connected. Deleting shop locally.');
      const local = this._getLocalShops();
      const filtered = local.filter(s => s.id !== shopUuid && s.shopId !== shopUuid);
      this._saveLocalShops(filtered);
      return;
    }

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopUuid);

    if (error) throw error;
  },

  // ---------------------------------------------------------------------
  // PRIVATE STORAGE BACKUPS
  // ---------------------------------------------------------------------
  _getLocalShops(): Shop[] {
    const data = localStorage.getItem('printflow_shops');
    return data ? JSON.parse(data) : [];
  },

  _saveLocalShops(shops: Shop[]): void {
    localStorage.setItem('printflow_shops', JSON.stringify(shops));
  }
};
