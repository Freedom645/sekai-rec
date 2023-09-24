<template>
  <v-overlay class="align-center justify-center" v-model="isShow">
    <v-progress-circular :color="settings.color" :size="settings.size" :width="settings.width" indeterminate />
  </v-overlay>
</template>

<script setup lang="ts">
import { useProgressOverlay } from '@/composables/useProgressOverlay';
const { isShow, settings } = useProgressOverlay();
</script>
