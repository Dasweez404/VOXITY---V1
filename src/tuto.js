/* ===== TUTORIEL GUIDÉ (modes Simple et Classique) ===== */
let TU = null;
const chipSel = n => `#tr-cats .cchip:nth-child(${n})`;
const placedCat = c => [...placed.values()].some(r => T[r.t].cat === c);
function tutoSteps(mode) {
  const sm = mode === 'simple', st = [];
  const info = (title, text, hl) => st.push({ title, text, btn: true, hl });
  const go = (title, text, cond, o = {}) => st.push(Object.assign({ title, text, cond }, o));
  const pick = (cat, chipN) => () => !trayIsOpen() && S.sel < 0 ? '#open-tray' : (U.bCat !== cat ? chipSel(chipN) : '#tr-list .card:not(.locked)');
  info('Bienvenue', sm ? 'Ce tutoriel vous guide pas à pas dans le <b>mode Simple</b> : on place librement des tuiles et on aide les habitants pour gagner des stickers. Vous pouvez le quitter à tout moment.' : 'Ce tutoriel vous guide pas à pas dans le <b>mode Classique</b> : l\'argent se gagne à la pose, les habitants donnent des votes pour ouvrir des packs. Vous pouvez le quitter à tout moment.');
  go('Se déplacer', '<b>Clic droit</b> maintenu + glisser pour déplacer la carte.', () => Math.hypot(cam.x - TU.snap.x, cam.z - TU.snap.z) > 1.5);
  go('Tourner la caméra', '<b>Clic molette</b> maintenu + glisser pour tourner la vue.', () => Math.abs(cam.yaw - TU.snap.yaw) > .35);
  go('Zoomer', 'Utilisez la <b>molette</b> pour zoomer ou dézoomer.', () => Math.abs(cam.view - TU.snap.view) > 1.5);
  go('La barre de construction', 'Appuyez sur <kbd>Espace</kbd> : une barre monte du bas de l\'écran avec toutes vos tuiles, des filtres par catégorie et sous-catégorie, et une recherche.', () => trayIsOpen(), { hl: '#open-tray', enter: () => closeTray() });
  if (sm) {
    go('Choisir une tuile', 'Filtrez sur <b>Habitations</b> puis cliquez sur une tuile pour la sélectionner.', () => S.sel >= 0 && T[S.sel].cat === 0, { hl: pick(0, 2), enter: () => { if (!trayIsOpen()) openTray(); } });
    go('Poser librement', '<b>Clic gauche</b> sur la carte pour poser. En mode Simple, c\'est gratuit et sans limite : maintenez le clic pour tracer une ligne. Posez 3 tuiles.', () => placed.size >= 3);
  } else {
    go('Choisir un commerce', 'Filtrez sur <b>Commerces</b> puis choisissez-en un. Les commerces sont ce qui rapporte de l\'argent.', () => S.sel >= 0 && T[S.sel].cat === 1, { hl: pick(1, 3), enter: () => { if (!trayIsOpen()) openTray(); } });
    go('Gagner de l\'argent à la pose', '<b>Clic gauche</b> pour poser. L\'argent se gagne <b>uniquement à la pose</b>, jamais avec le temps : regardez le gain s\'afficher. Survolez une case pour voir le gain prévu avant de poser.', () => placedCat(1));
    go('Choisir une habitation', 'Les habitations ne rapportent pas d\'argent mais logent des habitants. Filtrez sur <b>Habitations</b> et choisissez-en une.', () => S.sel >= 0 && T[S.sel].cat === 0, { hl: pick(0, 2), enter: () => { if (!trayIsOpen()) openTray(); } });
    go('Loger des habitants', 'Posez-la : votre compteur d\'<b>habitants</b> augmente (jusqu\'au plafond de population).', () => placedCat(0));
    info('Les votes', 'Chaque habitant vous donne <b>1 point de vote</b> (compteur à côté de l\'argent). Les votes servent à ouvrir des <b>packs</b> de stickers pour débloquer de nouvelles tuiles.', '#st-votes');
    go('Ouvrir le menu', 'Appuyez sur <kbd>Échap</kbd> pour ouvrir le menu, puis cliquez sur l\'onglet <b>Packs</b>.', () => menuOpen() && U.tab === 'packs', { hl: () => menuOpen() ? '#tabs .tab:nth-child(2)' : '#open-menu', enter: () => { S.votes = Math.max(S.votes, 40); closeMenu(); } });
    go('Ouvrir un pack', 'Chaque pack contient <b>5 stickers d\'une catégorie</b>, sans doublon. Ouvrez-en un puis retournez les cartes.', () => S.packs >= 1, { hl: '.packbtn:not(:disabled)' });
    go('Revenir en ville', 'Fermez le résultat puis le menu (<kbd>Échap</kbd>). Les nouvelles tuiles sont dans la barre de construction.', () => $('#reveal').hidden && !menuOpen(), { hl: '#r-close' });
  }
  go('Détruire', 'Appuyez sur <kbd>Tab</kbd> pour passer en <b>mode destruction</b>' + (sm ? '.' : ' (la moitié du prix est remboursée).'), () => S.destroy, { hl: '#mode' });
  go('Revenir à la construction', 'Appuyez de nouveau sur <kbd>Tab</kbd>.', () => !S.destroy, { hl: '#mode' });
  go('Un habitant spécial arrive', 'Voici sa demande (panneau à gauche) : la <b>sous-catégorie</b> est donnée, le thème et la tuile exacte se devinent (ici tous les indices sont affichés). Posez une tuile de la bonne sous-catégorie : plus c\'est précis (thème, tuile exacte), meilleure est la récompense.', () => missionLevel().lv >= 1, { hl: '#mission', enter: () => { S.hintUntil = now() + 1e6; S.nextMission = 1e12; S.mission = null; spawnMission(); } });
  go(sm ? 'Aider l\'habitant' : 'Accueillir l\'habitant', sm ? 'Cliquez sur <b>Aider</b> : vous gagnez des <b>stickers</b>, chacun débloque une nouvelle tuile (2, 4 ou 6 selon la précision). Cliquez sur « Tout retourner » puis « Continuer ».' : 'Cliquez sur <b>Accueillir</b> : il s\'installe en ville et vous gagnez des votes et de l\'argent selon la précision.', () => S.residents.length >= 1 && $('#reveal').hidden, { hl: '#m-ok' });
  go('Le bonus de l\'habitant', 'Cliquez sur l\'habitant dans la ville (le personnage au diamant doré) pour activer son <b>bonus temporaire</b>.', () => S.residents.length && S.residents[0].ready - now() > 100, { enter: () => { S.residents.forEach(r => r.ready = 0); } });
  info('Thèmes et synergies', 'Chaque tuile appartient à l\'un des <b>71 thèmes</b>. Poser des tuiles du même thème côte à côte renforce leur <b>adjacence</b>. Les <b>synergies</b> (tuiles du même thème à portée) sont <b>optionnelles</b> : elles donnent un bonus mais ne bloquent jamais la pose. Plus une tuile est rare (★), plus sa <b>portée</b> est grande.');
  go('L\'Album', 'Ouvrez le menu (<kbd>Échap</kbd>) > <b>Album</b> : il regroupe tous les stickers et les 71 thèmes. Compléter un thème offre un <b>bonus permanent</b>. Une tuile placée au moins une fois devient holographique.', () => menuOpen() && U.tab === 'album', { hl: '#open-menu', enter: () => { closeMenu(); U.tab = 'people'; } });
  st.push({ title: 'Tutoriel terminé', text: 'Objectif du jeu : <b>compléter l\'Album</b> puis placer la <b>tuile ultime</b>. Vous pouvez lancer une vraie partie ou continuer à explorer ici (rien n\'est sauvegardé).', end: true });
  return st;
}
function startTuto(mode) {
  TU = { mode, steps: tutoSteps(mode), i: 0, t: 0, ok: false, snap: {} };
  document.body.classList.add('tuto'); tutoEnter();
}
function tutoEnter() {
  const s = TU.steps[TU.i]; TU.snap = { x: cam.x, z: cam.z, yaw: cam.yaw, view: cam.view }; TU.ok = false;
  if (s.enter) s.enter(); renderCoach();
}
function renderCoach() {
  const s = TU.steps[TU.i], n = TU.steps.length, c = $('#coach'); c.hidden = false; c.classList.remove('done'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  const btns = s.end ? '<button class="go" id="co-start">Commencer une vraie partie</button><button class="ghost" id="co-stay">Continuer à explorer</button>'
    : (s.btn ? '<button class="go" id="co-next">Suivant</button>' : '<button class="ghost" id="co-skip">Passer l\'étape</button>') + '<button class="ghost" id="co-quit">Quitter</button>';
  c.innerHTML = `<div class="co-top"><span>Tutoriel · ${TU.mode === 'simple' ? 'Mode Simple' : 'Mode Classique'}</span><span>${TU.i + 1} / ${n}</span></div><div class="bar"><i style="width:${(TU.i + 1) / n * 100}%"></i></div><h3>${s.title}</h3><p>${s.text}</p><div class="co-btns">${btns}</div>`;
  const q = id => c.querySelector(id);
  if (q('#co-next')) q('#co-next').onclick = tutoNext;
  if (q('#co-skip')) q('#co-skip').onclick = tutoNext;
  if (q('#co-quit')) q('#co-quit').onclick = () => { noSave = true; location.reload(); };
  if (q('#co-start')) q('#co-start').onclick = () => { sessionStorage.setItem('vx_auto', TU.mode + ':fresh'); noSave = true; location.reload(); };
  if (q('#co-stay')) q('#co-stay').onclick = () => { TU = null; c.hidden = true; $('#coachhl').hidden = true; document.body.classList.remove('tuto'); S.nextMission = now() + 20; S.hintUntil = 0; };
}
function tutoNext() { if (!TU) return; sfx('click'); TU.i = Math.min(TU.i + 1, TU.steps.length - 1); tutoEnter(); }
function tutoUpdate(dt) {
  if (!TU) return;
  const s = TU.steps[TU.i], hl = $('#coachhl');
  let sel = typeof s.hl === 'function' ? s.hl() : s.hl, e = sel && document.querySelector(sel);
  if (e && e.offsetParent !== null && !TU.ok) { const r = e.getBoundingClientRect(); Object.assign(hl.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); hl.hidden = false; } else hl.hidden = true;
  if (TU.ok) { TU.t -= dt; if (TU.t <= 0) tutoNext(); return; }
  if (s.cond && s.cond()) { TU.ok = true; TU.t = .9; sfx('win'); $('#coach').classList.add('done'); confetti(innerWidth / 2, 190, 30); }
}
