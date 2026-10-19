/* ===== INTERFACE ===== */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const fmt = n => { n = Math.floor(n); if (n >= 1e6) return (n / 1e6).toFixed(2).replace('.', ',') + ' M'; if (n >= 1e4) return (n / 1e3).toFixed(1).replace('.', ',') + ' k'; return n.toLocaleString('fr-FR'); };
const f1 = n => (Math.round(n * 10) / 10).toLocaleString('fr-FR');
const pc = n => (n >= 0 ? '+' : '−') + Math.abs(Math.round(n * 100)) + ' %';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stars = t => t.s === 0 ? '<span class="st st0">Départ</span>' : `<span class="st st${t.s}">${'★'.repeat(t.s)}</span>`;
const IC = {
  coin: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#ffc94a"/><circle cx="10" cy="10" r="5.2" fill="none" stroke="#c98a12" stroke-width="1.6"/></svg>',
  pop: '<svg viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="3" fill="#8fd3ff"/><path d="M1.5 16c.4-3.6 2.6-5.2 5.5-5.2s5.1 1.6 5.5 5.2z" fill="#8fd3ff"/><circle cx="14" cy="7.5" r="2.4" fill="#5cb8ff"/><path d="M12.5 11.2c3-.4 5.4 1 6 4.8h-5.2c-.1-2-.5-3.3-.8-4.8z" fill="#5cb8ff"/></svg>',
  vote: '<svg viewBox="0 0 20 20"><rect x="2" y="9" width="16" height="8" rx="1.5" fill="#ff9a6a"/><rect x="5.5" y="2.5" width="9" height="9" rx="1" fill="#fff" transform="rotate(-8 10 7)"/><path d="M7.5 7l1.8 1.8L13 5" fill="none" stroke="#e5522b" stroke-width="1.8" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 20 20"><path d="M2.5 4.5c3-1 5.5-.8 7.5.8 2-1.6 4.5-1.8 7.5-.8v11c-3-1-5.5-.8-7.5.8-2-1.6-4.5-1.8-7.5-.8z" fill="#b08cff"/><path d="M10 5.3v11" stroke="#fff" stroke-width="1.2"/></svg>'
};

/* vignettes isométriques (rendu hors écran, mises en cache) */
const thumbCache = {}; let TH = null;
function thumb(t) {
  if (thumbCache[t.id]) return thumbCache[t.id];
  if (!TH) {
    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); r.setSize(120, 120); r.setPixelRatio(1);
    const s = new THREE.Scene(); s.add(new THREE.HemisphereLight(0xffffff, 0x9bb59a, 1.0)); const dl = new THREE.DirectionalLight(0xffffff, .6); dl.position.set(3, 6, 2); s.add(dl);
    TH = { r, s, c: new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 50) };
  }
  const m = buildModel(t); TH.s.add(m);
  const b = new THREE.Box3().setFromObject(m), h = Math.max(1.1, b.max.y * .9 + .35), v = Math.max(1.5, h * 1.25);
  TH.c.left = -v / 2 * 1.15; TH.c.right = v / 2 * 1.15; TH.c.top = v / 2 * 1.15 + h * .1; TH.c.bottom = -v / 2 * 1.15 + h * .1; TH.c.updateProjectionMatrix();
  TH.c.position.set(6, 6 * 0.9, 6); TH.c.lookAt(0, h * .38, 0);
  TH.r.render(TH.s, TH.c); const url = TH.r.domElement.toDataURL('image/png'); TH.s.remove(m);
  return thumbCache[t.id] = url;
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const im = e.target; io.unobserve(im); im.src = thumb(T[+im.dataset.t]); } }), { rootMargin: '200px' });
function thumbImg(t) { const im = new Image(); im.dataset.t = t.id; im.alt = ''; im.width = im.height = 60; if (thumbCache[t.id]) im.src = thumbCache[t.id]; else io.observe(im); return im; }

/* ----- notifications ----- */
function toast(msg, kind = 'info') {
  const e = el('div', 'toast ' + kind, esc(msg)); $('#toasts').appendChild(e);
  setTimeout(() => e.classList.add('out'), 3800); setTimeout(() => e.remove(), 4300);
  while ($('#toasts').children.length > 5) $('#toasts').firstChild.remove();
}
let flashT = 0;
function flash(msg) { const n = performance.now(); if (n - flashT < 700) return; flashT = n; toast(msg, 'bad'); }

