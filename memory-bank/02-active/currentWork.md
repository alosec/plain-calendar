# Current Work - Plain Calendar

**Status**: Event Stack Feature Complete, Ready for PR
**Last Updated**: December 6, 2025
**GitHub**: https://github.com/alosec/plain-calendar
**Live Demo**: https://plain-cal-demo.pages.dev
**Branch**: feature/event-stack

## Project Summary

plain-calendar is a headless React calendar component library - the "TanStack Table of calendars". Provides logic and structure, you provide the styling.

### Completed ✅

**Phase 1: Foundation**
- pnpm monorepo (packages/core, packages/react)
- Vite library mode + Vitest testing
- Core TypeScript types
- timeUtils and dateUtils (52 tests)

**Phase 2: Hooks (10 hooks)**
- useCalendarState - Navigation and date state
- useTimeRange - Visible time range calculation
- useEventLayout - Event positioning with overlap handling
- useEventStack - **NEW** Priority-based event stacking
- useEventsMap - Events grouped by date
- useTimeAxis - Time axis labels (12h/24h)
- useGridLines - Grid line generation
- useCurrentTimeIndicator - "Now" line tracking
- useDateCache - Date object caching (LRU)
- useTimeProportionalLayout - Time to Y-position

**Phase 3: Components (5 components)**
- EventBlock - Headless event display
- Timeline - Day timeline view
- WeekView - 7-day week layout
- Calendar - Month grid view
- StackedEventGroup - **NEW** Container for stacked events

**Phase 4: Event Stacking (NEW)**
- stackUtils.ts - Core stacking algorithm
  - eventsOverlap() - Detect overlapping events
  - groupOverlappingEvents() - Cluster overlapping events
  - calculateStackLayers() - Assign layers by priority
  - stackEvents() - Main API function
- StackedEvent type with stackLayer, stackOffset, parent, children
- 22 tests for stacking algorithm
- 8 tests for useEventStack hook

**Demo Site**
- Deployed to Cloudflare Pages
- Day/Week/Month views with navigation
- Screenshot: https://screenshots-5wx.pages.dev/plain-cal-demo-before.png

### Test Coverage
- 101 passing tests (74 core + 27 react)

### Build Outputs
- @plain-calendar/core: 11.4kb (gzip: 3.0kb) - includes stack utils
- @plain-calendar/react: 73kb (gzip: 15.9kb)

## Current Branch

`feature/event-stack` is ready for PR with:
- Core stacking algorithm
- React hook and component
- Full test coverage
- Updated documentation

## Related Issues

- GitHub: https://github.com/alosec/plain-calendar/issues/1
- Linear: ABG-169

## Next Steps

1. Create PR for event-stack branch
2. Publish to npm (need package.json config)
3. Update pedicalendar to use published package

## Quick Commands

```bash
# Development
cd ~/code/plain-calendar-event-stack
pnpm test           # Run all tests (101 passing)
pnpm build          # Build all packages

# Demo deployment
cd ~/code/plain-cal-demo
npm run build
wrangler pages deploy dist/ --project-name=plain-cal-demo
```

## Key Decisions Made

1. **Headless-first**: All components use render props for full customization
2. **Monorepo**: Separate core (pure TS) from react packages
3. **No external deps**: Only React as peer dependency
4. **TypeScript only**: No JavaScript distribution
5. **Extracted patterns**: Based on production PediCalendar code
6. **Priority-based stacking**: Lower priority number = base layer (matches venue priority)
