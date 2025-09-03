import React from 'react';

interface EventActionsProps {
  onShare: () => void;
  onDirections: () => void;
  copied?: boolean;
}

export default function EventActions({ onShare, onDirections, copied }: EventActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <button
          onClick={onShare}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Share
        </button>
        <button
          onClick={onDirections}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Get Directions
        </button>
      </div>

      {copied && (
        <div className="text-center text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 rounded-lg">
          Link copied to clipboard
        </div>
      )}
    </div>
  );
}
