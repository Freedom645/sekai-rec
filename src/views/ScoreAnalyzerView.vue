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
          :disabled="item.value === 2 ? !isCompleted() : item.value === 3 ? !isCompleted() || hasIllegality : false"
          icon="mdi-alert"
        />
      </v-stepper-header>
      <v-stepper-window :touch="{ right: undefined, left: undefined }">
        <v-stepper-window-item v-for="item in stepperItems" :key="item.value" :value="item.value">
          <component :is="item.component" @submit="submitSettings($event)" @next="next()" />
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </v-container>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { VStepper, VStepperHeader, VStepperItem, VStepperWindow, VStepperWindowItem } from 'vuetify/labs/components';
import AnalyzeSetting, { type Settings } from '@/components/ResultAnalyzer/AnalyzeSetting.vue';
import AnalyzeProgress from '@/components/ResultAnalyzer/AnalyzeProgress.vue';
import AnalyzeResult from '@/components/ResultAnalyzer/AnalyzeResult.vue';
import AnalyzeUpdateTable from '@/components/ResultAnalyzer/AnalyzeUpdateTable.vue';
import { useAnalyzerStore } from '@/stores/AnalyzerStore';
import { useScoreStore } from '@/stores/ScoreStore';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { onMounted } from 'vue';

const {
  setSettings,
  startAnalyzing,
  progress: { errorText },
  isCompleted,
  getIllegalityDataIndex,
} = useAnalyzerStore();
const { fetchAllData } = useScoreStore();

const { notice } = useConfirmDialog();

const stepperItems = [
  { title: '1. 設定', value: 0, rules: [], component: AnalyzeSetting },
  { title: '2. 解析', value: 1, rules: [() => errorText === ''], component: AnalyzeProgress },
  {
    title: '3. 結果修正',
    value: 2,
    rules: [() => getIllegalityDataIndex().length === 0],
    component: AnalyzeResult,
  },
  {
    title: '4. 確認',
    value: 3,
    rules: [],
    component: AnalyzeUpdateTable,
  },
];

const step = ref(0);

onMounted(() => fetchAllData());

const hasIllegality = computed(() => getIllegalityDataIndex().length > 0);

function isSettings(arg: any): arg is Settings {
  if (arg == null) {
    return false;
  }
  const valid = ['files', 'preset'];
  return Object.keys(arg).every((key) => valid.some((v) => v === key));
}

const submitSettings = async (arg: unknown) => {
  step.value = 1;

  if (!isSettings(arg)) {
    throw new Error('implementation error.');
  }

  setSettings(arg);
  const errorText = await startAnalyzing();
  if (errorText !== '') {
    notice({ title: 'エラー', text: `解析中にエラーが発生しました。エラーメッセージ：${errorText}` });
    return;
  }

  step.value = 2;
};

const next = () => (step.value = (step.value + 1) % stepperItems.length);
</script>
