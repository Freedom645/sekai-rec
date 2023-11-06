import type { Rectangle as TesseractRect } from 'tesseract.js';

/** 座標 */
export interface Point {
  x: number;
  y: number;
}

/** サイズ */
export interface Size {
  w: number;
  h: number;
}

/** 矩形データ */
export class Rectangle implements Point, Size {
  public readonly x: number;
  public readonly y: number;
  public readonly w: number;
  public readonly h: number;

  public constructor(args: { x: number; y: number; w: number; h: number }) {
    this.x = args.x;
    this.y = args.y;
    this.w = args.w;
    this.h = args.h;
  }

  /**
   * tesseract向けのデータに変換する
   * @returns tesseract.Rectangleデータ
   */
  public convertTesseractRect(): TesseractRect {
    return { left: this.x, top: this.y, width: this.w, height: this.h };
  }

  /**
   * 指定した比率で変換した矩形データを取得する
   * @param multiplier 乗数サイズ
   * @param divisor 除数サイズ
   * @returns スケール後の新しいインスタンス
   */
  public scale(multiplier: Size, divisor: Size = { w: 1, h: 1 }): Rectangle {
    return new Rectangle({
      x: (this.x * multiplier.w) / (divisor.w ?? 1),
      y: (this.y * multiplier.h) / (divisor.h ?? 1),
      w: (this.w * multiplier.w) / (divisor.w ?? 1),
      h: (this.h * multiplier.h) / (divisor.h ?? 1),
    });
  }

  /**
   * 矩形データをクローンする
   * @returns クローンした矩形データのインスタンス
   */
  public clone(): Rectangle {
    return new Rectangle(this);
  }

  /**
   * 空の矩形データを作成する
   * @returns 空の矩形データ
   */
  public static emptyRectangle(): Rectangle {
    return new Rectangle({ x: 0, y: 0, w: 1, h: 1 });
  }

  /**
   * 2点から矩形データを作成する
   * @param p1 1つ目の頂点
   * @param p2 2つ目の頂点
   * @returns 矩形データ
   */
  public static fromPoints(p1: Point, p2: Point): Rectangle {
    const x = Math.min(p1.x, p2.x);
    const y = Math.min(p1.y, p2.y);
    const w = Math.abs(p1.x - p2.x);
    const h = Math.abs(p1.y - p2.y);
    return new Rectangle({ x, y, w, h });
  }
}