/* ----- HUD ----- */
let hudKey = '';
function refreshHUD() {
  const p = pop(), inc = income();
  $('#h-money').textContent = fmt(S.money); $('#h-cap').textContent = '/ ' + fmt(tot.capM); $('#h-inc').textContent = '+' + f1(inc) + ' $/s';
  $('#h-pop').textContent = fmt(p); $('#h-popcap').textContent = '/ ' + fmt(tot.capH); $('#h-pres').textContent = `${prestige.n} ×${prestige.m}`;
  $('#h-votes').textContent = fmt(S.votes); $('#h-album').textContent = `${ownedCount()}`; $('#h-albumt').textContent = '/ ' + TOTAL;
  $('#h-moneybar').style.width = clamp(S.money / tot.capM * 100, 0, 100) + '%'; $('#h-popbar').style.width = clamp(p / tot.capH * 100, 0, 100) + '%';
  document.body.classList.toggle('destroy', S.destroy);
  $('#mode').innerHTML = S.destroy ? '<b>Destruction</b> <i>Tab pour construire</i>' : '<b>Construction</b> <i>Tab pour détruire</i>';
  const bf = [...S.buffs.filter(b => b.until > now()).map(b => `<span class="chip good">${esc(BONUSES.find(x => x.id === b.id).n)} ${Math.ceil(b.until - now())} s</span>`),
    S.malus && S.malus.until > now() ? `<span class="chip bad">${esc(MALUS.find(x => x.id === S.malus.id).n)} ${Math.ceil(S.malus.until - now())} s</span>` : ''].join('');
  if (bf !== hudKey) { hudKey = bf; $('#buffs').innerHTML = bf; }
  document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.s === S.speed));
  refreshSel(); refreshMission();
  if (menuOpen()) refreshMenuLive();
}
let selKey = '';
function refreshSel() {
  const t = S.sel >= 0 ? T[S.sel] : null;
  const k = [S.sel, S.recent.join(), Math.floor(S.money / 5), S.rot, tot && Math.round(costMult() * 100), tot && tot.n].join('|');
  if (k === selKey) return; selKey = k;
  const box = $('#sel'); box.innerHTML = '';
  if (t) {
    const c = costOf(t); const d = el('div', 'selcard');
    d.appendChild(thumbImg(t));
    d.insertAdjacentHTML('beforeend', `<div><b>${esc(t.name)}</b><span>${stars(t)} · ${esc(t.sub)}</span><span class="cost ${S.money >= c ? '' : 'no'}">${fmt(c)} $</span></div>`);
    box.appendChild(d);
  } else box.innerHTML = '<div class="selcard empty">Appuyez sur <kbd>Espace</kbd> pour choisir une tuile</div>';
  const hb = $('#hotbar'); hb.innerHTML = '';
  S.recent.forEach((id, i) => { const b = el('button', 'slot' + (id === S.sel ? ' on' : '')); b.title = T[id].name; b.appendChild(thumbImg(T[id])); b.insertAdjacentHTML('beforeend', `<kbd>${i + 1}</kbd>`); b.onclick = () => selectTile(id); hb.appendChild(b); });
}

