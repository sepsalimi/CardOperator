import { difficultyConfig, type Difficulty } from './types';

export const scoreForCorrectAnswer = (difficulty: Difficulty): number =>
  difficultyConfig[difficulty].points;
