# PediCalendar V2 Analysis: Calendar Primitives for Plain Calendar

**Analysis Date:** 2025-11-20
**Source:** `/home/alex/code/pedicalendar_v2`
**Purpose:** Extract reusable patterns and primitives for Plain Calendar headless library

---

## 1. Overview

PediCalendar V2 is an event aggregation calendar built with Astro, React, and Supabase. It implements three calendar view modes (Timeline/Day, Weekly, Monthly) with sophisticated event rendering, time-based positioning, and infinite scroll capabilities.

**Key Architectural Strengths:**
- Clean separation of state management (hooks) from presentation (components)
- Consistent time calculation utilities across all views
- Dynamic timeframe calculation based on event data
- Efficient event grouping and conflict detection algorithms
- Time-proportional event rendering with configurable scales

**Technology Stack:**
- React 18 with TypeScript
- TanStack Query for data fetching and caching
- Context API for state distribution
- CSS with dynamic custom properties for venue theming

---

## 2. Component Architecture

### 2.1 View Controllers (Orchestration Pattern)

Each calendar view follows a consistent controller pattern that separates concerns:

**TimelineController** (`/src/components/TimelineCalendar/TimelineController.tsx`)
- Manages date state via `useDateManager` hook
- Fetches events with `useInfiniteEventsQuery` (infinite scroll)
- Fetches per-date timeframes with `useTimeFramesForDates`
- Provides context to child components via `CalendarProvider`
- Handles window resize events for responsive behavior

**WeeklyController** (`/src/components/WeeklyCalendar/WeeklyController.tsx`)
- Uses `useWeekNavigation` for week-based date management
- Uses `useWeekData` for fetching week's events
- Simpler than Timeline (no infinite scroll)
- Fixed 7-day range

**Key Pattern:** Controller components handle all data fetching and state orchestration, passing clean props to presentation components.

### 2.2 State Management Hooks

**`useDateManager`** (`/src/components/TimelineCalendar/hooks/useDateManager.ts`)
```typescript
interface UseDateManagerReturn {
  // State
  selectedDate: Date;
  currentViewingDate: Date;
  timelineStartDate: Date;
  currentEndDate: Date;

  // Actions
  setSelectedDate: (date: Date) => void;
  setCurrentViewingDate: (date: Date) => void;
  navigateToYesterday: () => void;
  navigateToTomorrow: () => void;
  navigateToToday: () => void;
  addDaysToEndDate: (days: number) => Date;
}
```

**Key Features:**
- Initializes from URL param or defaults to today
- Maintains separate `selectedDate` (user selection) vs `currentViewingDate` (scroll position)
- Helper function `addDays` for date arithmetic
- Timezone-safe date parsing: `new Date(year, month - 1, day, 12, 0, 0)`

**`useWeekNavigation`** (`/src/components/WeeklyCalendar/hooks/useWeekNavigation.ts`)
```typescript
interface UseWeekNavigationReturn {
  currentWeekStart: Date;
  currentWeekEnd: Date;
  selectedDate: Date;
  navigateToPreviousWeek: () => void;
  navigateToNextWeek: () => void;
  navigateToCurrentWeek: () => void;
  setSelectedDate: (date: Date) => void;
}
```

**Key Features:**
- Week starts on Monday (ISO week)
- Helper functions: `getWeekStart`, `getWeekEnd`
- Auto-updates week range when selected date changes

**`useWeekData`** (`/src/components/WeeklyCalendar/hooks/useWeekData.ts`)
- Fetches events for date range via `/api/events?start_date=X&end_date=Y`
- Fetches consolidated timeframe via `/api/events/shift-timeframe`
- Returns `Map<string, Event[]>` grouped by date
- Parallel fetching with `Promise.all`

### 2.3 Data Fetching with TanStack Query

