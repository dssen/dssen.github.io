/* ══════════════════════════════════════════════════════════════
   DANURA SENAN — Pricing page behaviour
   Loads after script.js, which already owns: WhatsApp links, nav,
   mobile menu, Lenis, smooth anchors, cursor, magnetic buttons,
   progress bar, footer reveal and the floating WhatsApp button.
   This file adds only what is unique to this page.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ROOT   = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Force every .p-rise visible. Called whenever animation is not an
     option, so the page can never be left with invisible content. */
  function showAll () { ROOT.classList.add('p-show'); }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();

    var ok = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (!ok || REDUCE) { showAll(); return; }

    // Last-resort net: if a reveal throws or a trigger never fires,
    // reveal everything a few seconds in rather than hiding content.
    var net = setTimeout(showAll, 4000);

    try {
      initReveals();
      clearTimeout(net);
    } catch (e) {
      clearTimeout(net);
      showAll();
    }
  });

  /* ══ REVEALS ═══════════════════════════════════════════════ */
  function initReveals () {
    // Hero: straight in on load, no scroll trigger needed.
    var heroRise = $$('.phero .p-rise');
    if (heroRise.length) {
      gsap.to(heroRise, {
        opacity: 1, y: 0, duration: .9, stagger: .09,
        ease: 'power3.out', delay: .15
      });
    }

    // Everything below the fold: stagger in per section as it arrives.
    $$('.psec, .pcta').forEach(function (sec) {
      var rise = $$('.p-rise', sec);
      if (!rise.length) return;

      ScrollTrigger.batch(rise, {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1, y: 0, duration: .75, stagger: .07, ease: 'power3.out'
          });
        }
      });
    });

    // A details panel changes page height; re-measure so later triggers
    // and the progress bar stay accurate.
    $$('details').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  /* ══ CATEGORY TABS ═════════════════════════════════════════ */
  /* Highlights whichever pricing section currently owns the viewport.
     Plain IntersectionObserver so it works with or without GSAP. */
  function initTabs () {
    var tabs = $$('.ptab');
    if (!tabs.length) return;

    var map = {};
    var sections = [];

    tabs.forEach(function (t) {
      var id = t.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var sec = document.querySelector(id);
      if (!sec) return;
      map[sec.id] = t;
      sections.push(sec);
    });
    if (!sections.length) return;

    function setActive (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        if (on) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });
    }

    if (!('IntersectionObserver' in window)) { setActive(map[sections[0].id]); return; }

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });

      // Topmost section still on screen wins.
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { setActive(map[sections[i].id]); return; }
      }
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  }
})();
