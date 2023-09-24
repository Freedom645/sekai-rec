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
          v-model.number="state.accuracyCount[acc]"
          density="compact"
        />
      </v-col>
    </v-row>

    <h3>スコア詳細</h3>
    <v-row>
      <v-col cols="6" sm="3" lg="2">
        <v-text-field
          type="number"
          label="Combo"
          :rules="ScoreDetailRules"
          v-model.number="state.combo"
          density="compact"
        />
      </v-col>
      <v-col v-for="input in ScoreDetailInputs" :key="input.key" cols="6" sm="3" lg="2">
        <v-text-field
          type="number"
          :label="input.name"
          :rules="ScoreDetailRules"
          v-model.number="state.judgmentCount[input.key]"
          density="compact"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <score-data-checker
          :music-id="music?.id"
          :difficulty="difficulty?.rank"
          :accuracy-count="state.accuracyCount"
          :judgment-count="state.judgmentCount"
          :combo="state.combo"
        />
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="3" sm="2" md="1">
        <v-btn @click="registerScore()">登録</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { VContainer, VRow, VCol, VRadioGroup, VRadio, VTextField } from 'vuetify/components';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import { DifficultyRankList, DifficultyRank as Difficulty } from '@/model/Game';
import { AccuracyList, Accuracy, type ScoreData, type AccuracyCount, type JudgmentCount } from '@/model/Score';
import { useMusicStore } from '@/stores/MusicStore';
import { useScoreStore } from '@/stores/ScoreStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useProgressOverlay } from '@/composables/useProgressOverlay';

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
  (value: number) => value === undefined || value >= 0 || '0以上で入力してください。',
  (value: unknown) => value === undefined || value === '' || Number.isInteger(value) || '整数で入力してください。',
];

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
  if (music.value?.id === undefined || difficulty.value?.rank === undefined) {
    return;
  }

  if (!(await confirm({ text: '登録しますか？' }))) {
    return;
  }

  try {
    showProgress();

    const scoreData: ScoreData = {
      musicId: music.value.id,
      difficulty: difficulty.value.rank,
      combo: state.combo ?? 0,
      accuracyCount: { ...state.accuracyCount },
      judgmentCount: { ...state.judgmentCount },
    };

    await upsertData(scoreData);
  } finally {
    hiddenProgress();
  }

  notice({ title: '登録完了', text: '登録完了しました。' });
};
</script>
