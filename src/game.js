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
T.push({ id: ULT, model: 'VOXITY_Tower', name: 'Tour Voxity', cat: 0, sub: 'Monument', subs: ['Monument'], theme: -1, s: 4, cost: 400000, hab: 0, money: 0, capH: 0, capM: 0, mH: 0, mM: 0, bM: 0, bH: 0, vote: 0, rlock: 'LOCK', rng: 99, ult: true });
const TOTAL = ULT;             // nombre de stickers de l'Album (sans la tuile ultime)
const themeTiles = D.themes.map(() => []);
T.forEach(t => { if (t.theme >= 0) themeTiles[t.theme].push(t.id); });
const lowerCount = (th, s) => themeTiles[th].filter(i => T[i].s < s).length;
const SUBS = [0, 1, 2, 3, 4, 5].map(c => [...new Set(T.filter(t => t.cat === c && !t.ult && t.theme >= 0 || t.cat === c && c !== 5).flatMap(t => t.subs))].sort((a, b) => a.localeCompare(b, 'fr')));
const NOUN = { Education: 'une école', Institution: 'un bâtiment officiel', Public: 'un équipement public', Santé: 'un centre de santé', Agriculture: 'une exploitation agricole', Chantier: 'un chantier', Energie: 'une centrale d\'énergie', Fabrication: 'une usine', Technologie: 'un labo high-tech', Maison: 'une maison', Batiment: 'un immeuble', Villa: 'une villa', 'Gratte Ciel': 'un gratte-ciel', Résidence: 'une résidence', Divertissement: 'une attraction', Montagne: 'un coin de montagne', Nature: 'un espace nature', Plage: 'un coin de plage', Sport: 'un équipement sportif', Amplette: 'une boutique', Esthetique: 'un salon de beauté', Mobilier: 'un magasin de mobilier', Nourriture: 'un stand de nourriture', Restaurant: 'un restaurant' };
const PRESTIGE = [{ n: 'Hameau', at: 0, m: 1 }, { n: 'Village', at: 150, m: 1.5 }, { n: 'Bourg', at: 600, m: 2 }, { n: 'Ville', at: 2000, m: 2.5 }, { n: 'Métropole', at: 5000, m: 3 }];
const BASE_CAPH = 15, BASE_CAPM = 1000;
const FIRST = ['Léa', 'Hugo', 'Inès', 'Maël', 'Camille', 'Noor', 'Yanis', 'Zoé', 'Tom', 'Aïcha', 'Louis', 'Manon', 'Elio', 'Sana', 'Jules', 'Rosa', 'Malo', 'Nina', 'Ravi', 'Clara', 'Théo', 'Mina', 'Oscar', 'Lila'];
const JOBS = ['pompier', 'boulangère', 'architecte', 'musicien', 'jardinière', 'pilote', 'cuisinier', 'professeure', 'mécanicien', 'photographe', 'explorateur', 'maire retraité', 'critique gastronomique', 'ingénieure', 'skipper', 'fleuriste'];
const BONUSES = [
  { id: 'tour', n: 'Afflux de touristes', d: L => `Revenus ×${[1.5, 2, 3][L - 1]} pendant ${[40, 55, 75][L - 1]} s` },
  { id: 'spot', n: 'Coup de projecteur', d: L => `Votes bonus immédiats (×${L})` },
  { id: 'chan', n: 'Chantier solidaire', d: L => `Coûts −${[20, 35, 50][L - 1]} % pendant 60 s` },
  { id: 'bour', n: 'Bourse du quartier', d: L => `Argent immédiat (${[60, 120, 240][L - 1]} s de revenus)` }];
const MALUS = [{ id: 'strike', n: 'Grève', d: 'Revenus −50 %' }, { id: 'press', n: 'Mauvaise presse', d: 'Plus de votes' }, { id: 'tax', n: 'Taxe exceptionnelle', d: 'Coûts +40 %' }];

