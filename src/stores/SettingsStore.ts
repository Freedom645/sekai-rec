import { defineStore } from 'pinia';
import { emptyCondition, type FilterCondition } from '@/model/Filter';

export const ScoreColumnKey = {
  JACKET_URL: 'jacketUrl',
  TITLE: 'title',
  DIFFICULTY: 'difficulty',
  LEVEL: 'level',
  RANK_MATCH_SCORE: 'rankMatchScore',
  AP_DIFF_SCORE: 'apDiffScore',
  ACCURACY_SCORE: 'accuracyScore',
  SCORE_RATE: 'scoreRate',
} as const;

export type ScoreColumnKey = (typeof ScoreColumnKey)[keyof typeof ScoreColumnKey];

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    scoreView: {
      filterCondition: emptyCondition(38) as FilterCondition,
      columns: Object.values(ScoreColumnKey) as ScoreColumnKey[],
    },
  }),
  actions: {
    async applyFilterCondition(filterCondition: FilterCondition): Promise<void> {
      this.scoreView.filterCondition = JSON.parse(JSON.stringify(filterCondition));
    },
    async applyColumns(columns: ScoreColumnKey[]): Promise<void> {
      if (columns.length === 0) {
        throw new Error();
      }
      this.scoreView.columns.splice(0);
      this.scoreView.columns.push(...JSON.parse(JSON.stringify(columns)));
    },
  },
});
