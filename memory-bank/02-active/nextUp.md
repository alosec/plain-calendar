# Next Up - Plain Calendar

**Updated**: December 1, 2025

## Immediate (Start Now)
1. **calendar-uzt** - Setup monorepo structure with pnpm workspaces
2. **calendar-57z** - Configure Git repository and .gitignore
3. **calendar-32b** - Add dependency tracking between setup issues

## Phase 1 Foundation (This Week)
4. **calendar-b88** - Setup Vite configuration for core library
5. **calendar-yfm** - Setup Vitest for unit testing
6. **calendar-ki7** - Create core TypeScript types
7. **calendar-0vu** - Extract and test timeUtils from PediCalendar
8. **calendar-3t7** - Extract and test dateUtils from PediCalendar

## Phase 2 Core Hooks (After Foundation)
9. **calendar-p02** - Implement useCalendarState hook
10. **calendar-smz** - Implement useTimeRange hook

## Linear Cross-Reference
| Beads ID | Linear ID | Title |
|----------|-----------|-------|
| calendar-uzt | ABG-58 | Setup monorepo structure |
| calendar-57z | ABG-57 | Configure Git repository |
| calendar-32b | ABG-56 | Add dependency tracking |
| calendar-b88 | ABG-63 | Setup Vite configuration |
| calendar-yfm | ABG-62 | Setup Vitest |
| calendar-ki7 | ABG-61 | Create core TypeScript types |
| calendar-0vu | ABG-60 | Extract timeUtils |
| calendar-3t7 | ABG-59 | Extract dateUtils |
| calendar-cb9 | ABG-94 | Vite/React demo repo |

## Command Reference
```bash
# See what's ready
bd ready

# Start working on an issue
bd update calendar-uzt --status in_progress

# Complete an issue
bd close calendar-uzt -r "Monorepo configured with pnpm workspaces"

# Check Linear
linearis issues read ABG-58
```
