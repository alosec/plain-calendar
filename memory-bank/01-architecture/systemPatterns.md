# System Architecture Patterns

## Headless Component Pattern
```
UI Layer (user provides) → Primitives (we provide) → Logic Hooks (we provide)
```

## Core Primitives
- `<Calendar />` - Month/week/day view container
- `<EventList />` - Timeline and agenda displays
- `<DatePicker />` - Date selection with constraints
- `<TimeSlot />` - Time range selection components

## Hook API
- `useCalendarState(config)` - Calendar navigation and date management
- `useEventFilters(events, filters)` - Event filtering and sorting
- `useTimezone(timezone)` - Timezone conversion utilities
- `useRecurrence(pattern)` - Recurring event calculations

## Styling Strategy
- **Default**: No styles (headless)
- **Optional**: `plain-calendar/themes` for pre-built themes
- **Customization**: CSS variables + className props

## State Management
- Uncontrolled by default (internal state)
- Controlled mode via props (external state)
- No global state - purely component-level

## Patterns from PediCalendar
- Event conflict detection algorithms
- Timezone handling utilities
- Date parsing and formatting
- Calendar view navigation logic
