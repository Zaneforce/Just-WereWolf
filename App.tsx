import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import {
  GameState,
  GameMode,
  Phase,
  NightStep,
  AutoNightStep,
  AutoDayStep,
  RoleConfig,
  NightResult,
  RoleId,
} from './src/types';
import { colors, ROLE_DEFS } from './src/theme';
import { assignRoles } from './src/logic/assignRoles';
import { resolveNight } from './src/logic/resolveNight';
import { checkWin } from './src/logic/checkWin';
import { stop as stopSpeech } from './src/audio/narrator';
import { NightBackground } from './src/components/NightBackground';
import { ModeSelectPhase } from './src/components/ModeSelectPhase';
import { SettingsPhase } from './src/components/SettingsPhase';
import { SetupPhase } from './src/components/SetupPhase';
import { RolesPhase } from './src/components/RolesPhase';
import { RevealPhase } from './src/components/RevealPhase';
import { HandoffPhase } from './src/components/HandoffPhase';
import { NightPhase } from './src/components/NightPhase';
import { DayPhase } from './src/components/DayPhase';
import { AutoNightPhase } from './src/components/AutoNightPhase';
import { AutoDayPhase } from './src/components/AutoDayPhase';
import { HunterPhase } from './src/components/HunterPhase';
import { GameOverPhase } from './src/components/GameOverPhase';

const EMPTY_NIGHT: NightResult = {
  wolfTarget: null,
  seerTarget: null,
  seerResult: null,
  guardTarget: null,
  killed: null,
};

const INITIAL_CONFIG: RoleConfig = {
  serigala: 1,
  peramal: 0,
  pelindung: 0,
  pemburu: 0,
};

function initialState(): GameState {
  return {
    phase: 'modeSelect',
    mode: 'operator',
    players: [],
    roleConfig: { ...INITIAL_CONFIG },
    round: 1,
    revealIndex: 0,
    nightStep: 'intro',
    autoNightStep: 'intro',
    nightResult: { ...EMPTY_NIGHT },
    dayTimer: 120,
    autoDayStep: 'announcement',
    autoVoterIndex: 0,
    autoVotes: {},
    votedOut: null,
    winner: null,
    hunterPending: false,
    hunterPlayerId: null,
    lastGuardTarget: null,
    previousPhase: null,
  };
}

