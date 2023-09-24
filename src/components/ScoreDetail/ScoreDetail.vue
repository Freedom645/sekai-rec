<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="5" sm="4">
        <v-row justify="center">
          <v-col cols="12"><combo-label label="name" /></v-col>
          <v-col cols="12" class="text-center"><combo-label label="count" :count="score?.combo" /></v-col>
        </v-row>
      </v-col>
      <v-col cols="7" sm="4">
        <v-row v-for="accuracy in AccuracyList" :key="accuracy">
          <v-col cols="6">
            <accuracy-label :value="accuracy" />
          </v-col>
          <v-col cols="6">
            <zero-padding :combo="score?.accuracyCount.detailList[accuracy]" :length="4" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="8" sm="4">
        <l-f-rate :late="15" :fast="1" :height="20" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { VContainer, VRow, VCol } from 'vuetify/components';
import ZeroPadding from '@/components/atomic/ZeroPadding.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import ComboLabel from '@/components/atomic/ComboLabel.vue';
import LFRate from '../atomic/LFRate.vue';
import { AccuracyList } from '@/model/Score';
import { useScoreStore } from '@/stores/ScoreStore';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';

const props = defineProps({
  musicId: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
});

const { findScore } = useScoreStore();

const difficulty = computed(
  () => DifficultyRankList.find((rank) => rank === props.difficulty) ?? DifficultyRank.MASTER
);
const score = computed(() => findScore(props.musicId, difficulty.value));
</script>
