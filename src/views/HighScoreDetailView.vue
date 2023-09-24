<template>
  <v-container>
    <v-row>
      <h1>ハイスコア</h1>
    </v-row>
    <v-row>
      <MusicInfo :music-id="state.musicId" :difficulty="state.difficulty" />
    </v-row>
    <v-row>
      <ScoreDetail :music-id="state.musicId" :difficulty="state.difficulty" />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { VContainer, VRow } from 'vuetify/components';
import MusicInfo from '@/components/ScoreDetail/MusicInfo.vue';
import ScoreDetail from '@/components/ScoreDetail/ScoreDetail.vue';
import { useMusicStore } from '@/stores/MusicStore';
import { DifficultyRank, DifficultyRankList } from '@/model/Game';

const state = reactive({
  musicId: 1,
  difficulty: DifficultyRank.MASTER as DifficultyRank,
});

const { findMusic } = useMusicStore();
const route = useRoute();
const router = useRouter();

const validatePathParam = (
  idParam: string | string[],
  diffParam: string | string[]
): { id: number; diff: DifficultyRank } | undefined => {
  if (typeof idParam !== 'string' || typeof diffParam !== 'string') {
    return undefined;
  }

  const musicId = parseInt(idParam);
  if (isNaN(musicId)) {
    return undefined;
  }

  const diff = DifficultyRankList.find((diff) => diff === diffParam);
  if (diff === undefined) {
    return undefined;
  }

  const id = findMusic(musicId)?.id;
  if (id === undefined) {
    return undefined;
  }

  return { id, diff };
};

onMounted(() => {
  const res = validatePathParam(route.params.id, route.params.diff);
  if (res === undefined) {
    router.push('/score');
    return;
  }
  state.musicId = res.id;
  state.difficulty = res.diff;
});

onBeforeRouteUpdate((_, __, next) => {
  const res = validatePathParam(route.params.id, route.params.diff);
  if (res === undefined) {
    next('/score');
    return;
  }
  state.musicId = res.id;
  state.difficulty = res.diff;
});
</script>
