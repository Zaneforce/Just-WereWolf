import { Player } from '../types';

export function checkWin(players: Player[]): 'serigala' | 'desa' | null {
  const alive = players.filter((p) => p.alive);
  const wolves = alive.filter((p) => p.role === 'serigala').length;
  const villagers = alive.filter((p) => p.role !== 'serigala').length;

  if (wolves === 0) return 'desa';
  if (wolves >= villagers) return 'serigala';
  return null;
}
