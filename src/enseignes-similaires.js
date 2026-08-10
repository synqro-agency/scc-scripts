(() => {
  if ((window.scc ??= {}).enseignesSimilaires) return;
  window.scc.enseignesSimilaires = true;

  const init = () => {
    const section = document.querySelector('.brand-related-section');
    if (!section) return;

    const ici = location.pathname.replace(/\/+$/, '');
    let gardees = 0;

    for (const item of [...(section.querySelector('.brands-grid')?.children ?? [])]) {
      const carte = item.querySelector('.brands-card');
      const slug = carte?.querySelector('[data-slug]')?.textContent.trim() ?? '';
      const lien = slug ? `/enseignes/${slug}` : '';
      if (carte && lien) carte.setAttribute('href', lien);

      if (lien === ici) {
        item.remove();
        continue;
      }
      gardees += 1;
    }

    if (!gardees) section.remove();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
