import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Animated } from 'react-native';
import { Player } from '../types';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  hunterName: string;
  players: Player[];
  onSelect: (playerId: number) => void;
}

export function HunterPhase({ hunterName, players, onSelect }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const alive = players.filter((p) => p.alive);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    feedback('heavy');
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <FadeIn delay={0}>
          <Text style={styles.icon}>🏹</Text>
        </FadeIn>
      </Animated.View>
      <FadeIn delay={200} slideFrom="none">
        <Text style={shared.title}>Pemburu Terbunuh!</Text>
      </FadeIn>
      <FadeIn delay={400} slideFrom="none">
        <Text style={shared.subtitle}>
          {hunterName} adalah Pemburu dan berhak menarik 1 pemain untuk ikut mati.
        </Text>
      </FadeIn>

      <FadeIn delay={600} style={{ width: '100%' }}>
        <FlatList
          data={alive}
          keyExtractor={(p) => p.id.toString()}
          scrollEnabled={false}
          style={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            return (
              <Pressable
                style={[styles.targetItem, isSelected && styles.targetSelected]}
                onPress={() => {
                  feedback('select');
                  setSelected(item.id);
                }}
              >
                <Text style={[styles.targetText, isSelected && styles.targetTextSelected]}>
                  {item.name}
                </Text>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            );
          }}
        />
      </FadeIn>

      <FadeIn delay={800}>
        <GoldButton
          label="Tembak!"
          onPress={() => selected !== null && onSelect(selected)}
          disabled={selected === null}
          danger
          style={styles.btn}
        />
      </FadeIn>
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
    textAlign: 'center',
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
  },
});
