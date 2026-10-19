/* ══════════════════════════════════════════════════════════════
   DANURA SENAN — Web designs page
   Loads after script.js, which owns WhatsApp links, nav, mobile
   menu, Lenis, anchors, cursor, magnetic buttons, progress bar,
   footer reveal and the floating button. This adds the .p-rise
   reveals, with the same failsafes as pricing.js.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ROOT   = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function showAll () { ROOT.classList.add('p-show'); }

  document.addEventListener('DOMContentLoaded', function () {
    var ok = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (!ok || REDUCE) { showAll(); return; }

    var net = setTimeout(showAll, 4000);
    try {
      initReveals();
      clearTimeout(net);
    } catch (e) {
      clearTimeout(net);
      showAll();
    }
  });

  function initReveals () {
    // Hero comes straight in on load.
    var hero = $$('.whero .p-rise');
    if (hero.length) {
      gsap.to(hero, {
        opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out', delay: .15
      });
    }

    // Project cards and the closing CTA arrive as they scroll in.
    $$('.wsec, .wcta').forEach(function (sec) {
      var rise = $$('.p-rise', sec);
      if (!rise.length) return;
      ScrollTrigger.batch(rise, {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: .8, stagger: .09, ease: 'power3.out' });
        }
      });
    });

    // Screenshots are lazy-loaded and shift everything below them as they
    // decode; re-measure so later triggers and the progress bar stay honest.
    $$('.wcard__shot img').forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      img.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
    });
  }
})();
