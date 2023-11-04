export const ComboState = {
  AP: 'ap',
  FC: 'fc',
  NONE: 'none',
} as const;

export type ComboState = (typeof ComboState)[keyof typeof ComboState];

export const ComboStateList = [ComboState.AP, ComboState.FC, ComboState.NONE] as const;
