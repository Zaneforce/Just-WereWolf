import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  players: Player[];
  revealIndex: number;
  onNext: () => void;
}

export function RevealPhase({ players, revealIndex, onNext }: Props) {
  const [revealed, setRevealed] = useState(false);

  if (revealIndex >= players.length) return null;

  const player = players[revealIndex];
  const roleDef = ROLE_DEFS[player.role];

  if (!revealed) {
    return (
      <View style={styles.container}>
        <View style={styles.mysteryCard}>
          <View style={styles.moonCircle}>
            <Text style={styles.questionMark}>?</Text>
          </View>
        </View>
        <Text style={shared.title}>Serahkan HP ke</Text>
        <Text style={styles.playerName}>{player.name}</Text>
        <GoldButton
          label="Lihat Role"
          onPress={() => setRevealed(true)}
          style={styles.btn}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.roleCard, { borderColor: roleDef.color }]}>
        <Text style={styles.roleEmoji}>{roleDef.emoji}</Text>
        <Text style={[styles.roleName, { color: roleDef.color }]}>
          {roleDef.name}
        </Text>
        <Text style={styles.roleDesc}>{roleDef.description}</Text>
      </View>
      <Text style={styles.playerNameSmall}>{player.name}</Text>
      <Text style={[shared.textDim, styles.teamText]}>
        Tim: {roleDef.team === 'serigala' ? 'Serigala' : 'Desa'}
      </Text>
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
    width: 180,
    height: 240,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  playerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.moon,
    marginTop: 8,
    marginBottom: 24,
  },
  playerNameSmall: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
  },
  roleCard: {
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
  teamText: {
    marginTop: 4,
    marginBottom: 24,
  },
  btn: {
    marginTop: 16,
    minWidth: 220,
  },
});
