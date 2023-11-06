import type { Rectangle, Size } from '@/core/Geometry';
import { ImageCanvas } from '@/domain/entity/ImageCanvas';

export default {
  async convertThresholdImage(url: string, thresholdValue: number): Promise<string> {
    const image = await ImageCanvas.loadUrl(url);
    return image.binarizeNew(thresholdValue).toDataURL();
  },
  async drawRectangles(url: string, positions: Rectangle[], size?: Size): Promise<string> {
    const image = await ImageCanvas.loadUrl(url);
    if (size === undefined) {
      size = { w: image.w, h: image.h };
    }

    const rate: Size = {
      w: image.w / size.w,
      h: image.h / size.h,
    };

    positions.forEach((rect) => image.drawRectangle(rect.scale(rate)));

    return image.toDataURL();
  },
};
