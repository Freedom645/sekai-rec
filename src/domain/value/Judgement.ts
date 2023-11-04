export const Judgment = {
  LATE: 'late',
  FAST: 'fast',
  FLICK: 'flick',
} as const;

export type Judgment = (typeof Judgment)[keyof typeof Judgment];

export const JudgmentList = [Judgment.LATE, Judgment.FAST, Judgment.FLICK] as const;
