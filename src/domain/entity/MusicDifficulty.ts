import { Difficulty, DifficultyList } from '@/domain/value/Difficulty';

export class MusicDifficulty {
  /** 楽曲難易度 */
  public readonly diff: Difficulty;
  /** 楽曲レベル */
  public readonly level: number;
  /** ノーツ数 */
  public readonly noteCount: number;

  constructor(args: { rank: string; level: number; noteCount: number }) {
    this.level = args.level;
    this.noteCount = args.noteCount;

    const rank = DifficultyList.find((r) => r === args.rank);
    if (rank === undefined) {
      console.error(`${args.rank} is unknown difficulty rank.`);
      this.diff = Difficulty.EASY;
      return;
    }
    this.diff = rank;
  }
}
