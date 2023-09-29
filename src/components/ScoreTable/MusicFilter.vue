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
          <v-col lg="2" md="3" sm="4" cols="6" v-for="diff in DifficultyRankList" :key="diff">
            <v-checkbox v-model="filterCondition.difficultyCheckState[diff]" :label="diff" density="compact">
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
            />
          </v-col>
          <v-icon class="mt-5" icon="mdi-tilde" />
          <v-col>
            <v-select
              density="compact"
              v-model="filterCondition.level.high"
              @update:modelValue="updateLevelRange('high')"
              :items="LevelList"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col class="d-flex flex-row justify-end">
        <v-btn class="mr-3" color="primary" @click="clickApplyButton()">適用</v-btn>
        <v-btn class="mr-3" color="secondary" @click="clickResetButton()">リセット</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue';
import { VContainer, VRow, VCol, VBtn, VCheckbox, VIcon, VSelect } from 'vuetify/components';
import DifficultyRankComp from '@/components/atomic/DifficultyRank.vue';
import MusicAutocomplete from '@/components/atomic/MusicAutocomplete.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { DifficultyRankList } from '@/model/Game';
import { emptyCondition, type FilterCondition } from '@/model/Filter';

const { maxLevel } = useMusicStore();

const LevelList: number[] = Array(maxLevel)
  .fill(0)
  .map((_, index) => index + 1);

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

const emits = defineEmits<{ (e: 'apply', condition: FilterCondition): void }>();
const clickApplyButton = () => emits('apply', JSON.parse(JSON.stringify(filterCondition.value)));
const clickResetButton = () => (filterCondition.value = emptyCondition(maxLevel));
</script>
