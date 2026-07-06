import { evaluateEquation } from './evaluateEquation';
import {
  difficultyConfig,
  type Difficulty,
  type NumberCard,
  type Operator,
  type Puzzle,
} from './types';

export type RandomSource = () => number;
let puzzleSequence = 0;

const integer = (random: RandomSource, min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;

const choose = <T>(random: RandomSource, items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];

function shuffle<T>(random: RandomSource, input: T[]): T[] {
  const result = [...input];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function generatePuzzle(difficulty: Difficulty, random: RandomSource = Math.random): Puzzle {
  const allowed = difficultyConfig[difficulty].operators;
  let values: [number, number, number] = [1, 1, 1];
  let operators: [Operator, Operator] = ['+', '+'];
  let target = 3;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    values = [integer(random, 1, 12), integer(random, 1, 12), integer(random, 1, 12)];
    operators = [choose(random, allowed), choose(random, allowed)];
    target = evaluateEquation(values, operators);
    if (target >= 0 && target <= 150) break;
  }

  const sequence = puzzleSequence++;
  const solutionCards = values.map((value, index) => ({ id: `p${sequence}-s${index}`, value })) as [
    NumberCard,
    NumberCard,
    NumberCard,
  ];
  const distractors = Array.from({ length: 3 }, (_, index) => ({
    id: `p${sequence}-d${index}`,
    value: integer(random, 1, 12),
  }));

  return {
    id: `puzzle-${sequence}`,
    cards: shuffle(random, [...solutionCards, ...distractors]),
    operators,
    target,
    solutionCardIds: solutionCards.map((card) => card.id) as [string, string, string],
  };
}

export function isPuzzleSolvable(puzzle: Puzzle): boolean {
  const values = puzzle.solutionCardIds.map(
    (id) => puzzle.cards.find((card) => card.id === id)?.value,
  );
  return (
    values.every((value): value is number => value !== undefined) &&
    evaluateEquation(values as [number, number, number], puzzle.operators) === puzzle.target
  );
}
