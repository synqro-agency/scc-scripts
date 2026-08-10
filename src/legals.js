(() => {
  if ((window.scc ??= {}).legals) return;
  window.scc.legals = true;

  const liste = document.querySelector('[sl-summary-list]');
  if (!liste) return;

  liste.addEventListener('keydown', (evenement) => {
    if (evenement.key !== 'Enter' && evenement.key !== ' ') return;
    const item = evenement.target.closest('.legal-summary-item');
    if (!item) return;
    evenement.preventDefault();
    item.click();
  });
})();
