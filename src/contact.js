(() => {
  if ((window.scc ??= {}).contact) return;
  window.scc.contact = true;

  const form = document.querySelector('.contact-card');
  if (!form) return;

  const placeholders = {
    'contact-nom': 'Nom…',
    'contact-prenom': 'Prénom…',
    'contact-email': 'Email…',
    'contact-message': 'Votre message…',
  };

  const placeholdersParDefaut = new Set(['', 'Example Text']);

  for (const [id, texte] of Object.entries(placeholders)) {
    const champ = form.querySelector(`#${id}`);
    if (champ && placeholdersParDefaut.has(champ.getAttribute('placeholder') ?? '')) {
      champ.setAttribute('placeholder', texte);
    }
  }

  const objet = form.querySelector('#contact-objet');
  if (!objet) return;

  const optionsParDefaut = new Set(['Select one...', 'First choice', 'Second choice', 'Third choice']);
  if ([...objet.options].some(({ text }) => !optionsParDefaut.has(text.trim()))) return;

  const objets = [
    'Question générale',
    'Objet perdu ou trouvé',
    'Enseignes et commerces',
    'Événements et animations',
    'Location d\'emplacement',
    'Autre',
  ];

  objet.replaceChildren(new Option('Sélectionner un objet', ''));
  for (const valeur of objets) objet.append(new Option(valeur, valeur));
})();
