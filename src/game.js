/* ===== DONNÉES ===== */
const N = 56, HALF = N / 2;
const RARN = ['Départ', '★', '★★', '★★★', '★★★★'];
const RANGES = [1, 2, 3, 4, 99];
const CATC = ['#ffb454', '#ff7a8a', '#54d6a0', '#b08cff', '#5cb8ff', '#9aa7b5'];
const T = D.tiles.map((a, i) => ({
  id: i, model: a[0], name: a[1], cat: a[2], sub: a[3], subs: a[3].split(',').map(s => s.trim()), theme: a[4], s: a[5], cost: a[6],
  hab: a[7], money: a[8], capH: a[9], capM: a[10], mH: a[11], mM: a[12], bM: a[13], bH: a[14], vote: a[15], rlock: a[16], walk: a[17], rng: RANGES[a[5]]
}));
const ULT = T.length;
T.push({ id: ULT, model: 'VOXITY_Tower', name: 'Tour Voxity', cat: 0, sub: 'Monument', subs: ['Monument'], theme: -1, s: 4, cost: 150000, hab: 0, money: 0, capH: 0, capM: 0, mH: 0, mM: 0, bM: 0, bH: 0, vote: 0, rlock: 'LOCK', rng: 99, ult: true });
const TOTAL = ULT;             // nombre de stickers de l'Album (sans la tuile ultime)
const themeTiles = D.themes.map(() => []);
T.forEach(t => { if (t.theme >= 0) themeTiles[t.theme].push(t.id); });
const lowerCount = (th, s) => themeTiles[th].filter(i => T[i].s < s).length;
const SUBS = [0, 1, 2, 3, 4, 5].map(c => [...new Set(T.filter(t => t.cat === c && !t.ult && t.theme >= 0 || t.cat === c && c !== 5).flatMap(t => t.subs))].sort((a, b) => a.localeCompare(b, 'fr')));
const NOUN = { Education: 'une école', Institution: 'un bâtiment officiel', Public: 'un équipement public', Santé: 'un centre de santé', Agriculture: 'une exploitation agricole', Chantier: 'un chantier', Energie: 'une centrale d\'énergie', Fabrication: 'une usine', Technologie: 'un labo high-tech', Maison: 'une maison', Batiment: 'un immeuble', Villa: 'une villa', 'Gratte Ciel': 'un gratte-ciel', Résidence: 'une résidence', Divertissement: 'une attraction', Montagne: 'un coin de montagne', Nature: 'un espace nature', Plage: 'un coin de plage', Sport: 'un équipement sportif', Amplette: 'une boutique', Esthetique: 'un salon de beauté', Mobilier: 'un magasin de mobilier', Nourriture: 'un stand de nourriture', Restaurant: 'un restaurant', Maritime: 'un bateau', Aviation: 'un avion ou un hélicoptère', Ferroviaire: 'un train', Cyclisme: 'une piste cyclable', Route: 'un morceau de route', Chemin: 'un chemin', Autoroute: 'une autoroute', Pont: 'un pont', Elements: 'un élément de décor' };
const PRESTIGE = [{ n: 'Hameau', at: 0, p: 0 }, { n: 'Village', at: 150, p: 50 }, { n: 'Bourg', at: 600, p: 100 }, { n: 'Ville', at: 2000, p: 150 }, { n: 'Métropole', at: 5000, p: 200 }];
/* ===== ANTI-THÈMES ET DISSONANCES : plus la précision du conflit est grande, plus le malus est fort ===== */
const ANTI_THEMES = [['Industrie & Port', 'Plage & Baignade'], ['Industrie & Port', 'Luxe & Élégance'], ['Industrie & Port', 'Parcs urbains'], ['Industrie & Port', 'Maisons de charme'], ['Chantier & BTP', 'Maisons de charme'], ['Chantier & BTP', 'Parcs urbains'],
  ['Engins de chantier', 'Mariage & Fleurs'], ['Autoroute & Transit', 'Plein air & Camping'], ['Autoroute & Transit', 'Alpin & Chalets'], ['Circuit & Course', 'Santé & Médical'], ['Circuit & Course', 'École & Savoir'], ['Monster Trucks & Extrême', 'Maisons de charme'],
  ['Monster Trucks & Extrême', 'Zoo & Animaux'], ["Parc d'attractions", 'Santé & Médical'], ['Nuit & Jeux', 'École & Savoir'], ['Nuit & Jeux', 'Santé & Médical'], ['Énergie & Environnement', 'Essences & Bosquets'], ['Science & Espace', 'Rorbu & Pêche'],
  ['Aéroport & Aviation', 'Alpin & Chalets'], ['Aéroport & Aviation', 'Zoo & Animaux'], ['Aéroport & Aviation', 'Maisons de charme'], ['Gratte-ciels & Affaires', 'Rorbu & Pêche'], ['Gratte-ciels & Affaires', 'Alpin & Chalets'], ['Gratte-ciels & Affaires', 'Sumika'],
  ['Haussmannien', 'Tropical'], ['Tropical', 'Alpin & Chalets'], ['Montagne & Ski', 'Plage & Baignade'], ['Montagne & Ski', 'Tropical'], ['Montagne & Ski', 'Oasis & Orient'], ['Hacienda', 'Alpin & Chalets'], ['Moderne', 'Impérial'], ['Moderne', 'Haussmannien'],
  ['Ferme & Élevage', 'Gratte-ciels & Affaires'], ['Ferme & Élevage', 'Luxe & Élégance'], ['Zoo & Animaux', 'Street food & Livraison'], ['Trains & Gares', 'Plein air & Camping'], ['Métro & Tramway', 'Rorbu & Pêche'], ['Yachting & Voile', 'Industrie & Port'], ['Tourisme & Croisières', 'Industrie & Port'], ['Fêtes & Saisons', 'Santé & Médical']];
const ANTI_SUBS = [['Fabrication', 'Maison'], ['Fabrication', 'Villa'], ['Fabrication', 'Plage'], ['Fabrication', 'Nature'], ['Energie', 'Plage'], ['Energie', 'Nature'], ['Chantier', 'Education'], ['Chantier', 'Santé'], ['Chantier', 'Villa'], ['Agriculture', 'Gratte Ciel'],
  ['Divertissement', 'Santé'], ['Divertissement', 'Education'], ['Sport', 'Santé'], ['Montagne', 'Plage'], ['Autoroute', 'Plage'], ['Autoroute', 'Nature'], ['Aviation', 'Maison'], ['Aviation', 'Villa'], ['Aviation', 'Santé'], ['Aviation', 'Education'], ['Ferroviaire', 'Villa'], ['Restaurant', 'Agriculture']];
