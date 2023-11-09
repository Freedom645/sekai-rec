import { createWorker, createScheduler, PSM, type Scheduler } from 'tesseract.js';
import type { Rectangle } from '@/core/Geometry';
import type { IAnalyzer } from './AnalysisService';

export type OcrType = 'string' | 'number';

export interface Option {
  workerNum: number;
}

const Settings = {
  string: {
    language: 'eng+jpn',
    initialize: 'eng+jpn',
    parameters: {
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
    } as Partial<Tesseract.WorkerParams>,
  },
  number: {
    language: 'eng',
    initialize: 'eng',
    parameters: {
      tessedit_char_whitelist: '0123456789',
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
    } as Partial<Tesseract.WorkerParams>,
  },
} as const;

export class OcrService implements IAnalyzer {
  private scheduler?: Scheduler;
  private readonly options: Option;

  public constructor(private readonly ocrType: OcrType, options?: Option) {
    this.options = { workerNum: 1, ...options };
  }

  public async setup(): Promise<void> {
    this.scheduler = createScheduler();
    for (let i = 0; i < this.options.workerNum; i++) {
      this.scheduler?.addWorker(await this.createWorker(this.ocrType));
    }
  }

  private async createWorker(type: OcrType) {
    const setting = Settings[type];
    if (setting === undefined) {
      throw new Error(`Not implements ocr type: ${type}`);
    }

    const worker = await createWorker();
    await worker.loadLanguage(setting.language);
    await worker.initialize(setting.initialize);
    await worker.setParameters(setting.parameters);
    return worker;
  }

  public recognize(image: string, rectangle: Rectangle): Promise<string> {
    if (this.scheduler === undefined) {
      throw new Error(`Scheduler setup is not completed.`);
    }

    return this.scheduler
      .addJob('recognize', image, { rectangle: rectangle.convertTesseractRect() })
      .then((res) => res.data.text.replace(/\r?\n$/, ''));
  }

  async teardown(): Promise<void> {
    await this.scheduler?.terminate();
  }
}
