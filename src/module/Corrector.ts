import { editONP } from './EditDistance';
import type { Music } from '@/model/Game';
import { Accuracy, Judgment, JudgmentList, type ScoreData } from '@/model/Score';

export const searchFuzzy = (str: string, list: Music[]) => {
  return list
    .map((music) => ({ distance: editONP(str, music.title), title: music.title }))
    .sort((left, right) => right.distance - left.distance);
};

type CheckFunction = (master: Music, data: ScoreData) => boolean;

interface Validator {
  title: string;
  description: string;
  validator: CheckFunction;
}

export const Checker: Record<string, Validator> = {
  totalNotesCount: {
    title: '総ノーツ数チェック',
    description: 'Perfect～Missまでのノーツ数がデータと一致しているか確認します。',
    validator: (master: Music, data: ScoreData) => {
      const totalNotes = master.getDifficulty(data.difficulty).noteCount;
      const sum = Object.values(data.accuracyCount).reduce((pre, curr) => pre + curr, 0);
      return totalNotes === sum;
    },
  },
  judgementCount: {
    title: '判定数チェック',
    description: 'Great～Badのノーツ数が、Fast、Late、Flickと一致しているか確認します。',
    validator: (_: Music, data: ScoreData) => {
      const accList = [Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD];
      const judgeList = [...JudgmentList];

      const accSum = accList.reduce((sum, key) => sum + data.accuracyCount[key], 0);
      const judgeSum = judgeList.reduce((sum, key) => sum + data.judgmentCount[key], 0);
      return accSum === judgeSum;
    },
  },
  comboCount: {
    title: 'コンボ数チェック',
    description: 'コンボ数が、Break数に対して妥当な範囲に収まっているかを確認します。',
    validator: (music: Music, data: ScoreData) => {
      const cbList = [Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS];
      const cbCount = cbList.reduce((sum, key) => sum + data.accuracyCount[key], 0);

      const totalNotes = music.getDifficulty(data.difficulty).noteCount;

      const maxCombo = totalNotes - cbCount;
      const minCombo = Math.ceil(maxCombo / (cbCount + 1));

      return minCombo <= data.combo && data.combo <= maxCombo;
    },
  },
};
