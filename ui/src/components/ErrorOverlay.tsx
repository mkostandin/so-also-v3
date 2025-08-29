import { useState, useEffect } from 'react';

interface ErrorOverlayProps {
  error?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorOverlay({ error, onRetry, onDismiss }: ErrorOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show overlay if there's an error
    if (error) {
      setIsVisible(true);
    }
  }, [error]);

  // Also show overlay if no content loads within 5 seconds (white screen detection)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if we're on mobile and main content hasn't loaded
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const hasContent = document.querySelector('[data-loaded="true"]');

      if (isMobile && !hasContent) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-red-50 dark:bg-red-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error || "The app failed to load properly. This might be due to mobile browser limitations."}
        </p>

        <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded">
          <div>Device: {navigator.userAgent.split(' ').pop()}</div>
          <div>Time: {new Date().toLocaleTimeString()}</div>
          <div>Route: {window.location.pathname}</div>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={() => {
                setIsVisible(false);
                onRetry();
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}

          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          <p>If this persists, try refreshing the page or use a different browser.</p>
        </div>
      </div>
    </div>
  );
}
