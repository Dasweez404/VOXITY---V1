import json,os
r='/home/user/voxity/'
rd=lambda p:open(r+p,encoding='utf-8').read()
h=rd('src/template.html').replace('/*CSS*/',rd('src/style.css')).replace('/*DATA*/',rd('tools/data.json'))
h=h.replace('/*MODELS*/',rd('src/models.js')).replace('/*GAME*/',rd('src/game.js')).replace('/*UI*/',rd('src/ui.js'))
open(r+'artifact.html','w',encoding='utf-8').write(h)
open(r+'index.html','w',encoding='utf-8').write('<!doctype html>\n<html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'+h); print(len(h))
