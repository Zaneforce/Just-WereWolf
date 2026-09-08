import React, { useState, useEffect, useRef } from 'react';
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
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';

interface Props {
  players: Player[];
  round: number;
  killedName: string | null;
  killedRole: string | null;
  onVote: (playerId: number | null) => void;
}

type DayStep = 'announcement' | 'discussion' | 'voting';

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

export function DayPhase({ players, round, killedName, killedRole, onVote }: Props) {
  const [step, setStep] = useState<DayStep>('announcement');
  const [timer, setTimer] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [voteNone, setVoteNone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            feedback('warning');
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

  const alive = players.filter((p) => p.alive);

  if (step === 'announcement') {
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
            onPress={() => setStep('discussion')}
            style={styles.btn}
          />
        </FadeIn>
      </View>
    );
  }

  if (step === 'discussion') {
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
            label="Lanjut ke Voting"
            onPress={() => setStep('voting')}
            style={styles.btn}
          />
        </FadeIn>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <FadeIn delay={0} slideFrom="none">
        <Text style={shared.title}>Voting Siang</Text>
        <Text style={shared.subtitle}>Pilih pemain untuk dieliminasi</Text>
      </FadeIn>

      {alive.map((item, i) => {
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

      <FadeIn delay={100 + alive.length * 60}>
        <VoteItem
          name="Tidak ada yang dieliminasi"
          isSelected={voteNone}
          isSkip
          onPress={() => {
            setVoteNone(true);
            setSelectedVote(null);
          }}
        />
      </FadeIn>

      <FadeIn delay={200 + alive.length * 60}>
        <GoldButton
          label="Eksekusi Voting"
          onPress={() => {
            feedback('heavy');
            onVote(voteNone ? null : selectedVote);
          }}
          disabled={selectedVote === null && !voteNone}
          style={styles.btn}
        />
      </FadeIn>
    </ScrollView>
  );
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
        style={[
          styles.voteItem,
          isSkip && styles.skipVote,
          isSelected && styles.voteSelected,
        ]}
        onPress={() => {
          feedback('select');
          onPress();
        }}
      >
        <Text style={[styles.voteText, isSelected && styles.voteTextSelected]}>
          {name}
        </Text>
        {isSelected && <Text style={styles.checkMark}>✓</Text>}
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
  checkMark: {
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
