import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RoleConfig, RoleId } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  playerCount: number;
  config: RoleConfig;
  onUpdateConfig: (config: RoleConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONFIGURABLE_ROLES: (keyof RoleConfig)[] = ['serigala', 'peramal', 'pelindung', 'pemburu'];

export function RolesPhase({ playerCount, config, onUpdateConfig, onNext, onBack }: Props) {
  const specialCount = config.serigala + config.peramal + config.pelindung + config.pemburu;
  const wargaCount = playerCount - specialCount;

  const canIncrease = (role: keyof RoleConfig) => {
    const newSpecial = specialCount + 1;
    const newWarga = playerCount - newSpecial;
    if (newWarga < 1) return false;
    if (role === 'serigala') return true;
    return true;
  };

  const canDecrease = (role: keyof RoleConfig) => {
    if (role === 'serigala') return config.serigala > 1;
    return config[role] > 0;
  };

  const adjust = (role: keyof RoleConfig, delta: number) => {
    const newConfig = { ...config, [role]: config[role] + delta };
    onUpdateConfig(newConfig);
  };

  const isValid = config.serigala >= 1 && wargaCount >= 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={shared.title}>Atur Role</Text>
      <Text style={shared.subtitle}>
        {playerCount} pemain — sisa slot Warga: {wargaCount}
      </Text>

      {CONFIGURABLE_ROLES.map((roleKey) => {
        const def = ROLE_DEFS[roleKey as RoleId];
        return (
          <View key={roleKey} style={[shared.card, styles.roleCard]}>
            <View style={styles.roleHeader}>
              <Text style={styles.roleEmoji}>{def.emoji}</Text>
              <View style={styles.roleInfo}>
                <Text style={[styles.roleName, { color: def.color }]}>{def.name}</Text>
                <Text style={shared.textDim}>{def.description}</Text>
              </View>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity
                style={[styles.counterBtn, !canDecrease(roleKey) && styles.counterDisabled]}
                disabled={!canDecrease(roleKey)}
                onPress={() => adjust(roleKey, -1)}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{config[roleKey]}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, !canIncrease(roleKey) && styles.counterDisabled]}
                disabled={!canIncrease(roleKey)}
                onPress={() => adjust(roleKey, 1)}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={[shared.card, styles.roleCard]}>
        <View style={styles.roleHeader}>
          <Text style={styles.roleEmoji}>{ROLE_DEFS.warga.emoji}</Text>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleName, { color: ROLE_DEFS.warga.color }]}>Warga</Text>
            <Text style={shared.textDim}>Otomatis mengisi sisa slot</Text>
          </View>
        </View>
        <Text style={styles.counterValue}>{wargaCount}</Text>
      </View>

      {!isValid && (
        <Text style={styles.errorText}>
          Harus ada minimal 1 Serigala dan 1 Warga
        </Text>
      )}

      <View style={styles.btnRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
        <GoldButton
          label="Mulai Permainan"
          onPress={onNext}
          disabled={!isValid}
          style={styles.startBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterDisabled: {
    opacity: 0.3,
  },
  counterBtnText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  counterValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  startBtn: {
    flex: 1,
  },
});
