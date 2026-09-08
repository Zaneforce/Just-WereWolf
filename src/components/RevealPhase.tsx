import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  players: Player[];
  revealIndex: number;
  onNext: () => void;
}

function MysteryCard({ onFlip }: { onFlip: () => void }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.mysteryCard}>
      <Animated.View
        style={[
          styles.moonCircle,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
            transform: [{
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            }],
          },
        ]}
      >
        <Text style={styles.questionMark}>?</Text>
      </Animated.View>
      <GoldButton label="Lihat Role" onPress={onFlip} style={{ marginTop: 24 }} />
    </View>
  );
}

export function RevealPhase({ players, revealIndex, onNext }: Props) {
  const [showRole, setShowRole] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  if (revealIndex >= players.length) return null;
  const player = players[revealIndex];
  const roleDef = ROLE_DEFS[player.role];

  const handleFlip = () => {
    feedback('heavy');
    setShowRole(true);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 10,
      bounciness: 10,
    }).start();
  };

  const handleNext = () => {
    setShowRole(false);
    onNext();
  };

  if (!showRole) {
    return (
      <View style={styles.container}>
        <FadeIn delay={0} slideFrom="none">
          <Text style={shared.title}>Serahkan HP ke</Text>
        </FadeIn>
        <FadeIn delay={100} slideFrom="none">
          <Text style={styles.playerName}>{player.name}</Text>
        </FadeIn>
        <FadeIn delay={200}>
          <MysteryCard onFlip={handleFlip} />
        </FadeIn>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.roleCard,
          { borderColor: roleDef.color, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.roleEmoji}>{roleDef.emoji}</Text>
        <Text style={[styles.roleName, { color: roleDef.color }]}>
          {roleDef.name}
        </Text>
        <Text style={styles.roleDesc}>{roleDef.description}</Text>
        <Text style={[shared.textDim, { marginTop: 8 }]}>
          Tim: {roleDef.team === 'serigala' ? 'Serigala' : 'Desa'}
        </Text>
      </Animated.View>
      <Text style={styles.playerNameSmall}>{player.name}</Text>
      <FadeIn delay={200}>
        <GoldButton
          label={
            revealIndex < players.length - 1
              ? 'Sembunyikan & Oper HP'
              : 'Selesai — Lanjut'
          }
          onPress={handleNext}
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
  mysteryCard: {
    width: 200,
    height: 280,
    marginVertical: 16,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.moon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.moon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 6,
  },
  questionMark: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.btnText,
  },
  roleCard: {
    width: 200,
    height: 280,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  roleName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  roleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.moon,
    marginTop: 8,
  },
  playerNameSmall: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  btn: {
    marginTop: 16,
    minWidth: 220,
  },
});
