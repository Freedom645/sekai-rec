import { Rectangle, type Size } from '@/core/Geometry';

/** 画像データ */
export class ImageCanvas implements Size {
  /** 幅 */
  public readonly w: number;
  /** 高さ */
  public readonly h: number;
  /** Canvas要素 */
  private readonly canvas: HTMLCanvasElement;

  constructor(size: Size) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size.w;
    this.canvas.height = size.h;
    this.w = size.w;
    this.h = size.h;
  }

  /**
   * 画像データを書き込む
   * @param src 書き込むデータ
   * @param srcRect 書き込むデータの範囲
   * @param distRect 書き込み先の範囲
   * @returns 自身のインスタンス
   */
  public drawImage(
    src: HTMLImageElement | HTMLCanvasElement | ImageCanvas,
    srcRect?: Rectangle,
    distRect?: Rectangle
  ): ImageCanvas {
    const ctx = this.canvas.getContext('2d')!;

    if (src instanceof ImageCanvas) {
      srcRect = srcRect ?? new Rectangle({ x: 0, y: 0, w: src.w, h: src.h });
      src = src.canvas;
    } else if (src instanceof HTMLCanvasElement || src instanceof HTMLImageElement) {
      srcRect = srcRect ?? new Rectangle({ x: 0, y: 0, w: src.width, h: src.height });
    } else {
      throw new Error(`this src type is not implemented. ${typeof src}`);
    }

    if (distRect === undefined) {
      ctx.drawImage(src, srcRect.x, srcRect.y, srcRect.w, srcRect.h);
    } else {
      ctx.drawImage(src, srcRect.x, srcRect.y, srcRect.w, srcRect.h, distRect.x, distRect.y, distRect.w, distRect.h);
    }
    return this;
  }

  /**
   * 画像データを切り出して新しい画像データを生成する
   * @param rect 切り出し範囲
   * @returns 切り出した新たな画像データ
   */
  public cropNew(rect: Rectangle): ImageCanvas {
    const dist = new ImageCanvas(rect).drawImage(
      this.canvas,
      rect,
      new Rectangle({ x: 0, y: 0, w: rect.w, h: rect.h })
    );
    return dist;
  }

  public drawRectangle(r: Rectangle, options?: { strokeStyle?: string; lineWidth?: number }): ImageCanvas {
    const ctx = this.canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = options?.strokeStyle ?? 'red';
    ctx.lineWidth = options?.lineWidth ?? 3;
    ctx.stroke();

    return this;
  }

  /**
   * 二値化処理をして新しい画像データを生成する
   * @param threshold 閾値
   * @param range 範囲
   * @returns
   */
  public binarizeNew(threshold: number, range?: Rectangle): ImageCanvas {
    if (range === undefined) {
      range = new Rectangle({ x: 0, y: 0, w: this.w, h: this.h });
    }
    const dist = this.cropNew(range);

    const ctx = dist.canvas.getContext('2d')!;
    const imagedata = ctx.getImageData(0, 0, range.w, range.h);
    const res = this.threshold(imagedata, threshold);
    ctx.putImageData(res, 0, 0);

    return dist;
  }

  private threshold(data: ImageData, threshold: number): ImageData {
    //輝度計算用の係数
    const lum = [0.298912, 0.586611, 0.114478];

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

  public toDataURL(): string {
    return this.canvas.toDataURL();
  }

  /**
   * 画像データを読み込む
   * @param url 画像ソースURL
   * @returns 画像データ
   */
  public static async loadUrl(url: string): Promise<ImageCanvas> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = document.createElement('img');
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      if (url !== undefined) {
        image.src = url;
      }
    });

    return new ImageCanvas({ w: image.width, h: image.height }).drawImage(image);
  }
}