import type { Rectangle } from '@/core/Geometry';
import { AnalysisMethodType, AnalysisMethodTypeList } from '@/domain/value/AnalysisMethodType';
import type { AnalysisSetting } from '@/domain/entity/AnalysisSetting';
import { ImageCanvas } from '@/domain//entity/ImageCanvas';
import { AnalysisElementType } from '@/domain//value/AnalysisElementType';
import type { Difficulty } from '@/domain//value/Difficulty';
import { Accuracy, Score } from '../entity/Score';
import { parseInteger } from '@/core/utils/Parser';
import { Judgment } from '../value/Judgement';
import { AnalysisResult } from '../entity/AnalysisResult';

/** データ補正ロジック */
export interface ICorrector {
  /**
   * 楽曲タイトル文字列から楽曲IDを逆引きする
   * @param title 楽曲タイトル文字列
   * @returns 楽曲ID
   */
  searchMusicTitle(title: string): number;
  /**
   * 難易度文字列から難易度を逆引きする
   * @param difficulty 難易度文字列
   * @returns 難易度
   */
  searchDifficulty(difficulty: string): Difficulty;
}

export interface IAnalyzer {
  /** 前処理 */
  setup(): Promise<void>;

  /**
   * 解析処理を実施する
   * @param image 画像全体
   * @param rectangle 解析範囲
   * @returns 解析結果の文字列
   */
  recognize(image: string, rectangle: Rectangle): Promise<string>;

  /** 後処理 */
  teardown(): Promise<void>;
}

export interface IProgress {
  updateSetup(rate: number): void;
  updateBinarize(rate: number): void;
  updateAnalysis(rate: number): void;
  updateCorrect(rate: number): void;
}

export interface AnalyzerSet {
  [AnalysisMethodType.OCR_STRING]: IAnalyzer;
  [AnalysisMethodType.OCR_NUMBER]: IAnalyzer;
  [AnalysisMethodType.P_HASH]: IAnalyzer;
  [AnalysisMethodType.C_CLASS]: IAnalyzer;
}

/** 要素別の解析結果 */
interface AnalysisElementResult {
  index: number;
  type: AnalysisElementType;
  value: string;
}

export class AnalysisService {
  private readonly analyzerSet: AnalyzerSet;
  private readonly corrector: ICorrector;

  constructor(args: { analyzer: AnalyzerSet; corrector: ICorrector }) {
    this.analyzerSet = args.analyzer;
    this.corrector = args.corrector;
  }

  public async execute(images: string[], settings: AnalysisSetting, progress: IProgress): Promise<AnalysisResult[]> {
    // セットアップ
    const setupTasks = AnalysisMethodTypeList.map((key) => this.analyzerSet[key].setup());
    try {
      await this.awaitAllTasks(setupTasks, (p) => progress.updateSetup(p));

      // 二値化
      const binarizeTasks = images.map((img) => this.createBinarizeTask(img, settings));
      const imageList = await this.awaitAllTasks(binarizeTasks, (p) => progress.updateBinarize(p));

      // OCR
      const ocrTasks = imageList.flatMap((img, index) => this.createOcrTask(index, img, settings));
      const ocrList = await this.awaitAllTasks(ocrTasks, (p) => progress.updateAnalysis(p));
      const groupingOcrRes = ocrList.reduce((obj, res) => {
        const array = obj[res.index] ?? [];
        array.push(res);
        obj[res.index] = array;
        return obj;
      }, [] as AnalysisElementResult[][]);

      // データ補正
      let completedNum = 0;
      const result: AnalysisResult[] = groupingOcrRes
        .map((resArray) => this.createCorrectTask(resArray))
        .map((score, index) => {
          progress.updateCorrect((100 * ++completedNum) / groupingOcrRes.length);
          return new AnalysisResult({
            originalImage: images[index],
            preprocessedImage: imageList[index].toDataURL(),
            score: score,
          });
        });
      progress.updateCorrect(100);
      return result;
    } finally {
      // 終了処理
      await Promise.all(AnalysisMethodTypeList.map((key) => this.analyzerSet[key].teardown()));
    }
  }

