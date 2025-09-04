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
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex justify-start">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
          className="mobile-touch-button event-header-back-btn bg-gray-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 active:bg-gray-800 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 touch-manipulation select-none min-h-[48px] min-w-[48px] flex items-center justify-center relative z-[60] shadow-sm"
          title="Go back to So Also main list"
          aria-label="Go back to So Also main list"
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          ← Back to So Also
        </button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
      </div>
    </div>
  );
}