export default function App() {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gs, setGs] = useState<GameState>(initialState);
  const [nightKilled, setNightKilled] = useState<{ name: string; role: string } | null>(null);

  // ─── Setup ───

  const selectMode = (mode: GameMode) => {
    setGs((s) => ({ ...s, mode, phase: 'setup' }));
  };

  const openSettings = () => {
    setGs((s) => ({ ...s, previousPhase: s.phase, phase: 'settings' }));
  };

  const closeSettings = () => {
    setGs((s) => ({ ...s, phase: s.previousPhase ?? 'modeSelect', previousPhase: null }));
  };

  const addPlayer = (name: string) => {
    setPlayerNames((prev) => [...prev, name]);
  };

  const removePlayer = (idx: number) => {
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
  };

  const goToRoles = () => {
    setGs((s) => ({ ...s, phase: 'roles' }));
  };

  const goBackToSetup = () => {
    setGs((s) => ({ ...s, phase: 'setup' }));
  };

  const updateRoleConfig = (config: RoleConfig) => {
    setGs((s) => ({ ...s, roleConfig: config }));
  };

  const startGame = () => {
    const players = assignRoles(playerNames, gs.roleConfig);
    setGs((s) => ({ ...s, phase: 'reveal', players, revealIndex: 0 }));
  };

  const advanceReveal = () => {
    setGs((s) => {
      const next = s.revealIndex + 1;
      if (next >= s.players.length) {
        return { ...s, phase: 'handoff', revealIndex: next };
      }
      return { ...s, revealIndex: next };
    });
  };

  const startNight = () => {
    if (gs.mode === 'auto') {
      setGs((s) => ({
        ...s,
        phase: 'night',
        autoNightStep: 'intro',
        nightResult: { ...EMPTY_NIGHT },
      }));
    } else {
      setGs((s) => ({
        ...s,
        phase: 'night',
        nightStep: 'intro',
        nightResult: { ...EMPTY_NIGHT },
      }));
    }
  };

  // ─── Shared helpers ───

  const hasAliveRole = useCallback(
    (role: RoleId): boolean => gs.players.some((p) => p.role === role && p.alive),
    [gs.players],
  );

  const selectNightTarget = (playerId: number) => {
    setGs((s) => {
      const step = s.mode === 'auto' ? s.autoNightStep : s.nightStep;
      switch (step) {
        case 'serigala':
          return { ...s, nightResult: { ...s.nightResult, wolfTarget: playerId } };
        case 'peramal':
          return { ...s, nightResult: { ...s.nightResult, seerTarget: playerId } };
        case 'pelindung':
          return { ...s, nightResult: { ...s.nightResult, guardTarget: playerId } };
        default:
          return s;
      }
    });
  };

  const finishNight = (s: GameState): GameState => {
    const { updatedPlayers, killedName, killedRole } = resolveNight(s.players, s.nightResult);
    setNightKilled(killedName ? { name: killedName, role: killedRole! } : null);

    const killed = killedName ? updatedPlayers.find((p) => p.name === killedName) : null;
    if (killed && killed.role === 'pemburu') {
      return {
        ...s,
        players: updatedPlayers,
        hunterPending: true,
        hunterPlayerId: killed.id,
        lastGuardTarget: s.nightResult.guardTarget,
      };
    }

    const win = checkWin(updatedPlayers);
    if (win) {
      return { ...s, players: updatedPlayers, phase: 'gameover', winner: win, lastGuardTarget: s.nightResult.guardTarget };
    }

    return {
      ...s,
      players: updatedPlayers,
      phase: 'day',
      autoDayStep: 'announcement',
      autoVoterIndex: 0,
      autoVotes: {},
      lastGuardTarget: s.nightResult.guardTarget,
    };
  };

  // ─── Operator mode night ───

  const getNextNightStep = (current: NightStep): NightStep | 'done' => {
    const order: NightStep[] = ['intro', 'serigala', 'peramal', 'pelindung', 'outro'];
    const idx = order.indexOf(current);
    for (let i = idx + 1; i < order.length; i++) {
      const step = order[i];
      if (step === 'intro' || step === 'outro' || step === 'serigala') return step;
      if (step === 'peramal' && hasAliveRole('peramal')) return step;
      if (step === 'pelindung' && hasAliveRole('pelindung')) return step;
    }
    return 'done';
  };

  const advanceNightStep = () => {
    setGs((s) => {
      if (s.nightStep === 'peramal' && s.nightResult.seerTarget !== null && !s.nightResult.seerResult) {
        const target = s.players.find((p) => p.id === s.nightResult.seerTarget);
        if (target) {
          return { ...s, nightResult: { ...s.nightResult, seerResult: target.role } };
        }
      }
      const next = getNextNightStep(s.nightStep);
      if (next === 'done') return finishNight(s);
      return { ...s, nightStep: next };
    });
  };

  // ─── Auto mode night ───

  const getNextAutoNightStep = (current: AutoNightStep, state: GameState): AutoNightStep | 'done' => {
    const full: AutoNightStep[] = [
      'intro',
      'passToWolf', 'serigala',
      'passToSeer', 'peramal', 'seerResult',
      'passToGuard', 'pelindung',
      'outro',
    ];
    const idx = full.indexOf(current);
    for (let i = idx + 1; i < full.length; i++) {
      const step = full[i];
      if (step === 'intro' || step === 'outro') return step;
      if (step === 'passToWolf' || step === 'serigala') return step;
      if ((step === 'passToSeer' || step === 'peramal' || step === 'seerResult') && state.players.some((p) => p.role === 'peramal' && p.alive)) return step;
      if ((step === 'passToGuard' || step === 'pelindung') && state.players.some((p) => p.role === 'pelindung' && p.alive)) return step;
    }
    return 'done';
  };

  const advanceAutoNightStep = () => {
    setGs((s) => {
      if (s.autoNightStep === 'peramal' && s.nightResult.seerTarget !== null && !s.nightResult.seerResult) {
        const target = s.players.find((p) => p.id === s.nightResult.seerTarget);
        if (target) {
          return { ...s, autoNightStep: 'seerResult', nightResult: { ...s.nightResult, seerResult: target.role } };
        }
      }
      const next = getNextAutoNightStep(s.autoNightStep, s);
      if (next === 'done') return finishNight(s);
      return { ...s, autoNightStep: next };
    });
  };

  // ─── Operator mode day ───

  const handleVote = (playerId: number | null) => {
    setGs((s) => {
      let updated = s.players;
      let votedPlayer = null;
      if (playerId !== null) {
        updated = s.players.map((p) => (p.id === playerId ? { ...p, alive: false } : p));
        votedPlayer = updated.find((p) => p.id === playerId) ?? null;
      }
      if (votedPlayer && !votedPlayer.alive && votedPlayer.role === 'pemburu') {
        return { ...s, players: updated, hunterPending: true, hunterPlayerId: votedPlayer.id };
      }
      const win = checkWin(updated);
      if (win) return { ...s, players: updated, phase: 'gameover', winner: win };
      return { ...s, players: updated, phase: 'night', round: s.round + 1, nightStep: 'intro', nightResult: { ...EMPTY_NIGHT } };
    });
  };

  // ─── Auto mode day ───

  const advanceAutoDayStep = () => {
    setGs((s) => {
      switch (s.autoDayStep) {
        case 'announcement':
          return { ...s, autoDayStep: 'discussion' };
        case 'discussion':
          return { ...s, autoDayStep: 'passToVoter', autoVoterIndex: 0, autoVotes: {} };
        case 'passToVoter':
          return { ...s, autoDayStep: 'voting' };
        case 'voting':
          return s;
        case 'voteResult': {
          const tally: Record<number, number> = {};
          for (const targetId of Object.values(s.autoVotes)) {
            if (targetId !== null) tally[targetId] = (tally[targetId] || 0) + 1;
          }
          const entries = Object.entries(tally).map(([id, count]) => ({ id: Number(id), count })).sort((a, b) => b.count - a.count);
          const topCount = entries[0]?.count ?? 0;
          const topEntries = entries.filter((e) => e.count === topCount);
          const isTie = topEntries.length > 1 || topCount === 0;

          let updated = s.players;
          let eliminatedPlayer = null;

          if (!isTie) {
            const elimId = topEntries[0].id;
            updated = s.players.map((p) => (p.id === elimId ? { ...p, alive: false } : p));
            eliminatedPlayer = updated.find((p) => p.id === elimId) ?? null;
          }

          if (eliminatedPlayer && !eliminatedPlayer.alive && eliminatedPlayer.role === 'pemburu') {
            return { ...s, players: updated, hunterPending: true, hunterPlayerId: eliminatedPlayer.id };
          }

          const win = checkWin(updated);
          if (win) return { ...s, players: updated, phase: 'gameover', winner: win };
          return {
            ...s,
            players: updated,
            phase: 'night',
            round: s.round + 1,
            autoNightStep: 'intro',
            nightResult: { ...EMPTY_NIGHT },
          };
        }
        default:
          return s;
      }
    });
  };

  const handleAutoVote = (voterId: number, targetId: number | null) => {
    setGs((s) => {
      const newVotes = { ...s.autoVotes, [voterId]: targetId };
      const alive = s.players.filter((p) => p.alive);
      const nextIdx = s.autoVoterIndex + 1;

      if (nextIdx >= alive.length) {
        return { ...s, autoVotes: newVotes, autoDayStep: 'voteResult' };
      }

      return { ...s, autoVotes: newVotes, autoVoterIndex: nextIdx, autoDayStep: 'passToVoter' };
    });
  };

  // ─── Hunter ───

  const handleHunterShot = (targetId: number) => {
    setGs((s) => {
      const updated = s.players.map((p) => (p.id === targetId ? { ...p, alive: false } : p));
      const win = checkWin(updated);
      if (win) {
        return { ...s, players: updated, hunterPending: false, hunterPlayerId: null, phase: 'gameover', winner: win };
      }
      if (s.phase === 'night' || nightKilled) {
        return {
          ...s,
          players: updated,
          hunterPending: false,
          hunterPlayerId: null,
          phase: 'day',
          autoDayStep: 'announcement',
          autoVoterIndex: 0,
          autoVotes: {},
        };
      }
      return {
        ...s,
        players: updated,
        hunterPending: false,
        hunterPlayerId: null,
        phase: 'night',
        round: s.round + 1,
        nightStep: 'intro',
        autoNightStep: 'intro',
        nightResult: { ...EMPTY_NIGHT },
      };
    });
  };

  // ─── Play again ───

  const playAgain = () => {
    stopSpeech();
    setPlayerNames([]);
    setGs(initialState());
    setNightKilled(null);
  };

  // ─── Render ───

  const renderPhase = () => {
    if (gs.hunterPending && gs.hunterPlayerId !== null) {
      const hunter = gs.players.find((p) => p.id === gs.hunterPlayerId);
      return (
        <HunterPhase
          hunterName={hunter?.name ?? ''}
          players={gs.players}
          onSelect={handleHunterShot}
        />
      );
    }

    switch (gs.phase) {
      case 'modeSelect':
        return <ModeSelectPhase onSelect={selectMode} onOpenSettings={openSettings} />;

      case 'settings':
        return <SettingsPhase onBack={closeSettings} />;

      case 'setup':
        return (
          <SetupPhase
            players={playerNames}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onNext={goToRoles}
          />
        );

      case 'roles':
        return (
          <RolesPhase
            playerCount={playerNames.length}
            config={gs.roleConfig}
            onUpdateConfig={updateRoleConfig}
            onNext={startGame}
            onBack={goBackToSetup}
          />
        );

      case 'reveal':
        return (
          <RevealPhase
            players={gs.players}
            revealIndex={gs.revealIndex}
            onNext={advanceReveal}
          />
        );

      case 'handoff':
        return <HandoffPhase onNext={startNight} />;

      case 'night':
        if (gs.mode === 'auto') {
          return (
            <AutoNightPhase
              players={gs.players}
              round={gs.round}
              autoNightStep={gs.autoNightStep}
              nightResult={gs.nightResult}
              hasRole={hasAliveRole}
              lastGuardTarget={gs.lastGuardTarget}
              onSelectTarget={selectNightTarget}
              onAdvanceAutoStep={advanceAutoNightStep}
            />
          );
        }
        return (
          <NightPhase
            players={gs.players}
            round={gs.round}
            nightStep={gs.nightStep}
            nightResult={gs.nightResult}
            hasRole={hasAliveRole}
            lastGuardTarget={gs.lastGuardTarget}
            onSelectTarget={selectNightTarget}
            onAdvanceStep={advanceNightStep}
          />
        );

      case 'day':
        if (gs.mode === 'auto') {
          return (
            <AutoDayPhase
              players={gs.players}
              round={gs.round}
              killedName={nightKilled?.name ?? null}
              killedRole={nightKilled?.role ?? null}
              autoDayStep={gs.autoDayStep}
              autoVoterIndex={gs.autoVoterIndex}
              autoVotes={gs.autoVotes}
              onAdvanceAutoDayStep={advanceAutoDayStep}
              onAutoVote={handleAutoVote}
            />
          );
        }
        return (
          <DayPhase
            players={gs.players}
            round={gs.round}
            killedName={nightKilled?.name ?? null}
            killedRole={nightKilled?.role ?? null}
            onVote={handleVote}
          />
        );

      case 'gameover':
        return (
          <GameOverPhase
            winner={gs.winner!}
            players={gs.players}
            onPlayAgain={playAgain}
            speakResult={gs.mode === 'auto'}
          />
        );
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgTop} />
      <NightBackground>
        <SafeAreaView style={styles.safe}>{renderPhase()}</SafeAreaView>
      </NightBackground>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 32 : 0,
  },
});
