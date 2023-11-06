<template>
  <v-dialog
    width="600"
    :model-value="isOpen"
    @update:model-value="(event: boolean) => emits('update:isOpen', event === true)"
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-text>
          <v-container class="pa-0">
            <v-row>
              <MusicInfo :music-id="musicId" :difficulty="difficulty" />
            </v-row>
            <v-row>
              <ScoreDetail :music-id="musicId" :difficulty="difficulty" />
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="閉じる" @click="isActive.value = false" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup lang="ts">
import { defineProps } from 'vue';
import type { PropType } from 'vue';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import type { Difficulty } from '@/domain/value/Difficulty';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  musicId: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String as PropType<Difficulty>,
    required: true,
  },
});

const emits = defineEmits<{ (e: 'update:isOpen', isOpen: boolean): void }>();
</script>
