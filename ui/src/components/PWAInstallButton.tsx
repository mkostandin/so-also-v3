import React, { useState, useEffect } from 'react';
import { isPWAInstalled, installPWA } from '@/lib/session-utils';
import { useToastHook } from '@/hooks/use-toast';

/**
 * Props for the PWAInstallButton component
 * @interface PWAInstallButtonProps
 */
interface PWAInstallButtonProps {
  /**
   * Render prop function that provides PWA installation state and handlers
   * @param props Object containing isAppInstalled boolean and handleInstall function
   */
  children: (props: {
    /** Whether the PWA is already installed */
    isAppInstalled: boolean;
    /** Function to trigger PWA installation */
    handleInstall: () => Promise<void>;
  }) => React.ReactNode;
}

/**
 * Render prop component that manages PWA installation state and provides installation handlers.
 * Handles the browser's beforeinstallprompt event and provides user-friendly installation flow.
 *
 * Features:
 * - Detects if PWA is already installed
 * - Manages deferred installation prompt from browser
 * - Provides installation handler with success/error feedback
 * - Integrates with toast notification system
 *
 * @param props Component props containing the render prop function
 * @returns Render prop result with PWA installation state and handlers
 */
export default function PWAInstallButton({ children }: PWAInstallButtonProps) {
  const { toast } = useToastHook();
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    setIsAppInstalled(isPWAInstalled());

    // Listen for PWA installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isAppInstalled) {
      toast({
        title: 'App Already Installed',
        description: 'The app is already installed on your device.',
        variant: 'success'
      });
      return;
    }

    const success = await installPWA(deferredPrompt);
    if (success) {
      setDeferredPrompt(null);
      toast({
        title: 'App Installed',
        description: 'The app has been successfully installed!',
        variant: 'success'
      });
    } else {
      toast({
        title: 'Installation Failed',
        description: 'Failed to install the app. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return <>{children({ isAppInstalled, handleInstall })}</>;
}
