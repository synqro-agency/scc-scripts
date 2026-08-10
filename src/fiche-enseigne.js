(() => {
  if ((window.scc ??= {}).ficheEnseigne) return;
  window.scc.ficheEnseigne = true;

  const carte = (nom) => document.querySelector(`[data-carte="${nom}"]`);
  const vide = (el) => !el || !el.textContent.trim();

  const etiquette = document.querySelector('.brand-hero-tag');
  if (vide(etiquette)) etiquette?.remove();

  const description = document.querySelector('.brand-about-header .paragraph');
  if (vide(description)) description?.remove();

  const niveau = document.querySelector('[data-niveau]');
  const emplacement = document.querySelector('[data-emplacement]');
  if (vide(niveau) || vide(emplacement)) document.querySelector('[data-separateur]')?.remove();
  if (vide(niveau)) niveau?.remove();
  if (vide(emplacement)) emplacement?.remove();
  if (vide(niveau) && vide(emplacement)) carte('etage')?.remove();

  const site = document.querySelector('[data-site]');
  if (site) {
    site.textContent = site.textContent
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/[/?#].*$/, '');
  }

  const sansLien = (lien) => {
    const href = lien?.getAttribute('href')?.trim() ?? '';
    return !lien
      || lien.classList.contains('w-dyn-bind-empty')
      || href === ''
      || href === '#'
      || /^(tel|mailto):$/i.test(href);
  };

  for (const nom of ['telephone', 'site']) {
    if (sansLien(carte(nom)?.querySelector('a'))) carte(nom)?.remove();
  }

  for (const lien of document.querySelectorAll('.brand-about-social')) {
    if (sansLien(lien)) lien.remove();
  }
  if (!document.querySelector('.brand-about-social')) carte('reseaux')?.remove();
})();