const ANTI_CATS = [[3, 2], [3, 0]];
const aT = D.themes.map(() => new Set()), aS = {}, aC = [0, 1, 2, 3, 4, 5].map(() => new Set());
ANTI_THEMES.forEach(([a, b]) => { const i = D.themes.indexOf(a), j = D.themes.indexOf(b); if (i >= 0 && j >= 0) { aT[i].add(j); aT[j].add(i); } });
ANTI_SUBS.forEach(([a, b]) => { (aS[a] = aS[a] || new Set()).add(b); (aS[b] = aS[b] || new Set()).add(a); });
ANTI_CATS.forEach(([a, b]) => { aC[a].add(b); aC[b].add(a); });
const _antiTile = {};
function antiTile(t) {
  if (t.theme < 0) return -1; if (_antiTile[t.id] !== undefined) return _antiTile[t.id];
  const pool = T.filter(x => !x.ult && aT[t.theme].has(x.theme));
  return _antiTile[t.id] = pool.length ? pool[hash32(t.model + 'a') % pool.length].id : -1;
}
const PEN = [0, .07, .14, .25, .40], MPOW = [0, .15, .3, .5, .75], KIND_LV = { cat: 1, sub: 2, theme: 3, tile: 4 }, LV_NAME = ['', 'catégorie', 'sous-catégorie', 'thème', 'tuile exacte'];
/* niveau de conflit entre deux tuiles : 4 tuile exacte, 3 thème, 2 sous-catégorie, 1 catégorie */
function conflict(a, b) {
  if (a.id === b.id || a.ult || b.ult) return 0;
  if (a.theme >= 0 && b.theme >= 0 && aT[a.theme].has(b.theme)) return (antiTile(a) === b.id || antiTile(b) === a.id) ? 4 : 3;
  for (const x of a.subs) { const s = aS[x]; if (s) for (const y of b.subs) if (s.has(y)) return 2; }
  if (aC[a.cat].has(b.cat) && !(S && S.mode !== 'simple' && (a.cat === 3 || b.cat === 3) && (a.cat === 0 || b.cat === 0))) return 1;
  return 0;
}
const normAnti = a => a == null || a === -1 ? null : (typeof a === 'number' ? { k: 'theme', v: a } : a);
function antiMatch(a, t) { a = normAnti(a); if (!a) return false; return a.k === 'tile' ? t.id === a.v : a.k === 'theme' ? t.theme === a.v : a.k === 'sub' ? t.subs.includes(a.v) : t.cat === a.v; }
function antiLabel(a) { a = normAnti(a); if (!a) return ''; const n = a.k === 'tile' ? T[a.v].name : a.k === 'theme' ? D.themes[a.v] : a.k === 'sub' ? a.v : D.cats[a.v]; return `${n} (${LV_NAME[KIND_LV[a.k]]})`; }
function pickAnti(tile) {
  const order = ['tile', 'theme', 'sub', 'cat'], r = Math.random(), start = r < .15 ? 0 : r < .5 ? 1 : r < .8 ? 2 : 3, rnd = a => a[Math.floor(Math.random() * a.length)];
  for (let i = start; i < 4; i++) {
    const k = order[i];
    if (k === 'tile') { const id = antiTile(tile); if (id >= 0) return { k, v: id }; }
    else if (k === 'theme') { const c = tile.theme >= 0 ? [...aT[tile.theme]] : []; if (c.length) return { k, v: rnd(c) }; }
    else if (k === 'sub') { const c = aS[tile.subs[0]] ? [...aS[tile.subs[0]]] : []; if (c.length) return { k, v: rnd(c) }; }
    else { const c = [...aC[tile.cat]]; return { k, v: c.length ? rnd(c) : rnd([0, 1, 2, 3, 4, 5].filter(x => x !== tile.cat)) }; }
  }
  return { k: 'cat', v: rnd([0, 1, 2, 3, 4, 5].filter(x => x !== tile.cat)) };
}
const BASE_CAPH = 15, BASE_CAPM = 1000;
const FIRST = ['Léa', 'Hugo', 'Inès', 'Maël', 'Camille', 'Noor', 'Yanis', 'Zoé', 'Tom', 'Aïcha', 'Louis', 'Manon', 'Elio', 'Sana', 'Jules', 'Rosa', 'Malo', 'Nina', 'Ravi', 'Clara', 'Théo', 'Mina', 'Oscar', 'Lila'];
const JOBS = ['pompier', 'boulangère', 'architecte', 'musicien', 'jardinière', 'pilote', 'cuisinier', 'professeure', 'mécanicien', 'photographe', 'explorateur', 'maire retraité', 'critique gastronomique', 'ingénieure', 'skipper', 'fleuriste'];
const BONUSES = [
  { id: 'tour', n: 'Afflux de touristes', ds: L => `Une foule de touristes visite la ville pendant 60 s`, d: L => `Revenus de pose +${[50, 100, 200][L - 1]} % pendant ${[40, 55, 75][L - 1]} s` },
  { id: 'spot', n: 'Coup de projecteur', ds: L => `+${L * 10} votes à la prochaine aide`, d: L => `Votes bonus immédiats` },
  { id: 'chan', n: 'Chantier solidaire', ds: L => `Inspiration : tous les indices pendant 5 min`, d: L => `Coûts −${[20, 35, 50][L - 1]} % pendant 60 s` },
  { id: 'bour', n: 'Bourse du quartier', ds: L => `+10 votes offerts`, d: L => `Argent immédiat (${[3, 6, 12][L - 1]} poses moyennes)` }];
const MALUS = [{ id: 'mood', n: 'Mécontentement', d: 'Points de vote des missions réduits' }, { id: 'strike', n: 'Grève', d: 'Revenus de pose réduits' }, { id: 'press', n: 'Mauvaise presse', d: 'Votes réduits' }, { id: 'tax', n: 'Taxe exceptionnelle', d: 'Coûts augmentés' }];

/* ===== ÉTAT ===== */
let SAVEKEY = 'voxity_save_v2_classic', started = false;
const SIG_ = T.length + ':' + T[0].model + ':' + T[T.length - 2].model;
try { localStorage.removeItem('voxity_save_v1'); } catch (e) { }
let S, placed = new Map(), agg, tot, prestige;
const keyOf = (x, y) => x + y * N;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const isSimple = () => S && S.mode === 'simple';
function newState(mode = 'classic') {
  return { mode, votes0: 0, extra: 0, crowdUntil: 0, hintUntil: 0, shieldUntil: 0, money: 250, cellMax: {}, allHints: false, lastGain: 0, subsidyAt: 0, votes: mode === 'simple' ? 0 : 20, owned: new Set(T.filter(t => t.s === 0 && !t.ult).map(t => t.id)), peak: 0, packs: 0, time: 0, rot: 0, sel: -1, recent: [], everPlaced: new Set(),
    mission: null, nextMission: mode === 'simple' ? 12 : 70, residents: [], archive: [], buffs: [], malus: null, speed: 1, won: false, uid: 1, destroy: false, seenIntro: false };
}
let noSave = false;
function save() {
  if (noSave || !started) return;
  try {
    localStorage.setItem(SAVEKEY, JSON.stringify({ v: 2, sig: SIG_, money: S.money, votes: S.votes, owned: [...S.owned], peak: S.peak, packs: S.packs, time: S.time, rot: S.rot, sel: S.sel, recent: S.recent,
      ever: [...S.everPlaced], mission: S.mission, nextMission: S.nextMission, residents: S.residents, archive: S.archive, buffs: S.buffs, malus: S.malus, speed: S.speed, won: S.won, uid: S.uid, extra: S.extra, crowdUntil: S.crowdUntil, hintUntil: S.hintUntil, shieldUntil: S.shieldUntil, cellMax: S.cellMax, allHints: S.allHints, lastGain: S.lastGain, subsidyAt: S.subsidyAt,
      placed: [...placed.values()].map(r => [r.t, r.x, r.y, r.rot, r.h, r.m, r.paid]) }));
  } catch (e) { }
}
function load(mode) {
  S = newState(mode);
  if (mode === 'classic') { try { const old = localStorage.getItem('voxity_save_v2'); if (old && !localStorage.getItem(SAVEKEY)) localStorage.setItem(SAVEKEY, old); } catch (e) { } }
  try {
    const j = JSON.parse(localStorage.getItem(SAVEKEY) || 'null'); if (!j || j.v !== 2 || j.sig !== SIG_ || j.placed.some(a => !T[a[0]]) || j.owned.some(i => !T[i])) return false;
    Object.assign(S, { money: j.money, votes: j.votes, owned: new Set(j.owned), peak: j.peak, packs: j.packs, time: j.time, rot: j.rot, sel: j.sel, recent: j.recent || [], everPlaced: new Set(j.ever),
      mission: j.mission, nextMission: j.nextMission, residents: j.residents || [], archive: j.archive || [], buffs: j.buffs || [], malus: j.malus, speed: j.speed || 1, won: j.won, uid: j.uid || 1, extra: j.extra || 0, crowdUntil: j.crowdUntil || 0, hintUntil: j.hintUntil || 0, shieldUntil: j.shieldUntil || 0, cellMax: j.cellMax || {}, allHints: !!j.allHints, lastGain: j.lastGain || 0, subsidyAt: j.subsidyAt || 0, seenIntro: true });
    j.placed.forEach(a => placed.set(keyOf(a[1], a[2]), { t: a[0], x: a[1], y: a[2], rot: a[3], h: a[4], m: a[5], paid: a[6] }));
    return true;
  } catch (e) { S = newState(mode); placed.clear(); return false; }
}

