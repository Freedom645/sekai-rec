<template>
  <v-container>
    <h2>ハイスコア一覧</h2>
    <v-row class="mt-5">
      <v-col>
        <v-btn
          class="mr-3"
          color="secondary"
          elevation="4"
          prepend-icon="mdi-filter-multiple"
          @click="() => (showFilter = !showFilter)"
        >
          フィルタ
        </v-btn>
        <v-btn
          class="mr-3"
          color="secondary"
          elevation="4"
          prepend-icon="mdi-swap-horizontal-bold"
          @click="clickChangeScoreDisplay()"
        >
          スコア切替
        </v-btn>
      </v-col>
    </v-row>
    <v-expand-transition>
      <v-row v-show="showFilter">
        <v-col>
          <v-card elevation="4">
            <MusicFilter @apply="applyFilter($event)" />
          </v-card>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-row>
      <v-col>
        <ScoreTable :filter-condition="filterCondition" :score-type="scoreType" @click-row="clickMusicRecord($event)" />
      </v-col>
    </v-row>
    <high-score-modal
      v-model:is-open="modalState.isOpen"
      :music-id="modalState.musicId"
      :difficulty="modalState.difficulty"
    />
  </v-container>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { VContainer, VRow, VCol, VBtn, VExpandTransition, VCard } from 'vuetify/components';
import MusicFilter from '@/components/ScoreTable/MusicFilter.vue';
import ScoreTable, { type ScoreType } from '@/components/ScoreTable/ScoreTable.vue';
import HighScoreModal from '@/components/ScoreDetail/HighScoreModal.vue';
import { DifficultyRank } from '@/model/Game';
import { emptyCondition, type FilterCondition } from '@/model/Filter';
import { useMusicStore } from '@/stores/MusicStore';
import { reactive } from 'vue';
import { nextTick } from 'vue';

// const router = useRouter();
const { maxLevel } = useMusicStore();

const showFilter = ref(false);
const filterCondition = ref(emptyCondition(maxLevel));
const scoreType = ref('rankMatch' as ScoreType);

const modalState = reactive({
  isOpen: false,
  musicId: 0,
  difficulty: DifficultyRank.MASTER as DifficultyRank,
});

const applyFilter = (event: FilterCondition) => {
  filterCondition.value = event;
};

const clickMusicRecord = async (event: { id: number; diff: DifficultyRank }) => {
  // router.push({ path: `/score/${event.id}/${event.diff}` });
  modalState.musicId = event.id;
  modalState.difficulty = event.diff;
  await nextTick();
  modalState.isOpen = true;
};

const clickChangeScoreDisplay = () => {
  const list: ScoreType[] = ['rankMatch', 'rate', 'ap'];
  const next = list.findIndex((t) => t === scoreType.value) + 1;
  scoreType.value = list[next % list.length];
};
</script>
