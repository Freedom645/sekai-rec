<template>
  <v-container>
    <v-row>
      <v-col cols="5" sm="4" md="3">
        <v-responsive :aspect-ratio="1">
          <v-img :src="jacketSrc" />
        </v-responsive>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <h2>{{ music?.title }}</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <difficulty-rank :difficulty="difficulty" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { VContainer, VRow, VCol, VImg } from 'vuetify/components';
import DifficultyRank from '@/components/atomic/DifficultyRank.vue';
import { useMusicStore } from '@/stores/MusicStore';

const props = defineProps({
  musicId: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
});

const { findMusic } = useMusicStore();
const music = computed(() => findMusic(props.musicId));
const jacketSrc = computed(() => {
  const pad = ('000' + props.musicId.toString()).slice(-3);
  return `https://storage.sekai.best/sekai-assets/music/jacket/jacket_s_${pad}_rip/jacket_s_${pad}.webp`;
});
</script>
