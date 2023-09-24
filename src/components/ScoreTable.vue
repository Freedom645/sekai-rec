<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    class="elevation-4"
    density="compact"
    v-model:page="page"
    :headers="headers"
    :items="items"
    :items-per-page="itemsPerPage"
    hide-default-footer
    fixed-header
    @click:row="(_: any, row: any) => emits('clickRow', { id: row.item.raw.musicId, diff: row.item.raw.difficulty })"
  >
    <template v-slot:item.title="props">
      <span class="font-weight-medium">
        {{ props.item.columns.title }}
      </span>
    </template>
    <template v-slot:item.difficulty="props">
      <difficulty-rank :type="xs ? 'icon' : 'label'" :difficulty="props.item.raw.difficulty" />
    </template>
    <template v-slot:item.scoreRate="props">
      <template v-if="scoreType === 'rate'">
        <v-progress-linear color="indigo" :model-value="props.item.raw.scoreRate" height="20">
          <span v-if="xs">{{ Math.round(props.item.raw.scoreRate) }}%</span>
          <span v-if="!xs">{{ Math.round(props.item.raw.scoreRate * 100) / 100 }}%</span>
        </v-progress-linear>
      </template>
      <template v-if="scoreType === 'rankMatch'">
        {{ props.item.raw.score }}
      </template>
      <template v-if="scoreType === 'ap'">
        <template v-if="props.item.raw.score - props.item.raw.maxScore === 0">AP</template>
        <template v-else>
          <span v-if="xs">{{ props.item.raw.score - props.item.raw.maxScore }}</span>
          <span v-if="!xs">AP {{ props.item.raw.score - props.item.raw.maxScore }}</span>
        </template>
      </template>
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
import type { DifficultyRank as Difficulty } from '@/model/Game';
import { calcRankMatchScore } from '@/model/Score';
import type { FilterCondition } from '@/model/Filter';
import { useScoreStore } from '@/stores/ScoreStore';
import { onMounted } from 'vue';

export type ScoreType = 'rate' | 'rankMatch' | 'ap';

const headers = [
  { title: '楽曲名', align: 'start', sortable: true, key: 'title' },
  { title: '難易度', align: 'start', sortable: true, key: 'difficulty' },
  { title: 'レベル', align: 'start', sortable: true, key: 'level' },
  { title: 'スコア', align: 'end', sortable: true, key: 'scoreRate' },
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
  scoreType: {
    type: String as PropType<ScoreType>,
    default: 'rate',
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
  musicId: number;
  title: string;
  difficulty: string;
  level: number;
  score: number;
  scoreRate: number;
  maxScore: number;
}

// computed
onMounted(async () => {
  await fetchAllData();
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

      const row: RowItem = {
        musicId: score.musicId,
        title: music?.title ?? '',
        difficulty: score.difficulty,
        level: diff?.level ?? 0,
        score: rankScore,
        maxScore: maxScore,
        scoreRate: (rankScore / maxScore) * 100,
      };

      return row;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return scoreRecords.filter((rec) => {
    return Filters.title(rec.title) && Filters.difficulty(rec.difficulty) && Filters.level(rec.level);
  });
});
</script>
