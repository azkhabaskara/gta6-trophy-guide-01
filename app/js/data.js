// loadTrophies fetches the official list (app/data/trophies.json) and returns it.
// No network is involved beyond the app's own files: the fetch is a same-origin
// relative path, so the guide works with the network off.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  return { trophies, sourcesNote: doc.sources_note ?? '' };
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id);
}

export function gradeTotals(trophies) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  return totals;
}
