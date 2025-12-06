/**
 * stackUtils - Event stacking algorithm for priority-based visual layout
 * 
 * Stacks overlapping events based on priority, creating a nested visual hierarchy
 * where higher priority events contain lower priority events.
 */

import type { CalendarEvent, StackedEvent, StackOptions } from './types';

/**
 * Check if two events overlap in time
 */
export function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Get default priority from event (lower number = higher priority)
 */
export function getDefaultPriority(event: CalendarEvent): number {
  const data = event.data as { priority?: number } | undefined;
  return data?.priority ?? 999;
}

/**
 * Find all events that overlap with the given event
 */
export function findOverlappingEvents<T extends CalendarEvent>(
  event: T,
  events: T[]
): T[] {
  return events.filter(other => other.id !== event.id && eventsOverlap(event, other));
}

/**
 * Group events into overlapping clusters
 */
export function groupOverlappingEvents<T extends CalendarEvent>(
  events: T[]
): T[][] {
  if (events.length === 0) return [];
  
  const groups: T[][] = [];
  const assigned = new Set<string>();
  
  // Sort by start time for consistent grouping
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  
  for (const event of sorted) {
    if (assigned.has(event.id)) continue;
    
    // Start a new group with this event
    const group: T[] = [event];
    assigned.add(event.id);
    
    // Find all events that overlap with any event in the group
    let i = 0;
    while (i < group.length) {
      const current = group[i];
      for (const other of sorted) {
        if (!assigned.has(other.id) && eventsOverlap(current, other)) {
          group.push(other);
          assigned.add(other.id);
        }
      }
      i++;
    }
    
    groups.push(group);
  }
  
  return groups;
}

/**
 * Calculate stack layers for a group of overlapping events
 */
export function calculateStackLayers<T extends CalendarEvent>(
  events: T[],
  options: StackOptions = {}
): StackedEvent<T>[] {
  const {
    offsetPx = 8,
    maxStack = 5,
    getPriority = getDefaultPriority,
  } = options;
  
  if (events.length === 0) return [];
  if (events.length === 1) {
    return [{
      event: events[0],
      stackLayer: 0,
      stackOffset: 0,
      stackSize: 1,
      children: [],
      parent: null,
    }];
  }
  
  // Sort by priority (lower number = higher priority = base layer)
  const sorted = [...events].sort((a, b) => {
    const prioDiff = getPriority(a) - getPriority(b);
    if (prioDiff !== 0) return prioDiff;
    // Tie-breaker: earlier start time
    return a.start.getTime() - b.start.getTime();
  });
  
  // Build stacked events
  const stacked: StackedEvent<T>[] = [];
  const stackedById = new Map<string, StackedEvent<T>>();
  
  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const layer = Math.min(i, maxStack - 1);
    
    const stackedEvent: StackedEvent<T> = {
      event,
      stackLayer: layer,
      stackOffset: layer * offsetPx,
      stackSize: sorted.length,
      children: [],
      parent: null,
    };
    
    // Find parent (first higher-priority event that overlaps)
    for (let j = i - 1; j >= 0; j--) {
      const potentialParent = stackedById.get(sorted[j].id);
      if (potentialParent && eventsOverlap(event, sorted[j])) {
        stackedEvent.parent = potentialParent;
        potentialParent.children.push(stackedEvent);
        break;
      }
    }
    
    stacked.push(stackedEvent);
    stackedById.set(event.id, stackedEvent);
  }
  
  return stacked;
}

/**
 * Main function: Calculate stacked positions for all events
 */
export function stackEvents<T extends CalendarEvent>(
  events: T[],
  options: StackOptions = {}
): StackedEvent<T>[] {
  const groups = groupOverlappingEvents(events);
  const allStacked: StackedEvent<T>[] = [];
  
  for (const group of groups) {
    const stacked = calculateStackLayers(group, options);
    allStacked.push(...stacked);
  }
  
  return allStacked;
}

/**
 * Get only base layer events (for rendering primary events)
 */
export function getBaseLayerEvents<T extends CalendarEvent>(
  stackedEvents: StackedEvent<T>[]
): StackedEvent<T>[] {
  return stackedEvents.filter(se => se.stackLayer === 0);
}

/**
 * Get maximum stack depth across all events
 */
export function getMaxStackDepth<T extends CalendarEvent>(
  stackedEvents: StackedEvent<T>[]
): number {
  return Math.max(0, ...stackedEvents.map(se => se.stackLayer));
}
