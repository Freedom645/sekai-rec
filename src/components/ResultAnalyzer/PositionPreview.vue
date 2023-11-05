<template>
  <v-sheet>
    <v-row class="d-flex align-center">
      <v-col cols="6">
        <v-select
          label="解析プリセット"
          :model-value="preset"
          @update:model-value="emits('update:preset', $event)"
          :items="presets"
          item-value="key"
          item-title="name"
          hide-details
          density="compact"
          return-object
          single-line
        />
      </v-col>
      <v-col cols="6">
        <v-dialog v-model="dialog" fullscreen :scrim="false" transition="dialog-bottom-transition">
          <template v-slot:activator="{ props }">
            <v-btn
              color="accent"
              prepend-icon="mdi-image-search"
              v-bind="props"
              :disabled="(files?.length ?? 0) === 0 || preset === undefined"
            >
              プレビュー
            </v-btn>
          </template>
          <v-card>
            <v-overlay :model-value="isLoading" contained class="align-center justify-center">
              <v-progress-circular color="deep-purple" height="10" indeterminate />
            </v-overlay>
            <v-carousel class="h-100" v-model="page">
              <v-carousel-item v-for="item in previewImage" :key="item.name" :src="item.image"> </v-carousel-item>
            </v-carousel>
            <v-container>
              <v-row>
                <v-col cols="12" md="6" class="d-flex justify-center"> {{ label }} </v-col>
                <v-col cols="12" md="6" class="d-flex justify-end">
                  <v-btn color="normal" @click="dialog = false">閉じる</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, watch, type PropType, onMounted } from 'vue';
import ImageProcessor, { type Rectangle } from '@/module/ImageProcessor';
import type { Preset } from '@/model/Analyze';
import { useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';
import { computed } from 'vue';

const { presets, fetchPreset } = useAnalyzerSettingsStore();

const props = defineProps({
  files: {
    type: Array as PropType<File[] | undefined>,
  },
  preset: {
    type: Object as PropType<Preset>,
  },
});

const emits = defineEmits<{
  (e: 'update:preset', preset: Preset): void;
}>();

interface PreviewData {
  name: string;
  image: string;
  modifyDate: Date;
}

const previewImage = ref<PreviewData[]>([]);
const isLoading = ref<boolean>(false);
const dialog = ref(false);
const page = ref(0);

onMounted(() => fetchPreset());

watch(dialog, async () => {
  if (dialog.value === false || props.files === undefined || props.files.length === 0 || props.preset === undefined) {
    return;
  }
  const files = props.files;
  const preset = props.preset;

  isLoading.value = true;
  previewImage.value.splice(0);
  const urls = files.map((files) => URL.createObjectURL(files));
  try {
    const positions = Object.values(preset.position) as Rectangle[];
    const data = await Promise.all(
      urls.map(
        async (data, index) =>
          ({
            name: files[index].name,
            image: await ImageProcessor.drawRectangles(data, positions, preset.size),
            modifyDate: new Date(files[index].lastModified),
          } as PreviewData)
      )
    );
    previewImage.value.push(...data);
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
    isLoading.value = false;
  }
});

const label = computed(() => {
  const previewData = previewImage.value[page.value];
  if (previewData === undefined) {
    return '';
  }

  return `${previewData.name} (${previewData.modifyDate.toLocaleString()})`;
});
</script>
