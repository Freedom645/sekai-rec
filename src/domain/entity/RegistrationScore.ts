import { Score, type AccuracyCount, type JudgmentCount, JudgmentList } from '@/domain/entity/Score';
import { Difficulty } from '@/domain/value/Difficulty';
import { AccuracyList } from '@/domain/value/Accuracy';

export class RegistrationScore extends Score {
  /** 楽曲ID */
  public musicId: number;
  /** 難易度 */
  public difficulty: Difficulty;
  /** コンボ数 */
  public combo: number;
  /** 精度 */
  public accuracy: AccuracyCount;
  /** 判定 */
  public judgement: JudgmentCount;

  constructor(
    args: {
      musicId: number;
      difficulty: Difficulty;
      combo: number;
      accuracy: AccuracyCount;
      judgement: JudgmentCount;
    } = {
      musicId: 1,
      difficulty: Difficulty.EASY,
      combo: 0,
      accuracy: AccuracyList.reduce((obj, key) => Object.assign(obj, { [key]: 0 }), {} as AccuracyCount),
      judgement: JudgmentList.reduce((obj, key) => Object.assign(obj, { [key]: 0 }), {} as JudgmentCount),
    }
  ) {
    super(args);
    this.musicId = args.musicId;
    this.difficulty = args.difficulty;
    this.combo = args.combo;
    this.accuracy = JSON.parse(JSON.stringify(args.accuracy));
    this.judgement = JSON.parse(JSON.stringify(args.judgement));
  }
}
