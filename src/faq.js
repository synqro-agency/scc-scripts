(() => {
  if ((window.scc ??= {}).faq) return;
  window.scc.faq = true;

  const brancher = (item, index) => {
    const tete = item.querySelector('.faq-head');
    const corps = item.querySelector('.faq-body');
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

  const init = () => {
    for (const section of document.querySelectorAll('.faq-section')) {
      if (section.dataset.faqPret) continue;
      section.dataset.faqPret = '1';
      section.querySelectorAll('.faq-item').forEach(brancher);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
