import type { JacketHash } from '../entity/JacketHash';

export interface IJacketHashRepository {
  /**
   * 全てのデータを取得する
   */
  fetchAllData(): Promise<JacketHash>;
}
