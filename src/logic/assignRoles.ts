import { Player, RoleConfig, RoleId } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function assignRoles(
  playerNames: string[],
  config: RoleConfig,
): Player[] {
  const roles: RoleId[] = [];

  for (let i = 0; i < config.serigala; i++) roles.push('serigala');
  for (let i = 0; i < config.peramal; i++) roles.push('peramal');
  for (let i = 0; i < config.pelindung; i++) roles.push('pelindung');
  for (let i = 0; i < config.pemburu; i++) roles.push('pemburu');

  const wargaCount = playerNames.length - roles.length;
  for (let i = 0; i < wargaCount; i++) roles.push('warga');

  const shuffled = shuffle(roles);

  return playerNames.map((name, idx) => ({
    id: idx,
    name,
    role: shuffled[idx],
    alive: true,
  }));
}
