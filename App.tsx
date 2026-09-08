import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import {
  GameState,
  NightStep,
  RoleConfig,
  NightResult,
  RoleId,
} from './src/types';
import { colors } from './src/theme';
import { assignRoles } from './src/logic/assignRoles';
import { resolveNight } from './src/logic/resolveNight';
import { checkWin } from './src/logic/checkWin';
import { NightBackground } from './src/components/NightBackground';
import { SetupPhase } from './src/components/SetupPhase';
import { RolesPhase } from './src/components/RolesPhase';
import { RevealPhase } from './src/components/RevealPhase';
import { HandoffPhase } from './src/components/HandoffPhase';
import { NightPhase } from './src/components/NightPhase';
import { DayPhase } from './src/components/DayPhase';
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
    phase: 'setup',
    players: [],
    roleConfig: { ...INITIAL_CONFIG },
    round: 1,
    revealIndex: 0,
    nightStep: 'intro',
    nightResult: { ...EMPTY_NIGHT },
    dayTimer: 120,
    votedOut: null,
    winner: null,
    hunterPending: false,
    hunterPlayerId: null,
    lastGuardTarget: null,
  };
}

export default function App() {
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gs, setGs] = useState<GameState>(initialState);
  const [nightKilled, setNightKilled] = useState<{ name: string; role: string } | null>(null);

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
    setGs((s) => ({
      ...s,
      phase: 'reveal',
      players,
      revealIndex: 0,
    }));
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
    setGs((s) => ({
      ...s,
      phase: 'night',
      nightStep: 'intro',
      nightResult: { ...EMPTY_NIGHT },
    }));
  };

  const hasAliveRole = useCallback(
    (role: RoleId): boolean => {
      return gs.players.some((p) => p.role === role && p.alive);
    },
    [gs.players],
  );

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
          return {
            ...s,
            nightResult: {
              ...s.nightResult,
              seerResult: target.role,
            },
          };
        }
      }

      const next = getNextNightStep(s.nightStep);

      if (next === 'done') {
        const { updatedPlayers, killedName, killedRole } = resolveNight(
          s.players,
          s.nightResult,
        );

        setNightKilled(
          killedName ? { name: killedName, role: killedRole! } : null,
        );

        const killed = killedName
          ? updatedPlayers.find((p) => p.name === killedName)
          : null;
        const isHunter = killed && killed.role === 'pemburu';

        if (isHunter && killed) {
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
          return {
            ...s,
            players: updatedPlayers,
            phase: 'gameover',
            winner: win,
            lastGuardTarget: s.nightResult.guardTarget,
          };
        }

        return {
          ...s,
          players: updatedPlayers,
          phase: 'day',
          lastGuardTarget: s.nightResult.guardTarget,
        };
      }

      return { ...s, nightStep: next };
    });
  };

  const selectNightTarget = (playerId: number) => {
    setGs((s) => {
      switch (s.nightStep) {
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

  const handleHunterShot = (targetId: number) => {
    setGs((s) => {
      const updated = s.players.map((p) =>
        p.id === targetId ? { ...p, alive: false } : p,
      );
      const win = checkWin(updated);
      if (win) {
        return {
          ...s,
          players: updated,
          hunterPending: false,
          hunterPlayerId: null,
          phase: 'gameover',
          winner: win,
        };
      }

      if (s.phase === 'night' || nightKilled) {
        return {
          ...s,
          players: updated,
          hunterPending: false,
          hunterPlayerId: null,
          phase: 'day',
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
        nightResult: { ...EMPTY_NIGHT },
      };
    });
  };

  const handleVote = (playerId: number | null) => {
    setGs((s) => {
      let updated = s.players;
      let votedPlayer = null;

      if (playerId !== null) {
        updated = s.players.map((p) =>
          p.id === playerId ? { ...p, alive: false } : p,
        );
        votedPlayer = updated.find((p) => p.id === playerId) ?? null;
      }

      if (votedPlayer && !votedPlayer.alive && votedPlayer.role === 'pemburu') {
        return {
          ...s,
          players: updated,
          hunterPending: true,
          hunterPlayerId: votedPlayer.id,
        };
      }

      const win = checkWin(updated);
      if (win) {
        return {
          ...s,
          players: updated,
          phase: 'gameover',
          winner: win,
        };
      }

      return {
        ...s,
        players: updated,
        phase: 'night',
        round: s.round + 1,
        nightStep: 'intro',
        nightResult: { ...EMPTY_NIGHT },
      };
    });
  };

  const playAgain = () => {
    setPlayerNames([]);
    setGs(initialState());
    setNightKilled(null);
  };

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
