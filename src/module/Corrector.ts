import { editONP } from './EditDistance';
import type { Music } from '@/model/Game';
import { Accuracy, JudgmentList, type ScoreData } from '@/model/Score';

export const searchFuzzy = (str: string, list: Music[]) => {
  return list
    .map((music) => ({ distance: editONP(str, music.title), title: music.title, musicId: music.id }))
    .sort((left, right) => right.distance - left.distance);
};

type CheckFunction = (master: Music, data: ScoreData) => string;

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
      const totalNotes = master.getDifficulty(data.difficulty)?.noteCount;
      if (totalNotes === undefined) {
        return '';
      }
      const sum = Object.values(data.accuracyCount).reduce((pre, curr) => pre + curr, 0);
      return totalNotes === sum ? '' : `総ノーツ数${totalNotes}に対して、合計${sum}が入力されました。`;
    },
  },
  judgementCount: {
    title: '判定数チェック',
    description: 'Great～Badのノーツ数が、Late、Fast、Flickと一致しているか確認します。',
    validator: (_: Music, data: ScoreData) => {
      const accList = [Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD];
      const judgeList = [...JudgmentList];

      const accSum = accList.reduce((sum, key) => sum + data.accuracyCount[key], 0);
      const judgeSum = judgeList.reduce((sum, key) => sum + data.judgmentCount[key], 0);
      return accSum === judgeSum
        ? ''
        : `Great～Badのノーツ数${accSum}に対して、Late、Fast、Flickのノーツ数が${judgeSum}入力されました。`;
    },
  },
  comboCount: {
    title: 'コンボ数チェック',
    description: 'コンボ数が、Break数に対して妥当な範囲に収まっているかを確認します。',
    validator: (music: Music, data: ScoreData) => {
      const cbList = [Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS];
      const cbCount = cbList.reduce((sum, key) => sum + data.accuracyCount[key], 0);

      const totalNotes = music.getDifficulty(data.difficulty)?.noteCount;

      if (totalNotes === undefined) {
        return '';
      }

      const maxCombo = totalNotes - cbCount;
      const minCombo = Math.ceil(maxCombo / (cbCount + 1));

      return minCombo <= data.combo && data.combo <= maxCombo
        ? ''
        : `${minCombo}～${maxCombo}の範囲外のコンボ数${data.combo}が入力されました。`;
    },
  },
  existsDifficulty: {
    title: '難易度チェック',
    description: '',
    validator: (music: Music, data: ScoreData) => {
      if (music.getDifficulty(data.difficulty) === undefined) {
        return `楽曲${music.title}には、難易度${data.difficulty}が設定できません。`;
      }
      return '';
    },
  },
};
