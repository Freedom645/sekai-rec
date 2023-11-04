import type { Music } from '@/domain/entity/Music';

export interface IMusicRepository {
  /**
   * 全てのデータを取得する
   */
  fetchAllData(): Promise<Music[]>;
}
