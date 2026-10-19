/* ===== INTERFACE ===== */
const $ = s => document.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
const fmt = n => Math.floor(n).toLocaleString('fr-FR');
const f1 = n => Math.round(n).toLocaleString('fr-FR');
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
const DV = { money: 0, pop: 0, votes: 0, album: 0, init: false }, HT = {}; let lastV = 0, lastP = 0, lastA = 0, accV = 0, vCool = 0;
function bump(id) { const e = document.getElementById(id); if (!e) return; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
function setTxt(id, v) { if (HT[id] !== v) { HT[id] = v; document.getElementById(id).textContent = v; } }
function animateHUD(dt) {
  const tv = { money: S.money, pop: pop(), votes: S.votes, album: ownedCount() };
  if (!DV.init) { Object.assign(DV, tv); DV.init = true; lastV = tv.votes; lastP = tv.pop; lastA = tv.album; }
  const k = Math.min(1, dt * 9);
  for (const key of ['money', 'pop', 'votes', 'album']) { let d = DV[key]; d += (tv[key] - d) * k; if (Math.abs(tv[key] - d) < .5) d = tv[key]; DV[key] = d; }
  setTxt('h-money', fmt(DV.money)); setTxt('h-pop', fmt(DV.pop)); setTxt('h-votes', fmt(DV.votes)); setTxt('h-album', String(Math.round(DV.album)));
  if (tv.votes > lastV) accV += tv.votes - lastV; vCool -= dt;
  if (accV >= 1 && vCool <= 0) { const r = $('#st-votes').getBoundingClientRect(); floatAt(r.left + r.width / 2, r.bottom - 4, '+' + fmt(accV), 'vote'); bump('st-votes'); accV = 0; vCool = .45; }
  if (tv.pop - lastP >= 1) bump('st-pop'); if (tv.album > lastA) bump('st-album');
  lastV = tv.votes; lastP = tv.pop; lastA = tv.album;
}
let hudKey = '';
function refreshHUD() {
  const p = pop();
  $('#h-cap').textContent = '/ ' + fmt(tot.capM); $('#h-inc').textContent = S.lastGain ? 'dernière pose +' + fmt(S.lastGain) + ' $' : 'gagné à chaque pose';
  $('#h-popcap').textContent = '/ ' + fmt(tot.capH); $('#h-pres').textContent = `${prestige.n} +${prestige.p} %`; $('#st-pop .sub span:first-child').textContent = citRatio > 1 ? `Habitants · 1 pavé = ${citRatio}` : 'Habitants';
  $('#h-albumt').textContent = '/ ' + TOTAL;
  $('#h-moneybar').style.width = clamp(S.money / tot.capM * 100, 0, 100) + '%'; $('#h-popbar').style.width = clamp(p / tot.capH * 100, 0, 100) + '%';
  document.body.classList.toggle('destroy', S.destroy);
  $('#mode').innerHTML = S.destroy ? '<b>Destruction</b> <i>Tab pour construire</i>' : '<b>Construction</b> <i>Tab pour détruire</i>';
  const bf = [...S.buffs.filter(b => b.until > now()).map(b => `<span class="chip good">${esc(BONUSES.find(x => x.id === b.id).n)} ${Math.ceil(b.until - now())} s</span>`),
    S.malus && S.malus.until > now() ? `<span class="chip bad">${esc(MALUS.find(x => x.id === S.malus.id).n)} −${Math.round((S.malus.power || .5) * 100)} % · ${Math.ceil(S.malus.until - now())} s</span>` : ''].join('');
  if (bf !== hudKey) { hudKey = bf; $('#buffs').innerHTML = bf; }
  if (trayIsOpen()) { if (trayOwned !== S.owned.size) renderTray(); refreshCosts(); }
  refreshSel(); refreshMission();
  if (menuOpen()) refreshMenuLive();
}
let selKey = '';
function refreshSel() {
  const t = S.sel >= 0 ? T[S.sel] : null;
  const k = [S.sel, S.recent.join(), Math.floor(S.money / 5), S.rot, tot && (buffPct('chan') + Math.round(100 * malusPow('tax'))), tot && tot.n].join('|');
  if (k === selKey) return; selKey = k;
  const box = $('#sel'); box.innerHTML = '';
  if (t) {
    const c = costOf(t); const d = el('div', 'selcard');
    d.appendChild(thumbImg(t));
    d.insertAdjacentHTML('beforeend', `<div><b>${esc(t.name)}</b><span>${stars(t)} · ${esc(t.sub)}</span>${isSimple() ? '' : `<span class="cost ${S.money >= c ? '' : 'no'}">${fmt(c)} $</span>`}</div>`);
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
    const sm = isSimple(), rows = [];
    if (sm) { if (ev.hab > 0) rows.push(`<div class="r"><span>Habitants</span><b>+${f1(ev.hab)}</b></div>`); if (t.cat === 4) rows.push('<div class="r"><span>Effet</span><b class="g">Protège des malus</b></div>'); }
    else if (t.cat === 0) rows.push(`<div class="r"><span>Habitants</span><b>+${f1(ev.hab)}</b></div><div class="r"><span>Capacité</span><b>+${fmt(t.capH)}</b></div>`);
    else if (!sm && ev.hab > 0) rows.push(`<div class="r"><span>Habitants</span><b>+${f1(ev.hab)}</b></div>`);
    if (!sm && ev.money > 0) rows.push(`<div class="r"><span>Gain à la pose</span><b class="g">+${fmt(ev.pay)} $</b></div>${ev.pay < ev.money ? '<div class="r"><span>Déjà perçu ici</span><b class="b">−' + fmt(ev.money - ev.pay) + ' $</b></div>' : ''}<div class="r"><span>Solde net</span><b class="${ev.net >= 0 ? 'g' : 'b'}">${ev.net >= 0 ? '+' : '−'}${fmt(Math.abs(ev.net))} $</b></div>`);
    if (!sm && t.capM) rows.push(`<div class="r"><span>Plafond argent</span><b>+${fmt(t.capM)}</b></div>`);
    if (!sm && t.cat === 0 && t.bM) rows.push(`<div class="r"><span>Boost commerces</span><b class="g">${pc(t.bM)}</b></div>`);
    if (!sm && t.cat === 3) rows.push(`<div class="r"><span>Boost commerces/loisirs</span><b class="g">${pc(t.bM)}</b></div><div class="r"><span>Malus habitations</span><b class="b">${pc(-t.mH)}</b></div>`);
    if (!sm && t.cat === 4) rows.push(`<div class="r"><span>Boost habitants</span><b class="g">${pc(t.bH)}</b></div><div class="r"><span>Malus argent loisirs</span><b class="b">${pc(-t.mM)}</b></div>`);
    if (!sm && t.cat === 5 && (t.bM || t.bH)) rows.push(`<div class="r"><span>Réseau</span><b class="g">${pc(t.bM)}</b></div>`);
    const mods = [];
    const sg = n => (n >= 0 ? '+' : '−') + Math.abs(n) + ' %';
    if (!sm && ev.nearM) mods.push(`Argent ${sg(ev.nearM)} (alentours)`);
    if (ev.nearH) mods.push(`Habitants ${sg(ev.nearH)} (alentours)`);
    if (ev.adj) mods.push(`Adjacence +${ev.adjP} % (${ev.adj} voisine${ev.adj > 1 ? 's' : ''} du thème)`);
    if (ev.synOK) mods.push('Synergie +25 %');
    if (ev.attrP) mods.push(`Attractivité des thèmes +${ev.attrP} %`);
    if (!sm && ev.rendP) mods.push(`Rendement des thèmes +${ev.rendP} %`);
    if (!sm && ev.tourP) mods.push(`Touristes +${ev.tourP} %`);
    if (!sm && ev.strikeP) mods.push(`Grève −${ev.strikeP} %`);
    if (t.cat === 2 && prestige.p) mods.push(`Prestige ${prestige.n} +${prestige.p} %`);
    if (ev.hab > 0 || ev.money > 0) mods.push(`<b>Total : ${sm ? '' : 'gain ' + sg(ev.mPct) + ' · '}habitants ${sg(ev.hPct)}</b>`);
    h = `<h4>${esc(t.name)} ${stars(t)}</h4><p class="sub">${esc(t.sub)}${t.theme >= 0 ? ' · ' + esc(D.themes[t.theme]) : ''} · portée ${rangeOf(t) >= 99 ? 'carte' : rangeOf(t) + ' case' + (rangeOf(t) > 1 ? 's' : '')}</p>
      ${sm ? '' : `<div class="r cost"><span>Coût</span><b class="${S.money >= ev.cost ? '' : 'b'}">${fmt(ev.cost)} $</b></div>`}${rows.join('')}
      ${mods.length ? '<ul class="mods">' + mods.map(m => `<li>${m}</li>`).join('') + '</ul>' : ''}
      ${ev.dis && ev.dis.pen > 0 ? `<p class="dish">Dissonance : <b class="b">−${Math.round(ev.dis.pen * 100)} %</b> sur ${sm ? 'les habitants' : 'gain et habitants'}</p><ul class="reqs">${ev.dis.items.map(i => `<li class="ko">✗ ${esc(i.st.name)} · ${LV_NAME[i.lv]} (−${Math.round(i.pen * 100)} %)</li>`).join('')}</ul>` : ''}
      ${ev.reqs.length ? '<p class="synh">Synergie optionnelle : ' + (ev.synOK ? '<b class="g">bonus +25 % actif</b>' : 'bonus +25 % si réunie') + '</p><ul class="reqs">' + ev.reqs.map(q => `<li class="${q.ok ? 'ok' : 'ko'}">${q.ok ? '✓' : '○'} ${esc(q.label)}${q.need ? ` (${q.have}/${q.need})` : ''}</li>`).join('') + '</ul>' : ''}
      ${ev.errs.length ? `<p class="err">${esc(ev.errs[0])}</p>` : ''}`;
  } else if (c) {
    const rec = placed.get(keyOf(c.x, c.y));
    if (rec) {
      const st = T[rec.t];
      h = `<h4>${esc(st.name)} ${stars(st)}</h4><p class="sub">${esc(st.sub)}${st.theme >= 0 ? ' · ' + esc(D.themes[st.theme]) : ''}</p>
      ${rec.h ? `<div class="r"><span>Habitants</span><b>${f1(rec.h)}</b></div>` : ''}${rec.m && !isSimple() ? `<div class="r"><span>Gain perçu</span><b>${fmt(rec.m)} $</b></div>` : ''}
      ${S.destroy ? `<p class="err">Clic gauche : détruire${isSimple() ? '' : ' (+' + fmt(refundOf(rec)) + ' $)'}</p>` : ''}`;
    }
  }
  if (h !== infoHtml) { infoHtml = h; const b = $('#info'); b.innerHTML = h; b.hidden = !h; }
}

/* ----- mission en cours ----- */
let missKey = '';
/* indices implicites : lettres dévoilées peu à peu, sauf si « savoir tous les indices » est coché */
function maskText(str, seed, frac) {
  let w = 0, out = '';
  [...str].forEach((ch, i) => {
    if (!/[\p{L}\p{N}]/u.test(ch)) { out += ch; w = 0; return; }
    out += (w === 0 || (hash32(seed + str + i) % 1000) / 1000 < frac) ? ch : '·'; w++;
  });
  return out;
}
function refreshMission() {
  const m = S.mission, box = $('#mission');
  if (!m) { if (missKey) { missKey = ''; box.hidden = true; } return; }
  const { lv } = missionLevel(), t = T[m.tile], left = Math.max(0, m.until - now()), el_ = 240 - left;
  const sm = isSimple(), hintOn = S.allHints || now() < (S.hintUntil || 0), step = Math.floor(el_ / 15), k = [m.id, lv, sm ? 0 : Math.ceil(left), hintOn, sm ? Math.floor(now() / 15) : 0].join('|'); if (k === missKey) return; missKey = k;
  const bn = BONUSES[m.bonus], f = clamp(step / 16 * .55, 0, .55), all = hintOn;
  const th = all ? D.themes[m.theme] : maskText(D.themes[m.theme], 'th' + m.id, f), tn = all ? t.name : maskText(t.name, 'tl' + m.id, f * .8);
  const fresh = box.hidden || box.dataset.id != m.id; box.dataset.id = m.id;
  box.hidden = false;
  box.innerHTML = `<div class="mhead"><span class="avatar" style="--h:${m.hue}">${esc(m.name[0])}</span><div><b>${esc(m.name)}</b><span>${esc(m.job)}${m.anti != null && m.anti !== -1 ? ' · déteste ' + esc(antiLabel(m.anti)) : ''}</span></div>${sm ? '' : `<span class="timer">${Math.floor(left / 60)}:${String(Math.ceil(left % 60) % 60).padStart(2, '0')}</span>`}</div>
    <p>« Je cherche <b>${NOUN[m.sub]}</b>… dans un style que vous devinerez. »</p>
    <ol class="lvls"><li class="${lv >= 1 ? 'ok' : ''}"><i>Sous-catégorie</i> ${esc(m.sub)}${sm ? ' <em class="rw">8 votes</em>' : ''}</li>
    <li class="${lv >= 2 ? 'ok' : ''}"><i>Thème</i> <span class="mk">${esc(th)}</span>${sm ? ' <em class="rw">16</em>' : ''}</li>
    <li class="${lv >= 3 ? 'ok' : ''}"><i>Tuile exacte</i> <span class="mk">${esc(tn)}</span>${sm ? ' <em class="rw">28</em>' : ''}</li></ol>
    ${all ? '' : '<p class="hintnote">Les lettres se dévoilent avec le temps. Elle est déjà dans votre collection.' + (sm ? ' Cet habitant reste en ville jusqu\'à ce que vous l\'aidiez.' : '') + '</p>'}
    <div class="mfoot"><span class="bn">Bonus : ${esc(bn.n)}</span><button id="m-ok" ${lv ? '' : 'disabled'}>${sm ? 'Aider' : 'Accueillir'}${lv ? ' (niv. ' + lv + ')' : ''}</button></div>`;
  $('#m-ok').onclick = welcome;
  if (fresh) { box.classList.remove('fresh'); void box.offsetWidth; box.classList.add('fresh'); }
}

/* ===== MENU ===== */
const U = { tab: 'album', bCat: -1, bSub: '', bTheme: -1, bQ: '', bSort: 'cat', bLim: 90, aCat: -1, aSub: '', aTheme: -1, aQ: '', aOwn: 'all', aLim: 90, packCat: 0, packTheme: 0 };
const TABS = [['album', 'Album'], ['packs', 'Packs'], ['people', 'Habitants'], ['help', 'Aide']];
menuOpen = () => !$('#menu').hidden;
function openMenu(tab) { if (tab) U.tab = tab; const m = $('#menu'); m.hidden = false; m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); renderMenu(); sfx('click'); }
function closeMenu() { $('#menu').hidden = true; }
function toggleMenu() { menuOpen() ? closeMenu() : openMenu(); }