/* ----- infobulle de survol ----- */
let infoHtml = '';
function infoFor(t, ev, c) {
  let h = '';
  if (t && ev) {
    const rows = [];
    if (t.cat === 0) rows.push(`<div class="r"><span>Habitants</span><b>+${f1(ev.hab)}</b></div><div class="r"><span>Capacité</span><b>+${fmt(t.capH)}</b></div>`);
    else if (ev.hab > 0) rows.push(`<div class="r"><span>Habitants</span><b>+${f1(ev.hab)}</b></div>`);
    if (ev.money > 0) rows.push(`<div class="r"><span>Revenus</span><b>+${f1(ev.money)} $/s</b></div>`);
    if (t.capM) rows.push(`<div class="r"><span>Plafond argent</span><b>+${fmt(t.capM)}</b></div>`);
    if (t.cat === 0 && t.bM) rows.push(`<div class="r"><span>Boost commerces</span><b class="g">${pc(t.bM)}</b></div>`);
    if (t.cat === 3) rows.push(`<div class="r"><span>Boost commerces/loisirs</span><b class="g">${pc(t.bM)}</b></div><div class="r"><span>Malus habitations</span><b class="b">${pc(-t.mH)}</b></div>`);
    if (t.cat === 4) rows.push(`<div class="r"><span>Boost habitants</span><b class="g">${pc(t.bH)}</b></div><div class="r"><span>Malus argent loisirs</span><b class="b">${pc(-t.mM)}</b></div>`);
    if (t.cat === 5 && (t.bM || t.bH)) rows.push(`<div class="r"><span>Réseau</span><b class="g">${pc(t.bM)}</b></div>`);
    const mods = [];
    if ((t.cat === 1 || t.cat === 2) && Math.abs(ev.mm - 1) > .005) mods.push(`Argent ${pc(ev.mm - 1)} (alentours)`);
    if ((t.cat === 0 || t.cat === 2) && Math.abs(ev.hm - 1) > .005) mods.push(`Habitants ${pc(ev.hm - 1)} (alentours)`);
    if (ev.adj) mods.push(`Adjacence ${pc(ev.adjM - 1)} (${ev.adj} voisine${ev.adj > 1 ? 's' : ''} du thème)`);
    if (t.cat === 2) mods.push(`Prestige ${prestige.n} ×${prestige.m}`);
    h = `<h4>${esc(t.name)} ${stars(t)}</h4><p class="sub">${esc(t.sub)}${t.theme >= 0 ? ' · ' + esc(D.themes[t.theme]) : ''} · portée ${rangeOf(t) >= 99 ? 'carte' : rangeOf(t) + ' case' + (rangeOf(t) > 1 ? 's' : '')}</p>
      <div class="r cost"><span>Coût</span><b class="${S.money >= ev.cost ? '' : 'b'}">${fmt(ev.cost)} $</b></div>${rows.join('')}
      ${mods.length ? '<ul class="mods">' + mods.map(m => `<li>${m}</li>`).join('') + '</ul>' : ''}
      ${ev.reqs.length ? '<ul class="reqs">' + ev.reqs.map(q => `<li class="${q.ok ? 'ok' : 'ko'}">${q.ok ? '✓' : '✗'} ${esc(q.label)}${q.need ? ` (${q.have}/${q.need})` : ''}</li>`).join('') + '</ul>' : ''}
      ${ev.errs.length ? `<p class="err">${esc(ev.errs[0])}</p>` : ''}`;
  } else if (c) {
    const rec = placed.get(keyOf(c.x, c.y));
    if (rec) {
      const st = T[rec.t];
      h = `<h4>${esc(st.name)} ${stars(st)}</h4><p class="sub">${esc(st.sub)}${st.theme >= 0 ? ' · ' + esc(D.themes[st.theme]) : ''}</p>
      ${rec.h ? `<div class="r"><span>Habitants</span><b>${f1(rec.h)}</b></div>` : ''}${rec.m ? `<div class="r"><span>Revenus</span><b>${f1(rec.m)} $/s</b></div>` : ''}
      ${S.destroy ? `<p class="err">Clic gauche : détruire (+${fmt(rec.paid * .5)} $)</p>` : ''}`;
    }
  }
  if (h !== infoHtml) { infoHtml = h; const b = $('#info'); b.innerHTML = h; b.hidden = !h; }
}

/* ----- mission en cours ----- */
let missKey = '';
function refreshMission() {
  const m = S.mission, box = $('#mission');
  if (!m) { if (missKey) { missKey = ''; box.hidden = true; } return; }
  const { lv } = missionLevel(), t = T[m.tile], left = Math.max(0, m.until - now());
  const k = [m.id, lv, Math.ceil(left)].join('|'); if (k === missKey) return; missKey = k;
  const owned = S.owned.has(t.id), bn = BONUSES[m.bonus];
  box.hidden = false;
  box.innerHTML = `<div class="mhead"><span class="avatar" style="--h:${m.hue}">${esc(m.name[0])}</span><div><b>${esc(m.name)}</b><span>${esc(m.job)}${m.anti >= 0 ? ' · déteste ' + esc(D.themes[m.anti]) : ''}</span></div><span class="timer">${Math.floor(left / 60)}:${String(Math.ceil(left % 60) % 60).padStart(2, '0')}</span></div>
    <p>« Je cherche <b>${NOUN[m.sub]}</b>. »</p>
    <ol class="lvls"><li class="${lv >= 1 ? 'ok' : ''}"><i>Sous-catégorie</i> ${esc(m.sub)}</li>
    <li class="${lv >= 2 ? 'ok' : ''}"><i>Thème</i> ${esc(D.themes[m.theme])}</li>
    <li class="${lv >= 3 ? 'ok' : ''}"><i>Tuile exacte</i> ${esc(t.name)} ${owned ? '' : '<em>(pas encore dans l\'Album)</em>'}</li></ol>
    <div class="mfoot"><span class="bn">Bonus : ${esc(bn.n)}</span><button id="m-ok" ${lv ? '' : 'disabled'}>Accueillir${lv ? ' (niv. ' + lv + ')' : ''}</button></div>`;
  $('#m-ok').onclick = welcome;
}

/* ===== MENU ===== */
const U = { tab: 'build', bCat: -1, bSub: '', bTheme: -1, bQ: '', bSort: 'cat', bLim: 90, aCat: -1, aSub: '', aTheme: -1, aQ: '', aOwn: 'all', aLim: 90, packCat: 0, packTheme: 0 };
const TABS = [['build', 'Construire'], ['album', 'Album'], ['packs', 'Packs'], ['people', 'Habitants'], ['help', 'Aide']];
menuOpen = () => !$('#menu').hidden;
function openMenu(tab) { if (tab) U.tab = tab; $('#menu').hidden = false; renderMenu(); }
function closeMenu() { $('#menu').hidden = true; }
function toggleMenu() { menuOpen() ? closeMenu() : openMenu(); }

