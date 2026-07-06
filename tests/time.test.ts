import { describe, expect, it } from 'vitest';
import { adjustDeadline, remainingFromDeadline } from '../src/game/time';

describe('game time adjustments', () => {
  it('adds five seconds after a correct answer', () => {
    expect(adjustDeadline(70_000, 5_000, 10_000)).toBe(75_000);
    expect(remainingFromDeadline(75_000, 10_000)).toBe(65_000);
  });

  it('removes two seconds after a wrong answer', () => {
    expect(adjustDeadline(70_000, -2_000, 10_000)).toBe(68_000);
    expect(remainingFromDeadline(68_000, 10_000)).toBe(58_000);
  });

  it('never moves the deadline before now', () => {
    expect(adjustDeadline(11_000, -2_000, 10_000)).toBe(10_000);
    expect(remainingFromDeadline(10_000, 10_000)).toBe(0);
  });
});
