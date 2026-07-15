import React, { createContext, useContext, useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';

interface NetworkStatusContextType {
  isOnline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 bg-red-600 text-white text-center py-2 px-4 z-[99999] text-xs font-semibold tracking-wide shadow-md flex items-center justify-center gap-2 animate-slide-down">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>You are currently offline. Running in local fallback/offline mode.</span>
        </div>
      )}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
};
export default NetworkStatusProvider;
