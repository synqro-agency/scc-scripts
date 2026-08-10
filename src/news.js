(() => {
  if ((window.scc ??= {}).news) return;
  window.scc.news = true;

  const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const NOMS = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];

  const aplatir = (texte) => texte.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

  const rangMois = (nom) => {
    const exact = NOMS.indexOf(nom);
    if (exact >= 0) return exact % 12;
    const rangs = new Set();
    NOMS.forEach((mois, index) => { if (mois.startsWith(nom)) rangs.add(index % 12); });
    return rangs.size === 1 ? [...rangs][0] : -1;
  };

  const lireDate = (texte) => {
    const brut = (texte ?? '').trim();
    if (!brut) return null;
    const iso = brut.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
    const chiffres = brut.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (chiffres) return new Date(+chiffres[3], +chiffres[2] - 1, +chiffres[1]);
    const plat = aplatir(brut);
    const nomme = plat.match(/(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})/) ?? plat.match(/([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/);
    if (nomme) {
      const premierEstJour = /^\d/.test(nomme[1]);
      const rang = rangMois(premierEstJour ? nomme[2] : nomme[1]);
      if (rang >= 0) return new Date(+nomme[3], rang, +(premierEstJour ? nomme[1] : nomme[2]));
    }
    const secours = new Date(brut);
    return Number.isNaN(secours.getTime()) ? null : new Date(secours.getFullYear(), secours.getMonth(), secours.getDate());
  };

  const parisAujourdhui = () => {
    const [annee, mois, jour] = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()).split('-').map(Number);
    return new Date(annee, mois - 1, jour);
  };

  const numero = (date) => (date.getDate() === 1 ? '1er' : String(date.getDate()));
  const jourMois = (date) => `${numero(date)} ${MOIS[date.getMonth()]}`;
  const jourMoisAn = (date) => `${jourMois(date)} ${date.getFullYear()}`;
  const memeMois = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const memeAn = (a, b) => a.getFullYear() === b.getFullYear();

  const finUtile = (debut, fin) => (fin && fin > debut ? fin : null);

  const avecAn = (date, aujourdhui) => (memeAn(date, aujourdhui) ? jourMois(date) : jourMoisAn(date));

  const surLaCarte = (debut, fin, aujourdhui) => {
    if (!debut) return '';
    const bout = finUtile(debut, fin);
    if (!bout) return `${JOURS[debut.getDay()]} ${avecAn(debut, aujourdhui)}`;
    if (debut <= aujourdhui && aujourdhui <= bout) return `Jusqu'au ${avecAn(bout, aujourdhui)}`;
    if (memeMois(debut, bout)) return `Du ${numero(debut)} au ${avecAn(bout, aujourdhui)}`;
    if (memeAn(debut, bout)) return `Du ${jourMois(debut)} au ${avecAn(bout, aujourdhui)}`;
    return `Du ${jourMoisAn(debut)} au ${jourMoisAn(bout)}`;
  };

  const brutDe = (racine, nom) => racine.querySelector(`[data-d="${nom}"]`)?.textContent.trim() ?? '';
  const bornes = (racine) => [lireDate(brutDe(racine, 'debut')), lireDate(brutDe(racine, 'fin'))];

  const ecrire = (cible, texte, brut) => {
    if (!cible) return;
    if (texte) cible.textContent = texte;
    else if (brut) cible.textContent = brut;
    else cible.remove();
  };

  const init = () => {
    const aujourdhui = parisAujourdhui();
    for (const item of document.querySelectorAll('.news-section .w-dyn-item')) {
      const cible = item.querySelector('[data-date]');
      if (!cible) continue;
      ecrire(cible, surLaCarte(...bornes(item), aujourdhui), brutDe(item, 'debut'));
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
