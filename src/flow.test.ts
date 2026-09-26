import { describe, expect, it } from 'vitest';
import { dayKey, timeBlock, validateName } from './flow';

describe('6am day boundary', () => {
  it('assigns early morning to the previous calendar day across year boundaries', () => {
    expect(dayKey(new Date(2026, 0, 1, 5, 59))).toBe('2025-12-31');
    expect(dayKey(new Date(2026, 0, 1, 6))).toBe('2026-01-01');
  });
  it.each([[0, 'lateNight'], [5, 'lateNight'], [6, 'morning'], [12, 'afternoon'], [18, 'evening'], [23, 'evening']])('maps %s:00 to %s', (hour, block) => {
    expect(timeBlock(new Date(2026, 8, 24, Number(hour)))).toBe(block);
  });
});
describe('card names', () => {
  it('trims names and rejects empty input', () => {
    expect(validateName('  공부  ')).toEqual({ name: '공부', error: null });
    expect(validateName('  ').error).not.toBeNull();
  });
  it('counts visible characters, including joined emoji', () => {
    expect(validateName('👩‍💻'.repeat(100)).error).toBeNull();
    expect(validateName('가'.repeat(101)).error).not.toBeNull();
  });
});
