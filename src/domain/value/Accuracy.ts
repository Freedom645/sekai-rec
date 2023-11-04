export const Accuracy = {
  PERFECT: 'perfect',
  GREAT: 'great',
  GOOD: 'good',
  BAD: 'bad',
  MISS: 'miss',
} as const;

export type Accuracy = (typeof Accuracy)[keyof typeof Accuracy];

export const AccuracyList = [Accuracy.PERFECT, Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS] as const;
