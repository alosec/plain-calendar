# Current Work - Plain Calendar

**Status**: Phase 1-3 Complete, Phase 4 In Progress
**Last Updated**: December 1, 2025
**GitHub**: https://github.com/alosec/plain-calendar

## Completed

### Phase 1: Foundation ✅
- Monorepo with pnpm workspaces (packages/core, packages/react)
- Vite library mode + Vitest testing
- Core TypeScript types
- timeUtils and dateUtils with 52 tests

### Phase 2: Hooks ✅
- useCalendarState - Calendar navigation state
- useTimeRange - Visible time range calculation
- useEventLayout - Event positioning with overlap handling
- useEventsMap - Events grouped by date
- useTimeAxis - Time axis labels (12h/24h)
- useGridLines - Grid line generation
- useCurrentTimeIndicator - "Now" line tracking
- useDateCache - Date object caching (LRU)
- useTimeProportionalLayout - Time to Y-position conversion
- 19 hook tests (71 total)

### Phase 3: Components ✅
- EventBlock - Headless event display
- Timeline - Day timeline view
- WeekView - 7-day week layout
- Calendar - Month grid view
- Mock data generators

## Current Focus

### Demo Site ✅ DEPLOYED
**Live**: https://plain-cal-demo.pages.dev

**Deployment Pattern** (manual, not git-linked):
```bash
cd ~/code/plain-cal-demo
npm run build
wrangler pages deploy dist/ --project-name=plain-cal-demo
```

**Features**:
- Day (Timeline), Week, Month views
- Navigation (prev/next/today)
- Event click handling
- Realistic mock schedule data
- Responsive, clean styling

## Remaining Issues

### Phase 4: Polish (P3-P4)
- Astro demo app (calendar-2kk)
- Demo pages for all views (calendar-2nc)
- Playwright E2E infrastructure (calendar-3g1)
- Test fixtures (calendar-a3t)
- AuthGate component (calendar-k6a)

### Phase 4: CI/CD & Docs (P4)
- GitHub Actions CI (calendar-1h1)
- GitHub Actions E2E (calendar-8ul)
- README docs (calendar-9vh)
- CONTRIBUTING.md (calendar-075)
- npm publishing config (calendar-mxn)
- E2E tests (calendar-7hg, calendar-cpq, calendar-upu, calendar-9rm, calendar-86s, calendar-xbi)

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
bd update <id> --status in_progress
bd close <id> -r "reason"
```

## Build Outputs
- @plain-calendar/core: 8.4kb (gzip: 2.2kb)
- @plain-calendar/react: 71.5kb (gzip: 15.5kb)
