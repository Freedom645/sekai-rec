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
            <zero-padding :combo="score?.accuracyCount[accuracy]" :length="4" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="8" sm="4">
        <l-f-rate
          :late="score?.judgmentCount[Judgment.LATE]"
          :fast="score?.judgmentCount[Judgment.FAST]"
          :height="20"
        />
        <flick-label :count="score?.judgmentCount[Judgment.FLICK]" />
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
import FlickLabel from '../atomic/FlickLabel.vue';
import { AccuracyList, Judgment, type ScoreData } from '@/model/Score';
import { useScoreStore } from '@/stores/ScoreStore';
import type { DifficultyRank } from '@/model/Game';
import type { PropType } from 'vue';

const props = defineProps({
  musicId: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String as PropType<DifficultyRank>,
    required: true,
  },
  scoreData: {
    type: Object as PropType<ScoreData>,
  },
});

const { findScore } = useScoreStore();

const score = computed(() => props.scoreData ?? findScore(props.musicId, props.difficulty));
</script>
