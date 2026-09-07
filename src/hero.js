(() => {
  if ((window.scc ??= {}).hero) return;
  window.scc.hero = true;

  const init = () => {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const image = slider.querySelector('.w-dyn-item .hero-image');
    if (image) {
      image.setAttribute('loading', 'eager');
      image.setAttribute('fetchpriority', 'high');
    }
    if (slider.children.length < 2) return;

    const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.jQuery(slider).slick({
      fade: true,
      cssEase: 'ease',
      dots: true,
      arrows: false,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      speed: reduit ? 0 : 600,
      autoplay: !reduit,
      autoplaySpeed: 6000,
      pauseOnHover: false,
      pauseOnFocus: true,
    });
  };

  const attendre = (essais) => {
    if (window.jQuery?.fn?.slick) return init();
    if (essais > 0) setTimeout(() => attendre(essais - 1), 50);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => attendre(40), { once: true });
  } else {
    attendre(40);
  }
})();
