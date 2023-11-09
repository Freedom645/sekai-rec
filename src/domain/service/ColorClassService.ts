import type { Rectangle } from '@/core/Geometry';
import type { IAnalyzer } from '@/domain/service/AnalysisService';
import { ImageCanvas } from '@/domain/entity/ImageCanvas';
import { Difficulty, DifficultyList, type DifficultyKV } from '@/domain/value/Difficulty';

const rgb2hsv = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const h =
    d &&
    (60 *
      {
        [r]: (g - b) / d,
        [g]: (b - r) / d + 2,
        [b]: (r - g) / d + 4,
      }[max] +
      360) %
      360;

  const s = ((max - min) / max) * 255;
  const v = max;

  return [h, s, v] as const;
};

export class ColorClassService implements IAnalyzer {
  private static readonly RangeTable = [
    { low: 0, high: 20, diff: Difficulty.EXPERT },
    { low: 20, high: 60, diff: Difficulty.HARD },
    { low: 60, high: 160, diff: Difficulty.EASY },
    { low: 160, high: 220, diff: Difficulty.NORMAL },
    { low: 260, high: 320, diff: Difficulty.MASTER },
    { low: 320, high: 360, diff: Difficulty.EXPERT },
  ];

  public constructor() {}

  async setup(): Promise<void> {
    return;
  }

  async recognize(image: string, rectangle: Rectangle): Promise<string> {
    const canvas = await ImageCanvas.loadUrl(image);
    const counter = DifficultyList.reduce((obj, diff) => Object.assign(obj, { [diff]: 0 }), {} as DifficultyKV<number>);
    canvas.scanBitmap(rectangle, ({ r, g, b }) => {
      const [h] = rgb2hsv(r, g, b);
      const diff = ColorClassService.RangeTable.find((rec) => rec.low <= h && h < rec.high)?.diff ?? Difficulty.APPEND;
      counter[diff]++;
    });

    return DifficultyList.reduce((max, key) => (counter[max] < counter[key] ? key : max), Difficulty.APPEND);
  }

  async teardown(): Promise<void> {
    return;
  }
}
