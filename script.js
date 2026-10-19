/* ══════════════════════════════════════════════════════════════
   DANURA SENAN — script.js
   GSAP + ScrollTrigger + Lenis · vanilla, no framework
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  // WhatsApp — 0706684344 in international format (no + or spaces)
  var WHATSAPP = '94706684344';
  var WA_MSG   = "Hi Danura — I found your website and I'd like to talk about my business.";
  function waLink(){ return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(WA_MSG); }

  var ROOT      = document.documentElement;
  var REDUCE    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_TOUCH  = window.matchMedia('(pointer: coarse)').matches;
  var IS_MOB    = window.matchMedia('(max-width: 768px)').matches;
  var SAVE_DATA = !!(navigator.connection && navigator.connection.saveData);

  var lenis = null;
  var EASE = { out:'power4.out', soft:'power2.out', inout:'power3.inOut', expo:'expo.out' };

  /* The hero pin is created last (it waits for the preloader), so
     ScrollTrigger's internal list ends up out of document order and its
     refresh never accounts for the hero's pin-spacing — every trigger below
     measures one viewport too high. sort() before refresh() fixes it.
     Always refresh through here, never call ScrollTrigger.refresh() directly. */
  var _rt;
  function refreshST (delay) {
    clearTimeout(_rt);
    _rt = setTimeout(function () {
      if (!window.ScrollTrigger) return;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, delay || 0);
  }

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── BOOT ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initWhatsApp();

    var ok = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (!ok || REDUCE) {
      // Static, complete, fully readable site.
      clearTimeout(window.__DSFAIL);
      ROOT.classList.remove('anim');
      var pre = $('#preloader'); if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
      initNav(); initIndustries(); initAnchors(false); initFab(true);
      return;
    }

    clearTimeout(window.__DSFAIL);
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({ markers:false, toggleActions:'play none none reverse' });
    ScrollTrigger.config({ ignoreMobileResize:true });

    init();
  });

  function init () {
    // The .ln masks start at CSS translateY(110%). GSAP parses that into `y`
    // in px, so a later yPercent tween would be a no-op. Re-declare it as
    // yPercent up front so every line-reveal animates correctly.
    gsap.set('.ln > span', { y: 0, yPercent: 110 });

    initLenis();
    initAnchors(true);
    initNav();
    initVideos();
    if (!IS_TOUCH) { initCursor(); initMagnetic(); }
    initStats();
    initMission();
    initPillars();
    initGeo();
    initStory();
    initServices();
    initIndustries();
    initCta();
    initFooter();
    initProgress();
    initFab(false);
    initPreloader();          // runs last, owns the hero entrance

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { refreshST(); });
    }
    window.addEventListener('load', function () { refreshST(); });
    initLateLayout();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { refreshST(); }, 150);
    }, { passive:true });
  }

  /* ══ 01 · WHATSAPP LINKS ═══════════════════════════════════ */
  function initWhatsApp () {
    var href = waLink();
    $$('[data-wa]').forEach(function (a) {
      a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      if (!a.getAttribute('aria-label')) {
        a.setAttribute('aria-label', (a.textContent || 'Message Danura').trim() + ' — opens WhatsApp');
      }
    });
  }

  /* ══ 02 · SPLIT TEXT ═══════════════════════════════════════ */
  /* mode: 'word' | 'char'.  Keeps the sentence readable to screen
     readers via aria-label + aria-hidden fragments.              */
  function splitText (el, mode) {
    if (!el || el.dataset.split === 'done') return [];
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    var words = text.split(' ');
    var out = [];

    words.forEach(function (w, i) {
      var wrap = document.createElement('span');
      wrap.className = 'sp-w';
      wrap.setAttribute('aria-hidden', 'true');

      if (mode === 'char') {
        w.split('').forEach(function (ch) {
          var c = document.createElement('span');
          c.className = 'sp-c';
          c.textContent = ch;
          wrap.appendChild(c);
          out.push(c);
        });
      } else {
        wrap.textContent = w;
        out.push(wrap);
      }

      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });

    el.dataset.split = 'done';

    // background-clip:text does not survive being split into fragments, so
    // gradient headings get their gradient painted per-fragment instead.
    if (el.classList.contains('grad') || el.classList.contains('grad-geo')) {
      paintGradient(el, out);
    }
    return out;
  }

  function paintGradient (el, frags) {
    var geo  = el.classList.contains('grad-geo');
    var from = geo ? [123, 92, 255] : [0, 229, 255];
    var to   = geo ? [0, 229, 255]  : [43, 111, 255];

    el.style.background = 'none';
    el.style.webkitTextFillColor = 'currentColor';

    var n = Math.max(frags.length - 1, 1);
    frags.forEach(function (f, i) {
      var t = i / n;
      var c = 'rgb(' + from.map(function (v, k) {
        return Math.round(v + (to[k] - v) * t);
      }).join(',') + ')';
      f.style.color = c;
      f.style.webkitTextFillColor = c;
    });
  }

  /* ══ 03 · LENIS ════════════════════════════════════════════ */
  function initLenis () {
    if (typeof window.Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
      infinite: false
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function initAnchors (smooth) {
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      a.addEventListener('click', function (e) {
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        closeMenu();
        if (smooth && lenis) lenis.scrollTo(t, { offset:-80, duration:1.5 });
        else t.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
  }

  /* ══ 04 · PRELOADER ════════════════════════════════════════ */
  function initPreloader () {
    var pre  = $('#preloader');
    var num  = $('#preNum');
    var bar  = $('#preBar');
    var word = $('#preWord');
    // No preloader on this page (e.g. pricing.html). initLenis() leaves
    // Lenis stopped and the preloader timeline is what normally starts it,
    // so start it here or the page cannot be scrolled at all.
    if (!pre) { if (lenis) lenis.start(); heroIntro(); return; }

    var repeat = false;
    try { repeat = sessionStorage.getItem('ds_seen') === '1'; sessionStorage.setItem('ds_seen','1'); } catch (e) {}

    var chars = splitText(word, 'char');
    gsap.set(chars, { yPercent: 110, opacity: 0 });

    var counter = { v: 0 };
    var tl = gsap.timeline({
      onComplete: function () {
        if (pre.parentNode) pre.parentNode.removeChild(pre);
        if (lenis) lenis.start();
        refreshST();   // the hero pin now exists — re-sort and re-measure
      }
    });

    tl.to(counter, {
      v: 100,
      duration: repeat ? 0.7 : 1.6,
      ease: 'power2.inOut',
      onUpdate: function () {
        num.textContent = String(Math.round(counter.v)).padStart(3, '0');
      }
    }, 0)
      .to(bar, { scaleX: 1, duration: repeat ? 0.7 : 1.6, ease: 'power2.inOut' }, 0)
      .to([num, bar], { opacity: 0, y: -20, duration: 0.4, ease: EASE.soft }, '>-0.05')
      .set(word, { opacity: 1 })
      .to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.02, ease: EASE.out }, '>-0.1');

    if (!repeat) tl.to({}, { duration: 0.35 });

    tl.to(word, { opacity: 0, y: -30, duration: 0.45, ease: EASE.soft })
      .to(pre, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.1,
        ease: 'power4.inOut',
        onStart: heroIntro
      }, '>-0.15');
  }

  /* ══ 05 · HERO ═════════════════════════════════════════════ */
  function heroIntro () {
    var hero = $('#hero');
    if (!hero) return;

    var lines = $$('.hero__title .ln > span');
    var tl = gsap.timeline({ defaults:{ ease:EASE.out } });

    tl.fromTo($('.hero__media .scene'), { opacity:0 }, { opacity:1, duration:1.4, ease:EASE.soft }, 0)
      .fromTo($('.hero .gridlines'), { opacity:0 }, { opacity:.35, duration:1.2 }, 0.2)
      .fromTo($('.hero .eyebrow'), { y:20, opacity:0 }, { y:0, opacity:1, duration:.7 }, 0.35)
      .to(lines, { yPercent:0, duration:1.05, stagger:.09, ease:EASE.expo }, 0.5)
      .fromTo($('.hero__sub'), { y:24, opacity:0 }, { y:0, opacity:1, duration:.8 }, 1.15)
      .fromTo($$('.hero .cta-row'), { y:18, opacity:0 }, { y:0, opacity:1, duration:.8 }, 1.35)
      .fromTo($$('.hero__meta .hm'), { opacity:0 }, { opacity:1, duration:.7, stagger:.06 }, 1.5);

    // Scroll-out: pin + parallax + blur (desktop only)
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      var t = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      t.to('.hero__body', { y:-140, opacity:0, filter:'blur(8px)', ease:'none' }, 0)
       .to('.hero__meta', { opacity:0, ease:'none' }, 0)
       .to('.hero__media .scene', { scale:1.14, filter:'brightness(.45)', ease:'none' }, 0);
    });
  }

  /* ══ 06 · NAV ══════════════════════════════════════════════ */
  function initNav () {
    var nav = $('#nav');
    var burger = $('#burger');
    var menu = $('#mobileMenu');
    if (!nav) return;

    var last = 0, hidden = false;
    function onScroll () {
      var y = window.scrollY || window.pageYOffset;
      nav.classList.toggle('is-solid', y > 80);

      if (menu && menu.classList.contains('is-open')) return;
      var down = y > last && y > 240;
      if (down !== hidden) {
        hidden = down;
        if (window.gsap) gsap.to(nav, { yPercent: down ? -110 : 0, duration:.4, ease:'power3.out' });
        else nav.style.transform = down ? 'translateY(-110%)' : '';
      }
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (lenis) { open ? lenis.stop() : lenis.start(); }
        document.body.style.overflow = open ? 'hidden' : '';
      });
      menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }
  }

  function closeMenu () {
    var menu = $('#mobileMenu'), burger = $('#burger');
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
    if (lenis) lenis.start();
    document.body.style.overflow = '';
  }

  /* ══ 07 · CURSOR ═══════════════════════════════════════════ */
  function initCursor () {
    var dot = $('#cursorDot'), ring = $('#cursorRing');
    if (!dot || !ring) return;
    document.body.classList.add('cursor-on');

    var dx = gsap.quickTo(dot,  'x', { duration:.12, ease:'power3' });
    var dy = gsap.quickTo(dot,  'y', { duration:.12, ease:'power3' });
    var rx = gsap.quickTo(ring, 'x', { duration:.55, ease:'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration:.55, ease:'power3' });

    var shown = false;
    window.addEventListener('pointermove', function (e) {
      if (!shown) { shown = true; gsap.to([dot, ring], { opacity:1, duration:.3 }); }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive:true });

    window.addEventListener('pointerdown', function () { gsap.to(ring, { scale:.82, duration:.2 }); });
    window.addEventListener('pointerup',   function () { gsap.to(ring, { scale:1,   duration:.3 }); });
    document.addEventListener('mouseleave', function () { gsap.to([dot, ring], { opacity:0, duration:.25 }); shown = false; });

    var hot = 'a, button, .row, [data-magnetic], [data-cursor]';
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest ? e.target.closest(hot) : null;
      if (!t) return;
      var mode = t.getAttribute('data-cursor');
      if (mode === 'view') {
        ring.classList.add('is-view');
        ring.firstElementChild.textContent = 'VIEW';
      } else {
        ring.classList.add('is-link');
      }
      gsap.to(dot, { scale:0, duration:.25 });
    });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest ? e.target.closest(hot) : null;
      if (!t) return;
      ring.classList.remove('is-link', 'is-view');
      gsap.to(dot, { scale:1, duration:.25 });
    });
  }

  /* ══ 08 · MAGNETIC BUTTONS ═════════════════════════════════ */
  function initMagnetic () {
    $$('[data-magnetic]').forEach(function (el) {
      var mx = gsap.quickTo(el, 'x', { duration:.5, ease:'power3' });
      var my = gsap.quickTo(el, 'y', { duration:.5, ease:'power3' });
      var label = el.querySelector('span');
      var lx = label ? gsap.quickTo(label, 'x', { duration:.6, ease:'power3' }) : null;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = e.clientX - (r.left + r.width / 2);
        var py = e.clientY - (r.top + r.height / 2);
        var cap = function (v) { return Math.max(-14, Math.min(14, v)); };
        mx(cap(px * .35)); my(cap(py * .35));
        if (lx) lx(cap(px * .18));
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x:0, y:0, duration:.7, ease:'power3.out' });
        if (label) gsap.to(label, { x:0, duration:.7, ease:'power3.out' });
      });
    });
  }

  /* ══ 09 · VIDEOS ═══════════════════════════════════════════ */
  function initVideos () {
    var hero = $('#heroVideo');

    // Hero: scrub on desktop, gentle loop on mobile
    if (hero) {
      hero.muted = true;
      if (IS_MOB || IS_TOUCH) {
        hero.loop = true;
        hero.setAttribute('autoplay', '');
        var p = hero.play(); if (p && p.catch) p.catch(function () {});
      } else {
        scrubVideo(hero, $('#hero'));
      }
    }

    // Lazy scenes 02 & 03 — skipped entirely on mobile / data-saver
    var lazies = $$('video[data-lazy]');
    if (IS_MOB || SAVE_DATA) return;
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var v = en.target;
        io.unobserve(v);
        loadLazyVideo(v);
      });
    }, { rootMargin: '200% 0px' });

    lazies.forEach(function (v) { io.observe(v); });
  }

  function loadLazyVideo (v) {
    var webm = v.getAttribute('data-src-webm');
    var mp4  = v.getAttribute('data-src-mp4');
    if (webm) { var s1 = document.createElement('source'); s1.src = webm; s1.type = 'video/webm'; v.appendChild(s1); }
    if (mp4)  { var s2 = document.createElement('source'); s2.src = mp4;  s2.type = 'video/mp4';  v.appendChild(s2); }
    v.muted = true;
    v.preload = 'auto';
    v.load();

    if (v.hasAttribute('data-scrub')) {
      scrubVideo(v, v.closest('section'));
    } else {
      v.loop = true;
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  function scrubVideo (video, trigger) {
    if (!video || !trigger) return;
    video.pause();
    function setup () {
      var dur = video.duration;
      if (!dur || !isFinite(dur)) return;
      gsap.to(video, {
        currentTime: dur,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    }
    if (video.readyState >= 1) setup();
    else video.addEventListener('loadedmetadata', setup, { once:true });
  }

  /* ══ 10 · STATS ════════════════════════════════════════════ */
  function initStats () {
    var sec = $('#stats');
    if (!sec) return;

    ScrollTrigger.create({
      trigger: sec,
      start: 'top 78%',
      once: true,
      onEnter: function () {
        $$('.stat').forEach(function (cell, i) {
          gsap.fromTo(cell, { opacity:0, y:22 },
            { opacity:1, y:0, duration:.8, delay:i * .11, ease:EASE.out });
        });

        $$('.stat__n[data-count]').forEach(function (el, i) {
          var target = parseFloat(el.getAttribute('data-count'));
          var from   = parseFloat(el.getAttribute('data-from') || '0');
          var pad    = parseInt(el.getAttribute('data-pad') || '0', 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var o = { v: from };
          gsap.to(o, {
            v: target,
            duration: 1.9,
            delay: i * .11,
            ease: EASE.soft,
            onUpdate: function () {
              var n = Math.round(o.v);
              el.textContent = (pad ? String(n).padStart(pad, '0') : String(n)) + suffix;
            }
          });
        });

        var typer = $('.stat__n[data-type]');
        if (typer) {
          var word = typer.getAttribute('data-type');
          var n = 0;
          var iv = setInterval(function () {
            n++;
            typer.textContent = word.slice(0, n);
            if (n >= word.length) {
              clearInterval(iv);
              setTimeout(function () { typer.closest('.stat').classList.add('is-done'); }, 1400);
            }
          }, 140);
        }
      }
    });

    initTicker();
  }

  function initTicker () {
    var track = $('#tickerTrack');
    if (!track) return;
    var tw = gsap.to(track, { xPercent:-50, duration:40, ease:'none', repeat:-1 });

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        tw.timeScale(self.direction === -1 ? -1 : 1);
      }
    });

    track.parentNode.addEventListener('pointerenter', function () { tw.pause(); });
    track.parentNode.addEventListener('pointerleave', function () { tw.resume(); });
  }

  /* ══ 11 · MISSION — word illumination ══════════════════════ */
  function initMission () {
    var sec = $('#mission');
    if (!sec) return;

    $$('.mission__stmt').forEach(function (stmt) {
      var words = splitText(stmt, 'word');
      gsap.fromTo(words,
        { opacity:.12, y:14, filter:'blur(5px)' },
        {
          opacity:1, y:0, filter:'blur(0px)',
          ease:'none', stagger:.35,
          scrollTrigger: {
            trigger: stmt,
            start: 'top 82%',
            end: 'center 46%',
            scrub: .8,
            invalidateOnRefresh: true
          }
        });
    });

    gsap.fromTo('.mission__sup', { opacity:0, y:26 }, {
      opacity:1, y:0, duration:1, ease:EASE.out,
      scrollTrigger: { trigger:'.mission__sup', start:'top 86%' }
    });

    reveal($$('#mission .secnum'));
  }

  /* ══ 12 · PILLARS ══════════════════════════════════════════ */
  function initPillars () {
    var sec = $('#pillars');
    if (!sec) return;

    headReveal(sec);

    gsap.fromTo('.cards .card',
      { y:70, opacity:0, rotateX:8 },
      {
        y:0, opacity:1, rotateX:0,
        duration:1.05, stagger:.14, ease:EASE.out,
        scrollTrigger:{ trigger:'.cards', start:'top 78%' }
      });

    // Background video parallax
    var media = $('.pillars__media');
    if (media) {
      gsap.fromTo(media, { yPercent:-6 }, {
        yPercent:6, ease:'none',
        scrollTrigger:{ trigger:sec, start:'top bottom', end:'bottom top', scrub:.8 }
      });
    }

    if (IS_TOUCH) return;

    // 3D tilt + cursor highlight
    $$('.card.tilt').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotationX', { duration:.6, ease:'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration:.6, ease:'power3' });
      var tz = gsap.quickTo(card, 'z',         { duration:.6, ease:'power3' });

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top)  / r.height;
        ry((px - .5) * 16);
        rx((.5 - py) * 16);
        tz(30);
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(card, { rotationX:0, rotationY:0, z:0, duration:.8, ease:'power3.out' });
      });
    });
  }

  /* ══ 13 · GEO SPOTLIGHT ════════════════════════════════════ */
  function initGeo () {
    var sec = $('#geo');
    if (!sec) return;

    particles($('#geoParticles'), 40);

    var s1 = $('.geo__state.is-1');
    var s2 = $('.geo__state.is-2');
    var s3 = $('.geo__state.is-3');
    var c1 = splitText(s1, 'char');
    var c2 = splitText(s2, 'char');
    var c3 = splitText(s3, 'char');

    gsap.set([c2, c3], { yPercent:110, opacity:0 });
    gsap.set(c1, { yPercent:110, opacity:0 });

    var mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', function () {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: '+=180%',
          pin: '.geo__pin',
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // State 1 in
      tl.to(c1, { yPercent:0, opacity:1, duration:1, stagger:.012, ease:EASE.out }, 0)
        .to(s1, { opacity:0, y:-60, filter:'blur(6px)', duration:.7, ease:EASE.soft }, 1.6)
        // State 2
        .set(s2, { opacity:1 }, 1.7)
        .to(c2, { yPercent:0, opacity:1, duration:1, stagger:.012, ease:EASE.out }, 1.8)
        .to(s2, { opacity:0, y:-60, filter:'blur(6px)', duration:.7, ease:EASE.soft }, 3.4)
        // State 3 — the payoff
        .set(s3, { opacity:1 }, 3.5)
        .to(c3, { yPercent:0, opacity:1, duration:1.1, stagger:.018, ease:EASE.out }, 3.6)
        .fromTo('.geo__tail > *', { opacity:0, y:22 },
          { opacity:1, y:0, duration:.8, stagger:.12, ease:EASE.out }, 4.4);

      // Ambient glow rotation across the whole pin
      gsap.fromTo('.geo__glow',
        { rotate:0, scale:.9 },
        {
          rotate:180, scale:1.15, ease:'none',
          scrollTrigger:{ trigger:sec, start:'top bottom', end:'bottom top', scrub:1 }
        });
    });

    mm.add('(max-width: 1023px)', function () {
      [[s1,c1],[s2,c2],[s3,c3]].forEach(function (pair) {
        gsap.set(pair[0], { opacity:1, position:'relative' });
        gsap.to(pair[1], {
          yPercent:0, opacity:1, duration:.9, stagger:.012, ease:EASE.out,
          scrollTrigger:{ trigger:pair[0], start:'top 84%' }
        });
      });
      gsap.fromTo('.geo__tail > *', { opacity:0, y:22 },
        { opacity:1, y:0, duration:.8, stagger:.1, ease:EASE.out,
          scrollTrigger:{ trigger:'.geo__tail', start:'top 88%' } });
    });
  }

  function particles (host, n) {
    if (!host) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.top  = (Math.random() * 100) + '%';
      frag.appendChild(p);
    }
    host.appendChild(frag);
    $$('i', host).forEach(function (p) {
      gsap.to(p, {
        y: (Math.random() * 180 - 90),
        x: (Math.random() * 120 - 60),
        opacity: Math.random() * .45 + .08,
        duration: Math.random() * 12 + 12,
        repeat: -1, yoyo: true, ease: 'sine.inOut',
        delay: Math.random() * 6
      });
    });
  }

  /* ══ 14 · STORY TIMELINE ═══════════════════════════════════ */
  function initStory () {
    var sec = $('#story');
    var track = $('#storyTrack');
    if (!sec || !track) return;

    var mm = gsap.matchMedia();

    // Desktop — horizontal scroll
    mm.add('(min-width: 1024px)', function () {
      var panels = $$('.sp', track);
      var getDist = function () { return track.scrollWidth - window.innerWidth + 80; };

      var tween = gsap.to(track, {
        x: function () { return -getDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: function () { return '+=' + getDist(); },
          pin: '.story__pin',
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var bar = $('#storyProgress');
            if (bar) gsap.set(bar, { scaleX: self.progress });
          }
        }
      });

      panels.forEach(function (p) {
        gsap.fromTo(p.querySelector('.sp__c'),
          { opacity:.3, y:40 },
          {
            opacity:1, y:0, ease:'none',
            scrollTrigger:{
              trigger: p, containerAnimation: tween,
              start: 'left 78%', end: 'left 42%', scrub: true
            }
          });

        // Years parallax faster than their panel
        gsap.fromTo(p.querySelector('.sp__yr'),
          { x:60 },
          {
            x:-60, ease:'none',
            scrollTrigger:{
              trigger: p, containerAnimation: tween,
              start: 'left right', end: 'right left', scrub: true
            }
          });

        ScrollTrigger.create({
          trigger: p, containerAnimation: tween,
          start: 'left 72%',
          onEnter:     function () { p.classList.add('is-seen','is-active'); },
          onLeaveBack: function () { p.classList.remove('is-active'); }
        });
      });

      return function () { gsap.set(track, { clearProps:'x' }); };
    });

    // Mobile — vertical stack
    mm.add('(max-width: 1023px)', function () {
      $$('.sp', track).forEach(function (p) {
        gsap.fromTo(p, { opacity:0, y:34 }, {
          opacity:1, y:0, duration:.9, ease:EASE.out,
          scrollTrigger:{ trigger:p, start:'top 86%' }
        });
      });
    });

    headReveal(sec, '.story__t');
    reveal($$('#story .secnum'));
  }

  /* ══ 15 · SERVICES ═════════════════════════════════════════ */
  function initServices () {
    var sec = $('#services');
    if (!sec) return;
    headReveal(sec);
    gsap.fromTo('.svc__r', { y:26, opacity:0 }, {
      y:0, opacity:1, duration:.8, stagger:.05, ease:EASE.soft,
      scrollTrigger:{ trigger:'.svc', start:'top 82%' }
    });
  }

  /* ══ 16 · INDUSTRIES ═══════════════════════════════════════ */
  function initIndustries () {
    var rows = $$('.row');
    if (!rows.length) return;

    var HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Pointer devices open rows via :hover / :focus-within in CSS, so tap
    // toggling is only wired up where hover does not exist.
    if (!HOVER) {
      rows.forEach(function (row) {
        function toggle () {
          var open = row.classList.contains('is-open');
          rows.forEach(function (r) { r.classList.remove('is-open'); });
          if (!open) row.classList.add('is-open');
          refreshST(720);
        }
        row.addEventListener('click', toggle);
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
      rows[0].classList.add('is-open');
    }

    if (!window.gsap || REDUCE) return;

    headReveal($('#work'));
    gsap.fromTo('.row', { y:30, opacity:0 }, {
      y:0, opacity:1, duration:.85, stagger:.08, ease:EASE.out,
      scrollTrigger:{ trigger:'#rows', start:'top 80%' }
    });
  }

  /* ══ 17 · FINAL CTA ════════════════════════════════════════ */
  function initCta () {
    var sec = $('#cta');
    if (!sec) return;

    var tl = gsap.timeline({ scrollTrigger:{ trigger:sec, start:'top 62%' } });
    tl.to('.cta__t .ln > span', { yPercent:0, duration:1.1, stagger:.1, ease:EASE.out }, 0)
      .fromTo('.cta .glow--d', { scale:.7, opacity:0 }, { scale:1, opacity:.55, duration:1.6, ease:EASE.soft }, 0)
      .to('.cta__s', { opacity:1, y:0, duration:.8, ease:EASE.out }, .5)
      .to('.cta .cta-row', { opacity:1, y:0, duration:.8, ease:EASE.out }, .65)
      .to('.cta__note', { opacity:1, y:0, duration:.8, ease:EASE.out }, .8);

    reveal($$('#cta .secnum'));
  }

  /* ══ 18 · FOOTER ═══════════════════════════════════════════ */
  function initFooter () {
    var mark = $('.foot__mark');
    if (!mark) return;
    ScrollTrigger.create({
      trigger: mark, start:'top 92%',
      onEnter: function () { mark.classList.add('is-lit'); }
    });
    gsap.fromTo('.foot__col', { y:24, opacity:0 }, {
      y:0, opacity:1, duration:.8, stagger:.1, ease:EASE.out,
      scrollTrigger:{ trigger:'.foot__grid', start:'top 88%' }
    });
  }

  /* ══ 19 · PROGRESS BAR ═════════════════════════════════════ */
  function initProgress () {
    var bar = $('#progressBar');
    if (!bar) return;
    gsap.to(bar, {
      scaleX: 1, ease:'none',
      scrollTrigger:{ trigger:document.body, start:'top top', end:'bottom bottom', scrub:.3 }
    });
  }

  /* ══ 20 · FLOATING WHATSAPP ════════════════════════════════ */
  function initFab (always) {
    var fab = $('#fab');
    if (!fab) return;
    if (always) { fab.classList.add('is-on'); return; }
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function (self) {
        fab.classList.toggle('is-on', self.progress > 0.12 && self.progress < 0.97);
      }
    });
  }

  /* ══ 21 · LATE LAYOUT SHIFTS ═══════════════════════════════ */
  /* Lazy images decode after the last refresh and can move every trigger
     below them. Re-measure as each one lands. */
  function initLateLayout () {
    $$('img').forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      img.addEventListener('load',  function () { refreshST(80); }, { once:true });
      img.addEventListener('error', function () { refreshST(80); }, { once:true });
    });
  }

  /* ══ HELPERS ═══════════════════════════════════════════════ */
  function reveal (els) {
    if (!els || !els.length) return;
    gsap.fromTo(els, { opacity:0, y:18 }, {
      opacity:1, y:0, duration:.8, stagger:.08, ease:EASE.soft,
      scrollTrigger:{ trigger:els[0], start:'top 88%' }
    });
  }

  function headReveal (scope, sel) {
    if (!scope) return;
    var head = scope.querySelector(sel || '.sechead__t');
    if (!head) return;
    var lines = head.querySelectorAll('.ln > span');
    var tl = gsap.timeline({ scrollTrigger:{ trigger:head, start:'top 84%' } });
    if (lines.length) tl.to(lines, { yPercent:0, duration:1, stagger:.09, ease:EASE.out }, 0);
    else tl.fromTo(head, { opacity:0, y:30 }, { opacity:1, y:0, duration:1, ease:EASE.out }, 0);
    var sub = scope.querySelector('.sechead__s');
    if (sub) tl.fromTo(sub, { opacity:0, y:18 }, { opacity:1, y:0, duration:.7, ease:EASE.soft }, .35);
    reveal(Array.prototype.slice.call(scope.querySelectorAll('.sechead .secnum')));
  }

})();