function renderMenu() {
  const tabs = $('#tabs'); tabs.innerHTML = '';
  TABS.forEach(([id, n]) => { const b = el('button', 'tab' + (U.tab === id ? ' on' : ''), n); b.onclick = () => { U.tab = id; renderMenu(); sfx('click'); }; tabs.appendChild(b); });
  const body = $('#mbody'); body.innerHTML = ''; body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
  ({ album: renderAlbum, packs: renderPacks, people: renderPeople, help: renderHelp })[U.tab](body);
}
function refreshMenuLive() {
  const v = $('#m-votes'); if (v) v.textContent = fmt(S.votes);
  document.querySelectorAll('.packbtn').forEach(b => { const price = +b.dataset.price; b.disabled = S.votes < price; });
  document.querySelectorAll('.cost[data-id]').forEach(c => { const t = T[+c.dataset.id]; c.classList.toggle('no', S.money < costOf(t)); });
  if (U.tab === 'people') { const w = $('#people-live'); if (w) w.innerHTML = peopleLive(); }
}
/* ===== BARRE DE CONSTRUCTION (indépendante du menu, vient du bas) ===== */
let trayOwned = -1;
const trayIsOpen = () => $('#tray').classList.contains('open');
function openTray() { renderTray(); $('#tray').classList.add('open'); sfx('click'); }
function closeTray() { $('#tray').classList.remove('open'); }
function toggleTray() { trayIsOpen() ? closeTray() : openTray(); }
function renderTray() {
  const cats = $('#tr-cats'); cats.innerHTML = '';
  const mk = (v, l, col) => { const b = el('button', 'cchip' + (U.bCat === v ? ' on' : ''), l); if (col) b.style.setProperty('--c', col); b.onclick = () => { U.bCat = v; U.bSub = ''; renderTray(); }; cats.appendChild(b); };
  mk(-1, 'Tout'); D.cats.forEach((n, i) => mk(i, n, CATC[i]));
  const subs = $('#tr-subs'); subs.innerHTML = ''; subs.hidden = U.bCat < 0;
  if (U.bCat >= 0) {
    const owned = new Set([...S.owned].flatMap(i => T[i].cat === U.bCat ? T[i].subs : []));
    const mks = (v, l) => { const b = el('button', 'cchip sm' + (U.bSub === v ? ' on' : ''), l); b.style.setProperty('--c', CATC[U.bCat]); b.onclick = () => { U.bSub = v; renderTray(); }; subs.appendChild(b); };
    mks('', 'Toutes'); SUBS[U.bCat].filter(x => owned.has(x)).forEach(x => mks(x, x));
  }
  $('#tr-q').value = U.bQ; renderTrayList();
}
function renderTrayList() {
  trayOwned = S.owned.size;
  const qq = U.bQ.trim().toLowerCase(), box = $('#tr-list'); box.innerHTML = '';
  const list = [...S.owned].map(i => T[i]).filter(t => (U.bCat < 0 || t.cat === U.bCat) && (!U.bSub || t.subs.includes(U.bSub)) && (!qq || (t.name + ' ' + t.sub + ' ' + (t.theme >= 0 ? D.themes[t.theme] : '')).toLowerCase().includes(qq))).sort(sorters.cat);
  list.forEach((t, i) => { const c = tileCard(t, { cost: true, stats: true, sel: true, click: t => { selectTile(t.id); closeTray(); } }); c.style.setProperty('--i', Math.min(i, 14)); box.appendChild(c); });
  if (!list.length) box.appendChild(el('p', 'empty', 'Aucune tuile débloquée ne correspond. Ouvrez des packs pour en obtenir de nouvelles.'));
}
function refreshCosts() { document.querySelectorAll('#tr-list .cost[data-id]').forEach(c => { const t = T[+c.dataset.id], v = fmt(costOf(t)) + ' $'; c.classList.toggle('no', S.money < costOf(t)); if (c.textContent !== v) c.textContent = v; }); }

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
  if (o.cost && have && !isSimple()) c.insertAdjacentHTML('beforeend', `<div class="cost ${S.money >= costOf(t) ? '' : 'no'}" data-id="${t.id}">${fmt(costOf(t))} $</div>`);
  if (o.stats && have) c.title = statLine(t);
  if (have && holo) c.insertAdjacentHTML('beforeend', '<i class="foil"></i>');
  if (o.click) c.onclick = () => o.click(t);
  return c;
}
function statLine(t) {
  const a = [`${t.name} — ${RARN[t.s]} · portée ${t.rng >= 99 ? 'carte' : t.rng}`];
  if (t.hab) a.push('habitants ' + t.hab); if (t.capH) a.push('capacité +' + t.capH); if (t.money) a.push('gain à la pose ~' + t.money + ' $'); if (t.capM) a.push('plafond +' + t.capM);
  if (t.bM) a.push('boost argent ' + pc(t.bM)); if (t.bH) a.push('boost habitants ' + pc(t.bH)); if (t.mH) a.push('malus habitants ' + pc(-t.mH)); if (t.mM) a.push('malus argent ' + pc(-t.mM)); if (t.vote) a.push('+' + t.vote + ' vote(s)');
  return a.join(' · ');
}
function gridInto(parent, list, lim, onMore, o) {
  const g = el('div', 'grid'); list.slice(0, lim).forEach((t, i) => { const c = tileCard(t, o); c.style.setProperty('--i', Math.min(i, 30)); g.appendChild(c); }); parent.appendChild(g);
  if (list.length > lim) { const b = el('button', 'more', `Afficher plus (${list.length - lim})`); b.onclick = onMore; parent.appendChild(b); }
  if (!list.length) parent.appendChild(el('p', 'empty', 'Aucune tuile ne correspond à ces filtres.'));
}
const hillRank = t => (t.cat === 5 && t.theme < 0) ? 1 : 0;
const sorters = { cat: (a, b) => hillRank(a) - hillRank(b) || a.cat - b.cat || a.sub.localeCompare(b.sub, 'fr') || a.s - b.s || a.cost - b.cost, cost: (a, b) => a.cost - b.cost, rar: (a, b) => b.s - a.s || a.cost - b.cost, name: (a, b) => a.name.localeCompare(b.name, 'fr') };

