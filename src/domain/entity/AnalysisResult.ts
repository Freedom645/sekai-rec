import type { Score } from '@/domain/entity/Score';

/** 解析結果 */
export class AnalysisResult {
  /** 解析対象画像 */
  public readonly originalImage: string;
  /** 前処理済画像 */
  public readonly preprocessedImage: string;
  /** スコアデータ */
  public readonly score: Score;

  /** 登録可否 */
  public isUnregister: boolean;

  public constructor(args: { originalImage: string; preprocessedImage: string; score: Score }) {
    this.originalImage = args.originalImage;
    this.preprocessedImage = args.preprocessedImage;
    this.score = args.score;
    this.isUnregister = false;
  }

  public fixScore(score: Score): AnalysisResult {
    return new AnalysisResult({
      originalImage: this.originalImage,
      preprocessedImage: this.preprocessedImage,
      score: score,
    });
  }
}
