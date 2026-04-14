import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [globalRiskLevel, setGlobalRiskLevel] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const evtSourceRef = useRef(null);

  // Subscribe to real-time alert SSE stream
  useEffect(() => {
    const connect = () => {
      const source = new EventSource('/api/alerts/stream');
      evtSourceRef.current = source;

      source.onmessage = (e) => {
        try {
          const alert = JSON.parse(e.data);
          setUnreadCount((c) => c + 1);

          const toastFn =
            alert.severity === 'CRITICAL'
              ? toast.error
              : alert.severity === 'WARNING'
              ? toast
              : toast;

          toastFn(`${alert.title}: ${alert.message}`, { duration: 6000 });
        } catch {
          // ignore malformed messages
        }
      };

      source.onerror = () => {
        source.close();
        // Reconnect after 10 seconds
        setTimeout(connect, 10_000);
      };
    };

    connect();

    return () => {
      evtSourceRef.current?.close();
    };
  }, []);

  return (
    <AppContext.Provider value={{ globalRiskLevel, setGlobalRiskLevel, unreadCount, setUnreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
