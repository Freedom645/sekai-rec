<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-container class="pa-0">
    <v-row>
      <v-col class="d-flex justify-end">
        <v-btn color="primary" :disabled="registerButtonDisabled" @click="clickRegisterButton()">登録</v-btn>
      </v-col>
    </v-row>
    <v-data-table
      class="mt-3"
      v-model:page="page"
      :headers="defaultHeaders"
      :items="items"
      :items-per-page="itemsPerPage"
      :customKeySort="customKeySort"
      hide-default-footer
      fixed-header
      noDataText="登録データがありません。"
    >
      <template v-slot:item.jacketUrl="props">
        <v-img width="50" :src="props.item.columns.jacketUrl" />
      </template>
      <template v-slot:item.title="props">
        <span class="font-weight-medium">
          {{ props.item.columns.title }}
        </span>
      </template>
      <template v-slot:item.difficulty="props">
        <difficulty-rank :type="xs ? 'icon' : 'label'" :difficulty="props.item.raw.difficulty" />
      </template>

      <template v-slot:item.comboState="{ item: { raw } }">
        <div>
          <ComboStateLabel :state="(raw as RowItem).comboState[0]" type="icon" />
        </div>
        <div>
          <ComboStateLabel :state="(raw as RowItem).comboState[1]" type="icon" />
        </div>
      </template>

      <template v-slot:item.score="{ item: { raw } }">
        <div>{{ (raw as RowItem).rankMatchScore[0] }}</div>
        <div :style="{ color: (raw as RowItem).color.rankMatchScore }">
          {{ (raw as RowItem).rankMatchScore[1] }}
        </div>
      </template>

      <template v-slot:item.accuracyScore="{ item: { raw } }">
        <div>{{ (raw as RowItem).accuracyScore[0].map((v: number) => v.toString()).join('-') }}</div>
        <div :style="{ color: (raw as RowItem).color.rankMatchScore }">
          {{ (raw as RowItem).accuracyScore[1].map((v: number) => v.toString()).join('-') }}
        </div>
      </template>

      <template v-slot:item.combo="{ item: { raw } }">
        <div>{{ (raw as RowItem).combo[0] }}</div>
        <div :style="{ color: (raw as RowItem).color.combo }">
          {{ (raw as RowItem).combo[1] }}
        </div>
      </template>

      <template v-slot:item.check="{ item: { index } }">
        <v-checkbox v-model="isRegister[index as number] " color="secondary" hide-details />
      </template>

      <template v-slot:bottom>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" sm="8">
              <v-pagination variant="tonal" density="compact" v-model="page" :length="pageCount" />
            </v-col>
            <v-col cols="4" sm="3" md="2">
              <v-select
                variant="filled"
                density="compact"
                :items="pageSizeList"
                v-model="itemsPerPage"
                @update:model-value="itemsPerPage = parseInt($event, 10)"
                hide-details
              />
            </v-col>
          </v-row>
        </v-container>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { VPagination, VSelect, VContainer } from 'vuetify/components';
import { VDataTable } from 'vuetify/labs/VDataTable';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import ComboStateLabel from '../atomic/ComboStateLabel.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useScoreStore } from '@/stores/ScoreStore';
import { useProgressOverlay } from '@/composables/useProgressOverlay';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import type { ComboState } from '@/domain/value/ComboState';
import { type Difficulty, DifficultyList } from '@/domain/value/Difficulty';
import { Score } from '@/domain/entity/Score';
import { watch } from 'vue';
import { padZero } from '@/core/utils/Parser';

const defaultHeaders = [
  { title: '', align: 'center', sortable: false, key: 'jacketUrl' },
  { title: '楽曲名', align: 'start', sortable: true, key: 'title' },
  { title: '難易度', align: 'start', sortable: true, key: 'difficulty' },
  { title: 'ランプ', align: 'center', sortable: false, key: 'comboState' },
  { title: 'スコア', align: 'end', sortable: true, key: 'score' },
  { title: '精度', align: 'end', sortable: true, key: 'accuracyScore' },
  { title: 'コンボ', align: 'end', sortable: true, key: 'combo' },
  { title: '登録', align: 'center', sortable: false, key: 'check' },
];

const { xs } = useDisplay();
const { findMusic } = useMusicStore();
const { findScore, upsertData } = useScoreStore();
const { getRegisterData } = useAnalyzerStore();
const { confirm, notice } = useConfirmDialog();
const { show, hidden } = useProgressOverlay();

// data
const pageSizeList = [10, 30, 50, 100, 300];

