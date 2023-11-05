import type { Rectangle } from '@/core/Geometry';
import { AnalysisMethodType } from '@/domain/value/AnalysisMethodType';
import type { AnalysisSetting } from '@/domain/entity/AnalysisSetting';

export interface IImageProcessor {
  binarize(image: string, threshold: number): Promise<string>;
  crop(image: string, position: Rectangle): Promise<string>;
  merge(base: string, image: string, position: Rectangle): Promise<string>;
}

export interface IAnalyzer {
  setup(): Promise<void>;
  recognize(image: string, rectangle: Rectangle): Promise<string>;
}

export interface IProgress {
  updateSetup(rate: number): void;
  updateBinarize(rate: number): void;
  updateAnalysis(rate: number): void;
  updateCo(rate: number): void;
}

export interface AnalyzerSet {
  [AnalysisMethodType.OCR_STRING]: IAnalyzer;
  [AnalysisMethodType.OCR_NUMBER]: IAnalyzer;
  [AnalysisMethodType.P_HASH]: IAnalyzer;
}

export class AnalysisService {
  private readonly analyzerSet: AnalyzerSet;
  private readonly imageProcessor: IImageProcessor;

  constructor(args: { analyzer: AnalyzerSet; imageProcessor: IImageProcessor }) {
    this.analyzerSet = args.analyzer;
    this.imageProcessor = args.imageProcessor;
  }

  public async execute(images: string[], settings: AnalysisSetting, progress: IProgress): Promise<void> {
    // セットアップ
    progress.updateSetup(0);
    const setupTasks = (Object.values(this.analyzerSet) as IAnalyzer[]).map((d) => d.setup());
    await Promise.all(setupTasks);
    progress.updateSetup(100);

    //
    progress.updateBinarize(0);
    images.map((img) => this.binarize(img, settings));
    progress.updateBinarize(100);
  }

  private async binarize(image: string, settings: AnalysisSetting) {
    interface Task {
      img: string;
      range: Rectangle;
    }

    const task: Promise<Task | undefined>[] = settings.elements.map(async (e) => {
      const value = e.binarizeValue();
      if (value === undefined) {
        return undefined;
      }
      const range = e.analysisRange();
      const cropped = await this.imageProcessor.crop(image, range);
      const img = await this.imageProcessor.binarize(cropped, value);

      return { img, range } as Task;
    });

    const binarize = await Promise.all(task);

    let output = image;
    for (const data of binarize) {
      if (data !== undefined) {
        output = await this.imageProcessor.merge(output, data.img, data.range);
      }
    }

    return output;
  }
}
