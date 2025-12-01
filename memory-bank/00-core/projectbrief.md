# Plain Calendar - Project Brief

## What We're Building
Headless React calendar component library - the TanStack Table of calendars.

## Core Value Proposition
- **Headless architecture**: Logic separated from presentation
- **Composable primitives**: Use only what you need
- **Type-safe**: Full TypeScript with inference
- **Accessible**: ARIA-compliant out of the box
- **Zero dependencies**: Only peer dependency on React

## Target Users
- React developers building calendar/scheduling features
- Teams needing customizable calendar UI
- Applications requiring complex calendar logic without UI lock-in

## Success Criteria
Developers can build custom calendar interfaces in hours instead of weeks, with production-ready accessibility and timezone handling.

## Tech Stack
- **Core**: React + TypeScript
- **Build**: Vite (library mode)
- **Testing**: Vitest + Testing Library
- **Docs**: Storybook
- **Distribution**: npm package (`plain-calendar`)

## Design Philosophy
Like TanStack Table and Radix UI - provide unstyled, accessible primitives with hooks for state management. Ship default styled components as optional import.
