import type { Rectangle as TesseractRect } from 'tesseract.js';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export class Rectangle {
  private readonly tl: Point;
  private readonly br: Point;
  constructor(point: Point, size: Size) {
    this.tl = { x: point.x, y: point.y };
    this.br = { x: point.x + size.w, y: point.y + size.h };
  }

  get topLeft(): Point {
    return this.tl;
  }

  get bottomRight(): Point {
    return this.br;
  }

  get width(): number {
    return this.br.x - this.tl.x;
  }

  get height(): number {
    return this.br.y - this.tl.y;
  }

  get size(): Size {
    return { w: this.width, h: this.height };
  }

  public convertTesseractRect(): TesseractRect {
    return { left: this.tl.x, top: this.tl.y, width: this.width, height: this.height };
  }
}

function threshold(data: ImageData, threshold: number = 200): ImageData {
  const lum = [0.298912, 0.586611, 0.114478]; //輝度計算用の係数

  for (let i = 0; i < data.data.length; i += 4) {
    const value = data.data[i] * lum[0] + data.data[i + 1] * lum[1] + data.data[i + 2] * lum[2];
    if (value < threshold) {
      data.data[i] = data.data[i + 1] = data.data[i + 2] = 0;
    } else {
      data.data[i] = data.data[i + 1] = data.data[i + 2] = 255;
    }
  }

  return data;
}

function createByImage(img: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, img.width, img.height);

  return { canvas, ctx };
}
const convertImageElement = async (url: string): Promise<HTMLImageElement> =>
  await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    if (url !== undefined) {
      image.src = url;
    }
  });

export default {
  async convertThresholdImage(url: string): Promise<string> {
    const img = await convertImageElement(url);
    const { canvas, ctx } = createByImage(img);
    const imagedata = ctx.getImageData(0, 0, img.width, img.height);
    threshold(imagedata);
    ctx.putImageData(imagedata, 0, 0);
    return canvas.toDataURL();
  },
};
