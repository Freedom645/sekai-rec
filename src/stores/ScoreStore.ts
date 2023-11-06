import { defineStore } from 'pinia';
import type { Score } from '@/domain/entity/Score';
import type { Difficulty } from '@/domain/value/Difficulty';
import type { IScoreRepository } from '@/domain/repository/ScoreRepository';
import { scoreRepository } from '@/infrastracture/IndexedDB/ScoreDB';

const ScoreRepository: IScoreRepository = scoreRepository;

export const useScoreStore = defineStore('score', {
  state: () => ({
    scoreList: [] as Score[],
    progress: false as boolean,
  }),
  getters: {
    findScore: (state) => (musicId: number, difficulty: Difficulty) =>
      state.scoreList.find((score) => score.musicId === musicId && score.difficulty === difficulty),
  },
  actions: {
    async fetchAllData() {
      try {
        this.progress = true;
        const data = await ScoreRepository.fetchAllData();
        this.scoreList.splice(0);
        this.scoreList.push(...data);
      } finally {
        this.progress = false;
      }
    },
    async getScore(musicId: number, difficulty: Difficulty) {
      try {
        this.progress = true;
        const data = await ScoreRepository.findData(musicId, difficulty);
        return data;
      } finally {
        this.progress = false;
      }
    },
    async upsertData(score: Score | Score[]) {
      try {
        this.progress = true;
        return await ScoreRepository.upsertData(score);
      } finally {
        this.progress = false;
      }
    },
  },
});
