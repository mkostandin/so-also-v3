import { useEffect, useRef, useState } from 'react';

type EventInfo = {
  type: string;
  defaultPrevented: boolean;
  targetTag: string;
  targetClasses: string;
  scrollableTag?: string;
  scrollableClasses?: string;
};

function getNearestScrollable(el: Element | null): Element | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node as Element);
    const overflowY = style.overflowY;
    const overflow = style.overflow;
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflow === 'auto' ||
      overflow === 'scroll'
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

export default function TouchScrollDebugger() {
  const [info, setInfo] = useState<EventInfo | null>(null);
  const targetBoxRef = useRef<HTMLDivElement | null>(null);
  const scrollBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const targetBox = document.createElement('div');
    targetBox.style.cssText =
      'position:fixed;z-index:99998;border:2px solid #ef4444;pointer-events:none;background:transparent;';
    document.body.appendChild(targetBox);
    targetBoxRef.current = targetBox;

    const scrollBox = document.createElement('div');
    scrollBox.style.cssText =
      'position:fixed;z-index:99997;border:2px dashed #3b82f6;pointer-events:none;background:transparent;';
    document.body.appendChild(scrollBox);
    scrollBoxRef.current = scrollBox;

    const updateBoxes = (targetEl: Element | null, scrollEl: Element | null) => {
      if (targetEl && targetBoxRef.current) {
        const r = (targetEl as Element).getBoundingClientRect();
        targetBoxRef.current.style.left = r.left + 'px';
        targetBoxRef.current.style.top = r.top + 'px';
        targetBoxRef.current.style.width = r.width + 'px';
        targetBoxRef.current.style.height = r.height + 'px';
        targetBoxRef.current.style.display = 'block';
      }
      if (scrollEl && scrollBoxRef.current) {
        const r2 = (scrollEl as Element).getBoundingClientRect();
        scrollBoxRef.current.style.left = r2.left + 'px';
        scrollBoxRef.current.style.top = r2.top + 'px';
        scrollBoxRef.current.style.width = r2.width + 'px';
        scrollBoxRef.current.style.height = r2.height + 'px';
        scrollBoxRef.current.style.display = 'block';
      }
    };

    const handle = (ev: Event) => {
      const target = ev.target as Element | null;
      const scrollable = getNearestScrollable(target);
      const next: EventInfo = {
        type: ev.type,
        defaultPrevented: (ev as any).defaultPrevented || false,
        targetTag: target ? target.tagName.toLowerCase() : 'null',
        targetClasses: target?.getAttribute('class') || '',
        scrollableTag: scrollable ? scrollable.tagName.toLowerCase() : undefined,
        scrollableClasses: (scrollable as Element)?.getAttribute?.('class') || undefined,
      };
      setInfo(next);
      updateBoxes(target, scrollable);
    };

    const touchOpts: AddEventListenerOptions = { passive: false };
    document.addEventListener('touchstart', handle, touchOpts);
    document.addEventListener('touchmove', handle, touchOpts);
    document.addEventListener('wheel', handle, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handle as any, touchOpts);
      document.removeEventListener('touchmove', handle as any, touchOpts);
      document.removeEventListener('wheel', handle as any);
      if (targetBoxRef.current) document.body.removeChild(targetBoxRef.current);
      if (scrollBoxRef.current) document.body.removeChild(scrollBoxRef.current);
    };
  }, []);

  return (
    <div className="fixed top-2 right-2 z-[99999] max-w-[320px] pointer-events-auto">
      <div className="bg-black/70 text-white text-xs rounded-md p-3 space-y-1">
        <div className="font-semibold">Touch Scroll Debugger</div>
        {info ? (
          <div className="space-y-1">
            <div>Event: {info.type} {info.defaultPrevented ? '(defaultPrevented)' : ''}</div>
            <div>Target: {info.targetTag} · {info.targetClasses}</div>
            <div>Scrollable: {info.scrollableTag} · {info.scrollableClasses}</div>
            <div className="opacity-70">Red: target · Blue: nearest scrollable</div>
          </div>
        ) : (
          <div className="opacity-70">Interact to see details…</div>
        )}
      </div>
    </div>
  );
}


