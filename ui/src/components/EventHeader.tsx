import React from 'react';

/**
 * Props for the EventHeader component
 * @interface EventHeaderProps
 */
interface EventHeaderProps {
  /** The name/title of the event to display */
  name: string;
  /** Callback function to handle back navigation */
  onBack: () => void;
}

/**
 * Header component for the event details page containing the back button and event title.
 * Provides consistent navigation and branding across the event details view.
 *
 * @param props Component props
 * @returns React component
 */
export default function EventHeader({ name, onBack }: EventHeaderProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }}
        className="mobile-touch-button bg-gray-600 text-white px-4 py-3 rounded text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 touch-manipulation select-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        title="Go back to So Also main list"
        aria-label="Go back to So Also main list"
      >
        ← Back to So Also
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
      </div>
    </div>
  );
}
