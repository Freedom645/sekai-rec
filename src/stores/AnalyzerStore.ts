import ImageProcessor from '@/module/ImageProcessor';
import { analyze } from '@/module/ScoreAnalyzer';
import { defineStore } from 'pinia';
import { useMusicStore } from './MusicStore';
import { Accuracy, Judgment, type ScoreData } from '@/model/Score';
import { type AnalyzeRecord, Element } from '@/model/Analyze';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';

export interface Settings {
  files: File[];
}

type OcrStepKey = 'not-start' | 'threshold' | 'init' | 'ocr' | 'correct' | 'completed';

interface OcrStep {
  key: OcrStepKey;
  name: string;
}
export const OcrSteps = [
  { key: 'not-start', name: '未解析' },
  { key: 'threshold', name: '前処理' },
  { key: 'init', name: 'セットアップ' },
  { key: 'ocr', name: '画像解析' },
  { key: 'correct', name: 'データ補正' },
  { key: 'completed', name: '完了' },
] as const;

export const useAnalyzerStore = defineStore('analyzer', {
  state: () => ({
    settings: {
      files: [] as File[],
    } as Settings,
    progress: {
      state: OcrSteps[0] as OcrStep,
      threshold: 0,
      ocrTask: 0,
      correct: 0,
      errorText: '',
    },
    completedData: {
      urls: [] as string[],
      scoreData: [] as ScoreData[],
    },
  }),
  getters: {
    getProgress: (state) => state.progress,
  },
  actions: {
    setSettings(settings: Partial<Settings>): void {
      this.settings.files.splice(0);
      this.settings.files.push(...(settings.files ?? []));
    },
    initializeProgress(): void {
      this.progress.state = OcrSteps[0];
      this.progress.threshold = 0;
      this.progress.ocrTask = 0;
      this.progress.correct = 0;
      this.progress.errorText = '';
      this.completedData.urls.forEach((file) => URL.revokeObjectURL(file));
      this.completedData.urls.splice(0);
      this.completedData.scoreData.splice(0);
    },
    proceedOcrStep(key?: OcrStepKey): void {
      const next = OcrSteps.findIndex((step) => step.key === (key ?? this.progress.state.key)) + (key ? 0 : 1);
      if (next <= 0 || OcrSteps.length <= next) {
        throw new Error('Implementation error.');
      }
      this.progress.state = OcrSteps[next];
    },
    async convertThresholdUrls(urls: string[]): Promise<string[]> {
      this.progress.threshold = 0;

      let completed = 0;
      const thresholdUrls = await Promise.all(
        urls.map((url) =>
          ImageProcessor.convertThresholdImage(url).then((res) => {
            completed++;
            this.progress.threshold = (completed * 100) / urls.length;
            return res;
          })
        )
      );

      this.progress.threshold = 100;
      return thresholdUrls;
    },
    correcting(records: AnalyzeRecord[]): ScoreData[] {
      const { searchFuzzy } = useMusicStore();
      let comp = 0;
      const scoreDataList = records.map((rec) => {
        const list = searchFuzzy(rec[Element.TITLE]);
        rec[Element.TITLE] = list[0].title;
        comp++;
        this.progress.correct = ((records.length - comp) * 100) / records.length;

        // TODO 変換はここでやることではない
        const scoreData: ScoreData = {
          musicId: list[0].musicId,
          difficulty:
            DifficultyRankList.find((diff) => diff.toUpperCase() === rec[Element.DIFFICULT].toUpperCase()) ??
            DifficultyRank.EASY,
          combo: Number.parseInt(rec[Element.COMBO]),
          accuracyCount: {
            [Accuracy.PERFECT]: Number.parseInt(rec[Element.PERFECT]),
            [Accuracy.GREAT]: Number.parseInt(rec[Element.GREAT]),
            [Accuracy.GOOD]: Number.parseInt(rec[Element.GOOD]),
            [Accuracy.BAD]: Number.parseInt(rec[Element.BAD]),
            [Accuracy.MISS]: Number.parseInt(rec[Element.MISS]),
          },
          judgmentCount: {
            [Judgment.LATE]: Number.parseInt(rec[Element.LATE]),
            [Judgment.FAST]: Number.parseInt(rec[Element.FAST]),
            [Judgment.FLICK]: Number.parseInt(rec[Element.FLICK]),
          },
        };

        return scoreData;
      });
      this.progress.correct = 100;
      return scoreDataList;
    },
    async startAnalyzing(): Promise<string> {
      if (this.settings.files === undefined || this.settings.files.length === 0) {
        return 'ファイルが選択されていません。';
      }
      this.initializeProgress();
      const urls = this.settings.files.map((file) => URL.createObjectURL(file));
      this.completedData.urls = urls;
      try {
        // 二値化
        this.proceedOcrStep('threshold');
        const thresholdUrls = await this.convertThresholdUrls(urls);

        // OCRセットアップ ～ 解析
        this.proceedOcrStep('init');
        const callback = (s: 'ocr' | 'setup', v: number): void => {
          if (s === 'setup') {
            return;
          }
          this.proceedOcrStep('ocr');
          this.progress.ocrTask = v;
        };
        const records = await analyze(thresholdUrls, callback);

        // データ補正
        this.proceedOcrStep('correct');
        this.completedData.scoreData.push(...this.correcting(records));

        // 完了
        this.proceedOcrStep('completed');

        return '';
      } catch (e) {
        if (e instanceof Error) {
          this.progress.errorText = e.message;
        }
        this.progress.errorText = (e as Object)?.toString() ?? 'Unknown Error';

        urls.forEach((url) => URL.revokeObjectURL(url));
        urls.splice(0);
        return this.progress.errorText;
      }
    },
  },
});
