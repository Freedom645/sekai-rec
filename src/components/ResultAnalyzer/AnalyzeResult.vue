<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col cols="12" md="6" class="d-flex flex-wrap align-center justify-space-evenly">
        <v-pagination
          :model-value="window + 1"
          @update:model-value="window = $event - 1"
          :length="completedData.urls.length"
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
              :disabled="illegalityDataIndex.length === 0"
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
              :disabled="!!completedData.isUnregister[window]"
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
                    :model-value="!!completedData.isUnregister[window]"
                    @update:model-value="completedData.isUnregister[window] = $event"
                  />
                </template>
              </v-tooltip>
            </v-sheet>
            <v-btn color="primary" @click="next()">次へ</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-window v-model="window">
          <v-window-item v-for="(url, index) in completedData.urls" :key="url">
            <v-row>
              <v-col cols="12" md="6">
                <v-responsive :aspect-ratio="16 / 9">
                  <v-img
                    :src="showGrayscale ? completedData.thresholdUrls[index].default : url"
                    @click="showGrayscale = !showGrayscale"
                  />
                </v-responsive>
              </v-col>
              <v-col>
                <music-info
                  v-if="completedData.scoreData[index]"
                  :music-id="completedData.scoreData[index].musicId"
                  :difficulty="completedData.scoreData[index].difficulty"
                />
                <score-detail v-if="completedData.scoreData[index]" :score="completedData.scoreData[index]" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <template v-if="completedData.scoreData[index]">
                  <score-data-checker
                    v-if="completedData.scoreData[index]"
                    :music-id="completedData.scoreData[index].musicId"
                    :difficulty="completedData.scoreData[index].difficulty"
                    :accuracy-count="completedData.scoreData[index].accuracy"
                    :judgment-count="completedData.scoreData[index].judgement"
                    :combo="completedData.scoreData[index].combo"
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
import { ref, computed } from 'vue';
import { VImg, VPagination } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import ScoreEditorModal from './ScoreEditorModal.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { Checker } from '@/module/Corrector';
import { useMusicStore } from '@/stores/MusicStore';

const { completedData } = useAnalyzerStore();
const { findMusic } = useMusicStore();
const { notice } = useConfirmDialog();

const window = ref(0);
const editorIsOpen = ref(false);
const showGrayscale = ref(false);

const emits = defineEmits<{ (e: 'next'): void }>();

const fixScoreData = () => {
  editorIsOpen.value = true;
};

const illegalityDataIndex = computed(() =>
  completedData.scoreData.flatMap((data, index) => {
    const music = findMusic(data.musicId);
    if (music === undefined) {
      return index;
    }
    if (completedData.isUnregister[index]) {
      return [];
    }
    if (Object.values(Checker).every((v) => v.validator(music, data) === '')) {
      return [];
    }
    return index;
  })
);

const nextIllegalityData = () => {
  if (illegalityDataIndex.value.length === 0) {
    return;
  }
  const next = illegalityDataIndex.value.findIndex((i) => window.value < i);
  if (next === -1) {
    window.value = illegalityDataIndex.value[0];
    return;
  }
  window.value = illegalityDataIndex.value[next];
};

const next = () => {
  const illegalNum = illegalityDataIndex.value.length;
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
