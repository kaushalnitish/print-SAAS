import { DBPrintAgent, PrinterStatus, AgentStatus } from '../types';

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
   * Mock agent pairing mechanism
   */
  async pairAgent(pairingKey: string, shopId: string): Promise<boolean> {
    console.log(`[agentService] Attempting to pair desktop agent for ${shopId} with pairingKey: ${pairingKey}`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return pairingKey.startsWith('PRNT-FLW-') || pairingKey === 'PF-DEMO-2026';
  },

  /**
   * Realtime printer hardware status subscription
   */
  subscribePrinter(shopId: string, onUpdate: (status: PrinterStatus) => void): () => void {
    console.log(`[agentService] Subscribing to real-time printer updates for ${shopId}`);
    
    const states: PrinterStatus[] = ['online', 'offline', 'online'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      onUpdate(states[index]);
    }, 12000);
    
    return () => {
      console.log(`[agentService] Unsubscribed from printer updates for ${shopId}`);
      clearInterval(interval);
    };
  },

  /**
   * Realtime agent software connection status subscription
   */
  subscribeAgent(shopId: string, onUpdate: (status: AgentStatus) => void): () => void {
    console.log(`[agentService] Subscribing to real-time agent connectivity updates for ${shopId}`);
    
    const states: AgentStatus[] = ['connected', 'disconnected', 'connected'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      onUpdate(states[index]);
    }, 15000);
    
    return () => {
      console.log(`[agentService] Unsubscribed from agent updates for ${shopId}`);
      clearInterval(interval);
    };
  }
};
