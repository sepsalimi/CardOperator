import { beforeEach, describe, expect, it } from 'vitest';
import { loadBestScores, saveBestScore } from '../src/services/scoreStorage';

describe('best score storage', () => {
  beforeEach(() => localStorage.clear());
  it('keeps only the highest score for each difficulty', () => {
    saveBestScore('easy', 500);
    saveBestScore('easy', 200);
    expect(loadBestScores().easy).toBe(500);
  });
  it('recovers from malformed data', () => {
    localStorage.setItem('card-operator:scores:v1', '{bad');
    expect(loadBestScores()).toEqual({ easy: 0, medium: 0, hard: 0 });
  });
});
