<template>
  <div
    class="difficulty-rank rounded px-1 py-0 text-center"
    :class="{
      label: type === 'label',
      icon: type === 'icon',
    }"
  >
    <span class="font-weight-bold" style="color: white; min-width: 5rem">
      {{ diffLabel }}
    </span>
  </div>
</template>
<style scoped>
.difficulty-rank {
  background-color: v-bind(backgroundColorName);
}
.label {
  width: 5.1rem;
}
.icon {
  width: 2.3rem;
}
</style>

<script lang="ts" setup>
import { computed, type PropType } from 'vue';
import { DifficultyRankList } from '@/model/Game';

const props = defineProps({
  difficulty: {
    type: String,
    required: true,
    validator: (value) => DifficultyRankList.some((rank) => rank === value),
  },
  type: {
    type: String as PropType<'label' | 'icon'>,
    default: 'label',
  },
});

const diffLabel = computed(() => {
  if (props.type === 'label') {
    return props.difficulty.toUpperCase();
  }
  return props.difficulty.slice(0, 1).toUpperCase() + props.difficulty.slice(1, 2).toLowerCase();
});

const backgroundColorName = computed(() => `var(--game-difficulty-rank-${props.difficulty})`);
</script>
