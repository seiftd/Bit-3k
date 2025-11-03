export interface ZombieConfig {
  freePlays: number;
  maxDailyReward: number;
  brackets: Array<{ min: number; max?: number; sbr: number }>;
}

export async function getConfig(apiUrl: string): Promise<ZombieConfig> {
  const res = await fetch(`${apiUrl}/api/game/zombie/config`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load config');
  return await res.json();
}

export async function getStats(apiUrl: string, token: string) {
  const res = await fetch(`${apiUrl}/api/game/zombie/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return await res.json();
}

export async function postScore(apiUrl: string, token: string, score: number) {
  const res = await fetch(`${apiUrl}/api/game/zombie/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}