function renderMenu() {
  const tabs = $('#tabs'); tabs.innerHTML = '';
  TABS.forEach(([id, n]) => { const b = el('button', 'tab' + (U.tab === id ? ' on' : ''), n); b.onclick = () => { U.tab = id; renderMenu(); sfx('click'); }; tabs.appendChild(b); });
  const body = $('#mbody'); body.innerHTML = '';
  ({ build: renderBuild, album: renderAlbum, packs: renderPacks, people: renderPeople, help: renderHelp })[U.tab](body);
}
function refreshMenuLive() {
  const v = $('#m-votes'); if (v) v.textContent = fmt(S.votes);
  document.querySelectorAll('.packbtn').forEach(b => { const price = +b.dataset.price; b.disabled = S.votes < price; });
  document.querySelectorAll('.cost[data-id]').forEach(c => { const t = T[+c.dataset.id]; c.classList.toggle('no', S.money < costOf(t)); });
  if (U.tab === 'people') { const w = $('#people-live'); if (w) w.innerHTML = peopleLive(); }
}
function selectEl(opts, val, cb, cls = '') {
  const s = el('select', cls); opts.forEach(([v, l]) => { const o = el('option', '', esc(l)); o.value = v; if (String(v) === String(val)) o.selected = true; s.appendChild(o); }); s.onchange = () => cb(s.value); return s;
}
function catChips(cur, cb, all = true) {
  const w = el('div', 'chips');
  const mk = (v, l, col) => { const b = el('button', 'cchip' + (cur === v ? ' on' : ''), l); if (col) b.style.setProperty('--c', col); b.onclick = () => cb(v); w.appendChild(b); };
  if (all) mk(-1, 'Tout'); D.cats.forEach((n, i) => mk(i, n, CATC[i])); return w;
}
function themeOpts(all = 'Tous les thèmes') { return [[-1, all], ...D.themes.map((n, i) => [i, n]).sort((a, b) => a[1].localeCompare(b[1], 'fr'))]; }
function subOpts(cat) { const s = cat < 0 ? [...new Set(SUBS.flat())].sort((a, b) => a.localeCompare(b, 'fr')) : SUBS[cat]; return [['', 'Toutes les sous-catégories'], ...s.map(x => [x, x])]; }

function tileCard(t, o = {}) {
  const have = S.owned.has(t.id), holo = have && S.everPlaced.has(t.id);
  const c = el('div', `card r${t.s} ${have ? '' : 'locked'} ${holo ? 'holo' : ''} ${o.sel && S.sel === t.id ? 'sel' : ''}`);
  c.style.setProperty('--cc', CATC[t.cat]);
  const pic = el('div', 'pic'); if (have) pic.appendChild(thumbImg(t)); else pic.innerHTML = '<span>?</span>'; c.appendChild(pic);
  c.insertAdjacentHTML('beforeend', `<div class="nm">${have ? esc(t.name) : '???'}</div><div class="meta">${stars(t)}<span>${esc(t.sub.split(',')[0])}</span></div><div class="th">${t.theme >= 0 ? esc(D.themes[t.theme]) : 'Terrain'}</div>`);
  if (o.cost && have) c.insertAdjacentHTML('beforeend', `<div class="cost ${S.money >= costOf(t) ? '' : 'no'}" data-id="${t.id}">${fmt(costOf(t))} $</div>`);
  if (o.stats && have) c.title = statLine(t);
  if (have && holo) c.insertAdjacentHTML('beforeend', '<i class="foil"></i>');
  if (o.click) c.onclick = () => o.click(t);
  return c;
}
function statLine(t) {
  const a = [`${t.name} — ${RARN[t.s]} · portée ${t.rng >= 99 ? 'carte' : t.rng}`];
  if (t.hab) a.push('habitants ' + t.hab); if (t.capH) a.push('capacité +' + t.capH); if (t.money) a.push('revenus ' + t.money + ' $/s'); if (t.capM) a.push('plafond +' + t.capM);
  if (t.bM) a.push('boost argent ' + pc(t.bM)); if (t.bH) a.push('boost habitants ' + pc(t.bH)); if (t.mH) a.push('malus habitants ' + pc(-t.mH)); if (t.mM) a.push('malus argent ' + pc(-t.mM)); if (t.vote) a.push('+' + t.vote + ' vote(s)');
  return a.join(' · ');
}
function gridInto(parent, list, lim, onMore, o) {
  const g = el('div', 'grid'); list.slice(0, lim).forEach(t => g.appendChild(tileCard(t, o))); parent.appendChild(g);
  if (list.length > lim) { const b = el('button', 'more', `Afficher plus (${list.length - lim})`); b.onclick = onMore; parent.appendChild(b); }
  if (!list.length) parent.appendChild(el('p', 'empty', 'Aucune tuile ne correspond à ces filtres.'));
}
const hillRank = t => (t.cat === 5 && t.theme < 0) ? 1 : 0;
const sorters = { cat: (a, b) => hillRank(a) - hillRank(b) || a.cat - b.cat || a.sub.localeCompare(b.sub, 'fr') || a.s - b.s || a.cost - b.cost, cost: (a, b) => a.cost - b.cost, rar: (a, b) => b.s - a.s || a.cost - b.cost, name: (a, b) => a.name.localeCompare(b.name, 'fr') };

