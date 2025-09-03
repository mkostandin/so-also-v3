import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Info } from 'lucide-react';

/**
 * Props for the MobileTooltip component
 * @interface MobileTooltipProps
 */
interface MobileTooltipProps {
  /** The trigger element that opens the tooltip */
  children: React.ReactNode;
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** Optional accessibility label for screen readers */
  ariaLabel?: string;
}

/**
 * Mobile-optimized tooltip component that provides touch-friendly interactions.
 * Designed specifically for mobile devices with tap-to-open/close behavior and scroll/outside-tap closing.
 *
 * Features:
 * - Touch-optimized interactions (tap to open/close)
 * - Automatic closing on scroll or outside tap
 * - Viewport-aware sizing with responsive width constraints
 * - Proper accessibility with ARIA labels
 * - React refs for reliable click outside detection
 * - Capture phase event listeners for better performance
 *
 * @param props Component props
 * @returns React component (only renders on touch devices)
 */
export default function MobileTooltip({ children, content, ariaLabel = "Information" }: MobileTooltipProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Detect if device is touch-enabled (mobile)
  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const closeTooltip = useCallback(() => {
    setIsTooltipOpen(false);
  }, []);

  useEffect(() => {
    if (!isTouchDevice()) return;

    // Mobile-specific: close tooltip on scroll or outside tap
    const handleScroll = () => closeTooltip();
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Element;
      // Primary detection: Use React refs for reliable element detection
      const container = containerRef.current;
      const trigger = triggerRef.current;

      if (container && trigger) {
        // Check if click is outside both the tooltip container and trigger button
        if (!container.contains(target) && !trigger.contains(target)) {
          closeTooltip();
        }
      } else {
        // Fallback detection: Use CSS class selectors if refs are unavailable
        // This ensures robustness even if refs fail to attach properly
        if (!target.closest('.mobile-tooltip-container') && !target.closest('.mobile-tooltip-trigger')) {
          closeTooltip();
        }
      }
    };

    // Add event listeners with capture phase for better reliability
    document.addEventListener('click', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [closeTooltip, isTouchDevice]);

  if (!isTouchDevice()) {
    // For desktop, just return the children without tooltip functionality
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="relative mobile-tooltip-container">
      <button
        ref={triggerRef}
        className="mobile-tooltip-trigger"
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setIsTooltipOpen(!isTooltipOpen);
        }}
      >
        {children}
      </button>
      {isTooltipOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-[min(24rem,calc(100vw-3rem))] text-sm leading-relaxed">
            {content}
            <div className="absolute top-full right-4 transform -mt-1">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
