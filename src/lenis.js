(() => {
  if ((window.scc ??= {}).lenis) return;
  window.scc.lenis = true;

  const lenis = new Lenis({ lerp: 0.3, wheelMultiplier: 1.3 });
  window.lenis = lenis;

  const boucle = (temps) => {
    lenis.raf(temps);
    requestAnimationFrame(boucle);
  };
  requestAnimationFrame(boucle);
})();
