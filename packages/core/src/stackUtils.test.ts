/**
 * Tests for stackUtils - Event stacking algorithm
 */

import { describe, it, expect } from 'vitest';
import {
  eventsOverlap,
  findOverlappingEvents,
  groupOverlappingEvents,
  calculateStackLayers,
  stackEvents,
  getBaseLayerEvents,
  getMaxStackDepth,
} from './stackUtils';
import type { CalendarEvent } from './types';

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

describe('eventsOverlap', () => {
  it('returns true for overlapping events', () => {
    const a = createEvent('a', 10, 12);
    const b = createEvent('b', 11, 13);
    expect(eventsOverlap(a, b)).toBe(true);
    expect(eventsOverlap(b, a)).toBe(true);
  });

  it('returns true when one event contains another', () => {
    const outer = createEvent('outer', 10, 14);
    const inner = createEvent('inner', 11, 13);
    expect(eventsOverlap(outer, inner)).toBe(true);
    expect(eventsOverlap(inner, outer)).toBe(true);
  });

  it('returns false for non-overlapping events', () => {
    const a = createEvent('a', 10, 11);
    const b = createEvent('b', 12, 13);
    expect(eventsOverlap(a, b)).toBe(false);
  });

  it('returns false for adjacent events (touching but not overlapping)', () => {
    const a = createEvent('a', 10, 11);
    const b = createEvent('b', 11, 12);
    expect(eventsOverlap(a, b)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('finds all events that overlap with target', () => {
    const target = createEvent('target', 10, 14);
    const overlap1 = createEvent('o1', 11, 12);
    const overlap2 = createEvent('o2', 13, 15);
    const noOverlap = createEvent('no', 15, 16);
    
    const all = [target, overlap1, overlap2, noOverlap];
    const result = findOverlappingEvents(target, all);
    
    expect(result).toHaveLength(2);
    expect(result.map(e => e.id)).toContain('o1');
    expect(result.map(e => e.id)).toContain('o2');
    expect(result.map(e => e.id)).not.toContain('target');
    expect(result.map(e => e.id)).not.toContain('no');
  });

  it('returns empty array when no overlaps', () => {
    const target = createEvent('target', 10, 11);
    const other = createEvent('other', 12, 13);
    
    const result = findOverlappingEvents(target, [target, other]);
    expect(result).toHaveLength(0);
  });
});

describe('groupOverlappingEvents', () => {
  it('groups overlapping events together', () => {
    const a = createEvent('a', 10, 12);
    const b = createEvent('b', 11, 13);
    const c = createEvent('c', 15, 16);
    
    const groups = groupOverlappingEvents([a, b, c]);
    
    expect(groups).toHaveLength(2);
    // First group has overlapping events
    const group1Ids = groups[0].map(e => e.id).sort();
    expect(group1Ids).toEqual(['a', 'b']);
    // Second group is standalone
    expect(groups[1].map(e => e.id)).toEqual(['c']);
  });

  it('handles chain overlaps (a overlaps b, b overlaps c, but a does not overlap c)', () => {
    const a = createEvent('a', 10, 12);
    const b = createEvent('b', 11, 14);
    const c = createEvent('c', 13, 15);
    
    const groups = groupOverlappingEvents([a, b, c]);
    
    // All should be in same group due to chain
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    expect(groupOverlappingEvents([])).toEqual([]);
  });

  it('handles single event', () => {
    const a = createEvent('a', 10, 11);
    const groups = groupOverlappingEvents([a]);
    expect(groups).toEqual([[a]]);
  });
});

describe('calculateStackLayers', () => {
  it('assigns layer 0 to single event', () => {
    const a = createEvent('a', 10, 11);
    const result = calculateStackLayers([a]);
    
    expect(result).toHaveLength(1);
    expect(result[0].stackLayer).toBe(0);
    expect(result[0].stackOffset).toBe(0);
    expect(result[0].parent).toBeNull();
  });

  it('stacks events by priority (lower priority number = base layer)', () => {
    const high = createEvent('high', 10, 14, 1);
    const medium = createEvent('medium', 11, 13, 5);
    const low = createEvent('low', 11, 12, 10);
    
    const result = calculateStackLayers([low, high, medium]);
    
    const byId = new Map(result.map(r => [r.event.id, r]));
    
    expect(byId.get('high')!.stackLayer).toBe(0);
    expect(byId.get('medium')!.stackLayer).toBe(1);
    expect(byId.get('low')!.stackLayer).toBe(2);
  });

  it('applies correct offset per layer', () => {
    const a = createEvent('a', 10, 14, 1);
    const b = createEvent('b', 11, 13, 2);
    const c = createEvent('c', 11, 12, 3);
    
    const result = calculateStackLayers([a, b, c], { offsetPx: 10 });
    
    const byId = new Map(result.map(r => [r.event.id, r]));
    
    expect(byId.get('a')!.stackOffset).toBe(0);
    expect(byId.get('b')!.stackOffset).toBe(10);
    expect(byId.get('c')!.stackOffset).toBe(20);
  });

  it('respects maxStack limit', () => {
    const events = [
      createEvent('a', 10, 14, 1),
      createEvent('b', 11, 13, 2),
      createEvent('c', 11, 12, 3),
      createEvent('d', 11, 12, 4),
      createEvent('e', 11, 12, 5),
    ];
    
    const result = calculateStackLayers(events, { maxStack: 3 });
    
    // Last two should be clamped to layer 2 (maxStack - 1)
    const layers = result.map(r => r.stackLayer);
    expect(Math.max(...layers)).toBe(2);
  });

  it('sets parent relationships correctly', () => {
    const parent = createEvent('parent', 10, 14, 1);
    const child = createEvent('child', 11, 13, 5);
    
    const result = calculateStackLayers([parent, child]);
    
    const byId = new Map(result.map(r => [r.event.id, r]));
    
    expect(byId.get('parent')!.parent).toBeNull();
    expect(byId.get('child')!.parent).toBe(byId.get('parent'));
    expect(byId.get('parent')!.children).toContain(byId.get('child'));
  });

  it('sets stackSize correctly', () => {
    const a = createEvent('a', 10, 14, 1);
    const b = createEvent('b', 11, 13, 2);
    
    const result = calculateStackLayers([a, b]);
    
    expect(result[0].stackSize).toBe(2);
    expect(result[1].stackSize).toBe(2);
  });
});

describe('stackEvents', () => {
  it('stacks all events across multiple groups', () => {
    // Group 1: overlapping
    const a = createEvent('a', 10, 12, 1);
    const b = createEvent('b', 11, 13, 2);
    // Group 2: standalone
    const c = createEvent('c', 15, 16, 1);
    
    const result = stackEvents([a, b, c]);
    
    expect(result).toHaveLength(3);
    
    const byId = new Map(result.map(r => [r.event.id, r]));
    
    // Group 1 is stacked
    expect(byId.get('a')!.stackLayer).toBe(0);
    expect(byId.get('b')!.stackLayer).toBe(1);
    // Group 2 is standalone (layer 0)
    expect(byId.get('c')!.stackLayer).toBe(0);
  });

  it('handles empty input', () => {
    expect(stackEvents([])).toEqual([]);
  });
});

describe('getBaseLayerEvents', () => {
  it('returns only layer 0 events', () => {
    const a = createEvent('a', 10, 14, 1);
    const b = createEvent('b', 11, 13, 2);
    const c = createEvent('c', 15, 16, 1);
    
    const stacked = stackEvents([a, b, c]);
    const base = getBaseLayerEvents(stacked);
    
    expect(base).toHaveLength(2);
    expect(base.map(s => s.event.id).sort()).toEqual(['a', 'c']);
  });
});

describe('getMaxStackDepth', () => {
  it('returns maximum stack layer', () => {
    const events = [
      createEvent('a', 10, 14, 1),
      createEvent('b', 11, 13, 2),
      createEvent('c', 11, 12, 3),
    ];
    
    const stacked = stackEvents(events);
    expect(getMaxStackDepth(stacked)).toBe(2);
  });

  it('returns 0 for single event', () => {
    const stacked = stackEvents([createEvent('a', 10, 11)]);
    expect(getMaxStackDepth(stacked)).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(getMaxStackDepth([])).toBe(0);
  });
});
