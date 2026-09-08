import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideFrom?: 'bottom' | 'left' | 'right' | 'none';
  slideDistance?: number;
  style?: ViewStyle;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 400,
  slideFrom = 'bottom',
  slideDistance = 20,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(slideFrom === 'none' ? 0 : slideDistance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const transform =
    slideFrom === 'none'
      ? []
      : slideFrom === 'bottom'
        ? [{ translateY: translate }]
        : slideFrom === 'left'
          ? [{ translateX: Animated.multiply(translate, -1) }]
          : [{ translateX: translate }];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
}
