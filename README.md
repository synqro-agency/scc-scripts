# scc-scripts

Scripts du template de site de centre commercial. Un fichier par section Webflow, servi par jsDelivr, partagé par tous les centres.

## Comment un site s'en sert

L'embed JavaScript d'une section ne contient plus qu'une ligne :

```html
<script src="https://cdn.jsdelivr.net/gh/synqro-agency/scc-scripts@1/dist/horaires.min.js" defer></script>
```

`@1` est une plage, pas une version. jsDelivr y résout le tag le plus récent de la série 1. Un correctif publié en `v1.0.1` part sur tous les centres sans que personne ouvre un site.

**Ne jamais écrire une version exacte dans un embed.** Elle fige le site et supprime tout l'intérêt du dépôt. Ne jamais écrire non plus une URL sans version, qui servirait la branche par défaut et enverrait en production le moindre commit.

## Publier un correctif

1. Modifier le fichier dans `src/`
2. `npm run build`
3. Vérifier sur le site template avant tout
4. Commit, puis `git tag v1.0.1 && git push --follow-tags`

La propagation n'est pas instantanée, jsDelivr met les plages en cache. Pour forcer, appeler l'URL de purge correspondante sur `purge.jsdelivr.net`.

**En cas de régression, corriger en avant.** Publier un `v1.0.2` qui annule, plutôt que déplacer ou supprimer un tag : un tag déplacé laisse des caches incohérents d'un centre à l'autre.

## Changement cassant

Il part en `v2`. Les sites en ligne restent sur `@1` et ne bougent pas. Ils basculent un par un en changeant l'URL de l'embed, quand ils sont prêts.

## Structure

- `src/` la source lisible, seule chose à modifier
- `dist/` le minifié, généré, **commité** puisque c'est lui que jsDelivr sert

Ne jamais retoucher `dist/` à la main.

## Règles d'écriture

ES à jour, aucun commentaire dans le code. Ce qui mérite une explication va dans la documentation, pas dans le fichier.

Chaque script s'ouvre sur un drapeau dans `window.scc`. Deux balises identiques sur une même page, cas possible si une section apparaît deux fois, exécutent le fichier deux fois : le drapeau fait que seule la première passe.

Chaque script sort de lui-même quand son élément racine est absent, il peut donc être chargé sur n'importe quelle page sans effet de bord.
