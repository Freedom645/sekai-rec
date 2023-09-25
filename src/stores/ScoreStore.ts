import { defineStore } from 'pinia';
import type { ScoreData } from '@/model/Score';
import type { DifficultyRank } from '@/model/Game';
import { DB } from '@/infrastracture/IndexedDB/IndexedDB';

export const useScoreStore = defineStore('score', {
  state: () => ({
    scoreList: [] as ScoreData[],
    progress: false as boolean,
  }),
  getters: {
    allData: (state) => state.scoreList,
    findScore: (state) => (musicId: number, difficulty: DifficultyRank) =>
      state.scoreList.find((score) => score.musicId === musicId && score.difficulty === difficulty),
  },
  actions: {
    async fetchAllData() {
      try {
        this.progress = true;
        // this.scoreList = TestData;
        this.scoreList.splice(0);
        this.scoreList.push(...(await DB.scoreTable.toArray()));
      } finally {
        this.progress = false;
      }
    },
    async getScore(musicId: number, difficulty: DifficultyRank) {
      try {
        this.progress = true;
        return await DB.scoreTable.get([musicId, difficulty]);
      } finally {
        this.progress = false;
      }
    },
    async upsertData(score: ScoreData | ScoreData[]) {
      try {
        this.progress = true;
        if (Array.isArray(score)) {
          return await DB.scoreTable.bulkPut(score);
        }
        return await DB.scoreTable.put(score);
      } finally {
        this.progress = false;
      }
    },
  },
});
