<template>
  <v-container no-gutters>
    <v-row justify="space-around" no-gutters>
      <v-col cols="6" class="text-left late-text font-weight-bold">LATE</v-col>
      <v-col cols="6" class="text-right fast-text font-weight-bold">FAST</v-col>
    </v-row>
    <v-row :style="`height: ${height}px;`">
      <div
        class="position trans late text-left rounded-s"
        :class="{ rounded: lateRate === 100 }"
        :style="`width: ${lateRate}%;`"
      ></div>
      <div
        class="position trans fast text-right rounded-e"
        :class="{ rounded: fastRate === 100 }"
        :style="`width: ${fastRate}%;`"
      ></div>
      <div class="content px-2">
        <div class="font-weight-bold">{{ late }}</div>
        <div class="font-weight-bold">{{ fast }}</div>
      </div>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  late: {
    type: Number,
    default: 0,
  },
  fast: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 16,
  },
});

const lateRate = computed(() => {
  const sum = props.late + props.fast;
  if (sum <= 0) {
    return 50;
  }
  return (props.late / sum) * 100;
});
const fastRate = computed(() => 100 - lateRate.value);
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.position {
  position: absolute;
  top: 0;
  bottom: 0;
  height: inherit;
}
.trans {
  transition: inherit;
  transition-property: width, left, right;
}
.late-text {
  color: var(--game-accuracy-late);
}
.fast-text {
  color: var(--game-accuracy-fast);
}
.late {
  left: 0;
  background-color: var(--game-accuracy-late);
}
.fast {
  right: 0;
  background-color: var(--game-accuracy-fast);
}
</style>
