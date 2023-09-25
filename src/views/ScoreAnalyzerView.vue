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
    <v-row justify="center">
      <v-col>
        <v-pagination v-model="window" start="0" :end="urls.length" :length="urls.length + 1" :total-visible="7" />
      </v-col>
    </v-row>
    <v-window v-model="window">
      <v-window-item>
        <v-container>
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
        </v-container>
      </v-window-item>
      <v-window-item template v-for="(url, index) in urls" :key="url">
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-responsive :aspect-ratio="16 / 9">
                <v-img :src="url" />
              </v-responsive>
            </v-col>
            <v-col>
              <music-info
                v-if="analyzeResults[index]"
                :music-id="analyzeResults[index].musicId"
                :difficulty="analyzeResults[index].difficulty"
              />
              <score-detail
                v-if="analyzeResults[index]"
                :music-id="analyzeResults[index].musicId"
                :difficulty="analyzeResults[index].difficulty"
                :score-data="analyzeResults[index]"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <template v-if="analyzeResults[index]">
                <score-data-checker
                  v-if="analyzeResults[index]"
                  :music-id="analyzeResults[index].musicId"
                  :difficulty="analyzeResults[index].difficulty"
                  :accuracy-count="analyzeResults[index].accuracyCount"
                  :judgment-count="analyzeResults[index].judgmentCount"
                  :combo="analyzeResults[index].combo"
                />
              </template>
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-container>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue';
import { VFileInput, VProgressLinear, VImg, VTextarea } from 'vuetify/components';
import ImageProcessor from '@/module/ImageProcessor';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import { analyze } from '@/module/ScoreAnalyzer';
import { Element } from '@/model/Analyze';
import { useMusicStore } from '@/stores/MusicStore';
import { Accuracy, Judgment, type ScoreData } from '@/model/Score';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';

const { searchFuzzy } = useMusicStore();

const window = ref(0);
const files = ref(undefined as File[] | undefined);
const urls = ref([] as string[]);
const ocrText = ref(undefined as string | undefined);
const analyzeResults = ref([] as ScoreData[]);
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
  const thresholdUrls = await Promise.all(
    urls.value.map((url) =>
      toThreshold(url).then((res) => {
        completed++;
        progress.threshold = (completed * 100) / urls.value.length;
        return res;
      })
    )
  );

  // urls.value.push(...thresholdUrls);
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
    const records = await analyze(thresholdUrls, callback);
    progress.state = 'correct';

    console.dir(records);

    let comp = 0;
    analyzeResults.value = records.map((rec) => {
      const list = searchFuzzy(rec[Element.TITLE]);
      rec[Element.TITLE] = list[0].title;
      comp++;
      progress.correct = ((records.length - comp) * 100) / records.length;

      const scoreData: ScoreData = {
        musicId: list[0].musicId,
        difficulty:
          DifficultyRankList.find((diff) => diff.toUpperCase() === rec[Element.DIFFICULT].toUpperCase()) ??
          DifficultyRank.EASY,
        combo: Number.parseInt(rec[Element.COMBO]),
        accuracyCount: {
          [Accuracy.PERFECT]: Number.parseInt(rec[Element.PERFECT]),
          [Accuracy.GREAT]: Number.parseInt(rec[Element.GREAT]),
          [Accuracy.GOOD]: Number.parseInt(rec[Element.GOOD]),
          [Accuracy.BAD]: Number.parseInt(rec[Element.BAD]),
          [Accuracy.MISS]: Number.parseInt(rec[Element.MISS]),
        },
        judgmentCount: {
          [Judgment.LATE]: Number.parseInt(rec[Element.LATE]),
          [Judgment.FAST]: Number.parseInt(rec[Element.FAST]),
          [Judgment.FLICK]: Number.parseInt(rec[Element.FLICK]),
        },
      };

      return scoreData;
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