/* ===== CALCULS ===== */
function ownedByTheme() { const c = D.themes.map(() => 0); S.owned.forEach(i => { const th = T[i].theme; if (th >= 0) c[th]++; }); return c; }
function recalc() {
  agg = { luck: 0, attr: 0, rend: 0, pop: 0, eco: [0, 0, 0, 0, 0, 0], porte: new Set(), done: 0 };
  const ob = ownedByTheme();
  D.themeBonus.forEach((b, i) => {
    if (ob[i] < b.n) return; agg.done++;
    if (b.kind !== 'attr' && b.kind !== 'porte') agg.luck += b.val * .8;
    if (b.kind === 'attr') agg.attr += b.val; else if (b.kind === 'rend') agg.rend += b.val; else if (b.kind === 'pop') agg.pop += b.val;
    else if (b.kind === 'eco') agg.eco[b.ecoCat] = Math.min(.6, agg.eco[b.ecoCat] + b.val); else agg.porte.add(i);
  });
  tot = { h: 0, capH: BASE_CAPH, capM: BASE_CAPM, n: 0, rev: 0, nrev: 0 };
  placed.forEach(r => { const st = T[r.t]; tot.h += r.h; tot.capH += st.capH; tot.capM += st.capM; if (r.m > 0) { tot.rev += r.m; tot.nrev++; } if (st.cat !== 5) tot.n++; });
  if (albumDone()) tot.capM = Math.max(tot.capM, T[ULT].cost * 1.1);
  prestige = PRESTIGE.filter(p => pop() >= p.at).pop();
}
const albumDone = () => { let c = 0; S.owned.forEach(i => { if (i !== ULT) c++; }); return c >= TOTAL; };
const ownedCount = () => S.owned.size - (S.owned.has(ULT) ? 1 : 0);
const pop = () => isSimple() ? tot.h : Math.min(tot.h, tot.capH);
const now = () => S.time;
const activeBuff = id => S.buffs.filter(b => b.until > now() && b.id === id);
const malusOn = id => S.malus && S.malus.until > now() && S.malus.id === id;
const malusPow = id => malusOn(id) ? (S.malus.power || .5) : 0;
/* revenu moyen d'une pose rentable : sert aux bonus d'argent immédiats */
const avgRev = () => tot.nrev ? tot.rev / tot.nrev : 120;
const refundOf = rec => Math.floor(rec.paid / 10) * 5;
const r5 = x => Math.max(5, Math.round(x / 5) * 5);
const buffPct = id => activeBuff(id).reduce((a, b) => a + (b.pct || 0), 0);
function costOf(t) {
  if (isSimple()) return 0;
  if (t.ult) return t.cost;
  let pct = 0;                                  /* tous les pourcentages s'additionnent */
  if (t.cat !== 5) pct += Math.min(350, Math.floor(tot.n * 2 / 5));
  if (t.cat < 5) pct -= Math.round(agg.eco[t.cat] * 100);
  pct -= buffPct('chan'); pct += Math.round(80 * malusPow('tax'));
  return r5(t.cost * (100 + Math.max(-75, pct)) / 100);
}
const rangeOf = t => t.rng >= 99 ? 99 : t.rng + (t.theme >= 0 && agg.porte.has(t.theme) ? 1 : 0);
const packPrice = () => r5(isSimple() ? 5 + 10 * ownedCount() / TOTAL : 20 + 40 * ownedCount() / TOTAL);
const SYN_BASE = { 2: 2, 3: 3, 4: 5 };

