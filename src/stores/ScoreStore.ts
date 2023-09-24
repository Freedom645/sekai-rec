import { defineStore } from 'pinia';
import MusicDifficultiesJson from '@/assets/sekai-db-diff/musicDifficulties.json';
import {
  type ScoreData,
  type AccuracyCount,
  AccuracyList,
  type JudgmentCount,
  Accuracy,
  JudgmentList,
} from '@/model/Score';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';
import { DB } from '@/infrastracture/IndexedDB/IndexedDB';

const TestData = ((): ScoreData[] => {
  return MusicDifficultiesJson.map((diff) => {
    const rank = DifficultyRankList.find((rank) => rank === diff.musicDifficulty);
    if (rank === undefined) {
      throw new Error('');
    }

    const detail = ((totalNote: number) => {
      const Rate = AccuracyList.reduce(
        (pre, diff) => Object.assign(pre, { [diff]: Math.random() }),
        {} as AccuracyCount
      );
      const RateSum = AccuracyList.reduce((pre, curr) => pre + Rate[curr], 0);

      return AccuracyList.reduce(
        (pre, rank) => Object.assign(pre, { [rank]: Math.floor(totalNote * (Rate[rank] / RateSum)) }),
        {} as AccuracyCount
      );
    })(diff.totalNoteCount);

    const judgmentCount = ((): JudgmentCount => {
      const notesSum = diff.totalNoteCount - detail[Accuracy.PERFECT] - detail[Accuracy.MISS];

      const Rate = JudgmentList.reduce(
        (pre, diff) => Object.assign(pre, { [diff]: Math.random() }),
        {} as JudgmentCount
      );
      const RateSum = JudgmentList.reduce((pre, curr) => pre + Rate[curr], 0);

      return JudgmentList.reduce(
        (pre, rank) => Object.assign(pre, { [rank]: Math.floor(notesSum * (Rate[rank] / RateSum)) }),
        {} as JudgmentCount
      );
    })();

    const data: ScoreData = {
      musicId: diff.musicId,
      difficulty: rank,
      combo: detail.perfect + detail.great,
      accuracyCount: detail,
      judgmentCount: judgmentCount,
    };
    return data;
  });
})();

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
    async upsertData(score: ScoreData) {
      try {
        this.progress = true;
        return await DB.scoreTable.put(score);
      } finally {
        this.progress = false;
      }
    },
  },
});
