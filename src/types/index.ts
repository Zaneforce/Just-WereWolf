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

export type Phase =
  | 'setup'
  | 'roles'
  | 'reveal'
  | 'handoff'
  | 'night'
  | 'day'
  | 'gameover';

export type NightStep =
  | 'intro'
  | 'serigala'
  | 'peramal'
  | 'pelindung'
  | 'outro';

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

export interface GameState {
  phase: Phase;
  players: Player[];
  roleConfig: RoleConfig;
  round: number;
  revealIndex: number;
  nightStep: NightStep;
  nightResult: NightResult;
  dayTimer: number;
  votedOut: number | null;
  winner: 'serigala' | 'desa' | null;
  hunterPending: boolean;
  hunterPlayerId: number | null;
  lastGuardTarget: number | null;
}
