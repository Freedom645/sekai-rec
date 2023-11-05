export const AnalysisElementType = {
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

export type AnalysisElementType = (typeof AnalysisElementType)[keyof typeof AnalysisElementType];

export const AnalysisElementTypeList = [
  AnalysisElementType.TITLE,
  AnalysisElementType.DIFFICULT,
  AnalysisElementType.COMBO,
  AnalysisElementType.PERFECT,
  AnalysisElementType.GREAT,
  AnalysisElementType.GOOD,
  AnalysisElementType.BAD,
  AnalysisElementType.MISS,
  AnalysisElementType.LATE,
  AnalysisElementType.FAST,
  AnalysisElementType.FLICK,
] as const;
