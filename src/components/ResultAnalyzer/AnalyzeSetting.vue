<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-file-input
          prepend-icon="mdi-camera"
          v-model="settings.files"
          accept="image/*"
          label="リザルト画像"
          multiple
          counter
        />
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
import { useAnalyzerStore } from '@/stores/AnalyzerStore';

export interface Settings {
  files: File[] | undefined;
}

const { progress } = useAnalyzerStore();

const emits = defineEmits<{ (e: 'submit', settings: Settings): void }>();

const settings = ref({
  files: undefined as File[] | undefined,
} as Settings);

const shortageSettings = computed(() => (settings.value.files?.length ?? 0) === 0);
const isAnalyzing = computed(() => progress.state.key !== 'not-start' && progress.state.key !== 'completed');
</script>