/* ===== ÉTAT ===== */
const SAVEKEY = 'voxity_save_v1';
let S, placed = new Map(), agg, tot, prestige;
const keyOf = (x, y) => x + y * N;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function newState() {
  return { money: 500, votes: 20, owned: new Set(T.filter(t => t.s === 0 && !t.ult).map(t => t.id)), peak: 0, packs: 0, time: 0, rot: 0, sel: -1, recent: [], everPlaced: new Set(),
    mission: null, nextMission: 70, residents: [], archive: [], buffs: [], malus: null, speed: 1, won: false, uid: 1, destroy: false, seenIntro: false };
}
function save() {
  try {
    localStorage.setItem(SAVEKEY, JSON.stringify({ v: 1, money: S.money, votes: S.votes, owned: [...S.owned], peak: S.peak, packs: S.packs, time: S.time, rot: S.rot, sel: S.sel, recent: S.recent,
      ever: [...S.everPlaced], mission: S.mission, nextMission: S.nextMission, residents: S.residents, archive: S.archive, buffs: S.buffs, malus: S.malus, speed: S.speed, won: S.won, uid: S.uid,
      placed: [...placed.values()].map(r => [r.t, r.x, r.y, r.rot, r.h, r.m, r.paid]) }));
  } catch (e) { }
}
function load() {
  S = newState();
  try {
    const j = JSON.parse(localStorage.getItem(SAVEKEY) || 'null'); if (!j) return false;
    Object.assign(S, { money: j.money, votes: j.votes, owned: new Set(j.owned), peak: j.peak, packs: j.packs, time: j.time, rot: j.rot, sel: j.sel, recent: j.recent || [], everPlaced: new Set(j.ever),
      mission: j.mission, nextMission: j.nextMission, residents: j.residents || [], archive: j.archive || [], buffs: j.buffs || [], malus: j.malus, speed: j.speed || 1, won: j.won, uid: j.uid || 1, seenIntro: true });
    j.placed.forEach(a => placed.set(keyOf(a[1], a[2]), { t: a[0], x: a[1], y: a[2], rot: a[3], h: a[4], m: a[5], paid: a[6] }));
    return true;
  } catch (e) { S = newState(); placed.clear(); return false; }
}

/* ===== CALCULS ===== */
function ownedByTheme() { const c = D.themes.map(() => 0); S.owned.forEach(i => { const th = T[i].theme; if (th >= 0) c[th]++; }); return c; }
function recalc() {
  agg = { attr: 0, rend: 0, pop: 0, eco: [0, 0, 0, 0, 0, 0], porte: new Set(), done: 0 };
  const ob = ownedByTheme();
  D.themeBonus.forEach((b, i) => {
    if (ob[i] < b.n) return; agg.done++;
    if (b.kind === 'attr') agg.attr += b.val; else if (b.kind === 'rend') agg.rend += b.val; else if (b.kind === 'pop') agg.pop += b.val;
    else if (b.kind === 'eco') agg.eco[b.ecoCat] = Math.min(.6, agg.eco[b.ecoCat] + b.val); else agg.porte.add(i);
  });
  tot = { h: 0, capH: BASE_CAPH, capM: BASE_CAPM, mOther: 0, mFun: 0, n: 0 };
  placed.forEach(r => { const st = T[r.t]; tot.h += r.h; tot.capH += st.capH; tot.capM += st.capM; if (st.cat === 2) tot.mFun += r.m; else tot.mOther += r.m; if (st.cat !== 5) tot.n++; });
  if (albumDone()) tot.capM = Math.max(tot.capM, T[ULT].cost * 1.1);
  prestige = PRESTIGE.filter(p => pop() >= p.at).pop();
}
const albumDone = () => { let c = 0; S.owned.forEach(i => { if (i !== ULT) c++; }); return c >= TOTAL; };
const ownedCount = () => S.owned.size - (S.owned.has(ULT) ? 1 : 0);
const pop = () => Math.min(tot.h, tot.capH);
const now = () => S.time;
const activeBuff = id => S.buffs.filter(b => b.until > now() && b.id === id);
const malusOn = id => S.malus && S.malus.until > now() && S.malus.id === id;
function income() {
  let m = (1 + tot.mOther + tot.mFun * prestige.m) * (1 + agg.rend);
  activeBuff('tour').forEach(b => m *= b.mult);
  if (malusOn('strike')) m *= .5;
  return m;
}
function costMult() { let m = 1; activeBuff('chan').forEach(b => m *= b.mult); if (malusOn('tax')) m *= 1.4; return m; }
function costOf(t) {
  if (t.ult) return t.cost;
  let c = t.cost;
  if (t.cat !== 5) c *= 1 + Math.min(3.5, .004 * tot.n);
  if (t.cat < 5) c *= 1 - agg.eco[t.cat];
  return Math.max(1, Math.round(c * costMult()));
}
const rangeOf = t => t.rng >= 99 ? 99 : t.rng + (t.theme >= 0 && agg.porte.has(t.theme) ? 1 : 0);
const packPrice = kind => Math.round((25 + ownedCount() / 50) * (kind === 'cat' ? 1.4 : kind === 'theme' ? 1.8 : 1));
const SYN_BASE = { 2: 2, 3: 3, 4: 5 };