**Infinite Query Pattern** (`/src/hooks/queries/useEventsQuery.ts`)
```typescript
export const useInfiniteEventsQuery = ({
  initialStartDate,
  daysPerPage = 7,
}) => {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', formatDateForApi(initialStartDate)],
    queryFn: async ({ pageParam = initialStartDate }) => {
      const startDate = pageParam as Date;
      const endDate = addDays(startDate, daysPerPage);
      const events = await fetchEventsByDateRange(/* ... */);
      return {
        events,
        startDate,
        endDate,
        nextCursor: addDays(endDate, 1)
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: initialStartDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

**Key Features:**
- Pagination by date ranges (7 days per page)
- Automatic caching and deduplication
- Helper hook `useEventsFromInfiniteQuery` transforms pages into `Map<string, Event[]>`
- Stale time prevents excessive refetches

### 2.4 Context Distribution

**CalendarContext** (`/src/components/TimelineCalendar/context/CalendarContext.tsx`)
```typescript
interface CalendarContextValue {
  // Date state
  selectedDate: Date;
  currentViewingDate: Date;
  timelineStartDate: Date;
  currentEndDate: Date;

  // Event data
  eventsByDate: Map<string, Event[]>;
  timeFrames: Map<string, ShiftTimeFrame | null>;
  loadedDateStrings: string[];
  stableDateObjects: Map<string, Date>;
  monthlyEvents: Event[];
  loading: boolean;
  error: string | null;

  // Timeline state
  hasMoreTimelineData: boolean;
  timelineLoading: boolean;

  // Actions
  setSelectedDate: (date: Date) => void;
  navigateToYesterday: () => void;
  navigateToTomorrow: () => void;
  navigateToToday: () => void;
  loadMoreEvents: () => void;

  // UI state
  windowWidth: number;
  isCalendarExpanded: boolean;
  setIsCalendarExpanded: (expanded: boolean) => void;
}
```

**Pattern:** Single context provides all calendar state to deeply nested components without prop drilling.

---

## 3. Primitives to Extract

### 3.1 Time Utilities (`/src/utils/timeUtils.ts`)

**Essential functions for headless library:**

```typescript
// Parse HH:MM:SS or HH:MM to minutes from midnight
parseTimeToMinutes(timeStr: string | undefined): number

// Parse event times (handles AM/PM, 24hr formats)
parseEventTimeToMinutes(timeStr: string | undefined): number | null

// Format hour as "12AM", "1PM", etc.
formatHourLabel(hour: number): string

// Convert any time format to consistent "H:MM AM/PM"
formatDisplayTime(timeStr: string | undefined): string
```

**Key Patterns:**
- Robust error handling (returns 0 or null on failure)
- Supports multiple input formats: `"19:00"`, `"7:00 PM"`, `"7PM"`
- Handles midnight edge cases (hour 0 → 12AM, hour 24 → 12AM)
- Timezone-agnostic (works with local times only)

**Extract for Plain Calendar:**
- Create `@plain-calendar/time-utils` package
- Add comprehensive tests for format edge cases
- Consider adding timezone support via optional `timeZone` parameter

### 3.2 Date Utilities

**Key functions extracted from components:**

```typescript
// Format date for API calls (YYYY-MM-DD)
const formatDateForApi = (inputDate: Date): string => {
  const year = inputDate.getFullYear();
  const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
  const day = inputDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Create timezone-safe local date from YYYY-MM-DD
const createLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

// Normalize date to noon (avoid timezone issues)
const normalizeDate = (inputDate: Date): Date => {
  const normalized = new Date(inputDate);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
};

// Add days to date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Get week boundaries (Monday start)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
};
```

**Extract for Plain Calendar:**
- Create comprehensive date manipulation library
- Add options for week start day (Sunday vs Monday)
- Support both local and UTC operations
- Add month/year navigation utilities

### 3.3 Event Positioning Algorithm

**DaySection** (`/src/components/TimelineCalendar/DaySection/DaySection.tsx:122-195`)

**Algorithm for positioning overlapping events in columns:**

```typescript
// 1. Parse events to get start/end minutes
const eventsWithMinutes = events
  .map(event => {
    const startMinutes = parseEventTimeToMinutes(displayTime);
    let endMinutes = parseEventTimeToMinutes(event.out_time)
      ?? parseEventTimeToMinutes(event.end_time)
      ?? startMinutes + DEFAULT_DURATION_MINUTES;

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Handle overnight
    }
    return { ...event, startMinutes, endMinutes };
  })
  .filter(event => event !== null);

// 2. Sort by priority, then start time
eventsWithMinutes.sort((a, b) => {
  const prioA = a.priority ?? 999;
  const prioB = b.priority ?? 999;
  if (prioA !== prioB) return prioA - prioB;
  return a.startMinutes - b.startMinutes;
});

