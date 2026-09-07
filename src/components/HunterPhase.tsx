import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  hunterName: string;
  players: Player[];
  onSelect: (playerId: number) => void;
}

export function HunterPhase({ hunterName, players, onSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const alive = players.filter((p) => p.alive);

  return (
    <View style={styles.container}>
      <Text style={[styles.icon]}>🏹</Text>
      <Text style={shared.title}>Pemburu Terbunuh!</Text>
      <Text style={shared.subtitle}>
        {hunterName} adalah Pemburu dan berhak menarik 1 pemain untuk ikut mati.
      </Text>

      <FlatList
        data={alive}
        keyExtractor={(p) => p.id.toString()}
        scrollEnabled={false}
        style={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              style={[styles.targetItem, isSelected && styles.targetSelected]}
              onPress={() => setSelected(item.id)}
            >
              <Text style={[styles.targetText, isSelected && styles.targetTextSelected]}>
                {item.name}
              </Text>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <GoldButton
        label="Tembak!"
        onPress={() => selected !== null && onSelect(selected)}
        disabled={selected === null}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: 12,
  },
  list: {
    width: '100%',
    marginTop: 12,
  },
  targetItem: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetSelected: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(185,28,60,0.1)',
  },
  targetText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  targetTextSelected: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  checkMark: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btn: {
    marginTop: 20,
    minWidth: 200,
    backgroundColor: colors.danger,
  },
});