  /**
   * 全ての非同期処理を履行し、タスク数に応じた進捗率（百分率）をコールバックにより更新する
   * @param tasks タスク
   * @param progressUpdater 進捗更新コールバック
   * @returns タスク完了のデータ
   */
  private async awaitAllTasks<T>(tasks: Promise<T>[], progressUpdater: (p: number) => void): Promise<T[]> {
    progressUpdater(0);
    const taskNum = tasks.length;
    let completed = 0;

    const completedData = await Promise.all(
      tasks.map((task) =>
        task.then((data) => {
          completed++;
          progressUpdater((100 * completed) / taskNum);
          return data;
        })
      )
    );

    progressUpdater(100);

    return completedData;
  }

  /**
   * 二値化処理のタスクを作成する
   * @param url 二値化対象のデータ
   * @param settings 解析設定
   * @returns 二値画像データ
   */
  private async createBinarizeTask(url: string, settings: AnalysisSetting): Promise<ImageCanvas> {
    const imageCanvas = await ImageCanvas.loadUrl(url);

    const dist = settings.elements.reduce((dist, e) => {
      const value = e.binarizeValue();
      const range = e.analysisRange().scale(imageCanvas.toSize(), settings.imageSize);
      if (value === undefined) {
        // 二値指定されていない場合はスルー
        const cropped = imageCanvas.cropNew(range);
        return dist.drawImage(cropped, undefined, range);
      }

      // 二値化
      const cropped = imageCanvas.binarizeNew(value, range);

      // 書き込み
      return dist.drawImage(cropped, undefined, range);
    }, new ImageCanvas({ w: imageCanvas.w, h: imageCanvas.h }, 'black'));

    return dist;
  }

  /**
   *
   * @param index 解析画像インデックス
   * @param image 前処理済み画像データ
   * @param settings 解析設定
   * @returns
   */
  private createOcrTask(
    index: number,
    image: ImageCanvas,
    settings: AnalysisSetting
  ): Promise<AnalysisElementResult>[] {
    const url = image.toDataURL();
    const tasks = settings.elements.map(async (e) => {
      const recognizedStr = await this.analyzerSet[e.analysisMethod()].recognize(
        url,
        e.analysisRange().scale(image.toSize(), settings.imageSize)
      );
      const res: AnalysisElementResult = { index, type: e.analysisElementType(), value: recognizedStr };
      return res;
    });

    return tasks;
  }

  private createCorrectTask(ocrResults: AnalysisElementResult[]): Score {
    const data = ocrResults.reduce(
      (obj, e) => Object.assign(obj, { [e.type]: e.value }),
      {} as Record<AnalysisElementType, string>
    );

    const musicId = this.corrector.searchMusicTitle(data[AnalysisElementType.TITLE]);
    const difficulty = this.corrector.searchDifficulty(data[AnalysisElementType.DIFFICULT]);

    return new Score({
      musicId,
      difficulty,
      combo: parseInteger(data[AnalysisElementType.COMBO]),
      accuracy: {
        [Accuracy.PERFECT]: parseInteger(data[AnalysisElementType.PERFECT]),
        [Accuracy.GREAT]: parseInteger(data[AnalysisElementType.GREAT]),
        [Accuracy.GOOD]: parseInteger(data[AnalysisElementType.GOOD]),
        [Accuracy.BAD]: parseInteger(data[AnalysisElementType.BAD]),
        [Accuracy.MISS]: parseInteger(data[AnalysisElementType.MISS]),
      },
      judgement: {
        [Judgment.LATE]: parseInteger(data[AnalysisElementType.LATE]),
        [Judgment.FAST]: parseInteger(data[AnalysisElementType.FAST]),
        [Judgment.FLICK]: parseInteger(data[AnalysisElementType.FLICK]),
      },
    });
  }
}
