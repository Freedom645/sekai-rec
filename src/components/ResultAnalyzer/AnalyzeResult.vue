<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-pagination
          :model-value="window + 1"
          @update:model-value="window = $event - 1"
          :length="completedData.urls.length"
          :total-visible="4"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-row>
          <v-col class="d-flex flex-wrap align-center justify-space-evenly">
            <v-btn
              color="accent"
              prepend-icon="mdi-note-edit"
              @click="fixScoreData()"
              :disabled="!!completedData.isUnregister[window]"
              >スコア修正</v-btn
            >
            <v-btn color="primary" @click="complete()">完了</v-btn>
            <v-sheet>
              <v-tooltip
                text="登録対象から除外します。解析画像を間違えた場合などにチェックしてください。"
                open-delay="600"
              >
                <template v-slot:activator="{ props }">
                  <v-checkbox
                    v-bind="props"
                    label="登録対象外にする"
                    hide-details
                    :model-value="!!completedData.isUnregister[window]"
                    @update:model-value="completedData.isUnregister[window] = $event"
                  />
                </template>
              </v-tooltip>
            </v-sheet>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-window v-model="window">
          <v-window-item v-for="(url, index) in completedData.urls" :key="url">
            <v-row>
              <v-col cols="12" md="6">
                <v-responsive :aspect-ratio="16 / 9">
                  <v-img :src="url" />
                </v-responsive>
              </v-col>
              <v-col>
                <music-info
                  v-if="completedData.scoreData[index]"
                  :music-id="completedData.scoreData[index].musicId"
                  :difficulty="completedData.scoreData[index].difficulty"
                />
                <score-detail
                  v-if="completedData.scoreData[index]"
                  :music-id="completedData.scoreData[index].musicId"
                  :difficulty="completedData.scoreData[index].difficulty"
                  :score-data="completedData.scoreData[index]"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <template v-if="completedData.scoreData[index]">
                  <score-data-checker
                    v-if="completedData.scoreData[index]"
                    :music-id="completedData.scoreData[index].musicId"
                    :difficulty="completedData.scoreData[index].difficulty"
                    :accuracy-count="completedData.scoreData[index].accuracyCount"
                    :judgment-count="completedData.scoreData[index].judgmentCount"
                    :combo="completedData.scoreData[index].combo"
                    openIfError
                  />
                </template>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <score-editor-modal v-model:is-open="editorIsOpen" :index="window" />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VImg, VPagination } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import ScoreDataChecker from '@/components/DataChecker/ScoreDataChecker.vue';
import ScoreEditorModal from './ScoreEditorModal.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { useProgressOverlay } from '@/composables/useProgressOverlay';
import { useScoreStore } from '@/stores/ScoreStore';
import { cloneScoreData } from '@/model/Score';
import { Checker } from '@/module/Corrector';
import { useMusicStore } from '@/stores/MusicStore';

const { completedData } = useAnalyzerStore();
const { upsertData } = useScoreStore();
const { findMusic } = useMusicStore();
const { confirm, notice } = useConfirmDialog();
const { show, hidden } = useProgressOverlay();

const window = ref(0);
const editorIsOpen = ref(false);

const fixScoreData = () => {
  editorIsOpen.value = true;
};

const complete = async () => {
  const registerCount = completedData.urls.filter((_, index) => !completedData.isUnregister[index]).length;
  const isUnregisterCount = completedData.urls.filter((_, index) => !!completedData.isUnregister[index]).length;

  const illegalityCount = completedData.scoreData.filter((data) => {
    const music = findMusic(data.musicId);
    return !music || !Object.values(Checker).every((v) => v.validator(music, data) === '');
  }).length;

  const warnings = [
    `<li>登録曲数：${registerCount}曲 (除外数：${isUnregisterCount}曲)</li>`,
    `<li>データ不正：${illegalityCount}曲</li>`,
  ];

  const message = `<p>スコアを登録します。よろしいですか？</p><br><div><ul>${warnings.join('')}</ul></div>`;
  if (!(await confirm({ title: '登録確認', text: message, ok: '登録', cancel: 'キャンセル' }))) {
    return;
  }

  try {
    show();
    const registerTargets = completedData.scoreData
      .filter((_, index) => !completedData.isUnregister[index])
      .map((data) => cloneScoreData(data));
    await upsertData(registerTargets);
    notice({ title: '登録完了', text: `登録が完了しました。` });
  } catch (e) {
    const errorMessage = e?.toString() ?? 'Unknown Error';
    notice({ title: '登録エラー', text: `登録エラーが発生しました。<br>${errorMessage}` });
  } finally {
    hidden();
  }
};
</script>
