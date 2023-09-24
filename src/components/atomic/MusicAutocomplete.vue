<template>
  <v-autocomplete
    label="楽曲名"
    :model-value="props.modelValue"
    @update:model-value="(event: string) => emits('update:modelValue', event ?? '')"
    :items="state.musics"
    :rules="rules"
    @update:search="onSearchInput"
    :loading="state.isSearching"
    no-data-text="一致する楽曲がありません"
    clearable
  >
  </v-autocomplete>
</template>

<script setup lang="ts">
import { reactive, defineProps, defineEmits } from 'vue';
import { VAutocomplete } from 'vuetify/components';
import { useMusicStore } from '@/stores/MusicStore';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  rules: { type: Array<(value: string) => boolean | string>, default: () => [] },
});
const emits = defineEmits<{ (e: 'update:modelValue', text: string): void }>();

const state = reactive({
  musics: [] as string[],
  isSearching: false,
  timerId: undefined as ReturnType<typeof setTimeout> | undefined,
});

const { musicList } = useMusicStore();

const onSearchInput = (searchName: string) => {
  if (searchName === '') {
    state.musics = [];
    clearTimeout(state.timerId);
    return;
  }
  state.isSearching = true;
  clearTimeout(state.timerId);

  state.timerId = setTimeout(async () => {
    state.musics = musicList
      .map((m) => m.title)
      .filter((title) => title.toLowerCase().includes(searchName.toLowerCase()))
      .sort();
    state.isSearching = false;
  }, 500);
};
</script>
