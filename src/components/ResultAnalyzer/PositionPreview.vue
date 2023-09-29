<template>
  <v-sheet>
    <v-row>
      <v-col cols="12">
        <v-select label="プリセット" v-model="presetName" :items="getPresetList.map((p) => p.name)" />
      </v-col>
      <v-col cols="12">
        <v-img :src="previewImage" aspect-ratio="16/9" cover />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';
import { ref, watchEffect } from 'vue';

import ImageProcessor from '@/module/ImageProcessor';
import type { PropType } from 'vue';

const { getPreset } = useAnalyzerSettingsStore();
const { getPresetList } = useAnalyzerSettingsStore();

const props = defineProps({
  file: {
    type: File as PropType<File | undefined>,
  },
});

const presetName = ref(getPresetList[0]?.name ?? '');
const previewImage = ref('');

watchEffect(async () => {
  if (props.file === undefined || presetName.value === undefined) {
    return;
  }
  const preset = getPreset(presetName.value);
  if (preset === undefined) {
    return;
  }

  const src = URL.createObjectURL(props.file);
  try {
    const positions = Object.values(preset.position);
    previewImage.value = await ImageProcessor.drawRectangles(src, positions);
  } finally {
    URL.revokeObjectURL(src);
  }
});
</script>
