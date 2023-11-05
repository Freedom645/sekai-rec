import type { Score } from '@/domain/entity/Score';
import type { Difficulty } from '@/domain/value/Difficulty';

export interface IScoreRepository {
  /**
   * 全てのデータを取得する
   */
  fetchAllData(): Promise<Score[]>;

  /**
   * スコアデータを取得する
   * @param musicId 楽曲ID
   * @param difficulty 難易度
   * @returns スコアデータ。無い場合はundefinedを返す。
   */
  findData(musicId: number, difficulty: Difficulty): Promise<Score | undefined>;

  /**
   * スコアを更新する
   * @param score スコアデータ
   */
  upsertData(score: Score | Score[]): Promise<void>;
}
