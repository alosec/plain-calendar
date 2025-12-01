import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimeRange } from './useTimeRange';
import type { CalendarEvent } from '@plain-calendar/core';

describe('useTimeRange', () => {
  it('returns default time range', () => {
    const { result } = renderHook(() => useTimeRange());
    
    expect(result.current.startHour).toBe(6);
    expect(result.current.endHour).toBe(22);
    expect(result.current.totalMinutes).toBe(16 * 60);
  });

  it('uses custom default hours', () => {
    const { result } = renderHook(() =>
      useTimeRange([], { defaultStartHour: 8, defaultEndHour: 18 })
    );
    
    expect(result.current.startHour).toBe(8);
    expect(result.current.endHour).toBe(18);
  });

  it('expands range to fit early events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Early meeting',
        start: new Date(2024, 0, 15, 5, 0),
        end: new Date(2024, 0, 15, 6, 0),
      },
    ];

    const { result } = renderHook(() => useTimeRange(events));
    
    expect(result.current.startHour).toBe(5);
  });

  it('expands range to fit late events', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Late event',
        start: new Date(2024, 0, 15, 21, 0),
        end: new Date(2024, 0, 15, 23, 30),
      },
    ];

    const { result } = renderHook(() => useTimeRange(events));
    
    expect(result.current.endHour).toBe(24);
  });

  it('ignores all-day events for range expansion', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'All day',
        start: new Date(2024, 0, 15, 0, 0),
        end: new Date(2024, 0, 15, 23, 59),
        allDay: true,
      },
    ];

    const { result } = renderHook(() => useTimeRange(events));
    
    // Should use defaults, not expand to 0-24
    expect(result.current.startHour).toBe(6);
    expect(result.current.endHour).toBe(22);
  });

  it('calculates position for time', () => {
    const { result } = renderHook(() =>
      useTimeRange([], { defaultStartHour: 0, defaultEndHour: 24 })
    );
    
    const noon = new Date(2024, 0, 15, 12, 0);
    expect(result.current.getPositionForTime(noon)).toBe(50);
  });

  it('calculates time for position', () => {
    const { result } = renderHook(() =>
      useTimeRange([], { defaultStartHour: 0, defaultEndHour: 24 })
    );
    
    const time = result.current.getTimeForPosition(50);
    expect(time.getHours()).toBe(12);
    expect(time.getMinutes()).toBe(0);
  });
});
