/** 解析結果 */
export class AnalysisResult {
  /** 解析対象画像 */
  public readonly originalImage: string;
  /** 前処理済画像 */
  public readonly preprocessedImage: string;
  /** 登録可否 */
  public isUnregister: boolean;

  public constructor(args: { originalImage: string; preprocessedImage: string }) {
    this.originalImage = args.originalImage;
    this.preprocessedImage = args.preprocessedImage;
    this.isUnregister = false;
  }
}
