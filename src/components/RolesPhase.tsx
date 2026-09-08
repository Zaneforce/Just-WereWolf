import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { RoleConfig, RoleId } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  playerCount: number;
  config: RoleConfig;
  onUpdateConfig: (config: RoleConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONFIGURABLE_ROLES: (keyof RoleConfig)[] = ['serigala', 'peramal', 'pelindung', 'pemburu'];

function CounterButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.counterBtn, disabled && styles.counterDisabled]}
        disabled={disabled}
        onPressIn={() => {
          Animated.spring(scale, {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 50,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 10,
          }).start();
        }}
        onPress={() => {
          feedback('select');
          onPress();
        }}
      >
        <Text style={styles.counterBtnText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function RolesPhase({ playerCount, config, onUpdateConfig, onNext, onBack }: Props) {
  const specialCount = config.serigala + config.peramal + config.pelindung + config.pemburu;
  const wargaCount = playerCount - specialCount;

  const canIncrease = (_role: keyof RoleConfig) => {
    const newWarga = playerCount - (specialCount + 1);
    return newWarga >= 1;
  };

  const canDecrease = (role: keyof RoleConfig) => {
    if (role === 'serigala') return config.serigala > 1;
    return config[role] > 0;
  };

  const adjust = (role: keyof RoleConfig, delta: number) => {
    onUpdateConfig({ ...config, [role]: config[role] + delta });
  };

  const isValid = config.serigala >= 1 && wargaCount >= 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <FadeIn delay={0} slideFrom="none">
        <Text style={shared.title}>Atur Role</Text>
      </FadeIn>
      <FadeIn delay={100} slideFrom="none">
        <Text style={shared.subtitle}>
          {playerCount} pemain — sisa slot Warga: {wargaCount}
        </Text>
      </FadeIn>

      {CONFIGURABLE_ROLES.map((roleKey, i) => {
        const def = ROLE_DEFS[roleKey as RoleId];
        return (
          <FadeIn key={roleKey} delay={200 + i * 100}>
            <View style={[shared.card, styles.roleCard]}>
              <View style={styles.roleHeader}>
                <Text style={styles.roleEmoji}>{def.emoji}</Text>
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleName, { color: def.color }]}>{def.name}</Text>
                  <Text style={shared.textDim}>{def.description}</Text>
                </View>
              </View>
              <View style={styles.counter}>
                <CounterButton
                  label="−"
                  onPress={() => adjust(roleKey, -1)}
                  disabled={!canDecrease(roleKey)}
                />
                <Text style={styles.counterValue}>{config[roleKey]}</Text>
                <CounterButton
                  label="+"
                  onPress={() => adjust(roleKey, 1)}
                  disabled={!canIncrease(roleKey)}
                />
              </View>
            </View>
          </FadeIn>
        );
      })}

      <FadeIn delay={600}>
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
      </FadeIn>

      {!isValid && (
        <Text style={styles.errorText}>
          Harus ada minimal 1 Serigala dan 1 Warga
        </Text>
      )}

      <FadeIn delay={700}>
        <View style={styles.btnRow}>
          <Pressable
            onPress={() => {
              feedback('tap');
              onBack();
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>Kembali</Text>
          </Pressable>
          <GoldButton
            label="Mulai Permainan"
            onPress={onNext}
            disabled={!isValid}
            style={styles.startBtn}
          />
        </View>
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
