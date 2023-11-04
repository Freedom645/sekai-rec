export const ComboState = {
  AP: 'AllPerfect',
  FC: 'FullCombo',
  NONE: 'None',
} as const;

export type ComboState = (typeof ComboState)[keyof typeof ComboState];

export const ComboStateList = [ComboState.AP, ComboState.FC, ComboState.NONE] as const;
