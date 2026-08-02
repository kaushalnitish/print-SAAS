export interface DeveloperCredentials {
  email: string;
  passcode: string;
}

export interface DeveloperSession {
  email: string;
  loggedIn: boolean;
  loggedInAt: number;
}

const DEFAULT_DEV_CREDENTIALS: DeveloperCredentials = {
  email: 'developer@printflow.local',
  passcode: 'developer123'
};

const DEV_CREDS_KEY = 'printflow_dev_credentials';
const DEV_SESSION_KEY = 'printflow_developer_session';
const IMPERSONATED_SHOP_KEY = 'printflow_impersonated_shop_id';

export const developerAuthService = {
  // Get current stored credentials or default
  getCredentials(): DeveloperCredentials {
    try {
      const stored = localStorage.getItem(DEV_CREDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && parsed.passcode) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse developer credentials:', e);
    }
    return DEFAULT_DEV_CREDENTIALS;
  },

  // Update credentials
  updateCredentials(newEmail: string, newPasscode: string): boolean {
    if (!newEmail || !newPasscode || newPasscode.length < 4) {
      return false;
    }
    const creds: DeveloperCredentials = {
      email: newEmail.trim().toLowerCase(),
      passcode: newPasscode
    };
    try {
      localStorage.setItem(DEV_CREDS_KEY, JSON.stringify(creds));
      // Update session if logged in
      const session = this.getSession();
      if (session) {
        session.email = creds.email;
        localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
      }
      return true;
    } catch (e) {
      console.error('Failed to save developer credentials:', e);
      return false;
    }
  },

  // Authenticate developer login
  login(email: string, passcode: string): boolean {
    const creds = this.getCredentials();
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail === creds.email && passcode === creds.passcode) {
      const session: DeveloperSession = {
        email: cleanEmail,
        loggedIn: true,
        loggedInAt: Date.now()
      };
      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
      localStorage.setItem('printflow_admin_auth', 'true');
      localStorage.setItem('printflow_user_role', 'developer');
      return true;
    }
    return false;
  },

  // Get active session
  getSession(): DeveloperSession | null {
    try {
      const stored = localStorage.getItem(DEV_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DeveloperSession;
        if (parsed && parsed.loggedIn) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse developer session:', e);
    }
    return null;
  },

  // Check if developer is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  // Logout developer
  logout(): void {
    localStorage.removeItem(DEV_SESSION_KEY);
    localStorage.removeItem('printflow_admin_auth');
    localStorage.removeItem(IMPERSONATED_SHOP_KEY);
    if (localStorage.getItem('printflow_user_role') === 'developer') {
      localStorage.removeItem('printflow_user_role');
    }
  },

  // Impersonation helpers
  setImpersonatedShop(shopId: string): void {
    localStorage.setItem(IMPERSONATED_SHOP_KEY, shopId);
  },

  getImpersonatedShop(): string | null {
    return localStorage.getItem(IMPERSONATED_SHOP_KEY);
  },

  clearImpersonatedShop(): void {
    localStorage.removeItem(IMPERSONATED_SHOP_KEY);
  }
};
