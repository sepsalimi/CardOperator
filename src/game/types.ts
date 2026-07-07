export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operator = '+' | '-' | '*' | '/';

export interface NumberCard {
  id: string;
  value: number;
}

export interface Puzzle {
  id: string;
  cards: NumberCard[];
  operators: [Operator, Operator];
  target: number;
  solutionCardIds: [string, string, string];
}

export const difficultyConfig = {
  easy: { label: 'Easy', operators: ['+'] as Operator[], points: 100, accent: 'Mint' },
  medium: { label: 'Medium', operators: ['+', '-'] as Operator[], points: 200, accent: 'Violet' },
  hard: {
    label: 'Hard',
    operators: ['+', '-', '*', '/'] as Operator[],
    points: 300,
    accent: 'Coral',
  },
} satisfies Record<
  Difficulty,
  { label: string; operators: Operator[]; points: number; accent: string }
>;
