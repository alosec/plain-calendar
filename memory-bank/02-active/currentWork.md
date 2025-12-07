# Current Work - Plain Calendar

**Status**: Phases 1-4 Complete, Event Stack Available
**Last Updated**: December 7, 2025
**GitHub**: https://github.com/alosec/plain-calendar
**Live Demo**: https://plain-cal-demo.pages.dev

## Project Summary

plain-calendar is a headless React calendar component library - the "TanStack Table of calendars". Provides logic and structure, you provide the styling.

### Completed ✅

**Phase 1: Foundation**
- pnpm monorepo (packages/core, packages/react)
- Vite library mode + Vitest testing
- Core TypeScript types
- timeUtils and dateUtils

**Phase 2: Hooks (10 hooks)**
- useCalendarState - Navigation and date state
- useTimeRange - Visible time range calculation
- useEventLayout - Event positioning with overlap handling (columns)
- useEventStack - Priority-based visual stacking (NEW)
- useEventsMap - Events grouped by date
- useTimeAxis - Time axis labels (12h/24h)
- useGridLines - Grid line generation
- useCurrentTimeIndicator - "Now" line tracking
- useDateCache - Date object caching (LRU)
- useTimeProportionalLayout - Time to Y-position

**Phase 3: Components (4 components)**
- EventBlock - Headless event display
- Timeline - Day timeline view
- WeekView - 7-day week layout
- Calendar - Month grid view

**Phase 4: Event Stacking (Dec 7, 2025)**
- stackUtils.ts - Pure stacking algorithm
- findOverlapGroups, calculateContainment, getStackInsets
- useEventStack hook wrapping algorithm
- 90 tests total (71 core + 19 react)

### Build Outputs
- @plain-calendar/core: 12.8kb (gzip: 3.3kb)
- @plain-calendar/react: 71.9kb (gzip: 15.7kb)

## Usage Notes

**useEventStack** - Available but not currently used in pedicalendar. Visual containment stacking was explored but column-based layout (useEventLayout) provides cleaner UX. Stacking preserved for future use cases.

## Quick Commands

```bash
cd ~/code/plain-calendar
pnpm test           # Run all tests (90 passing)
pnpm build          # Build all packages
```
