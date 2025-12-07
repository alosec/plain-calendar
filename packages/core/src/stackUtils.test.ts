/**
 * Tests for stackUtils
 */

import { describe, it, expect } from 'vitest';
import {
  eventsOverlap,
  eventContains,
  findOverlapGroups,
  sortByPriority,
  calculateContainment,
  getStackInsets,
  calculateStacks,
} from './stackUtils';
import type { CalendarEvent } from './types';

// Helper to create test events
function makeEvent(
  id: string,
  startHour: number,
  endHour: number,
  priority: number = 5
): CalendarEvent & { priority: number } {
  const start = new Date(2025, 0, 1, startHour, 0);
  const end = new Date(2025, 0, 1, endHour, 0);
  return { id, title: `Event ${id}`, start, end, priority };
}

const getPriority = (e: CalendarEvent & { priority: number }) => e.priority;

describe('eventsOverlap', () => {
  it('returns true for overlapping events', () => {
    const a = makeEvent('a', 10, 14);
    const b = makeEvent('b', 12, 16);
    expect(eventsOverlap(a, b)).toBe(true);
  });

  it('returns false for non-overlapping events', () => {
    const a = makeEvent('a', 10, 12);
    const b = makeEvent('b', 14, 16);
    expect(eventsOverlap(a, b)).toBe(false);
  });

  it('returns false for adjacent events (end touches start)', () => {
    const a = makeEvent('a', 10, 12);
    const b = makeEvent('b', 12, 14);
    expect(eventsOverlap(a, b)).toBe(false);
  });
});

describe('eventContains', () => {
  it('returns true when event B is fully inside event A', () => {
    const a = makeEvent('a', 10, 16);
    const b = makeEvent('b', 12, 14);
    expect(eventContains(a, b)).toBe(true);
  });

  it('returns true when events have same boundaries', () => {
    const a = makeEvent('a', 10, 16);
    const b = makeEvent('b', 10, 16);
    expect(eventContains(a, b)).toBe(true);
  });

  it('returns false when event B extends past event A', () => {
    const a = makeEvent('a', 10, 14);
    const b = makeEvent('b', 12, 16);
    expect(eventContains(a, b)).toBe(false);
  });

  it('returns false when event B starts before event A', () => {
    const a = makeEvent('a', 12, 16);
    const b = makeEvent('b', 10, 14);
    expect(eventContains(a, b)).toBe(false);
  });
});

describe('findOverlapGroups', () => {
  it('groups overlapping events together', () => {
    const events = [
      makeEvent('a', 10, 14),
      makeEvent('b', 12, 16),
      makeEvent('c', 20, 22), // separate
    ];
    const groups = findOverlapGroups(events);
    
    expect(groups).toHaveLength(2);
    expect(groups[0].events.map(e => e.id)).toEqual(['a', 'b']);
    expect(groups[1].events.map(e => e.id)).toEqual(['c']);
  });

  it('handles single event', () => {
    const events = [makeEvent('a', 10, 12)];
    const groups = findOverlapGroups(events);
    
    expect(groups).toHaveLength(1);
    expect(groups[0].events).toHaveLength(1);
  });

  it('handles empty array', () => {
    const groups = findOverlapGroups([]);
    expect(groups).toHaveLength(0);
  });

  it('chains overlapping events correctly', () => {
    // A overlaps B, B overlaps C, but A doesn't overlap C
    const events = [
      makeEvent('a', 10, 13),
      makeEvent('b', 12, 15),
      makeEvent('c', 14, 17),
    ];
    const groups = findOverlapGroups(events);
    
    // All should be in one group because they form a chain
    expect(groups).toHaveLength(1);
    expect(groups[0].events).toHaveLength(3);
  });
});

