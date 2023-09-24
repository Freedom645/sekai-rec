<template>
  <v-container>
    <h2>スコア解析</h2>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <v-file-input
          prepend-icon="mdi-camera"
          v-model="files"
          accept="image/*"
          label="リザルト画像"
          multiple
          counter
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>前処理</v-col>
      <v-col><v-progress-linear v-model="progress.threshold" :buffer-value="20" /></v-col>
    </v-row>
    <v-row>
      <v-col>セットアップ</v-col>
      <v-col>
        <v-icon v-if="progress.state === 'not-start'" icon="mdi-ocr" />
        <v-progress-circular v-else-if="progress.state === 'init'" indeterminate />
        <v-icon v-else icon="mdi-check-circle" />
      </v-col>
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
        <v-textarea v-model="ocrText" rows="1" readonly />
      </v-col>
    </v-row>
    <v-row v-for="(url, index) in urls" :key="url">
      <v-col cols="4">
        <template v-if="analyzeResults[index]">
          <v-row v-for="element in ElementList" :key="element" no-gutters>
            <v-col>{{ element }}</v-col>
            <v-col>{{ analyzeResults[index][element] }}</v-col>
          </v-row>
        </template>
      </v-col>
      <v-col>
        <v-img :src="url" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue';
import { VFileInput, VProgressLinear, VImg, VTextarea } from 'vuetify/components';
import ImageProcessor from '@/module/ImageProcessor';
import { analyze } from '@/module/ScoreAnalyzer';
import { ElementList, Element, type AnalyzeRecord } from '@/model/Analyze';
import { useMusicStore } from '@/stores/MusicStore';

const { searchFuzzy } = useMusicStore();

const files = ref(undefined as File[] | undefined);
const urls = ref([] as string[]);
const ocrText = ref(undefined as string | undefined);
const analyzeResults = ref([] as AnalyzeRecord[]);
const progress = reactive({
  state: 'not-start' as 'not-start' | 'threshold' | 'init' | 'ocr' | 'correct' | 'completed',
  threshold: 0,
  ocrTask: 0,
  correct: 0,
});

onUnmounted(() => {
  urls.value.forEach((url) => URL.revokeObjectURL(url));
});

const setStartState = () => {
  progress.state = 'not-start';
  progress.threshold = 0;
  progress.ocrTask = 0;
  progress.correct = 0;

  ocrText.value = '';
};

watch(files, async (input) => {
  setStartState();
  if (input === undefined || input.length === 0) {
    return;
  }
  analyzeResults.value.splice(0);

  progress.state = 'threshold';
  urls.value.forEach((url) => URL.revokeObjectURL(url));
  urls.value.splice(0);
  urls.value.push(...input.map((file) => URL.createObjectURL(file)));

  let completed = 0;
  const targets = await Promise.all(
    urls.value.map((url) =>
      toThreshold(url).then((res) => {
        completed++;
        progress.threshold = (completed * 100) / urls.value.length;
        return res;
      })
    )
  );
  try {
    progress.state = 'init';
    const callback = (s: 'ocr' | 'setup', v: number): void => {
      if (s === 'setup') {
        progress.state = 'init';
        return;
      }
      progress.state = 'ocr';
      progress.ocrTask = v;
    };
    const records = await analyze(targets, callback);
    progress.state = 'correct';

    let comp = 0;
    analyzeResults.value = records.map((rec) => {
      const list = searchFuzzy(rec[Element.TITLE]);
      rec[Element.TITLE] = list[0].title;
      comp++;
      progress.correct = ((records.length - comp) * 100) / records.length;
      return rec;
    });
    progress.correct = 100;

    progress.state = 'completed';
  } catch (e) {
    if (e instanceof Error) {
      ocrText.value = e.message;
    }
    ocrText.value = (e as Object)?.toString() ?? 'Unknown Error';
  }
});

const toThreshold = async (url: string): Promise<string> => {
  const src = await createImageElement(url);
  return await ImageProcessor.convertThresholdImage(src);
};
const createImageElement = async (url?: string): Promise<HTMLImageElement> => {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    if (url !== undefined) {
      image.src = url;
    }
  });
};
</script>
