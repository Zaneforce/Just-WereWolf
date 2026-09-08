import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { GameMode } from '../types';
import { colors, shared } from '../theme';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  onSelect: (mode: GameMode) => void;
  onOpenSettings: () => void;
}

function ModeCard({
  emoji,
  title,
  description,
  onPress,
  delay,
}: {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
  delay: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <FadeIn delay={delay}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={styles.card}
          onPressIn={() => {
            Animated.spring(scale, {
              toValue: 0.96,
              useNativeDriver: true,
              speed: 50,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 30,
              bounciness: 10,
            }).start();
          }}
          onPress={() => {
            feedback('success');
            onPress();
          }}
        >
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </Pressable>
      </Animated.View>
    </FadeIn>
  );
}

export function ModeSelectPhase({ onSelect, onOpenSettings }: Props) {
  return (
    <View style={styles.container}>
      <FadeIn delay={0} slideFrom="none">
        <Text style={styles.appTitle}>🐺 Zane: Werewolf</Text>
      </FadeIn>
      <FadeIn delay={100} slideFrom="none">
        <Text style={shared.subtitle}>Pilih mode permainan</Text>
      </FadeIn>

      <View style={styles.cards}>
        <ModeCard
          emoji="🎙️"
          title="Dengan Operator"
          description="1 orang jadi moderator memegang HP, membaca skrip, dan mencatat aksi malam/siang."
          onPress={() => onSelect('operator')}
          delay={200}
        />
        <ModeCard
          emoji="📱"
          title="HP Jadi Operator"
          description="Tanpa moderator — HP membacakan narasi dengan suara, pemain oper HP secara bergantian."
          onPress={() => onSelect('auto')}
          delay={350}
        />
      </View>

      <FadeIn delay={500}>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => {
            feedback('tap');
            onOpenSettings();
          }}
        >
          <Text style={styles.settingsText}>⚙️ Pengaturan Suara</Text>
        </Pressable>
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
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.moon,
    textAlign: 'center',
    marginBottom: 8,
  },
  cards: {
    width: '100%',
    marginTop: 24,
    gap: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  settingsText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
