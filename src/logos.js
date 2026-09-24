(() => {
  if ((window.scc ??= {}).logos) return;
  window.scc.logos = true;

  const ECHELLE_MAX = 3;
  const BLANC = 243;
  const MESURE = 160;
  const encres = new Map();

  const mesurer = (img) => {
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return null;
    const r = Math.min(MESURE / w, MESURE / h, 1);
    const cw = Math.max(1, Math.round(w * r));
    const ch = Math.max(1, Math.round(h * r));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cw, ch);
    let data;
    try {
      data = ctx.getImageData(0, 0, cw, ch).data;
    } catch {
      return null;
    }
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
    for (let y = 0; y < ch; y += 1) {
      for (let x = 0; x < cw; x += 1) {
        const i = (y * cw + x) * 4;
        const vide = data[i + 3] < 20
          || (data[i] > BLANC && data[i + 1] > BLANC && data[i + 2] > BLANC);
        if (vide) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return null;
    return {
      x: x0 / cw,
      y: y0 / ch,
      w: (x1 - x0 + 1) / cw,
      h: (y1 - y0 + 1) / ch,
    };
  };

  /* La sonde attend l'evenement load et non decode() : dans un onglet en
     arriere plan, decode() peut ne jamais se resoudre et le bandeau resterait
     inchange jusqu'au retour de l'utilisateur sur l'onglet. */
  const encreDe = (src) => {
    if (encres.has(src)) return encres.get(src);
    const promesse = new Promise((resoudre) => {
      const sonde = new Image();
      sonde.crossOrigin = 'anonymous';
      sonde.addEventListener('load', () => resoudre(mesurer(sonde)), { once: true });
      sonde.addEventListener('error', () => resoudre(null), { once: true });
      sonde.src = src;
    });
    encres.set(src, promesse);
    return promesse;
  };

  const appliquer = (img, encre) => {
    const boite = img.getBoundingClientRect();
    if (!encre || !boite.width || !boite.height) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    const large = Math.min(boite.width, boite.height * ratio);
    const haute = large / ratio;
    const k = Math.min(
      boite.width / (large * encre.w),
      boite.height / (haute * encre.h),
      ECHELLE_MAX,
    );
    if (!(k > 1.02)) return;
    const dx = large * (encre.x + encre.w / 2 - 0.5) * k;
    const dy = haute * (encre.y + encre.h / 2 - 0.5) * k;
    img.style.transform = `translate(${-dx}px, ${-dy}px) scale(${k})`;
  };

  const traiter = (img) => {
    if (img.dataset.sccLogo) return;
    img.dataset.sccLogo = '1';
    const lancer = () => {
      const src = img.currentSrc || img.src;
      if (src) encreDe(src).then((encre) => appliquer(img, encre));
    };
    if (img.complete && img.naturalWidth) lancer();
    else img.addEventListener('load', lancer, { once: true });
  };

  const balayer = (racine) => {
    racine.querySelectorAll?.('.enseignes-logo').forEach(traiter);
  };

  const init = () => {
    const piste = document.querySelector('.enseignes-track');
    if (!piste) return;
    balayer(document);
    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches?.('.enseignes-logo')) traiter(n);
        else balayer(n);
      }));
    }).observe(piste.parentNode || piste, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
