import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL?: string;
      readonly VITE_SUPABASE_ANON_KEY?: string;
      [key: string]: any;
    };
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to check if the provided URL is structurally valid
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if Supabase keys are fully and correctly populated
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-id.supabase.co' && 
  supabaseUrl !== 'your-supabase-url' &&
  isValidUrl(supabaseUrl);

// Initialize Supabase client if configured, or export null to enable local fallback mode
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Global Audit State tracker for debugging
export const connectionAudit = {
  envLoaded: false,
  clientInitialized: false,
  authInitialized: false,
  databaseReachable: false,
  realtimeConnected: false,
  isAIStudioPreview: false,
  rootCause: 'None'
};

// Perform Complete Connectivity Diagnostic Audit
const runConnectivityAudit = async () => {
  console.log('%c🔍 [PrintFlow Cloud Connectivity Audit] Initiating diagnostic sequence...', 'color: #6366f1; font-weight: bold; font-size: 13px;');
  
  // 1. Environment Loading Verification
  const isUrlSet = !!supabaseUrl && supabaseUrl !== 'https://your-supabase-id.supabase.co';
  const isKeySet = !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key' && supabaseAnonKey !== 'your-supabase-anon-key';
  const isUrlValid = isValidUrl(supabaseUrl);

  const isAIStudio = window.location.hostname.includes('.run.app') || 
                      window.location.hostname.includes('ai.studio') || 
                      window.location.hostname.includes('localhost');

  connectionAudit.isAIStudioPreview = isAIStudio;

  if (isUrlSet && isKeySet && isUrlValid) {
    connectionAudit.envLoaded = true;
    console.log('%c[1/5] ENVIRONMENT LOADING: SUCCESS (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY successfully loaded)', 'color: #10b981; font-weight: bold;');
  } else {
    connectionAudit.envLoaded = false;
    let cause = 'Environment keys are missing or contain default placeholder values.';
    if (!isUrlValid && isUrlSet) {
      cause = `The VITE_SUPABASE_URL value ("${supabaseUrl}") is not a valid URL.`;
    }
    connectionAudit.rootCause = cause;
    
    console.log('%c[1/5] ENVIRONMENT LOADING: FAILED', 'color: #f43f5e; font-weight: bold;');
    console.warn(`Cause: ${cause}`);
    
    if (isAIStudio) {
      console.info(
        '%cℹ️ GOOGLE AI STUDIO DETECTED: This container is running in the Google AI Studio preview sandbox. ' +
        'By default, database credentials are not automatically pre-populated. The system is operating ' +
        'safely in Local Offline Fallback Mode. To bypass this, add valid VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_ANON_KEY credentials using the configuration panel or environment files.',
        'color: #3b82f6; font-weight: 500;'
      );
    }
    return; // Exit early since client cannot be created
  }

  // 2. Supabase Client Creation
  if (supabase) {
    connectionAudit.clientInitialized = true;
    console.log('%c[2/5] SUPABASE CLIENT CREATION: SUCCESS (Client instance initialized)', 'color: #10b981; font-weight: bold;');
  } else {
    connectionAudit.clientInitialized = false;
    connectionAudit.rootCause = 'Supabase client instance is null despite environment variables being present.';
    console.log('%c[2/5] SUPABASE CLIENT CREATION: FAILED', 'color: #f43f5e; font-weight: bold;');
    return;
  }

  // 3. Authentication Flow Check
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      connectionAudit.authInitialized = false;
      connectionAudit.rootCause = `Authentication service call failed: ${authError.message}`;
      console.log(`%c[3/5] AUTH INITIALIZED: FAILED - ${authError.message}`, 'color: #f43f5e; font-weight: bold;');
    } else {
      connectionAudit.authInitialized = true;
      console.log('%c[3/5] AUTH INITIALIZED: SUCCESS (Auth service is active and session is verified)', 'color: #10b981; font-weight: bold;');
    }
  } catch (err: any) {
    connectionAudit.authInitialized = false;
    connectionAudit.rootCause = `Authentication service threw unexpected exception: ${err?.message || err}`;
    console.log('%c[3/5] AUTH INITIALIZED: FAILED (Unexpected exception occurred)', 'color: #f43f5e; font-weight: bold;');
  }

  // 4. Database Connection & Table Reachability Check
  try {
    const { data: dbData, error: dbError } = await supabase
      .from('shops')
      .select('id')
      .limit(1);

    if (dbError) {
      connectionAudit.databaseReachable = false;
      connectionAudit.rootCause = `Database query failed. The table may not exist or permission is denied: [${dbError.code}] ${dbError.message}`;
      console.log(`%c[4/5] DATABASE REACHABLE: FAILED - ${dbError.message}`, 'color: #f43f5e; font-weight: bold;');
    } else {
      connectionAudit.databaseReachable = true;
      console.log('%c[4/5] DATABASE REACHABLE: SUCCESS (Connected and queried public.shops table successfully)', 'color: #10b981; font-weight: bold;');
    }
  } catch (err: any) {
    connectionAudit.databaseReachable = false;
    connectionAudit.rootCause = `Database network request threw unexpected exception: ${err?.message || err}`;
    console.log('%c[4/5] DATABASE REACHABLE: FAILED (Network/Exception)', 'color: #f43f5e; font-weight: bold;');
  }

  // 5. Realtime Connection & Channel Status Check
  try {
    const auditChannel = supabase.channel('audit-connection-channel');
    auditChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'print_jobs' }, () => {})
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          connectionAudit.realtimeConnected = true;
          console.log('%c[5/5] REALTIME SYSTEM: SUBSCRIBED & FULLY FUNCTIONAL', 'color: #10b981; font-weight: bold;');
        } else if (status === 'CLOSED') {
          connectionAudit.realtimeConnected = false;
          console.log('%c[5/5] REALTIME SYSTEM: DISCONNECTED (Subscription closed)', 'color: #f43f5e; font-weight: bold;');
        } else if (status === 'CHANNEL_ERROR') {
          connectionAudit.realtimeConnected = false;
          console.log('%c[5/5] REALTIME SYSTEM: ERROR (Subscription error)', 'color: #f43f5e; font-weight: bold;');
        }
      });
  } catch (err: any) {
    connectionAudit.realtimeConnected = false;
    console.log(`%c[5/5] REALTIME SYSTEM: INITIALIZATION FAILED (${err?.message || err})`, 'color: #f43f5e; font-weight: bold;');
  }
};

// Execute diagnostic audit in the background on module load
if (typeof window !== 'undefined') {
  runConnectivityAudit();
}
