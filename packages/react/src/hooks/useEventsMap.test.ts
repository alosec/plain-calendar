import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventsMap, getEventsForDate, getEventsForRange } from './useEventsMap';
import type { CalendarEvent } from '@plain-calendar/core';

describe('useEventsMap', () => {
  it('groups events by date', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Event 1',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      },
      {
        id: '2',
        title: 'Event 2',
        start: new Date(2024, 0, 15, 14, 0),
        end: new Date(2024, 0, 15, 15, 0),
      },
      {
        id: '3',
        title: 'Event 3',
        start: new Date(2024, 0, 16, 10, 0),
        end: new Date(2024, 0, 16, 11, 0),
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    
    expect(result.current.get('2024-01-15')).toHaveLength(2);
    expect(result.current.get('2024-01-16')).toHaveLength(1);
  });

  it('sorts events within a day by start time', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Afternoon',
        start: new Date(2024, 0, 15, 14, 0),
        end: new Date(2024, 0, 15, 15, 0),
      },
      {
        id: '2',
        title: 'Morning',
        start: new Date(2024, 0, 15, 9, 0),
        end: new Date(2024, 0, 15, 10, 0),
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    const dayEvents = result.current.get('2024-01-15')!;
    
    expect(dayEvents[0].title).toBe('Morning');
    expect(dayEvents[1].title).toBe('Afternoon');
  });

  it('handles multi-day events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Multi-day',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 17, 10, 0),
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    
    expect(result.current.get('2024-01-15')).toHaveLength(1);
    expect(result.current.get('2024-01-16')).toHaveLength(1);
    expect(result.current.get('2024-01-17')).toHaveLength(1);
  });

  it('handles all-day events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'All day',
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 16),
        allDay: true,
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    
    expect(result.current.get('2024-01-15')).toHaveLength(1);
    expect(result.current.get('2024-01-16')).toHaveLength(1);
  });
});

describe('getEventsForDate', () => {
  it('returns events for a specific date', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Event',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    const dayEvents = getEventsForDate(result.current, new Date(2024, 0, 15));
    
    expect(dayEvents).toHaveLength(1);
  });

  it('returns empty array for date with no events', () => {
    const events: CalendarEvent[] = [];
    const { result } = renderHook(() => useEventsMap(events));
    const dayEvents = getEventsForDate(result.current, new Date(2024, 0, 15));
    
    expect(dayEvents).toHaveLength(0);
  });
});

describe('getEventsForRange', () => {
  it('returns unique events for a date range', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Multi-day',
        start: new Date(2024, 0, 14),
        end: new Date(2024, 0, 16),
        allDay: true,
      },
      {
        id: '2',
        title: 'Single day',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      },
    ];

    const { result } = renderHook(() => useEventsMap(events));
    const rangeEvents = getEventsForRange(
      result.current,
      new Date(2024, 0, 14),
      new Date(2024, 0, 16)
    );
    
    // Should have 2 unique events (multi-day shouldn't be duplicated)
    expect(rangeEvents).toHaveLength(2);
  });
});
