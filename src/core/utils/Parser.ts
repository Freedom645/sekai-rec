/**
 * 文字列を数値に変換する
 * @param value 変換対象の文字列
 * @param defaultValue 変換に失敗した場合の値
 * @returns 変換後の値
 */
export const parseInteger = (value: string, defaultValue = 0): number => {
  const parsed = Number.parseInt(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};