function renderBuild(body) {
  const f = el('div', 'filters');
  f.appendChild(catChips(U.bCat, v => { U.bCat = v; U.bSub = ''; U.bLim = 90; renderMenu(); }));
  const row = el('div', 'frow');
  row.appendChild(selectEl(subOpts(U.bCat), U.bSub, v => { U.bSub = v; U.bLim = 90; renderMenu(); }));
  row.appendChild(selectEl(themeOpts(), U.bTheme, v => { U.bTheme = +v; U.bLim = 90; renderMenu(); }));
  row.appendChild(selectEl([['cat', 'Trier : catégorie'], ['cost', 'Trier : prix'], ['rar', 'Trier : rareté'], ['name', 'Trier : nom']], U.bSort, v => { U.bSort = v; renderMenu(); }));
  const q = el('input'); q.type = 'search'; q.placeholder = 'Rechercher…'; q.value = U.bQ; q.id = 'bq';
  q.oninput = () => { U.bQ = q.value; U.bLim = 90; clearTimeout(q._t); q._t = setTimeout(() => { renderMenu(); const n = $('#bq'); n.focus(); n.setSelectionRange(99, 99); }, 250); };
  row.appendChild(q); f.appendChild(row); body.appendChild(f);
  const qq = U.bQ.trim().toLowerCase();
  let list = [...S.owned].map(i => T[i]).filter(t => (U.bCat < 0 || t.cat === U.bCat) && (!U.bSub || t.subs.includes(U.bSub)) && (U.bTheme < 0 || t.theme === U.bTheme) && (!qq || (t.name + ' ' + t.sub + (t.theme >= 0 ? D.themes[t.theme] : '')).toLowerCase().includes(qq)));
  list.sort(sorters[U.bSort]);
  body.appendChild(el('p', 'count', `${list.length} tuile${list.length > 1 ? 's' : ''} débloquée${list.length > 1 ? 's' : ''}. Cliquez pour sélectionner.`));
  const wrap = el('div', 'scroll'); body.appendChild(wrap);
  gridInto(wrap, list, U.bLim, () => { U.bLim += 120; renderMenu(); }, { cost: true, stats: true, sel: true, click: t => { selectTile(t.id); closeMenu(); } });
}

