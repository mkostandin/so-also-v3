/**
 * Touch debugging utilities to measure touch response times
 */

interface TouchTiming {
  touchStart: number;
  touchEnd: number;
  click: number;
  navigation: number;
}

class TouchDebugger {
  private timings: TouchTiming[] = [];
  private isEnabled = false;

  enable() {
    this.isEnabled = true;
    console.log('[Touch Debug] Touch debugging enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('[Touch Debug] Touch debugging disabled');
  }

  recordTouchStart() {
    if (!this.isEnabled) return;
    const current = this.getCurrentTiming();
    if (current) {
      current.touchStart = Date.now();
    } else {
      this.timings.push({
        touchStart: Date.now(),
        touchEnd: 0,
        click: 0,
        navigation: 0
      });
    }
  }

  recordTouchEnd() {
    if (!this.isEnabled) return;
    const current = this.getCurrentTiming();
    if (current) {
      current.touchEnd = Date.now();
    }
  }

  recordClick() {
    if (!this.isEnabled) return;
    const current = this.getCurrentTiming();
    if (current) {
      current.click = Date.now();
    }
  }

  recordNavigation() {
    if (!this.isEnabled) return;
    const current = this.getCurrentTiming();
    if (current) {
      current.navigation = Date.now();
      this.logTiming(current);
      this.clearCurrentTiming();
    }
  }

  private getCurrentTiming(): TouchTiming | null {
    return this.timings[this.timings.length - 1] || null;
  }

  private clearCurrentTiming() {
    this.timings.pop();
  }

  private logTiming(timing: TouchTiming) {
    const touchToClick = timing.click - timing.touchStart;
    const touchToNavigation = timing.navigation - timing.touchStart;
    const clickToNavigation = timing.navigation - timing.click;

    console.log('[Touch Debug] Timing Analysis:', {
      'Touch Start to Click': `${touchToClick}ms`,
      'Touch Start to Navigation': `${touchToNavigation}ms`,
      'Click to Navigation': `${clickToNavigation}ms`,
      'Total Touch Delay': touchToNavigation > 100 ? '⚠️ SLOW' : '✅ FAST'
    });
  }

  getTimings() {
    return [...this.timings];
  }

  clearTimings() {
    this.timings = [];
  }
}

// Global instance
export const touchDebugger = new TouchDebugger();

// Enable debugging in development
if (import.meta.env.DEV) {
  touchDebugger.enable();

  // Add to window for easy access
  (window as any).touchDebug = touchDebugger;
}
