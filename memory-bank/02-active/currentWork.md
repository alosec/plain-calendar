# Current Work - Plain Calendar

**Status**: Ready for Self-Driven Implementation
**Last Updated**: December 1, 2025

## Current State
Project is fully planned and tracked in both Beads (local) and Linear (ABG-personal project). Ready for autonomous agent implementation.

## Issue Tracking
- **Beads**: 39 issues with `calendar-` prefix (local tracking)
- **Linear**: Project `plain-calendar` with issues ABG-55 through ABG-94
- **Ongoing Issue**: ABG-55 tracks overall development progress

## Implementation Phases

### Phase 1 - Foundation (P0-P1): 8 issues
Infrastructure and core setup - START HERE
- Monorepo structure (pnpm workspaces)
- Git configuration
- Vite + Vitest setup
- Core TypeScript types
- Date/time utilities extraction

### Phase 2 - Core Hooks (P2): 10 issues
State management and layout algorithms
- useCalendarState, useTimeRange, useEventLayout
- useEventsMap, useDateCache
- useTimeAxis, useGridLines, useCurrentTimeIndicator
- useTimeProportionalLayout
- **NEW**: Vite/React demo repo (calendar-cb9 / ABG-94)

### Phase 3 - Components & Demo (P3): 10 issues
React components and demo application
- Timeline, WeekView, Calendar, EventBlock components
- Astro demo app with all views
- AuthGate with dev bypass
- Mock data generation

### Phase 4 - Testing & Polish (P4): 11 issues
Quality and distribution
- E2E tests for all views
- GitHub Actions CI/CD
- Documentation (README, CONTRIBUTING)
- npm publishing configuration

## Key Decisions
- **Name**: `plain-calendar` (npm package)
- **Architecture**: Headless-first (hooks + unstyled components)
- **TypeScript**: Only (no JS distribution)
- **React**: 19+ (peer dependency)
- **Build**: Vite (library mode)
- **Tests**: Vitest (unit) + Playwright (E2E)
- **Demo**: Astro app with dev flag auth bypass
- **Pattern**: TanStack Table + Radix UI inspired
- **Monorepo**: pnpm workspaces (packages/core, packages/react, demo, tests)

## Build Order (Dependencies)
1. `calendar-uzt` - Monorepo setup (unblocks everything)
2. `calendar-57z` - Git config (unblocks CI/CD)
3. `calendar-b88` + `calendar-yfm` - Vite + Vitest (unblocks implementation)
4. `calendar-ki7` - Core types (unblocks hooks)
5. `calendar-0vu` + `calendar-3t7` - Utils (unblocks hooks)
6. P2 hooks (unblocks components)
7. P3 components + demo
8. P4 testing + polish

## For Autonomous Agent
1. Run `bd ready` to see unblocked issues
2. Work through Phase 1 first (P0-P1 issues)
3. Update issue status with `bd update <id> --status in_progress`
4. Close completed issues with `bd close <id> -r "reason"`
5. Test each component before moving on
6. Commit frequently with meaningful messages

## Relationship to Other Projects
- **PediCalendar** (pedicab512): Source of extracted patterns
- **FreeCalendar**: Future first production consumer
