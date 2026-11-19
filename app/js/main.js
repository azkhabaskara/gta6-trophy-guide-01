// main.js boots Platinum Road: it loads the trophy list, restores saved progress
// and settings, routes between the five sections by hash, and re-renders on change.
import { loadTrophies } from './data.js';
import { loadState, saveState, toggleEarned } from './store.js';
import {
  renderChecklist, renderRoadmap, renderMissables, renderPlanner,
  renderSettings, updateProgressHeader,
} from './views.js';

const view = document.getElementById('view');
const state = loadState();
const filters = { query: '', grade: 'all', kind: 'all' };
let trophies = [];
let sourcesNote = '';
let selectedId = null;

const ROUTES = {
  checklist: renderChecklist,
  roadmap: renderRoadmap,
  missables: renderMissables,
  next: renderPlanner,
  settings: renderSettings,
};

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.getElementById('themeToggle').textContent = state.theme === 'night' ? 'Light theme' : 'Dark theme';
}

function currentRoute() {
  const match = location.hash.match(/^#\/([a-z]+)/);
  return match && ROUTES[match[1]] ? match[1] : 'checklist';
}

function rerender() {
  updateProgressHeader(state, trophies);
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === currentRoute());
  });
  const ctx = {
    trophies, state, filters, sourcesNote,
    selectedId,
    save: () => saveState(state),
    applyTheme,
    rerender: () => rerender(),
    rerenderSearch: () => rerenderSearch(),
    rerenderKeep: () => rerenderKeep(),
    select: (id) => { selectedId = id; rerenderKeep(); },
    toggleEarned: (id) => { toggleEarned(state, id); rerenderKeep(); },
  };
  ROUTES[currentRoute()](view, ctx);
}

// rerenderKeep re-renders the current route without resetting the selection
// and without moving focus: used after ticking a trophy or opening a guide.
function rerenderKeep() {
  updateProgressHeader(state, trophies);
  const ctx = {
    trophies, state, filters, sourcesNote,
    selectedId,
    save: () => saveState(state),
    applyTheme,
    rerender: () => rerender(),
    rerenderSearch: () => rerenderSearch(),
    rerenderKeep: () => rerenderKeep(),
    select: (id) => { selectedId = id; rerenderKeep(); },
    toggleEarned: (id) => { toggleEarned(state, id); rerenderKeep(); },
  };
  ROUTES[currentRoute()](view, ctx);
}

// Search typing re-renders the list in place without losing focus or selection.
function rerenderSearch() {
  updateProgressHeader(state, trophies);
  const ctx = {
    trophies, state, filters, sourcesNote,
    selectedId,
    save: () => saveState(state),
    applyTheme,
    rerender: () => rerender(),
    rerenderSearch: () => rerenderSearch(),
    rerenderKeep: () => rerenderKeep(),
    select: (id) => { selectedId = id; rerenderKeep(); },
    toggleEarned: (id) => { toggleEarned(state, id); rerenderKeep(); },
  };
  // Re-render, then restore focus and caret at the end of the query.
  renderChecklist(view, ctx);
  const search = document.getElementById('search');
  if (search) {
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }
}

document.getElementById('themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'night' ? 'paper' : 'night';
  saveState(state);
  applyTheme();
  rerenderKeep();
});

window.addEventListener('hashchange', () => rerender());

try {
  const doc = await loadTrophies();
  trophies = doc.trophies;
  sourcesNote = doc.sourcesNote;
} catch (err) {
  view.innerHTML = `<p class="empty">Could not load the trophy list: ${err.message}. The guide needs data/trophies.json beside this page.</p>`;
  throw err;
}

applyTheme();
if (!location.hash) location.hash = '#/checklist';
rerender();
