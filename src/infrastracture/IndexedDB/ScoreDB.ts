import { DB } from './IndexedDB';
import { Score } from '@/domain/entity/Score';
import type { IScoreRepository } from '@/domain/repository/ScoreRepository';
import type { Accuracy } from '@/domain/value/Accuracy';
import type { Difficulty } from '@/domain/value/Difficulty';
import type { Judgment } from '@/domain/value/Judgement';

export interface IScoreData {
  musicId: number;
  difficulty: Difficulty;
  combo: number;
  accuracyCount: {
    [Accuracy.PERFECT]: number;
    [Accuracy.GREAT]: number;
    [Accuracy.GOOD]: number;
    [Accuracy.BAD]: number;
    [Accuracy.MISS]: number;
  };
  judgmentCount: {
    [Judgment.LATE]: number;
    [Judgment.FAST]: number;
    [Judgment.FLICK]: number;
  };
}

export class ScoreRepository implements IScoreRepository {
  async fetchAllData(): Promise<Score[]> {
    const scoreList = await DB.scoreTable.toArray();
    return scoreList.map((s) => this.deserialize(s));
  }

  async findData(musicId: number, difficulty: Difficulty): Promise<Score | undefined> {
    const data = await DB.scoreTable.get([musicId, difficulty]);
    if (data === undefined) {
      return undefined;
    }
    return this.deserialize(data);
  }

  async upsertData(score: Score | Score[]): Promise<void> {
    if (Array.isArray(score)) {
      await DB.scoreTable.bulkPut(score.map((s) => this.serialize(s)));
      return;
    } else {
      await DB.scoreTable.put(this.serialize(score));
      return;
    }
  }

  private serialize(score: Score): IScoreData {
    return {
      musicId: score.musicId,
      difficulty: score.difficulty,
      combo: score.combo,
      accuracyCount: score.accuracy,
      judgmentCount: score.judgement,
    };
  }

  private deserialize(data: IScoreData): Score {
    return new Score({
      musicId: data.musicId,
      difficulty: data.difficulty,
      combo: data.combo,
      accuracy: data.accuracyCount,
      judgement: data.judgmentCount,
    });
  }
}

export const scoreRepository = new ScoreRepository();