// 3. Place events in columns (greedy algorithm)
const columnEndTimes: number[] = [];
let maxColumnsUsed = 0;

for (const event of eventsWithMinutes) {
  let placedColumnIndex = -1;

  // Find first available column where event fits
  for (let j = 0; j < columnEndTimes.length; j++) {
    if (event.startMinutes >= columnEndTimes[j]) {
      placedColumnIndex = j;
      columnEndTimes[j] = event.endMinutes;
      break;
    }
  }

  // Create new column if needed
  if (placedColumnIndex === -1) {
    placedColumnIndex = columnEndTimes.length;
    columnEndTimes.push(event.endMinutes);
  }

  maxColumnsUsed = Math.max(maxColumnsUsed, placedColumnIndex + 1);
}
```

**Extract for Plain Calendar:**
- Create `useEventLayout` hook
- Support alternative algorithms: compact packing, force-directed layouts
- Allow custom conflict detection predicates
- Return column indices and dimensions for flexible rendering

### 3.4 Time-Proportional Rendering

**EventBlock Positioning** (`/src/components/shared/EventBlock/EventBlock.tsx:77-127`)

```typescript
// Constants
const REMS_PER_HOUR = 2.5; // Configurable scale
const DEFAULT_DURATION_MINUTES = 120;

// Calculate position relative to time axis
const minutesFromAxisStart = Math.max(0, eventStartMinutes - axisStartMinutes);
const eventDurationMinutes = Math.max(15, eventEndMinutes - eventStartMinutes);

const topRem = (minutesFromAxisStart / 60) * REMS_PER_HOUR;
const heightRem = (eventDurationMinutes / 60) * REMS_PER_HOUR;
const minHeightRem = (15 / 60) * REMS_PER_HOUR; // Minimum 15 minutes

// Calculate column width with gaps
const gapPercent = 2;
const widthPercent = totalColumns <= 1
  ? 100 - gapPercent * 2
  : (100 - gapPercent * (totalColumns + 1)) / totalColumns;

const leftPercent = totalColumns <= 1
  ? gapPercent
  : gapPercent * (columnIndex + 1) + widthPercent * columnIndex;
```

**Extract for Plain Calendar:**
- Create `useTimeProportionalLayout` hook
- Configurable `remsPerHour` or `pixelsPerHour`
- Support for minimum event heights (usability)
- Handle overnight events (endTime < startTime)

### 3.5 Time Axis Generation

**TimeAxis Component** (`/src/components/TimelineCalendar/TimeAxis/TimeAxis.tsx`)

**Algorithm for generating hour labels:**

```typescript
const startMinutes = parseTimeToMinutes(startTime);
let endMinutes = parseTimeToMinutes(endTime);

// Handle overnight
if (endMinutes <= startMinutes) {
  endMinutes += 24 * 60;
}

const hours = [];
const startHour = Math.floor(startMinutes / 60);

// Generate hourly labels
for (let i = 0; i < 48; i++) {
  const currentHour = (startHour + i) % 24;
  const currentTotalMinutes = startHour * 60 + i * 60;

  if (currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes) {
    const minutesFromStart = currentTotalMinutes - startMinutes;
    const topRem = (minutesFromStart / 60) * remsPerHour;

    hours.push({
      label: formatHourLabel(currentHour),
      top: `${topRem}rem`,
    });
  }
}

