(function(){
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // Respect user preference

  const selectorList = [
    '.titlepage',
    '.about .about_img',
    '.about .titlepage',
    '.glasses .glasses_box',
    '.shop .shop_img',
    '.shop .titlepage',
    '.our-products .product-card',
    '.clients_box',
    '.footer-column',
    '.contact .main_form',
    '.contact_image',
    '.banner_main .text-bg',
    '.product-card'
  ];

  const nodes = Array.from(document.querySelectorAll(selectorList.join(',')));
  if (!nodes.length) return;

  nodes.forEach(el => {
    // Skip if already marked
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  nodes.forEach(el => io.observe(el));
})();