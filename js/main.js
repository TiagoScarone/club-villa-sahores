/* Club Villa Sahores · Homepage */
(function () {
  'use strict';

  /* ---------- Menú: hamburguesa + desplegables ---------- */
  var toggle = document.querySelector('.nav-toggle');
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

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) cerrarSubs();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarSubs();
  });

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        cerrarSubs();
      }
    });
  }

  /* ---------- Video de Sahores Stream ----------
     Carga el reproductor de YouTube recién al hacer clic.
     La lista UU… es la de "subidas" del canal: muestra siempre el último video. */
  var video = document.getElementById('video-stream');
  if (video) {
    video.querySelector('.video__play').addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = video.dataset.embed + '&autoplay=1';
      iframe.title = 'Sahores Stream';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      video.innerHTML = '';
      video.appendChild(iframe);
    });
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

  /* ---------- Estado del club (abierto / cerrado) ----------
     Horarios de atención:
     Mar a nov: lun a vie 8 a 21, sáb 8 a 19.
     Dic a feb: lun a vie 8 a 21, sáb y dom 9 a 19.            */
  function horaBuenosAires() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'short', month: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return {
      dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday),
      mes: Number(o.month),
      hora: Number(o.hour) + Number(o.minute) / 60
    };
  }

  function horarioDe(dia, verano) {
    if (dia >= 1 && dia <= 5) return [8, 21];
    if (verano) return [9, 19];
    if (dia === 6) return [8, 19];
    return null; // domingo fuera de temporada
  }

  try {
    var ahora = horaBuenosAires();
    var verano = ahora.mes === 12 || ahora.mes <= 2;
    var hoy = horarioDe(ahora.dia, verano);
    var estado = document.getElementById('estado-club');
    var texto = estado.querySelector('.status__text');

    if (hoy && ahora.hora >= hoy[0] && ahora.hora < hoy[1]) {
      estado.classList.add('is-open');
      texto.textContent = 'Abierto ahora · hasta las ' + hoy[1] + ':00';
    } else {
      estado.classList.add('is-closed');
      texto.textContent = hoy && ahora.hora < hoy[0]
        ? 'Cerrado ahora · abre hoy a las ' + hoy[0] + ':00'
        : 'Cerrado ahora';
    }

    var card = document.querySelector('.hours__card[data-season="' + (verano ? 'verano' : 'invierno') + '"]');
    if (card) card.classList.add('is-current');
  } catch (err) {
    /* Sin Intl: queda el horario fijo que ya está en el HTML. */
  }

  /* ---------- Año del footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
