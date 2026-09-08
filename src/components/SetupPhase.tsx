import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  players: string[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
  onNext: () => void;
}

function AnimatedListItem({
  name,
  index,
  onRemove,
}: {
  name: string;
  index: number;
  onRemove: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        shared.playerItem,
        {
          opacity: opacityAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.playerName}>
        {index + 1}. {name}
      </Text>
      <TouchableOpacity
        onPress={() => {
          feedback('warning');
          onRemove();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeBtn}>Hapus</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function SetupPhase({ players, onAddPlayer, onRemovePlayer, onNext }: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      feedback('success');
      onAddPlayer(trimmed);
      setName('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FadeIn delay={0} slideFrom="none">
        <Text style={shared.title}>Daftar Pemain</Text>
      </FadeIn>
      <FadeIn delay={100} slideFrom="none">
        <Text style={shared.subtitle}>Minimal 4 pemain untuk memulai</Text>
      </FadeIn>

      <FadeIn delay={200}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nama pemain..."
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <GoldButton label="Tambah" onPress={handleAdd} small disabled={name.trim().length === 0} />
        </View>
      </FadeIn>

      <View style={styles.listCard}>
        <Text style={styles.countText}>
          {players.length} pemain terdaftar
        </Text>
        <ScrollView style={styles.scrollArea}>
          {players.length === 0 ? (
            <Text style={[shared.textDim, styles.emptyText]}>
              Belum ada pemain. Tambahkan di atas.
            </Text>
          ) : (
            players.map((item, index) => (
              <AnimatedListItem
                key={`${item}-${index}`}
                name={item}
                index={index}
                onRemove={() => onRemovePlayer(index)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <GoldButton
        label="Lanjut — Atur Role"
        onPress={onNext}
        disabled={players.length < 4}
        style={styles.nextBtn}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  scrollArea: {
    flex: 1,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    paddingBottom: 4,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  removeBtn: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
  },
  nextBtn: {
    marginTop: 12,
    marginBottom: 20,
  },
});
