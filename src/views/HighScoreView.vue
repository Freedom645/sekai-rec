<template>
  <v-container>
    <h2>ハイスコア一覧</h2>
    <v-row class="mt-5">
      <v-col class="d-flex justify-space-between">
        <v-btn
          class="mr-3"
          variant="tonal"
          color="secondary"
          icon="mdi-filter-multiple-outline"
          @click="() => (showFilter = !showFilter)"
        >
        </v-btn>
        <v-btn
          color="normal"
          variant="tonal"
          icon="mdi-cog-outline"
          @click="() => (columnSelectorModalState.isOpen = true)"
        />
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
        <ScoreTable :filter-condition="filterCondition" @click-row="clickMusicRecord($event)" />
      </v-col>
    </v-row>
    <high-score-modal
      v-model:is-open="scoreDetailModalState.isOpen"
      :music-id="scoreDetailModalState.musicId"
      :difficulty="scoreDetailModalState.difficulty"
    />
    <ColumnSelectorModal v-model:is-open="columnSelectorModalState.isOpen" />
  </v-container>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { VContainer, VRow, VCol, VBtn, VExpandTransition, VCard } from 'vuetify/components';
import MusicFilter from '@/components/ScoreTable/MusicFilter.vue';
import ScoreTable from '@/components/ScoreTable/ScoreTable.vue';
import HighScoreModal from '@/components/ScoreDetail/HighScoreModal.vue';
import ColumnSelectorModal from '@/components/ScoreTable/ColumnSelectorModal.vue';
import { DifficultyRank } from '@/model/Game';
import { emptyCondition, type FilterCondition } from '@/model/Filter';
import { useMusicStore } from '@/stores/MusicStore';
import { reactive } from 'vue';
import { nextTick } from 'vue';

// const router = useRouter();
const { maxLevel } = useMusicStore();

const showFilter = ref(false);
const filterCondition = ref(emptyCondition(maxLevel));

const scoreDetailModalState = reactive({
  isOpen: false,
  musicId: 0,
  difficulty: DifficultyRank.MASTER as DifficultyRank,
});

const columnSelectorModalState = reactive({
  isOpen: false,
});

const applyFilter = (event: FilterCondition) => {
  filterCondition.value = event;
};

const clickMusicRecord = async (event: { id: number; diff: DifficultyRank }) => {
  // router.push({ path: `/score/${event.id}/${event.diff}` });
  scoreDetailModalState.musicId = event.id;
  scoreDetailModalState.difficulty = event.diff;
  await nextTick();
  scoreDetailModalState.isOpen = true;
};
</script>
