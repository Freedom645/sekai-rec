<template>
  <div>
    <span class="pad">{{ pad }}</span>
    <span>{{ combo }}</span>
  </div>
</template>
<style scoped>
.pad {
  color: var(--color-text);
}
</style>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps({
  combo: {
    type: Number,
    default: 0,
  },
  length: {
    type: Number,
    default: 4,
  },
});

const pad = ref('');

watchEffect(() => {
  const size = props.length - props.combo.toString().length;
  if (size <= 0) {
    pad.value = '';
  } else {
    pad.value = ''.padStart(size, '0');
  }
});
</script>