function evaluate(t, x, y) {
  const r = { ok: true, errs: [], reqs: [], hab: 0, money: 0, mm: 1, hm: 1, adj: 0, cost: costOf(t), capNote: '' };
  if (x < 0 || y < 0 || x >= N || y >= N) { r.ok = false; r.errs.push('Hors de la carte'); return r; }
  if (placed.has(keyOf(x, y))) { r.ok = false; r.errs.push('Case occupée'); }
  if (S.money < r.cost) { r.ok = false; r.errs.push('Argent insuffisant'); }
  else if (r.cost > tot.capM) { r.ok = false; r.errs.push(`Plafond d'argent trop bas (${fmt(tot.capM)})`); }
  let bM = 0, mM = 0, bH = 0, mH = 0, sameTheme = 0, road = false, dpen = 0; const ditems = [];
  const tr = rangeOf(t);
  placed.forEach(rec => {
    const st = T[rec.t], d = Math.max(Math.abs(rec.x - x), Math.abs(rec.y - y));
    if (d <= 3) { const lv = conflict(t, st); if (lv) { const pi = Math.round(PEN[lv] * 100 * (d <= 1 ? 1 : d === 2 ? .6 : .3)) / 100; dpen += pi; ditems.push({ st, lv, d, pen: pi, x: rec.x, y: rec.y }); } }
    if (t.theme >= 0 && st.theme === t.theme && d <= tr) sameTheme++;
    if (st.cat === 5 && st.theme >= 0 && (st.bM || st.bH) && d <= 2) road = true;
    if (d > rangeOf(st)) return;
    switch (st.cat) {
      case 0: if (t.cat === 1) bM += st.bM; break;
      case 3: if (t.cat === 1 || t.cat === 2) bM += st.bM; if (t.cat === 0) mH += st.mH; break;
      case 4: if (t.cat === 0 || t.cat === 2) bH += st.bH; if (t.cat === 2) mM += st.mM; break;
      case 5: if (t.cat === 1 || t.cat === 2) bM += st.bM; if (t.cat === 0 || t.cat === 2) bH += st.bH; break;
    }
  });
  if (t.s >= 2 && t.theme >= 0) {
    const need = Math.min(SYN_BASE[t.s], lowerCount(t.theme, t.s));
    if (need > 0) { r.reqs.push({ label: `${need} tuile${need > 1 ? 's' : ''} « ${D.themes[t.theme]} » à portée`, ok: sameTheme >= need, have: sameTheme, need }); }
  }
  if (t.s >= 2 && t.cat < 5 && !t.ult) r.reqs.push({ label: 'Une route à 2 cases maximum', ok: road });
  r.synOK = r.reqs.length > 0 && r.reqs.every(q => q.ok);   /* synergies optionnelles : bonus, jamais un blocage */
  if (t.theme >= 0) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue; const o = placed.get(keyOf(x + dx, y + dy)); if (o && T[o.t].theme === t.theme) r.adj++;
  }
  dpen = Math.min(.75, Math.round(dpen * 100) / 100);
  const isM = t.cat === 1 || t.cat === 2, isH = t.cat === 0 || t.cat === 2;
  r.nearM = isM ? Math.round((bM - mM) * 100) : 0; r.nearH = isH ? Math.round((bH - mH) * 100) : 0;
  r.adjP = Math.min(64, 8 * r.adj); r.synP = r.synOK ? 25 : 0; r.disP = Math.round(dpen * 100);
  r.dis = { pen: dpen, items: ditems.sort((a, b) => b.lv - a.lv || b.pen - a.pen).slice(0, 4) };
  r.presP = t.cat === 2 ? prestige.p : 0; r.rendP = Math.round(agg.rend * 100); r.attrP = Math.round(agg.attr * 100);
  r.tourP = buffPct('tour'); r.strikeP = Math.round(100 * malusPow('strike'));
  /* bonus et malus s'additionnent (jamais de multiplication entre eux) */
  r.mPct = clamp(r.nearM + r.adjP + r.synP - r.disP + r.rendP + r.tourP - r.strikeP + r.presP, -75, 250);
  r.hPct = clamp(r.nearH + r.adjP + r.synP - r.disP + r.attrP + r.presP, -75, 250);
  r.money = !isSimple() && t.money > 0 ? r5(t.money / t.cost * r.cost * (100 + r.mPct) / 100) : 0;
  r.hab = Math.max(0, Math.round(t.hab * (100 + r.hPct) / 100));
  r.pay = Math.max(0, r.money - (S.cellMax[keyOf(x, y)] || 0)); r.net = r.pay - r.cost;
  return r;
}

/* ===== SCÈNE ===== */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
renderer.setClearColor(0x9fd6ee);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fd6ee, 90, 260);
const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -200, 400);
const cam = { x: 0, z: 0, yaw: Math.PI / 4, pitch: .62, view: 16 };
const hemi = new THREE.HemisphereLight(0xdcecff, 0x7f9a6a, .5); scene.add(hemi);
const fill = new THREE.DirectionalLight(0xb8d0ff, .25); fill.position.set(-30, 18, -24); scene.add(fill);
const sun = new THREE.DirectionalLight(0xfff0d6, .85);
sun.position.set(30, 50, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 140 }); sun.shadow.bias = -.0005; sun.shadow.radius = 3;
scene.add(sun);
/* terrain */
(function () {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#86bd70'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#7fb66a'; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
  const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(N / 2, N / 2); tx.magFilter = THREE.NearestFilter;
  const g = new THREE.Mesh(new THREE.BoxGeometry(N, 1.2, N), [mat(0x8a6a48), mat(0x8a6a48), new THREE.MeshLambertMaterial({ map: tx }), mat(0x8a6a48), mat(0x8a6a48), mat(0x8a6a48)]);
  g.position.y = -.6; g.receiveShadow = true; scene.add(g);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x5ab4dc }));
  water.rotation.x = -Math.PI / 2; water.position.y = -1.3; scene.add(water);
  const grid = new THREE.GridHelper(N, N, 0x000000, 0x000000); grid.material.opacity = .07; grid.material.transparent = true; grid.position.y = .005; scene.add(grid);
})();
const world = new THREE.Group(); scene.add(world);
const objs = new Map(), anim = new Set(), spinners = [];
const residentGroup = new THREE.Group(); scene.add(residentGroup);
const cellPos = (x, y) => new THREE.Vector3(x - HALF + .5, 0, y - HALF + .5);

function makeHolder(t, rot) {
  const h = new THREE.Group(), m = buildModel(t);
  h.add(m); h.rotation.y = (t.rlock === 'LOCK' ? 0 : t.rlock === 'FLIP' ? (rot % 2) * 2 : rot) * Math.PI / 2;
  h.traverse(o => { if (o.userData.spin || o.userData.spinY) spinners.push(o); });
  if (m.userData.smoke) h.userData.smoke = m.userData.smoke;
  return h;
}
function addObj(rec, animate) {
  const t = T[rec.t], h = makeHolder(t, rec.rot); h.position.copy(cellPos(rec.x, rec.y));
  if (animate) { h.scale.setScalar(.2); h.userData.t0 = performance.now(); anim.add(h); }
  world.add(h); objs.set(keyOf(rec.x, rec.y), h); renderer.shadowMap.needsUpdate = true; if (h.userData.smoke) smokers.set(keyOf(rec.x, rec.y), h);
}
function removeObj(k) { const h = objs.get(k); if (!h) return; world.remove(h); objs.delete(k); anim.delete(h); smokers.delete(k); renderer.shadowMap.needsUpdate = true; }

/* aperçu */
const marker = new THREE.Mesh(new THREE.PlaneGeometry(.98, .98), new THREE.MeshBasicMaterial({ color: 0x3ddbb0, transparent: true, opacity: .5, depthWrite: false }));
marker.rotation.x = -Math.PI / 2; marker.position.y = .08; marker.visible = false; scene.add(marker);
let ghost = null, ghostKey = '';
function setGhost() {
  if (ghost) { scene.remove(ghost); ghost = null; }
  ghostKey = '';
}
function updateGhost(cell) {
  const t = S.sel >= 0 ? T[S.sel] : null;
  if (!cell || S.destroy || !t || !S.owned.has(t.id)) { if (ghost) ghost.visible = false; return; }
  const k = t.id + ':' + S.rot;
  if (ghostKey !== k) {
    if (ghost) scene.remove(ghost);
    ghost = makeHolder(t, S.rot); ghostKey = k;
    ghost.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .62; o.castShadow = false; } });
    scene.add(ghost);
  }
  ghost.visible = true; ghost.position.copy(cellPos(cell.x, cell.y)); ghost.position.y = .02;
}

