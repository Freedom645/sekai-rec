export const Difficulty = {
  APPEND: 'append',
  MASTER: 'master',
  EXPERT: 'expert',
  HARD: 'hard',
  NORMAL: 'normal',
  EASY: 'easy',
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const DifficultyList = [
  Difficulty.APPEND,
  Difficulty.MASTER,
  Difficulty.EXPERT,
  Difficulty.HARD,
  Difficulty.NORMAL,
  Difficulty.EASY,
] as const;
