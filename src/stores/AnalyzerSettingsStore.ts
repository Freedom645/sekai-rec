import { defineStore } from 'pinia';
import Presets from '@/assets/settings/Presets.json';
import { ElementList, type ImagePosition } from '@/model/Analyze';
import type { Size } from '@/module/ImageProcessor';

export interface Preset {
  key: string;
  name: string;
  size: Size;
  position: ImagePosition;
}

const generateDefaultData = () => {
  return (Object.keys(Presets) as (keyof typeof Presets)[]).map((key) => {
    const preset = Presets[key];
    const position = ElementList.reduce((obj, element) => {
      const rect = preset[element];
      obj[element] = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
      return obj;
    }, {} as ImagePosition);

    return {
      key: key,
      name: preset.name,
      size: preset.size,
      position: position,
    } as Preset;
  });
};

export const useAnalyzerSettingsStore = defineStore('analyzerSettings', {
  state: () => ({
    presets: generateDefaultData(),
  }),
  getters: {
    getPresetList: (state): Preset[] => state.presets,
    getPreset:
      (state) =>
      (key: string): Preset | undefined =>
        state.presets.find((p) => (p.key = key)),
  },
});
