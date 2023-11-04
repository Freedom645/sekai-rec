<template>
  <span class="font-weight-bold" :class="{ label: type === 'label', icon: type === 'icon', [className]: true }">
    {{ label }}
  </span>
</template>
<style scoped>
.label {
  width: 5.1rem;
}
.icon {
  width: 2.3rem;
}
</style>
<script setup lang="ts">
import { ComboState } from '@/domain/value/ComboState';
import { computed, type PropType } from 'vue';

const props = defineProps({
  state: {
    type: String as PropType<ComboState>,
    required: true,
  },
  type: {
    type: String as PropType<'label' | 'icon'>,
    default: 'label',
  },
});

const label = computed(() => {
  switch (props.state) {
    case ComboState.AP:
      return props.type === 'label' ? 'ALL PERFECT' : 'AP';
    case ComboState.FC:
      return props.type === 'label' ? 'FULL COMBO' : 'FC';
    default:
      return props.type === 'label' ? '-' : '-';
  }
});

const className = computed(() => `game-combo-state-${props.state}`);
</script>
