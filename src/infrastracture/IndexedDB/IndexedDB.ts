import Dexie from 'dexie';
import type { Accuracy } from '@/model/Score';
import type { DifficultyRank } from '@/model/Game';
import { Element } from '@/model/Analyze';
import type { Rectangle, Size } from '@/module/ImageProcessor';

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

interface DataSet<T> {
  [Element.TITLE]: T;
  [Element.DIFFICULT]: T;
  [Element.COMBO]: T;
  [Element.PERFECT]: T;
  [Element.GREAT]: T;
  [Element.GOOD]: T;
  [Element.BAD]: T;
  [Element.MISS]: T;
  [Element.LATE]: T;
  [Element.FAST]: T;
  [Element.FLICK]: T;
}

interface IPreset {
  key: string;
  name: string;
  size: Size;
  position: DataSet<Rectangle>;
  threshold: Partial<DataSet<number>> & { default: number };
}

class IndexedDatabase extends Dexie {
  readonly scoreTable!: Dexie.Table<IScoreData, Array<number | string>>;
  readonly presetTable!: Dexie.Table<IPreset, string>;

  constructor() {
    super('SekaiRecDatabase');
    this.version(1).stores({
      scoreTable: '[musicId+difficulty]',
    });
    this.version(2).stores({
      presetTable: 'key',
    });
  }
}

export const DB = new IndexedDatabase();
