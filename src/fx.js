/* ===== EFFETS, HABITANTS QUI MARCHENT, AMBIANCE ===== */
const hexOf = c => parseInt(c.replace('#', ''), 16);
const rand = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);

/* --- particules 3D --- */
const fxList = [];
function burst(x, y, z, color, n = 14, spd = 1.6, size = .06, grav = 5) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(G.box, mat(color)); m.scale.setScalar(size * rand(.6, 1.4)); m.position.set(x + rand(-.15, .15), y, z + rand(-.15, .15));
    m.rotation.set(rand(6), rand(6), rand(6)); scene.add(m);
    fxList.push({ m, vx: rand(-1, 1) * spd, vy: rand(.8, 1.8) * spd, vz: rand(-1, 1) * spd, g: grav, life: rand(.6, 1.1), age: 0, s0: m.scale.x });
  }
  while (fxList.length > 260) { const o = fxList.shift(); scene.remove(o.m); }
}
function ring(x, z, color, size = 1) {
  const m = new THREE.Mesh(new THREE.RingGeometry(.34, .42, 36), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, .1, z); scene.add(m); fxList.push({ m, ring: true, life: .65, age: 0, size });
}
function pillar(x, z, color) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 3, 16, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(x, 1.5, z); scene.add(m); fxList.push({ m, pillar: true, life: .8, age: 0 });
}
function updateFx(dt) {
  for (let i = fxList.length - 1; i >= 0; i--) {
    const f = fxList[i]; f.age += dt; const a = f.age / f.life;
    if (a >= 1) { scene.remove(f.m); if (f.m.geometry && (f.ring || f.pillar)) { f.m.geometry.dispose(); f.m.material.dispose(); } fxList.splice(i, 1); continue; }
    if (f.ring) { const s = 1 + a * 3.2 * f.size; f.m.scale.set(s, s, 1); f.m.material.opacity = .9 * (1 - a); }
    else if (f.pillar) { f.m.scale.set(1 + a * .6, 1 + a * .3, 1 + a * .6); f.m.material.opacity = .5 * (1 - a); }
    else if (f.smoke) { f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.position.z += f.vz * dt; f.m.scale.setScalar(.05 + a * .22); f.m.material.opacity = .75 * (1 - a); }
    else { f.vy -= f.g * dt; f.m.position.x += f.vx * dt; f.m.position.y = Math.max(.03, f.m.position.y + f.vy * dt); f.m.position.z += f.vz * dt; f.m.rotation.x += dt * 6; f.m.rotation.y += dt * 4; f.m.scale.setScalar(f.s0 * (1 - a * a)); }
  }
}
/* --- textes flottants et confettis (DOM / canvas 2D) --- */
function floatAt(px, py, text, cls = '', delay = 0) {
  setTimeout(() => { const e = document.createElement('div'); e.className = 'ft ' + cls; e.textContent = text; e.style.left = px + 'px'; e.style.top = py + 'px'; document.getElementById('fx').appendChild(e); setTimeout(() => e.remove(), 1500); }, delay);
}
const _v = new THREE.Vector3();
function floatText(x, y, z, text, cls = '', delay = 0) { _v.set(x, y, z).project(camera); floatAt((_v.x + 1) / 2 * innerWidth, (1 - _v.y) / 2 * innerHeight, text, cls, delay); }
const cfc = document.getElementById('confetti'), cfx = cfc.getContext('2d'), cf = [];
function confetti(px, py, n = 60, pal) {
  pal = pal || ['#ff7a45', '#ffc94a', '#3ddbb0', '#b08cff', '#5cb8ff', '#ff7a8a'];
  for (let i = 0; i < n; i++) { const a = rand(Math.PI * 2), s = rand(180, 620); cf.push({ x: px, y: py, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 260, w: rand(5, 11), h: rand(3, 7), r: rand(6), vr: rand(-12, 12), c: pal[Math.floor(rand(pal.length))], life: rand(1.2, 2.2), age: 0 }); }
}
function updateConfetti(dt) {
  if (cfc.width !== innerWidth || cfc.height !== innerHeight) { cfc.width = innerWidth; cfc.height = innerHeight; }
  cfx.clearRect(0, 0, cfc.width, cfc.height); if (!cf.length) return;
  for (let i = cf.length - 1; i >= 0; i--) {
    const p = cf[i]; p.age += dt; if (p.age > p.life) { cf.splice(i, 1); continue; }
    p.vy += 900 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    cfx.save(); cfx.globalAlpha = Math.min(1, (p.life - p.age) * 2); cfx.translate(p.x, p.y); cfx.rotate(p.r); cfx.fillStyle = p.c; cfx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1); cfx.restore();
  }
}
let bannerT = 0;
function banner(title, sub, kind = '') {
  const b = document.getElementById('banner'); b.className = ''; void b.offsetWidth;
  b.innerHTML = `<b>${esc(title)}</b><span>${esc(sub || '')}</span>`; b.className = 'show ' + kind;
  clearTimeout(bannerT); bannerT = setTimeout(() => b.className = '', 3200);
  confetti(innerWidth / 2, innerHeight * .35, 90);
}
function flashScreen(color = '#ffc94a') { const f = document.getElementById('flash'); f.style.setProperty('--fc', color); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }

