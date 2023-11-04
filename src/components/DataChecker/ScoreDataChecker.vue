<template>
  <v-expansion-panels :model-value="hasError && openIfError ? [0] : []">
    <v-expansion-panel>
      <v-expansion-panel-title disable-icon-rotate>
        データ検証
        <template v-slot:actions>
          <v-fab-transition>
            <v-icon v-if="hasError" color="warning" icon="mdi-alert" />
            <v-icon v-else color="success" icon="mdi-check-circle" />
          </v-fab-transition>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-container class="pa-0">
          <v-row v-for="(checker, key) in Checker" :key="checker.title">
            <v-col cols="4" md="3">
              {{ checker.title }}
              <v-tooltip :text="checker.description">
                <template v-slot:activator="{ props }">
                  <v-btn size="x-small" icon v-bind="props" variant="text" readonly>
                    <v-icon icon="mdi-help-circle" />
                  </v-btn>
                </template>
              </v-tooltip>
            </v-col>
            <v-col cols="1">
              <v-fab-transition>
                <v-icon v-if="!errors[key]" icon="mdi-check-circle" color="success" />
                <v-icon v-else icon="mdi-alert" color="warning" />
              </v-fab-transition>
            </v-col>
            <v-col>
              <v-scroll-x-transition>
                <div v-if="errors[key]">
                  {{ errors[key] }}
                </div>
              </v-scroll-x-transition>
            </v-col>
          </v-row>
        </v-container>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import { VContainer, VRow, VCol } from 'vuetify/components';
import { Checker } from '@/module/Corrector';
import { useMusicStore } from '@/stores/MusicStore';
import { Score, type AccuracyCount, type JudgmentCount } from '@/domain/entity/Score';
import type { Difficulty } from '@/domain/value/Difficulty';

const { findMusic } = useMusicStore();

const props = defineProps({
  musicId: {
    type: Number,
  },
  difficulty: {
    type: String as PropType<Difficulty>,
  },
  combo: {
    type: Number,
  },
  accuracyCount: {
    type: Object as PropType<AccuracyCount>,
  },
  judgmentCount: {
    type: Object as PropType<JudgmentCount>,
  },
  openIfError: {
    type: Boolean,
    default: false,
  },
});

const hasError = computed(() => Object.values(errors.value).some((e) => e.length > 0));

const errors = computed(() => {
  const music = props.musicId ? findMusic(props.musicId) : undefined;
  return Object.keys(Checker).reduce((resObj, key) => {
    resObj[key] = '';
    if (
      music === undefined ||
      props.musicId === undefined ||
      props.difficulty === undefined ||
      props.combo === undefined ||
      props.accuracyCount === undefined ||
      props.judgmentCount === undefined
    ) {
      return resObj;
    }

    const scoreData = new Score({
      musicId: props.musicId,
      difficulty: props.difficulty,
      combo: props.combo,
      accuracy: props.accuracyCount,
      judgement: props.judgmentCount,
    });

    resObj[key] = Checker[key].validator(music, scoreData);
    return resObj;
  }, {} as { [key: string]: string });
});
</script>
