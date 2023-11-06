<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    class="elevation-4"
    v-model:page="page"
    :headers="headers"
    :items="items"
    :items-per-page="itemsPerPage"
    :customKeySort="customKeySort"
    hide-default-footer
    fixed-header
    noDataText="データがありません。"
    @click:row="(_: any, row: any) => emits('clickRow', { id: row.item.raw.musicId, diff: row.item.raw.difficulty })"
  >
    <template v-slot:item.jacketUrl="props">
      <v-img width="50px" :src="props.item.columns.jacketUrl" :aspect-ratio="1" />
    </template>
    <template v-slot:item.title="props">
      <span class="font-weight-medium">
        {{ props.item.columns.title }}
      </span>
    </template>
    <template v-slot:item.difficulty="props">
      <difficulty-rank :type="xs ? 'icon' : 'label'" :difficulty="props.item.raw.difficulty" />
    </template>
    <template v-slot:item.scoreRate="props">
      <v-progress-linear color="indigo" :model-value="props.item.raw.scoreRate" height="20">
        <span v-if="xs">{{ Math.round(props.item.raw.scoreRate) }}%</span>
        <span v-if="!xs">{{ Math.round(props.item.raw.scoreRate * 100) / 100 }}%</span>
      </v-progress-linear>
    </template>
    <template v-slot:item.accuracyScore="props">
      {{ props.item.raw.accuracyScore.map((v: number) => v.toString()).join('-') }}
    </template>

    <template v-slot:bottom>
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="10">
            <v-pagination variant="outlined" density="compact" v-model="page" :length="pageCount" />
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-select
              variant="outlined"
              density="compact"
              :items="pageSizeList"
              v-model="itemsPerPage"
              @update:model-value="itemsPerPage = parseInt($event, 10)"
              hide-details
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import { ref, defineEmits, computed, onBeforeMount } from 'vue';
import { useDisplay } from 'vuetify';
import { VPagination, VSelect, VProgressLinear, VContainer } from 'vuetify/components';
import { VDataTable } from 'vuetify/labs/VDataTable';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { useScoreStore } from '@/stores/ScoreStore';
import { useSettingsStore } from '@/stores/SettingsStore';
import { ComboState } from '@/domain/value/ComboState';
import { type Difficulty, DifficultyList } from '@/domain/value/Difficulty';

const defaultHeaders = [
  { title: '', align: 'center', sortable: false, key: 'jacketUrl', width: '50px' },
  { title: '楽曲名', align: 'start', sortable: true, key: 'title', width: '14em' },
  { title: '難易度', align: 'start', sortable: true, key: 'difficulty' },
  { title: 'Lv', align: 'start', sortable: true, key: 'level' },
  { title: 'スコア', align: 'end', sortable: true, key: 'rankMatchScore' },
  { title: 'スコア (減点)', align: 'end', sortable: true, key: 'apDiffScore' },
  { title: 'スコア (精度)', align: 'end', sortable: true, key: 'accuracyScore', width: '8em' },
  { title: 'スコア (割合)', align: 'end', sortable: true, key: 'scoreRate' },
];

const { xs } = useDisplay();
const { musicList } = useMusicStore();
const { fetchAllData, scoreList } = useScoreStore();
const { scoreView } = useSettingsStore();

// emits
const emits = defineEmits<{ (e: 'clickRow', value: { id: number; diff: Difficulty }): void }>();
const Filters: Record<string, (row: RowItem) => boolean> = {
  title: (row): boolean =>
    scoreView.filterCondition.musicTitle === '' || row.title.includes(scoreView.filterCondition.musicTitle),
  difficulty: (row): boolean => scoreView.filterCondition.difficultyCheckState[row.difficulty],
  level: (row): boolean =>
    scoreView.filterCondition.level.low <= row.level && row.level <= scoreView.filterCondition.level.high,
  fullCombo: (row) => {
    if (scoreView.filterCondition.fullCombo === 'none') {
      return true;
    }
    return (scoreView.filterCondition.fullCombo === 'include') !== (row.comboState === ComboState.NONE);
  },
  allPerfect: (row) => {
    if (scoreView.filterCondition.allPerfect === 'none') {
      return true;
    }
    return (scoreView.filterCondition.allPerfect !== 'include') !== (row.comboState === ComboState.AP);
  },
};

