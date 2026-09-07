import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export function GoldButton({ label, onPress, disabled, style, small }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.btn,
        small && styles.btnSmall,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, small && styles.textSmall]}>{label}</Text>
    </TouchableOpacity>
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
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.btnText,
  },
  textSmall: {
    fontSize: 14,
  },
});
