/* Small, dependency-free interactions: menu, header, reveals, parallax, lightbox. */
(function () {
  var d = document, root = d.documentElement, body = d.body;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // first paint -> headline reveal
  requestAnimationFrame(function () { setTimeout(function () { body.classList.add('loaded'); }, 60); });

  // mobile menu
  var btn = d.querySelector('.menu-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  d.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { body.classList.remove('menu-open'); if (btn) btn.setAttribute('aria-expanded', 'false'); });
  });

  // header: border after scroll, hide on scroll down, show on scroll up
  var head = d.querySelector('.site-head'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (head) {
      head.classList.toggle('scrolled', y > 10);
      head.classList.toggle('hide', y > 260 && y > lastY && !body.classList.contains('menu-open'));
    }
    lastY = y;
    parallax();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // gentle parallax on marked images
  var px = [].slice.call(d.querySelectorAll('[data-parallax]'));
  function parallax() {
    if (reduce) return;
    var vh = window.innerHeight;
    px.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      el.style.transform = 'translate3d(0,' + (p * -7).toFixed(2) + '%,0)';
    });
  }
  parallax();

  // reveal on scroll
  var items = d.querySelectorAll('.rv,.rv-img');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  // lightbox for galleries
  var lb = d.querySelector('.lb');
  if (lb) {
    var img = lb.querySelector('img'), cap = lb.querySelector('.cap'), set = [], idx = 0, lastFocus;
    function show(i) {
      idx = (i + set.length) % set.length;
      var it = set[idx];
      img.src = it.getAttribute('data-full');
      img.alt = it.querySelector('img').alt;
      cap.textContent = img.alt + (set.length > 1 ? '  ·  ' + (idx + 1) + ' / ' + set.length : '');
      lb.querySelector('.prev').hidden = lb.querySelector('.next').hidden = set.length < 2;
    }
    function open(group, i) { lastFocus = d.activeElement; set = group; show(i); lb.classList.add('open'); body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }
    function close() { lb.classList.remove('open'); body.style.overflow = ''; img.src = ''; if (lastFocus) lastFocus.focus(); }
    d.querySelectorAll('.gallery').forEach(function (g) {
      var its = [].slice.call(g.querySelectorAll('.g-item'));
      its.forEach(function (it, i) { it.addEventListener('click', function () { open(its, i); }); });
    });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  var yr = d.querySelector('[data-year]'); if (yr) yr.textContent = new Date().getFullYear();
})();
