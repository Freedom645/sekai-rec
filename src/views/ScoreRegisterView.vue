<template>
  <v-container>
    <h2>登録楽曲</h2>
    <v-form v-model="formValidation" @submit.prevent="registerScore()">
      <v-row class="mt-3">
        <v-col cols="12" md="5">
          <music-autocomplete v-model="state.musicTitle" :rules="TitleRules" />
        </v-col>
        <v-col cols="12" md="7">
          <v-radio-group v-model="state.difficulty" inline>
            <v-radio v-for="rank in DifficultyList" :key="rank" :label="rank" :value="rank">
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
          <v-text-field
            type="number"
            variant="outlined"
            :rules="AccuracyRules"
            v-model.number="state.accuracyCount[acc]"
            density="compact"
          >
            <template v-slot:label>
              <accuracy-label :value="acc" />
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6" sm="3" lg="2">
          <v-text-field
            type="number"
            variant="outlined"
            label="Combo"
            :rules="ScoreDetailRules"
            v-model.number="state.combo"
            density="compact"
          >
            <template v-slot:label>
              <span class="font-weight-bold" :style="{ color: `white` }">COMBO</span>
            </template>
          </v-text-field>
        </v-col>
        <v-col v-for="input in ScoreDetailInputs" :key="input.key" cols="6" sm="3" lg="2">
          <v-text-field
            type="number"
            variant="outlined"
            :label="input.name"
            :rules="ScoreDetailRules"
            v-model.number="state.judgmentCount[input.key]"
            density="compact"
          >
            <template v-slot:label>
              <span class="font-weight-bold text-uppercase" :style="{ color: `var(--game-accuracy-${input.key})` }">
                {{ input.name }}
              </span>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <score-data-checker
            :music-id="music?.id"
            :difficulty="state.difficulty"
            :accuracy-count="state.accuracyCount"
            :judgment-count="state.judgmentCount"
            :combo="state.combo"
            openIfError
            @has-error="dataCheckerError = $event"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn type="submit" color="primary" :disabled="!formValidation || dataCheckerError">登録</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { VContainer, VRow, VCol, VRadioGroup, VRadio, VTextField } from 'vuetify/components';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { useScoreStore } from '@/stores/ScoreStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useProgressOverlay } from '@/composables/useProgressOverlay';
import { Score } from '@/domain/entity/Score';
import { Accuracy, AccuracyList } from '@/domain/value/Accuracy';
import type { AccuracyCount, JudgmentCount } from '@/domain/entity/Score';
import { Difficulty, DifficultyList } from '@/domain/value/Difficulty';

const ScoreDetailInputs: Array<{ name: string; key: keyof JudgmentCount }> = [
  { name: 'Late', key: 'late' },
  { name: 'Fast', key: 'fast' },
  { name: 'Flick', key: 'flick' },
];

const TitleRules = [(value: string) => !!value || '入力してください。'];

const AccuracyRules = [
  (value: string) => (value !== undefined && value !== '') || '入力してください。',
  (value: number) => value >= 0 || '0以上で入力してください。',
  (value: string) => value === '' || Number.isInteger(value) || '整数で入力してください。',
];

const ScoreDetailRules = [
  (value: string) => (value !== undefined && value !== '') || '入力してください。',
  (value: number) => value === undefined || value >= 0 || '0以上で入力してください。',
  (value: unknown) => value === undefined || value === '' || Number.isInteger(value) || '整数で入力してください。',
];

const formValidation = ref(false);
const dataCheckerError = ref(false);

const state = reactive({
  musicTitle: '',
  difficulty: Difficulty.MASTER,
  combo: undefined as number | undefined,
  accuracyCount: {} as AccuracyCount,
  judgmentCount: {} as JudgmentCount,
});

const { musicList } = useMusicStore();
const { upsertData } = useScoreStore();
const { confirm, notice } = useConfirmDialog();
const { show: showProgress, hidden: hiddenProgress } = useProgressOverlay();

const music = computed(() => musicList.find((music) => music.title === state.musicTitle));
const difficulty = computed(() => music.value?.getDifficulty(state.difficulty));

watch(
  () => ({ music: music.value, difficulty: difficulty.value }),
  () => {
    if (music.value === undefined || difficulty.value === undefined) {
      return;
    }
    AccuracyList.forEach((acc) => (state.accuracyCount[acc] = 0));
    state.accuracyCount[Accuracy.PERFECT] = difficulty.value.noteCount;
    state.combo = difficulty.value.noteCount;
    state.judgmentCount = { fast: 0, late: 0, flick: 0 };
  }
);

const registerScore = async () => {
  if (music.value?.id === undefined || difficulty.value?.diff === undefined || formValidation.value !== true) {
    return;
  }

  if (!(await confirm({ text: '登録しますか？' }))) {
    return;
  }

  try {
    showProgress();

    const scoreData = new Score({
      musicId: music.value.id,
      difficulty: difficulty.value.diff,
      combo: state.combo ?? 0,
      accuracy: { ...state.accuracyCount },
      judgement: { ...state.judgmentCount },
    });

    await upsertData(scoreData);
  } finally {
    hiddenProgress();
  }

  notice({ title: '登録完了', text: '登録完了しました。' });
};
</script>