// Filter out first and last labels (avoid edge clipping)
const filteredHours = hours.length > 1 ? hours.slice(1, -1) : [];
```

**Extract for Plain Calendar:**
- Create `useTimeAxis` hook
- Returns array of `{ hour, position, label }`
- Support configurable intervals (15min, 30min, 1hr)
- Option to include/exclude edge labels

### 3.6 Background Ticks/Grid

**DaySection** (`/src/components/TimelineCalendar/DaySection/DaySection.tsx:74-120`)

```typescript
// Generate 30-minute interval ticks
const backgroundTicks = useMemo(() => {
  const ticks = [];
  const startMinutes = parseTimeToMinutes(timeFrame.start_time);
  let endMinutes = parseTimeToMinutes(timeFrame.end_time);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const startHour = Math.floor(startMinutes / 60);

  // Generate ticks every 30 minutes
  for (let i = 0; i < 96; i++) {
    const currentTotalMinutes = startHour * 60 + i * 30;

    if (currentTotalMinutes >= startMinutes && currentTotalMinutes < endMinutes) {
      const minutesFromStart = currentTotalMinutes - startMinutes;
      const topRem = (minutesFromStart / 60) * REMS_PER_HOUR;
      const isHalfHour = (i % 2) !== 0;

      ticks.push({
        id: `tick-${currentTotalMinutes}`,
        top: `${topRem}rem`,
        type: isHalfHour ? 'half-hour' : 'hour',
      });
    }
  }

  return ticks.slice(1); // Remove first tick
}, [timeFrame]);
```

**Extract for Plain Calendar:**
- Create `useGridLines` hook
- Configurable intervals (5min, 15min, 30min, 1hr)
- Return major/minor grid lines separately
- Support custom styling per tick type

### 3.7 Current Time Indicator

**DaySection** (`/src/components/TimelineCalendar/DaySection/DaySection.tsx:30-71`)

```typescript
const [currentTimePositionRem, setCurrentTimePositionRem] = useState<number | null>(null);

useEffect(() => {
  const calculatePosition = () => {
    if (!timeFrame) return;

    const now = new Date();
    const today = normalizeDate(now);
    const sectionDate = normalizeDate(date);

    // Only show on current day
    if (today.getTime() !== sectionDate.getTime()) {
      setCurrentTimePositionRem(null);
      return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseTimeToMinutes(timeFrame.start_time);
    let endMinutes = parseTimeToMinutes(timeFrame.end_time);

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    // Check if current time is within visible range
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      const minutesFromStart = currentMinutes - startMinutes;
      const positionRem = (minutesFromStart / 60) * REMS_PER_HOUR;
      setCurrentTimePositionRem(positionRem);
    }
  };

  calculatePosition();
  const intervalId = setInterval(calculatePosition, 60000); // Update every minute

  return () => clearInterval(intervalId);
}, [date, timeFrame]);
```

**Extract for Plain Calendar:**
- Create `useCurrentTimeIndicator` hook
- Returns position (in px or rem) or null if not visible
- Configurable update interval
- Option to show on all days or current day only

### 3.8 Compact Event Group (Clustering)

**CompactEventGroup** (`/src/components/shared/CompactEventGroup/CompactEventGroup.tsx`)

**Two layout modes:**

1. **Stacked Layout** (non-time-based):
   - Fixed heights based on density (`ultra-compact: 48px`, `compact: 60px`, `normal: 72px`)
   - Stack vertically with 1px gaps
   - Hide overflow with "+N more" indicator

2. **Time-Based Layout** (proportional):
   - Calculate height from event duration: `(durationMinutes / 60) * remsPerHour * 16`
   - Position based on start time: `(offsetMinutes / 60) * remsPerHour * 16`
   - Minimum height of 15 minutes for visibility
   - All events visible (no overflow indicator)

**Overlap Detection** (for fallback grouping):

```typescript
// Find overlapping events
const overlappingEvents = sortedEvents.filter(other => {
  if (processedEvents.has(other.id)) return false;
  return event.startMinutes < other.endMinutes &&
         other.startMinutes < event.endMinutes;
});

if (overlappingEvents.length > 1) {
  // Create cluster
  const earliestStart = Math.min(...overlappingEvents.map(e => e.startMinutes));
  const latestEnd = Math.max(...overlappingEvents.map(e => e.endMinutes));
  // ... create cluster layout
}
```

**Extract for Plain Calendar:**
- Create `useEventClusters` hook
- Support multiple clustering strategies (overlap-based, spatial, time-based)
- Return cluster metadata (bounds, event count, layout mode)
- Allow custom density and visibility thresholds

---

## 4. State Management Patterns

### 4.1 Hook Composition

PediCalendar uses a **hook composition** pattern where specialized hooks are composed in controller components:

```typescript
// Date management
const dateManager = useDateManager(initialDateParam);

// Data fetching
const infiniteEventsQuery = useInfiniteEventsQuery({
  initialStartDate: dateManager.timelineStartDate,
  daysPerPage: 7,
});

// Data transformation
const { eventsByDate, loadedDateStrings } =
  useEventsFromInfiniteQuery(infiniteEventsQuery);

