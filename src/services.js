(() => {
  if ((window.scc ??= {}).services) return;
  window.scc.services = true;

  const brancher = (item, index) => {
    const tete = item.querySelector('.service-head');
    const corps = item.querySelector('.service-body');
    if (!tete || !corps) return;

    const ouvert = index === 0;
    item.classList.toggle('is-open', ouvert);
    tete.setAttribute('role', 'button');
    tete.setAttribute('tabindex', '0');
    tete.setAttribute('aria-expanded', String(ouvert));

    const basculer = () => {
      const suivant = !item.classList.contains('is-open');
      item.classList.toggle('is-open', suivant);
      tete.setAttribute('aria-expanded', String(suivant));
    };

    tete.addEventListener('click', basculer);
    tete.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      basculer();
    });
  };

  const init = () => document.querySelectorAll('.service-item').forEach(brancher);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
