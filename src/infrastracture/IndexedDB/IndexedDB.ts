import Dexie from 'dexie';
import type { Accuracy } from '@/model/Score';
import type { DifficultyRank } from '@/model/Game';

interface IScoreData {
  musicId: number;
  difficulty: DifficultyRank;
  combo: number;
  accuracyCount: {
    [Accuracy.PERFECT]: number;
    [Accuracy.GREAT]: number;
    [Accuracy.GOOD]: number;
    [Accuracy.BAD]: number;
    [Accuracy.MISS]: number;
  };
  judgmentCount: {
    late: number;
    fast: number;
    flick: number;
  };
}

class IndexedDatabase extends Dexie {
  scoreTable!: Dexie.Table<IScoreData, Array<number | string>>;

  constructor() {
    super('SekaiRecDatabase');
    this.version(1).stores({
      scoreTable: '[musicId+difficulty]',
    });
  }
}

export const DB = new IndexedDatabase();