function bonusLabel(b) {
  return { attr: `Attractivité +${(b.val * 100).toFixed(1).replace('.', ',')} % habitants`, rend: `Rendement +${(b.val * 100).toFixed(1).replace('.', ',')} % argent`, pop: `Popularité +${(b.val * 100).toFixed(1).replace('.', ',')} % votes`,
    eco: `Économie −${(b.val * 100).toFixed(1).replace('.', ',')} % coût ${D.cats[b.ecoCat]}`, porte: 'Portée +1 case (tuiles du thème)' }[b.kind];
}
function renderAlbum(body) {
  const ob = ownedByTheme(), pct = ownedCount() / TOTAL * 100;
  const top = el('div', 'albtop', `<div><b>${ownedCount()}</b> / ${TOTAL} stickers <span class="mut">· ${agg.done} / ${D.themes.length} thèmes complets</span></div><div class="bar big"><i style="width:${pct}%"></i></div>`); body.appendChild(top);
  const cols = el('div', 'albcols'); body.appendChild(cols);
  const left = el('div', 'themes scroll'); cols.appendChild(left);
  const all = el('button', 'theme' + (U.aTheme < 0 ? ' on' : ''), '<b>Tous les thèmes</b>'); all.onclick = () => { U.aTheme = -1; U.aLim = 90; renderMenu(); }; left.appendChild(all);
  D.themes.map((n, i) => i).sort((a, b) => D.themes[a].localeCompare(D.themes[b], 'fr')).forEach(i => {
    const b = D.themeBonus[i], done = ob[i] >= b.n, w = el('button', 'theme' + (U.aTheme === i ? ' on' : '') + (done ? ' done' : ''));
    w.style.setProperty('--hue', Math.round(themeHue(i) * 360));
    w.innerHTML = `<b>${esc(D.themes[i])}</b><span>${ob[i]}/${b.n}</span><div class="bar"><i style="width:${ob[i] / b.n * 100}%"></i></div><small class="${done ? 'got' : ''}">${bonusLabel(b)}</small>`;
    w.onclick = () => { U.aTheme = i; U.aLim = 90; renderMenu(); }; left.appendChild(w);
  });
  const right = el('div', 'albright'); cols.appendChild(right);
  const f = el('div', 'filters'); f.appendChild(catChips(U.aCat, v => { U.aCat = v; U.aSub = ''; U.aLim = 90; renderMenu(); }));
  const row = el('div', 'frow');
  row.appendChild(selectEl(subOpts(U.aCat), U.aSub, v => { U.aSub = v; U.aLim = 90; renderMenu(); }));
  row.appendChild(selectEl([['all', 'Tous'], ['own', 'Obtenus'], ['miss', 'Manquants'], ['holo', 'Placés (holo)']], U.aOwn, v => { U.aOwn = v; U.aLim = 90; renderMenu(); }));
  const q = el('input'); q.type = 'search'; q.placeholder = 'Rechercher…'; q.value = U.aQ; q.id = 'aq';
  q.oninput = () => { U.aQ = q.value; U.aLim = 90; clearTimeout(q._t); q._t = setTimeout(() => { renderMenu(); const n = $('#aq'); n.focus(); n.setSelectionRange(99, 99); }, 250); };
  row.appendChild(q); f.appendChild(row); right.appendChild(f);
  const qq = U.aQ.trim().toLowerCase();
  const list = T.filter(t => !t.ult && (U.aCat < 0 || t.cat === U.aCat) && (!U.aSub || t.subs.includes(U.aSub)) && (U.aTheme < 0 || t.theme === U.aTheme) &&
    (U.aOwn === 'all' || (U.aOwn === 'own' && S.owned.has(t.id)) || (U.aOwn === 'miss' && !S.owned.has(t.id)) || (U.aOwn === 'holo' && S.everPlaced.has(t.id))) &&
    (!qq || (S.owned.has(t.id) && (t.name + ' ' + t.sub).toLowerCase().includes(qq)))).sort((a, b) => b.s - a.s || a.name.localeCompare(b.name, 'fr'));
  if (U.aTheme >= 0) { const b = D.themeBonus[U.aTheme]; right.appendChild(el('p', 'tinfo', `<b>${esc(D.themes[U.aTheme])}</b> — complétez ces ${b.n} stickers pour gagner : <b>${bonusLabel(b)}</b>`)); }
  const wrap = el('div', 'scroll'); right.appendChild(wrap);
  gridInto(wrap, list, U.aLim, () => { U.aLim += 120; renderMenu(); }, { stats: true });
  const ult = T[ULT];
  if (U.aTheme < 0 && U.aCat < 0 && !U.aSub && U.aOwn === 'all' && !qq) {
    const u = el('div', 'ultcard' + (S.owned.has(ULT) ? ' open' : ''), `<b>Tuile ultime · ${ult.name}</b><span>${S.owned.has(ULT) ? 'Débloquée. Placez-la pour terminer la partie (' + fmt(ult.cost) + ' $).' : 'Se débloque quand l\'Album est complet.'}</span>`);
    wrap.prepend(u);
  }
}

