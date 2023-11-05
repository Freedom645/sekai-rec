import type { Rectangle as TesseractRect } from 'tesseract.js';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const convertTesseractRect = (rect: Rectangle): TesseractRect => {
  return { left: rect.x, top: rect.y, width: rect.w, height: rect.h };
};

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
  async convertThresholdImage(url: string, thresholdValue: number): Promise<string> {
    const img = await convertImageElement(url);
    const { canvas, ctx } = createByImage(img);
    const imagedata = ctx.getImageData(0, 0, img.width, img.height);
    threshold(imagedata, thresholdValue);
    ctx.putImageData(imagedata, 0, 0);
    return canvas.toDataURL();
  },
  async drawRectangles(url: string, positions: Rectangle[], size?: Size): Promise<string> {
    const img = await convertImageElement(url);
    const { canvas, ctx } = createByImage(img);

    if (size === undefined) {
      size = { w: canvas.width, h: canvas.height };
    }

    const rateX = canvas.width / size.w;
    const rateY = canvas.height / size.h;

    ctx.beginPath();
    positions.forEach((r) => ctx.rect(r.x * rateX, r.y * rateY, r.w * rateX, r.h * rateY));
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke();

    return canvas.toDataURL();
  },
};
