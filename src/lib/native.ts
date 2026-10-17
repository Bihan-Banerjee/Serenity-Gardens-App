import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNative = Capacitor.isNativePlatform();

export const tap = () => {
  if (isNative) Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
};
