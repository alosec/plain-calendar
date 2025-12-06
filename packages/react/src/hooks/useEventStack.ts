/**
 * useEventStack - React hook for priority-based event stacking
 */

import { useMemo } from 'react';
import type {
  CalendarEvent,
  StackOptions,
  UseEventStackReturn,
} from '@plain-calendar/core';
import {
  stackEvents,
  getMaxStackDepth,
} from '@plain-calendar/core';

export interface UseEventStackOptions extends StackOptions {}

/**
 * Hook for calculating stacked event positions based on priority.
 * 
 * @example
 * ```tsx
 * const { stackedEvents, maxStackDepth } = useEventStack(events, {
 *   offsetPx: 8,
 *   maxStack: 5,
 *   getPriority: (e) => e.data?.priority ?? 999,
 * });
 * ```
 */
export function useEventStack<T extends CalendarEvent = CalendarEvent>(
  events: T[],
  options: UseEventStackOptions = {}
): UseEventStackReturn<T> {
  const stackedEvents = useMemo(() => {
    return stackEvents(events, options);
  }, [events, options.offsetPx, options.maxStack, options.getPriority]);

  const maxStackDepth = useMemo(() => {
    return getMaxStackDepth(stackedEvents);
  }, [stackedEvents]);

  const hasStacks = useMemo(() => {
    return stackedEvents.some(se => se.stackSize > 1);
  }, [stackedEvents]);

  return {
    stackedEvents,
    maxStackDepth,
    hasStacks,
  };
}

export default useEventStack;
