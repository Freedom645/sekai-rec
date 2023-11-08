import type { Difficulty } from '@/domain/value/Difficulty';
import type { MusicDifficulty } from '@/domain/entity/MusicDifficulty';

export class Music {
  /** 楽曲ID */
  public readonly id: number;
  /** 楽曲名 */
  public readonly title: string;
  /** 楽曲難易度リスト */
  public readonly difficulties: MusicDifficulty[];
  constructor(args: { musicId: number; title: string; difficulties: MusicDifficulty[] }) {
    this.id = args.musicId;
    if (this.id === 388) {
      // 初音ミクの激唱 full
      this.title = `${args.title} FULL ver.`;
    } else {
      this.title = args.title;
    }
    this.difficulties = args.difficulties;
  }

  /**
   * 楽曲難易度を取得する
   * @param diff 対象の難易度
   * @returns 楽曲難易度、存在しない場合はundefinedを返す
   */
  public getDifficulty(diff: Difficulty): MusicDifficulty | undefined {
    return this.difficulties.find((d) => d.diff === diff);
  }

  public lowerLevel(): number {
    return Math.min(...this.difficulties.map((diff) => diff.level));
  }

  public higherLevel(): number {
    return Math.max(...this.difficulties.map((diff) => diff.level));
  }
}
