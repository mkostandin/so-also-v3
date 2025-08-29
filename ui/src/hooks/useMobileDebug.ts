import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface DebugState {
  currentRoute: string;
  isLoading: boolean;
  lastAction: string;
  error: string | null;
  startTime: number;
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    screenSize: string;
  };
}

export function useMobileDebug() {
  const location = useLocation();
  const [debugState, setDebugState] = useState<DebugState>({
    currentRoute: location.pathname,
    isLoading: false,
    lastAction: 'Page loaded',
    error: null,
    startTime: Date.now(),
    deviceInfo: {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    }
  });

  const updateDebugState = useCallback((updates: Partial<DebugState>) => {
    setDebugState(prev => ({ ...prev, ...updates, lastAction: updates.lastAction || prev.lastAction }));
  }, []);

  const logAction = useCallback((action: string) => {
    console.log(`[MobileDebug] ${action}`);
    updateDebugState({ lastAction: action });
  }, [updateDebugState]);

  const setLoading = useCallback((loading: boolean, action?: string) => {
    updateDebugState({
      isLoading: loading,
      lastAction: action || (loading ? 'Loading started' : 'Loading completed')
    });
  }, [updateDebugState]);

  const setError = useCallback((error: string) => {
    console.error(`[MobileDebug] Error: ${error}`);
    updateDebugState({ error, isLoading: false });
  }, [updateDebugState]);

  const clearError = useCallback(() => {
    updateDebugState({ error: null });
  }, [updateDebugState]);

  // Track route changes
  useEffect(() => {
    updateDebugState({
      currentRoute: location.pathname,
      lastAction: `Navigated to ${location.pathname}`,
      startTime: Date.now()
    });
  }, [location.pathname, updateDebugState]);

  // Track window errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(`JavaScript Error: ${event.message} at ${event.filename}:${event.lineno}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(`Unhandled Promise Rejection: ${event.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setError]);

  // White screen detection
  useEffect(() => {
    const checkForWhiteScreen = () => {
      const body = document.body;
      const hasContent = body.children.length > 0 && !body.classList.contains('empty');

      if (!hasContent && debugState.deviceInfo.isMobile) {
        setError('White screen detected - no content loaded');
      }
    };

    const timer = setTimeout(checkForWhiteScreen, 5000);
    return () => clearTimeout(timer);
  }, [debugState.deviceInfo.isMobile, setError]);

  return {
    debugState,
    logAction,
    setLoading,
    setError,
    clearError,
    isMobile: debugState.deviceInfo.isMobile
  };
}
