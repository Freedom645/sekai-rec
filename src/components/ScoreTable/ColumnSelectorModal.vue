<template>
  <v-dialog
    width="600"
    :model-value="isOpen"
    @update:model-value="(event: boolean) => emits('update:isOpen', event === true)"
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>表示設定</v-card-title>
        <v-card-text>
          <v-container class="pa-0">
            <v-checkbox
              label="一括"
              :model-value="selected.length === headers.length"
              @update:model-value="clickBulkCheck($event)"
            />
            <v-checkbox
              v-for="item in headers"
              :key="item.key"
              v-model="selected"
              :label="item.title"
              :value="item.key"
              hide-details
            />
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="flat"
            color="primary"
            :disabled="selected.length === 0"
            @click="isActive.value = clickApplyButton()"
            >適用</v-btn
          >
          <v-btn variant="flat" color="normal" @click="isActive.value = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup lang="ts">
import { ScoreColumnKey, useSettingsStore } from '@/stores/SettingsStore';
import { watch } from 'vue';
import { defineProps, ref } from 'vue';

const {
  scoreView: { columns },
  applyColumns,
} = useSettingsStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits<{ (e: 'update:isOpen', isOpen: boolean): void }>();

const headers = [
  { title: 'ジャケット画像', key: ScoreColumnKey.JACKET_URL },
  { title: '楽曲名', key: ScoreColumnKey.TITLE },
  { title: '難易度', key: ScoreColumnKey.DIFFICULTY },
  { title: 'Lv', key: ScoreColumnKey.LEVEL },
  { title: 'スコア', key: ScoreColumnKey.RANK_MATCH_SCORE },
  { title: 'スコア (減点)', key: ScoreColumnKey.AP_DIFF_SCORE },
  { title: 'スコア (精度)', key: ScoreColumnKey.ACCURACY_SCORE },
  { title: 'スコア (割合)', key: ScoreColumnKey.SCORE_RATE },
] as const;

const selected = ref<ScoreColumnKey[]>([]);

watch(
  () => props.isOpen,
  () => {
    selected.value.splice(0);
    selected.value.push(...columns);
  }
);

const clickBulkCheck = (checked: boolean) => {
  selected.value.splice(0);
  if (checked) {
    selected.value.push(...headers.map((h) => h.key));
  }
};

const clickApplyButton = (): boolean => {
  if (selected.value.length === 0) {
    return true;
  }

  applyColumns(selected.value);

  return false;
};
</script>