/* ===== CAMÉRA ===== */
function updateCamera() {
  const w = canvas.clientWidth, h = canvas.clientHeight, asp = w / h, v = cam.view;
  camera.left = -v * asp / 2; camera.right = v * asp / 2; camera.top = v / 2; camera.bottom = -v / 2; camera.updateProjectionMatrix();
  const cp = Math.cos(cam.pitch), sp_ = Math.sin(cam.pitch), D_ = 80;
  camera.position.set(cam.x + Math.sin(cam.yaw) * cp * D_, sp_ * D_, cam.z + Math.cos(cam.yaw) * cp * D_);
  if (cam.shake > 0) camera.position.add(new THREE.Vector3((Math.random() - .5) * cam.shake, (Math.random() - .5) * cam.shake, (Math.random() - .5) * cam.shake));
  camera.lookAt(cam.x, 0, cam.z); camera.updateMatrixWorld();
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; updateCamera(); }
addEventListener('resize', resize);
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitp = new THREE.Vector3();
function cellAt(px, py) {
  ndc.set(px / innerWidth * 2 - 1, -(py / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  if (!ray.ray.intersectPlane(plane, hitp)) return null;
  const x = Math.floor(hitp.x + HALF), y = Math.floor(hitp.z + HALF);
  return x < 0 || y < 0 || x >= N || y >= N ? null : { x, y };
}

/* ===== ACTIONS ===== */
function place(x, y) {
  const t = T[S.sel]; if (!t || !S.owned.has(t.id)) return false;
  const ev = evaluate(t, x, y);
  if (!ev.ok) { if (ev.errs.length) flash(ev.errs[0]); return false; }
  const rec = { t: t.id, x, y, rot: S.rot, h: ev.hab, m: ev.pay, paid: ev.cost };
  placed.set(keyOf(x, y), rec); addObj(rec, true);
  S.cellMax[keyOf(x, y)] = Math.max(S.cellMax[keyOf(x, y)] || 0, ev.money);
  if (!S.everPlaced.has(t.id)) { S.everPlaced.add(t.id); if (!isSimple()) S.votes += Math.round(t.vote * (100 + Math.round(agg.pop * 100)) / 100); }
  S.recent = [t.id, ...S.recent.filter(i => i !== t.id)].slice(0, 8);
  recalc(); S.money = Math.min(tot.capM, Math.max(0, S.money - ev.cost) + ev.pay); S.lastGain = ev.pay;
  settlePop(); sfx(t.s >= 3 ? 'rare' : 'place');
  placeFx(t, x, y, ev);
  if (S.mission && antiMatch(S.mission.anti, t)) { const lv = KIND_LV[normAnti(S.mission.anti).k]; if (isSimple()) simpleMalus(lv); else failMission(true, lv); }
  if (isSimple() && t.cat === 4) { S.malus = null; S.shieldUntil = now() + 180; toast('Service public : la ville est protégée des malus pendant 3 min.', 'gold'); }
  if (t.ult) win();
  uiDirty = true; return true;
}
function destroyAt(x, y) {
  const k = keyOf(x, y), rec = placed.get(k); if (!rec) return;
  S.money = Math.min(Math.max(S.money, tot.capM), S.money + refundOf(rec));
  const wp = cellPos(x, y); burst(wp.x, .2, wp.z, 0xb7b09c, 14, 1.4, .07, 6); burst(wp.x, .2, wp.z, 0x8a8f99, 6, .8, .09, 6); floatText(wp.x, .5, wp.z, '+' + fmt(refundOf(rec)) + ' $', 'gold'); cam.shake = Math.max(cam.shake || 0, .06);
  placed.delete(k); removeObj(k); recalc(); sfx('del');
  S.residents.forEach(r => { if (r.x === x && r.y === y) relocateResident(r); });
  uiDirty = true;
}
function settlePop() {
  const p = pop();
  if (p > S.peak) { if (!isSimple()) { S.vfrac = (S.vfrac || 0) + (p - S.peak) * (100 + Math.round(agg.pop * 100) - Math.round(100 * malusPow('press'))) / 100; const w = Math.floor(S.vfrac); S.votes += w; S.vfrac -= w; } S.peak = p; }
}

function placeFx(t, x, y, ev) {
  const wp = cellPos(x, y), col = hexOf(CATC[t.cat]);
  burst(wp.x, .15, wp.z, col, 12 + t.s * 7, 1.6 + t.s * .35, .055 + t.s * .01); ring(wp.x, wp.z, col, 1 + t.s * .25);
  if (ev.cost > 0) floatText(wp.x, .7, wp.z, '−' + fmt(ev.cost) + ' $', 'neg');
  if (ev.hab > 0) floatText(wp.x, .7, wp.z, '+' + f1(ev.hab) + ' hab.', 'pop', 140);
  if (ev.pay > 0) floatText(wp.x, .7, wp.z, '+' + fmt(ev.pay) + ' $', 'gold', 280);
  else if (ev.money > 0) floatText(wp.x, .7, wp.z, 'déjà perçu', 'neg', 280);
  if (ev.dis && ev.dis.pen > 0) { floatText(wp.x, .9, wp.z, 'Dissonance −' + Math.round(ev.dis.pen * 100) + ' %', 'neg', 420); ev.dis.items.forEach(i => { const q = cellPos(i.x, i.y); burst(q.x, .5, q.z, 0xff5a4a, 5 + i.lv * 2, .9, .045, 2); }); sfx('bad'); }
  if (t.s >= 3) { cam.shake = .12 + t.s * .05; pillar(wp.x, wp.z, col); burst(wp.x, .3, wp.z, 0xffc94a, 18, 2.2, .05); }
  if (t.s >= 4) flashScreen(CATC[t.cat]);
  if (t.theme >= 0) { /* adjacence : étincelles vers les voisines du même thème */ for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const o = placed.get(keyOf(x + dx, y + dy)); if ((dx || dy) && o && T[o.t].theme === t.theme) { const q = cellPos(x + dx, y + dy); burst(q.x, .5, q.z, 0xffe08a, 4, .7, .04, 2); } } }
}

/* ===== PACKS ===== */
const RW = [0, 1, .8, .5, .25];
function unlockTiles(out) {
  const doneBefore = ownedByTheme().map((c, i) => c >= D.themeBonus[i].n);
  out.forEach(t => S.owned.add(t.id));
  const doneNow = ownedByTheme().map((c, i) => c >= D.themeBonus[i].n);
  doneNow.forEach((d, i) => { if (d && !doneBefore[i]) setTimeout(() => { banner('Thème complété', `${D.themes[i]} · ${bonusLabel(D.themeBonus[i])}`, 'theme'); sfx('win'); }, 900 + i * 50); });
  if (albumDone() && !S.owned.has(ULT)) { S.owned.add(ULT); toast('Album complet ! La Tour Voxity est débloquée.', 'gold'); }
  recalc(); uiDirty = true;
}
/* mode simple : stickers offerts quand on aide un habitant (biaisés vers la catégorie et le thème demandés) */
function grantStickers(n, cat, theme) {
  const pool = T.filter(t => !t.ult && !S.owned.has(t.id)), out = [];
  for (let k = 0; k < n && pool.length; k++) {
    const w = pool.map(t => RW[t.s] * (t.cat === cat ? 2.5 : 1) * (theme >= 0 && t.theme === theme ? 3 : 1)), sum = w.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum, i = 0; for (; i < pool.length - 1; i++) { r -= w[i]; if (r <= 0) break; }
    out.push(pool[i]); pool.splice(i, 1);
  }
  if (out.length) unlockTiles(out);
  return out;
}
function simpleMalus(lv = 3) {
  const m = S.mission; if (!m) return; const pw = MPOW[lv];
  if (now() < S.shieldUntil) { toast(`${m.name} n'aime pas ce thème, mais la ville est protégée.`, 'info'); return; }
  if (S.malus && S.malus.until > now()) return;
  S.malus = { id: 'mood', until: now() + 60 + 120 * pw, power: pw }; toast(`${m.name} déteste ${antiLabel(m.anti)} : mécontentement, récompenses −${Math.round(pw * 100)} % pendant ${Math.round(60 + 120 * pw)} s. Un Service le calmerait.`, 'bad'); sfx('bad');
}
function drawPack(cat) {
  const price = packPrice(); if (S.votes < price) return null;
  let pool = T.filter(t => !t.ult && !S.owned.has(t.id) && t.cat === cat);
  if (!pool.length) return null;
  S.votes -= price; S.packs++;
  const out = [];
  for (let n = 0; n < 5 && pool.length; n++) {
    let sum = pool.reduce((a, t) => a + RW[t.s], 0), r = Math.random() * sum, i = 0;
    for (; i < pool.length - 1; i++) { r -= RW[pool[i].s]; if (r <= 0) break; }
    out.push(pool[i]); pool.splice(i, 1);
  }
  unlockTiles(out); sfx('pack');
  return out;
}

/* ===== HABITANTS SPÉCIAUX ===== */
const pick = a => a[Math.floor(Math.random() * a.length)];
function spawnMission() {
  const base = [...S.owned].map(i => T[i]).filter(t => (isSimple() || t.cat < 5) && !t.ult);
  const subs = [...new Set(base.flatMap(t => t.subs))].filter(s => NOUN[s]);
  const sub = pick(subs);
  const cands = base.filter(t => t.subs.includes(sub) && t.theme >= 0), tile = pick(cands.length ? cands : base.filter(t => t.subs.includes(sub)));
  const anti = Math.random() < .4 ? pickAnti(tile) : null;
  const name = pick(FIRST), job = pick(JOBS), hue = Math.floor(Math.random() * 360);
  S.mission = { id: S.uid++, name, job, hue, sub, theme: tile.theme, tile: tile.id, anti, until: isSimple() ? 1e12 : now() + 240, bonus: Math.floor(Math.random() * BONUSES.length) };
  toast(`${name}, ${job}, arrive en ville.`, 'info'); sfx('bell'); uiDirty = true;
}
function missionLevel() {
  const m = S.mission; if (!m) return { lv: 0 };
  let lv = 0, at = null;
  placed.forEach(r => {
    const t = T[r.t]; let l = 0;
    if (t.subs.includes(m.sub)) { l = 1; if (t.theme === m.theme && m.theme >= 0) l = 2; if (t.id === m.tile) l = 3; }
    if (l > lv) { lv = l; at = r; }
  });
  return { lv, at };
}
function archive(m, status, lv) { S.archive.unshift({ id: m.id, name: m.name, job: m.job, hue: m.hue, sub: m.sub, theme: m.theme, tile: m.tile, status, lv: lv || 0, bonus: m.bonus, at: Math.floor(S.time) }); S.archive = S.archive.slice(0, 200); }
function welcome() {
  const m = S.mission, { lv, at } = missionLevel(); if (!m || !lv) return;
  if (isSimple()) return welcomeSimple(m, lv, at);
  const votes = Math.round((6 + Math.round(Math.sqrt(pop()) * .8)) * [1, 2, 4][lv - 1] * (100 + Math.round(agg.pop * 100)) / 100), money = r5(Math.max(60 * lv, avgRev() * [2, 4, 8][lv - 1]));
  S.votes += votes; S.money = Math.min(Math.max(S.money, tot.capM), S.money + money);
  S.residents.push({ id: m.id, name: m.name, job: m.job, hue: m.hue, bonus: m.bonus, lv, x: at.x, y: at.y, ready: now() + 20 });
  archive(m, 'ok', lv); S.mission = null; S.nextMission = now() + 270 + Math.random() * 60;
  toast(`${m.name} s'installe ! +${fmt(votes)} votes, +${fmt(money)} $`, 'gold'); sfx('win'); rebuildResidents(); uiDirty = true;
  confetti(innerWidth / 2, innerHeight / 2, 80); { const q = cellPos(at.x, at.y); burst(q.x, .5, q.z, 0xffc94a, 24, 2, .06); ring(q.x, q.z, 0xffc94a, 1.6); }
}
function welcomeSimple(m, lv, at) {
  let v = [8, 16, 28][lv - 1] + (S.extra || 0) * 10; S.extra = 0;
  if (Math.random() < agg.luck) v += packPrice();
  const pw = malusPow('mood'); if (pw) v = Math.max(1, Math.round(v * (1 - pw)));
  S.votes += v;
  S.residents.push({ id: m.id, name: m.name, job: m.job, hue: m.hue, bonus: m.bonus, lv, x: at.x, y: at.y, ready: now() + 15 });
  archive(m, 'ok', lv); S.mission = null; S.nextMission = now() + 20 + Math.random() * 20;
  toast(`${m.name} s'installe ! +${v} points de vote`, 'gold'); sfx('win'); rebuildResidents(); uiDirty = true;
  confetti(innerWidth / 2, innerHeight / 2, 80); { const q = cellPos(at.x, at.y); burst(q.x, .5, q.z, 0xffc94a, 24, 2, .06); ring(q.x, q.z, 0xffc94a, 1.6); }
}
function failMission(angry, lv = 3) {
  const m = S.mission; if (!m) return;
  if (angry) {
    const free = !(S.malus && S.malus.until > now());
    if (free) { const mal = pick(MALUS.filter(x => x.id !== 'mood')), pw = MPOW[lv]; S.malus = { id: mal.id, until: now() + 60 + 120 * pw, power: pw }; toast(`${m.name} est furieux (${antiLabel(m.anti)}) : ${mal.n} −${Math.round(pw * 100)} % pendant ${Math.round(60 + 120 * pw)} s.`, 'bad'); }
    else toast(`${m.name} est furieux et s'en va.`, 'bad');
    sfx('bad');
  } else toast(`${m.name} est reparti(e).`, 'info');
  archive(m, angry ? 'angry' : 'left'); S.mission = null; S.nextMission = now() + 270 + Math.random() * 60; uiDirty = true;
}
function relocateResident(r) {
  const list = [...placed.values()].filter(p => T[p.t].cat < 5); if (!list.length) { r.x = r.y = Math.floor(N / 2); } else { const p = pick(list); r.x = p.x; r.y = p.y; }
  rebuildResidents();
}
function clickResident(r) {
  if (now() < r.ready) { flash(`${r.name} reviendra dans ${Math.ceil(r.ready - now())} s`); return; }
  const L = r.lv, b = BONUSES[r.bonus];
  if (isSimple()) {
    if (b.id === 'tour') { S.crowdUntil = now() + 60; toast('Afflux de touristes : la ville est en fête !', 'gold'); }
    else if (b.id === 'spot') { S.extra = (S.extra || 0) + L; toast(`Coup de projecteur : +${L * 10} votes à la prochaine aide`, 'gold'); }
    else if (b.id === 'chan') { S.hintUntil = now() + 300; missKey = ''; toast('Inspiration : tous les indices pendant 5 min', 'gold'); }
    else { S.votes += 10; toast('Cadeau du quartier : +10 votes', 'gold'); }
  } else if (b.id === 'tour') S.buffs.push({ id: 'tour', until: now() + [40, 55, 75][L - 1], pct: [50, 100, 200][L - 1], by: r.name });
  else if (b.id === 'chan') S.buffs.push({ id: 'chan', until: now() + 60, pct: [20, 35, 50][L - 1], by: r.name });
  else if (b.id === 'spot') { const v = Math.round((4 + Math.round(pop() * .03)) * L * (100 + Math.round(agg.pop * 100)) / 100); S.votes += v; toast(`Coup de projecteur : +${fmt(v)} votes`, 'gold'); }
  else { const g = r5(Math.max(60 * L, avgRev() * [3, 6, 12][L - 1])); S.money = Math.min(Math.max(S.money, tot.capM), S.money + g); toast(`Bourse du quartier : +${fmt(g)} $`, 'gold'); }
  if (b.id === 'tour' || b.id === 'chan') toast(`${r.name} : ${b.n} !`, 'gold');
  r.ready = now() + 240; sfx('win'); rebuildResidents(); uiDirty = true;
  { const q = cellPos(r.x, r.y); burst(q.x, .6, q.z, 0xffc94a, 22, 1.8, .06); ring(q.x, q.z, 0xffc94a, 1.4); pillar(q.x, q.z, 0xffc94a); floatText(q.x, 1, q.z, b.n, 'gold'); }
}
function rebuildResidents() {
  while (residentGroup.children.length) residentGroup.remove(residentGroup.children[0]);
  S.residents.forEach(r => {
    const g = mkCitizen(r.hue / 360, 1.05, true);
    const k = new THREE.Mesh(G.oct, glow(0xffc94a)); k.scale.set(.05, .075, .05); k.position.y = .62; k.name = 'mark'; g.add(k);
    const h = objs.get(keyOf(r.x, r.y)); let top = .1; if (h) { const b = new THREE.Box3().setFromObject(h); top = b.max.y + .02; }
    g.position.copy(cellPos(r.x, r.y)); g.position.y = top; g.userData.top = top; g.userData.res = r; residentGroup.add(g);
  });
}

/* ===== VICTOIRE / EFFETS ===== */
function win() { if (S.won) return; S.won = true; showWin(); sfx('win'); }
let actx = null;
function sfx(k) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const p = { place: [[520, .05], [660, .06]], del: [[300, .07]], pack: [[440, .08], [660, .08], [880, .12]], bell: [[880, .1], [1100, .12]], win: [[523, .1], [659, .1], [784, .18]], bad: [[200, .15], [150, .2]], rare: [[660, .07], [880, .07], [1320, .16]], click: [[600, .03]] }[k] || [];
    let t0 = actx.currentTime;
    p.forEach(([f, d]) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = k === 'bad' ? 'sawtooth' : 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.05, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + d); t0 += d * .8; });
  } catch (e) { }
}

