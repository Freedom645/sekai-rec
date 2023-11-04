import type { Rectangle } from '@/core/Geometry';
import type { AnalysisMethodType } from '../value/AnalysisMethodType';

export interface IImageProcessor {
  binarize(image: string): Promise<string>;
  merge(base: string): Promise<string>;
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
    this.imageProcessor = args.imageProcessor;
    this.analyzerSet = args.analyzer;
  }

  public async execute(images: string[], progress: IProgress): Promise<void> {
    const tasks = (Object.values(this.analyzerSet) as IAnalyzer[]).map((d) => d.setup());
    await Promise.all(tasks);
    progress.updateSetup(100);
  }
}
