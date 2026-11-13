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
    if (wa) wa.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.7);
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
      if (window.innerWidth > 1180 && nav.classList.contains('is-open')) setMenu(false);
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

  /* ---------- Hero: fotos que van pasando ----------
     La barra de progreso de cada foto marca el tiempo:
     cuando termina su animación, pasa a la siguiente. */
  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = hero.querySelectorAll('.hero__slide');
    var dots = hero.querySelectorAll('.hero__dot');
    var pauseBtn = hero.querySelector('.hero__pause');
    var actual = 0;

    var mostrar = function (i) {
      actual = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === actual); });
      dots.forEach(function (d, k) {
        d.classList.remove('is-active');
        d.setAttribute('aria-current', k === actual ? 'true' : 'false');
      });
      void dots[actual].offsetWidth; // reinicia la barra
      dots[actual].classList.add('is-active');
    };

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { mostrar(k); });
      d.addEventListener('animationend', function () { if (k === actual) mostrar(actual + 1); });
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        var paused = hero.classList.toggle('is-paused');
        pauseBtn.setAttribute('aria-label', paused ? 'Reanudar fotos' : 'Pausar fotos');
        pauseBtn.setAttribute('aria-pressed', String(paused));
      });
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
     Se mueve solo cada 4,5 s; se detiene al pasar el mouse, al tocarlo
     o con el botón de pausa. También se puede deslizar o usar las flechas. */
  var carousel = document.querySelector('.carousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var items = carousel.querySelectorAll('.slide');
    var countEl = carousel.querySelector('.carousel__count b');
    var progress = carousel.querySelector('.carousel__progress span');
    var autoBtn = carousel.querySelector('.carousel__auto');
    var cur = 0;
    var autoOn = !reduce;
    var hover = false;
    var visible = !hasIO;
    var tick;

    var centrar = function (i) {
      var s = items[(i + items.length) % items.length];
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2,
        behavior: reduce ? 'auto' : 'smooth'
      });
    };

    var actualizar = function () {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, dist = Infinity;
      items.forEach(function (s, k) {
        var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid);
        if (d < dist) { dist = d; best = k; }
      });
      if (best === cur && items[cur].classList.contains('is-current')) return;
      cur = best;
      items.forEach(function (s, k) { s.classList.toggle('is-current', k === cur); });
      countEl.textContent = String(cur + 1).padStart(2, '0');
      progress.style.setProperty('--p', ((cur + 1) / items.length * 100) + '%');
    };

    var raf;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(actualizar);
    }, { passive: true });

    carousel.querySelector('.carousel__prev').addEventListener('click', function () { centrar(cur - 1); reiniciar(); });
    carousel.querySelector('.carousel__next').addEventListener('click', function () { centrar(cur + 1); reiniciar(); });

    carousel.addEventListener('mouseenter', function () { hover = true; });
    carousel.addEventListener('mouseleave', function () { hover = false; });
    carousel.addEventListener('focusin', function () { hover = true; });
    carousel.addEventListener('focusout', function () { hover = false; });
    track.addEventListener('pointerdown', function () { reiniciar(); });

    var reiniciar = function () {
      clearInterval(tick);
      if (autoOn) {
        tick = setInterval(function () {
          if (!hover && visible && !document.hidden) centrar(cur + 1);
        }, 4500);
      }
    };

    if (autoBtn) {
      var syncAuto = function () {
        carousel.classList.toggle('is-paused', !autoOn);
        autoBtn.setAttribute('aria-label', autoOn ? 'Pausar carrusel' : 'Reproducir carrusel');
        autoBtn.setAttribute('aria-pressed', String(!autoOn));
      };
      autoBtn.addEventListener('click', function () { autoOn = !autoOn; syncAuto(); reiniciar(); });
      syncAuto();
    }

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.3 }).observe(carousel);
    }

    window.addEventListener('resize', function () { centrar(cur); });
    actualizar();
    reiniciar();
  }

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

  /* ---------- Temporada vigente del horario de atención ----------
     Dic a feb: verano · Mar a nov: resto del año (hora de Buenos Aires). */
  try {
    var mes = Number(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires', month: 'numeric'
    }).format(new Date()));
    var verano = mes === 12 || mes <= 2;
    var card = document.querySelector('.hours__card[data-season="' + (verano ? 'verano' : 'invierno') + '"]');
    if (card) card.classList.add('is-current');
  } catch (err) { /* sin Intl: no se marca la temporada */ }

  /* ---------- Año del footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
