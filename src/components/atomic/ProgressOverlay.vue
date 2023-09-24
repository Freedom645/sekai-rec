<template>
  <v-overlay
    class="align-center justify-center"
    :model-value="isShow"
    @update:model-value="(event: boolean) => emits('update:isShow', event === true)"
  >
    <v-progress-circular :color="color" :size="size" width="6" indeterminate />
  </v-overlay>
</template>

<script setup lang="ts">
defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  size: {
    type: Number,
    default: 64,
  },
});

const emits = defineEmits<{ (e: 'update:isShow', isShow: boolean): void }>();
</script>
