import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  toDateString,
  fromDateString,
  formatScheduledTime,
  getWeekDates,
  getMonthCalendarDates,
  daysBetween,
} from './dateUtils';

describe('addDays', () => {
  it('adds positive days', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });

  it('adds negative days', () => {
    const date = new Date(2024, 0, 15);
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  it('handles month boundaries', () => {
    const date = new Date(2024, 0, 31);
    const result = addDays(date, 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(1);
  });
});

describe('addMonths', () => {
  it('adds months', () => {
    const date = new Date(2024, 0, 15);
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(2); // March
  });

  it('handles year boundaries', () => {
    const date = new Date(2024, 11, 15);
    const result = addMonths(date, 2);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1); // February
  });
});

describe('startOfDay', () => {
  it('resets time to midnight', () => {
    const date = new Date(2024, 0, 15, 14, 30, 45, 123);
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe('endOfDay', () => {
  it('sets time to end of day', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getDate()).toBe(15);
  });
});

describe('startOfWeek', () => {
  it('gets Sunday start by default', () => {
    // Wednesday Jan 17, 2024
    const date = new Date(2024, 0, 17);
    const result = startOfWeek(date);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getDate()).toBe(14);
  });

  it('gets Monday start when specified', () => {
    // Wednesday Jan 17, 2024
    const date = new Date(2024, 0, 17);
    const result = startOfWeek(date, 1);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(15);
  });
});

describe('startOfMonth', () => {
  it('gets first day of month', () => {
    const date = new Date(2024, 5, 15);
    const result = startOfMonth(date);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(5);
  });
});

describe('endOfMonth', () => {
  it('gets last day of month', () => {
    const date = new Date(2024, 0, 15);
    const result = endOfMonth(date);
    expect(result.getDate()).toBe(31);
    expect(result.getMonth()).toBe(0);
  });

  it('handles February in leap year', () => {
    const date = new Date(2024, 1, 15);
    const result = endOfMonth(date);
    expect(result.getDate()).toBe(29);
  });
});

describe('isSameDay', () => {
  it('returns true for same day', () => {
    const date1 = new Date(2024, 0, 15, 10, 0);
    const date2 = new Date(2024, 0, 15, 20, 0);
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it('returns false for different days', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 0, 16);
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('returns true for same month', () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 31);
    expect(isSameMonth(date1, date2)).toBe(true);
  });

  it('returns false for different months', () => {
    const date1 = new Date(2024, 0, 15);
    const date2 = new Date(2024, 1, 15);
    expect(isSameMonth(date1, date2)).toBe(false);
  });
});

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for today', () => {
    const today = new Date(2024, 0, 15, 8, 0);
    expect(isToday(today)).toBe(true);
  });

  it('returns false for other days', () => {
    const yesterday = new Date(2024, 0, 14);
    expect(isToday(yesterday)).toBe(false);
  });
});

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    const saturday = new Date(2024, 0, 13); // Saturday
    expect(isWeekend(saturday)).toBe(true);
  });

  it('returns true for Sunday', () => {
    const sunday = new Date(2024, 0, 14); // Sunday
    expect(isWeekend(sunday)).toBe(true);
  });

  it('returns false for weekdays', () => {
    const monday = new Date(2024, 0, 15); // Monday
    expect(isWeekend(monday)).toBe(false);
  });
});

describe('toDateString', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15);
    expect(toDateString(date)).toBe('2024-01-15');
  });

  it('pads single digits', () => {
    const date = new Date(2024, 5, 5);
    expect(toDateString(date)).toBe('2024-06-05');
  });
});

describe('fromDateString', () => {
  it('parses YYYY-MM-DD string', () => {
    const result = fromDateString('2024-01-15');
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(0);
    expect(result?.getDate()).toBe(15);
  });

  it('returns null for invalid input', () => {
    expect(fromDateString('')).toBe(null);
    expect(fromDateString('invalid')).toBe(null);
  });
});

describe('formatScheduledTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats today times', () => {
    const today = new Date(2024, 0, 15, 14, 30);
    const result = formatScheduledTime(today);
    expect(result).toContain('Today');
    expect(result).toContain('2:30');
  });

  it('formats tomorrow times', () => {
    const tomorrow = new Date(2024, 0, 16, 14, 30);
    const result = formatScheduledTime(tomorrow);
    expect(result).toContain('Tomorrow');
  });

  it('formats other dates with month/day', () => {
    const future = new Date(2024, 0, 20, 14, 30);
    const result = formatScheduledTime(future);
    expect(result).toContain('Jan 20');
  });
});

describe('getWeekDates', () => {
  it('returns 7 consecutive dates', () => {
    const start = new Date(2024, 0, 14); // Sunday
    const dates = getWeekDates(start);
    expect(dates).toHaveLength(7);
    expect(dates[0].getDate()).toBe(14);
    expect(dates[6].getDate()).toBe(20);
  });
});

describe('getMonthCalendarDates', () => {
  it('returns dates for month calendar grid', () => {
    const date = new Date(2024, 0, 15);
    const dates = getMonthCalendarDates(date);
    expect(dates.length).toBeGreaterThanOrEqual(28);
    expect(dates.length).toBeLessThanOrEqual(42);
    // First date should be start of week containing first of month
    expect(dates[0].getDay()).toBe(0); // Sunday
  });
});

describe('daysBetween', () => {
  it('calculates days between dates', () => {
    const start = new Date(2024, 0, 15);
    const end = new Date(2024, 0, 20);
    expect(daysBetween(start, end)).toBe(5);
  });

  it('handles negative differences', () => {
    const start = new Date(2024, 0, 20);
    const end = new Date(2024, 0, 15);
    expect(daysBetween(start, end)).toBe(-5);
  });
});
