import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type FeedbackType = 'tap' | 'success' | 'warning' | 'heavy' | 'select';

export function feedback(type: FeedbackType = 'tap'): void {
  if (Platform.OS === 'web') return;
  try {
    switch (type) {
      case 'tap':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'select':
        Haptics.selectionAsync();
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  } catch {
    // haptics not available
  }
}
