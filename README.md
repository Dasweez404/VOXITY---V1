# Voxity

Jeu de construction isométrique 3D (Three.js, un seul fichier `index.html`, aucune installation).

## Jouer
Ouvrir `index.html` dans un navigateur (connexion requise pour charger Three.js depuis cdnjs et les polices Google).

| Action | Commande |
|---|---|
| Menu (Album, Packs, Habitants, Aide) | Échap |
| Barre de construction (vient du bas, filtres + recherche) | Espace |
| Construire | Clic gauche (maintenir pour tracer) |
| Se déplacer | Clic droit + glisser |
| Tourner la caméra | Clic molette + glisser |
| Mode destruction | Tab |
| Pivoter / tuiles récentes | Q, E / 1 à 8 |

## Modes de jeu
Un menu de départ propose deux modes, chacun avec sa sauvegarde :
- **Mode Simple** : placement libre (ni argent, ni votes, ni packs). Les habitants spéciaux restent en ville jusqu'à ce qu'on les aide et donnent 2, 4 ou 6 stickers selon la précision (sous-catégorie, thème, tuile exacte). Un anti-thème donne un malus (récompenses réduites 2 min) que les Services préviennent ou suppriment.
- **Mode Classique** : économie à la pose, votes, packs par catégorie (règles ci-dessous).

Chaque carte du menu propose aussi un **tutoriel guidé** (caméra, barre de construction, pose, destruction, habitants spéciaux, thèmes, Album ; et argent, votes et packs en mode Classique). Le tutoriel ne touche pas aux sauvegardes.

Les **synergies sont optionnelles** dans les deux modes : une tuile ★★ ou plus avec ses synergies (tuiles du même thème à portée, route à 2 cases) gagne +25 % de gain et d'habitants, sinon elle se pose quand même.

## Valeurs
Toutes les valeurs sont des entiers : prix et gains multiples de 5, habitants entiers, pourcentages entiers. Les bonus et malus en pourcentage s'additionnent ou se soustraient entre eux (le prestige des Loisirs va de +0 % à +200 %), jamais de multiplication entre eux.

Les **dissonances** : certains thèmes, sous-catégories et catégories se gênent entre eux. Une tuile posée à moins de 3 cases d'une tuile qui la dérange perd des habitants (et du gain) : tuile exacte −40 %, thème −25 %, sous-catégorie −14 %, catégorie −7 %. Un habitant spécial peut aussi détester une tuile, un thème, une sous-catégorie ou une catégorie, avec un malus d'autant plus fort que c'est précis. En mode Simple, les points de vote ne s'obtiennent qu'en aidant les habitants spéciaux et servent à ouvrir les packs.

## Règles clés (mode Classique)
- Une seule tuile par `Asset_Name` (la plus basse en rareté) : 865 stickers dont 48 de départ. L'Excel enrichi marque les lignes retenues dans la colonne « Tuile retenue ».
- L'argent ne se gagne qu'à la pose d'une tuile (commerces, loisirs, productions), jamais avec le temps. Les habitations ne rapportent rien seules. Sur une même case, remplacer une tuile ne rapporte que la différence avec le meilleur gain déjà perçu.
- Les packs se choisissent par catégorie uniquement (5 stickers manquants de la catégorie).

- Les habitants spéciaux demandent toujours une tuile déjà débloquée. Le thème et la tuile exacte ne sont donnés qu'en lettres masquées qui se dévoilent avec le temps ; l'option « Savoir tous les indices » (menu Aide) les affiche en entier.
- Un pavé marcheur par habitant réel (jusqu'à 600, au-delà un pavé représente plusieurs habitants, indiqué dans le HUD). Ils ne traversent pas les tuiles non marchables et ne se superposent pas (4 emplacements par case).

## Visuels
- 71 tuiles signature, une par thème (`src/themes.js`), utilisées pour les tuiles de la catégorie dominante du thème. Chaque thème a aussi son emblème dans l'Album.
- Habitants en pavés verticaux à grosse tête cubique qui sautillent et parcourent les cases marchables (colonne « Is Not Walkable » de l'Excel) et l'herbe autour de la ville (`src/fx.js`).
- Retours visuels : particules, anneaux, colonnes de lumière, secousses, textes flottants, confettis, bannières, compteurs animés, cycle jour/nuit, nuages, bateaux, fumées d'usine.

## Contenu
- `VOXITY_-_ASSETS_equilibre.xlsx` : l'Excel d'origine avec toutes les colonnes de valeurs remplies (coût, habitants, argent, plafonds, malus, bonus, portée, points de vote) pour les 1 977 tuiles.
- `tools/gen_data.py` : calcule l'équilibrage depuis l'Excel (`python3 tools/gen_data.py <xlsx source> <xlsx sortie> tools/data.json`).
- `tools/build.py` : assemble `src/*` + `tools/data.json` en `index.html`.
- `src/` : modèles procéduraux (`models.js`), règles et rendu (`game.js`), interface (`ui.js`).

Aucun modèle 3D n'étant fourni dans l'Excel, chaque tuile est générée procéduralement depuis sa catégorie, sa sous-catégorie, son thème et son identifiant. Pour utiliser de vrais modèles, remplacer `buildModel(t)` dans `src/models.js` (`t.model` est le `Model_Name` de l'Excel).