function evaluate(t, x, y) {
  const r = { ok: true, errs: [], reqs: [], hab: 0, money: 0, mm: 1, hm: 1, adj: 0, cost: costOf(t), capNote: '' };
  if (x < 0 || y < 0 || x >= N || y >= N) { r.ok = false; r.errs.push('Hors de la carte'); return r; }
  if (placed.has(keyOf(x, y))) { r.ok = false; r.errs.push('Case occupée'); }
  if (S.money < r.cost) { r.ok = false; r.errs.push('Argent insuffisant'); }
  else if (r.cost > tot.capM) { r.ok = false; r.errs.push(`Plafond d'argent trop bas (${fmt(tot.capM)})`); }
  let bM = 0, mM = 0, bH = 0, mH = 0, sameTheme = 0, road = false;
  const tr = rangeOf(t);
  placed.forEach(rec => {
    const st = T[rec.t], d = Math.max(Math.abs(rec.x - x), Math.abs(rec.y - y));
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
  if (r.reqs.some(q => !q.ok)) { r.ok = false; r.errs.push('Synergies manquantes'); }
  if (t.theme >= 0) for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue; const o = placed.get(keyOf(x + dx, y + dy)); if (o && T[o.t].theme === t.theme) r.adj++;
  }
  const adjM = 1 + Math.min(.64, .08 * r.adj);
  r.mm = clamp(1 + bM - mM, .25, 3.5); r.hm = clamp(1 + bH - mH, .25, 3.5); r.adjM = adjM;
  r.money = t.money * ((t.cat === 1 || t.cat === 2) ? r.mm : 1) * adjM;
  r.hab = t.hab * ((t.cat === 0 || t.cat === 2) ? r.hm : 1) * adjM * (1 + agg.attr) * (t.cat === 2 ? prestige.m : 1);
  r.hab = Math.round(r.hab * 10) / 10; r.money = Math.round(r.money * 100) / 100;
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
scene.add(new THREE.HemisphereLight(0xffffff, 0x9bb59a, .85));
const sun = new THREE.DirectionalLight(0xfff3dc, .75);
sun.position.set(30, 50, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 140 }); sun.shadow.bias = -.0006;
scene.add(sun);
/* terrain */
(function () {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#8fc977'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#87c070'; x.fillRect(0, 0, 32, 32); x.fillRect(32, 32, 32, 32);
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
  S.money -= ev.cost;
  const rec = { t: t.id, x, y, rot: S.rot, h: ev.hab, m: ev.money, paid: ev.cost };
  placed.set(keyOf(x, y), rec); addObj(rec, true);
  if (!S.everPlaced.has(t.id)) { S.everPlaced.add(t.id); S.votes += t.vote * (1 + agg.pop); }
  S.recent = [t.id, ...S.recent.filter(i => i !== t.id)].slice(0, 8);
  recalc(); settlePop(); sfx(t.s >= 3 ? 'rare' : 'place');
  placeFx(t, x, y, ev);
  if (S.mission && S.mission.anti >= 0 && t.theme === S.mission.anti) failMission(true);
  if (t.ult) win();
  uiDirty = true; return true;
}
function destroyAt(x, y) {
  const k = keyOf(x, y), rec = placed.get(k); if (!rec) return;
  S.money = Math.min(Math.max(S.money, tot.capM), S.money + Math.floor(rec.paid * .5));
  const wp = cellPos(x, y); burst(wp.x, .2, wp.z, 0xb7b09c, 14, 1.4, .07, 6); burst(wp.x, .2, wp.z, 0x8a8f99, 6, .8, .09, 6); floatText(wp.x, .5, wp.z, '+' + fmt(rec.paid * .5) + ' $', 'gold'); cam.shake = Math.max(cam.shake || 0, .06);
  placed.delete(k); removeObj(k); recalc(); sfx('del');
  S.residents.forEach(r => { if (r.x === x && r.y === y) relocateResident(r); });
  uiDirty = true;
}
function settlePop() {
  const p = pop();
  if (p > S.peak) { S.votes += (p - S.peak) * (1 + agg.pop) * (malusOn('press') ? 0 : 1); S.peak = p; }
}

function placeFx(t, x, y, ev) {
  const wp = cellPos(x, y), col = hexOf(CATC[t.cat]);
  burst(wp.x, .15, wp.z, col, 12 + t.s * 7, 1.6 + t.s * .35, .055 + t.s * .01); ring(wp.x, wp.z, col, 1 + t.s * .25);
  floatText(wp.x, .7, wp.z, '−' + fmt(ev.cost) + ' $', 'neg');
  if (ev.hab > 0) floatText(wp.x, .7, wp.z, '+' + f1(ev.hab) + ' hab.', 'pop', 140);
  if (ev.money > 0) floatText(wp.x, .7, wp.z, '+' + f1(ev.money) + ' $/s', 'gold', 280);
  if (t.s >= 3) { cam.shake = .12 + t.s * .05; pillar(wp.x, wp.z, col); burst(wp.x, .3, wp.z, 0xffc94a, 18, 2.2, .05); }
  if (t.s >= 4) flashScreen(CATC[t.cat]);
  if (t.theme >= 0) { /* adjacence : étincelles vers les voisines du même thème */ for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const o = placed.get(keyOf(x + dx, y + dy)); if ((dx || dy) && o && T[o.t].theme === t.theme) { const q = cellPos(x + dx, y + dy); burst(q.x, .5, q.z, 0xffe08a, 4, .7, .04, 2); } } }
}

/* ===== PACKS ===== */
const RW = [0, 1, .8, .5, .25];
function drawPack(kind, key) {
  const price = packPrice(kind); if (S.votes < price) return null;
  let pool = T.filter(t => !t.ult && !S.owned.has(t.id));
  if (kind === 'cat') pool = pool.filter(t => t.cat === key); else if (kind === 'theme') pool = pool.filter(t => t.theme === key);
  if (!pool.length) return null;
  S.votes -= price; S.packs++;
  const out = [];
  for (let n = 0; n < 5 && pool.length; n++) {
    let sum = pool.reduce((a, t) => a + RW[t.s], 0), r = Math.random() * sum, i = 0;
    for (; i < pool.length - 1; i++) { r -= RW[pool[i].s]; if (r <= 0) break; }
    out.push(pool[i]); pool.splice(i, 1);
  }
  const doneBefore = ownedByTheme().map((c, i) => c >= D.themeBonus[i].n);
  out.forEach(t => S.owned.add(t.id));
  const doneNow = ownedByTheme().map((c, i) => c >= D.themeBonus[i].n);
  doneNow.forEach((d, i) => { if (d && !doneBefore[i]) setTimeout(() => { banner('Thème complété', `${D.themes[i]} · ${bonusLabel(D.themeBonus[i])}`, 'theme'); sfx('win'); }, 900 + i * 50); });
  if (albumDone() && !S.owned.has(ULT)) { S.owned.add(ULT); toast('Album complet ! La Tour Voxity est débloquée.', 'gold'); }
  recalc(); uiDirty = true; sfx('pack');
  return out;
}

/* ===== HABITANTS SPÉCIAUX ===== */
const pick = a => a[Math.floor(Math.random() * a.length)];
function spawnMission() {
  const base = [...S.owned].map(i => T[i]).filter(t => t.cat < 5 && !t.ult);
  const subs = [...new Set(base.flatMap(t => t.subs))].filter(s => NOUN[s]);
  const sub = pick(subs);
  const cands = T.filter(t => t.cat < 5 && !t.ult && t.subs.includes(sub));
  const un = cands.filter(t => !S.owned.has(t.id)), tile = (un.length && Math.random() < .45) ? pick(un) : pick(cands);
  let anti = -1;
  if (Math.random() < .35) { do { anti = Math.floor(Math.random() * D.themes.length); } while (anti === tile.theme); }
  const name = pick(FIRST), job = pick(JOBS), hue = Math.floor(Math.random() * 360);
  S.mission = { id: S.uid++, name, job, hue, sub, theme: tile.theme, tile: tile.id, anti, until: now() + 240, bonus: Math.floor(Math.random() * BONUSES.length) };
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
  const votes = Math.ceil((6 + Math.sqrt(pop()) * .8) * [1, 2, 4][lv - 1] * (1 + agg.pop)), money = Math.max(200 * lv, income() * [40, 90, 200][lv - 1]);
  S.votes += votes; S.money = Math.min(Math.max(S.money, tot.capM), S.money + money);
  S.residents.push({ id: m.id, name: m.name, job: m.job, hue: m.hue, bonus: m.bonus, lv, x: at.x, y: at.y, ready: now() + 20 });
  archive(m, 'ok', lv); S.mission = null; S.nextMission = now() + 270 + Math.random() * 60;
  toast(`${m.name} s'installe ! +${fmt(votes)} votes, +${fmt(money)} $`, 'gold'); sfx('win'); rebuildResidents(); uiDirty = true;
  confetti(innerWidth / 2, innerHeight / 2, 80); { const q = cellPos(at.x, at.y); burst(q.x, .5, q.z, 0xffc94a, 24, 2, .06); ring(q.x, q.z, 0xffc94a, 1.6); }
}
function failMission(angry) {
  const m = S.mission; if (!m) return;
  if (angry) {
    const free = !(S.malus && S.malus.until > now());
    if (free) { const mal = pick(MALUS); S.malus = { id: mal.id, until: now() + 90 }; toast(`${m.name} est furieux : ${mal.n} (${mal.d}) pendant 90 s.`, 'bad'); }
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
  if (b.id === 'tour') S.buffs.push({ id: 'tour', until: now() + [40, 55, 75][L - 1], mult: [1.5, 2, 3][L - 1], by: r.name });
  else if (b.id === 'chan') S.buffs.push({ id: 'chan', until: now() + 60, mult: 1 - [.2, .35, .5][L - 1], by: r.name });
  else if (b.id === 'spot') { const v = Math.ceil((4 + pop() * .03) * L * (1 + agg.pop)); S.votes += v; toast(`Coup de projecteur : +${fmt(v)} votes`, 'gold'); }
  else { const g = Math.max(150 * L, income() * [60, 120, 240][L - 1]); S.money = Math.min(Math.max(S.money, tot.capM), S.money + g); toast(`Bourse du quartier : +${fmt(g)} $`, 'gold'); }
  if (b.id === 'tour' || b.id === 'chan') toast(`${r.name} : ${b.n} !`, 'gold');
  r.ready = now() + 240; sfx('win'); rebuildResidents(); uiDirty = true;
  { const q = cellPos(r.x, r.y); burst(q.x, .6, q.z, 0xffc94a, 22, 1.8, .06); ring(q.x, q.z, 0xffc94a, 1.4); pillar(q.x, q.z, 0xffc94a); floatText(q.x, 1, q.z, b.n, 'gold'); }
}
function rebuildResidents() {
  while (residentGroup.children.length) residentGroup.remove(residentGroup.children[0]);
  S.residents.forEach(r => {
    const g = mkCitizen(r.hue / 360, 2.1, true);
    const k = new THREE.Mesh(G.oct, glow(0xffc94a)); k.scale.set(.07, .1, .07); k.position.y = 1.0; k.name = 'mark'; g.add(k);
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
  canvas.setPointerCapture(e.pointerId);
  mouse.btn = e.button; mouse.lx = e.clientX; mouse.ly = e.clientY; mouse.moved = 0; e.preventDefault();
  if (e.button === 0) {
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
    const ch = ray.intersectObjects(citGroup.children, true);
    if (ch.length) { let o = ch[0].object; while (o && o.parent !== citGroup) o = o.parent; const c = cits.find(c => c.g === o); if (c) { pokeCitizen(c); mouse.btn = -1; return; } }
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
  if (/input|select|textarea/i.test(e.target.tagName)) { if (e.key === 'Escape') e.target.blur(); return; }
  keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); if (document.activeElement) document.activeElement.blur(); toggleMenu(); }
  else if (e.code === 'Tab') { e.preventDefault(); S.destroy = !S.destroy; uiDirty = true; sfx('click'); }
  else if (e.code === 'Escape') closeMenu();
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
  const inc = income(); if (S.money < tot.capM) S.money = Math.min(tot.capM, S.money + inc * dt);
  settlePop();
  if (lastPrestige && prestige.n !== lastPrestige) { if (prestige.at > 0 && PRESTIGE.findIndex(p => p.n === prestige.n) > PRESTIGE.findIndex(p => p.n === lastPrestige)) { banner(prestige.n, `Loisirs ×${prestige.m}`, 'level'); sfx('win'); } }
  lastPrestige = prestige.n;
  S.buffs = S.buffs.filter(b => b.until > now());
  if (S.malus && S.malus.until <= now()) S.malus = null;
  if (!S.mission && now() >= S.nextMission) spawnMission();
  else if (S.mission && now() > S.mission.until) failMission(false);
}
function frame(tm) {
  const rdt = Math.min(.1, (tm - last) / 1000); last = tm;
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
  residentGroup.children.forEach(g => { const m = g.getObjectByName('mark'), r = g.userData.res, rdy = now() >= r.ready; if (m) { m.visible = rdy; m.rotation.y += rdt * 2; m.position.y = 1.0 + Math.sin(tn / 300) * .05; } g.position.y = g.userData.top + (rdy ? Math.abs(Math.sin(tn / 260)) * .07 : 0); g.userData.inner.rotation.y = Math.sin(tn / 1200) * .6; });
  fxUpdate(rdt, tn); animateHUD(rdt);
  marker.material.opacity = .42 + Math.sin(tn / 180) * .14; if (ghost && ghost.visible) ghost.position.y = .03 + Math.abs(Math.sin(tn / 320)) * .05;
  // survol
  if (mouse.cell) {
    const c = mouse.cell, t = S.sel >= 0 ? T[S.sel] : null;
    marker.visible = true; marker.position.x = c.x - HALF + .5; marker.position.z = c.y - HALF + .5;
    if (S.destroy) { marker.material.color.setHex(placed.has(keyOf(c.x, c.y)) ? 0xff4d5e : 0x888888); updateGhost(null); }
    else if (t) { const ev = evaluate(t, c.x, c.y); marker.material.color.setHex(ev.ok ? 0x3ddbb0 : 0xff4d5e); updateGhost(c); infoFor(t, ev, c); }
    else { marker.material.color.setHex(0xffffff); updateGhost(null); infoFor(null); }
    if (S.destroy || !t) infoFor(null, null, c);
  } else { marker.visible = false; updateGhost(null); infoFor(null); }
  hudT += rdt; if (hudT > .25 || uiDirty) { hudT = 0; refreshHUD(); uiDirty = false; }
  saveT += rdt; if (saveT > 6) { saveT = 0; save(); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function boot() {
  const had = load(); recalc(); lastPrestige = prestige.n;
  placed.forEach(r => addObj(r, false)); rebuildResidents();
  resize(); updateCamera(); setGhost(); buildUI();
  if (!had) { openMenu('help'); }
  requestAnimationFrame(frame);
  addEventListener('beforeunload', save);
}