// Timeframes
const timeFrameQueries = useTimeFramesForDates({ dates: loadedDateStrings });
const timeFrames = useTimeFramesMap(timeFrameQueries, loadedDateStrings);
```

**For Plain Calendar:**
- Provide similar composable hooks
- Each hook has single responsibility
- Hooks can be used independently or composed
- Return both state and actions (consistent interface)

### 4.2 Map-Based Event Storage

**Pattern:** Events stored as `Map<string, Event[]>` keyed by date string (YYYY-MM-DD)

**Benefits:**
- O(1) lookup by date
- Easy to check if date has events
- Efficient for sparse calendars
- Works well with React's render optimization (stable references)

**Usage:**
```typescript
const eventsByDate = new Map<string, Event[]>();
events.forEach(event => {
  const existing = eventsByDate.get(event.date) || [];
  eventsByDate.set(event.date, [...existing, event]);
});

// Later, in rendering:
const dayEvents = eventsByDate.get(dateString) || [];
```

**For Plain Calendar:**
- Provide `useEventsMap` hook
- Support multiple indexing strategies (by date, by month, by week)
- Include helper methods: `addEvent`, `removeEvent`, `updateEvent`

### 4.3 Stable Date Objects

**Pattern:** Cache date objects to prevent unnecessary re-renders

```typescript
const stableDateObjects = useMemo(() => {
  const dateCache = new Map<string, Date>();
  loadedDateStrings.forEach(dateStr => {
    dateCache.set(dateStr, createLocalDate(dateStr));
  });
  return dateCache;
}, [loadedDateStrings]);
```

**For Plain Calendar:**
- Provide `useDateCache` hook
- Memoize date objects by string key
- Reduce object creation in render loops

### 4.4 Timeframe Calculation

**Pattern:** Dynamic time axis based on event data

```typescript
interface ShiftTimeFrame {
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
}

