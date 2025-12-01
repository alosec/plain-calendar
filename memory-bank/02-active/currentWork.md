# Current Work - Plain Calendar

**Status**: Phase 1 Complete, Phase 2 In Progress
**Last Updated**: December 1, 2025
**GitHub**: https://github.com/alosec/plain-calendar

## Completed (Phase 1 Foundation)

✅ **Monorepo Setup** (ABG-58)
- pnpm workspaces configured
- packages/core and packages/react created

✅ **Git Configuration** (ABG-57)
- .gitignore for node_modules, dist, coverage
- Repository pushed to GitHub

✅ **Vite Library Mode** (ABG-63)
- Core and React packages configured for library builds
- ESM output with source maps

✅ **Vitest Testing** (ABG-62)
- 52 tests passing in core package
- Test infrastructure ready

✅ **Core Types** (ABG-61)
- CalendarEvent, DateRange, TimeRange
- View types, hook return types
- CalendarConfig with defaults

✅ **timeUtils** (ABG-60) - 20 tests
- parseTimeToMinutes, parseEventTimeToMinutes
- formatHourLabel, formatDisplayTime
- getTimeDuration, isTimeInRange

✅ **dateUtils** (ABG-59) - 32 tests
- addDays, addMonths, startOfDay, startOfWeek
- isSameDay, isToday, isWeekend
- formatScheduledTime, toDateString

✅ **useCalendarState** (ABG-72)
- Calendar navigation state management
- Supports day/week/month/agenda views
- Configurable week start and days to show

## Next Up (Phase 2 Hooks)

Priority order for remaining hooks:

1. **useTimeRange** (calendar-smz/ABG-70) - Time range calculations
2. **useEventLayout** (calendar-09j/ABG-71) - Event positioning algorithm
3. **useEventsMap** (calendar-7w9) - Events by date mapping
4. **useTimeAxis** (calendar-ctq) - Time axis labels
5. **useGridLines** (calendar-0x2/ABG-65) - Grid line generation
6. **useCurrentTimeIndicator** (calendar-8qv/ABG-64) - "Now" line
7. **useDateCache** (calendar-ffl) - Date object caching
8. **useTimeProportionalLayout** (calendar-2f8/ABG-69) - Y-position from time

## Issue Tracking

- **Beads**: `cd ~/code/plain-calendar && bd ready`
- **Linear**: Project `plain-calendar` in ABG-personal

## Quick Commands

```bash
cd ~/code/plain-calendar
pnpm test           # Run all tests
pnpm build          # Build all packages
bd ready            # See next tasks
bd update <id> --status in_progress
bd close <id> -r "reason"
```