/* ===== ENTRÉES ===== */
const mouse = { x: 0, y: 0, cell: null, btn: -1, lx: 0, ly: 0, moved: 0, last: -1 };
let menuOpen = () => false;
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
  if (!started) return;
  canvas.setPointerCapture(e.pointerId);
  mouse.btn = e.button; mouse.lx = e.clientX; mouse.ly = e.clientY; mouse.moved = 0; e.preventDefault();
  if (e.button === 0) {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const ch = ray.intersectObjects([iHead, iBody]);
    if (ch.length && ch[0].instanceId !== undefined) { pokeCitizen(ch[0].instanceId); mouse.btn = -1; return; }
    const hits = ray.intersectObjects(residentGroup.children, true);
    if (hits.length) { let o = hits[0].object; while (o && !o.userData.res) o = o.parent; if (o) { clickResident(o.userData.res); mouse.btn = -1; return; } }
    actOn(cellAt(e.clientX, e.clientY));
  }
});
function actOn(c) {
  if (!c) return; const k = keyOf(c.x, c.y); mouse.last = k;
  if (S.destroy) destroyAt(c.x, c.y); else if (S.sel >= 0) place(c.x, c.y); else flash('Choisissez une tuile avec Espace');
}
canvas.addEventListener('pointermove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  const dx = e.clientX - mouse.lx, dy = e.clientY - mouse.ly; mouse.lx = e.clientX; mouse.ly = e.clientY;
  if (mouse.btn === 2) {
    const k = cam.view / innerHeight, c = Math.cos(cam.yaw), s = Math.sin(cam.yaw), sp_ = Math.sin(cam.pitch);
    cam.x += -dx * k * c + dy * k / sp_ * -s; cam.z += dx * k * s + dy * k / sp_ * -c;
    cam.x = clamp(cam.x, -HALF, HALF); cam.z = clamp(cam.z, -HALF, HALF); updateCamera();
  } else if (mouse.btn === 1) { cam.yaw -= dx * .008; cam.pitch = clamp(cam.pitch + dy * .004, .35, 1.05); updateCamera(); }
  mouse.cell = cellAt(e.clientX, e.clientY);
  if (mouse.btn === 0 && mouse.cell && keyOf(mouse.cell.x, mouse.cell.y) !== mouse.last) actOn(mouse.cell);
});
canvas.addEventListener('pointerup', e => { mouse.btn = -1; mouse.last = -1; });
canvas.addEventListener('pointerleave', () => { mouse.cell = null; });
canvas.addEventListener('auxclick', e => e.preventDefault());
canvas.addEventListener('wheel', e => { e.preventDefault(); cam.view = clamp(cam.view * (e.deltaY > 0 ? 1.1 : .9), 5, 48); updateCamera(); }, { passive: false });
const keys = {};
addEventListener('keydown', e => {
  if (!started) return;
  if (/input|select|textarea/i.test(e.target.tagName)) { if (e.key === 'Escape') e.target.blur(); return; }
  keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); if (document.activeElement) document.activeElement.blur(); if (!menuOpen()) toggleTray(); }
  else if (e.code === 'Tab') { e.preventDefault(); S.destroy = !S.destroy; uiDirty = true; sfx('click'); }
  else if (e.code === 'Escape') toggleMenu();
  else if (e.key.toLowerCase() === 'q') { S.rot = (S.rot + 3) % 4; }
  else if (e.key.toLowerCase() === 'e') { S.rot = (S.rot + 1) % 4; }
  else if (/^Digit[1-8]$/.test(e.code) && !menuOpen()) { const id = S.recent[+e.code[5] - 1]; if (id != null) { selectTile(id); } }
});
addEventListener('keyup', e => { keys[e.code] = false; });
function selectTile(id) { S.sel = id; S.destroy = false; S.rot = 0; uiDirty = true; sfx('click'); }

