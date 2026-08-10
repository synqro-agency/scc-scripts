(() => {
  if ((window.scc ??= {}).horaires) return;
  window.scc.horaires = true;

  const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const numeroJour = (d) => d.getDay() || 7;
  const libelle = (d) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;

  const lireDate = (texte) => {
    const txt = (texte ?? '').trim();
    if (!txt) return null;

    const iso = txt.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);

    const fr = txt.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    if (fr) return new Date(+fr[3], +fr[2] - 1, +fr[1]);

    const d = new Date(txt);
    return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const placerExceptions = (section, lundi, dimanche) => {
    const panneaux = [...section.querySelectorAll('.horaires-pane')];

    for (const bloc of section.querySelectorAll('.horaires-exception')) {
      const item = bloc.parentNode;
      const champDate = item.querySelector('[data-horaire="date"]');
      if (!champDate) continue;

      const date = lireDate(champDate.getAttribute('data-iso') ?? champDate.textContent);
      if (!date || date < lundi || date > dimanche) continue;

      const jour = numeroJour(date);
      const cible = item.querySelector('[data-horaire="categorie"]')?.textContent.trim() ?? '';
      let pose = false;

      for (const panneau of panneaux) {
        const sien = panneau.querySelector('[data-horaire="slug"]')?.textContent.trim() ?? '';
        if (cible && cible !== sien) continue;
        const ligne = panneau.querySelector(`.horaires-row[data-jour="${jour}"]`);
        if (!ligne || ligne.querySelector('.horaires-exception')) continue;
        ligne.append(pose ? bloc.cloneNode(true) : bloc);
        pose = true;
      }
    }
  };

  const init = () => {
    const section = document.querySelector('.opening-hours-section');
    if (!section) return;

    const listePilules = section.querySelector('.horaires-cats');
    const listePanneaux = section.querySelector('.horaires-panes');
    const pilules = [...section.querySelectorAll('.horaires-cat')];
    const panneaux = [...section.querySelectorAll('.horaires-pane')];
    if (!pilules.length || !panneaux.length) return;

    const maintenant = new Date();
    const lundi = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - (numeroJour(maintenant) - 1));
    const dimanche = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 6);

    const texte = section.querySelector('.horaires-week-text');
    if (texte) texte.textContent = `${libelle(lundi)} - ${libelle(dimanche)}`;

    for (const ligne of section.querySelectorAll(`.horaires-row[data-jour="${numeroJour(maintenant)}"]`)) {
      ligne.classList.add('is-today');
    }

    placerExceptions(section, lundi, dimanche);

    const activer = (index, donnerLeFocus) => {
      pilules.forEach((pilule, i) => {
        const actif = i === index;
        pilule.classList.toggle('is-active', actif);
        pilule.setAttribute('aria-selected', String(actif));
        pilule.setAttribute('tabindex', actif ? '0' : '-1');
        if (actif && donnerLeFocus) pilule.focus({ preventScroll: true });
      });
      panneaux.forEach((panneau, i) => panneau.classList.toggle('is-visible', i === index));
    };

    listePilules?.setAttribute('role', 'tablist');
    for (const panneau of panneaux) panneau.setAttribute('role', 'tabpanel');

    pilules.forEach((pilule, i) => {
      pilule.setAttribute('role', 'tab');
      pilule.addEventListener('click', () => activer(i, false));
      pilule.addEventListener('keydown', (e) => {
        const suivant = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activer(i, false);
        } else if (suivant) {
          e.preventDefault();
          activer((i + suivant + pilules.length) % pilules.length, true);
        }
      });
    });

    activer(0, false);
    listePilules?.classList.add('is-ready');
    listePanneaux?.classList.add('is-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
