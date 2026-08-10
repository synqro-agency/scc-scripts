(() => {
  if ((window.scc ??= {}).enseignes) return;
  window.scc.enseignes = true;

  const champ = document.querySelector('#brands-search');
  const parDefaut = new Set(['', 'Example Text']);
  if (champ && parDefaut.has(champ.getAttribute('placeholder') ?? '')) {
    champ.setAttribute('placeholder', 'Rechercher une enseigne…');
  }

  const majLiens = (racine) => {
    for (const carte of racine.querySelectorAll('.brands-card')) {
      const slug = carte.querySelector('[data-slug]')?.textContent.trim();
      if (slug) carte.setAttribute('href', `/enseignes/${slug}`);
    }
  };

  majLiens(document);
  const grille = document.querySelector('.brands-grid');
  if (grille) new MutationObserver(() => majLiens(grille)).observe(grille, { childList: true });

  for (const pilule of document.querySelectorAll('.brands-cats .brands-cat')) {
    const radio = pilule.querySelector('input[type="radio"]');
    const label = pilule.querySelector('.brands-cat-label');
    if (!radio || !label) continue;
    const valeur = label.textContent.trim();
    radio.setAttribute('fs-list-field', 'categorie');
    radio.setAttribute('fs-list-value', valeur);
    radio.value = valeur;
  }

  const tout = document.querySelector('[data-brands-tout]');
  if (!tout) return;

  const majTout = () => {
    const actif = document.querySelector('.brands-cats input[type="radio"]:checked');
    tout.classList.toggle('is-active', !actif);
  };

  majTout();
  document.addEventListener('change', majTout);
  tout.addEventListener('click', () => queueMicrotask(majTout));
  tout.addEventListener('keydown', (evenement) => {
    if (evenement.key !== 'Enter' && evenement.key !== ' ') return;
    evenement.preventDefault();
    tout.click();
  });
})();
