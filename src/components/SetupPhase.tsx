import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  players: string[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
  onNext: () => void;
}

export function SetupPhase({ players, onAddPlayer, onRemovePlayer, onNext }: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onAddPlayer(trimmed);
      setName('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={shared.title}>Daftar Pemain</Text>
      <Text style={shared.subtitle}>Minimal 4 pemain untuk memulai</Text>

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

      <View style={[shared.card, styles.listCard]}>
        <Text style={styles.countText}>
          {players.length} pemain terdaftar
        </Text>
        <FlatList
          data={players}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={shared.playerItem}>
              <Text style={styles.playerName}>
                {index + 1}. {item}
              </Text>
              <TouchableOpacity
                onPress={() => onRemovePlayer(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeBtn}>Hapus</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[shared.textDim, styles.emptyText]}>
              Belum ada pemain. Tambahkan di atas.
            </Text>
          }
        />
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
    padding: 20,
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
    padding: 0,
    overflow: 'hidden',
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
