import type { Rectangle } from '@/core/Geometry';
import type { AnalysisElementType } from '@/domain/value/AnalysisElementType';
import type { AnalysisMethodType } from '@/domain/value/AnalysisMethodType';

export interface IAnalysisElement {
  /**
   * 解析対象の要素を返す
   * @returns 解析要素
   */
  analysisElementType: () => AnalysisElementType;
  /**
   * 解析範囲を返す
   * @returns 解析範囲
   */
  analysisRange(): Rectangle;
  /**
   * 解析方法を返す
   * @returns 解析方法
   */
  analysisMethod(): AnalysisMethodType;
  /**
   * 二値化の閾値を返す
   * @returns 閾値。二値化しない場合はundefine
   */
  binarizeValue(): number | undefined;
}
