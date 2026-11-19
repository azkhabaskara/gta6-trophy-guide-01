// renderChecklist, renderRoadmap, renderMissables, renderPlanner and
// renderSettings draw each section of the guide into #view. The checklist pairs
// the trophy list with a guide pane that shows the selected trophy's guide and
// its sources; the roadmap and missables pages are built from the official
// descriptions; the planner suggests what to earn next.
import { GRADES, GRADE_LABELS, KINDS, ROADMAP_STAGES, MISSABLE_WATCHOUTS } from './config.js';
import { gradeTotals, trophyById } from './data.js';
import { isSpoilerHidden, filterTrophies } from './filters.js';
import { exportProgress, importProgress, resetProgress } from './store.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function gradeBadge(grade) {
  return `<span class="badge"><span class="dot ${grade}"></span>${GRADE_LABELS[grade]}</span>`;
}

export function kindLabel(kind) {
  const found = KINDS.find(([key]) => key === kind);
  return found ? found[1] : kind;
}

function stageOf(id) {
  for (let i = 0; i < ROADMAP_STAGES.length; i++) {
    if (ROADMAP_STAGES[i].ids.includes(id)) return i;
  }
  return ROADMAP_STAGES.length - 1;
}

function trophyCard(t, state) {
  const hidden = isSpoilerHidden(t, state);
  const earned = state.earned.has(t.id);
  const name = hidden ? 'Hidden trophy' : t.name;
  const desc = hidden ? 'Hidden on PlayStation until earned.' : t.description;
  const target = t.target !== undefined
    ? `<span class="target">PSN target: ${typeof t.target === 'number' ? t.target.toLocaleString('en-US') : t.target}</span>` : '';
  return `<article class="trophy${earned ? ' earned' : ''}" data-id="${t.id}" tabindex="0" role="button" aria-label="${escapeHtml(name)}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(name)} as earned" data-check="${t.id}">
    <div class="body">
      <div class="name">${escapeHtml(name)}</div>
      <div class="desc">${escapeHtml(desc)}</div>
      <div class="meta">${gradeBadge(t.grade)}
        <span class="badge kind">${escapeHtml(kindLabel(t.kind))}</span>
        ${t.missable ? '<span class="badge missable">Missable</span>' : ''}
        ${t.hidden ? '<span class="badge hidden-badge">Hidden</span>' : ''}
        ${target}
      </div>
    </div>
  </article>`;
}

function detailPane(t, state) {
  if (!t) {
    return `<aside class="detail"><p class="detail-placeholder">Select a trophy on the left to read its guide — what to do, where, when it can be missed, and where each fact comes from.</p></aside>`;
  }
  const hidden = isSpoilerHidden(t, state);
  const earned = state.earned.has(t.id);
  if (hidden) {
    return `<aside class="detail"><h2>Hidden trophy</h2>
      <p class="detail-placeholder">This trophy is hidden on PlayStation until you earn it. Turn the spoiler setting off in Settings &amp; save to reveal its name and guide, or earn it in the game first.</p></aside>`;
  }
  return `<aside class="detail">
    <div class="meta">${gradeBadge(t.grade)} <span class="badge kind">${escapeHtml(kindLabel(t.kind))}</span>${t.missable ? ' <span class="badge missable">Missable</span>' : ''}${t.hidden ? ' <span class="badge hidden-badge">Hidden</span>' : ''}</div>
    <h2>${escapeHtml(t.name)}</h2>
    <p class="desc">${escapeHtml(t.description)}</p>
    ${t.missable ? '<div class="warn"><b>Missable.</b> This is the one trophy you can miss — read the guide carefully before you finish Chapter 1.</div>' : ''}
    <p class="guide">${escapeHtml(t.guide)}</p>
    ${t.target !== undefined ? `<p class="target">PSN progress target: <b>${typeof t.target === 'number' ? t.target.toLocaleString('en-US') : t.target}</b></p>` : ''}
    <p class="sources"><b>Sources:</b> ${escapeHtml(t.sources)}</p>
    <p><button type="button" class="${earned ? 'ghost' : ''}" data-mark="${t.id}">${earned ? 'Mark as not earned' : 'Mark as earned'}</button></p>
  </aside>`;
}

