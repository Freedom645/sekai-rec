import { defineStore } from 'pinia';
import Presets from '@/assets/settings/Presets.json';
import {
  ElementList,
  type DefaultKey,
  type ImagePosition,
  type ThresholdNumber,
  type ThresholdString,
} from '@/model/Analyze';
import type { Rectangle, Size } from '@/module/ImageProcessor';
import ImageProcessor from '@/module/ImageProcessor';

export interface Preset {
  key: string;
  name: string;
  size: Size;
  position: ImagePosition;
  threshold: ThresholdNumber;
}

export const generateEmptyRectangle = (): Rectangle => ({
  x: 0,
  y: 0,
  w: 1,
  h: 1,
});

export const generateEmptyPreset = (): Preset => ({
  key: '',
  name: '',
  size: { w: 1, h: 1 },
  position: ElementList.reduce(
    (obj, curr) => Object.assign(obj, { [curr]: generateEmptyRectangle() }),
    {} as ImagePosition
  ),
  threshold: { default: 200 },
});

export const clonePreset = (preset: Preset): Preset => ({
  key: preset.key,
  name: preset.name,
  size: { ...preset.size },
  position: { ...preset.position },
  threshold: { ...preset.threshold },
});

const generateDefaultData = () => {
  return (Object.keys(Presets) as (keyof typeof Presets)[]).map((key) => {
    const preset = Presets[key];
    const position = ElementList.reduce((obj, element) => {
      return Object.assign(obj, {
        [element]: { x: preset[element].x, y: preset[element].y, w: preset[element].w, h: preset[element].h },
      });
    }, {} as ImagePosition);

    console.log(key, preset.name, preset.threshold);
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
    presets: generateDefaultData(),
    editData: {
      previewFile: undefined as File | undefined,
      previewImage: '',
      previewThresholdImage: {} as ThresholdString,
      preset: generateEmptyPreset(),
    },
  }),
  getters: {
    getPresetList: (state): Preset[] => state.presets,
    getPreset:
      (state) =>
      (key: string): Preset | undefined =>
        state.presets.find((p) => (p.key = key)),
  },
  actions: {
    async fetchPreset(): Promise<Preset[]> {
      return this.presets;
    },
    async setEditFile(file: File): Promise<void> {
      this.editData.previewFile = file;
      const url = URL.createObjectURL(file);
      try {
        this.editData.previewImage = await ImageProcessor.drawRectangles(url, []);
        this.editData.previewThresholdImage = await this.generateThresholdUrls(url, this.editData.preset.threshold);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    async generateThresholdUrls(url: string, thresholdSet: ThresholdNumber): Promise<ThresholdString> {
      interface Task {
        key: number;
        data: string;
      }
      // 閾値の重複排除
      const thresholds = Object.values(thresholdSet).reduce((obj, value) => obj.add(value), new Set<number>());
      const tasks = await Promise.all(
        Array.from(thresholds).map(
          async (value) => ({ key: value, data: await ImageProcessor.convertThresholdImage(url, value) } as Task)
        )
      );

      // 閾値から逆マッピング
      const valueUrlMap = tasks.reduce(
        (obj, rec) => Object.assign(obj, { [rec.key]: rec.data }),
        {} as { [key: number]: string }
      );

      return (Object.keys(thresholdSet) as DefaultKey[]).reduce(
        (obj, key) => Object.assign(obj, { [key]: valueUrlMap[thresholdSet[key] ?? thresholdSet['default']] }),
        {} as ThresholdString
      );
    },
  },
});