/* --- habitants : pavés verticaux à tête cubique qui sautillent (un pavé par habitant, rendu en instances) --- */
const MAXC = 600, CS = .6;
const SKIN = [0xf5cfa8, 0xe0a97c, 0xb97a4e, 0x8a5634, 0xffe2cc], HAIR = [0x2a1d14, 0x5a3a22, 0xc9922a, 0x1a1a1f, 0xb0402a, 0xe8e0d0];
function mkCitizen(hue, sc = 1, hat = false) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const clothes = hsl(hue, .6, .55), pick_ = a => a[Math.floor(Math.random() * a.length)];
  put(inner, G.box, mat(clothes), .1 * sc, .17 * sc, .07 * sc, 0, .125 * sc, 0);
  put(inner, G.box, mat(hsl(hue + .08, .4, .3)), .095 * sc, .05 * sc, .065 * sc, 0, .05 * sc, 0);
  put(inner, G.box, mat(pick_(SKIN)), .135 * sc, .125 * sc, .125 * sc, 0, .3 * sc, 0);
  put(inner, G.box, mat(pick_(HAIR)), .142 * sc, .04 * sc, .132 * sc, 0, .375 * sc, 0);
  for (const x of [-.032, .032]) put(inner, G.box, mat(0x1b1b22), .02 * sc, .024 * sc, .01 * sc, x * sc, .31 * sc, .064 * sc, false);
  if (hat) { put(inner, G.box, mat(0x394a60), .16 * sc, .02 * sc, .16 * sc, 0, .39 * sc, 0); put(inner, G.box, mat(0x394a60), .1 * sc, .07 * sc, .1 * sc, 0, .43 * sc, 0); }
  g.userData.inner = inner; return g;
}
const mkInst = () => { const m = new THREE.InstancedMesh(G.box, new THREE.MeshLambertMaterial({ color: 0xffffff }), MAXC); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); m.count = 0; m.frustumCulled = false; m.castShadow = false; scene.add(m); return m; };
const iBody = mkInst(), iHead = mkInst(), iHair = mkInst(), cits = [], occ = new Set(), SLOT = [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]];
let citRatio = 1, citT = 0;
const walkableCell = (x, y) => { if (x < 0 || y < 0 || x >= N || y >= N) return false; const r = placed.get(keyOf(x, y)); return !r || !!T[r.t].walk; };
function nearCity(x, y) { for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) if (placed.has(keyOf(x + dx, y + dy))) return true; return false; }
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const groundY = (x, y) => placed.has(keyOf(x, y)) ? .075 : .0;
const slotKey = (x, y, s) => (x + y * N) * 4 + s;
function freeSlot(x, y) { const o = Math.floor(Math.random() * 4); for (let i = 0; i < 4; i++) { const s = (o + i) % 4; if (!occ.has(slotKey(x, y, s))) return s; } return -1; }
const _col = new THREE.Color();
function setCols(i, c) { iBody.setColorAt(i, _col.setHex(c.cl)); iHead.setColorAt(i, _col.setHex(c.sk)); iHair.setColorAt(i, _col.setHex(c.hr)); [iBody, iHead, iHair].forEach(m => { if (m.instanceColor) m.instanceColor.needsUpdate = true; }); }
function spawnCitizen() {
  const arr = [...placed.values()].filter(r => T[r.t].cat < 5); if (!arr.length) return false;
  const h = arr[Math.floor(Math.random() * arr.length)], opts = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && walkableCell(h.x + dx, h.y + dy)) { const s = freeSlot(h.x + dx, h.y + dy); if (s >= 0) opts.push([h.x + dx, h.y + dy, s]); }
  if (!opts.length) return false;
  const [cx, cy, sl] = opts[Math.floor(Math.random() * opts.length)];
  const c = { cx, cy, sl, tx: cx, ty: cy, ts: sl, px: cx - HALF + .5 + SLOT[sl][0], pz: cy - HALF + .5 + SLOT[sl][1], ph: rand(6), sp: rand(.5, .8), wait: rand(.2, 1.5), dir: 0, vy: 0, jy: 0, face: rand(6), born: 0, gy: groundY(cx, cy),
    cl: hsl(Math.random(), .6, .55), sk: SKIN[Math.floor(rand(SKIN.length))], hr: HAIR[Math.floor(rand(HAIR.length))] };
  occ.add(slotKey(cx, cy, sl)); cits.push(c); setCols(cits.length - 1, c); return true;
}
function removeCitizen(i) {
  const c = cits[i]; occ.delete(slotKey(c.cx, c.cy, c.sl)); if (c.tx !== c.cx || c.ty !== c.cy) occ.delete(slotKey(c.tx, c.ty, c.ts));
  const last = cits.pop(); if (i < cits.length) { cits[i] = last; setCols(i, last); }
}
function chooseNext(c) {
  const opts = [];
  DIRS.forEach((d, i) => { const nx = c.cx + d[0], ny = c.cy + d[1]; if (walkableCell(nx, ny) && nearCity(nx, ny)) { const s = freeSlot(nx, ny); if (s >= 0) opts.push([i, nx, ny, s, (placed.has(keyOf(nx, ny)) ? 3 : 1) * (i === c.dir ? 3 : 1)]); } });
  if (!opts.length) { c.wait = rand(.5, 1.5); return; }
  const sum = opts.reduce((a, o) => a + o[4], 0); let r = Math.random() * sum, k = 0;
  for (; k < opts.length - 1; k++) { r -= opts[k][4]; if (r <= 0) break; }
  const o = opts[k]; c.dir = o[0]; c.tx = o[1]; c.ty = o[2]; c.ts = o[3]; occ.add(slotKey(o[1], o[2], o[3]));
}
const _m = new THREE.Matrix4(), _b = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _o = new THREE.Matrix4();
function put3(mesh, i, base, ox, oy, sx, sy, sz) { _o.makeTranslation(ox, oy, 0); _b.multiplyMatrices(base, _o); _s.set(sx, sy, sz); _b.scale(_s); mesh.setMatrixAt(i, _b); }
function updateCitizens(dt, tn) {
  const p = Math.floor(pop()); citRatio = Math.max(1, Math.ceil(p / MAXC));
  const target = placed.size ? Math.min(MAXC, Math.ceil(p / citRatio)) : 0;
  for (let k = 0; k < 8; k++) { if (cits.length < target) { if (!spawnCitizen()) break; } else if (cits.length > target) removeCitizen(cits.length - 1); else break; }
  for (let i = cits.length - 1; i >= 0; i--) {
    const c = cits[i];
    if (!walkableCell(c.cx, c.cy)) { removeCitizen(i); continue; }
    c.born = Math.min(1, c.born + dt * 3);
    if (c.wait > 0) { c.wait -= dt; if (c.wait <= 0) chooseNext(c); c.moving = false; }
    else if (c.tx === c.cx && c.ty === c.cy) chooseNext(c);
    else if (!walkableCell(c.tx, c.ty)) { occ.delete(slotKey(c.tx, c.ty, c.ts)); c.tx = c.cx; c.ty = c.cy; c.wait = .4; }
    else {
      const wx = c.tx - HALF + .5 + SLOT[c.ts][0], wz = c.ty - HALF + .5 + SLOT[c.ts][1], dx = wx - c.px, dz = wz - c.pz, d = Math.hypot(dx, dz), st = c.sp * dt;
      c.moving = true; c.face = Math.atan2(dx, dz);
      if (d <= st) { c.px = wx; c.pz = wz; occ.delete(slotKey(c.cx, c.cy, c.sl)); c.cx = c.tx; c.cy = c.ty; c.sl = c.ts; if (Math.random() < .12) c.wait = rand(.4, 1.6); else chooseNext(c); }
      else { c.px += dx / d * st; c.pz += dz / d * st; c.ph += dt * c.sp * 15; }
    }
  }
  for (let i = 0; i < cits.length; i++) {
    const c = cits[i], hop = c.moving ? Math.abs(Math.sin(c.ph)) : 0;
    c.vy -= 9 * dt; c.jy = Math.max(0, c.jy + c.vy * dt); if (c.jy === 0) c.vy = 0;
    const gy = groundY(Math.floor(c.px + HALF), Math.floor(c.pz + HALF)); c.gy += (gy - c.gy) * Math.min(1, dt * 12);
    let da = c.face - (c.fa || 0); da = Math.atan2(Math.sin(da), Math.cos(da)); c.fa = (c.fa || 0) + da * Math.min(1, dt * 12);
    const sq = c.moving ? 1 + Math.cos(c.ph * 2) * .07 : 1, sx = 1 / Math.sqrt(sq), bs = c.born;
    _e.set(0, c.fa, c.moving ? Math.sin(c.ph) * .08 : 0); _q.setFromEuler(_e); _p.set(c.px, c.gy + hop * .06 + c.jy, c.pz); _s.set(bs, bs * sq, bs);
    _m.compose(_p, _q, _s);
    put3(iBody, i, _m, 0, .125 * CS, .1 * CS, .17 * CS, .07 * CS);
    put3(iHead, i, _m, 0, .3 * CS, .135 * CS, .125 * CS, .125 * CS);
    put3(iHair, i, _m, 0, .375 * CS, .142 * CS, .04 * CS, .132 * CS);
  }
  iBody.count = iHead.count = iHair.count = cits.length;
  iBody.instanceMatrix.needsUpdate = iHead.instanceMatrix.needsUpdate = iHair.instanceMatrix.needsUpdate = true;
}
function pokeCitizen(i) { const c = cits[i]; if (!c) return; c.vy = 2.2; c.wait = Math.max(c.wait, .6); burst(c.px, .3, c.pz, 0xff7a8a, 6, .8, .045, 3); floatText(c.px, .5, c.pz, '♥', 'heart'); sfx('click'); }

