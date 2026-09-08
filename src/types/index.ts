export type RoleId = 'serigala' | 'warga' | 'peramal' | 'pelindung' | 'pemburu';

export interface RoleDef {
  id: RoleId;
  name: string;
  team: 'serigala' | 'desa';
  description: string;
  color: string;
  emoji: string;
}

export interface Player {
  id: number;
  name: string;
  role: RoleId;
  alive: boolean;
}

export type GameMode = 'operator' | 'auto';

export type Phase =
  | 'modeSelect'
  | 'setup'
  | 'roles'
  | 'reveal'
  | 'handoff'
  | 'night'
  | 'day'
  | 'gameover'
  | 'settings';

export type NightStep =
  | 'intro'
  | 'serigala'
  | 'peramal'
  | 'pelindung'
  | 'outro';

export type AutoNightStep =
  | 'intro'
  | 'passToWolf'
  | 'serigala'
  | 'passToSeer'
  | 'peramal'
  | 'seerResult'
  | 'passToGuard'
  | 'pelindung'
  | 'outro';

export type AutoDayStep =
  | 'announcement'
  | 'discussion'
  | 'passToVoter'
  | 'voting'
  | 'voteResult';

export interface RoleConfig {
  serigala: number;
  peramal: number;
  pelindung: number;
  pemburu: number;
}

export interface NightResult {
  wolfTarget: number | null;
  seerTarget: number | null;
  seerResult: RoleId | null;
  guardTarget: number | null;
  killed: number | null;
}

export interface VoiceSettings {
  enabled: boolean;
  rate: number;
}

export interface GameState {
  phase: Phase;
  mode: GameMode;
  players: Player[];
  roleConfig: RoleConfig;
  round: number;
  revealIndex: number;
  nightStep: NightStep;
  autoNightStep: AutoNightStep;
  nightResult: NightResult;
  dayTimer: number;
  autoDayStep: AutoDayStep;
  autoVoterIndex: number;
  autoVotes: Record<number, number | null>;
  votedOut: number | null;
  winner: 'serigala' | 'desa' | null;
  hunterPending: boolean;
  hunterPlayerId: number | null;
  lastGuardTarget: number | null;
  previousPhase: Phase | null;
}
