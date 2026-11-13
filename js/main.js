/* Club Villa Sahores · Homepage */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Cabecera: cambia al hacer scroll ---------- */
  var head = document.getElementById('site-head');
  var wa = document.querySelector('.wa');
  function onScroll() {
    head.classList.toggle('is-scrolled', window.scrollY > 40);
    if (wa) wa.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.5);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú: desplegables + hamburguesa a pantalla completa ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var subs = document.querySelectorAll('.has-sub');

  function cerrarSubs(excepto) {
    subs.forEach(function (item) {
      if (item === excepto) return;
      item.classList.remove('is-open');
      item.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
    });
  }

  subs.forEach(function (item) {
    var btn = item.querySelector('.nav__link');
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      cerrarSubs(item);
    });
  });

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      var first = nav.querySelector('.nav__link');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 200);
    } else {
      cerrarSubs();
    }
  }

  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('is-open')) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080 && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub') && !(nav && nav.classList.contains('is-open'))) cerrarSubs();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    else cerrarSubs();
  });

  /* ---------- Hero: fotos de fondo que van pasando solas ----------
     Fundido suave cada 7 s. Con "reducir movimiento" queda la primera. */
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var actual = 0;
    if (slides.length > 1 && !reduce) {
      setInterval(function () {
        if (document.hidden) return;
        slides[actual].classList.remove('is-active');
        actual = (actual + 1) % slides.length;
        slides[actual].classList.add('is-active');
      }, 7000);
    }
    requestAnimationFrame(function () { hero.classList.add('is-ready'); });
  }

  /* ---------- Aparición de bloques al hacer scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Sahores Stream: video de fondo ----------
     Se carga y reproduce (sin sonido) cuando el bloque entra en pantalla,
     y se pausa al salir. */
  var stream = document.querySelector('.stream');
  var vid = document.getElementById('stream-video');
  if (stream && vid) {
    var playBtn = stream.querySelector('.stream__play');
    var soundBtn = stream.querySelector('.stream__sound');
    var pausadoPorUsuario = reduce;

    var cargar = function () { if (!vid.getAttribute('src')) vid.src = vid.dataset.src; };
    var reproducir = function () {
      cargar();
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    };

    vid.addEventListener('play', function () {
      stream.classList.remove('is-paused');
      playBtn.setAttribute('aria-label', 'Pausar video');
    });
    vid.addEventListener('pause', function () {
      stream.classList.add('is-paused');
      playBtn.setAttribute('aria-label', 'Reproducir video');
    });
    if (reduce) stream.classList.add('is-paused');

    playBtn.addEventListener('click', function () {
      if (vid.paused) { pausadoPorUsuario = false; reproducir(); }
      else { pausadoPorUsuario = true; vid.pause(); }
    });

    soundBtn.addEventListener('click', function () {
      vid.muted = !vid.muted;
      stream.classList.toggle('is-unmuted', !vid.muted);
      soundBtn.setAttribute('aria-label', vid.muted ? 'Activar sonido' : 'Silenciar');
      if (!vid.muted && vid.paused) { pausadoPorUsuario = false; reproducir(); }
    });

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!pausadoPorUsuario) reproducir(); }
          else if (!vid.paused) { vid.pause(); }
        });
      }, { threshold: 0.25 }).observe(stream);
    } else if (!reduce) {
      reproducir();
    }
  }

  /* ---------- Carrusel "Así está Sahores hoy" ----------
     Las fotos se agrupan por espacio (atributo data-space de cada <figure>).
     Los botones de espacios se arman solos: para sumar un espacio nuevo
     alcanza con agregar fotos con otro data-space. */
  var carousel = document.querySelector('.carousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var all = Array.prototype.slice.call(carousel.querySelectorAll('.slide'));
    var countEl = carousel.querySelector('.carousel__count');
    var progress = carousel.querySelector('.carousel__progress span');
    var spacesEl = document.querySelector('.spaces');
    var items = all;
    var cur = -1;

    var centrar = function (i, instant) {
      var s = items[Math.max(0, Math.min(items.length - 1, i))];
      if (!s) return;
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2,
        behavior: reduce || instant ? 'auto' : 'smooth'
      });
    };

    var pintar = function () {
      all.forEach(function (s) { s.classList.toggle('is-current', s === items[cur]); });
      countEl.innerHTML = '<b>' + String(cur + 1).padStart(2, '0') + '</b><span> / ' + String(items.length).padStart(2, '0') + '</span>';
      progress.style.setProperty('--p', ((cur + 1) / items.length * 100) + '%');
      prev.disabled = cur <= 0;
      next.disabled = cur >= items.length - 1;
    };

    var actualizar = function () {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, dist = Infinity;
      items.forEach(function (s, k) {
        var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
        if (d < dist) { dist = d; best = k; }
      });
      if (best === cur) return;
      cur = best;
      pintar();
    };

    var raf;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(actualizar);
    }, { passive: true });

    var prev = carousel.querySelector('.carousel__prev');
    var next = carousel.querySelector('.carousel__next');
    prev.addEventListener('click', function () { centrar(cur - 1); });
    next.addEventListener('click', function () { centrar(cur + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); centrar(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); centrar(cur + 1); }
    });

    var filtrar = function (espacio) {
      items = all.filter(function (s) { return !espacio || s.dataset.space === espacio; });
      all.forEach(function (s) { s.hidden = items.indexOf(s) === -1; });
      cur = -1;
      centrar(0, true);
      actualizar();
    };

    if (spacesEl) {
      var nombres = [];
      all.forEach(function (s) { if (nombres.indexOf(s.dataset.space) === -1) nombres.push(s.dataset.space); });
      var chips = [];
      var crearChip = function (label, espacio, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = label + ' <span>' + n + '</span>';
        b.addEventListener('click', function () {
          chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
          filtrar(espacio);
        });
        spacesEl.appendChild(b);
        chips.push(b);
      };
      crearChip('Todos', null, all.length);
      nombres.forEach(function (n) {
        crearChip(n, n, all.filter(function (s) { return s.dataset.space === n; }).length);
      });
      chips[0].setAttribute('aria-pressed', 'true');
    }

    window.addEventListener('resize', function () { centrar(cur, true); });
    actualizar();
  }

  /* ---------- Cintas infinitas (actividades y sponsors) ----------
     Repite el grupo hasta cubrir dos anchos de pantalla, así la cinta
     nunca muestra un hueco, y se desplaza la mitad del total. */
  document.querySelectorAll('.band__track, .logos__track').forEach(function (t) {
    var grupos = t.children;
    if (!grupos.length) return;
    var base = grupos[0];
    while (t.children.length > 1) t.removeChild(t.lastChild);
    var ancho = base.getBoundingClientRect().width || 1;
    var copias = Math.max(2, Math.ceil((window.innerWidth * 2) / ancho));
    if (copias % 2) copias++;
    for (var i = 1; i < copias; i++) {
      var c = base.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      c.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      t.appendChild(c);
    }
    t.style.setProperty('--dur', (ancho * copias / 2 / 45) + 's');
  });

  /* ---------- Copiar alias / CBU ---------- */
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = document.querySelector(btn.dataset.copy);
      if (!el) return;
      var done = function () {
        btn.textContent = 'Copiado';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = 'Copiar';
          btn.classList.remove('is-done');
        }, 2000);
      };
      var fallback = function () {
        // Si el navegador no permite copiar, dejamos el dato seleccionado.
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };
      try {
        navigator.clipboard.writeText(el.textContent.trim()).then(done, fallback);
      } catch (err) {
        fallback();
      }
    });
  });

  /* ---------- Año del footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
