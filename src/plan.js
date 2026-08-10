(() => {
  if ((window.scc ??= {}).plan) return;
  window.scc.plan = true;

  const NS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const BASE_FICHE = '/enseignes/';
  const FLECHE = '<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x=".5" y=".5" width="31" height="31" rx="15.5" stroke="currentColor"/><path d="M16 22.222V9.778" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 16.778L16 9.778L23 16.778" stroke="currentColor" stroke-width="1.167" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const demarrer = () => {
    const section = document.querySelector('.mall-map-section');
    if (!section) return false;

    const source = section.querySelector('[data-plan-source]');
    const scene = section.querySelector('.plan-scene');
    const hote = section.querySelector('.plan-svg');
    const bulle = section.querySelector('.plan-bulle');
    const barre = section.querySelector('.plan-etages');
    if (!source || !hote || !barre) return false;
    if (barre.dataset.pret) return true;
    barre.dataset.pret = '1';

    const bulleMedia = bulle?.querySelector('.plan-bulle-media');
    const bulleLogo = bulle?.querySelector('.plan-bulle-logo');
    const bulleNom = bulle?.querySelector('.plan-bulle-nom');

    const lire = (racine, selecteur) => racine.querySelector(selecteur)?.textContent.trim() ?? '';
    const imageDe = (racine, selecteur) => {
      const img = racine.querySelector(selecteur);
      if (!img || img.classList.contains('w-dyn-bind-empty')) return '';
      return img.getAttribute('src') ?? '';
    };

    const niveaux = [...source.querySelectorAll('[data-plan="niveaux"] .w-dyn-item')]
      .map((el) => ({
        slug: lire(el, '[data-n="slug"]'),
        nom: lire(el, '[data-n="nom"]'),
        court: lire(el, '[data-n="court"]') || lire(el, '[data-n="nom"]'),
        ordre: Number.parseInt(lire(el, '[data-n="ordre"]'), 10),
        plan: imageDe(el, '[data-n="plan"]'),
      }))
      .filter(({ plan }) => plan);

    const enseignes = [...source.querySelectorAll('[data-plan="enseignes"] .w-dyn-item')]
      .map((el) => ({
        code: lire(el, '[data-e="code"]'),
        nom: lire(el, '[data-e="nom"]'),
        niveau: lire(el, '[data-e="niveau"]'),
        fiche: lire(el, '[data-e="slug"]'),
        logo: imageDe(el, '[data-e="logo"]'),
      }))
      .filter(({ code, niveau }) => code && niveau);

    if (!niveaux.length) {
      hote.innerHTML = '<p class="plan-vide">Aucun plan disponible pour le moment.</p>';
      barre.style.display = 'none';
      return true;
    }

    const cibleSlug = document.querySelector('[data-plan-cible]')?.textContent.trim() ?? '';
    const cible = cibleSlug ? enseignes.find(({ fiche }) => fiche === cibleSlug) : null;
    let epingle = null;

    const masquerBulle = () => {
      if (epingle) montrerBulle(epingle.forme, epingle.enseigne);
      else bulle?.classList.remove('visible');
    };

    const montrerBulle = (forme, enseigne) => {
      if (!bulle) return;
      const cadre = forme.getBoundingClientRect();
      const repere = scene.getBoundingClientRect();
      bulle.style.left = `${cadre.left + cadre.width / 2 - repere.left}px`;
      bulle.style.top = `${cadre.top + cadre.height / 2 - repere.top}px`;
      if (bulleNom) bulleNom.textContent = enseigne.nom;
      if (bulleMedia) {
        bulleMedia.style.display = enseigne.logo ? '' : 'none';
        if (enseigne.logo && bulleLogo) {
          bulleLogo.setAttribute('src', enseigne.logo);
          bulleLogo.alt = '';
        }
      }
      bulle.classList.add('visible');
    };

    const poserMotif = (svg) => {
      if (svg.querySelector('#plan-hachures')) return;
      const defs = document.createElementNS(NS, 'defs');
      const motif = document.createElementNS(NS, 'pattern');
      motif.setAttribute('id', 'plan-hachures');
      motif.setAttribute('width', '7');
      motif.setAttribute('height', '7');
      motif.setAttribute('patternUnits', 'userSpaceOnUse');
      motif.setAttribute('patternTransform', 'rotate(45)');

      const fond = document.createElementNS(NS, 'rect');
      fond.setAttribute('width', '7');
      fond.setAttribute('height', '7');
      fond.setAttribute('class', 'plan-hachure-fond');

      const trait = document.createElementNS(NS, 'line');
      trait.setAttribute('x1', '0');
      trait.setAttribute('y1', '0');
      trait.setAttribute('x2', '0');
      trait.setAttribute('y2', '7');
      trait.setAttribute('stroke-width', '2.5');
      trait.setAttribute('class', 'plan-hachure-trait');

      motif.append(fond, trait);
      defs.append(motif);
      svg.prepend(defs);
    };

    const poser = (texte, niveau) => {
      hote.innerHTML = texte;
      const svg = hote.querySelector('svg');
      if (!svg) return;

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `Plan du ${niveau.nom}`);
      poserMotif(svg);

      const parCode = new Map(enseignes
        .filter(({ niveau: slug }) => slug === niveau.slug)
        .map((enseigne) => [enseigne.code, enseigne]));
      const orphelines = new Set(parCode.keys());

      for (const forme of svg.querySelectorAll('[data-emplacement]')) {
        const code = forme.getAttribute('data-emplacement');
        const enseigne = parCode.get(code);
        if (!enseigne) continue;

        orphelines.delete(code);
        forme.setAttribute('data-enseigne', enseigne.nom);

        let interactif = forme;
        if (enseigne.fiche && enseigne !== cible) {
          const url = BASE_FICHE + enseigne.fiche;
          const lien = document.createElementNS(NS, 'a');
          lien.setAttribute('href', url);
          lien.setAttributeNS(XLINK, 'xlink:href', url);
          lien.setAttribute('aria-label', `${enseigne.nom}, niveau ${niveau.court}`);
          forme.replaceWith(lien);
          lien.append(forme);
          interactif = lien;
        } else {
          forme.setAttribute('tabindex', '0');
          forme.setAttribute('role', 'img');
          forme.setAttribute('aria-label', enseigne.nom);
        }

        interactif.addEventListener('mouseenter', () => montrerBulle(forme, enseigne));
        interactif.addEventListener('focus', () => montrerBulle(forme, enseigne));
        interactif.addEventListener('mouseleave', masquerBulle);
        interactif.addEventListener('blur', masquerBulle);

        if (enseigne === cible) {
          forme.classList.add('is-cible');
          epingle = { forme, enseigne };
        }
      }

      if (epingle) montrerBulle(epingle.forme, epingle.enseigne);

      if (orphelines.size) {
        console.warn(`Plan du centre : aucune forme pour ${[...orphelines].join(', ')} sur ${niveau.nom}`);
      }
    };

    const cacheSvg = new Map();
    let courant = 0;

    const afficher = async (index) => {
      if (index < 0 || index >= niveaux.length) return;
      courant = index;

      boutons.forEach((bouton, i) => {
        bouton.classList.toggle('actif', i === index);
        bouton.setAttribute('aria-current', String(i === index));
      });
      bas.disabled = index === 0;
      haut.disabled = index === niveaux.length - 1;
      epingle = null;
      masquerBulle();

      const niveau = niveaux[index];
      if (cacheSvg.has(niveau.slug)) {
        poser(cacheSvg.get(niveau.slug), niveau);
        return;
      }
      try {
        const reponse = await fetch(niveau.plan);
        const texte = await reponse.text();
        cacheSvg.set(niveau.slug, texte);
        if (courant === index) poser(texte, niveau);
      } catch {
        hote.innerHTML = '<p class="plan-vide">Le plan de ce niveau n\'a pas pu être chargé.</p>';
      }
    };

    const bas = document.createElement('button');
    const haut = document.createElement('button');
    for (const [bouton, classe, etiquette] of [[bas, 'plan-fleche bas', 'Niveau inférieur'], [haut, 'plan-fleche', 'Niveau supérieur']]) {
      bouton.type = 'button';
      bouton.className = classe;
      bouton.innerHTML = FLECHE;
      bouton.setAttribute('aria-label', etiquette);
    }
    bas.addEventListener('click', () => afficher(courant - 1));
    haut.addEventListener('click', () => afficher(courant + 1));

    const liste = document.createElement('div');
    liste.className = 'plan-etages-liste';
    barre.append(bas, liste, haut);

    const boutons = niveaux.map((niveau, index) => {
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'plan-etage';
      bouton.textContent = niveau.court;
      bouton.setAttribute('aria-label', niveau.nom);
      bouton.addEventListener('click', () => afficher(index));
      liste.append(bouton);
      return bouton;
    });

    if (niveaux.length < 2) {
      bas.style.display = 'none';
      haut.style.display = 'none';
    }

    addEventListener('resize', () => {
      if (epingle) montrerBulle(epingle.forme, epingle.enseigne);
    });

    const surSonEtage = ({ slug }) => enseignes.some(({ niveau }) => niveau === slug);
    const indexCible = cible ? niveaux.findIndex(({ slug }) => slug === cible.niveau) : -1;
    const depart = indexCible >= 0 ? indexCible : niveaux.findIndex(({ ordre }) => ordre === 0);
    afficher(depart >= 0 ? depart : Math.max(niveaux.findIndex(surSonEtage), 0));
    return true;
  };

  if (!demarrer()) document.addEventListener('DOMContentLoaded', demarrer, { once: true });
})();
