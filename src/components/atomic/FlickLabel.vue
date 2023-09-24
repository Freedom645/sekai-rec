<template>
  <v-container>
    <v-chip prepend-icon="mdi-alert" variant="text" color="yellow">
      <span class="font-weight-bold"> FLICK </span>
      <span class="font-weight-bold ml-5" style="color: white"> {{ count }} </span>
    </v-chip>
  </v-container>
</template>

<script setup lang="ts">
defineProps({
  count: {
    type: Number,
    default: 0,
  },
});
</script>
