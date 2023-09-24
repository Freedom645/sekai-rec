import type { DifficultyRank } from './Game';

export const Accuracy = {
  PERFECT: 'perfect',
  GREAT: 'great',
  GOOD: 'good',
  BAD: 'bad',
  MISS: 'miss',
} as const;

export type Accuracy = (typeof Accuracy)[keyof typeof Accuracy];

export const AccuracyList = [Accuracy.PERFECT, Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS] as const;

export interface AccuracyKeyValue<T> {
  [Accuracy.PERFECT]: T;
  [Accuracy.GREAT]: T;
  [Accuracy.GOOD]: T;
  [Accuracy.BAD]: T;
  [Accuracy.MISS]: T;
}

const ScoreWeight: AccuracyKeyValue<number> = {
  [Accuracy.PERFECT]: 3,
  [Accuracy.GREAT]: 2,
  [Accuracy.GOOD]: 1,
  [Accuracy.BAD]: 0,
  [Accuracy.MISS]: 0,
} as const;

export const calcRankMatchScore = (value: AccuracyKeyValue<number>): number => {
  return Object.keys(ScoreWeight).reduce(
    (sum, key) => Math.floor(Math.max(value[key as Accuracy] ?? 0, 0)) * ScoreWeight[key as Accuracy] + sum,
    0
  );
};

export type AccuracyCount = AccuracyKeyValue<number>;

export interface JudgmentCount {
  late: number;
  fast: number;
  flick: number;
}

export interface ScoreData {
  musicId: number;
  difficulty: DifficultyRank;
  combo: number;
  accuracyCount: AccuracyCount;
  judgmentCount: JudgmentCount;
}
