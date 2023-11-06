<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col cols="12" md="6" class="d-flex flex-wrap align-center justify-space-evenly">
        <v-pagination
          :model-value="window + 1"
          @update:model-value="window = $event - 1"
          :length="completedData.length"
          :total-visible="4"
        />
        <v-tooltip text="警告の出ているリザルトまでスキップします。" open-delay="600">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-skip-next"
              v-bind="props"
              density="comfortable"
              variant="outlined"
              color="warning"
              :disabled="nextIllegalityDataButtonDisabled"
              @click="nextIllegalityData()"
            />
          </template>
        </v-tooltip>
      </v-col>
      <v-col cols="12" md="6">
        <v-row>
          <v-col class="d-flex flex-wrap align-center justify-space-evenly">
            <v-btn
              color="accent"
              prepend-icon="mdi-note-edit"
              @click="fixScoreData()"
              :disabled="!!isUnregister[window]"
            >
              スコア修正
            </v-btn>
            <v-sheet>
              <v-tooltip
                text="登録対象から除外します。解析画像を間違えた場合などにチェックしてください。"
                open-delay="600"
              >
                <template v-slot:activator="{ props }">
                  <v-checkbox
                    v-bind="props"
                    label="登録対象外にする"
                    hide-details
                    :model-value="!!isUnregister[window]"
                    @update:model-value="isUnregister[window] = $event"
                  />
                </template>
              </v-tooltip>
            </v-sheet>
            <v-btn color="primary" :disabled="nextButtonDisabled" @click="next()">次へ</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-window v-model="window">
          <v-window-item v-for="data in completedData" :key="data.originalImage">
            <v-row>
              <v-col cols="12" md="6">
                <v-responsive :aspect-ratio="16 / 9">
                  <v-img
                    :src="showGrayscale ? data.preprocessedImage : data.originalImage"
                    @click="showGrayscale = !showGrayscale"
                  />
                </v-responsive>
              </v-col>
              <v-col>
                <music-info v-if="data.score" :music-id="data.score.musicId" :difficulty="data.score.difficulty" />
                <score-detail v-if="data.score" :score="data.score" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <template v-if="data.score">
                  <score-data-checker
                    v-if="data.score"
                    :music-id="data.score.musicId"
                    :difficulty="data.score.difficulty"
                    :accuracy-count="data.score.accuracy"
                    :judgment-count="data.score.judgement"
                    :combo="data.score.combo"
                    openIfError
                  />
                </template>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <score-editor-modal v-model:is-open="editorIsOpen" :index="window" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VImg, VPagination } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import ScoreEditorModal from './ScoreEditorModal.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { computed } from 'vue';

const { completedData, isUnregister, getRegisterData, getIllegalityDataIndex } = useAnalyzerStore();
const { notice } = useConfirmDialog();

const window = ref(0);
const editorIsOpen = ref(false);
const showGrayscale = ref(false);

const emits = defineEmits<{ (e: 'next'): void }>();

const fixScoreData = () => {
  editorIsOpen.value = true;
};

const nextIllegalityDataButtonDisabled = computed(() => getIllegalityDataIndex().length === 0);
const nextIllegalityData = () => {
  const indexList = getIllegalityDataIndex();
  console.log(indexList);
  if (indexList.length === 0) {
    return;
  }
  const next = indexList.findIndex((i) => window.value < i);
  if (next === -1) {
    window.value = indexList[0];
    return;
  }
  window.value = indexList[next];
};

const nextButtonDisabled = computed(() => getRegisterData().length === 0);
const next = () => {
  const illegalNum = getIllegalityDataIndex().length;
  if (illegalNum > 0) {
    notice({
      title: '解析エラー',
      text: `解析結果がエラーの楽曲が${illegalNum}曲あります。<br>スコア修正をするか、登録対象外に設定してください。`,
    });
    return;
  }

  emits('next');
};
</script>
