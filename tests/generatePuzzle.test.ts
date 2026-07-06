import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { generatePuzzle, isPuzzleSolvable } from '../src/game/generatePuzzle';
import { difficultyConfig, type Difficulty } from '../src/game/types';

describe('generatePuzzle', () => {
  it.each(['easy', 'medium', 'hard'] as Difficulty[])(
    'always creates valid %s puzzles',
    (difficulty) => {
      fc.assert(
        fc.property(fc.integer(), (seed) => {
          const random = fc.sample(fc.double({ min: 0, max: 0.999999, noNaN: true }), {
            seed,
            numRuns: 300,
          });
          let index = 0;
          const puzzle = generatePuzzle(difficulty, () => random[index++ % random.length]);
          expect(puzzle.cards).toHaveLength(6);
          expect(new Set(puzzle.cards.map((card) => card.id)).size).toBe(6);
          expect(
            puzzle.operators.every((operator) =>
              difficultyConfig[difficulty].operators.includes(operator),
            ),
          ).toBe(true);
          expect(Number.isInteger(puzzle.target)).toBe(true);
          expect(puzzle.target).toBeGreaterThanOrEqual(0);
          expect(puzzle.target).toBeLessThanOrEqual(150);
          expect(isPuzzleSolvable(puzzle)).toBe(true);
        }),
        { numRuns: 30 },
      );
    },
  );
});
