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
const highPrecedenceOperators = new Set<Operator>(['*', '/']);

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

interface EquationCandidate {
  values: [number, number, number];
  operators: [Operator, Operator];
}

export function solutionNumberSignature(values: readonly number[]): string {
  return [...values].sort((left, right) => left - right).join(',');
}

export function orderOperatorsByPrecedence(operators: [Operator, Operator]): [Operator, Operator] {
  const [first, second] = operators;
  if (!highPrecedenceOperators.has(first) && highPrecedenceOperators.has(second)) {
    return [second, first];
  }
  return operators;
}

function findFallbackEquation(
  difficulty: Difficulty,
  excludedSignatures: ReadonlySet<string>,
): EquationCandidate {
  const allowed =
    difficulty === 'hard'
      ? (['/', '*', '+', '-'] as Operator[])
      : difficultyConfig[difficulty].operators;
  for (let first = 1; first <= 12; first += 1) {
    for (let second = 1; second <= 12; second += 1) {
      for (let third = 1; third <= 12; third += 1) {
        const values: [number, number, number] = [first, second, third];
        if (excludedSignatures.has(solutionNumberSignature(values))) continue;
        for (const firstOperator of allowed) {
          for (const secondOperator of allowed) {
            const operators = orderOperatorsByPrecedence([firstOperator, secondOperator]);
            try {
              const target = evaluateEquation(values, operators);
              if (target >= 0 && target <= 150) return { values, operators };
            } catch {
              // Continue until division resolves to a whole number.
            }
          }
        }
      }
    }
  }
  throw new Error('No unique puzzle number combinations remain for this round');
}

export function generatePuzzle(
  difficulty: Difficulty,
  random: RandomSource = Math.random,
  excludedSignatures: ReadonlySet<string> = new Set(),
): Puzzle {
  const allowed = difficultyConfig[difficulty].operators;
  let equation: EquationCandidate | null = null;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const values: [number, number, number] = [
      integer(random, 1, 12),
      integer(random, 1, 12),
      integer(random, 1, 12),
    ];
    if (excludedSignatures.has(solutionNumberSignature(values))) continue;
    const operators = orderOperatorsByPrecedence([
      choose(random, allowed),
      choose(random, allowed),
    ]);
    try {
      const target = evaluateEquation(values, operators);
      if (target >= 0 && target <= 150) {
        equation = { values, operators };
        break;
      }
    } catch {
      // Retry division candidates that do not resolve to whole numbers.
    }
  }

  equation ??= findFallbackEquation(difficulty, excludedSignatures);
  const { values, operators } = equation;
  const target = evaluateEquation(values, operators);
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

export function puzzleNumberSignature(puzzle: Puzzle): string {
  const values = puzzle.solutionCardIds.map(
    (id) => puzzle.cards.find((card) => card.id === id)?.value,
  );
  if (!values.every((value): value is number => value !== undefined)) {
    throw new Error('Puzzle solution cards are missing');
  }
  return solutionNumberSignature(values);
}
