<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectPresetKey"
          :items="getPresetList"
          item-value="key"
          item-title="name"
          return-object
          density="compact"
          hide-details
        />
      </v-col>
      <v-col class="d-flex align-center">
        <v-btn color="primary" text="コピー" @click="clickCopy()" />
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PresetEditor from '@/components/Settings/PresetSettings/PresetEditor.vue';
import PresetPreview from '@/components/Settings/PresetSettings/PresetPreview.vue';
import { Element, type ThresholdNumber } from '@/model/Analyze';
import { generateEmptyRectangle, useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';
import type { Rectangle } from '@/module/ImageProcessor';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const { getPresetList } = useAnalyzerSettingsStore();
const { confirm, notice } = useConfirmDialog();

const selectPresetKey = ref(getPresetList[0]);
const targetElement = ref<Element>(Element.TITLE);
const previewRect = ref<Rectangle>(generateEmptyRectangle());
const previewThreshold = ref<ThresholdNumber>({ default: 200 });

const presetEditor = ref<InstanceType<typeof PresetEditor> | null>();
const presetPreview = ref<InstanceType<typeof PresetPreview> | null>();
const clickCopy = async () => {
  if (!(await confirm({ text: '入力中の値は上書きされます。<br>コピーしてもよろしいですか？' }))) {
    return;
  }
  const preset = selectPresetKey.value;
  if (preset) {
    presetEditor.value?.setPreset(preset);
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
