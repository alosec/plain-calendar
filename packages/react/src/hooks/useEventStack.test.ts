/**
 * Tests for useEventStack hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventStack } from './useEventStack';
import type { CalendarEvent } from '@plain-calendar/core';

// Helper to create test events
function createEvent(
  id: string,
  startHour: number,
  endHour: number,
  priority: number = 999
): CalendarEvent {
  const baseDate = new Date('2025-01-15');
  return {
    id,
    title: `Event ${id}`,
    start: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, 0),
    end: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, 0),
    data: { priority },
  };
}

describe('useEventStack', () => {
  it('returns empty array for no events', () => {
    const { result } = renderHook(() => useEventStack([]));
    
    expect(result.current.stackedEvents).toEqual([]);
    expect(result.current.maxStackDepth).toBe(0);
    expect(result.current.hasStacks).toBe(false);
  });

  it('returns single event without stacking', () => {
    const events = [createEvent('a', 10, 12)];
    const { result } = renderHook(() => useEventStack(events));
    
    expect(result.current.stackedEvents).toHaveLength(1);
    expect(result.current.stackedEvents[0].stackLayer).toBe(0);
    expect(result.current.hasStacks).toBe(false);
  });

  it('stacks overlapping events by priority', () => {
    const events = [
      createEvent('high', 10, 14, 1),
      createEvent('medium', 11, 13, 5),
      createEvent('low', 11, 12, 10),
    ];
    
    const { result } = renderHook(() => useEventStack(events));
    
    expect(result.current.stackedEvents).toHaveLength(3);
    expect(result.current.hasStacks).toBe(true);
    
    const byId = new Map(
      result.current.stackedEvents.map(se => [se.event.id, se])
    );
    
    expect(byId.get('high')!.stackLayer).toBe(0);
    expect(byId.get('medium')!.stackLayer).toBe(1);
    expect(byId.get('low')!.stackLayer).toBe(2);
  });

  it('calculates correct maxStackDepth', () => {
    const events = [
      createEvent('a', 10, 14, 1),
      createEvent('b', 11, 13, 2),
      createEvent('c', 11, 12, 3),
      createEvent('d', 11, 12, 4),
    ];
    
    const { result } = renderHook(() => useEventStack(events));
    
    expect(result.current.maxStackDepth).toBe(3);
  });

  it('respects offsetPx option', () => {
    const events = [
      createEvent('a', 10, 14, 1),
      createEvent('b', 11, 13, 2),
    ];
    
    const { result } = renderHook(() => 
      useEventStack(events, { offsetPx: 12 })
    );
    
    const byId = new Map(
      result.current.stackedEvents.map(se => [se.event.id, se])
    );
    
    expect(byId.get('a')!.stackOffset).toBe(0);
    expect(byId.get('b')!.stackOffset).toBe(12);
  });

  it('respects maxStack option', () => {
    const events = [
      createEvent('a', 10, 14, 1),
      createEvent('b', 11, 13, 2),
      createEvent('c', 11, 12, 3),
      createEvent('d', 11, 12, 4),
      createEvent('e', 11, 12, 5),
    ];
    
    const { result } = renderHook(() => 
      useEventStack(events, { maxStack: 3 })
    );
    
    // All layers should be clamped to maxStack - 1 = 2
    const maxLayer = Math.max(
      ...result.current.stackedEvents.map(se => se.stackLayer)
    );
    expect(maxLayer).toBe(2);
  });

  it('uses custom getPriority function', () => {
    const events = [
      { ...createEvent('a', 10, 14), data: { importance: 'low' } },
      { ...createEvent('b', 11, 13), data: { importance: 'high' } },
    ];
    
    const getPriority = (e: CalendarEvent) => {
      const data = e.data as { importance?: string };
      return data?.importance === 'high' ? 1 : 10;
    };
    
    const { result } = renderHook(() => 
      useEventStack(events, { getPriority })
    );
    
    const byId = new Map(
      result.current.stackedEvents.map(se => [se.event.id, se])
    );
    
    // 'b' has high importance so should be layer 0
    expect(byId.get('b')!.stackLayer).toBe(0);
    expect(byId.get('a')!.stackLayer).toBe(1);
  });

  it('handles non-overlapping events separately', () => {
    const events = [
      createEvent('morning', 8, 10, 1),
      createEvent('evening', 18, 20, 1),
    ];
    
    const { result } = renderHook(() => useEventStack(events));
    
    // Both should be layer 0 since they don't overlap
    expect(result.current.stackedEvents.every(se => se.stackLayer === 0)).toBe(true);
    expect(result.current.hasStacks).toBe(false);
  });
});
