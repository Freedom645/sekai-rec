<template>
  <v-container>
    <v-row>
      <v-col cols="3">楽曲名</v-col>
      <v-col>
        <music-autocomplete v-model="filterCondition.musicTitle" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">難易度</v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-checkbox
              label="一括"
              density="compact"
              hide-details
              :model-value="difficultyBulkCheck"
              @update:model-value="clickDifficultyBulkCheck($event)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col lg="2" md="3" sm="4" cols="6" v-for="diff in DifficultyRankList" :key="diff">
            <v-checkbox
              v-model="filterCondition.difficultyCheckState[diff]"
              :label="diff"
              density="compact"
              hide-details
            >
              <template v-slot:label>
                <difficulty-rank-comp :difficulty="diff" />
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">レベル</v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-select
              density="compact"
              v-model="filterCondition.level.low"
              @update:modelValue="updateLevelRange('low')"
              :items="LevelList"
              hide-details
            />
          </v-col>
          <v-icon class="mt-5" icon="mdi-tilde" />
          <v-col>
            <v-select
              density="compact"
              v-model="filterCondition.level.high"
              @update:modelValue="updateLevelRange('high')"
              :items="LevelList"
              hide-details
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">Full Combo</v-col>
      <v-col>
        <v-radio-group v-model="filterCondition.fullCombo" inline hide-details>
          <v-radio
            v-for="item in comboRadioConditions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :color="item.color"
          />
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">All Perfect</v-col>
      <v-col>
        <v-radio-group v-model="filterCondition.allPerfect" inline hide-details>
          <v-radio
            v-for="item in comboRadioConditions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :color="item.color"
          />
        </v-radio-group>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col class="d-flex flex-row justify-end">
        <v-btn class="mr-3" color="primary" @click="clickApplyButton()">適用</v-btn>
        <v-btn class="mr-3" color="normal" @click="clickResetButton()">リセット</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { VContainer, VRow, VCol, VBtn, VCheckbox, VIcon, VSelect } from 'vuetify/components';
import DifficultyRankComp from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { useSettingsStore } from '@/stores/SettingsStore';
import { DifficultyRankList } from '@/model/Game';
import { emptyCondition } from '@/model/Filter';

const { maxLevel } = useMusicStore();
const { applyFilterCondition } = useSettingsStore();

const LevelList: number[] = Array(maxLevel)
  .fill(0)
  .map((_, index) => index + 1);

const comboRadioConditions = [
  { label: 'なし', value: 'none' },
  { label: '未', value: 'exclude', color: 'red' },
  { label: '済', value: 'include', color: 'blue' },
];

const filterCondition = ref(emptyCondition(maxLevel));

const updateLevelRange = (kind: 'low' | 'high'): void => {
  const level = filterCondition.value.level;
  if (level.high < level.low) {
    if (kind === 'low') {
      filterCondition.value.level.high = level.low;
    } else {
      filterCondition.value.level.low = level.high;
    }
  }
};

const clickApplyButton = () => {
  applyFilterCondition(filterCondition.value);
};
const clickResetButton = () => (filterCondition.value = emptyCondition(maxLevel));

const difficultyBulkCheck = computed(() => Object.values(filterCondition.value.difficultyCheckState).every((v) => v));
const clickDifficultyBulkCheck = (checked: boolean) => {
  DifficultyRankList.forEach((diff) => (filterCondition.value.difficultyCheckState[diff] = checked));
};
</script>
