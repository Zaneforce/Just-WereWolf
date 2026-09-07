import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  onNext: () => void;
}

export function HandoffPhase({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📱</Text>
      <Text style={shared.title}>Serahkan HP ke Operator</Text>
      <Text style={[shared.subtitle, styles.desc]}>
        Semua pemain sudah melihat role-nya.{'\n'}
        Berikan HP sepenuhnya kepada Operator/Moderator untuk memulai malam pertama.
      </Text>
      <GoldButton
        label="Saya Operator — Mulai!"
        onPress={onNext}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  desc: {
    marginHorizontal: 16,
    lineHeight: 24,
  },
  btn: {
    marginTop: 28,
    minWidth: 240,
  },
});
