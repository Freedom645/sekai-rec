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
            <zero-padding :combo="score.accuracy[accuracy]" :length="4" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="8" sm="4">
        <l-f-rate :late="score.judgement[Judgment.LATE]" :fast="score.judgement[Judgment.FAST]" :height="20" />
        <flick-label :count="score.judgement[Judgment.FLICK]" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { VContainer, VRow, VCol } from 'vuetify/components';
import ZeroPadding from '@/components/atomic/ZeroPadding.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import ComboLabel from '@/components/atomic/ComboLabel.vue';
import LFRate from '@/components/atomic/LFRate.vue';
import FlickLabel from '@/components/atomic/FlickLabel.vue';
import { useScoreStore } from '@/stores/ScoreStore';
import { Score } from '@/domain/entity/Score';
import type { Difficulty } from '@/domain/value/Difficulty';
import { AccuracyList } from '@/domain/value/Accuracy';
import { Judgment } from '@/domain/value/Judgement';

const props = defineProps({
  musicId: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String as PropType<Difficulty>,
    required: true,
  },
  score: {
    type: Object as PropType<Score>,
  },
});

const { findScore } = useScoreStore();

const score = computed(() => props.score ?? findScore(props.musicId, props.difficulty) ?? Score.emptyScoreData());
</script>
