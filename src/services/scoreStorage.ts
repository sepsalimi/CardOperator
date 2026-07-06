import type { Difficulty } from '../game/types';

export type BestScores = Record<Difficulty, number>;
const KEY = 'card-operator:scores:v1';
export const emptyBestScores = (): BestScores => ({ easy: 0, medium: 0, hard: 0 });

export function loadBestScores(): BestScores {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<BestScores>;
    return {
      easy: Number.isFinite(parsed.easy) ? Math.max(0, parsed.easy!) : 0,
      medium: Number.isFinite(parsed.medium) ? Math.max(0, parsed.medium!) : 0,
      hard: Number.isFinite(parsed.hard) ? Math.max(0, parsed.hard!) : 0,
    };
  } catch {
    return emptyBestScores();
  }
}

export function saveBestScore(difficulty: Difficulty, score: number): BestScores {
  const next = { ...loadBestScores(), [difficulty]: Math.max(loadBestScores()[difficulty], score) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
