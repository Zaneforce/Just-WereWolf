import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { Player, NightStep, NightResult, RoleId } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  players: Player[];
  round: number;
  nightStep: NightStep;
  nightResult: NightResult;
  hasRole: (role: RoleId) => boolean;
  lastGuardTarget: number | null;
  onSelectTarget: (playerId: number) => void;
  onAdvanceStep: () => void;
}

function SelectableItem({
  name,
  isSelected,
  onPress,
}: {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }),
      ]).start();
    }
  }, [isSelected]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.targetItem, isSelected && styles.targetSelected]}
        onPress={() => {
          feedback('select');
          onPress();
        }}
      >
        <Text style={[styles.targetText, isSelected && styles.targetTextSelected]}>
          {name}
        </Text>
        {isSelected && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function NightPhase({
  players,
  round,
  nightStep,
  nightResult,
  hasRole,
  lastGuardTarget,
  onSelectTarget,
  onAdvanceStep,
}: Props) {
  const alive = players.filter((p) => p.alive);

  const renderPlayerList = (
    exclude?: RoleId,
    selectedId?: number | null,
    excludeId?: number | null,
  ) => {
    let targets = alive;
    if (exclude) targets = targets.filter((p) => p.role !== exclude);
    if (excludeId !== undefined && excludeId !== null) {
      targets = targets.filter((p) => p.id !== excludeId);
    }
    return (
      <FlatList
        data={targets}
        keyExtractor={(p) => p.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <SelectableItem
            name={item.name}
            isSelected={selectedId === item.id}
            onPress={() => onSelectTarget(item.id)}
          />
        )}
      />
    );
  };

  const renderContent = () => {
    switch (nightStep) {
      case 'intro':
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <PulsingEmoji emoji="🌙" />
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.narration}>
                {`Malam ke-${round} tiba.\nSemua pemain, pejamkan mata.`}
              </Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton label="Lanjut" onPress={onAdvanceStep} style={styles.btn} />
            </FadeIn>
          </View>
        );

      case 'serigala':
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.serigala.color }]}>
                🐺 Serigala
              </Text>
              <Text style={styles.narration}>
                "Serigala, buka mata dan pilih mangsa kalian."
              </Text>
              <Text style={styles.instruction}>Pilih target:</Text>
              {renderPlayerList('serigala', nightResult.wolfTarget)}
              <GoldButton
                label="Konfirmasi"
                onPress={onAdvanceStep}
                disabled={nightResult.wolfTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );

      case 'peramal':
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.peramal.color }]}>
                🔮 Peramal
              </Text>
              <Text style={styles.narration}>
                "Peramal, buka mata. Pilih 1 pemain untuk diintip."
              </Text>
              {nightResult.seerResult ? (
                <FadeIn delay={0}>
                  <View style={[shared.card, styles.seerResult]}>
                    <Text style={styles.seerLabel}>Hasil intipan:</Text>
                    <Text
                      style={[
                        styles.seerRole,
                        { color: ROLE_DEFS[nightResult.seerResult].color },
                      ]}
                    >
                      {ROLE_DEFS[nightResult.seerResult].emoji}{' '}
                      {ROLE_DEFS[nightResult.seerResult].name}
                    </Text>
                    <Text style={shared.textDim}>
                      (Hanya Operator yang melihat ini)
                    </Text>
                  </View>
                </FadeIn>
              ) : (
                <>
                  <Text style={styles.instruction}>Pilih target:</Text>
                  {renderPlayerList('peramal', nightResult.seerTarget)}
                </>
              )}
              <GoldButton
                label={nightResult.seerResult ? 'Lanjut' : 'Intip'}
                onPress={onAdvanceStep}
                disabled={!nightResult.seerResult && nightResult.seerTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );

      case 'pelindung':
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.pelindung.color }]}>
                🛡️ Pelindung
              </Text>
              <Text style={styles.narration}>
                "Pelindung, buka mata. Pilih 1 pemain untuk dilindungi."
              </Text>
              <Text style={styles.instruction}>
                Pilih target:{lastGuardTarget !== null ? '\n(Tidak boleh sama dengan malam sebelumnya)' : ''}
              </Text>
              {renderPlayerList(undefined, nightResult.guardTarget, lastGuardTarget)}
              <GoldButton
                label="Konfirmasi"
                onPress={onAdvanceStep}
                disabled={nightResult.guardTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );

      case 'outro':
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <PulsingEmoji emoji="😴" />
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.narration}>
                "Semua tutup mata.{'\n'}Malam telah berakhir. Bersiap menyambut pagi."
              </Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton label="Lihat Hasil Malam" onPress={onAdvanceStep} style={styles.btn} />
            </FadeIn>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={shared.title}>Malam ke-{round}</Text>
      <OperatorPanel players={players} />
      {renderContent()}
    </ScrollView>
  );
}

function PulsingEmoji({ emoji }: { emoji: string }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.Text style={[styles.nightIcon, { transform: [{ scale }] }]}>
      {emoji}
    </Animated.Text>
  );
}

function OperatorPanel({ players }: { players: Player[] }) {
  const [expanded, setExpanded] = React.useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <View style={[shared.card, styles.operatorPanel]}>
      <TouchableOpacity
        onPress={() => {
          feedback('tap');
          setExpanded(!expanded);
        }}
      >
        <Text style={styles.operatorTitle}>
          {expanded ? '▼' : '▶'} Daftar Role (Operator)
        </Text>
      </TouchableOpacity>
      {expanded && (
        <FadeIn delay={0} duration={200}>
          <View style={styles.roleList}>
            {players.map((p) => {
              const def = ROLE_DEFS[p.role];
              return (
                <View key={p.id} style={styles.roleListItem}>
                  <Text
                    style={[
                      styles.roleListName,
                      !p.alive && styles.deadPlayer,
                    ]}
                  >
                    {p.alive ? '' : '💀 '}{p.name}
                  </Text>
                  <View style={[shared.badge, { backgroundColor: def.color }]}>
                    <Text style={shared.badgeText}>
                      {def.emoji} {def.name}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </FadeIn>
      )}
    </View>
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
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nightIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  narration: {
    fontSize: 18,
    color: colors.moon,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  stepContainer: {
    paddingVertical: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
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
    borderColor: colors.moon,
    backgroundColor: 'rgba(243,220,148,0.1)',
  },
  targetText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  targetTextSelected: {
    color: colors.moon,
    fontWeight: 'bold',
  },
  checkMark: {
    color: colors.moon,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btn: {
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 200,
  },
  seerResult: {
    alignItems: 'center',
    marginVertical: 12,
  },
  seerLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  seerRole: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  operatorPanel: {
    marginBottom: 8,
  },
  operatorTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  roleList: {
    marginTop: 8,
  },
  roleListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  roleListName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  deadPlayer: {
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
});
