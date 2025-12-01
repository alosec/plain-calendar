# Plain Calendar - Agent Context

## Project Overview
Headless React calendar component library - the "TanStack Table of calendars". Extracted patterns from PediCalendar (pedicab512).

## Issue Tracking
- **Local**: Beads with `calendar-` prefix. Run `bd list` or `bd ready`
- **Linear**: Project `plain-calendar` in ABG-personal workspace
- **Ongoing**: ABG-55 tracks overall progress

## Quick Start
```bash
cd ~/code/plain-calendar
bd ready                    # See unblocked issues
bd list                     # All issues
bd show calendar-XXX        # Issue details
bd update calendar-XXX --status in_progress
bd close calendar-XXX -r "Completed: description"
```

## Implementation Order

### Phase 1: Foundation (Do First)
1. `calendar-uzt` - pnpm workspaces monorepo
2. `calendar-57z` - Git + .gitignore
3. `calendar-b88` - Vite library mode
4. `calendar-yfm` - Vitest setup
5. `calendar-ki7` - Core TypeScript types
6. `calendar-0vu` - timeUtils extraction
7. `calendar-3t7` - dateUtils extraction

### Phase 2: Hooks
All `useXxx` hooks - see `bd list` for P2 issues

### Phase 3: Components + Demo
React components + Astro demo app

### Phase 4: Polish
E2E tests, CI/CD, docs, npm publishing

## Architecture

### Monorepo Structure
```
plain-calendar/
├── packages/
│   ├── core/          # Pure TS utilities, types
│   └── react/         # React hooks + components
├── demo/              # Astro demo app
├── tests/             # E2E tests
└── pnpm-workspace.yaml
```

### Key Patterns
- **Headless**: Logic in hooks, styling optional
- **Composable**: Small focused hooks
- **Type-safe**: Full TypeScript inference
- **Accessible**: ARIA-compliant

## Source Material
Extract from `~/code/pedicab512/src/components/schedule/`:
- `PediCalendar.tsx` - Main calendar component
- `Timeline.tsx` - Day timeline view
- `WeekView.tsx` - Week grid view

## Testing Strategy
- **Unit**: Vitest for hooks and utilities
- **E2E**: Playwright for demo app views
- **Pattern**: Test each hook/component before moving on

## Workflow
1. Pick highest priority unblocked issue (`bd ready`)
2. Mark in progress (`bd update <id> --status in_progress`)
3. Implement with tests
4. Commit with meaningful message
5. Close issue (`bd close <id> -r "reason"`)
6. Repeat

## Dependencies
- React 19+ (peer)
- TypeScript 5+
- Vite (build)
- Vitest (test)
- pnpm (package manager)