/* ===== BOUCLE ===== */
let lastPrestige = '', uiDirty = true, last = performance.now(), hudT = 0, saveT = 0, missT = 0;
function tick(dt) {
  S.time += dt;
  if (!isSimple()) S.money = Math.min(S.money, Math.max(tot.capM, 0));
  /* filet de sécurité : sans argent pour poser une tuile qui rapporte, la ville reçoit une subvention (au plus toutes les 90 s) */
  if (!isSimple() && now() >= S.subsidyAt && Math.floor(now() * 2) % 4 === 0) {
    let mn = Infinity; S.owned.forEach(i => { const t = T[i]; if (t.money > 0) mn = Math.min(mn, costOf(t)); });
    if (mn < Infinity && S.money < mn) { S.money = Math.min(tot.capM, mn); S.subsidyAt = now() + 90; toast(`Subvention municipale : +${fmt(mn)} $ pour relancer la ville.`, 'gold'); sfx('win'); }
  }
  settlePop();
  if (!isSimple() && lastPrestige && prestige.n !== lastPrestige) { if (prestige.at > 0 && PRESTIGE.findIndex(p => p.n === prestige.n) > PRESTIGE.findIndex(p => p.n === lastPrestige)) { banner(prestige.n, `Loisirs +${prestige.p} %`, 'level'); sfx('win'); } }
  lastPrestige = prestige.n;
  S.buffs = S.buffs.filter(b => b.until > now());
  if (S.malus && S.malus.until <= now()) S.malus = null;
  if (!S.mission && now() >= S.nextMission) spawnMission();
  else if (S.mission && !isSimple() && now() > S.mission.until) failMission(false);
}
function frame(tm) {
  const rdt = Math.min(.1, (tm - last) / 1000); last = tm;
  if (!started) { S.time = 0; cam.yaw += rdt * .06; cam.view = 21; cam.x = Math.sin(cam.yaw) * 8; cam.z = Math.cos(cam.yaw) * 8; updateCamera(); fxUpdate(rdt, performance.now()); renderer.render(scene, camera); requestAnimationFrame(frame); return; }
  if (!menuOpen() || true) tick(rdt * S.speed);
  // déplacement clavier
  if (!menuOpen()) {
    const sp_ = cam.view * rdt * .9; let mx = 0, mz = 0;
    if (keys.ArrowUp) mz -= 1; if (keys.ArrowDown) mz += 1; if (keys.ArrowLeft) mx -= 1; if (keys.ArrowRight) mx += 1;
    if (mx || mz) { const c = Math.cos(cam.yaw), s = Math.sin(cam.yaw); cam.x = clamp(cam.x + (mx * c + mz * s) * sp_, -HALF, HALF); cam.z = clamp(cam.z + (-mx * s + mz * c) * sp_, -HALF, HALF); updateCamera(); }
  }
  // animations
  const tn = performance.now();
  anim.forEach(h => { const a = (tn - h.userData.t0) / 260; if (a >= 1) { h.scale.setScalar(1); anim.delete(h); } else { const e = 1 - Math.pow(1 - a, 3); h.scale.setScalar(.2 + .8 * e + Math.sin(a * Math.PI) * .12); } });
  spinners.forEach(o => { if (o.userData.spin) o.rotation.z += rdt * 1.2; if (o.userData.spinY) o.rotation.z += rdt * .8; });
  residentGroup.children.forEach(g => { const m = g.getObjectByName('mark'), r = g.userData.res, rdy = now() >= r.ready; if (m) { m.visible = rdy; m.rotation.y += rdt * 2; m.position.y = .62 + Math.sin(tn / 300) * .04; } g.position.y = g.userData.top + (rdy ? Math.abs(Math.sin(tn / 260)) * .07 : 0); g.userData.inner.rotation.y = Math.sin(tn / 1200) * .6; });
  fxUpdate(rdt, tn); animateHUD(rdt); tutoUpdate(rdt);
  marker.material.opacity = .42 + Math.sin(tn / 180) * .14; if (ghost && ghost.visible) ghost.position.y = .03 + Math.abs(Math.sin(tn / 320)) * .05;
  // survol
  if (mouse.cell) {
    const c = mouse.cell, t = S.sel >= 0 ? T[S.sel] : null;
    marker.visible = true; marker.position.x = c.x - HALF + .5; marker.position.z = c.y - HALF + .5;
    if (S.destroy) { marker.material.color.setHex(placed.has(keyOf(c.x, c.y)) ? 0xff4d5e : 0x888888); updateGhost(null); }
    else if (t) { const ev = evaluate(t, c.x, c.y); marker.material.color.setHex(ev.ok ? (ev.dis && ev.dis.pen > 0 ? 0xffa94d : 0x3ddbb0) : 0xff4d5e); updateGhost(c); infoFor(t, ev, c); }
    else { marker.material.color.setHex(0xffffff); updateGhost(null); infoFor(null); }
    if (S.destroy || !t) infoFor(null, null, c);
  } else { marker.visible = false; updateGhost(null); infoFor(null); }
  hudT += rdt; if (hudT > .25 || uiDirty) { hudT = 0; refreshHUD(); uiDirty = false; }
  saveT += rdt; if (saveT > 6) { saveT = 0; save(); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

const demoGroup = new THREE.Group(); scene.add(demoGroup);
function buildDemo() {
  /* ville de démonstration pour l'écran de départ (n'existe pas dans la partie) */
  const ids = D.themes.map((_, i) => sigTile(i)).filter(Boolean);
  for (let i = 0; i < 100; i++) {
    const t = ids[(i * 7 + 3) % ids.length], x = i % 10, y = Math.floor(i / 10), h = makeHolder(t, 0);
    h.position.copy(cellPos(23 + x, 23 + y)); demoGroup.add(h);
  }
  renderer.shadowMap.needsUpdate = true;
}
function startGame(mode, fresh, opts) {
  const tuto = !!(opts && opts.tuto);
  SAVEKEY = 'voxity_save_v2_' + mode; noSave = tuto;
  if (fresh && !tuto) { try { localStorage.removeItem(SAVEKEY); } catch (e) { } }
  scene.remove(demoGroup); placed.clear();
  const had = tuto ? (S = newState(mode), false) : load(mode); S.mode = mode;
  if (tuto) { S.money = 500; S.votes = 45; S.nextMission = 1e12; } recalc(); lastPrestige = prestige.n;
  placed.forEach(r => addObj(r, false)); rebuildResidents(); renderer.shadowMap.needsUpdate = true;
  cam.x = 0; cam.z = 0; cam.view = 16; cam.yaw = Math.PI / 4; updateCamera();
  document.body.classList.toggle('simple', mode === 'simple'); document.body.classList.add('playing');
  DV.init = false; started = true; uiDirty = true; missKey = ''; selKey = '';
  hideStart();
  if (!had) { openTray(); toast(mode === 'simple' ? 'Placez librement des tuiles. Un habitant va bientôt arriver avec une demande.' : 'Choisissez une tuile, puis clic gauche pour construire.', 'info'); }
  save(); if (tuto) { closeTray(); startTuto(mode); }
}
function boot() {
  S = newState('classic'); recalc();
  resize(); updateCamera(); setGhost(); buildUI(); buildDemo(); showStart();
  requestAnimationFrame(frame);
  addEventListener('beforeunload', () => { if (started) save(); });
  try { const a = sessionStorage.getItem('vx_auto'); if (a) { sessionStorage.removeItem('vx_auto'); const [m, k] = a.split(':'); setTimeout(() => startGame(m, k === 'fresh'), 50); } } catch (e) { }
}
