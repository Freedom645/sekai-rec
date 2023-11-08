<template>
  <span
    class="font-weight-bold text-uppercase"
    :class="{ 'game-accuracy-perfect': isPerfectLabel, 'game-accuracy-other': !isPerfectLabel }"
    >{{ value }}</span
  >
</template>
<style scoped>
.game-accuracy-other {
  color: v-bind(colorName);
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { Accuracy } from '@/domain/value/Accuracy';

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const isPerfectLabel = computed(() => props.value === Accuracy.PERFECT);
const colorName = computed(() => `var(--game-accuracy-${props.value})`);
</script>
