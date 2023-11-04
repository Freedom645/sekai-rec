import type { Size } from '@/core/Geometry';
import type { IAnalysisElement } from '@/domain/entity/AnalysisElement';

export class AnalysisSetting {
  public readonly name: string;
  public readonly imageSize: Size;
  public readonly elements: IAnalysisElement[];

  public constructor(args: { name: string; imageSize: Size; elements: IAnalysisElement[] }) {
    this.name = args.name;
    this.imageSize = args.imageSize;
    this.elements = args.elements;
  }
}
