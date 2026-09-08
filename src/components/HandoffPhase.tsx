import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';

interface Props {
  onNext: () => void;
}

export function HandoffPhase({ onNext }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <FadeIn delay={0}>
        <Animated.Text
          style={[styles.emoji, { transform: [{ translateY: bounceAnim }] }]}
        >
          📱
        </Animated.Text>
      </FadeIn>
      <FadeIn delay={200} slideFrom="none">
        <Text style={shared.title}>Serahkan HP ke Operator</Text>
      </FadeIn>
      <FadeIn delay={400} slideFrom="none">
        <Text style={[shared.subtitle, styles.desc]}>
          Semua pemain sudah melihat role-nya.{'\n'}
          Berikan HP sepenuhnya kepada Operator/Moderator untuk memulai malam pertama.
        </Text>
      </FadeIn>
      <FadeIn delay={600}>
        <GoldButton
          label="Saya Operator — Mulai!"
          onPress={onNext}
          style={styles.btn}
        />
      </FadeIn>
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
