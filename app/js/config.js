// Platinum Road configuration: storage keys, kinds, grades and the roadmap stages.
// The roadmap is built from the official descriptions: story first, then side strands,
// then robberies, then activities and exploration, then collectibles, money and 100%.
export const STORAGE_KEY = 'platinum-road-gta6-v1';
export const APP_VERSION = 1;

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export const KINDS = [
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['robbery', 'Robbery'],
  ['exploration', 'Exploration'],
  ['combat', 'Combat'],
  ['money', 'Money'],
  ['completion', '100% completion'],
  ['misc', 'Miscellaneous'],
  ['platinum', 'Platinum'],
];

export const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story',
    note: 'Chapters 1 to 4 and the final mission. Keep a manual save at the start of every chapter — the game has no mission replay and 15 manual save slots plus one autosave. Do the Chapter 1 balcony meditation for Positive Mental Attitude before the chapter ends.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Stage 2 — Side strands & partners',
    note: 'Stranger mission strands and the partner trophies. Character switching opens after Breakfast Run in Chapter 2. Andy’s, Billy’s and Tyrone’s strands have their own trophies and do not count toward Strangers & Freaks. Watch for the time-sensitive Race Against Yago in Chapter 3.',
    ids: [22, 23, 24, 25, 26, 27, 29, 33, 34, 47],
  },
  {
    title: 'Stage 3 — Robberies',
    note: 'Jewelry stores open in Chapter 3 (Yasmani’s Jewelry Jobs gives you the Snap Gun); bank vaults open near the end of Chapter 4 (That’s Where The Money Is). Bring your partner to vault jobs — you cannot carry all the bags alone.',
    ids: [39, 40, 41, 43, 52],
  },
  {
    title: 'Stage 4 — Activities & exploration',
    note: 'The open-world grind: stunts, shooting range, drone races, meditation, hunting, vehicles and the odd hidden trophies. Meditation spots show as purple icons when you are close; bring your partner so each outdoor spot counts twice.',
    ids: [15, 16, 17, 18, 19, 20, 21, 28, 32, 35, 36, 37, 38, 42, 44, 45, 46, 48, 49, 50, 51],
  },
  {
    title: 'Stage 5 — Collectibles, money & 100%',
    note: 'Finish the card sets, buy the eight garages, register ten vehicles, then chase the 100% checklist (Progress, then Stats, then 100% Completion — it only appears after the story). The platinum pops last, on its own.',
    ids: [30, 31, 53, 54, 55, 14, 1],
  },
];

export const MISSABLE_WATCHOUTS = [
  {
    title: 'No mission replay, no New Game Plus',
    text: 'Once a story mission is done you cannot select it again. Keep one manual save at the start of each chapter and an untouched one from just before the final mission, and rotate the rest.',
  },
  {
    title: 'Race Against Yago is time-sensitive',
    text: 'This Chapter 3 race in Yago’s street-racing strand carries an hourglass icon. The strand counts toward Strangers & Freaks, so save first, then race the moment it appears.',
  },
  {
    title: 'Never use cheats on your trophy save',
    text: 'Cheats should switch off both trophies and saving. Keep a clean save for the platinum run.',
  },
  {
    title: 'Everything else stays open after the credits',
    text: 'Everything outside the story stays available after the credits, including the side-story finales and the 100% checklist. Only the Chapter 1 meditation can be missed.',
  },
];
