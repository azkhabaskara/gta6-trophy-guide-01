// filterTrophies applies the checklist filters: grade, kind, text search, the
// spoiler rule and hide-earned. isSpoilerHidden decides whether a trophy's name
// and description stay hidden until it is earned.
export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id);
}

export function filterTrophies(trophies, state, filters) {
  const query = (filters.query ?? '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}
