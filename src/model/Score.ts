import { DifficultyRank } from './Game';

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

export const Judgment = {
  LATE: 'late',
  FAST: 'fast',
  FLICK: 'flick',
} as const;

export type Judgment = (typeof Judgment)[keyof typeof Judgment];

export const JudgmentList = [Judgment.LATE, Judgment.FAST, Judgment.FLICK] as const;

export interface JudgmentCount {
  [Judgment.LATE]: number;
  [Judgment.FAST]: number;
  [Judgment.FLICK]: number;
}

export interface ScoreData {
  musicId: number;
  difficulty: DifficultyRank;
  combo: number;
  accuracyCount: AccuracyCount;
  judgmentCount: JudgmentCount;
}

export const emptyScoreData = () => ({
  musicId: 1,
  difficulty: DifficultyRank.MASTER,
  combo: 0,
  accuracyCount: {
    perfect: 0,
    great: 0,
    good: 0,
    bad: 0,
    miss: 0,
  },
  judgmentCount: {
    late: 0,
    fast: 0,
    flick: 0,
  },
});

export const cloneScoreData = (src: ScoreData): ScoreData => ({
  ...src,
  accuracyCount: {
    ...src.accuracyCount,
  },
  judgmentCount: {
    ...src.judgmentCount,
  },
});
