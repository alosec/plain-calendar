import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventLayout } from './useEventLayout';
import type { CalendarEvent } from '@plain-calendar/core';

describe('useEventLayout', () => {
  it('returns empty array for no events', () => {
    const { result } = renderHook(() => useEventLayout([]));
    
    expect(result.current.positionedEvents).toHaveLength(0);
    expect(result.current.hasOverlaps).toBe(false);
  });

  it('positions single event correctly', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Meeting',
        start: new Date(2024, 0, 15, 12, 0),
        end: new Date(2024, 0, 15, 13, 0),
      },
    ];

    const { result } = renderHook(() =>
      useEventLayout(events, { startHour: 0, endHour: 24 })
    );
    
    expect(result.current.positionedEvents).toHaveLength(1);
    expect(result.current.positionedEvents[0].column).toBe(0);
    expect(result.current.positionedEvents[0].totalColumns).toBe(1);
    expect(result.current.positionedEvents[0].top).toBeCloseTo(50, 1);
    expect(result.current.hasOverlaps).toBe(false);
  });

  it('handles overlapping events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Meeting 1',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 30),
      },
      {
        id: '2',
        title: 'Meeting 2',
        start: new Date(2024, 0, 15, 11, 0),
        end: new Date(2024, 0, 15, 12, 0),
      },
    ];

    const { result } = renderHook(() =>
      useEventLayout(events, { startHour: 0, endHour: 24 })
    );
    
    expect(result.current.positionedEvents).toHaveLength(2);
    expect(result.current.hasOverlaps).toBe(true);
    
    // Events should be in different columns
    const columns = result.current.positionedEvents.map(pe => pe.column);
    expect(new Set(columns).size).toBe(2);
  });

  it('reuses columns for non-overlapping events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Morning',
        start: new Date(2024, 0, 15, 9, 0),
        end: new Date(2024, 0, 15, 10, 0),
      },
      {
        id: '2',
        title: 'Afternoon',
        start: new Date(2024, 0, 15, 14, 0),
        end: new Date(2024, 0, 15, 15, 0),
      },
    ];

    const { result } = renderHook(() =>
      useEventLayout(events, { startHour: 0, endHour: 24 })
    );
    
    expect(result.current.positionedEvents).toHaveLength(2);
    expect(result.current.hasOverlaps).toBe(false);
    
    // Both should be in column 0
    expect(result.current.positionedEvents[0].column).toBe(0);
    expect(result.current.positionedEvents[1].column).toBe(0);
  });

  it('filters out all-day events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'All day event',
        start: new Date(2024, 0, 15),
        end: new Date(2024, 0, 15),
        allDay: true,
      },
      {
        id: '2',
        title: 'Timed event',
        start: new Date(2024, 0, 15, 10, 0),
        end: new Date(2024, 0, 15, 11, 0),
      },
    ];

    const { result } = renderHook(() => useEventLayout(events));
    
    expect(result.current.positionedEvents).toHaveLength(1);
    expect(result.current.positionedEvents[0].event.id).toBe('2');
  });
});
