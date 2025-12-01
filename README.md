# Plain Calendar

**Headless React calendar component library**

Build custom calendar interfaces with unstyled, accessible primitives.

## Philosophy

Like TanStack Table for calendars - we provide the logic, you provide the UI.

## Features

- **Headless architecture** - Full control over styling and markup
- **Composable primitives** - Use only what you need
- **Type-safe** - Built with TypeScript
- **Accessible** - ARIA-compliant components
- **Zero dependencies** - Only React as peer dependency

## Installation

```bash
npm install plain-calendar
```

## Quick Start

```tsx
import { useCalendarState, Calendar } from 'plain-calendar'

function MyCalendar() {
  const calendar = useCalendarState()

  return (
    <Calendar state={calendar}>
      {/* Your custom UI here */}
    </Calendar>
  )
}
```

## Status

**In Development** - Extracting from PediCalendar production codebase

See `memory-bank/` for architecture docs and `bd list` for implementation roadmap.

## Documentation

- **memory-bank/00-core/** - Project vision and goals
- **memory-bank/01-architecture/** - Architecture patterns
- **memory-bank/02-active/** - Current work status
