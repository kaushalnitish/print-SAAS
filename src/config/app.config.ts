// =====================================================================
// GLOBAL APP CONFIGURATION
// =====================================================================

export const APP_CONFIG = {
  appName: 'PrintFlow Cloud',
  version: '2.0.0-sprint2',
  api: {
    supabaseUrl: (import.meta as any).env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '',
    isValid: (): boolean => {
      const url = APP_CONFIG.api.supabaseUrl;
      const key = APP_CONFIG.api.supabaseAnonKey;
      if (!url || !key) return false;
      if (url === 'https://your-supabase-id.supabase.co') return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
  },
  fallback: {
    useLocalStorage: true,
    storagePrefix: 'printflow_',
    demoShopId: 'PF-00001',
    demoShopSlug: 'demo-print-shop'
  },
  realtime: {
    pollingIntervalMs: 5000,
    simulateDelayMs: 8000
  },
  limits: {
    maxFileSizeMb: 50,
    supportedFormats: ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'],
    defaultPages: 1
  }
};