// data
const pageSizeList = [10, 30, 50, 100, 150];

const page = ref(1);
const itemsPerPage = ref(30);
const pageCount = computed(() => Math.floor(items.value.length / itemsPerPage.value) + 1);

interface RowItem {
  /** 楽曲ID */
  musicId: number;
  /** ジャケット画像URL */
  jacketUrl: string;
  /** 楽曲名 */
  title: string;
  /** 難易度 */
  difficulty: Difficulty;
  /** 楽曲レベル */
  level: number;
  /** スコアのランクマッチ表記 */
  rankMatchScore: number;
  /** スコアの減点式表記 */
  apDiffScore: string;
  /** スコアの精度表記 */
  accuracyScore: number[];
  /** スコアの割合表記 */
  scoreRate: number;
  /** コンボ状態 */
  comboState: ComboState;
}

const customKeySort: Record<string, (a: any, b: any) => number> = {
  difficulty: (left: Difficulty, right: Difficulty) => {
    return DifficultyList.findIndex((d) => d === left) - DifficultyList.findIndex((d) => d === right);
  },
  accuracyScore: (left: number[], right: number[]) => {
    const weight = [1, 2, 3, 3];
    const leftW = weight.reduce((sum, w, i) => sum + left[i] * w, 0);
    const rightW = weight.reduce((sum, w, i) => sum + right[i] * w, 0);
    if (leftW !== rightW) {
      return leftW - rightW;
    }

    for (let i = 0; i < 4; i++) {
      if (left[3 - i] !== right[3 - i]) {
        return left[3 - i] - right[3 - i];
      }
    }
    return 0;
  },
};

onBeforeMount(async () => {
  await fetchAllData();
});

const headers = computed(() => {
  return defaultHeaders.filter((h) => scoreView.columns.some((c) => c === h.key));
});

const items = computed(() => {
  const scoreRecords: RowItem[] = musicList
    .flatMap((music) => music.difficulties.map((diff) => ({ music, diff })))
    .flatMap(({ music, diff }) => {
      const musicIdPad = ('000' + music.id.toString()).slice(-3);

      const score = scoreList.find((data) => data.musicId === music.id && data.difficulty === diff.diff);
      if (score === undefined) {
        if (scoreView.filterCondition.showUnregister) {
          const row: RowItem = {
            musicId: music.id,
            jacketUrl: `https://storage.sekai.best/sekai-assets/music/jacket/jacket_s_${musicIdPad}_rip/jacket_s_${musicIdPad}.webp`,
            title: music.title,
            difficulty: diff.diff,
            level: diff.level,
            rankMatchScore: 0,
            scoreRate: 0,
            apDiffScore: '-',
            accuracyScore: [0, 0, 0, 0],
            comboState: ComboState.NONE,
          };
          return row;
        }
        return [];
      }

      const row: RowItem = {
        musicId: score.musicId,
        jacketUrl: `https://storage.sekai.best/sekai-assets/music/jacket/jacket_s_${musicIdPad}_rip/jacket_s_${musicIdPad}.webp`,
        title: music.title,
        difficulty: score.difficulty,
        level: diff.level,
        rankMatchScore: score.calcRankMatchScore(),
        scoreRate: score.calcScoreRate(diff.noteCount) * 100,
        apDiffScore: `${score.getDeductionScore(diff.noteCount)}`,
        accuracyScore: score.getScoreAccuracy(),
        comboState: score.comboState(diff.noteCount),
      };

      return row;
    })
    .sort(defaultSortComparator);

  return scoreRecords.filter((rec) => Object.values(Filters).every((filter) => filter(rec)));
});

/** 初期ソート評価関数 */
const defaultSortComparator = (a: RowItem, b: RowItem): number => {
  if (a.musicId !== b.musicId) {
    return a.musicId - b.musicId;
  }
  return (
    DifficultyList.findIndex((diff) => diff === a.difficulty) -
    DifficultyList.findIndex((diff) => diff === b.difficulty)
  );
};
</script>
