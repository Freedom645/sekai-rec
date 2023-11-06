import { Rectangle, type Size } from '@/core/Geometry';
import type { IAnalysisElement } from '@/domain/entity/AnalysisElement';
import { AnalysisSetting } from '@/domain/entity/AnalysisSetting';
import type { AnalysisElementType } from '@/domain/value/AnalysisElementType';
import { AnalysisMethodType } from '@/domain/value/AnalysisMethodType';

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

type ThresholdSet<T> = Partial<DataSet<T>> & { default: T };
export type DefaultKey = Element | 'default';
export type ThresholdNumber = ThresholdSet<number>;
export type ThresholdString = ThresholdSet<string>;

export interface Preset {
  key: string;
  name: string;
  size: Size;
  position: ImagePosition;
  threshold: ThresholdNumber;
}

export const generateEmptyPreset = (): Preset => ({
  key: '',
  name: '',
  size: { w: 1, h: 1 },
  position: ElementList.reduce(
    (obj, curr) => Object.assign(obj, { [curr]: Rectangle.emptyRectangle() }),
    {} as ImagePosition
  ),
  threshold: { default: 200 },
});

export const clonePreset = (preset: Preset): Preset => JSON.parse(JSON.stringify(preset));

export const convertPresetToAnalysisSetting = (preset: Preset): AnalysisSetting => {
  const elements: IAnalysisElement[] = ElementList.map((e) => {
    const element: IAnalysisElement = {
      analysisElementType: (): AnalysisElementType => e,
      analysisRange: (): Rectangle => preset.position[e],
      analysisMethod: (): AnalysisMethodType =>
        e === Element.TITLE || e === Element.DIFFICULT ? AnalysisMethodType.OCR_STRING : AnalysisMethodType.OCR_NUMBER,
      binarizeValue: (): number | undefined => preset.threshold[e] ?? preset.threshold.default,
    };
    return element;
  });

  return new AnalysisSetting({
    name: preset.name,
    imageSize: preset.size,
    elements: elements,
  });
};
