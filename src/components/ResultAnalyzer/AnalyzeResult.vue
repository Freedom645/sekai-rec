<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col cols="12" md="6" lg="8">
        <v-pagination
          v-model="window"
          start="0"
          :end="completedData.urls.length - 1"
          :length="completedData.urls.length"
          :total-visible="5"
        />
      </v-col>
      <v-spacer />
      <v-col cols="6" sm="4" md="3" lg="2" class="d-flex align-center">
        <v-btn color="accent" prepend-icon="mdi-note-edit" @click="fixScoreData()">修正する</v-btn>
      </v-col>
      <v-col cols="6" sm="4" md="3" lg="2">
        <v-tooltip text="登録対象から除外します。解析画像を間違えた場合などにチェックしてください。" open-delay="800">
          <template v-slot:activator="{ props }">
            <v-checkbox
              v-bind="props"
              label="登録対象外"
              hide-details
              :model-value="!!completedData.isUnregister[window]"
              @update:model-value="completedData.isUnregister[window] = $event"
            />
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-window v-model="window">
          <v-window-item v-for="(url, index) in completedData.urls" :key="url">
            <v-row>
              <v-col cols="12" md="6">
                <v-responsive :aspect-ratio="16 / 9">
                  <v-img :src="url" />
                </v-responsive>
              </v-col>
              <v-col>
                <music-info
                  v-if="completedData.scoreData[index]"
                  :music-id="completedData.scoreData[index].musicId"
                  :difficulty="completedData.scoreData[index].difficulty"
                />
                <score-detail
                  v-if="completedData.scoreData[index]"
                  :music-id="completedData.scoreData[index].musicId"
                  :difficulty="completedData.scoreData[index].difficulty"
                  :score-data="completedData.scoreData[index]"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <template v-if="completedData.scoreData[index]">
                  <score-data-checker
                    v-if="completedData.scoreData[index]"
                    :music-id="completedData.scoreData[index].musicId"
                    :difficulty="completedData.scoreData[index].difficulty"
                    :accuracy-count="completedData.scoreData[index].accuracyCount"
                    :judgment-count="completedData.scoreData[index].judgmentCount"
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
import { ref } from 'vue';
import { VImg } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import ScoreEditorModal from './ScoreEditorModal.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { nextTick } from 'vue';

const window = ref(0);
const { completedData } = useAnalyzerStore();
const editorIsOpen = ref(false);

const fixScoreData = () => {
  nextTick(() => (editorIsOpen.value = true));
};
</script>
