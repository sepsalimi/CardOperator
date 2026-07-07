import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  generatePuzzle,
  isPuzzleSolvable,
  orderOperatorsByPrecedence,
  puzzleNumberSignature,
  solutionNumberSignature,
} from '../src/game/generatePuzzle';
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

  it('puts multiplication or division before addition or subtraction', () => {
    expect(orderOperatorsByPrecedence(['+', '*'])).toEqual(['*', '+']);
    expect(orderOperatorsByPrecedence(['-', '/'])).toEqual(['/', '-']);
    expect(orderOperatorsByPrecedence(['*', '+'])).toEqual(['*', '+']);
  });

  it('includes whole-number division in hard mode', () => {
    const puzzle = generatePuzzle('hard', () => 0.999999);
    expect(puzzle.operators).toContain('/');
    expect(isPuzzleSolvable(puzzle)).toBe(true);
  });

  it('never places a high-precedence operator after a low-precedence operator', () => {
    for (let index = 0; index < 250; index += 1) {
      const puzzle = generatePuzzle('hard');
      expect(
        ['+', '-'].includes(puzzle.operators[0]) && ['*', '/'].includes(puzzle.operators[1]),
      ).toBe(false);
    }
  });

  it('treats permutations of the same three numbers as one signature', () => {
    expect(solutionNumberSignature([10, 2, 3])).toBe(solutionNumberSignature([10, 3, 2]));
  });

  it('does not repeat a solution-number combination within a round', () => {
    const seen = new Set<string>();
    for (let index = 0; index < 60; index += 1) {
      const puzzle = generatePuzzle('hard', () => 0.999999, seen);
      const signature = puzzleNumberSignature(puzzle);
      expect(seen.has(signature)).toBe(false);
      seen.add(signature);
    }
  });
});
