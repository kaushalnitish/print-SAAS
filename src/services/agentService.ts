import { DBPrintAgent, PrinterStatus, AgentStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const agentService = {
  /**
   * Fetch print agent connection properties
   */
  async getAgentStatus(shopId: string): Promise<DBPrintAgent> {
    console.log(`[agentService] Retrieving agent connection for shop ${shopId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    return {
      id: `agent-${shopId}`,
      shopId,
      agentVersion: '1.2.4',
      osPlatform: 'Windows 11 x64',
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      printerName: 'HP LaserJet Pro MFP M428'
    };
  },

  /**
   * Database Pairing Validation:
   * Validates pairing key against the paired shop record in database/localStorage.
   * Rejects invalid keys, empty keys, and mismatched shop keys.
   */
  async pairAgent(pairingKey: string, shopId: string): Promise<boolean> {
    console.log(`[agentService] Validating pairing key against shop record for shop: ${shopId}...`);
    
    if (!pairingKey || !pairingKey.trim()) {
      console.warn(`[agentService] Pairing REJECTED: Pairing key is empty.`);
      return false;
    }

    if (!shopId) {
      console.warn(`[agentService] Pairing REJECTED: Target shop ID is missing.`);
      return false;
    }

    const cleanKey = pairingKey.trim();

    // 1. Supabase database record validation
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: shopRow, error } = await supabase
          .from('shops')
          .select('id, shop_id, pairing_key')
          .or(`id.eq.${shopId},shop_id.eq.${shopId}`)
          .maybeSingle();

        if (error || !shopRow) {
          console.error(`[agentService] Pairing REJECTED: Shop '${shopId}' not found in database.`, error);
          return false;
        }

        if (!shopRow.pairing_key || shopRow.pairing_key !== cleanKey) {
          console.warn(`[agentService] Pairing REJECTED: Key '${cleanKey}' does not match registered key for shop '${shopId}'.`);
          return false;
        }

        console.log(`[agentService] Pairing key successfully validated against database record for shop ${shopId}.`);
        return true;
      } catch (err) {
        console.error(`[agentService] Error validating pairing key in database:`, err);
        return false;
      }
    }

    // 2. Fallback validation against local storage state
    try {
      const savedShopsStr = localStorage.getItem('printflow_shops');
      if (savedShopsStr) {
        const localShops = JSON.parse(savedShopsStr);
        const shop = localShops.find((s: any) => s.id === shopId || s.shopId === shopId);
        
        if (!shop) {
          console.warn(`[agentService] Pairing REJECTED: Shop '${shopId}' not found in local record.`);
          return false;
        }

        if (shop.pairingKey !== cleanKey) {
          console.warn(`[agentService] Pairing REJECTED: Key '${cleanKey}' does not match registered key '${shop.pairingKey}'.`);
          return false;
        }

        return true;
      }
    } catch (e) {
      console.error(`[agentService] Local pairing check failed:`, e);
    }

    return false;
  },

  /**
   * Runtime Job Validation:
   * Verifies job.shop_id == agent.shop_id before processing.
   */
  validateRuntimeJob(
    job: { id?: string; shop_id?: string; shopId?: string }, 
    agentShopId: string,
    agentShopUuid?: string
  ): { valid: boolean; reason?: string } {
    if (!job) {
      return { valid: false, reason: 'Null or undefined print job received' };
    }

    const jobShopTarget = job.shop_id || job.shopId;

    if (!jobShopTarget) {
      return { valid: false, reason: 'Job lacks mandatory shop_id tenant metadata' };
    }

    const matchesUuid = agentShopUuid && jobShopTarget === agentShopUuid;
    const matchesId = agentShopId && jobShopTarget === agentShopId;

    if (!matchesUuid && !matchesId) {
      const reason = `Tenant Mismatch! Job shop_id ('${jobShopTarget}') does not match Agent shop_id ('${agentShopUuid || agentShopId}')`;
      console.error(`[SECURITY REJECTION] ${reason}`);
      return { valid: false, reason };
    }

    return { valid: true };
  },

  /**
   * Realtime printer hardware status subscription
   */
  subscribePrinter(shopId: string, onUpdate: (status: PrinterStatus) => void): () => void {
    console.log(`[agentService] Subscribing to real-time printer updates for shop ${shopId}`);
    
    const states: PrinterStatus[] = ['online', 'offline', 'online'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      onUpdate(states[index]);
    }, 12000);
    
    return () => {
      console.log(`[agentService] Unsubscribed from printer updates for shop ${shopId}`);
      clearInterval(interval);
    };
  },

  /**
   * Realtime agent software connection status subscription
   */
  subscribeAgent(shopId: string, onUpdate: (status: AgentStatus) => void): () => void {
    console.log(`[agentService] Subscribing to real-time agent connectivity updates for shop ${shopId}`);
    
    const states: AgentStatus[] = ['connected', 'disconnected', 'connected'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      onUpdate(states[index]);
    }, 15000);
    
    return () => {
      console.log(`[agentService] Unsubscribed from agent updates for shop ${shopId}`);
      clearInterval(interval);
    };
  }
};
