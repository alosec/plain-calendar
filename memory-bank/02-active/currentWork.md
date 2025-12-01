# Current Work - Plain Calendar

**Status**: Phases 1-3 Complete, Demo Deployed
**Last Updated**: December 1, 2025
**GitHub**: https://github.com/alosec/plain-calendar
**Live Demo**: https://plain-cal-demo.pages.dev

## Project Summary

plain-calendar is a headless React calendar component library - the "TanStack Table of calendars". Provides logic and structure, you provide the styling.

### Completed ✅

**Phase 1: Foundation**
- pnpm monorepo (packages/core, packages/react)
- Vite library mode + Vitest testing
- Core TypeScript types
- timeUtils and dateUtils (52 tests)

**Phase 2: Hooks (9 hooks)**
- useCalendarState - Navigation and date state
- useTimeRange - Visible time range calculation
- useEventLayout - Event positioning with overlap handling
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

**Demo Site**
- Deployed to Cloudflare Pages
- Day/Week/Month views with navigation
- Realistic mock schedule data
- Screenshot captured for README

### Test Coverage
- 71 passing tests (52 core + 19 react)

### Build Outputs
- @plain-calendar/core: 8.4kb (gzip: 2.2kb)
- @plain-calendar/react: 71.5kb (gzip: 15.5kb)

## Remaining Work (Phase 4)

### High Priority
- npm publishing configuration (calendar-mxn)
- README documentation polish (calendar-9vh) ✅ Done

### Medium Priority
- GitHub Actions CI pipeline (calendar-1h1)
- Astro demo app (calendar-2kk)

### Lower Priority
- Playwright E2E tests (calendar-3g1, calendar-7hg, etc.)
- CONTRIBUTING.md (calendar-075)

## Quick Commands

```bash
# Development
cd ~/code/plain-calendar
pnpm test           # Run all tests (71 passing)
pnpm build          # Build all packages

# Demo deployment
cd ~/code/plain-cal-demo
npm run build
wrangler pages deploy dist/ --project-name=plain-cal-demo

# Issue tracking
cd ~/code/plain-calendar
bd ready            # See next tasks
```

## Key Decisions Made

1. **Headless-first**: All components use render props for full customization
2. **Monorepo**: Separate core (pure TS) from react packages
3. **No external deps**: Only React as peer dependency
4. **TypeScript only**: No JavaScript distribution
5. **Extracted patterns**: Based on production PediCalendar code
