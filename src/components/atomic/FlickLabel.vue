<template>
  <v-container>
    <v-row>
      <v-col class="text-center"><v-icon color="yellow" icon="mdi-alert" />FLICK</v-col>
      <v-col> {{ count }} </v-col>
    </v-row>
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
