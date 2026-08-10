(() => {
  if ((window.scc ??= {}).newsletter) return;
  window.scc.newsletter = true;

  const champ = document.querySelector('.newsletter-input');
  if (champ && !champ.getAttribute('placeholder')) {
    champ.setAttribute('placeholder', 'Votre adresse email');
  }
})();
