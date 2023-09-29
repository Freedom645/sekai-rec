import { defineStore } from 'pinia';
import Presets from '@/assets/settings/Presets.json';
import { ElementList, type ImagePosition } from '@/model/Analyze';
import type { Size } from '@/module/ImageProcessor';

export interface Preset {
  name: string;
  size: Size;
  position: ImagePosition;
}

const DefaultData = (() => {
  return (Object.keys(Presets) as (keyof typeof Presets)[]).map((key) => {
    const preset = Presets[key];
    const position = ElementList.reduce((obj, element) => {
      const rect = preset[element];
      obj[element] = { ...rect.tp, ...rect.size };
      return obj;
    }, {} as ImagePosition);

    return {
      name: key,
      size: preset.size.size,
      position: position,
    } as Preset;
  });
})();

export const useAnalyzerSettingsStore = defineStore('analyzerSettings', {
  state: () => ({
    presets: DefaultData,
  }),
  getters: {
    getPresetList: (state): Preset[] => state.presets,
    getPreset:
      (state) =>
      (name: string): Preset | undefined =>
        state.presets.find((p) => (p.name = name)),
  },
});
