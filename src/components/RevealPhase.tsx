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

function FlipCard({ player, onReveal }: { player: Player; onReveal: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const roleDef = ROLE_DEFS[player.role];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleFlip = () => {
    if (flipped) return;
    feedback('heavy');
    setFlipped(true);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start(() => {
      onReveal();
    });
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const scaleCard = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ perspective: 800 }, { rotateY }, { scale: scaleCard }] },
      ]}
    >
      <Animated.View
        style={[styles.mysteryCard, { opacity: frontOpacity }]}
      >
        <Animated.View
          style={[
            styles.moonCircle,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.questionMark}>?</Text>
        </Animated.View>
        <GoldButton label="Lihat Role" onPress={handleFlip} style={{ marginTop: 24 }} />
      </Animated.View>

      <Animated.View
        style={[
          styles.roleCard,
          { borderColor: roleDef.color, opacity: backOpacity, transform: [{ rotateY: '180deg' }] },
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
    </Animated.View>
  );
}

export function RevealPhase({ players, revealIndex, onNext }: Props) {
  const [revealed, setRevealed] = useState(false);

  if (revealIndex >= players.length) return null;
  const player = players[revealIndex];

  if (!revealed) {
    return (
      <View style={styles.container}>
        <FadeIn delay={0} slideFrom="none">
          <Text style={shared.title}>Serahkan HP ke</Text>
        </FadeIn>
        <FadeIn delay={100} slideFrom="none">
          <Text style={styles.playerName}>{player.name}</Text>
        </FadeIn>
        <FadeIn delay={200}>
          <FlipCard player={player} onReveal={() => setRevealed(true)} />
        </FadeIn>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FadeIn delay={0}>
        <View style={[styles.revealedCard, { borderColor: ROLE_DEFS[player.role].color }]}>
          <Text style={styles.roleEmoji}>{ROLE_DEFS[player.role].emoji}</Text>
          <Text style={[styles.roleName, { color: ROLE_DEFS[player.role].color }]}>
            {ROLE_DEFS[player.role].name}
          </Text>
          <Text style={styles.roleDesc}>{ROLE_DEFS[player.role].description}</Text>
        </View>
      </FadeIn>
      <Text style={styles.playerNameSmall}>{player.name}</Text>
      <FadeIn delay={200}>
        <GoldButton
          label={
            revealIndex < players.length - 1
              ? 'Sembunyikan & Oper HP'
              : 'Selesai — Lanjut'
          }
          onPress={() => {
            setRevealed(false);
            onNext();
          }}
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
  cardWrapper: {
    width: 200,
    height: 280,
    marginVertical: 16,
  },
  mysteryCard: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
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
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  revealedCard: {
    width: 200,
    height: 260,
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
