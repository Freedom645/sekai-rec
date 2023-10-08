import { defineStore } from 'pinia';
import MusicList from '@/assets/sekai-db-diff/musics.json';
import DifficultyList from '@/assets/sekai-db-diff/musicDifficulties.json';
import Api from '@/infrastracture/api/SekaiWorldApi';
import type { Music } from '@/model/Game';
import { searchFuzzy } from '@/module/Corrector';

export const useMusicStore = defineStore('music', {
  state: () => ({
    musicList: [] as Music[],
  }),
  getters: {
    minLevel: (state) => Math.min(1, ...state.musicList.map((data) => data.lowerLevel)),
    maxLevel: (state) => Math.max(1, ...state.musicList.map((data) => data.higherLevel)),
    findMusic: (state) => (musicId: number) => state.musicList.find((music) => music.id === musicId),
    searchFuzzy: (state) => (name: string) => searchFuzzy(name, state.musicList),
  },
  actions: {
    async fetchMusicData(): Promise<void> {
      this.musicList.splice(0);
      this.musicList.push(...(await Api.getMusics()));
    },
  },
});
