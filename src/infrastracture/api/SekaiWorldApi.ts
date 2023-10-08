import { BaseAPI } from './ApiModule';
import { Difficulty, Music } from '@/model/Game';

class SekaiWorldAPI extends BaseAPI {
  constructor() {
    super('https://sekai-world.github.io/sekai-master-db-diff');
  }

  public async getMusics(): Promise<Music[]> {
    const requestTasks = [
      super.get<ResponseMusic[]>('/musics.json'),
      super.get<ResponseMusicDifficulties[]>('/musicDifficulties.json'),
    ] as const;

    const [musicsJson, difficultiesJson] = await Promise.all(requestTasks);
    return this.convertMusic(musicsJson, difficultiesJson);
  }

  private convertMusic(musicsJson: ResponseMusic[], difficultiesJson: ResponseMusicDifficulties[]): Music[] {
    const diff = difficultiesJson.reduce((pre, curr) => {
      const musicId = curr.musicId;
      const diffList = pre[musicId] ?? [];
      diffList.push(
        new Difficulty({ level: curr.playLevel, rank: curr.musicDifficulty, noteCount: curr.totalNoteCount })
      );
      pre[musicId] = diffList;
      return pre;
    }, {} as { [id: number]: Difficulty[] });

    return musicsJson.map((music) => {
      return new Music({ musicId: music.id, title: music.title, difficulties: diff[music.id] });
    });
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
