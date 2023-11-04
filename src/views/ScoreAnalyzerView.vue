<template>
  <v-container>
    <v-stepper v-model="step" editable hideActions>
      <v-stepper-header>
        <v-stepper-item
          v-for="item in stepperItems"
          :key="item.value"
          :value="item.value"
          :title="item.title"
          :rules="item.rules"
          :disabled="item.value >= 2 && scoreData.length === 0"
          icon="mdi-alert"
        />
      </v-stepper-header>
      <v-stepper-window :touch="{ right: undefined, left: undefined }">
        <v-stepper-window-item v-for="item in stepperItems" :key="item.value" :value="item.value">
          <component :is="item.component" @submit="submitSettings($event)" />
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { VStepper, VStepperHeader, VStepperItem, VStepperWindow, VStepperWindowItem } from 'vuetify/labs/components';
import AnalyzeSetting, { type Settings } from '@/components/ResultAnalyzer/AnalyzeSetting.vue';
import AnalyzeProgress from '@/components/ResultAnalyzer/AnalyzeProgress.vue';
import AnalyzeResult from '@/components/ResultAnalyzer/AnalyzeResult.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';

const {
  setSettings,
  startAnalyzing,
  progress: { errorText },
  completedData: { scoreData },
} = useAnalyzerStore();

const { notice } = useConfirmDialog();

const stepperItems = [
  { title: '1. 設定', value: 0, rules: [() => true], component: AnalyzeSetting },
  { title: '2. 解析', value: 1, rules: [() => true], component: AnalyzeProgress },
  { title: '3. 結果修正', value: 2, rules: [() => errorText === ''], component: AnalyzeResult },
  { title: '4. 確認', value: 3, rules: [() => true], component: undefined },
];

const step = ref(0);

const submitSettings = async (arg: Settings) => {
  step.value = 1;

  setSettings(arg);
  const errorText = await startAnalyzing();
  if (errorText !== '') {
    notice({ title: 'エラー', text: `解析中にエラーが発生しました。エラーメッセージ：${errorText}` });
    return;
  }

  step.value = 2;
};
</script>
