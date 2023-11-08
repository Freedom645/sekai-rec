export interface HashTable {
  [hash: string]: number[];
}

export class JacketHash {
  public constructor(private readonly hashTable: HashTable) {}

  public searchMusicId(hash: string): number {
    const id = this.hashTable[hash];
    if (id !== undefined && id.length > 0) {
      return id[0];
    }

    const rec = Object.keys(this.hashTable)
      .map((key) => ({
        key,
        distance: Jimp.compareHashes(hash, key),
      }))
      .sort((left, right) => left.distance - right.distance)[0];

    return this.hashTable[rec.key][0];
  }
}
