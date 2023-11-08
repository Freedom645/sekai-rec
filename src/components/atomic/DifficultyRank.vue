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
  background: v-bind(backgroundColorName);
}
.label {
  width: 5.1rem;
}
.icon {
  width: 2.3rem;
}
</style>

<script lang="ts" setup>
import { DifficultyList, type Difficulty } from '@/domain/value/Difficulty';
import { computed, type PropType } from 'vue';

const props = defineProps({
  difficulty: {
    type: String as PropType<Difficulty>,
    required: true,
    validator: (value) => DifficultyList.some((rank) => rank === value),
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
