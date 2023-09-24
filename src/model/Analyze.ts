import type { Rectangle } from '@/module/ImageProcessor';

export const Element = {
  TITLE: 'title',
  DIFFICULT: 'difficult',
  COMBO: 'combo',
  PERFECT: 'perfect',
  GREAT: 'great',
  GOOD: 'good',
  BAD: 'bad',
  MISS: 'miss',
  LATE: 'late',
  FAST: 'fast',
  FLICK: 'flick',
} as const;

export type Element = (typeof Element)[keyof typeof Element];

export const ElementList = [
  Element.TITLE,
  Element.DIFFICULT,
  Element.COMBO,
  Element.PERFECT,
  Element.GREAT,
  Element.GOOD,
  Element.BAD,
  Element.MISS,
  Element.LATE,
  Element.FAST,
  Element.FLICK,
] as const;

interface DataSet<T> {
  [Element.TITLE]: T;
  [Element.DIFFICULT]: T;
  [Element.COMBO]: T;
  [Element.PERFECT]: T;
  [Element.GREAT]: T;
  [Element.GOOD]: T;
  [Element.BAD]: T;
  [Element.MISS]: T;
  [Element.LATE]: T;
  [Element.FAST]: T;
  [Element.FLICK]: T;
}

export type AnalyzeRecord = DataSet<string>;
export type ImagePosition = DataSet<Rectangle>;
