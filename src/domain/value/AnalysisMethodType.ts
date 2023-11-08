export const AnalysisMethodType = {
  OCR_STRING: 'ocrString',
  OCR_NUMBER: 'ocrNumber',
  P_HASH: 'pHash',
  C_CLASS: 'colorClassification',
} as const;

export type AnalysisMethodType = (typeof AnalysisMethodType)[keyof typeof AnalysisMethodType];

export const AnalysisMethodTypeList = [
  AnalysisMethodType.OCR_STRING,
  AnalysisMethodType.OCR_NUMBER,
  AnalysisMethodType.P_HASH,
  AnalysisMethodType.C_CLASS,
] as const;
