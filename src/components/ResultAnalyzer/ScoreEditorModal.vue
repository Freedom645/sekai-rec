<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="(event: boolean) => emits('update:isOpen', event === true)"
    fullscreen
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-text>
          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-img :src="resultImage" />
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="12" lg="5">
                  <music-autocomplete v-model="musicTitle" :rules="TitleRules" @change-music="changeMusicId($event)" />
                </v-col>
                <v-col cols="12" lg="7">
                  <v-radio-group v-model="scoreData.difficulty" inline>
                    <v-radio v-for="rank in DifficultyRankList" :key="rank" :label="rank" :value="rank">
                      <template v-slot:label>
                        <difficulty-rank :difficulty="rank" />
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row class="mt-3">
                <v-col cols="6" sm="3" lg="2" v-for="acc in AccuracyList" :key="acc">
                  <accuracy-label :value="acc" />
                  <v-text-field
                    type="number"
                    :rules="AccuracyRules"
                    v-model.number="scoreData.accuracyCount[acc]"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" sm="3" lg="2">
                  <v-text-field
                    type="number"
                    label="Combo"
                    :rules="ScoreDetailRules"
                    v-model.number="scoreData.combo"
                    density="compact"
                  />
                </v-col>
                <v-col v-for="input in ScoreDetailInputs" :key="input.key" cols="6" sm="3" lg="2">
                  <v-text-field
                    type="number"
                    :label="input.name"
                    :rules="ScoreDetailRules"
                    v-model.number="scoreData.judgmentCount[input.key]"
                    density="compact"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <score-data-checker
                    :music-id="scoreData.musicId"
                    :difficulty="scoreData.difficulty"
                    :accuracy-count="scoreData.accuracyCount"
                    :judgment-count="scoreData.judgmentCount"
                    :combo="scoreData.combo"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="確定" @click="submit((value) => (isActive.value = value))" />
          <v-btn text="キャンセル" @click="isActive.value = false" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import type { ScoreData } from '@/model/Score';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import { DifficultyRankList } from '@/model/Game';
import { AccuracyList, type JudgmentCount, emptyScoreData, cloneScoreData } from '@/model/Score';
import { useMusicStore } from '@/stores/MusicStore';

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
const { getScoreData, getUrlData, fixScoreData } = useAnalyzerStore();
const { findMusic } = useMusicStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emits = defineEmits<{ (e: 'update:isOpen', isOpen: boolean): void }>();

const musicTitle = ref('');
const scoreData = ref<ScoreData>(emptyScoreData());
const resultImage = ref('');

watch(
  () => props.isOpen,
  () => {
    if (!props.isOpen) {
      return;
    }
    resultImage.value = getUrlData(props.index) ?? '';
    const data = getScoreData(props.index) ?? emptyScoreData();

    scoreData.value = cloneScoreData(data);
    musicTitle.value = findMusic(data.musicId)?.title ?? '';
  }
);

const changeMusicId = (id: number | undefined) => {
  if (id === undefined) {
    return;
  }

  scoreData.value.musicId = id;
};

const submit = (setActive: (isActive: boolean) => void) => {
  fixScoreData(props.index, scoreData.value);
  setActive(false);
};
</script>