export function renderChecklist(el, ctx) {
  const { trophies, state, filters } = ctx;
  const list = filterTrophies(trophies, state, filters);
  const selected = ctx.selectedId ? trophyById(trophies, ctx.selectedId) : null;
  el.innerHTML = `
    <div class="controls">
      <input type="search" id="search" placeholder="Search trophies, guides…" value="${escapeHtml(filters.query)}" aria-label="Search trophies">
      <label>Grade <select id="gradeFilter">
        <option value="all">All grades</option>
        ${GRADES.map((g) => `<option value="${g}"${filters.grade === g ? ' selected' : ''}>${GRADE_LABELS[g]}</option>`).join('')}
      </select></label>
      <label>Kind <select id="kindFilter">
        <option value="all">All kinds</option>
        ${KINDS.map(([key, label]) => `<option value="${key}"${filters.kind === key ? ' selected' : ''}>${label}</option>`).join('')}
      </select></label>
      <label><input type="checkbox" id="hideEarned"${state.hideEarned ? ' checked' : ''}> Hide earned</label>
      <label><input type="checkbox" id="spoilerToggle"${state.spoiler ? ' checked' : ''}> Hide story spoilers</label>
      <button type="button" id="exportBtn" class="ghost">Export progress</button>
      <label class="import-label btn ghost">Import progress <input type="file" id="importFile" accept="application/json"></label>
    </div>
    <p class="spoiler-note">${state.spoiler
      ? 'Spoilers on: 28 hidden trophies stay hidden until you earn them. Turn the setting off in Settings &amp; save to reveal them.'
      : 'Spoilers off: hidden trophies are shown with their names and guides.'}
      Showing ${list.length} of ${trophies.length} trophies. No online trophies — all 55 are offline single-player.</p>
    <div class="split">
      <div class="trophy-list" id="trophyList">
        ${list.length ? list.map((t) => trophyCard(t, state)).join('') : '<p class="empty">No trophies match these filters.</p>'}
      </div>
      ${detailPane(selected, state)}
    </div>`;
  el.querySelector('#search').addEventListener('input', (e) => { filters.query = e.target.value; ctx.rerenderSearch(); });
  el.querySelector('#gradeFilter').addEventListener('change', (e) => { filters.grade = e.target.value; ctx.rerender(); });
  el.querySelector('#kindFilter').addEventListener('change', (e) => { filters.kind = e.target.value; ctx.rerender(); });
  el.querySelector('#hideEarned').addEventListener('change', (e) => { state.hideEarned = e.target.checked; ctx.save(); ctx.rerender(); });
  el.querySelector('#spoilerToggle').addEventListener('change', (e) => { state.spoiler = e.target.checked; ctx.save(); ctx.rerender(); });
  el.querySelector('#exportBtn').addEventListener('click', () => exportProgress(state));
  el.querySelector('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await importProgress(state, file, trophies.map((t) => t.id));
      ctx.save(); ctx.rerender();
      alert(`Imported ${result.imported} trophies${result.unknown ? ` (${result.unknown} unknown ids ignored)` : ''}.`);
    } catch (err) {
      alert(err.message);
    }
  });
  el.querySelectorAll('[data-check]').forEach((box) => {
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => { ctx.toggleEarned(Number(box.dataset.check)); });
  });
  el.querySelectorAll('.trophy').forEach((card) => {
    const open = () => ctx.select(Number(card.dataset.id));
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  const mark = el.querySelector('[data-mark]');
  if (mark) mark.addEventListener('click', () => ctx.toggleEarned(Number(mark.dataset.mark)));
}

export function renderRoadmap(el, ctx) {
  const { trophies, state } = ctx;
  el.innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p>Built from the official descriptions: five stages, in the order to play them. Around 200 hours for the platinum in total; no online trophies, no difficulty trophies, no mission medals — it takes ages, but none of it is hard.</p>
    ${ROADMAP_STAGES.map((stage, i) => {
      const items = stage.ids.map((id) => trophyById(trophies, id));
      const done = items.filter((t) => state.earned.has(t.id)).length;
      return `<section class="stage">
        <div class="stage-head"><h3>${escapeHtml(stage.title)}</h3><span class="count">${done} / ${items.length} earned</span></div>
        <p>${escapeHtml(stage.note)}</p>
        <ul>${items.map((t) => {
          const hidden = isSpoilerHidden(t, state);
          const label = hidden ? 'Hidden trophy' : t.name;
          return `<li class="${state.earned.has(t.id) ? 'done' : ''}">${state.earned.has(t.id) ? '✓ ' : '○ '}${escapeHtml(label)}<span class="g">${GRADE_LABELS[t.grade]}</span></li>`;
        }).join('')}</ul>
      </section>`;
    }).join('')}
    <p><a href="#/missables">Read the missables page before you start Chapter 1 →</a></p>`;
}

export function renderMissables(el, ctx) {
  const { trophies, state } = ctx;
  const pma = trophyById(trophies, 28);
  el.innerHTML = `
    <h2>Missables</h2>
    <p>Only one trophy in the whole list can be missed. Everything else is either unmissable story or stays available in free roam after the credits.</p>
    <section class="stage">
      <div class="stage-head"><h3>⚠ ${escapeHtml(pma.name)} — the one missable trophy</h3><span class="count">${state.earned.has(pma.id) ? 'Earned ✓' : 'Not earned yet'}</span></div>
      <p class="desc"><i>${escapeHtml(pma.description)}</i> — ${gradeBadge(pma.grade)} <span class="badge kind">${escapeHtml(kindLabel(pma.kind))}</span></p>
      <p>${escapeHtml(pma.guide)}</p>
      <p class="sources"><b>Sources:</b> ${escapeHtml(pma.sources)}</p>
      <p><button type="button" data-mark="${pma.id}" class="${state.earned.has(pma.id) ? 'ghost' : ''}">${state.earned.has(pma.id) ? 'Mark as not earned' : 'Mark as earned'}</button></p>
    </section>
    <h3>Watch out for these too</h3>
    ${MISSABLE_WATCHOUTS.map((w) => `<section class="stage"><h3>${escapeHtml(w.title)}</h3><p>${escapeHtml(w.text)}</p></section>`).join('')}`;
  const mark = el.querySelector('[data-mark]');
  if (mark) mark.addEventListener('click', () => ctx.toggleEarned(Number(mark.dataset.mark)));
}

export function renderPlanner(el, ctx) {
  const { trophies, state } = ctx;
  const order = ROADMAP_STAGES.flatMap((stage, i) => stage.ids.map((id) => ({ id, stage: i })));
  const next = order
    .filter(({ id }) => !state.earned.has(id))
    .slice(0, 10)
    .map(({ id, stage }, i) => ({ trophy: trophyById(trophies, id), stage, rank: i + 1 }));
  el.innerHTML = `
    <h2>Next up</h2>
    <p>Your next trophies, in roadmap order — story first, then strands, robberies, activities and the 100% cleanup. ${state.earned.size} of ${trophies.length} earned so far.</p>
    ${next.length ? next.map(({ trophy: t, stage, rank }) => {
      const hidden = isSpoilerHidden(t, state);
      return `<div class="next-item">
        <div class="rank">${rank}</div>
        <div class="body">
          <div class="name"><b>${escapeHtml(hidden ? 'Hidden trophy' : t.name)}</b> ${gradeBadge(t.grade)}</div>
          <div class="why">${escapeHtml(hidden ? 'Hidden on PlayStation until earned.' : t.description)} · ${escapeHtml(ROADMAP_STAGES[stage].title)}</div>
        </div>
        <button type="button" class="small" data-mark="${t.id}">Mark earned</button>
        <button type="button" class="small ghost" data-open="${t.id}">Guide</button>
      </div>`;
    }).join('') : '<p class="empty">Everything is earned — the platinum is yours. Congratulations, Leonida Legend.</p>'}`;
  el.querySelectorAll('[data-mark]').forEach((b) => b.addEventListener('click', () => ctx.toggleEarned(Number(b.dataset.mark))));
  el.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => {
    ctx.select(Number(b.dataset.open));
    location.hash = '#/checklist';
  }));
}

export function renderSettings(el, ctx) {
  const { trophies, state } = ctx;
  const totals = gradeTotals(trophies);
  const earnedByGrade = {};
  for (const g of GRADES) earnedByGrade[g] = trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
  el.innerHTML = `
    <h2>Settings &amp; save</h2>
    <section class="panel">
      <h3>Progress</h3>
      <p>${state.earned.size} of ${trophies.length} earned —
        ${GRADES.map((g) => `${GRADE_LABELS[g]} ${earnedByGrade[g]}/${totals[g]}`).join(' · ')}.</p>
      <div class="row">
        <button type="button" id="exportBtn2">Export progress</button>
        <label class="import-label btn ghost">Import progress <input type="file" id="importFile2" accept="application/json"></label>
        <button type="button" id="resetBtn" class="ghost">Reset all progress</button>
      </div>
      <p>Progress is saved in this browser (localStorage) and never leaves it except through export. The file is plain JSON with the ids of the trophies you have earned.</p>
    </section>
    <section class="panel">
      <h3>Display</h3>
      <div class="row">
        <label>Theme
          <select id="themeSelect">
            <option value="paper"${state.theme === 'paper' ? ' selected' : ''}>Paper (light)</option>
            <option value="night"${state.theme === 'night' ? ' selected' : ''}>Night (dark)</option>
          </select>
        </label>
        <label><input type="checkbox" id="spoilerSetting"${state.spoiler ? ' checked' : ''}> Hide story spoilers (28 hidden trophies stay hidden until earned)</label>
      </div>
      <p>Keyboard: on the checklist, <kbd>Enter</kbd> on a trophy opens its guide. Spoilers, theme and progress all persist in this browser.</p>
    </section>
    <section class="panel">
      <h3>About this guide</h3>
      <p>${escapeHtml(ctx.sourcesNote)}</p>
      <p>All 55 trophies are offline single-player. There are no online trophies, no difficulty trophies and no mission medals.</p>
    </section>`;
  el.querySelector('#exportBtn2').addEventListener('click', () => exportProgress(state));
  el.querySelector('#importFile2').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await importProgress(state, file, trophies.map((t) => t.id));
      ctx.save(); ctx.rerender();
      alert(`Imported ${result.imported} trophies${result.unknown ? ` (${result.unknown} unknown ids ignored)` : ''}.`);
    } catch (err) {
      alert(err.message);
    }
  });
  el.querySelector('#resetBtn').addEventListener('click', () => {
    if (confirm('Reset all earned trophies? This cannot be undone (unless you exported a backup).')) {
      resetProgress(state);
      ctx.save(); ctx.rerender();
    }
  });
  el.querySelector('#themeSelect').addEventListener('change', (e) => { state.theme = e.target.value; ctx.save(); ctx.applyTheme(); ctx.rerender(); });
  el.querySelector('#spoilerSetting').addEventListener('change', (e) => { state.spoiler = e.target.checked; ctx.save(); ctx.rerender(); });
}

export function updateProgressHeader(state, trophies) {
  const totals = gradeTotals(trophies);
  document.getElementById('earnedCount').textContent = String(state.earned.size);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${Math.round((state.earned.size / trophies.length) * 100)}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(state.earned.size));
  document.getElementById('gradeCounts').innerHTML = GRADES.map((g) => {
    const earned = trophies.filter((t) => t.grade === g && state.earned.has(t.id)).length;
    return `<span><span class="dot ${g}"></span> <b>${earned}/${totals[g]}</b> ${GRADE_LABELS[g].toLowerCase()}</span>`;
  }).join('');
}
