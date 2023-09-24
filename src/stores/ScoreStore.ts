import { defineStore } from 'pinia';
import MusicDifficultiesJson from '@/assets/sekai-db-diff/musicDifficulties.json';
import { ScoreData, type AccuracyKeyValue, AccuracyList } from '@/model/Score';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';

const TestData = (() => {
  return MusicDifficultiesJson.map((diff) => {
    const rank = DifficultyRankList.find((rank) => rank === diff.musicDifficulty);
    if (rank === undefined) {
      throw new Error('');
    }

    const detail = ((totalNote: number) => {
      const Rate = AccuracyList.reduce(
        (pre, diff) => Object.assign(pre, { [diff]: Math.random() }),
        {} as AccuracyKeyValue<number>
      );
      const RateSum = AccuracyList.reduce((pre, curr) => pre + Rate[curr], 0);

      return AccuracyList.reduce(
        (pre, rank) => Object.assign(pre, { [rank]: Math.floor(totalNote * (Rate[rank] / RateSum)) }),
        {} as AccuracyKeyValue<number>
      );
    })(diff.totalNoteCount);

    return new ScoreData({
      musicId: diff.musicId,
      difficulty: rank,
      combo: detail.perfect + detail.great,
      accuracyCount: detail,
    });
  });
})();

export const useScoreStore = defineStore('score', {
  state: () => ({
    scoreList: TestData,
  }),
  getters: {
    findScore: (state) => (musicId: number, difficulty: DifficultyRank) =>
      state.scoreList.find((score) => score.musicId === musicId && score.difficulty === difficulty),
  },
});
