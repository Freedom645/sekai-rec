import type { Rectangle, Size } from '@/core/Geometry';
import { ImageCanvas } from '@/domain/entity/ImageCanvas';

export default {
  async drawRectangles(url: string, positions: Rectangle[], size?: Size): Promise<string> {
    const image = await ImageCanvas.loadUrl(url);
    const rate: Size = {
      w: size ? image.w / size.w : 1,
      h: size ? image.h / size.h : 1,
    };

    positions.forEach((rect) => image.drawRectangle(rect.scale(rate)));

    return image.toDataURL();
  },
};
