import type { ScoreData } from '@/model/Score';
import { createTypedStorage, type Codec, type BaseStorage } from './KeyValueBase';

const scoreCodec: Codec<ScoreData[]> = {
  encode: (data: ScoreData[]): string => {
    return JSON.stringify(data);
  },
  decode: (str: string): ScoreData[] => {
    return JSON.parse(str);
  },
};

const storageAdapter: BaseStorage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
};

export default createTypedStorage(
  {
    score: scoreCodec,
  },
  storageAdapter
);
