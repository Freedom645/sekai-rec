<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col>
        <v-pagination
          v-model="window"
          start="0"
          :end="completedData.urls.length - 1"
          :length="completedData.urls.length"
          :total-visible="7"
        />
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VImg } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';

const window = ref(0);
const { completedData } = useAnalyzerStore();
</script>
