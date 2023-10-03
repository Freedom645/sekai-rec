<template>
  <v-row>
    <v-col>
      <v-row>
        <v-col cols="12" md="6">
          <v-row>
            <v-col>
              <h3>基本</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">
              <v-text-field label="プリセット名" variant="outlined" density="compact" hide-details />
            </v-col>
            <v-col cols="2">
              <v-btn text="保存" color="primary" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5">
              <v-text-field
                v-model.number="preset.size.w"
                label="画面横幅"
                variant="outlined"
                density="compact"
                hide-details
                readonly
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model.number="preset.size.h"
                label="画面縦幅"
                variant="outlined"
                density="compact"
                hide-details
                readonly
              />
            </v-col>
            <v-col cols="2">
              <v-btn icon="mdi-import" color="secondary" size="small" @click="emits('clickSizeImport')" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="6">
          <!-- 二値化 -->
          <v-row>
            <v-col>
              <h3>二値化</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-label>全体指定</v-label>
            </v-col>
            <v-col>
              <v-text-field
                v-model="preset.threshold['default']"
                label="閾値"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-switch
                color="primary"
                label="個別指定"
                :model-value="preset.threshold[targetElement] !== undefined"
                @update:model-value="(checked: boolean) => preset.threshold[targetElement] = checked ? preset.threshold['default'] : undefined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col>
              <v-text-field
                :model-value="preset.threshold[targetElement] ?? preset.threshold['default']"
                @update:model-value="preset.threshold[targetElement] = $event"
                :label="`閾値（${elementRadioItems.find((n) => n.key === targetElement)?.label.toUpperCase()}）`"
                variant="outlined"
                density="compact"
                hide-details
                :disabled="preset.threshold[targetElement] === undefined"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <!-- 要素 -->
          <v-row>
            <v-col>
              <h3>要素</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-radio-group
                inline
                :model-value="targetElement"
                @update:model-value="emits('update:targetElement', $event)"
                color="white"
                hide-details
              >
                <v-radio v-for="item in elementRadioItems" :key="item.key" :value="item.key" color="primary">
                  <template #label>
                    <accuracy-label v-if="item.type === 'accuracy'" :value="item.label" />
                    <judgement-label v-else-if="item.type === 'judgement'" :value="item.label" />
                    <span v-else>{{ item.label }}</span>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="6">
          <!-- 位置 -->
          <v-row>
            <v-col>
              <h3>位置</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" sm="3" v-for="item in positionInputs" :key="item.key">
              <v-text-field
                v-model.number="preset.position[targetElement][item.key]"
                :label="item.label"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { reactive, type PropType } from 'vue';
import AccuracyLabel from '@/components/atomic/AccuracyLabel.vue';
import JudgementLabel from '@/components/atomic/JudgementLabel.vue';
import { Element, type ThresholdNumber } from '@/model/Analyze';
import type { Preset } from '@/stores/AnalyzerSettingsStore';
import { generateEmptyPreset } from '@/stores/AnalyzerSettingsStore';
import type { Rectangle } from '@/module/ImageProcessor';
import { watch } from 'vue';

const elementRadioItems = [
  { key: Element.TITLE, label: 'タイトル', type: 'text' },
  { key: Element.COMBO, label: 'コンボ', type: 'text' },
  { key: Element.DIFFICULT, label: '難易度', type: 'text' },
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

const props = defineProps({
  targetElement: {
    type: String as PropType<Element>,
    default: () => Element.TITLE,
  },
});

const emits = defineEmits<{
  (e: 'update:targetElement', target: Element): void;
  (e: 'changeRectangle', rect: Rectangle): void;
  (e: 'changeThreshold', threshold: ThresholdNumber): void;
  (e: 'clickSizeImport'): void;
}>();

const preset = reactive<Preset>(generateEmptyPreset());

const setPreset = (value: Partial<Preset>) => {
  preset.key = value.key ?? preset.key;
  preset.name = value.name ?? preset.name;
  preset.position = { ...(value.position ?? preset.position) };
  preset.threshold = { ...(value.threshold ?? preset.threshold) };
  preset.size = { ...(value.size ?? preset.size) };
};

defineExpose({ setPreset });

watch(
  () => ({
    ...preset.position[props.targetElement],
  }),
  (value) => emits('changeRectangle', value)
);

watch(
  () => ({
    ...preset.threshold,
  }),
  (value) => emits('changeThreshold', value)
);
</script>
