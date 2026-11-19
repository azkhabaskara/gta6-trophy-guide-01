// progressStore keeps earned trophies and settings in localStorage, and exports
// and imports them as a JSON file. Nothing leaves the browser except through export.
import { STORAGE_KEY, APP_VERSION } from './config.js';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), spoiler: true, theme: 'paper', hideEarned: false };
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      spoiler: parsed.spoiler !== false,
      theme: parsed.theme === 'night' ? 'night' : 'paper',
      hideEarned: parsed.hideEarned === true,
    };
  } catch {
    return { earned: new Set(), spoiler: true, theme: 'paper', hideEarned: false };
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: APP_VERSION,
    earned: [...state.earned].sort((a, b) => a - b),
    spoiler: state.spoiler,
    theme: state.theme,
    hideEarned: state.hideEarned,
  }));
}

export function toggleEarned(state, id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveState(state);
}

export function exportProgress(state) {
  const blob = new Blob([JSON.stringify({
    app: 'platinum-road-gta6',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
  }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// importProgress reads a file exported by exportProgress (or a plain JSON array of
// trophy ids) and returns { imported, unknown } after applying it to the state.
export async function importProgress(state, file, validIds) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file has no earned trophy list in it.');
  const valid = new Set(validIds);
  const imported = ids.filter((id) => valid.has(id));
  const unknown = ids.filter((id) => !valid.has(id));
  state.earned = new Set(imported);
  saveState(state);
  return { imported: imported.length, unknown: unknown.length };
}

export function resetProgress(state) {
  state.earned = new Set();
  saveState(state);
}
