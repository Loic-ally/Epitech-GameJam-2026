const API_BASE =
  (typeof window !== 'undefined' && (process.env.REACT_APP_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`))
  || '';

export async function pullGacha(token: string, count: 1 | 10) {
  const res = await fetch(`${API_BASE}/gacha/pull`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ count }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.msg || 'Pull impossible');
  }

  return res.json() as Promise<{ pulls: { id: number; rarity?: string; name?: string }[]; remainingPool: number }>;
}
