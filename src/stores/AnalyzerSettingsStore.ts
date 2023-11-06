import { defineStore } from 'pinia';
import Presets from '@/assets/settings/presets.json';
import { ElementList, clonePreset, type ImagePosition, type Preset } from '@/model/Analyze';
import { Rectangle } from '@/core/Geometry';
import { DB } from '@/infrastracture/IndexedDB/IndexedDB';

const generateDefaultData = () => {
  return (Object.keys(Presets) as (keyof typeof Presets)[]).map((key) => {
    const preset = Presets[key];
    const position = ElementList.reduce((obj, element) => {
      return Object.assign(obj, {
        [element]: new Rectangle({
          x: preset[element].x,
          y: preset[element].y,
          w: preset[element].w,
          h: preset[element].h,
        }),
      });
    }, {} as ImagePosition);

    return {
      key: key,
      name: preset.name,
      size: preset.size,
      position: { ...position },
      threshold: { ...preset.threshold },
    } as Preset;
  });
};

export const useAnalyzerSettingsStore = defineStore('analyzerSettings', {
  state: () => ({
    presets: [] as Preset[],
  }),
  getters: {
    getPresetList: (state): Preset[] => state.presets,
  },
  actions: {
    async fetchPreset(): Promise<Preset[]> {
      this.presets.splice(0);
      this.presets.push(...generateDefaultData());
      this.presets.push(...(await DB.presetTable.toArray()));
      return this.presets;
    },
    async savePreset(preset: Preset): Promise<void> {
      const cloned = clonePreset(preset);
      const index = this.presets.findIndex((p) => p.key === cloned.key);
      if (index === -1) {
        cloned.key = `custom-${this.presets.length + 1}`;
        this.presets.push(cloned);
      } else {
        this.presets[index] = cloned;
      }
      await DB.presetTable.put(cloned);
    },
    async deletePreset(key: string): Promise<void> {
      const index = this.presets.findIndex((p) => p.key === key);
      if (index === -1) {
        return;
      }
      this.presets.splice(index, 1);
      await DB.presetTable.delete(key);
    },
  },
});
