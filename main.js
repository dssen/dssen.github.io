(() => {
  const WA = '94706684344';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Drawer menu */
  const tile = $('.menu-tile');
  const drawer = $('#drawer');
  const openDrawer = () => {
    drawer.hidden = false;
    tile.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('.drawer__close').focus();
  };
  const closeDrawer = (returnFocus = true) => {
    drawer.hidden = true;
    tile.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (returnFocus) tile.focus();
  };
  tile.addEventListener('click', openDrawer);
  $('.drawer__close').addEventListener('click', () => closeDrawer());
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
    if (e.target.closest('.drawer__nav a')) closeDrawer(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer();
  });

  /* Services accordion: one row open at a time */
  const rows = $$('.svc');
  rows.forEach((row) => {
    $('.svc__head', row).addEventListener('click', () => {
      const willOpen = !row.classList.contains('is-open');
      rows.forEach((r) => {
        r.classList.remove('is-open');
        $('.svc__head', r).setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        row.classList.add('is-open');
        $('.svc__head', row).setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* OTA commission calculator */
  const fmt = (n) => 'LKR ' + Math.round(n).toLocaleString('en-US');
  const rate = $('#rate'), nights = $('#nights'), comm = $('#comm');
  const paint = (input) => {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty('--pct', pct + '%');
  };
  const calc = () => {
    const r = +rate.value, n = +nights.value, c = +comm.value / 100;
    const monthly = r * n * c;
    $('#rate-out').textContent = fmt(r);
    $('#nights-out').textContent = n;
    $('#comm-out').textContent = comm.value + '%';
    $('#monthly').innerHTML = '<span>LKR</span>' + Math.round(monthly).toLocaleString('en-US');
    $('#yearly').textContent = fmt(monthly * 12);
    $('#saved').textContent = fmt(monthly * 0.2);
    [rate, nights, comm].forEach(paint);
    const msg = `Hi Danura, I'd like to talk about reducing my OTA commissions. Roughly: ${fmt(r)} average rate, ${n} OTA room nights a month at about ${comm.value}%.`;
    $('#calc-cta').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  };
  [rate, nights, comm].forEach((i) => i.addEventListener('input', calc));
  $('#calc').addEventListener('submit', (e) => e.preventDefault());
  calc();

  /* Tab sets: pricing (horizontal) and industries explorer (vertical) */
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const vertical = list.getAttribute('aria-orientation') === 'vertical';
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        const panel = $('#' + t.getAttribute('aria-controls'));
        const was = !panel.hidden;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        panel.hidden = !on;
        if (on && !was) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
      if (vertical && matchMedia('(max-width: 900px)').matches) {
        tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const fwd = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight'];
        const back = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft'];
        const d = fwd.includes(e.key) ? 1 : back.includes(e.key) ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = tabs[(i + d + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  /* GEO demo: a query types out, the engine "thinks", the answer names your brand */
  const demo = [
    { q: 'Best boutique hotel near Ella for a quiet stay?', a: 'Travellers who want somewhere quiet often pick <mark>Your Hotel</mark>: hillside rooms, strong recent reviews and an easy walk to Nine Arches Bridge.', c: ['yourhotel.lk', 'Google reviews'] },
    { q: 'Which skincare brand works in humid weather?', a: '<mark>Your Brand</mark> comes up often: lightweight formulas made for tropical climates, with clear ingredient lists and good reviews.', c: ['yourbrand.com', 'Reddit'] },
    { q: 'Who can build an online store for my clothing label?', a: '<mark>Your Studio</mark> is recommended in several local guides for Shopify builds with local payment gateways and fast delivery.', c: ['yourstudio.lk', 'LinkedIn'] },
    { q: 'Reliable car rental in Kandy with a driver?', a: '<mark>Your Rentals</mark> is well reviewed for airport pickups, clean vehicles and English-speaking drivers.', c: ['yourrentals.lk', 'Google Maps'] },
    { q: 'Good IELTS classes in Colombo for working adults?', a: 'For evening and weekend batches, <mark>Your Academy</mark> is a frequent pick, with small classes and published pass rates.', c: ['youracademy.lk', 'Facebook'] },
  ];
  const engines = $$('.engines li');
  const engineName = $('#chat-engine');
  const qEl = $('#chat-q');
  const aEl = $('#chat-a');
  const think = $('.chat__think');
  const caret = $('.chat__q .caret');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const show = (i) => {
    engines.forEach((li, k) => li.classList.toggle('is-on', k === i % engines.length));
    engineName.textContent = $('span', engines[i % engines.length]).textContent;
  };
  const paintAnswer = (d) => {
    aEl.innerHTML = `<p>${d.a}</p><p class="chat__cites">${d.c.map((x) => `<span>${x}</span>`).join('')}</p>`;
  };
  let geoVisible = false;
  new IntersectionObserver(([e]) => { geoVisible = e.isIntersecting; }, { threshold: 0.25 }).observe($('#geo'));
  caret.style.display = 'none';
  show(0);
  (async () => {
    if (still) {
      let i = 0;
      setInterval(() => { i = (i + 1) % demo.length; show(i); qEl.textContent = demo[i].q; paintAnswer(demo[i]); }, 8000);
      return;
    }
    let i = 0;
    await wait(4000);
    for (;;) {
      if (!geoVisible || document.hidden) { await wait(500); continue; }
      i = (i + 1) % demo.length;
      const d = demo[i];
      aEl.classList.add('is-hidden');
      await wait(450);
      show(i);
      qEl.textContent = '';
      caret.style.display = '';
      for (const ch of d.q) { qEl.textContent += ch; await wait(28 + Math.random() * 40); }
      caret.style.display = 'none';
      think.classList.add('is-on');
      await wait(1100);
      think.classList.remove('is-on');
      paintAnswer(d);
      aEl.classList.remove('is-hidden');
      await wait(5200);
    }
  })();

  /* Contact form composes a WhatsApp message */
  const form = $('#wa-form');
  const name = $('#f-name');
  const err = $('#f-name-err');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!name.value.trim()) {
      name.setAttribute('aria-invalid', 'true');
      err.hidden = false;
      name.focus();
      return;
    }
    name.removeAttribute('aria-invalid');
    err.hidden = true;
    const biz = $('#f-biz').value.trim();
    const lines = [
      `Hi Danura, I'm ${name.value.trim()}${biz ? ' from ' + biz : ''}.`,
      `Business type: ${$('#f-type').value}.`,
    ];
    const msg = $('#f-msg').value.trim();
    if (msg) lines.push(msg);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
  name.addEventListener('input', () => {
    if (name.value.trim()) { name.removeAttribute('aria-invalid'); err.hidden = true; }
  });

  /* Back to top with scroll progress, active nav link */
  const toTop = $('.to-top');
  const bar = $('.to-top__bar');
  const LEN = 138.2;
  const navLinks = $$('.main-nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    bar.style.strokeDashoffset = LEN * (1 - p);
    toTop.classList.toggle('is-shown', scrollY > innerHeight * 0.6);
    const mark = scrollY + innerHeight * 0.35;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.offsetTop <= mark) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === current));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  $('#year').textContent = new Date().getFullYear();
})();
