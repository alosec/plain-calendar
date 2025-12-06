/**
 * StackedEventGroup - Headless container for rendering stacked events
 */

import React from 'react';
import type { CalendarEvent, StackedEvent } from '@plain-calendar/core';

export interface StackedEventGroupProps<T extends CalendarEvent = CalendarEvent> {
  /** Stacked events to render (from useEventStack) */
  stackedEvents: StackedEvent<T>[];
  /** Render function for each stacked event */
  renderEvent: (stackedEvent: StackedEvent<T>, index: number) => React.ReactNode;
  /** Container element type (default: 'div') */
  as?: keyof JSX.IntrinsicElements;
  /** Container class name */
  className?: string;
  /** Container style */
  style?: React.CSSProperties;
  /** Whether to render only base layer events (default: false) */
  baseLayerOnly?: boolean;
}

/**
 * Get inline styles for a stacked event based on its layer
 */
export function getStackedEventStyle(
  stackedEvent: StackedEvent,
  baseStyle: React.CSSProperties = {}
): React.CSSProperties {
  return {
    ...baseStyle,
    // Apply offset for nested events
    marginLeft: stackedEvent.stackOffset,
    marginTop: stackedEvent.stackOffset,
    // Reduce size slightly for nested events
    width: stackedEvent.stackLayer > 0 
      ? `calc(100% - ${stackedEvent.stackOffset * 2}px)` 
      : undefined,
    // Higher layers get higher z-index
    zIndex: (baseStyle.zIndex as number ?? 0) + stackedEvent.stackLayer,
  };
}

/**
 * Headless component for rendering stacked events.
 * 
 * @example
 * ```tsx
 * <StackedEventGroup
 *   stackedEvents={stackedEvents}
 *   renderEvent={(se) => (
 *     <div
 *       key={se.event.id}
 *       style={getStackedEventStyle(se, { position: 'absolute' })}
 *     >
 *       {se.event.title}
 *       {se.stackLayer > 0 && <span>(nested)</span>}
 *     </div>
 *   )}
 * />
 * ```
 */
export function StackedEventGroup<T extends CalendarEvent = CalendarEvent>({
  stackedEvents,
  renderEvent,
  as: Component = 'div',
  className,
  style,
  baseLayerOnly = false,
}: StackedEventGroupProps<T>): React.ReactElement {
  const eventsToRender = baseLayerOnly
    ? stackedEvents.filter(se => se.stackLayer === 0)
    : stackedEvents;

  return (
    <Component className={className} style={style}>
      {eventsToRender.map((stackedEvent, index) => renderEvent(stackedEvent, index))}
    </Component>
  );
}

export default StackedEventGroup;
