import { describe, it, expect } from 'vitest';
import {
  parseTimeToMinutes,
  parseEventTimeToMinutes,
  minutesToDate,
  dateToMinutes,
  formatHourLabel,
  formatHourLabel24,
  formatMinutesToTime,
  formatDisplayTime,
  getTimeDuration,
  isTimeInRange,
} from './timeUtils';

describe('parseTimeToMinutes', () => {
  it('parses HH:MM format', () => {
    expect(parseTimeToMinutes('09:30')).toBe(9 * 60 + 30);
    expect(parseTimeToMinutes('14:00')).toBe(14 * 60);
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59);
  });

  it('parses HH:MM:SS format', () => {
    expect(parseTimeToMinutes('09:30:00')).toBe(9 * 60 + 30);
    expect(parseTimeToMinutes('14:00:45')).toBe(14 * 60);
  });

  it('returns 0 for invalid input', () => {
    expect(parseTimeToMinutes('')).toBe(0);
    expect(parseTimeToMinutes(undefined)).toBe(0);
    expect(parseTimeToMinutes('invalid')).toBe(0);
  });
});

describe('parseEventTimeToMinutes', () => {
  it('parses 24-hour format', () => {
    expect(parseEventTimeToMinutes('14:30')).toBe(14 * 60 + 30);
    expect(parseEventTimeToMinutes('09:00')).toBe(9 * 60);
  });

  it('parses 12-hour AM/PM format', () => {
    expect(parseEventTimeToMinutes('2:30 PM')).toBe(14 * 60 + 30);
    expect(parseEventTimeToMinutes('9:00 AM')).toBe(9 * 60);
    expect(parseEventTimeToMinutes('12:00 PM')).toBe(12 * 60);
    expect(parseEventTimeToMinutes('12:00 AM')).toBe(0);
  });

  it('handles case insensitivity', () => {
    expect(parseEventTimeToMinutes('2:30 pm')).toBe(14 * 60 + 30);
    expect(parseEventTimeToMinutes('9:00 am')).toBe(9 * 60);
  });

  it('returns null for invalid input', () => {
    expect(parseEventTimeToMinutes('')).toBe(null);
    expect(parseEventTimeToMinutes(undefined)).toBe(null);
    expect(parseEventTimeToMinutes('invalid')).toBe(null);
  });
});

describe('minutesToDate', () => {
  it('converts minutes to date on reference day', () => {
    const ref = new Date(2024, 0, 15, 0, 0, 0);
    const result = minutesToDate(14 * 60 + 30, ref);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getDate()).toBe(15);
  });
});

describe('dateToMinutes', () => {
  it('extracts minutes from date', () => {
    const date = new Date(2024, 0, 15, 14, 30, 0);
    expect(dateToMinutes(date)).toBe(14 * 60 + 30);
  });
});

describe('formatHourLabel', () => {
  it('formats hours in 12-hour format', () => {
    expect(formatHourLabel(0)).toBe('12AM');
    expect(formatHourLabel(1)).toBe('1AM');
    expect(formatHourLabel(12)).toBe('12PM');
    expect(formatHourLabel(13)).toBe('1PM');
    expect(formatHourLabel(23)).toBe('11PM');
  });
});

describe('formatHourLabel24', () => {
  it('formats hours in 24-hour format', () => {
    expect(formatHourLabel24(0)).toBe('00:00');
    expect(formatHourLabel24(9)).toBe('09:00');
    expect(formatHourLabel24(14)).toBe('14:00');
  });
});

describe('formatMinutesToTime', () => {
  it('formats in 12-hour by default', () => {
    expect(formatMinutesToTime(14 * 60 + 30)).toBe('2:30 PM');
    expect(formatMinutesToTime(9 * 60)).toBe('9:00 AM');
    expect(formatMinutesToTime(0)).toBe('12:00 AM');
  });

  it('formats in 24-hour when specified', () => {
    expect(formatMinutesToTime(14 * 60 + 30, '24h')).toBe('14:30');
    expect(formatMinutesToTime(9 * 60, '24h')).toBe('09:00');
  });
});

describe('formatDisplayTime', () => {
  it('normalizes various time formats', () => {
    expect(formatDisplayTime('14:30')).toBe('2:30 PM');
    expect(formatDisplayTime('9:00 AM')).toBe('9:00 AM');
    expect(formatDisplayTime('19:00')).toBe('7:00 PM');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDisplayTime('')).toBe('');
    expect(formatDisplayTime(undefined)).toBe('');
  });
});

describe('getTimeDuration', () => {
  it('calculates duration between times', () => {
    expect(getTimeDuration('09:00', '10:30')).toBe(90);
    expect(getTimeDuration('9:00 AM', '2:30 PM')).toBe(5 * 60 + 30);
  });

  it('handles overnight durations', () => {
    expect(getTimeDuration('23:00', '01:00')).toBe(2 * 60);
  });

  it('returns null for invalid input', () => {
    expect(getTimeDuration('invalid', '10:00')).toBe(null);
  });
});

describe('isTimeInRange', () => {
  it('checks if time is in range', () => {
    expect(isTimeInRange(10 * 60, 9 * 60, 17 * 60)).toBe(true);
    expect(isTimeInRange(8 * 60, 9 * 60, 17 * 60)).toBe(false);
    expect(isTimeInRange(18 * 60, 9 * 60, 17 * 60)).toBe(false);
  });

  it('handles overnight ranges', () => {
    // Range from 10 PM to 2 AM
    expect(isTimeInRange(23 * 60, 22 * 60, 2 * 60)).toBe(true);
    expect(isTimeInRange(1 * 60, 22 * 60, 2 * 60)).toBe(true);
    expect(isTimeInRange(12 * 60, 22 * 60, 2 * 60)).toBe(false);
  });
});