/* --- ambiance : ciel, nuages, bateaux, fumées, écume --- */
const clouds = [], boats = [];
(function () {
  const cmat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }); window.__cloudMat = cmat;
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group(), n = 3 + Math.floor(rand(3));
    for (let j = 0; j < n; j++) { const m = new THREE.Mesh(G.sph, cmat); m.scale.set(rand(1.2, 2), rand(.6, 1), rand(1, 1.6)); m.position.set(j * 1.4 - n * .7, rand(-.2, .3), rand(-.5, .5)); g.add(m); }
    g.position.set(rand(-60, 60), rand(16, 22), rand(-60, 60)); g.userData.sp = rand(.3, .8); scene.add(g); clouds.push(g);
  }
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Group(); put(b, G.box, mat(0xffffff), .9, .22, .4, 0, .1, 0); put(b, G.box, mat(hsl(rand(1), .6, .5)), .9, .06, .42, 0, .22, 0); put(b, G.box, mat(0xffffff), .04, 1, .5, .1, .7, 0); b.userData.a = rand(6.28); b.userData.r = N / 2 + 4 + i * 2.5; b.userData.sp = rand(.015, .03) * (i % 2 ? -1 : 1);
    b.position.y = -1.2; scene.add(b); boats.push(b);
  }
  const foam = new THREE.Mesh(new THREE.BoxGeometry(N + 1.6, .05, N + 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45 })); foam.position.y = -1.22; foam.name = 'foam'; scene.add(foam);
})();
const SKY = [[0, 0xf7c6a0, 0xffd2a0, .6, .44, .2], [.25, 0x9fd6ee, 0xfff0d6, .85, .5, .25], [.5, 0xf2946a, 0xff9a5a, .65, .4, .2], [.75, 0x1b2748, 0x8fa8ff, .25, .4, .35]];
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function dayPhase() { return (.25 + S.time / 420) % 1; }
let lastNight = -1;
function nightK(t) { return t < .75 ? clamp((t - .45) / .15, 0, 1) : clamp((1 - t) / .12, 0, 1); }
function updateSky() {
  const t = dayPhase(); let i = Math.floor(t * 4), a = SKY[i], b = SKY[(i + 1) % 4], f = t * 4 - i; f = f * f * (3 - 2 * f);
  _c1.setHex(a[1]).lerp(_c2.setHex(b[1]), f); renderer.setClearColor(_c1); scene.fog.color.copy(_c1);
  _c1.setHex(a[2]).lerp(_c2.setHex(b[2]), f); sun.color.copy(_c1); sun.intensity = a[3] + (b[3] - a[3]) * f;
  hemi.intensity = a[4] + (b[4] - a[4]) * f; fill.intensity = a[5] + (b[5] - a[5]) * f;
  const k = nightK(t);
  if (Math.abs(k - lastNight) > .01) { lastNight = k; Object.values(wallMats).forEach(m => m.emissive.setRGB(k, k * .82, k * .45)); }
}
const smokers = new Map(); let smokeT = 0;
function updateAmbient(dt, tn) {
  window.__cloudMat.opacity = clamp((cam.view - 20) / 14, 0, .8);
  clouds.forEach(c => { c.position.x += c.userData.sp * dt; if (c.position.x > 70) c.position.x = -70; });
  boats.forEach(b => { b.userData.a += b.userData.sp * dt; const r = b.userData.r; b.position.x = Math.cos(b.userData.a) * r; b.position.z = Math.sin(b.userData.a) * r; b.rotation.y = -b.userData.a + (b.userData.sp > 0 ? 0 : Math.PI); b.position.y = -1.2 + Math.sin(tn / 600 + r) * .05; });
  const foam = scene.getObjectByName('foam'); if (foam) foam.material.opacity = .35 + Math.sin(tn / 900) * .12;
  smokeT -= dt;
  if (smokeT <= 0 && smokers.size) {
    smokeT = .25; const arr = [...smokers.values()], h = arr[Math.floor(Math.random() * arr.length)], pts = h.userData.smoke, p = pts[Math.floor(Math.random() * pts.length)];
    if (h.position.distanceTo(new THREE.Vector3(cam.x, 0, cam.z)) < cam.view * 1.2) {
      const m = new THREE.Mesh(G.sph, new THREE.MeshBasicMaterial({ color: 0xe8ecf0, transparent: true, opacity: .8, depthWrite: false })); m.scale.setScalar(.05);
      const lp = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(h.matrixWorld); m.position.copy(lp); scene.add(m);
      fxList.push({ m, puff: true, vx: rand(.05, .2), vy: .35, vz: rand(-.05, .05), g: 0, life: 2.2, age: 0, s0: .05, smoke: true });
    }
  }
}
function fxUpdate(dt, tn) {
  updateFx(dt); updateConfetti(dt); updateCitizens(dt, tn); updateAmbient(dt, tn); updateSky();
  if (cam.shake > 0) { cam.shake = Math.max(0, cam.shake - dt * 2.2); updateCamera(); }
}
