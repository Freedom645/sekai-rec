<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-data-table
    class="elevation-4"
    v-model:page="page"
    :headers="headers"
    :items="items"
    :items-per-page="itemsPerPage"
    item-value="id"
    fixed-header
    @click:row="(_: Event, { item: { value } }: any) => emits('update:presetKey', presetKey !== value ? value : undefined)"
  >
    <template v-slot:item.button="{ item: { value } }">
      <v-checkbox
        color="secondary"
        hide-details
        :model-value="presetKey === value"
        @update:model-value="emits('update:presetKey', $event ? value : undefined)"
      />
    </template>
    <template v-slot:bottom>
      <v-row justify="center" class="mt-1">
        <v-col cols="12" sm="8">
          <v-pagination variant="outlined" density="compact" v-model="page" :length="pageCount" />
        </v-col>
        <v-col cols="4" sm="3" md="2">
          <v-select
            class="mb-3"
            variant="outlined"
            density="compact"
            label="ページ数"
            :items="pageSizeList"
            :model-value="itemsPerPage"
            @update:model-value="itemsPerPage = parseInt($event, 10)"
            hide-details
          />
        </v-col>
      </v-row>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { VDataTable } from 'vuetify/labs/components';
import { useAnalyzerSettingsStore } from '@/stores/AnalyzerSettingsStore';

const headers = [
  { title: '', align: 'center', sortable: false, key: 'button' },
  { title: '名前', align: 'start', sortable: true, key: 'name' },
];
const pageSizeList = [10, 30, 50, 100, 300];

const { getPresetList } = useAnalyzerSettingsStore();

defineProps({
  presetKey: {
    type: String,
  },
});

const emits = defineEmits<{
  (e: 'update:presetKey', presetKey: string | undefined): void;
}>();

const page = ref(1);
const itemsPerPage = ref(30);
const pageCount = computed(() => Math.floor(items.value.length / itemsPerPage.value) + 1);

interface RowItem {
  id: string;
  no: number;
  name: string;
}

const items = computed(() => {
  return getPresetList.map(
    (item, index) =>
      ({
        id: item.key,
        no: index + 1,
        name: item.name,
      } as RowItem)
  );
});
</script>
