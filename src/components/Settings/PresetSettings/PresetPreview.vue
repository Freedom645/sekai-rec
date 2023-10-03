<template>
  <v-row>
    <v-col cols="10" md="6">
      <v-file-input
        v-model="files"
        accept="image/*"
        label="リザルト画像"
        density="compact"
        hide-details
        prepend-icon="mdi-camera"
      />
    </v-col>
    <v-col class="d-flex align-center">
      <v-btn color="accent" prepend-icon="mdi-swap-horizontal-bold" @click="showThreshold = !showThreshold">
        二値化切替
      </v-btn>
    </v-col>
    <v-col cols="12">
      <div ref="previewImgContainer">
        <v-img ref="previewImg" v-show="!showThreshold" :src="previewUrl" @load="changeSize()" />
        <v-img v-show="showThreshold" :src="previewThresholdUrl[targetElement] ?? previewThresholdUrl['default']" />
        <rectangle-canvas
          v-if="previewUrl"
          ref="drawingCanvas"
          canvasId="drawingCanvas"
          :width="previewImgContainer?.clientWidth ?? 0"
          :height="previewImgContainer?.clientHeight ?? 0"
          :native-size="previewNativeSize"
          :rect="rect"
          style="position: absolute; top: 0; left: 0"
          background-color="#FFFFFF00"
          readonly
        />
      </div>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, defineProps, type PropType, nextTick } from 'vue';
import { VImg } from 'vuetify/components';
import RectangleCanvas from './RectangleCanvas.vue';
import ImageProcessor, { type Rectangle, type Size } from '@/module/ImageProcessor';
import type { Element, ThresholdString, ThresholdNumber, DefaultKey } from '@/model/Analyze';

const props = defineProps({
  targetElement: { type: String as PropType<Element>, required: true },
  rect: { type: Object as PropType<Rectangle>, required: true },
  thresholdSet: { type: Object as PropType<ThresholdNumber>, required: true },
});

const files = ref<File[] | undefined>(undefined);
const previewUrl = ref('');
const previewThresholdUrl = ref<ThresholdString>({ default: '' });
const previewNativeSize = ref<Size>({ w: 1120, h: 630 });
const previewImgContainer = ref<InstanceType<typeof HTMLDivElement> | null>(null);
const previewImg = ref<InstanceType<typeof VImg> | null>(null);
const drawingCanvas = ref<InstanceType<typeof RectangleCanvas> | null>();

const showThreshold = ref(false);

const changeSize = async () => {
  // TODO DOMの情報が上手く取れないため、少し待つようにしている。
  // await new Promise((resolve) => setTimeout(resolve, 500));
  if (previewImgContainer.value == null) {
    return;
  }

  if (previewImg.value?.naturalWidth != null && previewImg.value?.naturalHeight != null) {
    previewNativeSize.value = { w: previewImg.value.naturalWidth, h: previewImg.value.naturalHeight };
  }
  nextTick(() => drawingCanvas.value?.redraw());
};

onMounted(() => window.addEventListener('resize', changeSize));
onUnmounted(() => window.removeEventListener('resize', changeSize));

watch(
  () => ({ targetElement: props.targetElement, rect: props.rect }),
  () => {
    changeSize();
  }
);

const generateThresholdUrls = async (url: string, thresholdSet: ThresholdNumber): Promise<ThresholdString> => {
  interface Task {
    key: number;
    data: string;
  }
  // 閾値の重複排除
  const thresholds = Object.values(thresholdSet).reduce((obj, value) => obj.add(value), new Set<number>());
  const tasks = await Promise.all(
    Array.from(thresholds).map(
      async (value) => ({ key: value, data: await ImageProcessor.convertThresholdImage(url, value) } as Task)
    )
  );

  // 閾値から逆マッピング
  const valueUrlMap = tasks.reduce(
    (obj, rec) => Object.assign(obj, { [rec.key]: rec.data }),
    {} as { [key: number]: string }
  );

  return (Object.keys(thresholdSet) as DefaultKey[]).reduce(
    (obj, key) => Object.assign(obj, { [key]: valueUrlMap[thresholdSet[key] ?? thresholdSet['default']] }),
    {} as ThresholdString
  );
};

watch(
  () => ({ files: files.value, thresholdSet: props.thresholdSet }),
  async ({ files, thresholdSet }) => {
    if (files === undefined || files.length === 0) {
      return;
    }

    const url = URL.createObjectURL(files[0]);
    try {
      previewUrl.value = await ImageProcessor.drawRectangles(url, []);
      previewThresholdUrl.value = await generateThresholdUrls(url, thresholdSet);

      changeSize();
    } finally {
      URL.revokeObjectURL(url);
    }
  },
  { deep: true }
);

const isLoadedFile = () => files.value !== undefined && files.value.length > 0;
const getImageSize = () => ({ ...previewNativeSize.value });

defineExpose({ isLoadedFile, getImageSize });
</script>
