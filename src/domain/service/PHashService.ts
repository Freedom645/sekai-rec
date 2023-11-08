import type { Rectangle } from '@/core/Geometry';
import type { JacketHash } from '@/domain/entity/JacketHash';
import type { IJacketHashRepository } from '@/domain/repository/JacketHashRepository';
import type { IAnalyzer } from '@/domain/service/AnalysisService';

export interface MusicService {
  search(musicId: number): string;
}

export class PHashService implements IAnalyzer {
  private jacketHash?: JacketHash;

  public constructor(
    private readonly jacketHashRepository: IJacketHashRepository,
    private readonly musicService: MusicService
  ) {}

  async setup(): Promise<void> {
    this.jacketHash = await this.jacketHashRepository.fetchAllData();
    return;
  }

  async recognize(image: string, rectangle: Rectangle): Promise<string> {
    if (this.jacketHash === undefined) {
      throw new Error(`PHash setup is not completed.`);
    }

    const jacket = await (await Jimp.read(image)).crop(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    const hash = jacket.hash();

    const id = this.jacketHash.searchMusicId(hash);

    return this.musicService.search(id);
  }
}
