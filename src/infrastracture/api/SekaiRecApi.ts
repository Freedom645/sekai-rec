import { BaseAPI } from './ApiModule';
import { JacketHash, type HashTable } from '@/domain/entity/JacketHash';
import type { IJacketHashRepository } from '@/domain/repository/JacketHashRepository';

class SekaiWorldAPI extends BaseAPI implements IJacketHashRepository {
  constructor() {
    super('https://storage.sekai-rec.net');
  }

  async fetchAllData(): Promise<JacketHash> {
    const json = await super.get<ResponseJacketHash[]>('/music/jacket_hash.json');

    const hashTable = json.reduce((table, rec) => {
      const array = table[rec.hash] ?? [];
      array.push(rec.musicId);
      table[rec.hash] = array;
      return table;
    }, {} as HashTable);

    return new JacketHash(hashTable);
  }
}

export default new SekaiWorldAPI();

export interface ResponseJacketHash {
  musicId: number;
  hash: string;
}