// Server calculates earliest/latest event times
// Returns null if no events
const timeFrame: ShiftTimeFrame | null = await fetchShiftTimeFrame(date);
```

**Benefits:**
- Calendar shrinks/expands to event data
- No wasted space for empty hours
- Handles overnight events (end < start → add 24hrs)

**For Plain Calendar:**
- Provide `useTimeRange` hook
- Calculate from event data or accept manual range
- Support padding (e.g., "show 1 hour before/after events")
- Default to business hours (9am-5pm) if no events

---

## 5. Utilities & Helpers

### 5.1 Time Parsing (Robust)

**Key insights from `timeUtils.ts`:**

1. **Multiple format support:**
   - 24hr: `"19:00"`, `"19:00:00"`
   - 12hr: `"7:00 PM"`, `"7:00PM"`, `"7 PM"`

2. **Error handling strategy:**
   - Return `0` or `null` on parse failure (never throw)
   - Log warnings to console for debugging
   - Validate ranges (hours 0-23, minutes 0-59)

3. **Edge cases handled:**
   - Midnight: `"12:00 AM"` → 0 minutes
   - Noon: `"12:00 PM"` → 720 minutes
   - Overnight events: if end < start, add 1440 minutes

4. **Timezone-agnostic:**
   - All times treated as local
   - No daylight saving adjustments
   - Consumer must handle timezone conversions

**For Plain Calendar:**
- Expose these utilities as standalone package
- Add comprehensive test suite (100+ edge cases)
- Consider adding `parseTimeToDate(timeStr, baseDate)` helper

### 5.2 Event Duration Calculation

**Pattern from CompactEventGroup:**

```typescript
const calculateEventDurationMinutes = (event: CompactEvent): number => {
  let startMinutes = event.startMinutes;
  let endMinutes = event.endMinutes;

  // Handle missing end times
  if (endMinutes === null || endMinutes === undefined) {
    endMinutes = startMinutes + 120; // 2 hours default
  }

  let durationMinutes = endMinutes - startMinutes;

  // Handle overnight events
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  // Cap unusually long events (likely data issues)
  if (durationMinutes > 12 * 60) {
    durationMinutes = 120;
  }

  // Minimum 15 minutes for visibility
  return Math.max(15, durationMinutes);
};
```

**For Plain Calendar:**
- Provide `calculateDuration` utility
- Configurable default duration
- Configurable minimum/maximum durations
- Option to infer duration from event type

### 5.3 Responsive Scaling

**Pattern:** Track window width for responsive adjustments

```typescript
const [windowWidth, setWindowWidth] = useState(
  typeof window !== 'undefined' ? window.innerWidth : 1200
);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Use in rendering decisions
const isMobile = windowWidth < 768;
const isTablet = windowWidth >= 768 && windowWidth < 1024;
```

**For Plain Calendar:**
- Provide `useViewportSize` hook
- Return breakpoint helpers: `isMobile`, `isTablet`, `isDesktop`
- Debounce resize events (optional)
- Support custom breakpoint configuration

---

## 6. Learnings for Plain Calendar

### 6.1 What Works Well

**1. Hook-Based State Management**
- Composable hooks with single responsibilities
- Easy to test in isolation
- Flexible for different calendar types
- **Adopt:** Make hooks the primary API surface

**2. Map-Based Data Structures**
- `Map<string, Event[]>` for events by date
- `Map<string, Date>` for cached date objects
- Fast lookups, efficient for sparse data
- **Adopt:** Provide map utilities as first-class primitives

**3. Time Proportional Rendering**
- Configurable `remsPerHour` scale factor
- Consistent across all components
- Easy to adjust for compact vs spacious layouts
- **Adopt:** Make scale factor a core configuration option

**4. Robust Time Parsing**
- Multiple format support
- Graceful error handling (never throw)
- Console warnings for debugging
- **Adopt:** Ship as standalone `@plain-calendar/time-utils`

**5. Dynamic Timeframe Calculation**
- Calendar adapts to event data
- Eliminates wasted space
- Handles overnight events correctly
- **Adopt:** Provide `useTimeRange` hook with auto-calculation

**6. Column-Based Conflict Resolution**
- Simple greedy algorithm
- Priority-based sorting
- Works well for typical calendars
- **Adopt:** Provide as default, allow alternatives

**7. Timezone-Agnostic Core**
- All times are local/abstract
- Consumer handles timezone conversions
- Simpler implementation
- **Adopt:** Keep core timezone-free, provide optional timezone utilities

### 6.2 What Could Be Improved

**1. Inconsistent Constants**
- Timeline uses `REMS_PER_HOUR = 2.5`
- Weekly uses `REMS_PER_HOUR = 4.0`
- Should be configurable per view but consistent by default
- **Improve:** Single source of truth for scale factors

**2. Tightly Coupled to React**
- All hooks assume React context
- Difficult to use in other frameworks
- **Improve:** Core logic in framework-agnostic functions, React hooks as thin wrappers

**3. API Dependency**
- Calendar tightly coupled to `/api/events` structure
- Hard to use with different backends
- **Improve:** Accept data adapters/normalizers

**4. Limited Recurrence Support**
- No visible recurrence pattern handling
- Events stored as discrete instances
- **Improve:** Provide recurrence expansion utilities

**5. No Drag-and-Drop Primitives**
- Event editing not implemented
- Would need full rewrite for interactive calendar
- **Improve:** Design with drag-and-drop in mind from start

**6. Styling is Opinionated**
- CSS classes hardcoded in components
- Difficult to customize appearance
- **Improve:** Headless approach - no styles, return positioning only

**7. Accessibility Gaps**
- Minimal ARIA attributes
- No keyboard navigation
- **Improve:** Build accessibility into primitives

**8. Testing Coverage Unknown**
- No visible test files in analysis
- **Improve:** Ship with comprehensive test suite

### 6.3 Design Principles for Plain Calendar

Based on PediCalendar analysis:

**1. Headless by Default**
- Return positioning data, not DOM
- Let consumers choose rendering approach
- Example: `useEventLayout` returns `{ top, left, width, height }`, not JSX

**2. Composable Hooks**
- Each hook does one thing well
- Hooks can be used independently
- Example: Use `useTimeRange` without `useEventLayout`

**3. Framework-Agnostic Core**
- Core logic in plain TypeScript
- React hooks as optional wrappers
- Future: Vue composables, Svelte stores

**4. Configuration Over Convention**
- Sensible defaults (e.g., `REMS_PER_HOUR = 3`)
- Everything can be overridden
- Type-safe configuration objects

**5. Time as First-Class Primitive**
- Rich time utilities out of the box
- Support for overnight events, daylight saving, timezones (optional)
- Never throw on invalid input

**6. Sparse Data by Default**
- Optimize for calendars with few events
- Map-based storage, lazy loading
- Don't iterate all days in range

**7. Accessibility Built-In**
- Hooks return ARIA attributes
- Keyboard navigation helpers
- Screen reader friendly

**8. Testing as a Feature**
- Ship with test utilities
- Mock data generators
- Visual regression helpers

### 6.4 Primitives to Build

**Priority 1 (Core):**
1. `useCalendarState` - date navigation, selection
2. `useEventLayout` - conflict resolution, positioning
3. `useTimeRange` - dynamic axis calculation
4. Time utilities (`parseTime`, `formatTime`, etc.)
5. Date utilities (`addDays`, `getWeekBounds`, etc.)

**Priority 2 (Enhanced):**
6. `useTimeAxis` - hour label generation
7. `useGridLines` - background ticks
8. `useCurrentTimeIndicator` - live position
9. `useEventClusters` - smart grouping
10. `useEventsMap` - efficient storage

**Priority 3 (Advanced):**
11. `useWeekView` - week-specific logic
12. `useMonthView` - month grid calculation
13. `useDragAndDrop` - interactive editing
14. `useRecurrence` - recurring event expansion
15. `useTimezone` - timezone conversion utilities

---

## 7. File Reference

### Core Architecture
- `/src/components/TimelineCalendar/TimelineController.tsx` - Main orchestrator
- `/src/components/TimelineCalendar/context/CalendarContext.tsx` - Context provider
- `/src/components/TimelineCalendar/types/calendarTypes.ts` - Type definitions

### State Management Hooks
- `/src/components/TimelineCalendar/hooks/useDateManager.ts` - Date navigation
- `/src/components/WeeklyCalendar/hooks/useWeekNavigation.ts` - Week navigation
- `/src/components/WeeklyCalendar/hooks/useWeekData.ts` - Week data fetching

### Data Fetching
- `/src/hooks/queries/useEventsQuery.ts` - TanStack Query hooks
- `/src/services/eventsApi.ts` - API service functions

### Rendering Components
- `/src/components/TimelineCalendar/DaySection/DaySection.tsx` - Day view with positioning
- `/src/components/WeeklyCalendar/WeeklyGrid/WeeklyGrid.tsx` - Week grid layout
- `/src/components/WeeklyCalendar/WeeklyDayColumn/WeeklyDayColumn.tsx` - Single day column
- `/src/components/shared/EventBlock/EventBlock.tsx` - Individual event with expand
- `/src/components/shared/CompactEventGroup/CompactEventGroup.tsx` - Event clustering

### Utilities
- `/src/utils/timeUtils.ts` - Time parsing and formatting
- `/src/components/TimelineCalendar/TimeAxis/TimeAxis.tsx` - Hour labels
- `/src/components/WeeklyCalendar/constants/weeklyConstants.ts` - Shared constants

### Type Definitions
- `/src/types/eventTypes.ts` - Event and API response types
- `/src/components/shared/CompactEventGroup/CompactEventGroupTypes.ts` - Compact event types
- `/src/components/WeeklyCalendar/types/weeklyTypes.ts` - Weekly view types

### Key Algorithms
- **Event positioning:** `/src/components/TimelineCalendar/DaySection/DaySection.tsx:122-195`
- **Time-based layout:** `/src/components/shared/CompactEventGroup/CompactEventGroup.tsx:86-118`
- **Conflict detection:** `/src/components/WeeklyCalendar/WeeklyDayColumn/WeeklyDayColumn.tsx:159-204`
- **Time axis generation:** `/src/components/TimelineCalendar/TimeAxis/TimeAxis.tsx:28-56`
- **Background ticks:** `/src/components/TimelineCalendar/DaySection/DaySection.tsx:74-120`

---

## 8. Next Steps for Plain Calendar

1. **Extract time utilities** - Create standalone package with tests
2. **Design hook API** - Define interfaces for core hooks
3. **Implement `useEventLayout`** - Port positioning algorithm
4. **Create example implementations** - Show React, Vue, vanilla JS usage
5. **Write comprehensive tests** - Time utilities, layout algorithms, edge cases
6. **Document patterns** - Migration guide from PediCalendar style
7. **Build playground** - Interactive demos of all primitives

**Key Success Metric:** Can we rebuild PediCalendar's Timeline view using only Plain Calendar primitives in <200 lines of React?
