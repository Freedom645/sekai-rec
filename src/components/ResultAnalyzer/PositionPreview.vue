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
          variant="outlined"
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
              <v-carousel-item
                v-for="item in previewImage"
                :key="item.name"
                :src="displayPreprocessed ? item.preprocessed : item.image"
              >
              </v-carousel-item>
            </v-carousel>
            <v-container>
              <v-row>
                <v-col cols="12" md="6" class="d-flex justify-center"> {{ label }} </v-col>
                <v-col cols="12" md="6" class="d-flex justify-end">
                  <v-btn class="ml-5" color="accent" @click="displayPreprocessed = !displayPreprocessed">切替</v-btn>
                  <v-btn
                    class="ml-5"
                    color="accent"
                    :disabled="loadNextButtonDisabled || isLoading"
                    @click="clickLoadNext()"
                  >
                    読み込む
                  </v-btn>
                  <v-btn class="ml-5" color="normal" @click="dialog = false">閉じる</v-btn>
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
import { convertPresetToAnalysisSetting, type Preset } from '@/model/Analyze';
import { useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';
import { computed } from 'vue';
import { ImageCanvas } from '@/domain/entity/ImageCanvas';
import type { AnalysisSetting } from '@/domain/entity/AnalysisSetting';

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
  preprocessed: string;
  modifyDate: Date;
}

const previewImage = ref<PreviewData[]>([]);
const isLoading = ref<boolean>(false);
const dialog = ref(false);
const page = ref(0);
const displayPreprocessed = ref(false);

onMounted(() => fetchPreset());

watch(dialog, async () => {
  if (dialog.value === false || props.files === undefined || props.files.length === 0 || props.preset === undefined) {
    dialog.value = false;
    return;
  }
  page.value = 0;
  displayPreprocessed.value = false;
  previewImage.value.splice(0);
  await clickLoadNext();
});

const loadNextButtonDisabled = computed(() => (props.files?.length ?? 0) === previewImage.value.length);

const clickLoadNext = async (size: number = 5) => {
  if (dialog.value === false || props.files === undefined || props.files.length === 0 || props.preset === undefined) {
    return;
  }

  isLoading.value = true;

  const st = previewImage.value.length;
  const files = props.files.filter((_, index) => st <= index && index < st + size);

  try {
    const settings = convertPresetToAnalysisSetting(props.preset);
    const tasks = files.map((file) => preparePreviewImage(file, settings));
    const data = await Promise.all(tasks);
    previewImage.value.push(...data);
  } finally {
    isLoading.value = false;
  }
};

const preparePreviewImage = async (file: File, settings: AnalysisSetting): Promise<PreviewData> => {
  const data = URL.createObjectURL(file);
  try {
    const imageCanvas = await ImageCanvas.loadUrl(data);
    const preprocessed = settings.elements.reduce((dist, e) => {
      const value = e.binarizeValue();
      const range = e.analysisRange().scale(imageCanvas.toSize(), settings.imageSize);

      // 二値指定有無により、処理の要否を判定
      const cropped = value === undefined ? imageCanvas.cropNew(range) : imageCanvas.binarizeNew(value, range);

      // 書き込み
      return dist.drawImage(cropped, undefined, range);
    }, new ImageCanvas(imageCanvas.toSize(), 'black'));

    settings.elements.forEach((e) =>
      imageCanvas.drawRectangle(e.analysisRange().scale(imageCanvas.toSize(), settings.imageSize))
    );

    return {
      name: file.name,
      image: imageCanvas.toDataURL(),
      preprocessed: preprocessed.toDataURL(),
      modifyDate: new Date(file.lastModified),
    };
  } finally {
    URL.revokeObjectURL(data);
  }
};

const label = computed(() => {
  const previewData = previewImage.value[page.value];
  if (previewData === undefined) {
    return '';
  }

  return `${previewData.name} (${previewData.modifyDate.toLocaleString()})`;
});
</script>
