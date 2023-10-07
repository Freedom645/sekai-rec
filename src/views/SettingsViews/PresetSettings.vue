<template>
  <v-container>
    <v-window v-model="step" :touch="{ left: undefined, right: undefined }">
      <v-window-item>
        <v-row>
          <v-col class="d-flex align-center justify-end">
            <v-btn class="ml-3" color="primary" text="新規" @click="clickCreateNew()" />
            <v-btn
              class="ml-3"
              color="normal"
              text="コピー"
              :disabled="selectedPresetKey === undefined"
              @click="clickCopy()"
            />
            <v-btn
              class="ml-3"
              color="normal"
              text="編集"
              :disabled="selectedPresetKey === undefined"
              @click="clickEdit()"
            />
            <v-btn class="ml-3" color="danger" text="削除" :disabled="selectedPresetKey === undefined" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <preset-table v-model:preset-key="selectedPresetKey" />
          </v-col>
        </v-row>
      </v-window-item>
      <v-window-item>
        <v-row>
          <v-col class="d-flex align-center justify-space-between">
            <v-btn color="normal" prepend-icon="mdi-chevron-left" text="戻る" @click="step = 0" />
            <v-btn color="primary" prepend-icon="mdi-content-save" :text="'保存'" @click="savePreset()" />
          </v-col>
        </v-row>
        <preset-editor
          ref="presetEditor"
          v-model:target-element="targetElement"
          @change-rectangle="previewRect = $event"
          @change-threshold="previewThreshold = $event"
          @click-size-import="clickSizeImport()"
        />
        <preset-preview
          ref="presetPreview"
          :rect="previewRect"
          :target-element="targetElement"
          :thresholdSet="previewThreshold"
        />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PresetEditor from '@/components/Settings/PresetSettings/PresetEditor.vue';
import PresetPreview from '@/components/Settings/PresetSettings/PresetPreview.vue';
import PresetTable from '@/components/Settings/PresetSettings/PresetTable.vue';
import { Element, ElementList, type ThresholdNumber } from '@/model/Analyze';
import {
  generateEmptyPreset,
  generateEmptyRectangle,
  useAnalyzerSettingsStore,
  type Preset,
  clonePreset,
} from '@/stores/AnalyzerSettingsStore';
import type { Rectangle } from '@/module/ImageProcessor';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { nextTick } from 'vue';

const { getPresetList } = useAnalyzerSettingsStore();
const { confirm, notice } = useConfirmDialog();

const step = ref(0);

const selectedPresetKey = ref<string | undefined>(undefined);

const presetEditor = ref<InstanceType<typeof PresetEditor> | null>();
const presetPreview = ref<InstanceType<typeof PresetPreview> | null>();
const targetElement = ref<Element>(Element.TITLE);
const previewRect = ref<Rectangle>(generateEmptyRectangle());
const previewThreshold = ref<ThresholdNumber>({ default: 200 });

const clickCreateNew = () => {
  const preset = generateEmptyPreset();
  moveEditStep(preset);
};

const clickCopy = () => {
  if (selectedPresetKey.value === undefined) {
    return;
  }

  const preset = clonePreset(getPresetList.find((p) => p.key === selectedPresetKey.value) ?? generateEmptyPreset());
  preset.key = '';
  moveEditStep(preset);
};

const clickEdit = () => {
  if (selectedPresetKey.value === undefined) {
    return;
  }

  const preset = clonePreset(getPresetList.find((p) => p.key === selectedPresetKey.value) ?? generateEmptyPreset());
  moveEditStep(preset);
};

const moveEditStep = (preset: Preset) => {
  step.value = 1;
  nextTick(() => presetEditor.value?.setPreset(preset));
};

const savePreset = async () => {
  const preset = presetEditor.value?.getPreset();
  if (preset === undefined) {
    return;
  }

  const values = [
    preset.name,
    ...ElementList.flatMap((e) => Object.values(preset.position[e])),
    ...Object.values(preset.threshold),
  ];
  if (values.some((v) => v == null || v === '')) {
    notice({ title: 'エラー', text: '未入力の項目があります。' });
    return;
  }
  if (!(await confirm({ text: '保存しますか？' }))) {
    return;
  }
};

const clickSizeImport = async () => {
  if (presetPreview.value?.isLoadedFile() !== true) {
    notice({ text: '画像ファイルが読み込まれていません。<br>画像ファイル読み込み後に再度実行してください。' });
    return;
  }
  if (!(await confirm({ text: '表示してる画像ファイルのサイズを設定します。<br>よろしいですか？' }))) {
    return;
  }

  presetEditor.value?.setPreset({ size: { ...presetPreview.value.getImageSize() } });
};
</script>
