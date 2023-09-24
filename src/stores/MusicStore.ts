import { defineStore } from 'pinia';
import MusicList from '@/assets/sekai-db-diff/musics.json';
import DifficultyList from '@/assets/sekai-db-diff/musicDifficulties.json';
import { Difficulty, Music } from '@/model/Game';
import { searchFuzzy } from '@/module/Corrector';

const TestData: Music[] = (() => {
  const diff = DifficultyList.reduce((pre, curr) => {
    const musicId = curr.musicId;
    const diffList = pre[musicId] ?? [];
    diffList.push(
      new Difficulty({ level: curr.playLevel, rank: curr.musicDifficulty, noteCount: curr.totalNoteCount })
    );
    pre[musicId] = diffList;
    return pre;
  }, {} as { [id: number]: Difficulty[] });

  return MusicList.map((music) => {
    return new Music({ musicId: music.id, title: music.title, difficulties: diff[music.id] });
  });
})();

export const useMusicStore = defineStore('music', {
  state: () => ({
    musicList: TestData,
  }),
  getters: {
    minLevel: (state) => Math.min(...state.musicList.map((data) => data.lowerLevel)),
    maxLevel: (state) => Math.max(...state.musicList.map((data) => data.higherLevel)),
    findMusic: (state) => (musicId: number) => state.musicList.find((music) => music.id === musicId),
    searchFuzzy: (state) => (name: string) => searchFuzzy(name, state.musicList),
  },
});
