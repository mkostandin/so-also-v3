import { useState } from 'react';
import { useMobileDebug } from '@/hooks/useMobileDebug';

interface MobileDebugPanelProps {
  className?: string;
}

export default function MobileDebugPanel({ className = '' }: MobileDebugPanelProps) {
  const { debugState, clearError, isMobile } = useMobileDebug();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show on mobile devices
  if (!isMobile) return null;

  const getStatusColor = () => {
    if (debugState.error) return 'bg-red-500';
    if (debugState.isLoading) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (debugState.error) return 'Error';
    if (debugState.isLoading) return 'Loading';
    return 'OK';
  };

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      {/* Status Indicator */}
      <div
        className={`${getStatusColor()} text-white px-3 py-2 rounded-full shadow-lg cursor-pointer flex items-center gap-2`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">{getStatusText()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 min-w-64 max-w-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Debug Info</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{debugState.currentRoute}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Action:</span>
                <span className="text-gray-900 dark:text-gray-100">{debugState.lastAction}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Device:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {debugState.deviceInfo.screenSize}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {Math.round((Date.now() - debugState.startTime) / 1000)}s
                </span>
              </div>
            </div>

            {debugState.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error Detected</p>
                    <p className="text-red-700 dark:text-red-300 text-xs mt-1">{debugState.error}</p>
                  </div>
                </div>
                <button
                  onClick={clearError}
                  className="mt-2 w-full bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700 transition-colors"
                >
                  Clear Error
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/app/map'}
                className="flex-1 bg-green-600 text-white text-xs py-2 px-3 rounded hover:bg-green-700 transition-colors"
              >
                Go to Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
