import { RefObject, useEffect } from 'react';

/**
 * Enables touch-driven scrolling on an overflow container by translating touch
 * movement into scrollTop updates. Useful when browsers ignore touch panning
 * due to CSS touch-action conflicts or devtools emulation quirks.
 */
export function useEnableTouchScroll(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let startX = 0;
    let startScrollTop = 0;
    let startScrollLeft = 0;
    let active = false;

    const onTouchStart = (e: TouchEvent) => {
      if (!container) return;
      if (e.touches.length !== 1) return;
      active = true;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startScrollTop = container.scrollTop;
      startScrollLeft = container.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active || !container) return;
      // Prevent default so the browser doesn't treat it as a non-scroll gesture
      // when it fails to detect a valid scrollable ancestor.
      e.preventDefault();
      const dy = e.touches[0].clientY - startY;
      const dx = e.touches[0].clientX - startX;
      // In practice we primarily want vertical scrolling for lists.
      container.scrollTop = startScrollTop - dy;
      // Preserve horizontal if present (e.g., horizontal carousels).
      if (container.scrollWidth > container.clientWidth) {
        container.scrollLeft = startScrollLeft - dx;
      }
    };

    const onTouchEnd = () => {
      active = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart as any);
      container.removeEventListener('touchmove', onTouchMove as any);
      container.removeEventListener('touchend', onTouchEnd as any);
      container.removeEventListener('touchcancel', onTouchEnd as any);
    };
  }, [containerRef]);
}


