import { BaseAPI } from './ApiModule';

class SekaiWorldAPI extends BaseAPI {
  constructor() {
    super('https://sekai-world.github.io/sekai-master-db-diff');
  }

  public async getMusicJson() {
    return await super.get<ResponseMusic[]>('/musics.json');
  }

  public async getMusicDifficulties(): Promise<ResponseMusicDifficulties[]> {
    return await super.get<ResponseMusicDifficulties[]>('/musicDifficulties.json');
  }
}

export default new SekaiWorldAPI();

export interface ResponseMusicDifficulties {
  id: number;
  musicId: number;
  musicDifficulty: string;
  playLevel: number;
  releaseConditionId: number;
  totalNoteCount: number;
}

export interface ResponseMusic {
  id: number;
  seq: number;
  releaseConditionId: number;
  categories: string[];
  title: string;
  pronunciation: string;
  creatorArtistId: number;
  lyricist: string;
  composer: string;
  arranger: string;
  dancerCount: number;
  selfDancerPosition: number;
  assetbundleName: string;
  liveTalkBackgroundAssetbundleName: string;
  publishedAt: number;
  releasedAt: number;
  liveStageId: number;
  fillerSec: number;
  isNewlyWrittenMusic: boolean;
  musicCollaborationId?: number;
}
