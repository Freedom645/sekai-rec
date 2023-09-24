<template>
  <span v-if="label === 'name'" class="common combo-name"> COMBO </span>
  <span v-if="label === 'count'" class="common combo-count"> {{ count ?? '-' }} </span>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';
import { defineProps } from 'vue';
defineProps({
  label: {
    type: String as PropType<'name' | 'count'>,
    required: true,
    default: 'name',
  },
  count: {
    type: Number,
    required: false,
  },
});
</script>
<style scoped>
.common {
  font-size: 1.2em;
  font-weight: 1000;
}
.combo-name {
  -webkit-text-stroke: 0.5px rgb(var(--v-theme-secondary));
}
.combo-count {
  display: inline-block;
  background: linear-gradient(-90deg, #ffffff 10%, #fedcfd);
  background: -webkit-linear-gradient(-90deg, #ffffff 10%, #fedcfd);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 1px #cd89ec;
}
</style>
