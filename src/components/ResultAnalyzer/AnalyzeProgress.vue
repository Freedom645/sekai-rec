<template>
  <v-container>
    <v-row>
      <v-col>セットアップ</v-col>
      <v-col>
        <v-icon v-if="progress.state.key === 'not-start'" icon="mdi-ocr" />
        <v-progress-circular v-else-if="progress.state.key === 'init'" indeterminate />
        <v-icon v-else icon="mdi-check-circle" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>前処理</v-col>
      <v-col><v-progress-linear v-model="progress.threshold" :buffer-value="20" /></v-col>
    </v-row>
    <v-row>
      <v-col>スコア解析</v-col>
      <v-col>
        <v-progress-linear v-model="progress.ocrTask" :buffer-value="20" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>データ補正</v-col>
      <v-col>
        <v-progress-linear v-model="progress.correct" :buffer-value="20" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>エラー</v-col>
      <v-col>
        <v-textarea v-model="progress.errorText" rows="1" readonly />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { useAnalyzerStore } from '@/stores/AnalyzerStore';

const { progress } = useAnalyzerStore();
</script>