function renderPacks(body) {
  const w = el('div', 'packs');
  w.appendChild(el('div', 'pk-intro', `<p>Chaque habitant donne <b>1 point de vote</b> la première fois qu'il s'installe. Un pack contient <b>5 stickers que vous n'avez pas encore</b> : jamais de doublon.</p><p class="votes"><span class="ico">${IC.vote}</span><b id="m-votes">${fmt(S.votes)}</b> points de vote</p>`));
  const left = D.cats.map((_, c) => T.filter(t => !t.ult && t.cat === c && !S.owned.has(t.id)).length);
  const lt = D.themes.map((_, c) => themeTiles[c].filter(i => !S.owned.has(i)).length);
  const mk = (kind, title, desc, ctrl, key) => {
    const price = packPrice(kind), c = el('div', 'pack ' + kind);
    c.innerHTML = `<div class="art"><i></i><i></i><i></i></div><h3>${title}</h3><p>${desc}</p>`;
    if (ctrl) c.appendChild(ctrl);
    const b = el('button', 'packbtn', `Ouvrir · ${price} votes`); b.dataset.price = price; b.disabled = S.votes < price;
    b.onclick = () => { const out = drawPack(kind, key()); if (!out) { toast(S.votes < price ? 'Pas assez de votes.' : 'Plus aucun sticker dans cette sélection.', 'bad'); return; } showReveal(out); };
    c.appendChild(b); w.appendChild(c);
  };
  mk('std', 'Pack Classique', '5 stickers au hasard parmi ceux qui vous manquent. Les ★★★★ sont rares.', null, () => 0);
  mk('cat', 'Pack Catégorie', 'Choisissez une catégorie : 5 stickers manquants de celle-ci.', selectEl(D.cats.map((n, i) => [i, `${n} (${left[i]} manquants)`]), U.packCat, v => { U.packCat = +v; }), () => U.packCat);
  mk('theme', 'Pack Thème', 'Ciblez un thème pour décrocher son bonus permanent.', selectEl(D.themes.map((n, i) => [i, `${n} (${lt[i]} manquants)`]).filter(x => lt[x[0]] > 0).sort((a, b) => a[1].localeCompare(b[1], 'fr')), U.packTheme, v => { U.packTheme = +v; }), () => U.packTheme);
  body.appendChild(w);
  if (!lt[U.packTheme]) { const f = lt.findIndex(x => x > 0); if (f >= 0) U.packTheme = f; }
}
function showReveal(cards) {
  const ov = $('#reveal'), row = $('#rcards'); ov.hidden = false; row.innerHTML = ''; let flipped = 0;
  $('#r-close').hidden = true;
  cards.forEach((t, i) => {
    const c = el('div', 'rcard r' + t.s); c.style.setProperty('--cc', CATC[t.cat]);
    c.innerHTML = `<div class="in"><div class="back"><span>VOXITY</span></div><div class="front"><div class="pic"></div><div class="nm">${esc(t.name)}</div><div class="meta">${stars(t)}<span>${esc(t.sub.split(',')[0])}</span></div><div class="th">${t.theme >= 0 ? esc(D.themes[t.theme]) : ''}</div><div class="new">NOUVEAU</div></div></div>`;
    const flip = () => { if (c.classList.contains('flip')) return; c.classList.add('flip'); c.querySelector('.pic').appendChild(thumbImg(t)); sfx('click'); if (++flipped === cards.length) { $('#r-close').hidden = false; } };
    c.onclick = flip; c._flip = flip; row.appendChild(c);
  });
  $('#r-all').onclick = () => [...row.children].forEach((c, i) => setTimeout(c._flip, i * 140));
  $('#r-close').onclick = () => { ov.hidden = true; if (menuOpen()) renderMenu(); };
}

