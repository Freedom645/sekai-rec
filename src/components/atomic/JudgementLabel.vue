<template>
  <span class="label-color font-weight-bold text-uppercase">{{ value }}</span>
</template>
<style>
.label-color {
  color: v-bind(colorName);
}
</style>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});

const colorName = computed(() => `var(--game-accuracy-${props.value})`);
</script>
