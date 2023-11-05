import Dexie from 'dexie';
import { Element } from '@/model/Analyze';
import type { IScoreData } from './ScoreDB';
import type { Rectangle, Size } from '@/core/Geometry';

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
