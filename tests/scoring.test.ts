import { describe, expect, it } from 'vitest';
import { scoreForCorrectAnswer } from '../src/game/scoring';

describe('scoring', () => {
  it('awards clear difficulty-based points', () => {
    expect(scoreForCorrectAnswer('easy')).toBe(100);
    expect(scoreForCorrectAnswer('medium')).toBe(200);
    expect(scoreForCorrectAnswer('hard')).toBe(300);
  });
});
