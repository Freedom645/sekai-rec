import { analyze, generateThresholdUrls } from '@/module/ScoreAnalyzer';
import { defineStore } from 'pinia';
import { useMusicStore } from './MusicStore';
import { type AnalyzeRecord, Element, type Preset, type ThresholdNumber, type ThresholdString } from '@/model/Analyze';
import { RegistrationScore } from '@/domain/entity/RegistrationScore';
import { Accuracy } from '@/domain/value/Accuracy';
import { Judgment } from '@/domain/value/Judgement';
import { Difficulty, DifficultyList } from '@/domain/value/Difficulty';

export interface Settings {
  files: File[];
  preset: Preset | undefined;
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
      files: [],
      preset: undefined,
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
      thresholdUrls: [] as ThresholdString[],
      scoreData: [] as RegistrationScore[],
      isUnregister: [] as boolean[],
    },
  }),
  getters: {
    getProgress: (state) => state.progress,
    getScoreData:
      (state) =>
      (index: number): RegistrationScore | undefined =>
        state.completedData.scoreData[index],
    getUrlData:
      (state) =>
      (index: number): string | undefined =>
        state.completedData.urls[index],
  },
  actions: {
    setSettings(settings: Partial<Settings>): void {
      this.settings.files.splice(0);
      this.settings.files.push(...(settings.files ?? []));
      this.settings.preset = settings.preset ?? this.settings.preset;
    },
    initializeProgress(): void {
      this.progress.state = OcrSteps[0];
      this.progress.threshold = 0;
      this.progress.ocrTask = 0;
      this.progress.correct = 0;
      this.progress.errorText = '';
      this.completedData.urls.forEach((file) => URL.revokeObjectURL(file));
      this.completedData.urls.splice(0);
      this.completedData.thresholdUrls.splice(0);
      this.completedData.scoreData.splice(0);
      this.completedData.isUnregister.splice(0);
    },
    proceedOcrStep(nextKey?: OcrStepKey): void {
      const next = OcrSteps.findIndex((step) => step.key === (nextKey ?? this.progress.state.key)) + (nextKey ? 0 : 1);
      if (next <= 0 || OcrSteps.length <= next) {
        throw new Error('Implementation error.');
      }
      this.progress.state = OcrSteps[next];
    },
    async convertThresholdUrls(urls: string[], thresholdValue: ThresholdNumber): Promise<ThresholdString[]> {
      this.progress.threshold = 0;

      let completed = 0;
      const thresholdUrls: ThresholdString[] = await Promise.all(
        urls.map((url) =>
          generateThresholdUrls(url, thresholdValue).then((res) => {
            completed++;
            this.progress.threshold = (completed * 100) / urls.length;
            return res;
          })
        )
      );

      this.progress.threshold = 100;
      return thresholdUrls;
    },
    correcting(records: AnalyzeRecord[]): RegistrationScore[] {
      const { searchFuzzy } = useMusicStore();
      let comp = 0;
      const scoreDataList = records.map((rec) => {
        const list = searchFuzzy(rec[Element.TITLE]);
        rec[Element.TITLE] = list[0].title;
        comp++;
        this.progress.correct = ((records.length - comp) * 100) / records.length;
        const parser = (value: string) => {
          const parsed = Number.parseInt(value);
          return Number.isNaN(parsed) ? 0 : parsed;
        };
        const scoreData = new RegistrationScore({
          musicId: list[0].musicId,
          difficulty:
            DifficultyList.find((diff) => diff.toUpperCase() === rec[Element.DIFFICULT].toUpperCase()) ??
            Difficulty.EASY,
          combo: parser(rec[Element.COMBO]),
          accuracy: {
            [Accuracy.PERFECT]: parser(rec[Element.PERFECT]),
            [Accuracy.GREAT]: parser(rec[Element.GREAT]),
            [Accuracy.GOOD]: parser(rec[Element.GOOD]),
            [Accuracy.BAD]: parser(rec[Element.BAD]),
            [Accuracy.MISS]: parser(rec[Element.MISS]),
          },
          judgement: {
            [Judgment.LATE]: parser(rec[Element.LATE]),
            [Judgment.FAST]: parser(rec[Element.FAST]),
            [Judgment.FLICK]: parser(rec[Element.FLICK]),
          },
        });

        return scoreData;
      });
      this.progress.correct = 100;
      return scoreDataList;
    },
    async startAnalyzing(): Promise<string> {
      if (this.settings.files === undefined || this.settings.files.length === 0) {
        return 'ファイルが選択されていません。';
      }
      if (this.settings.preset === undefined) {
        return 'プリセットが選択されていません。';
      }
      this.initializeProgress();
      const urls = this.settings.files.map((file) => URL.createObjectURL(file));
      this.completedData.urls = urls;
      try {
        // 二値化
        this.proceedOcrStep('threshold');
        const thresholdUrls = await this.convertThresholdUrls(urls, this.settings.preset.threshold);
        this.completedData.thresholdUrls.push(...thresholdUrls);

        // OCRセットアップ ～ 解析
        this.proceedOcrStep('init');
        const callback = (s: 'ocr' | 'setup', v: number): void => {
          if (s === 'setup') {
            return;
          }
          this.proceedOcrStep('ocr');
          this.progress.ocrTask = v;
        };
        const records = await analyze(thresholdUrls, this.settings.preset, callback);

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

        console.error(e);

        urls.forEach((url) => URL.revokeObjectURL(url));
        urls.splice(0);
        return this.progress.errorText;
      }
    },
    fixScoreData(index: number, scoreData: RegistrationScore): void {
      if (index < 0 || this.completedData.scoreData.length <= index) {
        throw new Error('Implementation error.');
      }
      this.completedData.scoreData[index] = scoreData;
    },
  },
});
