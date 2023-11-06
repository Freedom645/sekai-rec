import { defineStore } from 'pinia';
import { useMusicStore } from './MusicStore';
import { type Preset, convertPresetToAnalysisSetting } from '@/model/Analyze';
import { Difficulty, DifficultyList } from '@/domain/value/Difficulty';
import type { AnalysisResult } from '@/domain/entity/AnalysisResult';
import { AnalysisService, type AnalyzerSet, type ICorrector, type IProgress } from '@/domain/service/AnalysisService';
import { AnalysisMethodType } from '@/domain/value/AnalysisMethodType';
import { OcrService } from '@/domain/service/OcrService';
import { AnalysisSetting } from '@/domain/entity/AnalysisSetting';
import type { RegistrationScore } from '@/domain/entity/RegistrationScore';
import { PHashService } from '@/domain/service/PHashService';

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
  { key: 'init', name: 'セットアップ' },
  { key: 'threshold', name: '前処理' },
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
    completedData: [] as AnalysisResult[],
  }),
  getters: {
    getScoreData:
      (state) =>
      (index: number): RegistrationScore | undefined =>
        state.completedData[index]?.score,
    getUrlData:
      (state) =>
      (index: number): string | undefined =>
        state.completedData[index]?.originalImage,
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
      this.completedData.forEach((d) => URL.revokeObjectURL(d.originalImage));
      this.completedData.splice(0);
    },
    generateCorrector(): ICorrector {
      const { searchFuzzy } = useMusicStore();

      return {
        searchMusicTitle: (title) => searchFuzzy(title)[0].musicId,
        searchDifficulty: (difficulty) => DifficultyList.find((v) => v === difficulty) ?? Difficulty.EASY,
      };
    },
    generateSettings(): AnalysisSetting {
      if (this.settings.preset === undefined) {
        throw new Error('No preset selected.');
      }

      return new AnalysisSetting({
        name: this.settings.preset.name,
        imageSize: this.settings.preset.size,
        elements: [],
      });
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
      try {
        const analyzer: AnalyzerSet = {
          [AnalysisMethodType.OCR_STRING]: new OcrService('string'),
          [AnalysisMethodType.OCR_NUMBER]: new OcrService('number', { workerNum: 2 }),
          [AnalysisMethodType.P_HASH]: new PHashService(),
        };
        const { searchFuzzy } = useMusicStore();
        const corrector: ICorrector = {
          searchMusicTitle: (title) => searchFuzzy(title)[0].musicId,
          searchDifficulty: (difficulty) =>
            DifficultyList.find((v) => v.toString().toUpperCase() === difficulty.toUpperCase()) ?? Difficulty.EASY,
        };
        const analysisService = new AnalysisService({ analyzer, corrector });

        const progressUpdater: IProgress = {
          updateSetup: (): void => {
            this.progress.state = OcrSteps[1];
          },
          updateBinarize: (rate: number): void => {
            this.progress.state = OcrSteps[2];
            this.progress.threshold = rate;
          },
          updateAnalysis: (rate: number): void => {
            this.progress.state = OcrSteps[3];
            this.progress.ocrTask = rate;
          },
          updateCorrect: (rate: number): void => {
            this.progress.state = OcrSteps[4];
            this.progress.correct = rate;
          },
        };

        const settings = convertPresetToAnalysisSetting(this.settings.preset);

        const res = await analysisService.execute(urls, settings, progressUpdater);
        this.completedData.push(...res);

        this.progress.state = OcrSteps[5];

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
      const old = this.completedData[index];
      if (old === undefined) {
        throw new Error('Implementation error.');
      }

      this.completedData.splice(index, 1, old.fixScore(scoreData));
    },
  },
});
