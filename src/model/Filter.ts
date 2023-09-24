import { DifficultyRankList } from '@/model/Game';

export interface FilterCondition {
  musicTitle: string;
  difficultyCheckState: { [key: string]: boolean };
  level: {
    low: number;
    high: number;
  };
}

export const emptyCondition = (maxLevel: number): FilterCondition => ({
  musicTitle: '',
  difficultyCheckState: DifficultyRankList.reduce((pre, cur) => {
    pre[cur] = true;
    return pre;
  }, {} as { [key: string]: boolean }),
  level: {
    low: 1,
    high: maxLevel,
  },
});

abstract class Filter<T> {
  constructor(protected readonly key: string, protected condition: T) {}
  abstract changeCondition(condition: T): void;
  abstract apply(record: { [key: string]: unknown }): boolean;
}

export class PartialFilter extends Filter<string> {
  constructor(key: string) {
    super(key, '');
  }
  public changeCondition(condition: string): void {
    this.condition = condition;
  }
  public apply(record: { [key: string]: unknown }): boolean {
    const value = record[this.key];
    if (typeof value !== 'string') {
      return true;
    }
    return value.includes(this.condition);
  }
}

export class ExactFilter extends Filter<string> {
  constructor(key: string) {
    super(key, '');
  }
  public changeCondition(condition: string): void {
    this.condition = condition;
  }
  public apply(record: { [key: string]: unknown }): boolean {
    const value = record[this.key];
    if (typeof value !== 'string') {
      return true;
    }
    return value === this.condition;
  }
}
