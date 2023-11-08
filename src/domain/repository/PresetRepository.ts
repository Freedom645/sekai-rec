import type { AnalysisSetting } from '@/domain/entity/AnalysisSetting';

export interface IPresetRepository {
  /**
   * 全てのデータを取得する
   */
  fetchAllData(): Promise<AnalysisSetting[]>;

  /**
   * プリセットを更新する
   * @param setting プリセット
   */
  upsertData(setting: AnalysisSetting): Promise<void>;
}
