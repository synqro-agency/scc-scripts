(() => {
  if ((window.scc ??= {}).navbar) return;
  window.scc.navbar = true;

  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const burger = nav.querySelector('.navbar-burger');
  const panneau = nav.querySelector('.navbar-nav-wrap');
  const recherche = nav.querySelector('.navbar-search');
  const champ = nav.querySelector('.navbar-search-input');
  const petit = matchMedia('(max-width: 767px)');

  if (champ && !champ.getAttribute('placeholder')) {
    champ.setAttribute('placeholder', 'Que recherchez-vous ?');
  }

  const repere = document.createElement('div');
  repere.setAttribute('aria-hidden', 'true');
  repere.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  document.body.prepend(repere);

  let champFocus = false;
  const clairForce = document.querySelector('[data-navbar-clair]') !== null;

  const majClair = () => {
    nav.classList.toggle('is-clair', clairForce
      || nav.classList.contains('is-scrolled')
      || nav.classList.contains('is-searching')
      || champFocus);
  };

  majClair();

  new IntersectionObserver(([entree]) => {
    nav.classList.toggle('is-scrolled', !entree.isIntersecting);
    majClair();
    if (nav.classList.contains('is-searching')) majMarges();
  }, { threshold: 0 }).observe(repere);

  champ?.addEventListener('focus', () => {
    champFocus = true;
    majClair();
  });
  champ?.addEventListener('blur', () => {
    champFocus = false;
    majClair();
  });

  const menu = (ouvrir) => {
    nav.classList.toggle('is-menu-open', ouvrir);
    burger?.setAttribute('aria-expanded', String(ouvrir));
    document.documentElement.style.overflow = ouvrir ? 'hidden' : '';
  };

  const loupe = (ouvrir) => {
    nav.classList.toggle('is-search-open', ouvrir);
    if (ouvrir) champ?.focus();
    if (!ouvrir) viderRecherche();
  };

  burger?.addEventListener('click', () => menu(!nav.classList.contains('is-menu-open')));

  panneau?.addEventListener('click', ({ target }) => {
    if (target.closest('.navbar-link')) menu(false);
  });

  recherche?.addEventListener('click', () => {
    if (petit.matches && !nav.classList.contains('is-search-open')) loupe(true);
  });

  champ?.addEventListener('blur', () => {
    if (petit.matches && !champ.value) loupe(false);
  });

  document.addEventListener('keydown', ({ key }) => {
    if (key !== 'Escape') return;
    if (nav.classList.contains('is-menu-open')) {
      menu(false);
      burger?.focus();
    } else if (nav.classList.contains('is-search-open')) {
      loupe(false);
      champ?.blur();
    } else if (nav.classList.contains('is-searching')) {
      viderRecherche();
      champ?.focus();
    }
  });

  document.addEventListener('pointerdown', ({ target }) => {
    if (nav.classList.contains('is-searching') && !nav.contains(target)) viderRecherche();
  });

  petit.addEventListener('change', ({ matches }) => {
    if (matches) return;
    menu(false);
    loupe(false);
  });

  const MAX_RESULTATS = 6;
  const grille = nav.querySelector('[data-resultats]');
  const vide = grille?.querySelector('[data-vide]');
  const modele = grille?.querySelector('[data-modele]');
  modele?.remove();

  const sansAccent = (texte) => texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  let enseignes = null;

  const lireEnseignes = () => {
    const source = document.querySelector('[data-enseignes-source]');
    if (!source) return [];
    return [...source.querySelectorAll('.w-dyn-item')].map((el) => {
      const champTexte = (nom) => el.querySelector(`[data-s="${nom}"]`)?.textContent.trim() ?? '';
      const image = el.querySelector('[data-s="logo"]');
      const nom = champTexte('nom');
      const cat = champTexte('cat');
      return {
        nom,
        cat,
        slug: champTexte('slug'),
        logo: image && !image.classList.contains('w-dyn-bind-empty') ? image.getAttribute('src') : '',
        cle: sansAccent(`${nom} ${cat}`),
      };
    }).filter(({ nom, slug }) => nom && slug);
  };

  const chercher = (saisie) => {
    const terme = sansAccent(saisie.trim());
    if (!terme) return null;
    enseignes ??= lireEnseignes();

    const debut = [];
    const ailleurs = [];
    for (const enseigne of enseignes) {
      const place = enseigne.cle.indexOf(terme);
      if (place === 0) debut.push(enseigne);
      else if (place > 0) ailleurs.push(enseigne);
    }
    return [...debut, ...ailleurs].slice(0, MAX_RESULTATS);
  };

  const majMarges = () => {
    const barre = nav.querySelector('.navbar-search');
    if (!panneau || !barre) return;
    const cadre = panneau.getBoundingClientRect();
    const cible = barre.getBoundingClientRect();
    panneau.style.setProperty('--navbar-marge-gauche', `${Math.max(0, Math.round(cible.left - cadre.left))}px`);
    panneau.style.setProperty('--navbar-marge-droite', `${Math.max(0, Math.round(cadre.right - cible.right))}px`);
  };

  const rendre = (liste) => {
    if (!grille || !modele) return;
    for (const carte of grille.querySelectorAll('[data-carte]')) carte.remove();

    if (!liste) {
      nav.classList.remove('is-searching');
      majClair();
      return;
    }

    const lot = document.createDocumentFragment();
    for (const enseigne of liste) {
      const carte = modele.cloneNode(true);
      carte.removeAttribute('data-modele');
      carte.setAttribute('data-carte', '');
      carte.setAttribute('href', `/enseignes/${enseigne.slug}`);
      carte.querySelector('[data-r="nom"]').textContent = enseigne.nom;

      const etiquette = carte.querySelector('[data-r="cat"]');
      if (enseigne.cat) etiquette.textContent = enseigne.cat;
      else etiquette.remove();

      const logo = carte.querySelector('[data-r="logo"]');
      if (enseigne.logo) {
        logo.removeAttribute('srcset');
        logo.removeAttribute('sizes');
        logo.setAttribute('src', enseigne.logo);
        logo.alt = '';
      } else {
        carte.querySelector('[data-r="media"]')?.remove();
      }
      lot.append(carte);
    }

    grille.prepend(lot);
    if (vide) vide.style.display = liste.length ? 'none' : '';
    nav.classList.add('is-searching');
    majClair();
    majMarges();
  };

  const viderRecherche = () => {
    if (champ) champ.value = '';
    rendre(null);
  };

  champ?.addEventListener('input', () => rendre(chercher(champ.value)));
  addEventListener('resize', () => {
    if (nav.classList.contains('is-searching')) majMarges();
  });

  const MOIS = new Map(Object.entries({
    janvier: 0, fevrier: 1, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
    juillet: 6, aout: 7, août: 7, septembre: 8, octobre: 9, novembre: 10,
    decembre: 11, décembre: 11,
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6,
    august: 7, september: 8, october: 9, november: 10, december: 11,
  }));

  const lireDate = (texte) => {
    const txt = (texte ?? '').trim().toLowerCase();
    if (!txt) return null;

    const iso = txt.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return { a: +iso[1], m: +iso[2] - 1, j: +iso[3] };

    const fr = txt.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    if (fr) return { a: +fr[3], m: +fr[2] - 1, j: +fr[1] };

    let annee = null;
    let mois = null;
    let jour = null;
    for (const mot of txt.replace(/,/g, ' ').split(/\s+/)) {
      if (MOIS.has(mot)) mois = MOIS.get(mot);
      else if (/^\d{4}$/.test(mot)) annee = +mot;
      else if (/^\d{1,2}$/.test(mot) && jour === null) jour = +mot;
    }
    return annee !== null && mois !== null && jour !== null ? { a: annee, m: mois, j: jour } : null;
  };

  const enMinutes = (texte) => {
    const m = (texte ?? '').trim().match(/^(\d{1,2})[:h.](\d{2})$/);
    return m ? +m[1] * 60 + +m[2] : null;
  };

  const hhmm = (total) => {
    const h = Math.floor(total / 60) % 24;
    return `${String(h).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const numeroJour = (d) => d.getDay() || 7;

  const dateParis = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const heureParis = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  let minuterie = null;

  const demarrerBadge = () => {
    const source = document.querySelector('[data-horaires-source]');
    if (!source) return false;

    const lire = (selecteur, racine = source) => racine.querySelector(selecteur)?.textContent.trim() ?? '';
    const categorie = lire('[data-cat="nom"]');

    const exceptions = [...source.querySelectorAll('[data-horaires="exceptions"] .w-dyn-item')].map((el) => ({
      date: lireDate(lire('[data-x="date"]', el)),
      o: enMinutes(lire('[data-x="o"]', el)),
      f: enMinutes(lire('[data-x="f"]', el)),
      cat: lire('[data-x="c"]', el),
    }));

    const pourLeJour = (d, num) => {
      const exception = exceptions.find(({ date, cat }) => date
        && date.a === d.getFullYear()
        && date.m === d.getMonth()
        && date.j === d.getDate()
        && (!cat || cat === categorie));
      if (exception) return { o: exception.o, f: exception.f };
      return { o: enMinutes(lire(`[data-h="${num}o"]`)), f: enMinutes(lire(`[data-h="${num}f"]`)) };
    };

    const majBadge = () => {
      const maintenant = new Date();
      const [annee, mois, jourDuMois] = dateParis.format(maintenant).split('-').map(Number);
      const [heures, minutes] = heureParis.format(maintenant).split(':').map(Number);
      const jour = new Date(annee, mois - 1, jourDuMois);
      const courant = heures * 60 + minutes;

      const { o, f } = pourLeJour(jour, numeroJour(jour));
      let ouvert = false;
      let texte = 'Fermé';

      if (o !== null && f !== null) {
        const fin = f <= o ? f + 1440 : f;
        if (courant < o) {
          texte = `Fermé, ouvre à ${hhmm(o)}`;
        } else if (courant < fin) {
          ouvert = true;
          texte = `Ouvert ${hhmm(o)} - ${hhmm(f)}`;
        }
      }

      if (texte === 'Fermé') {
        const demain = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate() + 1);
        const { o: ouvertureDemain } = pourLeJour(demain, numeroJour(demain));
        if (ouvertureDemain !== null) texte = `Fermé, ouvre demain à ${hhmm(ouvertureDemain)}`;
      }

      for (const el of nav.querySelectorAll('.navbar-status-text')) {
        if (el.textContent !== texte) el.textContent = texte;
      }
      for (const el of nav.querySelectorAll('.navbar-status-pill, .navbar-status-mobile')) {
        el.classList.toggle('is-ferme', !ouvert);
      }
    };

    majBadge();
    clearInterval(minuterie);
    minuterie = setInterval(majBadge, 60000);
    return true;
  };

  if (!demarrerBadge()) document.addEventListener('DOMContentLoaded', demarrerBadge, { once: true });
})();
