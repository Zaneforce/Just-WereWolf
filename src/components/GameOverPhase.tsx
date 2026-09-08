import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Easing } from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  winner: 'serigala' | 'desa';
  players: Player[];
  onPlayAgain: () => void;
}

export function GameOverPhase({ winner, players, onPlayAgain }: Props) {
  const isWolf = winner === 'serigala';
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    feedback('success');
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 12,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.emoji,
          {
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          },
        ]}
      >
        {isWolf ? '🐺' : '🏘️'}
      </Animated.Text>
      <FadeIn delay={400} slideFrom="none">
        <Text style={shared.title}>
          {isWolf ? 'Serigala Menang!' : 'Desa Menang!'}
        </Text>
      </FadeIn>
      <FadeIn delay={600} slideFrom="none">
        <Text style={shared.subtitle}>
          {isWolf
            ? 'Serigala berhasil menguasai desa.'
            : 'Semua Serigala berhasil dieliminasi!'}
        </Text>
      </FadeIn>

      <FadeIn delay={800} style={{ width: '100%' }}>
        <View style={[shared.card, styles.listCard]}>
          <Text style={styles.listTitle}>Daftar Pemain & Role</Text>
          <FlatList
            data={players}
            keyExtractor={(p) => p.id.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => {
              const def = ROLE_DEFS[item.role];
              return (
                <FadeIn delay={900 + index * 80}>
                  <View style={styles.playerRow}>
                    <Text
                      style={[
                        styles.playerName,
                        !item.alive && styles.deadName,
                      ]}
                    >
                      {!item.alive ? '💀 ' : '✅ '}{item.name}
                    </Text>
                    <View style={[shared.badge, { backgroundColor: def.color }]}>
                      <Text style={shared.badgeText}>
                        {def.emoji} {def.name}
                      </Text>
                    </View>
                  </View>
                </FadeIn>
              );
            }}
          />
        </View>
      </FadeIn>

      <FadeIn delay={1200}>
        <GoldButton
          label="Main Lagi"
          onPress={onPlayAgain}
          style={styles.btn}
        />
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  listCard: {
    width: '100%',
    marginVertical: 16,
  },
  listTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 16,
    flex: 1,
  },
  deadName: {
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
  btn: {
    marginTop: 8,
    minWidth: 200,
  },
});
