import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import { Player, AutoDayStep } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';
import { speak, stop } from '../audio/narrator';

interface Props {
  players: Player[];
  round: number;
  killedName: string | null;
  killedRole: string | null;
  autoDayStep: AutoDayStep;
  autoVoterIndex: number;
  autoVotes: Record<number, number | null>;
  onAdvanceAutoDayStep: () => void;
  onAutoVote: (voterId: number, targetId: number | null) => void;
}

function TimerDisplay({ timer }: { timer: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isLow = timer <= 10 && timer > 0;
  useEffect(() => {
    if (isLow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLow]);
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;
  return (
    <Animated.Text
      style={[
        styles.timerText,
        isLow && { color: colors.danger },
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </Animated.Text>
  );
}

export function AutoDayPhase({
  players,
  round,
  killedName,
  killedRole,
  autoDayStep,
  autoVoterIndex,
  autoVotes,
  onAdvanceAutoDayStep,
  onAutoVote,
}: Props) {
  const [timer, setTimer] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [voteNone, setVoteNone] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const alive = players.filter((p) => p.alive);

  useEffect(() => {
    setSpoken(false);
    setSelectedVote(null);
    setVoteNone(false);
  }, [autoDayStep, autoVoterIndex]);

  useEffect(() => {
    if (timerRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            feedback('warning');
            speak('Waktu diskusi habis.');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timer]);

  const speakOnce = async (text: string) => {
    if (!spoken) {
      setSpoken(true);
      await speak(text);
    }
  };

  switch (autoDayStep) {
    case 'announcement': {
      const msg = killedName
        ? `Pagi hari. Korban semalam adalah ${killedName}. Dia adalah ${ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.name}.`
        : 'Pagi hari. Tidak ada korban semalam. Pelindung berhasil menyelamatkan target.';
      speakOnce(msg);

      return (
        <View style={styles.centered}>
          <FadeIn delay={0}>
            <Text style={styles.sunIcon}>☀️</Text>
          </FadeIn>
          <FadeIn delay={200} slideFrom="none">
            <Text style={shared.title}>Pagi Hari — Ronde {round}</Text>
          </FadeIn>
          {killedName ? (
            <FadeIn delay={400}>
              <View style={[shared.card, styles.deathCard]}>
                <Text style={styles.deathTitle}>💀 Korban Semalam</Text>
                <Text style={styles.deathName}>{killedName}</Text>
                <Text style={[styles.deathRole, { color: ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.color }]}>
                  {ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.emoji}{' '}
                  {ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.name}
                </Text>
              </View>
            </FadeIn>
          ) : (
            <FadeIn delay={400}>
              <View style={[shared.card, styles.deathCard]}>
                <Text style={styles.safeTitle}>🎉 Tidak Ada Korban!</Text>
                <Text style={shared.textDim}>
                  Pelindung berhasil menyelamatkan target semalam.
                </Text>
              </View>
            </FadeIn>
          )}
          <FadeIn delay={600}>
            <GoldButton
              label="Mulai Diskusi"
              onPress={() => {
                stop();
                speak('Waktu diskusi dimulai.');
                onAdvanceAutoDayStep();
              }}
              style={styles.btn}
            />
          </FadeIn>
        </View>
      );
    }

    case 'discussion':
      return (
        <View style={styles.centered}>
          <FadeIn delay={0} slideFrom="none">
            <Text style={shared.title}>Waktu Diskusi</Text>
          </FadeIn>
          <FadeIn delay={200}>
            <View style={[shared.card, styles.timerCard]}>
              <TimerDisplay timer={timer} />
              <View style={styles.timerBtnRow}>
                <TouchableOpacity
                  style={styles.timerBtn}
                  onPress={() => {
                    feedback('tap');
                    setTimerRunning(!timerRunning);
                  }}
                >
                  <Text style={styles.timerBtnText}>
                    {timerRunning ? 'Jeda' : 'Mulai'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timerBtn}
                  onPress={() => {
                    feedback('tap');
                    setTimerRunning(false);
                    setTimer(120);
                  }}
                >
                  <Text style={styles.timerBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeIn>
          <FadeIn delay={400}>
            <GoldButton
              label="Mulai Voting"
              onPress={() => {
                stop();
                setTimerRunning(false);
                onAdvanceAutoDayStep();
              }}
              style={styles.btn}
            />
          </FadeIn>
        </View>
      );

    case 'passToVoter': {
      const voter = alive[autoVoterIndex];
      if (!voter) return null;
      return (
        <View style={styles.centered}>
          <FadeIn delay={0}>
            <Text style={styles.bigEmoji}>🗳️</Text>
          </FadeIn>
          <FadeIn delay={100} slideFrom="none">
            <Text style={shared.title}>Giliran Voting</Text>
          </FadeIn>
          <FadeIn delay={200} slideFrom="none">
            <Text style={styles.passText}>
              Serahkan HP ke:{'\n'}
              <Text style={styles.passName}>{voter.name}</Text>
            </Text>
          </FadeIn>
          <FadeIn delay={300} slideFrom="none">
            <Text style={styles.privacyNote}>
              Pemain lain JANGAN mengintip!
            </Text>
          </FadeIn>
          <FadeIn delay={300} slideFrom="none">
            <Text style={styles.voterProgress}>
              Pemilih {autoVoterIndex + 1} dari {alive.length}
            </Text>
          </FadeIn>
          <FadeIn delay={400}>
            <GoldButton
              label={`Saya ${voter.name} — Siap Voting`}
              onPress={() => {
                feedback('heavy');
                onAdvanceAutoDayStep();
              }}
              style={styles.btn}
            />
          </FadeIn>
        </View>
      );
    }

    case 'voting': {
      const voter = alive[autoVoterIndex];
      if (!voter) return null;
      const votable = alive.filter((p) => p.id !== voter.id);

      return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <FadeIn delay={0} slideFrom="none">
            <Text style={shared.title}>Voting: {voter.name}</Text>
            <Text style={shared.subtitle}>Pilih pemain untuk dieliminasi</Text>
          </FadeIn>

          {votable.map((item, i) => {
            const isSelected = selectedVote === item.id && !voteNone;
            return (
              <FadeIn key={item.id} delay={100 + i * 60}>
                <VoteItem
                  name={item.name}
                  isSelected={isSelected}
                  onPress={() => {
                    setSelectedVote(item.id);
                    setVoteNone(false);
                  }}
                />
              </FadeIn>
            );
          })}

          <FadeIn delay={100 + votable.length * 60}>
            <VoteItem
              name="Abstain (tidak memilih)"
              isSelected={voteNone}
              isSkip
              onPress={() => {
                setVoteNone(true);
                setSelectedVote(null);
              }}
            />
          </FadeIn>

          <FadeIn delay={200 + votable.length * 60}>
            <GoldButton
              label="Konfirmasi & Oper HP"
              onPress={() => {
                feedback('tap');
                onAutoVote(voter.id, voteNone ? null : selectedVote);
              }}
              disabled={selectedVote === null && !voteNone}
              style={styles.btn}
            />
          </FadeIn>
        </ScrollView>
      );
    }

    case 'voteResult': {
      const tally: Record<number, number> = {};
      for (const targetId of Object.values(autoVotes)) {
        if (targetId !== null) {
          tally[targetId] = (tally[targetId] || 0) + 1;
        }
      }
      const entries = Object.entries(tally)
        .map(([id, count]) => ({ id: Number(id), count }))
        .sort((a, b) => b.count - a.count);

      const topCount = entries[0]?.count ?? 0;
      const topEntries = entries.filter((e) => e.count === topCount);
      const isTie = topEntries.length > 1 || topCount === 0;
      const eliminatedPlayer = !isTie
        ? players.find((p) => p.id === topEntries[0].id)
        : null;

      const msg = isTie
        ? 'Hasil voting seri. Tidak ada yang dieliminasi.'
        : `${eliminatedPlayer?.name} dieliminasi dengan ${topCount} suara.`;
      speakOnce(msg);

      return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <FadeIn delay={0} slideFrom="none">
            <Text style={shared.title}>Hasil Voting</Text>
          </FadeIn>

          <FadeIn delay={200}>
            <View style={shared.card}>
              {entries.length === 0 ? (
                <Text style={[shared.textDim, { textAlign: 'center' }]}>
                  Semua pemain abstain.
                </Text>
              ) : (
                entries.map((e) => {
                  const p = players.find((pl) => pl.id === e.id);
                  return (
                    <View key={e.id} style={styles.tallyRow}>
                      <Text style={styles.tallyName}>{p?.name}</Text>
                      <Text style={styles.tallyCount}>{e.count} suara</Text>
                    </View>
                  );
                })
              )}
            </View>
          </FadeIn>

          <FadeIn delay={400}>
            <View style={[shared.card, styles.resultCard]}>
              {isTie ? (
                <>
                  <Text style={styles.safeTitle}>🤝 Seri / Tidak Ada Eliminasi</Text>
                  <Text style={shared.textDim}>
                    Tidak ada yang dieliminasi ronde ini.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.deathTitle}>💀 Dieliminasi</Text>
                  <Text style={styles.deathName}>{eliminatedPlayer?.name}</Text>
                  <Text style={[styles.deathRole, { color: ROLE_DEFS[eliminatedPlayer?.role as keyof typeof ROLE_DEFS]?.color }]}>
                    {ROLE_DEFS[eliminatedPlayer?.role as keyof typeof ROLE_DEFS]?.emoji}{' '}
                    {ROLE_DEFS[eliminatedPlayer?.role as keyof typeof ROLE_DEFS]?.name}
                  </Text>
                </>
              )}
            </View>
          </FadeIn>

          <FadeIn delay={600}>
            <GoldButton
              label="Lanjut"
              onPress={() => {
                stop();
                onAdvanceAutoDayStep();
              }}
              style={styles.btn}
            />
          </FadeIn>
        </ScrollView>
      );
    }

    default:
      return null;
  }
}

function VoteItem({
  name,
  isSelected,
  isSkip,
  onPress,
}: {
  name: string;
  isSelected: boolean;
  isSkip?: boolean;
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
        style={[styles.voteItem, isSkip && styles.skipVote, isSelected && styles.voteSelected]}
        onPress={() => {
          feedback('select');
          onPress();
        }}
      >
        <Text style={[styles.voteText, isSelected && styles.voteTextSelected]}>
          {name}
        </Text>
        {isSelected && <Text style={styles.checkMarkVote}>✓</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sunIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  bigEmoji: {
    fontSize: 60,
    marginBottom: 16,
    textAlign: 'center',
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
  voterProgress: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: 8,
  },
  deathCard: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  deathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 8,
  },
  deathName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deathRole: {
    fontSize: 18,
    fontWeight: '600',
  },
  safeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  resultCard: {
    alignItems: 'center',
  },
  timerCard: {
    alignItems: 'center',
    width: '100%',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.moon,
    fontVariant: ['tabular-nums'],
  },
  timerBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  timerBtn: {
    backgroundColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  timerBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tallyName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  tallyCount: {
    color: colors.moon,
    fontSize: 16,
    fontWeight: 'bold',
  },
  voteItem: {
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
  voteSelected: {
    borderColor: colors.moon,
    backgroundColor: 'rgba(243,220,148,0.1)',
  },
  skipVote: {
    marginTop: 12,
    borderStyle: 'dashed',
  },
  voteText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  voteTextSelected: {
    color: colors.moon,
    fontWeight: 'bold',
  },
  checkMarkVote: {
    color: colors.moon,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btn: {
    marginTop: 20,
    alignSelf: 'center',
    minWidth: 220,
  },
});
