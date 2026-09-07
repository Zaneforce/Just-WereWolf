import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  winner: 'serigala' | 'desa';
  players: Player[];
  onPlayAgain: () => void;
}

export function GameOverPhase({ winner, players, onPlayAgain }: Props) {
  const isWolf = winner === 'serigala';

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isWolf ? '🐺' : '🏘️'}</Text>
      <Text style={shared.title}>
        {isWolf ? 'Serigala Menang!' : 'Desa Menang!'}
      </Text>
      <Text style={shared.subtitle}>
        {isWolf
          ? 'Serigala berhasil menguasai desa.'
          : 'Semua Serigala berhasil dieliminasi!'}
      </Text>

      <View style={[shared.card, styles.listCard]}>
        <Text style={styles.listTitle}>Daftar Pemain & Role</Text>
        <FlatList
          data={players}
          keyExtractor={(p) => p.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const def = ROLE_DEFS[item.role];
            return (
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
            );
          }}
        />
      </View>

      <GoldButton
        label="Main Lagi"
        onPress={onPlayAgain}
        style={styles.btn}
      />
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
