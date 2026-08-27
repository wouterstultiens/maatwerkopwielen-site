/* ==========================================================================
   Maatwerk op Wielen, main.js
   Onepager-interacties + intake-planner (datum/tijd kiezen en versturen)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     CONFIGURATIE. Hier pas je de planner aan zonder de rest te raken
     ------------------------------------------------------------------------ */
  var CONFIG = {
    // Dit adres krijgt de aanvragen. Let op: het staat op twee plekken, hier en
    // in het action-attribuut van het formulier in index.html. Houd ze gelijk.
    // Let op: de eerste aanvraag moet eenmalig bevestigd worden via de
    // activatiemail die FormSubmit naar dit adres stuurt. Zie README.md.
    inbox: 'jasperzweers07@gmail.com',

    // Endpoint. Wil je overstappen naar Web3Forms/Formspree? Zie README.md.
    endpoint: 'https://formsubmit.co/ajax/',

    // Hoeveel werkdagen vooruit mag er minimaal geboekt worden.
    minLeadDays: 1,

    // Hoeveel dagen vooruit is de agenda open.
    maxAheadDays: 90,

    // Beschikbare tijdsloten per weekdag (0 = zondag ... 6 = zaterdag).
    slotsByDay: {
      0: [],
      1: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'],
      2: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'],
      3: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'],
      4: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'],
      5: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      6: ['10:00', '11:00', '12:00']
    }
  };

  var DAY_NAMES = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
  var MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------------
     Datumhelpers (bewust lokale tijd, geen verschuiving naar UTC)
     ------------------------------------------------------------------------ */

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatLong(d) {
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* Paaszondag volgens het anonieme Gregoriaanse algoritme.
     Zo blijven de variabele feestdagen ook in 2030 nog kloppen. */
  function easterSunday(year) {
    var a = year % 19,
        b = Math.floor(year / 100),
        c = year % 100,
        d = Math.floor(b / 4),
        e = b % 4,
        f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4),
        k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        month = Math.floor((h + l - 7 * m + 114) / 31),
        day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  var holidayCache = {};

  function holidaysFor(year) {
    if (holidayCache[year]) return holidayCache[year];
    var easter = easterSunday(year);
    var list = [
      new Date(year, 0, 1),            // Nieuwjaarsdag
      addDays(easter, -2),             // Goede Vrijdag
      easter,                          // Eerste Paasdag
      addDays(easter, 1),              // Tweede Paasdag
      new Date(year, 3, 27),           // Koningsdag
      addDays(easter, 39),             // Hemelvaartsdag
      addDays(easter, 49),             // Eerste Pinksterdag
      addDays(easter, 50),             // Tweede Pinksterdag
      new Date(year, 11, 25),          // Eerste Kerstdag
      new Date(year, 11, 26)           // Tweede Kerstdag
    ];
    // Valt Koningsdag op zondag, dan schuift die naar zaterdag 26 april.
    if (list[4].getDay() === 0) list[4] = new Date(year, 3, 26);

    holidayCache[year] = list.map(toISO);
    return holidayCache[year];
  }

  function isHoliday(d) { return holidaysFor(d.getFullYear()).indexOf(toISO(d)) !== -1; }

  function slotsFor(d) {
    if (isHoliday(d)) return [];
    return CONFIG.slotsByDay[d.getDay()] || [];
  }

  /* ------------------------------------------------------------------------
     Header: schaduw bij scrollen + mobiel menu
     ------------------------------------------------------------------------ */

  function initHeader() {
    var header = $('.header');
    var toggle = $('.nav-toggle');
    var nav = $('#primary-nav');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && nav) {
      var setOpen = function (open) {
        toggle.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
      };
      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
      });
    }
  }

  /* ------------------------------------------------------------------------
     Actieve navigatielink op basis van zichtbare sectie
     ------------------------------------------------------------------------ */

  function initActiveNav() {
    var links = $$('#primary-nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { map[el.id] = a; targets.push(el); }
    });

    var clearAll = function () {
      links.forEach(function (a) { a.classList.remove('is-active'); });
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        clearAll();
        var link = map[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(function (t) { io.observe(t); });

    // In de hero hoort geen enkele link actief te zijn. De observer vuurt daar
    // niets af (er is geen sectie in de meetband), dus zou de laatste markering
    // anders blijven staan.
    var firstTop = targets.length ? targets[0].offsetTop : Infinity;
    window.addEventListener('scroll', function () {
      if (window.scrollY + window.innerHeight * 0.55 < firstTop) clearAll();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Scroll-reveal
     ------------------------------------------------------------------------ */

  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Mobiele sticky CTA: pas tonen na de hero, verbergen bij de planner
     ------------------------------------------------------------------------ */

  function initMobileCta() {
    var bar = $('.mobile-cta');
    var hero = $('.hero');
    var planner = $('#intake');
    if (!bar || !hero) return;

    var update = function () {
      var pastHero = window.scrollY > hero.offsetHeight * 0.7;
      var atPlanner = false;
      if (planner) {
        var r = planner.getBoundingClientRect();
        atPlanner = r.top < window.innerHeight && r.bottom > 0;
      }
      bar.classList.toggle('is-visible', pastHero && !atPlanner);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ------------------------------------------------------------------------
     De planner: kalender + tijdsloten + verzenden
     ------------------------------------------------------------------------ */

  function initPlanner() {
    var form = $('#intake-form');
    if (!form) return;

    var monthLabel = $('#cal-month');
    var grid       = $('#cal-grid');
    var prevBtn    = $('#cal-prev');
    var nextBtn    = $('#cal-next');
    var slotsWrap  = $('#slots');
    var slotsGrid  = $('#slots-grid');
    var slotsLabel = $('#slots-label');
    var chosen     = $('#chosen');
    var chosenTxt  = $('#chosen-text');
    var inDate     = $('#field-datum');
    var inTime     = $('#field-tijd');
    var submitBtn  = $('#intake-submit');
    var msg        = $('#form-msg');
    var msgTxt     = $('#form-msg-text');
    var success    = $('#intake-success');
    var successWhen= $('#success-when');
    var formBody   = $('#intake-body');

    var today    = startOfDay(new Date());
    var minDate  = addDays(today, CONFIG.minLeadDays);
    var maxDate  = addDays(today, CONFIG.maxAheadDays);

    var viewYear  = minDate.getFullYear();
    var viewMonth = minDate.getMonth();
    var selDate   = null;
    var selTime   = null;
    var focusDate = null; // voor pijltjesnavigatie

    function selectable(d) {
      if (d < minDate || d > maxDate) return false;
      return slotsFor(d).length > 0;
    }

    function firstSelectableFrom(d, dir) {
      var probe = new Date(d.getTime());
      for (var i = 0; i < 120; i++) {
        if (selectable(probe)) return probe;
        probe = addDays(probe, dir);
        if (probe < minDate || probe > maxDate) break;
      }
      return null;
    }

    /* --- Kalender tekenen --- */
    function render() {
      var first = new Date(viewYear, viewMonth, 1);
      monthLabel.textContent = MONTH_NAMES[viewMonth] + ' ' + viewYear;

      // Maandag als eerste kolom
      var offset = (first.getDay() + 6) % 7;
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      grid.innerHTML = '';

      for (var s = 0; s < offset; s++) {
        var spacer = document.createElement('div');
        spacer.className = 'cal__spacer';
        spacer.setAttribute('aria-hidden', 'true');
        grid.appendChild(spacer);
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var d = new Date(viewYear, viewMonth, day);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal__day';
        btn.textContent = String(day);
        btn.dataset.iso = toISO(d);

        var ok = selectable(d);
        btn.disabled = !ok;

        if (sameDay(d, today)) btn.classList.add('is-today');
        if (selDate && sameDay(d, selDate)) {
          btn.classList.add('is-selected');
          btn.setAttribute('aria-current', 'date');
        }

        var label = formatLong(d);
        if (!ok) {
          if (isHoliday(d)) label += ' (feestdag, niet beschikbaar)';
          else if (d.getDay() === 0) label += ' (zondag, niet beschikbaar)';
          else label += ' (niet beschikbaar)';
        }
        btn.setAttribute('aria-label', label);

        // Roving tabindex: precies één dag is tab-bereikbaar
        btn.tabIndex = (focusDate && sameDay(d, focusDate)) ? 0 : -1;

        grid.appendChild(btn);
      }

      // Als geen enkele dag in deze maand focusbaar is, maak de eerste geschikte dag focusbaar
      if (!grid.querySelector('.cal__day[tabindex="0"]')) {
        var firstOk = grid.querySelector('.cal__day:not(:disabled)');
        if (firstOk) firstOk.tabIndex = 0;
      }

      prevBtn.disabled = new Date(viewYear, viewMonth, 1) <= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      nextBtn.disabled = new Date(viewYear, viewMonth + 1, 1) > maxDate;
    }

    function goMonth(delta) {
      var m = viewMonth + delta;
      viewYear += Math.floor(m / 12);
      viewMonth = ((m % 12) + 12) % 12;
      focusDate = null;
      render();
    }

    /* --- Tijdsloten tekenen --- */
    function renderSlots() {
      if (!selDate) {
        slotsWrap.hidden = true;
        return;
      }
      slotsWrap.hidden = false;
      slotsLabel.textContent = 'Tijd op ' + formatLong(selDate);
      slotsGrid.innerHTML = '';

      var list = slotsFor(selDate);
      if (!list.length) {
        var p = document.createElement('p');
        p.className = 'slots__empty';
        p.textContent = 'Op deze dag zijn geen tijden beschikbaar.';
        slotsGrid.appendChild(p);
        return;
      }

      list.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot' + (selTime === t ? ' is-selected' : '');
        b.textContent = t;
        b.setAttribute('aria-pressed', String(selTime === t));
        b.addEventListener('click', function () {
          selTime = t;
          renderSlots();
          syncFields();
        });
        slotsGrid.appendChild(b);
      });
    }

    /* --- Verborgen velden + samenvatting bijwerken --- */
    function syncFields() {
      // Leesbare datum in de mail, zonder streepjes zoals in een ISO-notatie.
      inDate.value = selDate ? formatLong(selDate) : '';
      inTime.value = selTime || '';

      if (selDate && selTime) {
        chosen.hidden = false;
        chosenTxt.innerHTML = 'Gekozen moment: <b>' + formatLong(selDate) + ' om ' + selTime + '</b>';
      } else {
        chosen.hidden = true;
      }
      clearError($('#moment-error'));
    }

    /* --- Interactie kalender --- */
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.cal__day');
      if (!btn || btn.disabled) return;
      var parts = btn.dataset.iso.split('-');
      selDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      focusDate = selDate;
      selTime = null;
      render();
      renderSlots();
      syncFields();
    });

    grid.addEventListener('keydown', function (e) {
      var btn = e.target.closest('.cal__day');
      if (!btn) return;

      var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step === undefined && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();

      var parts = btn.dataset.iso.split('-');
      var cur = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      var target;

      if (e.key === 'Home') {
        target = firstSelectableFrom(minDate, 1);
      } else if (e.key === 'End') {
        target = firstSelectableFrom(maxDate, -1);
      } else {
        target = firstSelectableFrom(addDays(cur, step), step > 0 ? 1 : -1);
      }
      if (!target) return;

      focusDate = target;
      viewYear = target.getFullYear();
      viewMonth = target.getMonth();
      render();
      var next = grid.querySelector('.cal__day[data-iso="' + toISO(target) + '"]');
      if (next) next.focus();
    });

    prevBtn.addEventListener('click', function () { goMonth(-1); });
    nextBtn.addEventListener('click', function () { goMonth(1); });

    /* --- Validatie --- */

    // De foutmarkering hangt aan de dichtstbijzijnde wrapper. Voor de losse
    // melding onder de kalender is dat het paneel zelf, want die zit niet in
    // een .field. Zowel zetten als wissen moet dezelfde wrapper vinden,
    // anders blijft een melding hangen nadat de fout is opgelost.
    function fieldWrap(el) {
      return el.closest('.field') || el.closest('.fieldset') || el.closest('.pane');
    }

    function showError(el, text) {
      var wrap = fieldWrap(el);
      if (!wrap) return;
      wrap.classList.add('field--error');
      var err = $('.field__err', wrap);
      if (err && text) err.textContent = text;
      if (isControl(el)) el.setAttribute('aria-invalid', 'true');
    }

    // aria-invalid hoort alleen op echte formuliervelden, niet op de
    // kalender-groep waar de foutmelding visueel bij hoort.
    function isControl(el) {
      return el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName || '');
    }

    function clearError(el) {
      if (!el) return;
      var wrap = fieldWrap(el);
      if (wrap) wrap.classList.remove('field--error');
      if (isControl(el)) el.removeAttribute('aria-invalid');
    }

    var required = ['naam', 'email', 'telefoon'];

    function validate() {
      var problems = [];

      if (!selDate || !selTime) {
        showError(grid);
        problems.push({ el: grid });
      }

      required.forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        clearError(el);
        if (!el.value.trim()) {
          showError(el, 'Dit veld is verplicht.');
          problems.push({ el: el });
        }
      });

      var email = form.elements['email'];
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        showError(email, 'Vul een geldig mailadres in.');
        problems.push({ el: email });
      }

      var tel = form.elements['telefoon'];
      if (tel && tel.value.trim() && tel.value.replace(/[^0-9]/g, '').length < 9) {
        showError(tel, 'Vul een volledig telefoonnummer in.');
        problems.push({ el: tel });
      }

      var akkoord = form.elements['akkoord'];
      if (akkoord && !akkoord.checked) {
        showError(akkoord, 'U moet akkoord gaan om te kunnen versturen.');
        problems.push({ el: akkoord });
      }

      return problems;
    }

    // Fout weghalen zodra iemand corrigeert
    form.addEventListener('input', function (e) {
      if (e.target.name) clearError(e.target);
      hideMsg();
    });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'akkoord') clearError(e.target);
    });

    /* Vangnet. Reageert de mailservice onverhoopt niet, dan kan de bezoeker de
       aanvraag alsnog met zijn eigen mailprogramma naar dezelfde mailbox sturen.
       Alle ingevulde antwoorden staan dan al in het bericht, dus de gegevens
       raken nooit zoek. */
    function buildMailtoHref() {
      var regels = [];
      new FormData(form).forEach(function (waarde, naam) {
        if (naam.charAt(0) === '_') return;              // instellingen voor de mailservice
        if (!String(waarde).trim()) return;              // leeg veld overslaan
        var label = naam.charAt(0).toUpperCase() + naam.slice(1);
        regels.push(label + ': ' + waarde);
      });
      var onderwerp = selDate
        ? 'Intake-aanvraag ' + formatLong(selDate) + ' om ' + selTime
        : 'Intake-aanvraag via de website';
      return 'mailto:' + CONFIG.inbox +
             '?subject=' + encodeURIComponent(onderwerp) +
             '&body=' + encodeURIComponent(regels.join('\n'));
    }

    function showMsg(text, mailtoHref) {
      msgTxt.textContent = text;                          // wist ook een eerdere knop
      if (mailtoHref) {
        var wrap = document.createElement('span');
        wrap.style.cssText = 'display:block;margin-top:.8rem';
        var link = document.createElement('a');
        link.className = 'btn btn--sm';
        link.href = mailtoHref;
        link.textContent = 'Verstuur met mijn eigen mailprogramma';
        wrap.appendChild(link);
        msgTxt.appendChild(wrap);
      }
      msg.hidden = false;
    }
    function hideMsg() { msg.hidden = true; }

    function setBusy(busy) {
      submitBtn.setAttribute('aria-busy', String(busy));
      submitBtn.innerHTML = busy
        ? '<span class="spinner" aria-hidden="true"></span> Versturen…'
        : 'Intake aanvragen';
    }

    /* --- Verzenden --- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideMsg();

      var problems = validate();
      if (problems.length) {
        var first = problems[0].el;
        showMsg('Er ontbreekt nog iets. Controleer de rood gemarkeerde velden.');
        if (first && first.focus) {
          if (first === grid) {
            var day = grid.querySelector('.cal__day:not(:disabled)');
            (day || grid).focus();
          } else {
            first.focus();
          }
          (first.closest('.pane') || first).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      var data = new FormData(form);
      data.set('_subject', 'Nieuwe intake op ' + formatLong(selDate) + ' om ' + selTime);
      data.set('Gekozen moment', formatLong(selDate) + ' om ' + selTime);

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
          if (!r.ok || String(r.body.success) === 'false') {
            throw new Error(r.body.message || 'Verzenden mislukt');
          }
          successWhen.textContent = formatLong(selDate) + ' om ' + selTime;
          formBody.hidden = true;
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (window.history && history.replaceState) {
            history.replaceState(null, '', '#intake-bevestigd');
          }
        })
        .catch(function () {
          setBusy(false);
          showMsg('Het versturen lukte niet. Probeer het opnieuw, of stuur de aanvraag ' +
                  'met uw eigen mailprogramma. Bellen of WhatsAppen kan ook, op 06 27966531.',
                  buildMailtoHref());
        });
    });

    /* --- Startsituatie --- */
    var initial = firstSelectableFrom(minDate, 1);
    if (initial) {
      viewYear = initial.getFullYear();
      viewMonth = initial.getMonth();
      focusDate = initial;
    }
    render();
    renderSlots();
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */

  function init() {
    initHeader();
    initActiveNav();
    initReveal();
    initMobileCta();
    initPlanner();

    // Huidig jaartal in de footer
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
