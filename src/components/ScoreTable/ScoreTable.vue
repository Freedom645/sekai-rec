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
    multiSort
    @click:row="(_: any, row: any) => emits('clickRow', { id: row.item.raw.musicId, diff: row.item.raw.difficulty })"
  >
    <template v-slot:item.jacketUrl="props">
      <v-img width="50" :src="props.item.columns.jacketUrl" />
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
          <v-col cols="12" sm="8">
            <v-pagination variant="tonal" density="compact" v-model="page" :length="pageCount" />
          </v-col>
          <v-col cols="4" sm="3" md="2">
            <v-select
              variant="filled"
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
import { ref, defineEmits, type PropType, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { VPagination, VSelect, VProgressLinear, VContainer } from 'vuetify/components';
import { VDataTable } from 'vuetify/labs/VDataTable';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { DifficultyRankList, type DifficultyRank as Difficulty } from '@/model/Game';
import { Accuracy, calcRankMatchScore } from '@/model/Score';
import type { FilterCondition } from '@/model/Filter';
import { useScoreStore } from '@/stores/ScoreStore';
import { onMounted } from 'vue';

const headers = [
  { title: '', align: 'center', sortable: false, key: 'jacketUrl' },
  { title: '楽曲名', align: 'start', sortable: true, key: 'title' },
  { title: '難易度', align: 'start', sortable: true, key: 'difficulty' },
  { title: 'Lv', align: 'start', sortable: true, key: 'level' },
  { title: 'スコア', align: 'end', sortable: true, key: 'rankMatchScore' },
  { title: 'スコア (減点)', align: 'end', sortable: true, key: 'apDiffScore' },
  { title: 'スコア (精度)', align: 'end', sortable: true, key: 'accuracyScore' },
  { title: 'スコア (割合)', align: 'end', sortable: true, key: 'scoreRate' },
];

const { xs } = useDisplay();
const { findMusic } = useMusicStore();
const { fetchAllData, allData } = useScoreStore();

// props
const props = defineProps({
  filterCondition: {
    type: Object as PropType<FilterCondition>,
    required: true,
  },
});

// emits
const emits = defineEmits<{ (e: 'clickRow', value: { id: number; diff: Difficulty }): void }>();
const Filters = {
  title: (value: string): boolean =>
    props.filterCondition.musicTitle === '' || value.includes(props.filterCondition.musicTitle),
  difficulty: (value: string): boolean => props.filterCondition.difficultyCheckState[value],
  level: (value: number): boolean =>
    props.filterCondition.level.low <= value && value <= props.filterCondition.level.high,
};

// data
const pageSizeList = [10, 30, 50, 100, 300];

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
}

const customKeySort: Record<string, (a: any, b: any) => number> = {
  difficulty: (left: Difficulty, right: Difficulty) => {
    return DifficultyRankList.findIndex((d) => d === left) - DifficultyRankList.findIndex((d) => d === right);
  },
  accuracyScore: (left: number[], right: number[]) => {
    const diffIndex = left.findIndex((v, i) => v !== right[i]);
    if (diffIndex === -1) {
      return 0;
    }
    return left[diffIndex] - right[diffIndex];
  },
};

onMounted(() => {
  fetchAllData();
});

const items = computed(() => {
  const scoreRecords: RowItem[] = allData
    .flatMap((score) => {
      const music = findMusic(score.musicId);
      const diff = music?.getDifficulty(score.difficulty);
      if (music === undefined || diff === undefined) {
        return [];
      }

      const rankScore = calcRankMatchScore(score.accuracyCount);
      const maxScore = diff.noteCount * 3;

      const accuracyScore = [Accuracy.GREAT, Accuracy.GOOD, Accuracy.BAD, Accuracy.MISS].map(
        (acc) => score.accuracyCount[acc]
      );

      const musicIdPad = ('000' + score.musicId.toString()).slice(-3);

      const row: RowItem = {
        musicId: score.musicId,
        jacketUrl: `https://storage.sekai.best/sekai-assets/music/jacket/jacket_s_${musicIdPad}_rip/jacket_s_${musicIdPad}.webp`,
        title: music.title,
        difficulty: score.difficulty,
        level: diff.level,
        rankMatchScore: rankScore,
        scoreRate: (rankScore / maxScore) * 100,
        apDiffScore: `${rankScore - maxScore}`,
        accuracyScore: accuracyScore,
      };

      return row;
    })
    .sort(defaultSortComparator);

  return scoreRecords.filter((rec) => {
    return Filters.title(rec.title) && Filters.difficulty(rec.difficulty) && Filters.level(rec.level);
  });
});

/** 初期ソート評価関数 */
const defaultSortComparator = (a: RowItem, b: RowItem): number => {
  if (a.musicId !== b.musicId) {
    return a.musicId - b.musicId;
  }
  return (
    DifficultyRankList.findIndex((diff) => diff === a.difficulty) -
    DifficultyRankList.findIndex((diff) => diff === b.difficulty)
  );
};
</script>
