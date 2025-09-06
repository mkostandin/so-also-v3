### Feature 0046 – Code Review: Restore mobile scrolling on List view and dropdown list

#### Summary
- The implementation largely matches the plan and resolves the original mobile scrolling issues. The dropdown menu scrolls reliably with viewport-relative height and proper touch handling. Global utilities for touch/scroll were added and applied.
- One important follow-up: List view currently introduces a nested scroll container while `MapIndex` is also the scroll owner. This can cause sticky headers to behave inconsistently and can reintroduce mobile nested scroll edge cases.

#### What matches the plan
- App shell scroll ownership
  - `ui/src/App.tsx` sets the wrapper as a non-scrolling container (`flex-1 min-h-0 overflow-hidden`).
- Single content scroller in MapIndex
  - `ui/src/routes/MapIndex.tsx` header is sticky and the content container uses: `overflow-y-auto pb-16 scroll-touch scroll-pan-y scrollbar-stable overscroll-none select-auto`.
- Dropdown menu behavior
  - `ui/src/components/CommitteeFilter.tsx` uses `max-h-[60vh] overflow-y-auto scroll-touch scroll-pan-y select-auto` with `z-50`.
- Global CSS utilities for touch/scroll
  - `ui/src/index.css` adds `.scroll-touch`, `.scroll-pan-y`, `.scroll-pan-x`, `.scrollbar-stable`, `.overscroll-none`, and `select-auto`; disables pull-to-refresh on `html, body`.
- Horizontal pan for Event Type filter
  - `ui/src/components/EventTypeFilter.tsx` container includes `scroll-pan-x` alongside horizontal overflow.

#### Issues found
1) Nested scroll containers in List view (risk of sticky misalignment)
   - `MapIndex` is the scroll owner, but `ui/src/routes/ListView.tsx` also defines an inner `div` with `overflow-y-auto`.
   - Structure:
     - sticky filters (sibling)
     - list content `div.flex-1.min-h-0.overflow-y-auto` (nested scroll)
   - Impact: The sticky header may stick relative to the `MapIndex` scroller while the actual scrolling happens in the inner list, leading to subtle inconsistencies on iOS and Android.

2) Aggressive global user-select rule still applied everywhere
   - `ui/src/index.css` retains the global `* { -webkit-user-select: none; user-select: none; }`.
   - While mitigated via `select-auto` on key containers and allowances for inputs, globally disabling selection can still cause subtle touch interactions to be interpreted differently in nested contexts.

3) Minor duplication of event type mapping
   - The display→data mapping exists in both `MapIndex` and `EventTypeFilter`. Not a bug, but it increases maintenance overhead.

#### Recommendations
- Eliminate nested List scroll container to align with “single scroll owner” approach:
  - In `ui/src/routes/ListView.tsx`, remove `overflow-y-auto` from the inner list container and let the `MapIndex` content scroller handle vertical scrolling. Keep the sticky filters as-is; they will stick relative to the `MapIndex` scroller.
  - If keeping a per-view scroller is preferred, then change `MapIndex` content to `overflow-hidden` and make each view (List/Map/Calendar) own its scroll container consistently. Avoid having both scroll simultaneously.

- Narrow the global user-select rule:
  - Replace the global `* { user-select: none; }` with a targeted class (e.g., apply `.mobile-touch-button`/role-based selectors) or limit it to specific interactive controls. Continue to use `select-auto` where normal selection is needed.

- Consolidate event type mapping:
  - Export a single mapping source (e.g., from `EventTypeFilter`) and import it in `MapIndex` to avoid drift.

#### Verification checklist (post-fix)
- iOS Safari/Chrome and Android Chrome:
  - List view: scrolls smoothly with momentum; the sticky filters remain pinned; bottom tabs remain visible; no double scroll.
  - Committee dropdown: scrolls internally; does not block page scroll; long lists behave as expected.
  - Map/Calendar views: no scrolling regressions; tabs remain sticky and tappable.

#### Conclusion
- The primary goals of Feature 0046 are met. Implement the small follow-ups above—especially removing the nested List scroll—to fully align with the single scroll owner pattern and avoid sticky/scroll edge cases on mobile.