function peopleLive() {
  if (!S.residents.length) return '<p class="empty">Aucun habitant spécial installé pour l\'instant. Le prochain arrive bientôt.</p>';
  return S.residents.map(r => { const b = BONUSES[r.bonus], rd = r.ready - now(); return `<div class="res"><span class="avatar" style="--h:${r.hue}">${esc(r.name[0])}</span><div><b>${esc(r.name)}</b> <small>${esc(r.job)} · niv. ${r.lv}</small><span>${esc(b.n)} : ${b.d(r.lv)}</span></div><em class="${rd <= 0 ? 'rdy' : ''}">${rd <= 0 ? 'Prêt : cliquez sur lui' : Math.ceil(rd) + ' s'}</em></div>`; }).join('');
}
function renderPeople(body) {
  const w = el('div', 'people');
  w.appendChild(el('div', 'pp-intro', `<p>Un habitant spécial arrive environ toutes les 5 minutes (4 minutes pour le satisfaire). Plus votre tuile est précise, plus la récompense est grande : <b>sous-catégorie</b>, <b>thème</b>, puis <b>tuile exacte</b>. Une fois installé, cliquez sur lui dans la ville pour activer son bonus.</p>`));
  w.appendChild(el('h3', '', 'Installés en ville')); w.appendChild(el('div', 'reslist', '<div id="people-live">' + peopleLive() + '</div>'));
  w.appendChild(el('h3', '', `Archives (${S.archive.length})`));
  const arc = el('div', 'arch');
  if (!S.archive.length) arc.innerHTML = '<p class="empty">Les habitants que vous croiserez seront archivés ici.</p>';
  S.archive.forEach(a => {
    const st = { ok: 'Installé · niv. ' + a.lv, left: 'Reparti', angry: 'Fâché' }[a.status];
    arc.insertAdjacentHTML('beforeend', `<div class="arc ${a.status}"><span class="avatar" style="--h:${a.hue}">${esc(a.name[0])}</span><div><b>${esc(a.name)}</b> <small>${esc(a.job)}</small><span>Cherchait : ${esc(a.sub)} · ${esc(D.themes[a.theme] || '')}</span></div><em>${st}</em></div>`);
  });
  w.appendChild(arc); body.appendChild(w);
}
function renderHelp(body) {
  const w = el('div', 'help');
  w.innerHTML = `
  <div class="hcol"><h3>Commandes</h3>
  <dl><dt><kbd>Espace</kbd></dt><dd>Ouvrir ou fermer ce menu</dd><dt>Clic gauche</dt><dd>Construire (maintenir pour tracer une ligne)</dd><dt>Clic droit + glisser</dt><dd>Se déplacer sur la carte</dd>
  <dt>Clic molette + glisser</dt><dd>Tourner la caméra</dd><dt>Molette</dt><dd>Zoomer</dd><dt><kbd>Tab</kbd></dt><dd>Basculer en mode destruction (remboursement de 50 %)</dd>
  <dt><kbd>Q</kbd> <kbd>E</kbd></dt><dd>Pivoter la tuile</dd><dt><kbd>1</kbd>–<kbd>8</kbd></dt><dd>Tuiles récentes</dd><dt>Flèches</dt><dd>Déplacer la caméra</dd></dl></div>
  <div class="hcol"><h3>Règles</h3><ul>
  <li><b>Habitations</b> : habitants, capacité de population, boost d'argent des commerces voisins.</li>
  <li><b>Commerces</b> : argent, plafond d'argent, quelques habitants.</li>
  <li><b>Loisirs</b> : argent et habitants multipliés par le prestige (Hameau ×1 à Métropole ×3).</li>
  <li><b>Productions</b> : boost d'argent des commerces et loisirs, malus d'habitants sur les habitations proches.</li>
  <li><b>Services</b> : boost d'habitants des habitations et loisirs, malus d'argent des loisirs proches.</li>
  <li><b>Mairie</b> : la ville rapporte 1 $/s de base.</li>
  <li><b>Routes</b> : un petit boost de réseau. Les ★★ et plus (hors routes) demandent une route à 2 cases.</li>
  <li><b>Portée</b> : Départ 1 case, ★ 2, ★★ 3, ★★★ 4, ★★★★ toute la carte. Un effet ne touche que les tuiles posées après la source, dans sa portée.</li>
  <li><b>Synergies</b> : une tuile ★★ ou plus demande des tuiles du même thème à portée (2, 3 puis 5).</li>
  <li><b>Adjacence</b> : +8 % par voisine du même thème, jusqu'à +64 %.</li>
  <li><b>Thème complet</b> : bonus permanent additif (Attractivité, Rendement, Popularité, Économie, Portée).</li>
  <li><b>Objectif</b> : compléter l'Album (${TOTAL} stickers) puis placer la Tour Voxity.</li></ul></div>
  <div class="hcol"><h3>Partie</h3><p>Vitesse du temps</p><div id="speed2" class="speedrow"></div>
  <p class="mut">Sauvegarde automatique dans ce navigateur.</p><button id="reset" class="danger">Réinitialiser la partie</button></div>`;
  body.appendChild(w);
  const sp = w.querySelector('#speed2'); [1, 2, 5, 10].forEach(s => { const b = el('button', S.speed === s ? 'on' : '', '×' + s); b.onclick = () => { S.speed = s; renderMenu(); }; sp.appendChild(b); });
  const rs = w.querySelector('#reset'); let armed = 0;
  rs.onclick = () => { if (!armed) { armed = 1; rs.textContent = 'Cliquez encore pour confirmer'; setTimeout(() => { armed = 0; rs.textContent = 'Réinitialiser la partie'; }, 4000); } else { try { localStorage.removeItem(SAVEKEY); } catch (e) { } removeEventListener('beforeunload', save); location.reload(); } };
}

function showWin() {
  const w = $('#win'); w.hidden = false;
  $('#win-stats').innerHTML = `<div><b>${fmt(pop())}</b><span>habitants</span></div><div><b>${ownedCount()}</b><span>stickers</span></div><div><b>${S.packs}</b><span>packs ouverts</span></div><div><b>${Math.floor(S.time / 60)} min</b><span>de jeu</span></div>`;
  $('#win-ok').onclick = () => { w.hidden = true; };
}

function buildUI() {
  $('#menu-close').onclick = closeMenu; $('#menu').addEventListener('pointerdown', e => { if (e.target.id === 'menu') closeMenu(); });
  $('#open-menu').onclick = () => toggleMenu();
  document.querySelectorAll('#speed button').forEach(b => b.onclick = () => { S.speed = +b.dataset.s; uiDirty = true; });
  document.querySelectorAll('[data-ico]').forEach(e => e.innerHTML = IC[e.dataset.ico]);
  $('#mode').onclick = () => { S.destroy = !S.destroy; uiDirty = true; };
  refreshHUD();
}
window.__game = { get S() { return S; }, T, placed, evaluate, place, destroyAt, drawPack, spawnMission, welcome, thumb, tick, recalc, get tot() { return tot; }, get agg() { return agg; }, cam, updateCamera, openMenu, selectTile, missionLevel, income, pop };
