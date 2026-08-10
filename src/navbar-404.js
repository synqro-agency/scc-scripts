(() => {
  if ((window.scc ??= {}).navbar404) return;
  window.scc.navbar404 = true;

  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const burger = nav.querySelector('.navbar-burger');
  const panneau = nav.querySelector('.navbar-nav-wrap');
  const petit = matchMedia('(max-width: 767px)');

  const repere = document.createElement('div');
  repere.setAttribute('aria-hidden', 'true');
  repere.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
  document.body.prepend(repere);

  const clairForce = document.querySelector('[data-navbar-clair]') !== null;

  const majClair = () => {
    nav.classList.toggle('is-clair', clairForce || nav.classList.contains('is-scrolled'));
  };

  majClair();

  new IntersectionObserver(([entree]) => {
    nav.classList.toggle('is-scrolled', !entree.isIntersecting);
    majClair();
  }, { threshold: 0 }).observe(repere);

  const menu = (ouvrir) => {
    nav.classList.toggle('is-menu-open', ouvrir);
    burger?.setAttribute('aria-expanded', String(ouvrir));
    document.documentElement.style.overflow = ouvrir ? 'hidden' : '';
  };

  burger?.addEventListener('click', () => menu(!nav.classList.contains('is-menu-open')));

  panneau?.addEventListener('click', ({ target }) => {
    if (target.closest('.navbar-link')) menu(false);
  });

  document.addEventListener('keydown', ({ key }) => {
    if (key !== 'Escape') return;
    if (!nav.classList.contains('is-menu-open')) return;
    menu(false);
    burger?.focus();
  });

  petit.addEventListener('change', ({ matches }) => {
    if (!matches) menu(false);
  });
})();
