<template>
  <v-container>
    <h2>登録楽曲</h2>
    <v-row class="mt-3">
      <v-col cols="12" md="5">
        <music-autocomplete v-model="state.musicTitle" :rules="TitleRules" />
      </v-col>
      <v-col cols="12" md="7">
        <v-radio-group v-model="state.difficulty" inline>
          <v-radio v-for="rank in DifficultyRankList" :key="rank" :label="rank" :value="rank">
            <template v-slot:label>
              <difficulty-rank :difficulty="rank" />
            </template>
          </v-radio>
        </v-radio-group>
      </v-col>
    </v-row>

    <h2>スコア入力</h2>
    <v-row class="mt-3">
      <v-col cols="6" sm="3" lg="2" v-for="acc in AccuracyList" :key="acc">
        <accuracy-label :value="acc" />
        <v-text-field
          type="number"
          :rules="AccuracyRules"
          v-model.number="state.accuracyKeyValue[acc]"
          density="compact"
        />
      </v-col>
    </v-row>

    <h3>スコア詳細</h3>
    <v-row>
      <v-col v-for="input in ScoreDetailInputs" :key="input.key" cols="6" sm="3" lg="2">
        <v-text-field
          type="number"
          :label="input.name"
          :rules="ScoreDetailRules"
          v-model.number="state.scoreDetail[input.key]"
          density="compact"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" sm="3">ランクマッチスコア</v-col>
      <v-col>{{ rankMatchScore }}/{{ (difficulty?.noteCount ?? 0) * 3 }}</v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="3" sm="2" md="1">
        <v-btn disabled>登録</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { VContainer, VRow, VCol, VRadioGroup, VRadio, VTextField } from 'vuetify/components';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import { DifficultyRankList, DifficultyRank as Difficulty } from '@/model/Game';
import { AccuracyList, type AccuracyKeyValue, AccuracyCount, Accuracy } from '@/model/Score';
import { useMusicStore } from '@/stores/MusicStore';
import { watch } from 'vue';

const ScoreDetailInputs: Array<{ name: string; key: keyof ScoreDetail }> = [
  { name: 'Combo', key: 'combo' },
  { name: 'Fast', key: 'fast' },
  { name: 'Late', key: 'late' },
  { name: 'Flick', key: 'flick' },
];

const TitleRules = [(value: string) => !!value || '入力してください。'];

const AccuracyRules = [
  (value: string) => (value !== undefined && value !== '') || '入力してください。',
  (value: number) => value >= 0 || '0以上で入力してください。',
  (value: string) => value === '' || Number.isInteger(value) || '整数で入力してください。',
];

const ScoreDetailRules = [
  (value: number) => value === undefined || value >= 0 || '0以上で入力してください。',
  (value: unknown) => value === undefined || value === '' || Number.isInteger(value) || '整数で入力してください。',
];

interface ScoreDetail {
  combo: number;
  fast: number;
  late: number;
  flick: number;
}

const state = reactive({
  musicTitle: '',
  difficulty: Difficulty.MASTER,
  accuracyKeyValue: {} as AccuracyKeyValue<number>,
  scoreDetail: {} as ScoreDetail,
});

const { musicList } = useMusicStore();

const music = computed(() => musicList.find((music) => music.title === state.musicTitle));
const difficulty = computed(() => music.value?.getDifficulty(state.difficulty));

const rankMatchScore = computed(() => AccuracyCount.calcRankMatchScore(state.accuracyKeyValue));

watch(
  () => ({ music: music.value, difficulty: difficulty.value }),
  () => {
    if (music.value === undefined || difficulty.value === undefined) {
      return;
    }
    AccuracyList.forEach((acc) => (state.accuracyKeyValue[acc] = 0));
    state.accuracyKeyValue[Accuracy.PERFECT] = difficulty.value.noteCount;
    state.scoreDetail = { combo: difficulty.value.noteCount, fast: 0, late: 0, flick: 0 };
  }
);
</script>
