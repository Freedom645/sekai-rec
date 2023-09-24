import type { Music } from '@/model/Game';
import { editONP } from './EditDistance';

export const searchFuzzy = (str: string, list: Music[]) => {
  return list
    .map((music) => ({ distance: editONP(str, music.title), title: music.title }))
    .sort((left, right) => right.distance - left.distance);
};