function bonusLabel(b) {
  if (isSimple() && b.kind !== 'attr' && b.kind !== 'porte') return `Reconnaissance +${Math.round(b.val * 80)} % de chance de pack bonus`;
  return { attr: `Attractivité +${Math.round(b.val * 100)} % habitants`, rend: `Rendement +${Math.round(b.val * 100)} % argent`, pop: `Popularité +${Math.round(b.val * 100)} % votes`,
    eco: `Économie −${Math.round(b.val * 100)} % coût ${D.cats[b.ecoCat]}`, porte: 'Portée +1 case (tuiles du thème)' }[b.kind];
}
function renderAlbum(body) {
  const ob = ownedByTheme(), pct = ownedCount() / TOTAL * 100;
  const top = el('div', 'albtop', `<div><b>${ownedCount()}</b> / ${TOTAL} stickers <span class="mut">· ${agg.done} / ${D.themes.length} thèmes complets</span></div><div class="bar big"><i style="width:${pct}%"></i></div>`); body.appendChild(top);
  const cols = el('div', 'albcols'); body.appendChild(cols);
  const left = el('div', 'themes scroll'); cols.appendChild(left);
  const all = el('button', 'theme all' + (U.aTheme < 0 ? ' on' : ''), '<b>Tous les thèmes</b>'); all.onclick = () => { U.aTheme = -1; U.aLim = 90; renderMenu(); }; left.appendChild(all);
  D.themes.map((n, i) => i).sort((a, b) => D.themes[a].localeCompare(D.themes[b], 'fr')).forEach(i => {
    const b = D.themeBonus[i], done = ob[i] >= b.n, w = el('button', 'theme' + (U.aTheme === i ? ' on' : '') + (done ? ' done' : ''));
    w.style.setProperty('--hue', Math.round(themeHue(i) * 360));
    w.innerHTML = `<div class="ticon"></div><b>${esc(D.themes[i])}</b><span>${ob[i]}/${b.n}</span><div class="bar"><i style="width:${ob[i] / b.n * 100}%"></i></div><small class="${done ? 'got' : ''}">${bonusLabel(b)}</small>`;
    w.querySelector('.ticon').appendChild(thumbImg(sigTile(i)));
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
  if (U.aTheme >= 0) { const b = D.themeBonus[U.aTheme]; const ti = el('div', 'tinfo', `<div class="ticon big"></div><p><b>${esc(D.themes[U.aTheme])}</b><br>Complétez ces ${b.n} stickers pour gagner : <b>${bonusLabel(b)}</b></p>`); ti.querySelector('.ticon').appendChild(thumbImg(sigTile(U.aTheme))); right.appendChild(ti); }
  const wrap = el('div', 'scroll'); right.appendChild(wrap);
  gridInto(wrap, list, U.aLim, () => { U.aLim += 120; renderMenu(); }, { stats: true });
  const ult = T[ULT];
  if (U.aTheme < 0 && U.aCat < 0 && !U.aSub && U.aOwn === 'all' && !qq) {
    const u = el('div', 'ultcard' + (S.owned.has(ULT) ? ' open' : ''), `<b>Tuile ultime · ${ult.name}</b><span>${S.owned.has(ULT) ? 'Débloquée. Placez-la pour terminer la partie (' + fmt(ult.cost) + ' $).' : 'Se débloque quand l\'Album est complet.'}</span>`);
    wrap.prepend(u);
  }
}

function renderPacks(body) {
  const w = el('div', 'packs'), price = packPrice();
  w.appendChild(el('div', 'pk-intro', `<p>${isSimple() ? 'Les <b>points de vote</b> se gagnent uniquement en <b>aidant les habitants spéciaux</b> (2 à 3 packs selon la précision de votre aide). ' : 'Chaque habitant donne <b>1 point de vote</b> la première fois qu\'il s\'installe. '}Un pack contient <b>5 stickers d'une catégorie</b> que vous n'avez pas encore : jamais de doublon. Les stickers ★★★★ sont les plus rares.</p><p class="votes"><span class="ico">${IC.vote}</span><b id="m-votes">${fmt(S.votes)}</b> points de vote</p>`));
  const CD = ['Maisons, villas, immeubles, gratte-ciels', 'Boutiques, restaurants, stands', 'Plages, parcs, sport, attractions', 'Fermes, usines, chantiers, énergie', 'Écoles, hôpitaux, institutions', 'Routes, rails, ponts, véhicules, décor'];
  D.cats.forEach((name, c) => {
    const left = T.filter(t => !t.ult && t.cat === c && !S.owned.has(t.id)).length, tot_ = T.filter(t => !t.ult && t.cat === c).length;
    const k = el('div', 'pack'); k.style.setProperty('--pc', CATC[c]);
    k.innerHTML = `<div class="art"><i></i><i></i><i></i><b>${esc(name)}</b></div><h3>Pack ${esc(name)}</h3><p>${CD[c]}.</p><div class="bar"><i style="width:${(tot_ - left) / tot_ * 100}%"></i></div><small>${tot_ - left} / ${tot_} obtenus</small>`;
    const b = el('button', 'packbtn', left ? `Ouvrir · ${price} votes` : 'Catégorie complète'); b.dataset.price = left ? price : 99999; b.disabled = !left || S.votes < price;
    b.onclick = () => {
      if (S.votes < price) { toast('Pas assez de votes.', 'bad'); return; }
      k.classList.add('shake'); sfx('click'); b.disabled = true;
      setTimeout(() => { k.classList.remove('shake'); const out = drawPack(c); if (!out) { toast('Plus aucun sticker dans cette catégorie.', 'bad'); return; } showReveal(out); }, 420);
    };
    k.appendChild(b); w.appendChild(k);
  });
  body.appendChild(w);
}
function showReveal(cards) {
  const ov = $('#reveal'), row = $('#rcards'); ov.hidden = false; row.innerHTML = ''; let flipped = 0;
  $('#r-close').hidden = true;
  cards.forEach((t, i) => {
    const c = el('div', 'rcard r' + t.s); c.style.setProperty('--cc', CATC[t.cat]); c.style.setProperty('--i', i);
    c.innerHTML = `<div class="in"><div class="back"><span>VOXITY</span></div><div class="front"><div class="pic"></div><div class="nm">${esc(t.name)}</div><div class="meta">${stars(t)}<span>${esc(t.sub.split(',')[0])}</span></div><div class="th">${t.theme >= 0 ? esc(D.themes[t.theme]) : ''}</div><div class="new">NOUVEAU</div></div></div>`;
    const flip = () => { if (c.classList.contains('flip')) return; c.classList.add('flip'); c.querySelector('.pic').appendChild(thumbImg(t)); sfx(t.s >= 3 ? 'rare' : 'click'); if (t.s >= 3) setTimeout(() => { const r = c.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, t.s >= 4 ? 90 : 40, t.s >= 4 ? ['#ffc94a', '#fff0a8', '#ff7a45'] : ['#b08cff', '#8fd3ff', '#ff7ad9']); if (t.s >= 4) flashScreen('#ffc94a'); }, 300); if (++flipped === cards.length) { $('#r-close').hidden = false; } };
    c.onclick = flip; c._flip = flip; row.appendChild(c);
  });
  $('#r-all').onclick = () => [...row.children].forEach((c, i) => setTimeout(c._flip, i * 140));
  $('#r-close').onclick = () => { ov.hidden = true; if (menuOpen()) renderMenu(); };
}

function peopleLive() {
  if (!S.residents.length) return '<p class="empty">Aucun habitant spécial installé pour l\'instant. Le prochain arrive bientôt.</p>';
  return S.residents.map(r => { const b = BONUSES[r.bonus], rd = r.ready - now(); return `<div class="res"><span class="avatar" style="--h:${r.hue}">${esc(r.name[0])}</span><div><b>${esc(r.name)}</b> <small>${esc(r.job)} · niv. ${r.lv}</small><span>${esc(b.n)} : ${isSimple() ? b.ds(r.lv) : b.d(r.lv)}</span></div><em class="${rd <= 0 ? 'rdy' : ''}">${rd <= 0 ? 'Bonus réactivable : cliquez sur lui' : Math.ceil(rd) + ' s'}</em></div>`; }).join('');
}
function renderPeople(body) {
  const w = el('div', 'people');
  w.appendChild(el('div', 'pp-intro', isSimple() ? `<p>Les habitants spéciaux arrivent régulièrement avec une demande et <b>ne repartent jamais</b> tant que vous ne les avez pas aidés. Plus votre tuile est précise (<b>sous-catégorie</b>, <b>thème</b>, <b>tuile exacte</b>), plus vous gagnez de points de vote. Dès qu'ils s'installent, leur bonus temporaire s'active tout seul ; cliquez sur eux pour le réactiver plus tard. Ils sont archivés ici.</p>` : `<p>Un habitant spécial arrive environ toutes les 5 minutes (4 minutes pour le satisfaire). Plus votre tuile est précise, plus la récompense est grande : <b>sous-catégorie</b>, <b>thème</b>, puis <b>tuile exacte</b>. Dès qu'il s'installe, son bonus temporaire s'active tout seul ; cliquez sur lui plus tard pour le réactiver.</p>`));
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
const SIMPLE_RULES = `
<h4>Boucle principale</h4>
<ul><li>Placer librement des tuiles pour développer sa ville et répondre aux demandes des habitants.</li>
<li>Aider les habitants permet de les faire s'installer et de gagner des récompenses : des points de vote, uniquement obtenus par les missions.</li>
<li>Les points de vote servent à ouvrir des packs de stickers pour débloquer de nouvelles tuiles dans l'Album.</li>
<li>Chaque sticker débloque une nouvelle tuile, sans doublons.</li></ul>
<p class="goal">Objectif : compléter l'Album et placer la tuile ultime.</p>
<h4>Utilité des catégories</h4>
<ul><li><b>Habitations</b> : loger les habitants et développer les quartiers résidentiels.</li>
<li><b>Commerces</b> : répondre aux besoins quotidiens (manger, acheter, trouver des objets).</li>
<li><b>Loisirs</b> : satisfaire les besoins de détente, de jeu et de sociabilité.</li>
<li><b>Productions</b> : fabriquer des objets, réparer et fournir des éléments nécessaires aux missions.</li>
<li><b>Services</b> : résoudre les urgences et problèmes (incendies, santé, sécurité), prévenir ou supprimer certains malus.</li>
<li><b>Routes</b> : structurer et relier la ville, faciliter l'accès aux bâtiments et répondre aux demandes de transport.</li></ul>
<h4>Missions des habitants spéciaux</h4>
<ul><li>Ils apparaissent régulièrement et demandent de construire ou retrouver un élément (ex. caserne, restaurant, animal ou véhicule).</li>
<li>La récompense dépend de la précision : bonne sous-catégorie (minimale), bon thème (meilleure), tuile exacte (maximale).</li>
<li>Une fois aidés, ils s'installent en ville et leur bonus temporaire (ex. afflux de touristes) s'active aussitôt. Cliquer sur eux le réactive plus tard.</li>
<li>Les anti-thèmes peuvent appliquer un malus (voir « Anti-thèmes et dissonances »). Les ensembles de tuiles du même thème renforcent leurs synergies.</li>
<li>Les habitants spéciaux ne disparaissent pas et sont archivés dans l'Album.</li></ul>
<h4>Anti-thèmes et dissonances</h4>
<ul><li>Certains thèmes sont anti-thèmes entre eux, et certaines sous-catégories ou catégories se gênent aussi. Poser une tuile à moins de 3 cases d'une tuile qui la dérange provoque une <b>dissonance</b> : un malus sur ses habitants (et son gain en mode Classique).</li>
<li>Plus le conflit est précis, plus le malus est fort : <b>tuile exacte</b> −40 %, <b>thème</b> −25 %, <b>sous-catégorie</b> −14 %, <b>catégorie</b> −7 % (par tuile voisine, moins fort quand elle est loin).</li>
<li>Un habitant spécial peut détester une tuile exacte, un thème, une sous-catégorie ou une catégorie : si vous la posez pendant sa mission, le malus est d'autant plus fort que c'est précis.</li></ul>
<h4>Thèmes et Album</h4>
<ul><li>L'Album regroupe 71 thèmes. Chaque tuile placée au moins une fois devient holographique.</li>
<li>Rassembler des tuiles du même thème renforce leur synergie d'adjacence.</li>
<li>Les synergies sont optionnelles : elles donnent un bonus de +25 % aux habitants, mais n'empêchent jamais de poser une tuile.</li>
<li>Plus une tuile est rare plus elle a de portée.</li>
<li>Compléter un thème offre un bonus permanent lié.</li>
<li>Les thèmes encouragent à construire des ensembles cohérents et à trouver de meilleures solutions aux demandes des habitants.</li></ul>`;
const CLASSIC_RULES = `
<h4>Boucle principale</h4>
<ul><li>Placer des tuiles génère de l'argent (à la pose) et des habitants. Chaque habitant donne 1 point de vote pour ouvrir des packs de stickers (par catégorie, sans doublons) qui débloquent de nouvelles tuiles.</li></ul>
<p class="goal">Objectif : compléter l'Album et placer la tuile ultime.</p>
<h4>Effets et portées</h4>
<ul><li><b>Habitations</b> : habitants, capacité de population, boost d'argent des commerces voisins. Elles ne rapportent pas d'argent seules.</li>
<li><b>Commerces</b> : gros gain à la pose, plafond d'argent, quelques habitants.</li>
<li><b>Loisirs</b> : gain et habitants augmentés par le prestige (Hameau +0 % à Métropole +200 %). Tous les bonus et malus s'additionnent entre eux.</li>
<li><b>Productions</b> : boost d'argent des commerces et loisirs, malus d'habitants sur les habitations proches.</li>
<li><b>Services</b> : boost d'habitants, malus d'argent des loisirs proches.</li>
<li><b>Routes</b> : petit boost de réseau.</li>
<li><b>Portée</b> : Départ 1 case, ★ 2, ★★ 3, ★★★ 4, ★★★★ toute la carte. <b>Synergies (optionnelles)</b> : une tuile ★★ ou plus qui a des tuiles du même thème à portée (et une route à 2 cases) gagne +25 % de gain et d'habitants, sinon elle se pose quand même. <b>Adjacence</b> : +8 % par voisine du même thème.</li></ul>
<h4>Anti-thèmes et dissonances</h4>
<ul><li>Certains thèmes, sous-catégories et catégories se gênent entre eux. Poser une tuile à moins de 3 cases d'une tuile qui la dérange provoque une <b>dissonance</b> sur son gain et ses habitants : <b>tuile exacte</b> −40 %, <b>thème</b> −25 %, <b>sous-catégorie</b> −14 %, <b>catégorie</b> −7 %.</li>
<li>Un habitant spécial peut détester une tuile exacte, un thème, une sous-catégorie ou une catégorie : le malus est d'autant plus fort que c'est précis.</li></ul>
<h4>Habitants spéciaux et thèmes</h4>
<ul><li>Un habitant spécial arrive environ toutes les 5 minutes avec une demande (sous-catégorie, thème ou tuile exacte, plus la précision est bonne plus la récompense est grande). Dès qu'il s'installe, son bonus temporaire s'active tout seul (un clic le réactive plus tard). Les anti-thèmes provoquent un malus.</li>
<li>Compléter un thème offre un bonus permanent : Attractivité, Rendement, Popularité, Économie ou Portée.</li></ul>`;
function renderHelp(body) {
  const w = el('div', 'help'), sm = isSimple();
  w.innerHTML = `
  <div class="hcol"><h3>Commandes</h3>
  <dl><dt><kbd>Espace</kbd></dt><dd>Barre de construction (tuiles, filtres, recherche)</dd><dt><kbd>Échap</kbd></dt><dd>Menu (Album, ${sm ? '' : 'Packs, '}Habitants, Aide), ouvre et ferme</dd><dt>Clic gauche</dt><dd>Construire (maintenir pour tracer une ligne)</dd><dt>Clic droit + glisser</dt><dd>Se déplacer sur la carte</dd>
  <dt>Clic molette + glisser</dt><dd>Tourner la caméra</dd><dt>Molette</dt><dd>Zoomer</dd><dt><kbd>Tab</kbd></dt><dd>Basculer en mode destruction${sm ? '' : ' (remboursement de 50 %)'}</dd>
  <dt><kbd>Q</kbd> <kbd>E</kbd></dt><dd>Pivoter la tuile</dd><dt><kbd>1</kbd>–<kbd>8</kbd></dt><dd>Tuiles récentes</dd><dt>Flèches</dt><dd>Déplacer la caméra</dd></dl></div>
  <div class="hcol rules"><h3>Règles · ${sm ? 'Mode Simple' : 'Mode Classique'}</h3>${sm ? SIMPLE_RULES : CLASSIC_RULES}</div>
  <div class="hcol"><h3>Partie</h3><p>Vitesse du temps (missions, bonus, jour et nuit)</p><div id="speed2" class="speedrow"></div>
  <label class="chk"><input type="checkbox" id="hints"> Savoir tous les indices <small>(affiche le thème et la tuile exacte demandés)</small></label>
  <p class="mut">Sauvegarde automatique dans ce navigateur.</p>
  <button id="tomenu" class="ghost">Menu de départ (changer de mode)</button> <button id="reset" class="danger">Réinitialiser cette partie</button></div>`;
  body.appendChild(w);
  const sp = w.querySelector('#speed2'); [1, 2, 5, 10].forEach(s => { const b = el('button', S.speed === s ? 'on' : '', '×' + s); b.onclick = () => { S.speed = s; renderMenu(); }; sp.appendChild(b); });
  const hc = w.querySelector('#hints'); hc.checked = !!S.allHints; hc.onchange = () => { S.allHints = hc.checked; missKey = ''; uiDirty = true; };
  w.querySelector('#tomenu').onclick = () => { save(); noSave = true; location.reload(); };
  const rs = w.querySelector('#reset'); let armed = 0;
  rs.onclick = () => { if (!armed) { armed = 1; rs.textContent = 'Cliquez encore pour confirmer'; setTimeout(() => { armed = 0; rs.textContent = 'Réinitialiser cette partie'; }, 4000); } else { noSave = true; try { localStorage.removeItem(SAVEKEY); } catch (e) { } location.reload(); } };
}

/* ===== MENU DE DÉPART ===== */
function saveInfo(mode) {
  try {
    let raw = localStorage.getItem('voxity_save_v2_' + mode); if (!raw && mode === 'classic') raw = localStorage.getItem('voxity_save_v2');
    const j = JSON.parse(raw || 'null'); if (!j || j.v !== 2 || j.sig !== SIG_) return null;
    return { placed: j.placed.length, owned: j.owned.filter(i => i !== ULT).length };
  } catch (e) { return null; }
}
function showStart() {
  const box = $('#st-cards'); box.innerHTML = '';
  const defs = [
    { mode: 'simple', name: 'Mode Simple', tag: 'Détente · sans argent', accent: '#3ddbb0', lines: ['Placez librement toutes les tuiles que vous avez débloquées.', 'Aidez les habitants spéciaux : chaque mission rapporte des points de vote.', 'Les votes ouvrent des packs de stickers qui débloquent des tuiles, sans doublon.'], rules: SIMPLE_RULES },
    { mode: 'classic', name: 'Mode Classique', tag: 'Économie · votes · packs', accent: '#ff7a45', lines: ['L\'argent se gagne à chaque pose de tuile, jamais avec le temps.', 'Vos habitants donnent des votes pour ouvrir des packs par catégorie.', 'Synergies optionnelles, portées et plafonds à gérer.'], rules: CLASSIC_RULES }];
  defs.forEach((d, i) => {
    const info = saveInfo(d.mode), c = el('div', 'scard'); c.style.setProperty('--ac', d.accent); c.style.setProperty('--i', i);
    c.innerHTML = `<span class="stag">${d.tag}</span><h2>${d.name}</h2><ul>${d.lines.map(l => `<li>${l}</li>`).join('')}</ul><details><summary>Voir les règles</summary><div class="rules">${d.rules}</div></details><div class="sbtns"></div>`;
    const bt = c.querySelector('.sbtns');
    if (info) { const b = el('button', 'go', `Continuer <small>${info.placed} tuiles · ${info.owned}/${TOTAL} stickers</small>`); b.onclick = () => { sfx('click'); startGame(d.mode, false); }; bt.appendChild(b); }
    const n = el('button', info ? 'ghost' : 'go', 'Nouvelle partie'); let armed = 0;
    n.onclick = () => { if (info && !armed) { armed = 1; n.textContent = 'Écraser la sauvegarde ?'; setTimeout(() => { armed = 0; n.textContent = 'Nouvelle partie'; }, 3500); return; } sfx('click'); startGame(d.mode, true); };
    bt.appendChild(n);
    const tb = el('button', 'tutob', '▶ Tutoriel guidé'); tb.onclick = () => { sfx('click'); startGame(d.mode, true, { tuto: true }); }; bt.appendChild(tb); box.appendChild(c);
  });
  $('#start').hidden = false; $('#start').classList.remove('out');
}
function hideStart() { const s = $('#start'); s.classList.add('out'); setTimeout(() => { s.hidden = true; }, 600); }

function showWin() {
  const w = $('#win'); w.hidden = false;
  $('#win-stats').innerHTML = `<div><b>${fmt(pop())}</b><span>habitants</span></div><div><b>${ownedCount()}</b><span>stickers</span></div><div><b>${S.packs}</b><span>packs ouverts</span></div><div><b>${Math.floor(S.time / 60)} min</b><span>de jeu</span></div>`;
  $('#win-ok').onclick = () => { w.hidden = true; };
}

function buildUI() {
  const mb = $('#mbody');
  mb.addEventListener('pointermove', e => { const c = e.target.closest && e.target.closest('.card:not(.locked)'); if (!c) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.style.setProperty('--ry', ((x - .5) * 14) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 12) + 'deg'); c.style.setProperty('--fx', (x * 100) + '%'); });
  mb.addEventListener('pointerout', e => { const c = e.target.closest && e.target.closest('.card'); if (c) { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); } });
  $('#menu-close').onclick = closeMenu; $('#menu').addEventListener('pointerdown', e => { if (e.target.id === 'menu') closeMenu(); });
  $('#open-menu').onclick = () => toggleMenu();
  $('#open-tray').onclick = toggleTray; $('#tr-close').onclick = closeTray;
  $('#tr-q').oninput = () => { U.bQ = $('#tr-q').value; renderTrayList(); };
  $('#tr-list').addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.currentTarget.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  document.querySelectorAll('[data-ico]').forEach(e => e.innerHTML = IC[e.dataset.ico]);
  $('#mode').onclick = () => { S.destroy = !S.destroy; uiDirty = true; };
  refreshHUD();
}
window.__game = { iBody, get citRatio() { return citRatio; }, openTray, closeTray, avgRev,  forcePlace: (id, x, y) => { const rec = { t: id, x, y, rot: 0, h: 0, m: 0, paid: 0 }; placed.set(keyOf(x, y), rec); addObj(rec, false); }, sigTile, D, burst, confetti, banner, cits,  get S() { return S; }, T, placed, evaluate, place, destroyAt, drawPack, spawnMission, welcome, thumb, tick, recalc, get tot() { return tot; }, get agg() { return agg; }, cam, updateCamera, openMenu, selectTile, missionLevel, pop };
