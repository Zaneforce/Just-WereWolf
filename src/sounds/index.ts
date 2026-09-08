import { Platform } from 'react-native';

export type FeedbackType = 'tap' | 'success' | 'warning' | 'heavy' | 'select';

let Haptics: typeof import('expo-haptics') | null = null;

async function loadHaptics() {
  if (Haptics) return Haptics;
  try {
    Haptics = await import('expo-haptics');
    return Haptics;
  } catch {
    return null;
  }
}

export function feedback(type: FeedbackType = 'tap'): void {
  if (Platform.OS === 'web') return;
  loadHaptics().then((H) => {
    if (!H) return;
    try {
      switch (type) {
        case 'tap':
          H.impactAsync(H.ImpactFeedbackStyle.Light);
          break;
        case 'select':
          H.selectionAsync();
          break;
        case 'success':
          H.notificationAsync(H.NotificationFeedbackType.Success);
          break;
        case 'warning':
          H.notificationAsync(H.NotificationFeedbackType.Warning);
          break;
        case 'heavy':
          H.impactAsync(H.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch {
      // ignore
    }
  });
}
