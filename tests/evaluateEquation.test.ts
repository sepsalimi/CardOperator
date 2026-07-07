import { describe, expect, it } from 'vitest';
import { evaluateEquation } from '../src/game/evaluateEquation';

describe('evaluateEquation', () => {
  it('evaluates addition and subtraction left to right', () => {
    expect(evaluateEquation([8, 3, 2], ['-', '+'])).toBe(7);
  });
  it('applies multiplication before addition and subtraction', () => {
    expect(evaluateEquation([2, 3, 4], ['+', '*'])).toBe(14);
    expect(evaluateEquation([8, 2, 3], ['-', '*'])).toBe(2);
  });
  it('supports whole-number division for future use', () => {
    expect(evaluateEquation([12, 3, 2], ['/', '+'])).toBe(6);
    expect(() => evaluateEquation([5, 2, 1], ['/', '+'])).toThrow(/whole number/);
    expect(() => evaluateEquation([5, 0, 1], ['/', '+'])).toThrow(/whole number/);
  });
});
