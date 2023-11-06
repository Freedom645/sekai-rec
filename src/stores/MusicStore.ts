import { defineStore } from 'pinia';
import { searchFuzzy } from '@/module/Corrector';
import SekaiWorldApi from '@/infrastracture/api/SekaiWorldApi';
import type { IMusicRepository } from '@/domain/repository/MusicRepository';
import type { Music } from '@/domain/entity/Music';

const MusicRepository: IMusicRepository = SekaiWorldApi;

export const useMusicStore = defineStore('music', {
  state: () => ({
    musicList: [] as Music[],
  }),
  getters: {
    minLevel: (state) => Math.min(1, ...state.musicList.map((data) => data.lowerLevel())),
    maxLevel: (state) => Math.max(1, ...state.musicList.map((data) => data.higherLevel())),
    findMusic: (state) => (musicId: number) => state.musicList.find((music) => music.id === musicId),
    searchFuzzy: (state) => (name: string) => searchFuzzy(name, state.musicList),
  },
  actions: {
    async fetchMusicData(): Promise<void> {
      this.musicList.splice(0);
      this.musicList.push(...(await MusicRepository.fetchAllData()));
    },
  },
});
