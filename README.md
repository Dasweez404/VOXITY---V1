# Voxity

Jeu de construction isométrique 3D (Three.js, un seul fichier `index.html`, aucune installation).

## Jouer
Ouvrir `index.html` dans un navigateur (connexion requise pour charger Three.js depuis cdnjs et les polices Google).

| Action | Commande |
|---|---|
| Menu (Construire, Album, Packs, Habitants, Aide) | Espace |
| Construire | Clic gauche (maintenir pour tracer) |
| Se déplacer | Clic droit + glisser |
| Tourner la caméra | Clic molette + glisser |
| Mode destruction | Tab |
| Pivoter / tuiles récentes | Q, E / 1 à 8 |

## Contenu
- `VOXITY_-_ASSETS_equilibre.xlsx` : l'Excel d'origine avec toutes les colonnes de valeurs remplies (coût, habitants, argent, plafonds, malus, bonus, portée, points de vote) pour les 1 977 tuiles.
- `tools/gen_data.py` : calcule l'équilibrage depuis l'Excel (`python3 tools/gen_data.py <xlsx source> <xlsx sortie> tools/data.json`).
- `tools/build.py` : assemble `src/*` + `tools/data.json` en `index.html`.
- `src/` : modèles procéduraux (`models.js`), règles et rendu (`game.js`), interface (`ui.js`).

Aucun modèle 3D n'étant fourni dans l'Excel, chaque tuile est générée procéduralement depuis sa catégorie, sa sous-catégorie, son thème et son identifiant. Pour utiliser de vrais modèles, remplacer `buildModel(t)` dans `src/models.js` (`t.model` est le `Model_Name` de l'Excel).
