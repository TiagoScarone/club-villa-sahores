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

  /* ---------- Galería "Así está Sahores hoy" ----------
     Datos en <script id="gal-data">: espacios con sus fotos.
     Pasa sola cada 3,2 s y al terminar un espacio sigue con el próximo.
     Se frena con el mouse encima, con foco o fuera de pantalla. */
  var galEl = document.querySelector('.gal');
  var galData = document.getElementById('gal-data');
  if (galEl && galData) {
    var ICONS = {
      front: '<path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M10 21v-6h4v6M9 11h.01M15 11h.01"/>',
      pool: '<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M8 14.5V6a2 2 0 0 1 4 0M14 14.5V6a2 2 0 0 1 4 0M8 9.5h6M8 12.5h6"/>',
      court: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.5"/><path d="M3 9.5h3v5H3M21 9.5h-3v5h3"/>',
      gym3: '<path d="M4 20V9l8-5 8 5v11"/><path d="M4 20h16M9 20v-5h6v5"/><path d="M8 11h8"/>',
      gym4: '<path d="M7 10.5V7a4 4 0 0 1 8 0v1.5a3 3 0 0 1 3 3V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-1.5a2.5 2.5 0 0 1 1-2z"/><path d="M7 13h6M15 8.5v3"/>',
      fitness: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
      salon: '<path d="M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1"/><path d="M4 21h16M6 21v-6a6 6 0 0 1 12 0v6"/>',
      grill: '<path d="M5 10h14a7 7 0 0 1-14 0z"/><path d="M8 21l2-4M16 21l-2-4M12 3c1 1 1 2 0 3M8.5 4c.8.8.8 1.6 0 2.4M15.5 4c.8.8.8 1.6 0 2.4"/>'
    };
    var spaces = JSON.parse(galData.textContent);
    var spacesEl = galEl.querySelector('.gal__spaces');
    var imgs = galEl.querySelectorAll('.gal__img');
    var capB = galEl.querySelector('.gal__cap b');
    var capN = galEl.querySelector('.gal__cap span');
    var thumbsEl = galEl.querySelector('.gal__thumbs');
    var timer = galEl.querySelector('.gal__timer');
    var url = function (id, w, h) { return 'https://static.wixstatic.com/media/' + id + '/v1/fill/w_' + w + ',h_' + h + ',al_c,q_80,enc_auto/sahores.jpg'; };
    var big = window.innerWidth < 700 ? [900, 675] : [1400, 875];
    var sp = 0, ph = 0, front = 0, hold = false, onScreen = !hasIO, auto = !reduce;
    var DUR = 3200, t0 = 0, raf2;

    var btns = spaces.map(function (s, k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'space'; b.setAttribute('role', 'tab');
      b.innerHTML = '<span class="space__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[s.icon] || ICONS.front) + '</svg></span>' +
        '<span class="space__name">' + s.name + '</span><span class="space__n">' + s.photos.length + '</span><span class="space__bar"><span></span></span>';
      b.addEventListener('click', function () { ir(k, 0); });
      spacesEl.appendChild(b);
      return b;
    });

    var pintarThumbs = function () {
      thumbsEl.innerHTML = '';
      spaces[sp].photos.forEach(function (f, k) {
        var t = document.createElement('button');
        t.type = 'button'; t.className = 'gal__thumb';
        t.setAttribute('aria-label', 'Foto ' + (k + 1) + ': ' + f.alt);
        t.innerHTML = '<img src="' + url(f.id, 176, 132) + '" alt="" loading="lazy" width="88" height="66">';
        t.addEventListener('click', function () { ir(sp, k); });
        thumbsEl.appendChild(t);
      });
    };

    var precargar = function (s, p) {
      var f = spaces[s] && spaces[s].photos[p];
      if (f) { var i = new Image(); i.src = url(f.id, big[0], big[1]); }
    };

    var arrancarTimer = function () {
      timer.classList.remove('is-run'); void timer.offsetWidth;
      if (auto) { timer.style.setProperty('--t', DUR + 'ms'); timer.classList.add('is-run'); }
    };

    var ir = function (s, p, user) {
      var cambioEspacio = s !== sp || !thumbsEl.children.length;
      sp = (s + spaces.length) % spaces.length; ph = p;
      var f = spaces[sp].photos[ph];
      var next = imgs[1 - front];
      next.src = url(f.id, big[0], big[1]); next.alt = f.alt;
      var mostrar = function () { imgs[front].classList.remove('is-on'); next.classList.add('is-on'); front = 1 - front; };
      if (next.complete && next.naturalWidth) mostrar(); else { next.onload = mostrar; next.onerror = mostrar; }
      capB.textContent = spaces[sp].name;
      capN.textContent = (ph + 1) + ' / ' + spaces[sp].photos.length;
      btns.forEach(function (b, k) {
        b.setAttribute('aria-selected', String(k === sp));
        b.tabIndex = k === sp ? 0 : -1;
        b.querySelector('.space__bar span').style.setProperty('--p', k === sp ? ((ph + 1) / spaces[sp].photos.length * 100) + '%' : '0%');
      });
      if (cambioEspacio) {
        pintarThumbs();
        if (spacesEl.scrollWidth > spacesEl.clientWidth) spacesEl.scrollTo({ left: btns[sp].offsetLeft - spacesEl.clientWidth / 2 + btns[sp].clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
      Array.prototype.forEach.call(thumbsEl.children, function (t, k) {
        t.setAttribute('aria-current', String(k === ph));
        if (k === ph) thumbsEl.scrollTo({ left: t.offsetLeft - thumbsEl.clientWidth / 2 + t.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      });
      var n = ph + 1 < spaces[sp].photos.length ? [sp, ph + 1] : [sp + 1, 0];
      precargar(n[0] % spaces.length, n[1]);
      t0 = performance.now();
      arrancarTimer();
    };

    var siguiente = function () { if (ph + 1 < spaces[sp].photos.length) ir(sp, ph + 1); else ir(sp + 1, 0); };
    var anterior = function () { if (ph > 0) ir(sp, ph - 1); else ir(sp - 1, spaces[(sp - 1 + spaces.length) % spaces.length].photos.length - 1); };
    galEl.querySelector('.gal__arrow--next').addEventListener('click', siguiente);
    galEl.querySelector('.gal__arrow--prev').addEventListener('click', anterior);
    spacesEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); ir(sp + 1, 0); btns[sp].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); ir(sp - 1, 0); btns[sp].focus(); }
    });

    // swipe en la foto
    var x0 = null;
    var view = galEl.querySelector('.gal__view');
    view.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    view.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { if (dx < 0) siguiente(); else anterior(); }
    });

    var setHold = function (v) {
      hold = v;
      galEl.classList.toggle('is-hold', hold || !onScreen);
    };
    galEl.addEventListener('mouseenter', function () { setHold(true); });
    galEl.addEventListener('mouseleave', function () { setHold(false); });
    galEl.addEventListener('focusin', function () { setHold(true); });
    galEl.addEventListener('focusout', function () { setHold(false); });

    // reloj: avanza solo cuando corresponde (el tiempo en pausa no cuenta)
    var ultimo = performance.now(), acumulado = 0;
    var loop = function (now) {
      var dt = now - ultimo; ultimo = now;
      if (auto && !hold && onScreen && !document.hidden) {
        acumulado += dt;
        if (acumulado >= DUR) { acumulado = 0; siguiente(); }
      }
      raf2 = requestAnimationFrame(loop);
    };
    var irOriginal = ir;
    ir = function (s, p) { acumulado = 0; irOriginal(s, p); };

    if (hasIO) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        galEl.classList.toggle('is-hold', hold || !onScreen);
      }, { threshold: 0.35 }).observe(galEl);
    }
    ir(0, 0);
    if (auto) raf2 = requestAnimationFrame(loop);
  }

  /* ---------- Escudo-moneda del hero: gira con el mouse ---------- */
  var coin = document.getElementById('coin');
  if (coin) {
    var edge = coin.querySelector('.coin__edge');
    var GROSOR = 18;
    for (var c = 1; c <= GROSOR; c++) {
      var capa = document.createElement('i');
      capa.style.transform = 'translateZ(' + (-c) + 'px)';
      edge.appendChild(capa);
    }
    var lines = document.querySelector('.hero__lines');
    var heroEl = document.querySelector('.hero');
    var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (reduce) {
      coin.style.setProperty('--ry', '-10deg');
    } else if (!finePointer) {
      coin.classList.add('is-idle');
    } else {
      var target = { x: 0, y: 0 }, curr = { x: 0, y: 0 }, activo = false, rafC;
      coin.classList.add('is-idle');
      var animar = function () {
        curr.x += (target.x - curr.x) * 0.08;
        curr.y += (target.y - curr.y) * 0.08;
        coin.style.setProperty('--ry', (curr.x * 34) + 'deg');
        coin.style.setProperty('--rx', (-curr.y * 26) + 'deg');
        coin.style.setProperty('--sx', (35 - curr.x * 30) + '%');
        coin.style.setProperty('--sy', (25 - curr.y * 25) + '%');
        coin.parentNode.style.setProperty('--shx', -curr.x * 14);
        if (lines) { lines.style.setProperty('--lx', (-curr.x * 14) + 'px'); lines.style.setProperty('--ly', (-curr.y * 10) + 'px'); }
        if (activo || Math.abs(target.x - curr.x) > 0.001 || Math.abs(target.y - curr.y) > 0.001) rafC = requestAnimationFrame(animar);
        else rafC = null;
      };
      heroEl.addEventListener('pointermove', function (e) {
        var r = heroEl.getBoundingClientRect();
        target.x = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
        target.y = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
        if (!activo) { activo = true; coin.classList.remove('is-idle'); }
        if (!rafC) rafC = requestAnimationFrame(animar);
      });
      heroEl.addEventListener('pointerleave', function () {
        activo = false; target.x = 0; target.y = 0;
        if (!rafC) rafC = requestAnimationFrame(animar);
        setTimeout(function () { if (!activo) coin.classList.add('is-idle'); }, 900);
      });
    }
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

  /* ---------- Videos verticales de las páginas de actividades ---------- */
  document.querySelectorAll('.sport-video').forEach(function (box) {
    var v = box.querySelector('video');
    var play = box.querySelector('.sport-video__play');
    var snd = box.querySelector('.sport-video__sound');
    var porUsuario = reduce;
    var cargar = function () { if (!v.getAttribute('src')) v.src = v.dataset.src; };
    var dale = function () { cargar(); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
    box.classList.add('is-paused');
    v.addEventListener('play', function () { box.classList.remove('is-paused'); play.setAttribute('aria-label', 'Pausar video'); });
    v.addEventListener('pause', function () { box.classList.add('is-paused'); play.setAttribute('aria-label', 'Reproducir video'); });
    play.addEventListener('click', function () { if (v.paused) { porUsuario = false; dale(); } else { porUsuario = true; v.pause(); } });
    snd.addEventListener('click', function () {
      v.muted = !v.muted;
      box.classList.toggle('is-unmuted', !v.muted);
      snd.setAttribute('aria-label', v.muted ? 'Activar sonido' : 'Silenciar');
      if (!v.muted && v.paused) { porUsuario = false; dale(); }
    });
    if (hasIO) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { if (!porUsuario) dale(); }
          else if (!v.paused) v.pause();
        });
      }, { threshold: 0.3 }).observe(box);
    } else if (!reduce) dale();
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