describe('sortByPriority', () => {
  it('sorts events by priority (lower number first)', () => {
    const events = [
      makeEvent('a', 10, 12, 5),
      makeEvent('b', 10, 12, 1),
      makeEvent('c', 10, 12, 3),
    ];
    const sorted = sortByPriority(events, getPriority);
    
    expect(sorted.map(e => e.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('calculateContainment', () => {
  it('builds correct parent-child relationships', () => {
    const events = [
      makeEvent('outer', 10, 20, 1),  // P1 - base
      makeEvent('middle', 12, 18, 2), // P2 - inside outer
      makeEvent('inner', 14, 16, 3),  // P3 - inside middle
    ];
    const containment = calculateContainment(events, getPriority);
    
    expect(containment.get('outer')?.parentId).toBe(null);
    expect(containment.get('outer')?.layer).toBe(0);
    expect(containment.get('outer')?.childIds).toContain('middle');
    
    expect(containment.get('middle')?.parentId).toBe('outer');
    expect(containment.get('middle')?.layer).toBe(1);
    expect(containment.get('middle')?.childIds).toContain('inner');
    
    expect(containment.get('inner')?.parentId).toBe('middle');
    expect(containment.get('inner')?.layer).toBe(2);
  });

  it('handles partial overlaps (no containment)', () => {
    const events = [
      makeEvent('a', 10, 14, 1),
      makeEvent('b', 12, 16, 2), // overlaps but extends past
    ];
    const containment = calculateContainment(events, getPriority);
    
    // B is not contained in A because it extends past
    expect(containment.get('b')?.parentId).toBe(null);
    expect(containment.get('b')?.layer).toBe(0);
  });
});

describe('getStackInsets', () => {
  it('calculates insets based on layer', () => {
    expect(getStackInsets(0, 8)).toEqual({ left: 0, right: 0 });
    expect(getStackInsets(1, 8)).toEqual({ left: 8, right: 8 });
    expect(getStackInsets(2, 8)).toEqual({ left: 16, right: 16 });
  });

  it('respects custom insetPx', () => {
    expect(getStackInsets(1, 12)).toEqual({ left: 12, right: 12 });
  });
});

describe('calculateStacks', () => {
  it('returns stacked events with correct metadata', () => {
    const events = [
      makeEvent('outer', 10, 20, 1),
      makeEvent('inner', 12, 18, 2),
    ];
    const result = calculateStacks(events, {
      getPriority,
      startHour: 0,
      endHour: 24,
    });
    
    expect(result.hasStacks).toBe(true);
    expect(result.maxDepth).toBe(1);
    expect(result.stackedEvents).toHaveLength(2);
    
    const outer = result.stackedEvents.find(e => e.event.id === 'outer')!;
    const inner = result.stackedEvents.find(e => e.event.id === 'inner')!;
    
    expect(outer.layer).toBe(0);
    expect(outer.insets.left).toBe(0);
    
    expect(inner.layer).toBe(1);
    expect(inner.parentId).toBe('outer');
    expect(inner.insets.left).toBe(8); // default insetPx
  });

  it('handles non-overlapping events', () => {
    const events = [
      makeEvent('a', 10, 12, 1),
      makeEvent('b', 14, 16, 2),
    ];
    const result = calculateStacks(events, { getPriority });
    
    expect(result.hasStacks).toBe(false);
    expect(result.stackGroups).toHaveLength(2);
  });

  it('respects maxDepth', () => {
    const events = [
      makeEvent('l0', 10, 22, 1),
      makeEvent('l1', 11, 21, 2),
      makeEvent('l2', 12, 20, 3),
      makeEvent('l3', 13, 19, 4),
      makeEvent('l4', 14, 18, 5),
      makeEvent('l5', 15, 17, 6),
    ];
    const result = calculateStacks(events, {
      getPriority,
      maxDepth: 3,
    });
    
    expect(result.maxDepth).toBe(3);
    
    // Events beyond maxDepth should be clamped
    const l5 = result.stackedEvents.find(e => e.event.id === 'l5')!;
    expect(l5.layer).toBe(3); // clamped from 5 to 3
  });
});