const page = ref(1);
const itemsPerPage = ref(30);
const pageCount = computed(() => Math.floor(items.value.length / itemsPerPage.value) + 1);
const isRegister = ref<boolean[]>([]);

interface RowItem {
  /** 楽曲ID */
  musicId: number;
  /** ジャケット画像URL */
  jacketUrl: string;
  /** 楽曲名 */
  title: string;
  /** 難易度 */
  difficulty: Difficulty;
  /** コンボ状態 */
  comboState: ComboState[];
  /** スコアのランクマッチ表記 */
  rankMatchScore: number[];
  /** スコアの精度表記 */
  accuracyScore: number[][];
  /** コンボ数 */
  combo: number[];
  /** 比較結果 */
  color: {
    rankMatchScore: string;
    combo: string;
  };
  /** スコアデータ */
  score: Score;
  /** 過去スコアデータ */
  beforeScore: Score;
}

const customKeySort: Record<string, (a: any, b: any) => number> = {
  difficulty: (left: Difficulty, right: Difficulty) => {
    return DifficultyList.findIndex((d) => d === left) - DifficultyList.findIndex((d) => d === right);
  },
  accuracyScore: (left: number[], right: number[]) => {
    const weight = [1, 2, 3, 3];
    const leftW = weight.reduce((sum, w, i) => sum + left[i] * w, 0);
    const rightW = weight.reduce((sum, w, i) => sum + right[i] * w, 0);
    if (leftW !== rightW) {
      return leftW - rightW;
    }

    for (let i = 0; i < 4; i++) {
      if (left[3 - i] !== right[3 - i]) {
        return left[3 - i] - right[3 - i];
      }
    }
    return 0;
  },
};

const items = computed(() => {
  const scoreRecords: RowItem[] = getRegisterData().flatMap((data) => {
    const music = findMusic(data.score.musicId);
    const diff = music?.getDifficulty(data.score.difficulty);
    if (music === undefined || diff === undefined) {
      return [];
    }

    const beforeScore = findScore(data.score.musicId, data.score.difficulty) ?? Score.emptyScoreData();

    const compareColor = (before: number, after: number) => {
      const diff = before - after;
      if (diff === 0) {
        return '';
      }
      if (diff < 0) {
        return 'green';
      }
      return 'red';
    };

    const musicIdPad = padZero(music.id, 3);
    const row: RowItem = {
      musicId: data.score.musicId,
      jacketUrl: `https://storage.sekai.best/sekai-assets/music/jacket/jacket_s_${musicIdPad}_rip/jacket_s_${musicIdPad}.webp`,
      title: music.title,
      difficulty: data.score.difficulty,
      comboState: [beforeScore.comboState(diff.noteCount), data.score.comboState(diff.noteCount)],
      rankMatchScore: [beforeScore.calcRankMatchScore(), data.score.calcRankMatchScore()],
      accuracyScore: [beforeScore.getScoreAccuracy(), data.score.getScoreAccuracy()],
      combo: [beforeScore.combo, data.score.combo],
      color: {
        rankMatchScore: compareColor(beforeScore.calcRankMatchScore(), data.score.calcRankMatchScore()),
        combo: compareColor(beforeScore.combo, data.score.combo),
      },
      score: data.score,
      beforeScore: beforeScore,
    };

    return row;
  });

  return scoreRecords;
});

watch(
  items,
  (items) => {
    isRegister.value = items.map((item) => item.beforeScore.compare(item.score) > 0);
  },
  { deep: true }
);

const registerButtonDisabled = computed(() => items.value.filter((_, index) => isRegister.value[index]).length === 0);

const clickRegisterButton = async () => {
  const registerData = items.value.filter((_, index) => isRegister.value[index]);
  const isUnregisterCount = items.value.filter((_, index) => !isRegister.value[index]).length;

  const warnings = [
    `<li>曲数：${items.value.length}曲</li>`,
    `<li>登録曲数：${registerData.length}曲（除外数：${isUnregisterCount}曲）</li>`,
  ];

  const message = `<p>スコアを登録します。よろしいですか？</p><br><div><ul>${warnings.join('')}</ul></div>`;
  if (!(await confirm({ title: '登録確認', text: message, ok: '登録', cancel: 'キャンセル' }))) {
    return;
  }

  try {
    show();
    const registerTargets = registerData.map((item) => new Score(item.score));
    await upsertData(registerTargets);
    notice({ title: '登録完了', text: `登録が完了しました。` });
  } catch (e) {
    const errorMessage = (e as Object)?.toString() ?? 'Unknown Error';
    notice({ title: '登録エラー', text: `登録エラーが発生しました。<br>${errorMessage}` });
  } finally {
    hidden();
  }
};
</script>
