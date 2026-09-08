import React, { useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors } from '../theme';
import { feedback } from '../sounds';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
  danger?: boolean;
}

export function GoldButton({ label, onPress, disabled, style, small, danger }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    feedback('tap');
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.btn,
          small && styles.btnSmall,
          danger && styles.dangerBtn,
          disabled && styles.disabled,
        ]}
      >
        <Text
          style={[
            styles.text,
            small && styles.textSmall,
            danger && styles.dangerText,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.btnGoldStart,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: colors.moon,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSmall: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    minHeight: 40,
    borderRadius: 10,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
  disabled: {
    opacity: 0.35,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.btnText,
  },
  textSmall: {
    fontSize: 14,
  },
  dangerText: {
    color: '#fff',
  },
});
