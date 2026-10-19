/* ===== MODÈLES PROCÉDURAUX (aucun asset 3D fourni : chaque tuile est générée depuis son thème, sa catégorie et son identifiant) ===== */
const hash32 = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rngOf = seed => { let s = hash32(seed) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const hsl = (h, s, l) => new THREE.Color().setHSL(((h % 1) + 1) % 1, Math.min(1, Math.max(0, s)), Math.min(1, Math.max(0, l))).getHex();
const themeHue = i => i < 0 ? 0.3 : (i * 0.61803398) % 1;

const matCache = {};
const mat = c => matCache[c] || (matCache[c] = new THREE.MeshLambertMaterial({ color: c }));
const glow = c => matCache['g' + c] || (matCache['g' + c] = new THREE.MeshBasicMaterial({ color: c }));
const glass = c => matCache['t' + c] || (matCache['t' + c] = new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: .78 }));
let _winTex = null;
function winTex() {
  if (_winTex) return _winTex;
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 32, 32);
  x.fillStyle = '#6f93b3'; x.fillRect(7, 8, 18, 15);
  x.fillStyle = '#a9c6dd'; x.fillRect(7, 8, 18, 4);
  _winTex = new THREE.CanvasTexture(c); _winTex.wrapS = _winTex.wrapT = THREE.RepeatWrapping;
  _winTex.magFilter = THREE.NearestFilter;
  return _winTex;
}
const wallMats = {};
const wallMat = c => wallMats[c] || (wallMats[c] = new THREE.MeshLambertMaterial({ color: c, map: winTex() }));
const wallGeos = {};
function wallGeo(cols, rows) {
  const k = cols + '_' + rows;
  if (wallGeos[k]) return wallGeos[k];
  const g = new THREE.BoxGeometry(1, 1, 1), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * cols, uv.getY(i) * rows);
  return wallGeos[k] = g;
}
const G = {
  box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 14), cone: new THREE.ConeGeometry(1, 1, 12),
  pyr: new THREE.ConeGeometry(1, 1, 4), sph: new THREE.SphereGeometry(1, 12, 9), hemi: new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  prism: new THREE.CylinderGeometry(1, 1, 1, 3), tor: new THREE.TorusGeometry(1, .06, 6, 22), oct: new THREE.OctahedronGeometry(1)
};
function put(g, geom, m, sx, sy, sz, x, y, z, cast = true) {
  const o = new THREE.Mesh(geom, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = cast; g.add(o); return o;
}
const bx = (g, c, w, h, d, x, y0, z) => put(g, G.box, mat(c), w, h, d, x, y0 + h / 2, z);
const cy = (g, c, r, h, x, y0, z) => put(g, G.cyl, mat(c), r, h, r, x, y0 + h / 2, z);
const cn = (g, c, r, h, x, y0, z) => put(g, G.cone, mat(c), r, h, r, x, y0 + h / 2, z);
const sp = (g, c, r, x, y, z) => put(g, G.sph, mat(c), r, r, r, x, y, z);
const wall = (g, c, w, h, d, x, y0, z, rows = 2, cols = 2) => put(g, wallGeo(cols, rows), wallMat(c), w, h, d, x, y0 + h / 2, z);
function pyr(g, c, W, h, x, y0, z) { const o = put(g, G.pyr, mat(c), W / Math.SQRT2, h, W / Math.SQRT2, x, y0 + h / 2, z); o.rotation.y = Math.PI / 4; return o; }
function gable(g, c, w, h, d, x, y0, z) {
  const sz = h / 1.5, o = put(g, G.prism, mat(c), w / 1.732, d, sz, x, y0 + .5 * sz, z);
  o.rotation.x = -Math.PI / 2; return o;
}
function tree(g, P, x, z, sc = 1, kind) {
  const r = P.r;
  if ((kind ?? (r() < .5 ? 0 : 1)) === 0) { cy(g, 0x7a5a3a, .035 * sc, .16 * sc, x, .04, z); cn(g, hsl(.3 + r() * .06, .5, .32), .15 * sc, .34 * sc, x, .18 * sc, z); cn(g, hsl(.3 + r() * .06, .5, .38), .11 * sc, .24 * sc, x, .36 * sc, z); }
  else { cy(g, 0x7a5a3a, .035 * sc, .2 * sc, x, .04, z); sp(g, hsl(.27 + r() * .08, .5, .4), .17 * sc, x, .32 * sc, z); }
}
function palm(g, x, z, sc = 1) {
  cy(g, 0x9a7b52, .03 * sc, .45 * sc, x, .04, z);
  for (let i = 0; i < 5; i++) { const o = put(g, G.box, mat(0x3f9a4a), .22 * sc, .015, .06 * sc, x + Math.cos(i * 1.26) * .1 * sc, .5 * sc, z + Math.sin(i * 1.26) * .1 * sc); o.rotation.y = -i * 1.26; o.rotation.z = -.35; }
}
function windows(g, w, d, h, x, z) { /* porte + marquise */ }

/* Fond de tuile */
function slab(g, c, w = .98, d = .98, h = .04, y0 = 0) { return put(g, G.box, mat(c), w, h, d, 0, y0 + h / 2, 0, false); }

/* ---------- HABITATIONS ---------- */
function mkHouse(g, P, t) {
  const r = P.r, s = P.s, sub = P.sub;
  slab(g, 0xd9dccb);
  if (sub === 'Maison') {
    const w = .5 + r() * .2, d = .44 + r() * .16, h = .3 + r() * .14 + s * .03;
    wall(g, P.wall, w, h, d, 0, .04, 0, 2, 2);
    const k = r(); if (k < .4) pyr(g, P.roof, Math.max(w, d) + .12, .3, 0, .04 + h, 0); else if (k < .8) gable(g, P.roof, w + .12, .3, d + .12, 0, .04 + h, 0); else bx(g, P.roof, w + .08, .06, d + .08, 0, .04 + h, 0);
    bx(g, P.acc, .11, .18, .02, (r() - .5) * .2, .04, d / 2 + .01);
    if (r() < .6) bx(g, P.roof, .08, .2, .08, w / 4, .04 + h + .1, -d / 4);
    if (r() < .5) tree(g, P, -.38, .36, .6);
  } else if (sub === 'Résidence') {
    const w = .78, d = .62, h = .5 + s * .06;
    wall(g, P.wall, w, h, d, 0, .04, 0, 3, 4); bx(g, P.roof, w + .06, .05, d + .06, 0, .04 + h, 0);
    bx(g, P.acc, .22, .1, .2, w * .25, .04 + h + .05, 0); bx(g, 0x98a8b8, .3, .02, .3, -.2, .04 + h + .05, .1);
    cy(g, 0x7ad0e8, .09, .02, .32, .04, .36); tree(g, P, -.4, .4, .5, 1);
  } else if (sub === 'Batiment') {
    const w = .62 + r() * .18, d = .58 + r() * .16, fl = 3 + Math.floor(r() * 2 + s * .6), h = fl * .2;
    wall(g, P.wall, w, h, d, 0, .04, 0, fl, 3); bx(g, P.roof, w + .05, .05, d + .05, 0, .04 + h, 0);
    if (r() < .5) gable(g, P.roof, w, .2, d, 0, .09 + h, 0);
    bx(g, P.acc, .5 * w, .07, .05, 0, .04 + h * .5 + .02, d / 2 + .03); bx(g, 0x555e6a, .14, .16, .03, 0, .04, d / 2 + .02);
  } else if (sub === 'Villa') {
    const w = .62, d = .4, h = .34 + s * .03;
    wall(g, P.wall, w, h, d, -.1, .04, -.15, 2, 3); wall(g, P.wall, .3, h + .12, .36, .22, .04, -.12, 3, 1);
    gable(g, P.roof, w + .1, .26, d + .08, -.1, .04 + h, -.15); pyr(g, P.roof, .38, .26, .22, .16 + h, -.12);
    put(g, G.box, glass(0x6fd0ea), .5, .02, .26, 0, .05, .3, false); bx(g, 0xe9e2cf, .56, .03, .32, 0, .04, .3).scale.y = .6; tree(g, P, .4, .38, .5);
  } else { /* Gratte Ciel */
    const w = .5 + r() * .12, h = 1.5 + s * .6 + r() * .8, c = hsl(.55 + (P.hue - .5) * .15, .3, .66), fl = Math.round(h * 4);
    bx(g, 0x8a95a3, .88, .12, .88, 0, .04, 0);
    wall(g, c, w + .22, .34, w + .22, 0, .16, 0, 2, 4);
    wall(g, c, w, h, w, 0, .16, 0, fl, 3);
    if (r() < .7) wall(g, c, w * .72, h * .22, w * .72, 0, .16 + h, 0, 2, 2);
    bx(g, 0x66717f, w * .4, .05, w * .4, 0, .16 + h * 1.22, 0); cy(g, 0xcfd6de, .012, .3 + r() * .2, 0, .21 + h * 1.22, 0);
    if (s >= 3) put(g, G.sph, glow(0xffe08a), .035, .035, .035, 0, .56 + h * 1.22, 0, false);
  }
}
/* ---------- COMMERCES ---------- */
function mkShop(g, P, t) {
  const r = P.r, sub = P.sub; slab(g, 0xe3dccb);
  const stripe = (w, d, x, y, z, c1, c2) => { const n = 6; for (let i = 0; i < n; i++) { const o = bx(g, i % 2 ? c1 : c2, w / n, .03, d, x - w / 2 + w / n * (i + .5), y, z); o.rotation.x = .35; } };
  if (sub === 'Nourriture') {
    bx(g, 0x8a6a48, .6, .22, .3, 0, .04, -.12); stripe(.7, .38, 0, .36, .12, P.acc, 0xffffff);
    cy(g, 0x8a6a48, .02, .3, -.3, .04, .22); cy(g, 0x8a6a48, .02, .3, .3, .04, .22);
    for (let i = 0; i < 3; i++) bx(g, hsl(r(), .6, .55), .12, .1, .12, -.2 + i * .2, .26, -.1);
  } else if (sub === 'Mobilier') {
    const k = Math.floor(r() * 3);
    if (k === 0) { bx(g, P.acc, .5, .14, .22, 0, .04, 0); bx(g, P.acc, .5, .18, .06, 0, .1, -.1); bx(g, P.roof, .08, .1, .22, -.25, .1, 0); bx(g, P.roof, .08, .1, .22, .25, .1, 0); }
    else if (k === 1) { cy(g, 0x7a5a3a, .22, .03, 0, .24, 0); cy(g, 0x7a5a3a, .03, .22, 0, .04, 0); cy(g, P.acc, .05, .14, 0, .27, 0); }
    else { cy(g, 0x555e6a, .02, .5, 0, .04, 0); cn(g, P.acc, .2, .18, 0, .5, 0); bx(g, P.wall, .3, .06, .3, 0, .04, 0); }
  } else {
    const w = .74, d = .56, h = sub === 'Restaurant' ? .42 : .38 + (sub === 'Esthetique' ? .08 : 0);
    wall(g, P.wall, w, h, d, 0, .04, -.08, 2, 3); bx(g, P.roof, w + .06, .05, d + .06, 0, .04 + h, -.08);
    stripe(w, .22, 0, .3, d / 2 - .02, P.acc, 0xffffff);
    bx(g, 0x4a5563, .16, .2, .02, -.2, .04, d / 2 - .06); put(g, G.box, glass(0x9fd6ee), .22, .16, .02, .2, .15, d / 2 - .07);
    if (sub === 'Restaurant') { for (let i = 0; i < 2; i++) { cy(g, 0xffffff, .06, .02, -.2 + i * .4, .16, .42); cy(g, 0x7a5a3a, .01, .12, -.2 + i * .4, .04, .42); } bx(g, 0x8a7060, .09, .18, .09, .25, .04 + h, -.25); }
    if (sub === 'Esthetique') { put(g, G.cyl, mat(P.acc), .1, .02, .1, 0, .04 + h + .14, -.08, true).rotation.x = Math.PI / 2; }
    else if (sub === 'Amplette') bx(g, P.acc, .4, .1, .03, 0, .04 + h + .05, d / 2 - .1);
  }
}
/* ---------- LOISIRS ---------- */
function mkFun(g, P, t) {
  const r = P.r, sub = P.sub, n = P.name + ' ' + P.model;
  if (sub === 'Plage') {
    slab(g, 0xf0dc9c);
    if (/beach_?[0-7]|sea|water|lagoon|wave/.test(n) && r() < .55) { put(g, G.box, glass(0x4ec3e6), .98, .05, .5, 0, .045, .24, false); bx(g, 0xffffff, .98, .02, .04, 0, .09, 0); }
    const k = r();
    if (k < .35) { cy(g, 0xcfcfcf, .015, .4, -.2, .04, -.2); const o = put(g, G.cone, mat(P.acc), .22, .12, .22, -.2, .46, -.2); }
    if (k > .3 && k < .7) palm(g, .25, -.25, 1);
    if (k > .6) { bx(g, P.acc, .4, .03, .16, .1, .06, -.25); bx(g, 0xffffff, .4, .03, .1, .1, .06, -.1); }
    if (/path|walk/.test(n)) bx(g, 0xe8caa0, .3, .01, .98, 0, .04, 0);
  } else if (sub === 'Nature') {
    slab(g, 0x8fcf7a);
    if (/pond|lake|river|water|stream|fountain/.test(n) || r() < .12) { put(g, G.cyl, glass(0x56bde0), .38, .03, .38, 0, .055, 0, false); sp(g, 0x9aa5ad, .09, .22, .07, .2); }
    else if (/rock|stone|boulder/.test(n)) { for (let i = 0; i < 3; i++) put(g, G.sph, mat(0x9aa0a6), .12 + r() * .1, .1 + r() * .08, .12, -.2 + i * .2, .1, (r() - .5) * .4); }
    else { const c = 1 + Math.floor(r() * 3); for (let i = 0; i < c; i++) tree(g, P, (r() - .5) * .7, (r() - .5) * .7, .8 + r() * .5); if (r() < .5) sp(g, hsl(r(), .6, .65), .05, .2, .08, .25); }
  } else if (sub === 'Montagne') {
    slab(g, 0xa7c99a);
    const c = 1 + Math.floor(r() * 2);
    for (let i = 0; i < c; i++) { const x = c === 1 ? 0 : -.2 + i * .4, hh = .5 + r() * .5 + P.s * .08; cn(g, 0x8b8f97, .32, hh, x, .04, (r() - .5) * .2); cn(g, 0xffffff, .13, hh * .33, x, .04 + hh * .67, 0); }
    if (/ski|snow|lift|chalet/.test(n)) bx(g, 0xb44a3a, .18, .12, .14, .3, .04, .3);
  } else if (sub === 'Sport') {
    slab(g, 0xc9ceb8);
    if (/pool|swim|slide|toboggan|wave/.test(n)) { bx(g, 0xe9eef2, .9, .06, .9, 0, .04, 0); put(g, G.box, glass(0x45c7ec), .74, .02, .74, 0, .1, 0, false); if (/slide|toboggan/.test(n)) { const o = bx(g, P.acc, .12, .5, .12, -.3, .04, -.3); const a = bx(g, P.acc, .1, .06, .7, -.3, .4, 0); a.rotation.x = .5; } }
    else if (/kart|race|track|circuit|monster/.test(n)) { put(g, G.box, mat(0x4a525e), .9, .03, .9, 0, .055, 0, false); bx(g, 0xffffff, .7, .005, .04, 0, .075, 0); bx(g, P.acc, .2, .06, .1, .2, .08, .2); }
    else { const gr = /court|basket|tennis/.test(n) ? 0xd9784a : 0x58b45a; bx(g, gr, .88, .03, .66, 0, .04, 0); bx(g, 0xffffff, .8, .005, .02, 0, .075, 0); bx(g, 0xffffff, .02, .005, .56, 0, .075, 0); bx(g, 0xe7e7e7, .88, .1, .05, 0, .04, -.38); bx(g, 0xcfcfcf, .04, .2, .04, -.42, .06, 0); }
  } else { /* Divertissement */
    slab(g, 0xe4dcc8); const k = Math.floor(r() * 5);
    if (k === 0) { const o = put(g, G.tor, mat(P.acc), .34, .34, .34, 0, .5, 0); o.scale.z = .5; o.scale.set(.34, .34, 1); cy(g, 0x8a8f99, .025, .5, 0, .04, 0).rotation.z = 0; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; bx(g, hsl(r(), .7, .6), .07, .07, .06, Math.cos(a) * .34, .5 + Math.sin(a) * .34 - .035, 0); } bx(g, 0x8a8f99, .04, .5, .04, -.18, .04, 0).rotation.z = .35; bx(g, 0x8a8f99, .04, .5, .04, .18, .04, 0).rotation.z = -.35; }
    else if (k === 1) { cy(g, P.acc, .3, .08, 0, .04, 0); cy(g, 0xffffff, .04, .3, 0, .12, 0); cn(g, P.roof, .38, .2, 0, .42, 0); for (let i = 0; i < 5; i++) { const a = i * 1.256; bx(g, hsl(i * .2, .7, .6), .07, .09, .05, Math.cos(a) * .2, .14, Math.sin(a) * .2); } }
    else if (k === 2) { cn(g, P.acc, .36, .5, 0, .04, 0); cn(g, 0xffffff, .2, .25, 0, .4, 0); cy(g, 0xcfcfcf, .01, .2, 0, .66, 0); bx(g, P.roof, .1, .06, .02, .05, .8, 0); }
    else if (k === 3) { cy(g, 0xaab2bd, .06, .8 + P.s * .05, 0, .04, 0); cy(g, P.acc, .16, .08, 0, .8, 0); put(g, G.hemi, mat(P.roof), .16, .1, .16, 0, .88, 0); }
    else { cy(g, 0xcdc6b2, .3, .06, 0, .04, 0); cy(g, 0xe8e3d4, .14, .12, 0, .1, 0); put(g, G.cyl, glass(0x56bde0), .26, .03, .26, 0, .17, 0, false); cy(g, 0xd9d3c1, .03, .3, 0, .1, 0); sp(g, 0x9fdcf0, .06, 0, .46, 0); }
  }
}
/* ---------- PRODUCTIONS ---------- */
function mkProd(g, P, t) {
  const r = P.r, sub = P.sub, n = P.name.toLowerCase() + P.model;
  if (sub === 'Agriculture') {
    slab(g, 0xb89a62);
    if (/barn|storage|silo|farm/.test(n)) { wall(g, 0xb8473a, .55, .32, .45, 0, .04, 0, 1, 2); gable(g, 0x7a3a30, .62, .26, .5, 0, .36, 0); if (/silo|storage/.test(n)) { cy(g, 0xc9ced6, .12, .5, .3, .04, -.25); put(g, G.hemi, mat(0x9aa1ab), .12, .1, .12, .3, .54, -.25); } }
    else { for (let i = 0; i < 6; i++) bx(g, i % 2 ? hsl(.17, .6, .62) : hsl(.27, .5, .45), .9, .05, .1, 0, .04, -.42 + i * .17); if (r() < .5) { cy(g, 0xc9ced6, .1, .4, -.3, .09, -.3); } }
  } else if (sub === 'Chantier') {
    slab(g, 0xcbbd96);
    bx(g, 0xf2c230, .22, .1, .22, -.25, .04, .2); bx(g, 0xf2c230, .05, .75, .05, -.25, .14, .2); const j = bx(g, 0xf2c230, .7, .05, .05, 0, .86, .2); j.position.x = .05;
    bx(g, 0x555e6a, .01, .25, .01, .3, .6, .2); bx(g, 0x9a8a6a, .3, .12, .3, .25, .04, -.25);
    for (let i = 0; i < 3; i++) cn(g, 0xff7a2a, .05, .12, -.3 + i * .12, .04, -.38);
  } else if (sub === 'Energie') {
    slab(g, 0xd5dccf);
    if (/solar|panel/.test(n) || r() < .45) { for (let i = 0; i < 6; i++) { const o = bx(g, 0x2e4a7a, .36, .02, .24, -.25 + (i % 2) * .5, .18, -.3 + Math.floor(i / 2) * .3); o.rotation.x = -.5; bx(g, 0xaab2bd, .02, .12, .02, -.25 + (i % 2) * .5, .04, -.3 + Math.floor(i / 2) * .3); } }
    else if (r() < .6) { cy(g, 0xeef1f4, .04, .85 + P.s * .08, 0, .04, 0); const hub = new THREE.Group(); hub.position.set(0, .9 + P.s * .08, .06); for (let i = 0; i < 3; i++) { const b = bx(hub, 0xffffff, .04, .4, .015, 0, 0, 0); b.rotation.z = i * 2.094; b.position.set(-Math.sin(i * 2.094) * .2, Math.cos(i * 2.094) * .2, 0); } hub.userData.spin = true; g.add(hub); }
    else { const c = bx(g, 0x8b94a3, .5, .4, .5, 0, .04, 0); cy(g, 0xb8bec7, .13, .6, -.15, .44, 0); cy(g, 0xb8bec7, .13, .6, .15, .44, 0); put(g, G.hemi, mat(0xe8574a), .13, .05, .13, -.15, 1.04, 0); }
  } else if (sub === 'Fabrication') {
    slab(g, 0xccd0d6);
    wall(g, 0x9aa5b4, .8, .32, .6, 0, .04, .1, 1, 4);
    for (let i = 0; i < 3; i++) gable(g, 0x6c7886, .26, .14, .6, -.27 + i * .27, .36, .1);
    cy(g, 0xa85a46, .06, .7, -.28, .04, -.28); cy(g, 0xa85a46, .06, .55, -.08, .04, -.3);
    sp(g, 0xe6e9ee, .09, -.28, .82, -.28); sp(g, 0xf3f5f7, .07, -.24, .94, -.24);
  } else {
    slab(g, 0xd9e1ea);
    put(g, G.hemi, glass(0x8fd5ef), .34, .34, .34, 0, .04, 0); bx(g, 0xe9eef2, .4, .18, .22, -.15, .04, .32).rotation.y = .3;
    const d = cn(g, 0xffffff, .13, .1, .3, .3, -.25); d.rotation.x = Math.PI * .85; cy(g, 0x8a95a3, .015, .26, .3, .04, -.25);
    sp(g, P.acc, .05, 0, .2, 0);
  }
}
/* ---------- SERVICES ---------- */
function mkService(g, P, t) {
  const r = P.r, sub = P.sub; slab(g, 0xd9dccb);
  if (sub === 'Education') {
    wall(g, 0xe9c28a, .8, .36, .45, 0, .04, .08, 2, 5); bx(g, P.roof, .86, .05, .5, 0, .4, .08);
    wall(g, 0xe9c28a, .22, .62, .22, -.28, .04, -.12, 3, 1); pyr(g, P.roof, .28, .22, -.28, .66, -.12);
    cy(g, 0xcfd6de, .012, .38, .3, .04, .3); bx(g, P.acc, .14, .08, .01, .37, .3, .3);
  } else if (sub === 'Institution') {
    bx(g, 0xeeeade, .88, .06, .72, 0, .04, 0); wall(g, 0xf1ede2, .72, .36, .46, 0, .1, -.06, 2, 4);
    for (let i = 0; i < 5; i++) cy(g, 0xffffff, .035, .36, -.3 + i * .15, .1, .24);
    gable(g, 0xd6cfbc, .8, .22, .6, 0, .46, .02); bx(g, 0xf1ede2, .5, .05, .08, 0, .1, .36);
    cy(g, 0xcfd6de, .012, .3, 0, .68, -.1); bx(g, P.acc, .12, .07, .01, .06, .86, -.1);
  } else if (sub === 'Santé') {
    wall(g, 0xf4f6f8, .72, .5, .56, 0, .04, 0, 3, 4); bx(g, 0xc8d0d8, .76, .04, .6, 0, .54, 0);
    bx(g, 0xe03c4e, .26, .07, .02, 0, .26, .29); bx(g, 0xe03c4e, .07, .26, .02, 0, .17, .29);
    cy(g, 0xe03c4e, .12, .01, .2, .58, -.1); bx(g, 0xffffff, .08, .012, .02, .2, .6, -.1);
  } else { /* Public */
    const c = r() < .5 ? 0xc94a42 : 0x3f6fb5;
    wall(g, 0xe8e2d2, .76, .42, .5, 0, .04, 0, 2, 4); bx(g, c, .8, .06, .54, 0, .46, 0);
    bx(g, c, .5, .12, .02, 0, .26, .26); for (let i = 0; i < 2; i++) bx(g, 0x4a5563, .2, .26, .02, -.2 + i * .4, .04, .26);
    cy(g, 0xcfd6de, .012, .3, .3, .5, -.15); sp(g, 0xffd34a, .035, .3, .82, -.15);
  }
}
/* ---------- ROUTES ---------- */
function mkRoad(g, P, t) {
  const r = P.r, sub = P.sub, n = P.name.toLowerCase() + ' ' + P.model.toLowerCase();
  if (t.theme < 0) { /* colline */
    slab(g, 0x8fc977, 1, 1, .04);
    put(g, G.hemi, mat(hsl(.26 + r() * .05, .38, .47)), .46 + r() * .08, .25 + r() * .45, .46 + r() * .08, (r() - .5) * .1, .04, (r() - .5) * .1);
    if (r() < .5) tree(g, P, (r() - .5) * .3, (r() - .5) * .3, .6, 0);
    return;
  }
  const veh = t.subs.length >= 4 || /vehicle|car|truck|bus|van|tractor|digger|excavator|bike|taxi|ambulance|police|fire/.test(n);
  if (['Maritime'].includes(sub) && !veh) {
    slab(g, 0x4aa8d6, 1, 1, .06); const w = .5 + r() * .15;
    bx(g, P.wall, w, .14, .22, 0, .08, 0); bx(g, P.acc, .22, .14, .16, -.05, .22, 0); bx(g, P.roof, .1, .1, .1, .2, .22, 0);
    if (/cargo|container|barge/.test(n)) { for (let i = 0; i < 3; i++) bx(g, hsl(r(), .6, .5), .12, .1, .16, -.18 + i * .15, .22, 0); }
    if (/sail|yacht|voile|catamaran|felucca/.test(n)) { bx(g, 0xffffff, .02, .5, .24, .02, .22, 0); }
    return;
  }
  if (sub === 'Aviation') {
    slab(g, 0x7d8590, 1, 1, .04); bx(g, 0xffffff, .04, .005, .5, 0, .04, 0);
    if (/heli/.test(n)) { cy(g, P.acc, .12, .16, 0, .1, 0); bx(g, P.acc, .4, .02, .04, 0, .3, 0); bx(g, P.acc, .04, .06, .3, 0, .22, .3); }
    else { put(g, G.cyl, mat(0xf4f6f8), .07, .6 + P.s * .04, .07, 0, .17, 0).rotation.x = Math.PI / 2; bx(g, P.acc, .75, .02, .16, 0, .15, .02); bx(g, P.acc, .22, .02, .08, 0, .2, -.3); bx(g, P.acc, .02, .12, .1, 0, .2, -.3); cn(g, 0xf4f6f8, .07, .12, 0, .1, .36).rotation.x = Math.PI / 2; }
    return;
  }
  if (veh) {
    slab(g, 0x4d5560, 1, 1, .03); const c = hsl(r(), .65, .55), big = /truck|bus|digger|excavator|tractor|monster|fire/.test(n);
    const L = big ? .6 : .46; bx(g, c, L, .13, .26, 0, .08, 0); bx(g, 0xdfe9f0, L * .5, .1, .22, -L * .05, .21, 0);
    if (/digger|excavator|chantier|construction|tractor/.test(n)) { bx(g, 0xf2c230, L, .12, .26, 0, .08, 0).material = mat(0xf2c230); bx(g, 0xf2c230, .06, .3, .06, L / 2, .2, 0).rotation.z = -.5; }
    for (const [x, z] of [[-L * .3, .13], [L * .3, .13], [-L * .3, -.13], [L * .3, -.13]]) put(g, G.cyl, mat(0x22262c), .06, .04, .06, x, .06, z).rotation.x = Math.PI / 2;
    return;
  }
  /* routes (sous-catégories de réseau) et éléments */
  if (sub === 'Elements') {
    slab(g, 0xcfd4c4);
    if (/arbre|essence|bosquet|alignement/i.test(t.themeName)) { tree(g, P, 0, 0, 1.1); if (/bosquet/i.test(t.themeName)) tree(g, P, .25, .22, .8), tree(g, P, -.25, -.2, .7); }
    else if (/éclairage/i.test(t.themeName)) { cy(g, 0x4a525e, .02, .7, 0, .04, 0); put(g, G.sph, glow(0xfff0a8), .06, .06, .06, 0, .78, 0, false);
    } else if (/banc|abri/i.test(t.themeName)) { bx(g, 0x9a6b3c, .5, .04, .16, 0, .16, 0); bx(g, 0x9a6b3c, .5, .14, .03, 0, .2, -.08); bx(g, 0x4a525e, .04, .14, .14, -.2, .04, 0); bx(g, 0x4a525e, .04, .14, .14, .2, .04, 0); }
    else if (/propreté/i.test(t.themeName)) { cy(g, hsl(r(), .5, .45), .09, .26, -.12, .04, 0); cy(g, hsl(r(), .5, .45), .09, .26, .12, .04, 0); }
    else if (/fleurs|mariage/i.test(t.themeName)) { for (let i = 0; i < 6; i++) sp(g, hsl(r(), .75, .65), .06, (r() - .5) * .6, .1, (r() - .5) * .6); }
    else if (/fêtes/i.test(t.themeName)) { cy(g, 0xe8e2d2, .02, .6, 0, .04, 0); cn(g, 0x2e8b57, .18, .4, 0, .2, 0); sp(g, 0xff4a5a, .05, .08, .3, .06); sp(g, 0xffd34a, .05, -.07, .45, .05); }
    else { cy(g, 0xaab2bd, .02, .5, 0, .04, 0); bx(g, hsl(r(), .7, .5), .24, .24, .02, 0, .5, 0); }
    return;
  }
  /* ruban de route */
  const base = { Chemin: 0xb89c72, Route: 0x59616c, Autoroute: 0x434a54, Cyclisme: 0x6a737e, Ferroviaire: 0xa7a291, Pont: 0x59616c }[sub] || 0x59616c;
  slab(g, 0x8fcf7a, 1, 1, .02);
  const lift = sub === 'Pont' ? .16 : 0, Y = .02 + lift;
  if (sub === 'Pont') { bx(g, 0x59616c, 1, .06, .62, 0, .12, 0); bx(g, 0xb8bec7, 1, .08, .04, 0, .18, .3); bx(g, 0xb8bec7, 1, .08, .04, 0, .18, -.3); bx(g, 0x8a95a3, .12, .12, .5, 0, 0, 0); }
  else if (sub === 'Chemin') { put(g, G.box, mat(base), .98, .04, .42, 0, .04, 0, false); for (let i = 0; i < 5; i++) put(g, G.sph, mat(0xa58a63), .06, .02, .05, -.4 + i * .2, .06, (r() - .5) * .18, false); }
  else if (sub === 'Ferroviaire') { put(g, G.box, mat(base), .98, .04, .5, 0, .04, 0, false); for (let i = 0; i < 7; i++) bx(g, 0x6b5a45, .05, .03, .4, -.42 + i * .14, .06, 0); bx(g, 0xaab2bd, .98, .03, .025, 0, .09, .13); bx(g, 0xaab2bd, .98, .03, .025, 0, .09, -.13); }
  else if (sub === 'Autoroute') { put(g, G.box, mat(base), .98, .04, .86, 0, .04, 0, false); for (let i = 0; i < 4; i++) bx(g, 0xffffff, .12, .005, .02, -.36 + i * .24, .075, 0); bx(g, 0xf2c230, .98, .005, .02, 0, .075, .2); bx(g, 0xf2c230, .98, .005, .02, 0, .075, -.2); bx(g, 0xb8bec7, .98, .05, .02, 0, .04, .44); bx(g, 0xb8bec7, .98, .05, .02, 0, .04, -.44); }
  else if (sub === 'Cyclisme') { put(g, G.box, mat(base), .98, .04, .5, 0, .04, 0, false); bx(g, 0x3fae6a, .98, .005, .3, 0, .075, 0); bx(g, 0xffffff, .12, .005, .03, 0, .08, 0); }
  else { put(g, G.box, mat(base), .98, .04, .56, 0, .04, 0, false); for (let i = 0; i < 4; i++) bx(g, 0xffffff, .14, .005, .03, -.36 + i * .24, .075, 0); }
}

