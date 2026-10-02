/* ==========================================================================
   Maatwerk op Wielen, aanbod.js
   Detailpagina van een auto: fotogalerij + aanvraagformulier
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    // Zelfde inbox en mailservice als de intake-planner in main.js.
    inbox: 'jasperzweers07@gmail.com',
    endpoint: 'https://formsubmit.co/ajax/'
  };

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------------
     Fotogalerij: pijlen, thumbnails, vegen op mobiel en een vergroting
     ------------------------------------------------------------------------ */

  function initGalerij() {
    var root = $('[data-galerij]');
    if (!root) return;

    var fotos   = $$('.galerij__foto', root);
    var thumbs  = $$('[data-thumb]', root);
    var teller  = $('[data-teller]', root);
    var box     = $('[data-lightbox]', root);
    var boxFoto = $('[data-lightbox-foto]', root);
    var huidig  = 0;

    function toon(i) {
      var n = fotos.length;
      huidig = ((i % n) + n) % n;
      fotos.forEach(function (f, j) { f.hidden = j !== huidig; });
      thumbs.forEach(function (t, j) {
        t.setAttribute('aria-pressed', String(j === huidig));
        if (j === huidig && t.scrollIntoView) {
          t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
      if (teller) teller.textContent = String(huidig + 1);
      if (boxFoto) {
        boxFoto.src = fotos[huidig].currentSrc || fotos[huidig].src;
        boxFoto.alt = fotos[huidig].alt;
      }
    }

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-vorige]')) toon(huidig - 1);
      else if (e.target.closest('[data-volgende]')) toon(huidig + 1);
      else if (e.target.closest('[data-thumb]')) toon(+e.target.closest('[data-thumb]').dataset.thumb);
      else if (e.target.closest('[data-groot]') || e.target.closest('.galerij__foto')) openBox();
      else if (e.target.closest('[data-sluit]') || e.target === box) box.close();
    });

    function openBox() {
      if (!box || typeof box.showModal !== 'function') return;
      toon(huidig);
      box.showModal();
    }

    document.addEventListener('keydown', function (e) {
      if (!box || !box.open) return;
      if (e.key === 'ArrowLeft') toon(huidig - 1);
      if (e.key === 'ArrowRight') toon(huidig + 1);
    });

    // Vegen op touchscreens, zowel in de galerij als in de vergroting.
    [$('.galerij__hoofd', root), box].forEach(function (vlak) {
      if (!vlak || fotos.length < 2) return;
      var startX = null;
      vlak.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      vlak.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) toon(huidig + (dx < 0 ? 1 : -1));
        startX = null;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Aanvraagformulier
     ------------------------------------------------------------------------ */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDag(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function initFormulier() {
    var form = $('#auto-form');
    if (!form) return;

    var afspraak  = $('[data-afspraak]', form);
    var datum     = $('#auto-datum');
    var submitBtn = $('#auto-submit');
    var msg       = $('#auto-msg');
    var msgTxt    = $('#auto-msg-text');
    var success   = $('#auto-success');
    var auto      = form.dataset.auto;

    // Een bezichtiging kan vanaf morgen.
    var morgen = new Date();
    morgen.setDate(morgen.getDate() + 1);
    datum.min = isoDag(morgen);

    function soort() {
      var r = form.querySelector('input[name="Soort"]:checked');
      return r ? r.value : '';
    }

    function syncSoort() {
      var isAfspraak = soort() !== 'Vraag stellen';
      afspraak.hidden = !isAfspraak;
      $$('input, select', afspraak).forEach(function (el) { el.disabled = !isAfspraak; });
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'Soort') syncSoort();
      if (e.target.name === 'akkoord') clearError(e.target);
    });
    syncSoort();

    // De knoppen bij de prijs kiezen alvast het juiste soort aanvraag.
    $$('[data-soort]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = form.querySelector('input[name="Soort"][value="' + btn.dataset.soort + '"]');
        if (r) { r.checked = true; syncSoort(); }
      });
    });

    function showError(el, text) {
      var wrap = el.closest('.field');
      if (!wrap) return;
      wrap.classList.add('field--error');
      var err = $('.field__err', wrap);
      if (err && text) err.textContent = text;
      el.setAttribute('aria-invalid', 'true');
    }
    function clearError(el) {
      var wrap = el.closest('.field');
      if (wrap) wrap.classList.remove('field--error');
      el.removeAttribute('aria-invalid');
    }

    function validate() {
      var problems = [];
      ['naam', 'telefoon', 'email'].forEach(function (name) {
        var el = form.elements[name];
        clearError(el);
        if (!el.value.trim()) { showError(el, 'Dit veld is verplicht.'); problems.push(el); }
      });

      var email = form.elements.email;
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        showError(email, 'Vul een geldig mailadres in.');
        problems.push(email);
      }
      var tel = form.elements.telefoon;
      if (tel.value.trim() && tel.value.replace(/[^0-9]/g, '').length < 9) {
        showError(tel, 'Vul een volledig telefoonnummer in.');
        problems.push(tel);
      }
      clearError(datum);
      if (!datum.disabled && datum.value && datum.value < datum.min) {
        showError(datum, 'Kies een datum vanaf morgen.');
        problems.push(datum);
      }
      var akkoord = form.elements.akkoord;
      clearError(akkoord);
      if (!akkoord.checked) { showError(akkoord); problems.push(akkoord); }
      return problems;
    }

    form.addEventListener('input', function (e) {
      if (e.target.name) clearError(e.target);
      msg.hidden = true;
    });

    function leesbareDatum(iso) {
      if (!iso) return '';
      var p = iso.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString('nl-NL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    /* Vangnet zoals in main.js: lukt verzenden niet, dan kan de bezoeker de
       aanvraag met zijn eigen mailprogramma versturen. */
    function mailtoHref() {
      var regels = [];
      new FormData(form).forEach(function (waarde, naam) {
        if (naam.charAt(0) === '_' || !String(waarde).trim()) return;
        regels.push(naam.charAt(0).toUpperCase() + naam.slice(1) + ': ' + waarde);
      });
      return 'mailto:' + CONFIG.inbox +
        '?subject=' + encodeURIComponent(soort() + ': ' + auto) +
        '&body=' + encodeURIComponent(regels.join('\n'));
    }

    function showMsg(text, href) {
      msgTxt.textContent = text;
      if (href) {
        var wrap = document.createElement('span');
        wrap.style.cssText = 'display:block;margin-top:.8rem';
        var link = document.createElement('a');
        link.className = 'btn btn--sm';
        link.href = href;
        link.textContent = 'Verstuur met mijn eigen mailprogramma';
        wrap.appendChild(link);
        msgTxt.appendChild(wrap);
      }
      msg.hidden = false;
    }

    function setBusy(busy) {
      submitBtn.setAttribute('aria-busy', String(busy));
      submitBtn.innerHTML = busy
        ? '<span class="spinner" aria-hidden="true"></span> Versturen…'
        : 'Aanvraag versturen';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.hidden = true;

      var problems = validate();
      if (problems.length) {
        showMsg('Er ontbreekt nog iets. Controleer de rood gemarkeerde velden.');
        problems[0].focus();
        return;
      }

      var data = new FormData(form);
      data.set('_subject', soort() + ': ' + auto);
      if (datum.value && !datum.disabled) data.set('Voorkeursdatum', leesbareDatum(datum.value));

      setBusy(true);
      fetch(CONFIG.endpoint + CONFIG.inbox, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (r) {
          if (!r.ok || String(r.body.success) === 'false') throw new Error('Verzenden mislukt');
          form.hidden = true;
          success.hidden = false;
          success.focus();
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'formulier_verzonden',
            formulier_naam: 'aanbod',
            aanvraag_soort: soort(),
            auto: form.dataset.slug
          });
        })
        .catch(function () {
          setBusy(false);
          showMsg('Het versturen lukte niet. Probeer het opnieuw, of stuur de aanvraag ' +
                  'met uw eigen mailprogramma. Bellen of WhatsAppen kan ook, op 06 27965314.',
                  mailtoHref());
        });
    });
  }

  function init() {
    initGalerij();
    initFormulier();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
