import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Player } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  players: Player[];
  round: number;
  killedName: string | null;
  killedRole: string | null;
  onVote: (playerId: number | null) => void;
}

type DayStep = 'announcement' | 'discussion' | 'voting';

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
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  if (step === 'announcement') {
    return (
      <View style={styles.centered}>
        <Text style={styles.sunIcon}>☀️</Text>
        <Text style={shared.title}>Pagi Hari — Ronde {round}</Text>
        {killedName ? (
          <View style={[shared.card, styles.deathCard]}>
            <Text style={styles.deathTitle}>💀 Korban Semalam</Text>
            <Text style={styles.deathName}>{killedName}</Text>
            <Text style={[styles.deathRole, { color: ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.color }]}>
              {ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.emoji}{' '}
              {ROLE_DEFS[killedRole as keyof typeof ROLE_DEFS]?.name}
            </Text>
          </View>
        ) : (
          <View style={[shared.card, styles.deathCard]}>
            <Text style={styles.safeTitle}>🎉 Tidak Ada Korban!</Text>
            <Text style={shared.textDim}>
              Pelindung berhasil menyelamatkan target semalam.
            </Text>
          </View>
        )}
        <GoldButton
          label="Mulai Diskusi"
          onPress={() => setStep('discussion')}
          style={styles.btn}
        />
      </View>
    );
  }

  if (step === 'discussion') {
    return (
      <View style={styles.centered}>
        <Text style={shared.title}>Waktu Diskusi</Text>
        <View style={[shared.card, styles.timerCard]}>
          <Text style={styles.timerText}>
            {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
          </Text>
          <View style={styles.timerBtnRow}>
            <TouchableOpacity
              style={styles.timerBtn}
              onPress={() => setTimerRunning(!timerRunning)}
            >
              <Text style={styles.timerBtnText}>
                {timerRunning ? 'Jeda' : 'Mulai'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timerBtn}
              onPress={() => {
                setTimerRunning(false);
                setTimer(120);
              }}
            >
              <Text style={styles.timerBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
        <GoldButton
          label="Lanjut ke Voting"
          onPress={() => setStep('voting')}
          style={styles.btn}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={shared.title}>Voting Siang</Text>
      <Text style={shared.subtitle}>Pilih pemain untuk dieliminasi</Text>

      <FlatList
        data={alive}
        keyExtractor={(p) => p.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedVote === item.id && !voteNone;
          return (
            <TouchableOpacity
              style={[styles.voteItem, isSelected && styles.voteSelected]}
              onPress={() => {
                setSelectedVote(item.id);
                setVoteNone(false);
              }}
            >
              <Text
                style={[styles.voteText, isSelected && styles.voteTextSelected]}
              >
                {item.name}
              </Text>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.voteItem, styles.skipVote, voteNone && styles.voteSelected]}
        onPress={() => {
          setVoteNone(true);
          setSelectedVote(null);
        }}
      >
        <Text style={[styles.voteText, voteNone && styles.voteTextSelected]}>
          Tidak ada yang dieliminasi
        </Text>
        {voteNone && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>

      <GoldButton
        label="Eksekusi Voting"
        onPress={() => onVote(voteNone ? null : selectedVote)}
        disabled={selectedVote === null && !voteNone}
        style={styles.btn}
      />
    </ScrollView>
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
    padding: 20,
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
