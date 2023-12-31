<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-file-input
          prepend-icon="mdi-camera"
          v-model="settings.files"
          accept="image/*"
          label="リザルト画像"
          density="compact"
          variant="outlined"
          hide-details
          multiple
          counter
        />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <position-preview v-model:preset="settings.preset" :files="settings.files" />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="10" class="d-flex justify-end">
        <v-btn color="primary" :disabled="shortageSettings || isAnalyzing" @click="emits('submit', settings)">
          実行
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VContainer, VRow, VCol, VFileInput, VBtn } from 'vuetify/components';
import PositionPreview from './PositionPreview.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { onBeforeRouteLeave } from 'vue-router';
import type { Preset } from '@/model/Analyze';

export interface Settings {
  files: File[] | undefined;
  preset: Preset | undefined;
}

const { progress } = useAnalyzerStore();

const emits = defineEmits<{ (e: 'submit', settings: Settings): void }>();

const settings = ref({
  files: undefined,
  preset: undefined,
} as Settings);

const shortageSettings = computed(() => (settings.value.files?.length ?? 0) === 0);
const isAnalyzing = computed(() => progress.state !== 'not-start' && progress.state !== 'completed');

onBeforeRouteLeave((to, from, next) => {
  if (shortageSettings.value || progress.state !== 'not-start') {
    next();
    return;
  }

  const ok = window.confirm('選択中のファイルはリセットされますが、よろしいでしょうか？');
  next(ok);
});
</script>
