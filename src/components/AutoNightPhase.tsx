import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { Player, AutoNightStep, NightResult, RoleId } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';
import { speak, stop } from '../audio/narrator';

interface Props {
  players: Player[];
  round: number;
  autoNightStep: AutoNightStep;
  nightResult: NightResult;
  hasRole: (role: RoleId) => boolean;
  lastGuardTarget: number | null;
  onSelectTarget: (playerId: number) => void;
  onAdvanceAutoStep: () => void;
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
    <Animated.Text style={[styles.bigEmoji, { transform: [{ scale }] }]}>
      {emoji}
    </Animated.Text>
  );
}

export function AutoNightPhase({
  players,
  round,
  autoNightStep,
  nightResult,
  hasRole,
  lastGuardTarget,
  onSelectTarget,
  onAdvanceAutoStep,
}: Props) {
  const [spoken, setSpoken] = useState(false);
  const alive = players.filter((p) => p.alive);
  const wolves = players.filter((p) => p.role === 'serigala' && p.alive);
  const seers = players.filter((p) => p.role === 'peramal' && p.alive);
  const guards = players.filter((p) => p.role === 'pelindung' && p.alive);

  useEffect(() => {
    setSpoken(false);
  }, [autoNightStep]);

  const speakAndMark = async (text: string) => {
    if (!spoken) {
      setSpoken(true);
      await speak(text);
    }
  };

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
    switch (autoNightStep) {
      case 'intro': {
        const introText = `Malam ke-${round} tiba. Semua pemain, pejamkan mata.`;
        speakAndMark(introText);
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <PulsingEmoji emoji="🌙" />
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.narration}>{introText}</Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton label="Lanjut" onPress={onAdvanceAutoStep} style={styles.btn} />
            </FadeIn>
          </View>
        );
      }

      case 'passToWolf': {
        const wolfNames = wolves.map((w) => w.name).join(' & ');
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <Text style={styles.bigEmoji}>🐺</Text>
            </FadeIn>
            <FadeIn delay={100} slideFrom="none">
              <Text style={shared.title}>Giliran Serigala</Text>
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.passText}>
                Serahkan HP ke:{'\n'}
                <Text style={styles.passName}>{wolfNames}</Text>
              </Text>
            </FadeIn>
            <FadeIn delay={300} slideFrom="none">
              <Text style={styles.privacyNote}>
                Pemain lain JANGAN mengintip!
              </Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton
                label="Saya Serigala — Siap"
                onPress={() => {
                  feedback('heavy');
                  onAdvanceAutoStep();
                }}
                style={styles.btn}
              />
            </FadeIn>
          </View>
        );
      }

      case 'serigala': {
        const msg = 'Serigala, pilih mangsa kalian.';
        speakAndMark(msg);
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.serigala.color }]}>
                🐺 Serigala
              </Text>
              <Text style={styles.narration}>{msg}</Text>
              <Text style={styles.instruction}>Pilih target:</Text>
              {renderPlayerList('serigala', nightResult.wolfTarget)}
              <GoldButton
                label="Konfirmasi & Oper HP"
                onPress={() => {
                  stop();
                  onAdvanceAutoStep();
                }}
                disabled={nightResult.wolfTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );
      }

      case 'passToSeer': {
        const seerName = seers[0]?.name ?? '';
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <Text style={styles.bigEmoji}>🔮</Text>
            </FadeIn>
            <FadeIn delay={100} slideFrom="none">
              <Text style={shared.title}>Giliran Peramal</Text>
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.passText}>
                Serahkan HP ke:{'\n'}
                <Text style={styles.passName}>{seerName}</Text>
              </Text>
            </FadeIn>
            <FadeIn delay={300} slideFrom="none">
              <Text style={styles.privacyNote}>
                Pemain lain JANGAN mengintip!
              </Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton
                label="Saya Peramal — Siap"
                onPress={() => {
                  feedback('heavy');
                  onAdvanceAutoStep();
                }}
                style={styles.btn}
              />
            </FadeIn>
          </View>
        );
      }

      case 'peramal': {
        const msg = 'Peramal, pilih 1 pemain untuk diintip.';
        speakAndMark(msg);
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.peramal.color }]}>
                🔮 Peramal
              </Text>
              <Text style={styles.narration}>{msg}</Text>
              <Text style={styles.instruction}>Pilih target:</Text>
              {renderPlayerList('peramal', nightResult.seerTarget)}
              <GoldButton
                label="Intip"
                onPress={onAdvanceAutoStep}
                disabled={nightResult.seerTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );
      }

      case 'seerResult': {
        const targetPlayer = players.find((p) => p.id === nightResult.seerTarget);
        const resultRole = nightResult.seerResult;
        if (resultRole && targetPlayer) {
          const roleDef = ROLE_DEFS[resultRole];
          const msg = `${targetPlayer.name} adalah ${roleDef.name}.`;
          speakAndMark(msg);
          return (
            <FadeIn delay={0}>
              <View style={styles.centered}>
                <View style={[shared.card, styles.seerResult]}>
                  <Text style={styles.seerLabel}>Hasil intipan:</Text>
                  <Text style={styles.seerPlayerName}>{targetPlayer.name}</Text>
                  <Text style={[styles.seerRole, { color: roleDef.color }]}>
                    {roleDef.emoji} {roleDef.name}
                  </Text>
                </View>
                <GoldButton
                  label="Sudah, Sembunyikan & Oper HP"
                  onPress={() => {
                    stop();
                    onAdvanceAutoStep();
                  }}
                  style={styles.btn}
                />
              </View>
            </FadeIn>
          );
        }
        return null;
      }

      case 'passToGuard': {
        const guardName = guards[0]?.name ?? '';
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <Text style={styles.bigEmoji}>🛡️</Text>
            </FadeIn>
            <FadeIn delay={100} slideFrom="none">
              <Text style={shared.title}>Giliran Pelindung</Text>
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.passText}>
                Serahkan HP ke:{'\n'}
                <Text style={styles.passName}>{guardName}</Text>
              </Text>
            </FadeIn>
            <FadeIn delay={300} slideFrom="none">
              <Text style={styles.privacyNote}>
                Pemain lain JANGAN mengintip!
              </Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton
                label="Saya Pelindung — Siap"
                onPress={() => {
                  feedback('heavy');
                  onAdvanceAutoStep();
                }}
                style={styles.btn}
              />
            </FadeIn>
          </View>
        );
      }

      case 'pelindung': {
        const msg = 'Pelindung, pilih 1 pemain untuk dilindungi.';
        speakAndMark(msg);
        return (
          <FadeIn delay={0}>
            <View style={styles.stepContainer}>
              <Text style={[styles.stepTitle, { color: ROLE_DEFS.pelindung.color }]}>
                🛡️ Pelindung
              </Text>
              <Text style={styles.narration}>{msg}</Text>
              <Text style={styles.instruction}>
                Pilih target:{lastGuardTarget !== null ? '\n(Tidak boleh sama dengan malam sebelumnya)' : ''}
              </Text>
              {renderPlayerList(undefined, nightResult.guardTarget, lastGuardTarget)}
              <GoldButton
                label="Konfirmasi & Oper HP"
                onPress={() => {
                  stop();
                  onAdvanceAutoStep();
                }}
                disabled={nightResult.guardTarget === null}
                style={styles.btn}
              />
            </View>
          </FadeIn>
        );
      }

      case 'outro': {
        const msg = 'Semua tutup mata. Malam telah berakhir. Bersiap menyambut pagi.';
        speakAndMark(msg);
        return (
          <View style={styles.centered}>
            <FadeIn delay={0}>
              <PulsingEmoji emoji="😴" />
            </FadeIn>
            <FadeIn delay={200} slideFrom="none">
              <Text style={styles.narration}>{msg}</Text>
            </FadeIn>
            <FadeIn delay={400}>
              <GoldButton label="Lihat Hasil Malam" onPress={onAdvanceAutoStep} style={styles.btn} />
            </FadeIn>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={shared.title}>Malam ke-{round}</Text>
      {renderContent()}
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
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bigEmoji: {
    fontSize: 60,
    marginBottom: 16,
    textAlign: 'center',
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
  passText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 28,
  },
  passName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.moon,
  },
  privacyNote: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
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
    minWidth: 220,
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
  seerPlayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  seerRole: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
