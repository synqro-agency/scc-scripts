(() => {
  if ((window.scc ??= {}).horairesEnseigne) return;
  window.scc.horairesEnseigne = true;

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

  const enMinutes = (texte) => {
    const m = (texte ?? '').trim().match(/^(\d{1,2})[:h.](\d{2})$/);
    return m ? +m[1] * 60 + +m[2] : null;
  };

  const hhmm = (total) => {
    const h = Math.floor(total / 60) % 24;
    return `${String(h).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const dateParis = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const heureParis = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  const jourParis = () => {
    const [annee, mois, jour] = dateParis.format(new Date()).split('-').map(Number);
    return new Date(annee, mois - 1, jour);
  };

  const minutesParis = () => {
    const [heures, minutes] = heureParis.format(new Date()).split(':').map(Number);
    return heures * 60 + minutes;
  };

  const init = () => {
    const section = document.querySelector('.brand-hours-section');
    const pane = section?.querySelector('.horaires-pane');
    if (!pane) return;

    const source = document.querySelector('[data-horaires-enseigne]');
    const champ = (cle) => source?.querySelector(`[data-h="${cle}"]`)?.textContent.trim() ?? '';

    const slug = document.querySelector('[data-plan-cible]')?.textContent.trim()
      || location.pathname.replace(/\/+$/, '').split('/').pop();

    const aujourdhui = jourParis();
    const lundi = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - (numeroJour(aujourdhui) - 1));
    const dimanche = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 6);

    const texte = section.querySelector('.horaires-week-text');
    if (texte) texte.textContent = `${libelle(lundi)} - ${libelle(dimanche)}`;

    pane.querySelector(`.horaires-row[data-jour="${numeroJour(aujourdhui)}"]`)?.classList.add('is-today');

    let exception = null;

    for (const bloc of section.querySelectorAll('[data-exceptions-source] .horaires-exception')) {
      const item = bloc.parentNode;
      const date = lireDate(item.querySelector('[data-horaire="date"]')?.textContent);
      if (!date || date < lundi || date > dimanche) continue;

      const cible = item.querySelector('[data-horaire="enseigne"]')?.textContent.trim() ?? '';
      const categorie = item.querySelector('[data-horaire="categorie"]')?.textContent.trim() ?? '';
      if (cible ? cible !== slug : categorie) continue;

      const ligne = pane.querySelector(`.horaires-row[data-jour="${numeroJour(date)}"]`);
      if (!ligne || ligne.querySelector('.horaires-exception')) continue;
      ligne.append(bloc);

      if (date.getTime() === aujourdhui.getTime()) {
        const heures = bloc.querySelector('.horaires-times');
        exception = {
          o: enMinutes(heures?.firstElementChild?.textContent),
          f: enMinutes(heures?.lastElementChild?.textContent),
        };
      }
    }

    const pastille = document.querySelector('[data-statut]');
    const carte = document.querySelector('[data-carte="horaires"]');
    const valeur = carte?.querySelector('[data-horaires]');
    const semaineVide = !source || [1, 2, 3, 4, 5, 6, 7].every((n) => enMinutes(champ(`${n}o`)) === null);

    if (semaineVide && !exception) {
      carte?.remove();
      pastille?.closest('.brand-hero-status')?.remove();
    } else {
      const maj = () => {
        const numero = numeroJour(aujourdhui);
        const o = exception ? exception.o : enMinutes(champ(`${numero}o`));
        const f = exception ? exception.f : enMinutes(champ(`${numero}f`));
        const courant = minutesParis();

        let plage = "Fermé aujourd'hui";
        let statut = "Fermé aujourd'hui";

        if (o !== null && f !== null) {
          plage = `${hhmm(o)} – ${hhmm(f)}`;
          const fin = f <= o ? f + 1440 : f;
          if (courant < o) statut = `Fermé · ouvre à ${hhmm(o)}`;
          else if (courant < fin) statut = `Ouvert · ${hhmm(o)}–${hhmm(f)}`;
          else statut = 'Fermé';
        }

        if (valeur && valeur.textContent !== plage) valeur.textContent = plage;
        if (pastille && pastille.textContent !== statut) pastille.textContent = statut;
      };

      maj();
      setInterval(maj, 60000);
    }

    source?.remove();
    section.querySelector('[data-exceptions-source]')?.remove();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
