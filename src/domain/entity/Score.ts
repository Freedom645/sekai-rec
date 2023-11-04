import { Difficulty } from '@/domain/value/Difficulty';
import { JudgmentList, type Judgment } from '@/domain/value/Judgement';
import { Accuracy, AccuracyList } from '@/domain/value/Accuracy';
import { ComboState } from '@/domain/value/ComboState';

export interface AccuracyCount {
  [Accuracy.PERFECT]: number;
  [Accuracy.GREAT]: number;
  [Accuracy.GOOD]: number;
  [Accuracy.BAD]: number;
  [Accuracy.MISS]: number;
}

export interface JudgmentCount {
  [Judgment.LATE]: number;
  [Judgment.FAST]: number;
  [Judgment.FLICK]: number;
}

/** ランクマッチ方式のスコア比重定義 */
const ScoreWeight = {
  [Accuracy.PERFECT]: 3,
  [Accuracy.GREAT]: 2,
  [Accuracy.GOOD]: 1,
  [Accuracy.BAD]: 0,
  [Accuracy.MISS]: 0,
} as const;

/** スコア */
export class Score {
  /** 楽曲ID */
  public readonly musicId: number;
  /** 難易度 */
  public readonly difficulty: Difficulty;
  /** コンボ数 */
  public readonly combo: number;
  /** 精度 */
  public readonly accuracy: AccuracyCount;
  /** 判定 */
  public readonly judgement: JudgmentCount;

  public constructor(args: {
    musicId: number;
    difficulty: Difficulty;
    combo: number;
    accuracy: AccuracyCount;
    judgement: JudgmentCount;
  }) {
    this.musicId = args.musicId;
    this.difficulty = args.difficulty;
    this.combo = args.combo;
    this.accuracy = JSON.parse(JSON.stringify(args.accuracy));
    this.judgement = JSON.parse(JSON.stringify(args.judgement));
  }

  /**
   * コンボステート（AP、FC、その他）を取得する
   * @param totalNoteCount 楽曲の総ノーツ数
   * @returns コンボステートを返す
   */
  public comboState(totalNoteCount: number): ComboState {
    if (this.accuracy[Accuracy.PERFECT] === totalNoteCount) {
      return ComboState.AP;
    }
    if (this.combo === totalNoteCount) {
      return ComboState.FC;
    }
    return ComboState.NONE;
  }

  /**
   * ランクマッチ方式のスコアを算出する
   * @returns スコア
   */
  public calcRankMatchScore(): number {
    return AccuracyList.reduce((sum, key) => sum + this.accuracy[key] * ScoreWeight[key], 0);
  }

  /**
   * ランクマッチ方式のスコア割合を算出する
   * @param totalNoteCount 楽曲の総ノーツ数
   * @returns スコア割合
   */
  public calcScoreRate(totalNoteCount: number): number {
    return this.calcRankMatchScore() / (totalNoteCount * ScoreWeight[Accuracy.PERFECT]);
  }

  /**
   * 減点対象の精度配列を取得する
   * @returns 精度配列
   */
  public getScoreAccuracy(): number[] {
    const target = [Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS];
    return target.map((key) => this.accuracy[key]);
  }

  /**
   * 減点方式のスコアを算出する
   * @param totalNoteCount 楽曲の総ノーツ数
   * @returns APであれば0、それ以外は負の値
   */
  public getDeductionScore(totalNoteCount: number): number {
    return this.calcRankMatchScore() - totalNoteCount * ScoreWeight[Accuracy.PERFECT];
  }

  /**
   * スコアの良し悪しを比較する
   * @param other 比較対象のスコア
   * @returns インスタンスの方が良い結果であれば負の値、引数の方が良い結果であれば正の値、それ以外は0
   */
  public compare(other: Score): number {
    // スコアで比較
    const diffScore = this.calcRankMatchScore() - other.calcRankMatchScore();
    if (diffScore !== 0) {
      return diffScore;
    }

    // 精度で比較
    const diffAccuracy = AccuracyList.find((key) => this.accuracy[key] !== other.accuracy[key]);
    if (diffAccuracy !== undefined) {
      return this.accuracy[diffAccuracy] - other.accuracy[diffAccuracy];
    }

    // コンボで比較
    return this.combo - other.combo;
  }

  /**
   * 空のスコアデータを作成する
   * @returns 空のスコアデータ
   */
  public static emptyScoreData(): Score {
    return new Score({
      musicId: 1,
      difficulty: Difficulty.MASTER,
      combo: 0,
      accuracy: AccuracyList.reduce((obj, key) => Object.assign(obj, { [key]: 0 }), {} as AccuracyCount),
      judgement: JudgmentList.reduce((obj, key) => Object.assign(obj, { [key]: 0 }), {} as JudgmentCount),
    });
  }
}

export { Accuracy, JudgmentList };
