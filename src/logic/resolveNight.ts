import { NightResult, Player } from '../types';

export function resolveNight(
  players: Player[],
  result: NightResult,
): { updatedPlayers: Player[]; killedName: string | null; killedRole: string | null } {
  const updated = players.map((p) => ({ ...p }));

  let killedName: string | null = null;
  let killedRole: string | null = null;

  if (result.wolfTarget !== null) {
    const protected_ = result.guardTarget === result.wolfTarget;
    if (!protected_) {
      const victim = updated.find((p) => p.id === result.wolfTarget);
      if (victim && victim.alive) {
        victim.alive = false;
        killedName = victim.name;
        killedRole = victim.role;
      }
    }
  }

  return { updatedPlayers: updated, killedName, killedRole };
}
