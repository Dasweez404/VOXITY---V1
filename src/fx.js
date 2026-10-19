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

/* --- habitants : pavés verticaux à tête cubique qui sautillent --- */
const citGroup = new THREE.Group(); scene.add(citGroup);
const cits = [];
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
const walkableCell = (x, y) => { if (x < 0 || y < 0 || x >= N || y >= N) return false; const r = placed.get(keyOf(x, y)); return !r || !!T[r.t].walk; };
function nearCity(x, y) { for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) if (placed.has(keyOf(x + dx, y + dy))) return true; return false; }
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const groundY = (x, y) => placed.has(keyOf(x, y)) ? .075 : .0;
function spawnCitizen() {
  const arr = [...placed.values()].filter(r => T[r.t].cat < 5); if (!arr.length) return;
  const h = arr[Math.floor(Math.random() * arr.length)], opts = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((dx || dy) && walkableCell(h.x + dx, h.y + dy)) opts.push([h.x + dx, h.y + dy]);
  if (!opts.length) return;
  const [cx, cy] = opts[Math.floor(Math.random() * opts.length)];
  const g = mkCitizen(Math.random(), 1.5), c = { g, cx, cy, tx: cx, ty: cy, ox: rand(-.2, .2), oz: rand(-.2, .2), px: 0, pz: 0, ph: rand(6), sp: rand(.7, 1.1), wait: rand(.2, 1.5), dir: 0, vy: 0, jy: 0, face: 0 };
  c.px = cx - HALF + .5 + c.ox; c.pz = cy - HALF + .5 + c.oz; g.position.set(c.px, groundY(cx, cy), c.pz); g.scale.setScalar(.001); c.born = 0; citGroup.add(g); cits.push(c);
}
function chooseNext(c) {
  const opts = DIRS.map((d, i) => [i, c.cx + d[0], c.cy + d[1]]).filter(o => walkableCell(o[1], o[2]) && nearCity(o[1], o[2]));
  if (!opts.length) { c.wait = rand(.5, 1.5); return; }
  const w = opts.map(o => o[0] === c.dir ? 3 : 1), sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum, i = 0;
  for (; i < opts.length - 1; i++) { r -= w[i]; if (r <= 0) break; }
  c.dir = opts[i][0]; c.tx = opts[i][1]; c.ty = opts[i][2];
}
function updateCitizens(dt, tn) {
  const target = placed.size ? clamp(Math.floor(pop() / 5), 0, 70) : 0;
  citT -= dt; if (citT <= 0) { citT = .35; if (cits.length < target) spawnCitizen(); else if (cits.length > target) { const c = cits.pop(); citGroup.remove(c.g); } }
  for (let i = cits.length - 1; i >= 0; i--) {
    const c = cits[i];
    if (!walkableCell(c.cx, c.cy)) { citGroup.remove(c.g); cits.splice(i, 1); continue; }
    c.born = Math.min(1, c.born + dt * 3); c.g.scale.setScalar(.001 + c.born * .999);
    const inner = c.g.userData.inner;
    if (c.wait > 0) { c.wait -= dt; if (c.wait <= 0) chooseNext(c); c.moving = false; }
    else if (c.tx === c.cx && c.ty === c.cy) chooseNext(c);
    else {
      const wx = c.tx - HALF + .5 + c.ox, wz = c.ty - HALF + .5 + c.oz, dx = wx - c.px, dz = wz - c.pz, d = Math.hypot(dx, dz), st = c.sp * dt;
      c.moving = true; c.face = Math.atan2(dx, dz);
      if (d <= st) { c.px = wx; c.pz = wz; c.cx = c.tx; c.cy = c.ty; if (Math.random() < .12) c.wait = rand(.4, 1.6); else chooseNext(c); }
      else { c.px += dx / d * st; c.pz += dz / d * st; }
      c.ph += dt * c.sp * 13;
    }
    // sautillement : rebonds secs + écrasement à l'atterrissage
    const hop = c.moving ? Math.abs(Math.sin(c.ph)) : Math.max(0, Math.sin(tn / 500 + i)) * .004;
    c.vy -= 9 * dt; c.jy = Math.max(0, c.jy + c.vy * dt); if (c.jy === 0) c.vy = 0;
    const gy = groundY(Math.round(c.px + HALF - .5 - c.ox), Math.round(c.pz + HALF - .5 - c.oz));
    c.g.position.set(c.px, (c.gy = c.gy === undefined ? gy : c.gy + (gy - c.gy) * Math.min(1, dt * 12)) + hop * .1 + c.jy, c.pz);
    const sq = c.moving ? 1 + (Math.cos(c.ph * 2)) * .06 : 1; inner.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    let da = c.face - inner.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); inner.rotation.y += da * Math.min(1, dt * 12);
    inner.rotation.z = c.moving ? Math.sin(c.ph) * .08 : 0;
  }
}
let citT = 0;
function pokeCitizen(c) { c.vy = 2.6; c.wait = Math.max(c.wait, .6); burst(c.px, .3, c.pz, 0xff7a8a, 6, .8, .045, 3); floatText(c.px, .6, c.pz, '♥', 'heart'); sfx('click'); }

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
const SKY = [[0, 0xf7c6a0, 0xffd2a0, .62, .62], [.25, 0x9fd6ee, 0xfff3dc, .8, .88], [.5, 0xf2946a, 0xff9a5a, .62, .6], [.75, 0x1b2748, 0x7f9cff, .28, .5]];
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function dayPhase() { return (.25 + S.time / 420) % 1; }
function updateSky() {
  const t = dayPhase(); let i = Math.floor(t * 4), a = SKY[i], b = SKY[(i + 1) % 4], f = t * 4 - i; f = f * f * (3 - 2 * f);
  _c1.setHex(a[1]).lerp(_c2.setHex(b[1]), f); renderer.setClearColor(_c1); scene.fog.color.copy(_c1);
  _c1.setHex(a[2]).lerp(_c2.setHex(b[2]), f); sun.color.copy(_c1); sun.intensity = a[3] + (b[3] - a[3]) * f;
  scene.children.forEach(o => { if (o.isHemisphereLight) o.intensity = a[4] + (b[4] - a[4]) * f; });
  document.body.style.setProperty('--night', (t > .55 && t < .95) ? 1 : 0);
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