/* ---------- Tuile ultime ---------- */
function mkUltimate(g, P) {
  slab(g, 0x2a3646, 1, 1, .08);
  cy(g, 0x3a4a60, .42, .12, 0, .08, 0);
  put(g, G.box, glass(0x6fb8ff), .34, 3.2, .34, 0, 1.8, 0);
  put(g, G.box, mat(0x2d3d54), .46, .22, .46, 0, 3.5, 0); cn(g, 0xffc94a, .16, .5, 0, 3.6, 0);
  for (let i = 0; i < 3; i++) { const o = put(g, G.tor, glow(0xffc94a), .5 + i * .06, .5 + i * .06, 1, 0, 1 + i * .9, 0, false); o.rotation.x = Math.PI / 2; o.userData.spinY = true; }
  put(g, G.sph, glow(0xfff0a8), .09, .09, .09, 0, 4.2, 0, false);
}

function buildModel(t) {
  const g = new THREE.Group();
  const r = rngOf(t.model), h0 = themeHue(t.theme) + (r() - .5) * .05;
  const P = { wall: hsl(h0, .36, .8), roof: hsl(h0 + .02, .55, .42), acc: hsl(h0 + .5, .6, .55), hue: h0, s: t.s, r, name: t.name.toLowerCase(), model: t.model.toLowerCase(), sub: t.subs[0] };
  t.themeName = t.theme >= 0 ? D.themes[t.theme] : '';
  if (t.ult) mkUltimate(g, P);
  else [mkHouse, mkShop, mkFun, mkProd, mkService, mkRoad][t.cat](g, P, t);
  return g;
}
