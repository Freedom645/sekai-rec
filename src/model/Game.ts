export const DifficultyRank = {
  MASTER: 'master',
  EXPERT: 'expert',
  HARD: 'hard',
  NORMAL: 'normal',
  EASY: 'easy',
} as const;

export type DifficultyRank = (typeof DifficultyRank)[keyof typeof DifficultyRank];

export const DifficultyRankList = [
  DifficultyRank.MASTER,
  DifficultyRank.EXPERT,
  DifficultyRank.HARD,
  DifficultyRank.NORMAL,
  DifficultyRank.EASY,
] as const;

export class Difficulty {
  public readonly rank: DifficultyRank;
  public readonly level: number;
  public readonly noteCount: number;
  constructor(args: { rank: string; level: number; noteCount: number }) {
    this.level = args.level;
    this.noteCount = args.noteCount;

    const rank = Object.values(DifficultyRank).find((r) => r === args.rank);
    if (rank === undefined) {
      console.error(`${args.rank} is unknown difficulty rank.`);
      this.rank = DifficultyRank.EASY;
      return;
    }
    this.rank = rank;
  }
}

export class Music {
  public readonly id: number;
  public readonly title: string;
  public readonly difficulties: Difficulty[];
  constructor(args: { musicId: number; title: string; difficulties: Difficulty[] }) {
    this.id = args.musicId;
    this.title = args.title;
    this.difficulties = args.difficulties;
  }

  public getDifficulty(diff: DifficultyRank): Difficulty {
    const data = this.difficulties.find((d) => d.rank === diff);
    if (data === undefined) {
      throw new Error(`Not found ${diff} at ${this.title}`);
    }
    return data;
  }

  get lowerLevel(): number {
    return Math.min(...this.difficulties.map((diff) => diff.level));
  }
  get higherLevel(): number {
    return Math.max(...this.difficulties.map((diff) => diff.level));
  }
}
