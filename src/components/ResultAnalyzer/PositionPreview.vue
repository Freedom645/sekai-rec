<template>
  <v-sheet>
    <v-row class="d-flex align-center">
      <v-col cols="8">
        <v-select
          label="位置プリセット"
          :model-value="preset"
          @update:model-value="emits('update:preset', $event)"
          :items="getPresetList"
          item-value="key"
          item-title="name"
          return-object
          single-line
        />
      </v-col>
      <v-col cols="4">
        <v-dialog v-model="dialog" fullscreen :scrim="false" transition="dialog-bottom-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              color="accent"
              icon="mdi-image-search"
              v-bind="props"
              :disabled="file === undefined || preset === undefined"
            />
          </template>
          <v-card @click="dialog = false">
            <v-img :src="previewImage" />
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { useAnalyzerSettingsStore, type Preset } from '@/stores/AnalyzerSettingsStore';
import { ref, watch, type PropType } from 'vue';
import ImageProcessor from '@/module/ImageProcessor';

const { getPresetList } = useAnalyzerSettingsStore();

const props = defineProps({
  file: {
    type: File as PropType<File | undefined>,
  },
  preset: {
    type: Object as PropType<Preset>,
  },
});

const emits = defineEmits<{
  (e: 'update:preset', preset: Preset): void;
}>();

const previewImage = ref('');
const dialog = ref(false);

watch(
  () => ({ file: props.file?.name, preset: props.preset }),
  async () => {
    if (props.file === undefined || props.preset === undefined) {
      return;
    }

    const src = URL.createObjectURL(props.file);
    try {
      const positions = Object.values(props.preset.position);
      previewImage.value = await ImageProcessor.drawRectangles(src, positions);
    } finally {
      URL.revokeObjectURL(src);
    }
  }
);
</script>
