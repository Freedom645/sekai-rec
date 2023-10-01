<template>
  <v-row>
    <v-col cols="12">
      <v-radio-group inline v-model="targetElement" color="white" hide-details>
        <v-radio v-for="item in elementRadioItems" :key="item.key" :value="item.key" color="primary">
          <template #label>
            <accuracy-label v-if="item.type === 'accuracy'" :value="item.label" />
            <judgement-label v-else-if="item.type === 'judgement'" :value="item.label" />
            <span v-else>{{ item.label }}</span>
          </template>
        </v-radio>
      </v-radio-group>
    </v-col>
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-row>
        <v-col v-for="item in positionInputs" :key="item.key">
          <v-text-field
            v-model.number="preset.position[targetElement][item.key]"
            :label="item.label"
            variant="outlined"
            density="compact"
            hide-details="auto"
          />
        </v-col>
        <v-col>
          <v-checkbox v-model="showThreshold" label="二値化" density="compact" hide-details />
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" md="10">
      <v-file-input
        v-model="files"
        accept="image/*"
        label="リザルト画像"
        density="compact"
        hide-details
        prepend-icon="mdi-camera"
      />
    </v-col>
    <v-col cols="12">
      {{ previewSize }}
      <div ref="previewImgContainer">
        <v-img ref="previewImg" v-show="!showThreshold" :src="previewUrl" @load="changeSize()" />
        <v-img v-show="showThreshold" :src="previewThresholdUrl" />
        <rectangle-canvas
          canvasId="drawingCanvas"
          :width="previewSize.w"
          :height="previewSize.h"
          :native-size="previewNativeSize"
          v-model:rect="preset.position[targetElement]"
          style="position: absolute; top: 0; left: 0"
          background-color="#FFFFFF00"
          :readonly="(files?.length ?? 0) === 0"
        />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { VImg } from 'vuetify/components';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import JudgementLabel from '@/components/atomic/JudgementLabel.vue';
import RectangleCanvas from './RectangleCanvas.vue';
import { Element } from '@/model/Analyze';
import { useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';
import ImageProcessor, { type Size } from '@/module/ImageProcessor';

const elementRadioItems = [
  { key: Element.TITLE, label: 'タイトル', type: 'text' },
  { key: Element.COMBO, label: 'コンボ', type: 'text' },
  { key: Element.PERFECT, label: 'perfect', type: 'accuracy' },
  { key: Element.GREAT, label: 'great', type: 'accuracy' },
  { key: Element.GOOD, label: 'good', type: 'accuracy' },
  { key: Element.BAD, label: 'bad', type: 'accuracy' },
  { key: Element.MISS, label: 'miss', type: 'accuracy' },
  { key: Element.LATE, label: 'late', type: 'judgement' },
  { key: Element.FAST, label: 'fast', type: 'judgement' },
  { key: Element.FLICK, label: 'flick', type: 'judgement' },
];

const positionInputs = [
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'w', label: 'Width' },
  { key: 'h', label: 'Height' },
] as const;

const { getPresetList } = useAnalyzerSettingsStore();

const targetElement = ref(Element.TITLE as Element);
const showThreshold = ref(false);
const preset = ref(getPresetList[0]);

const files = ref<File[] | undefined>(undefined);
const previewUrl = ref('');
const previewThresholdUrl = ref('');
const previewSize = ref<Size>({ w: 1120, h: 630 });
const previewNativeSize = ref<Size>({ w: 1120, h: 630 });
const previewImgContainer = ref<InstanceType<typeof HTMLDivElement> | undefined>(undefined);
const previewImg = ref<InstanceType<typeof VImg> | undefined>(undefined);

const changeSize = async () => {
  // TODO DOMの情報が上手く取れないため、少し待つようにしている。
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (previewImgContainer.value === undefined) {
    return;
  }
  const w = previewImgContainer.value.clientWidth;
  const h = previewImgContainer.value.clientHeight;
  previewSize.value = { w: w, h: h };

  if (previewImg.value !== undefined) {
    previewNativeSize.value = { w: previewImg.value.naturalWidth, h: previewImg.value.naturalHeight };
  }
};

watch(
  () => ({ files: files.value, preset: preset.value }),
  async ({ files, preset }) => {
    if (files === undefined || files.length === 0) {
      return;
    }

    const url = URL.createObjectURL(files[0]);
    try {
      previewUrl.value = await ImageProcessor.drawRectangles(url, []);
      previewThresholdUrl.value = await ImageProcessor.convertThresholdImage(url, 200);
    } finally {
      URL.revokeObjectURL(url);
    }
  },
  { deep: true }
);
</script>
