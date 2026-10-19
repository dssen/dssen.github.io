#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   Refresh the Designs page.

   Recaptures a screenshot of every live project, optimises it into
   assets/img/work/, rebuilds designs.html from tools/projects.json,
   and re-stamps the asset URLs.

     node tools/refresh-designs.js                 everything
     node tools/refresh-designs.js kubana hotbowl  just those
     node tools/refresh-designs.js --no-capture    rebuild HTML only
     node tools/refresh-designs.js --list          show the projects

   Projects live in tools/projects.json — edit that to add, remove or
   reword one, then run this.
   ══════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(__dirname, 'projects.json');
const OUT_IMG = path.join(ROOT, 'assets', 'img', 'work');
const PAGE = path.join(ROOT, 'designs.html');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WA = '94706684344';

const args = process.argv.slice(2);
const noCapture = args.includes('--no-capture');
const listOnly = args.includes('--list');
const only = args.filter(a => !a.startsWith('--'));

const { stats, projects } = JSON.parse(fs.readFileSync(DATA, 'utf8'));

if (listOnly) {
  projects.forEach(p => console.log('  ' + p.slug.padEnd(14) + p.name.padEnd(26) + (p.internal ? '(this site)' : p.url)));
  process.exit(0);
}

/* ── capture ──────────────────────────────────────────────── */
/* Chrome writes the PNG then does not exit, so each run is backgrounded,
   polled for its file and killed. The portfolio's own page is captured
   with reduced motion forced: its hero animation never completes under
   Chrome's virtual clock, which otherwise yields an empty frame. */
function capture(p, tmp) {
  return new Promise((resolve) => {
    const png = path.join(tmp, p.slug + '.png');
    const profile = path.join(tmp, 'profile-' + p.slug);
    const url = p.internal ? 'http://localhost:4173/index.html' : p.url;
    const flags = [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=' + profile, '--hide-scrollbars',
      '--window-size=1440,900', '--virtual-time-budget=12000',
      '--screenshot=' + png, url
    ];
    if (p.internal) flags.unshift('--force-prefers-reduced-motion');

    const child = spawn(CHROME, flags, { stdio: 'ignore' });
    let waited = 0;
    const tick = setInterval(() => {
      const done = fs.existsSync(png) && fs.statSync(png).size > 0;
      if (done || waited++ > 45) {
        clearInterval(tick);
        setTimeout(() => {
          try { child.kill(); } catch (e) {}
          resolve(done ? png : null);
        }, done ? 1500 : 0);
      }
    }, 1000);
  });
}

function optimise(png, slug) {
  const jpg = path.join(OUT_IMG, slug + '.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '76',
    '--resampleWidth', '1200', png, '--out', jpg], { stdio: 'ignore' });
  return Math.round(fs.statSync(jpg).size / 1024);
}

/* ── page ─────────────────────────────────────────────────── */
const waRaw = (m) => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);

const card = (p, i) => `
        <article class="wcard p-rise">
          <a class="wcard__link" href="${p.url}"${p.internal ? '' : ' target="_blank" rel="noopener noreferrer"'}
             aria-label="${p.name} — open site">
            <div class="wcard__shot">
              <img src="assets/img/work/${p.slug}.jpg"
                   alt="Homepage of the ${p.name} website"
                   width="1200" height="750" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
              <span class="wcard__go" aria-hidden="true">Visit site <em>↗</em></span>
            </div>
            <div class="wcard__body">
              <div class="wcard__top">
                <span class="wcard__cat">${p.cat}</span>
                <span class="wcard__yr">${p.year}</span>
              </div>
              <h3 class="wcard__name">${p.name}</h3>
              <p class="wcard__host">${p.host}</p>
              <p class="wcard__d">${p.d}</p>
              <div class="chips wcard__tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
          </a>
        </article>`;

function rebuild() {
  let h = fs.readFileSync(PAGE, 'utf8');
  let changed = 0;

  // project grid
  const grid = projects.map(card).join('\n');
  const gridRe = /(<div class="wgrid">\n)[\s\S]*?(\n    <\/div>)/;
  if (!gridRe.test(h)) throw new Error('could not find the project grid in designs.html');
  h = h.replace(gridRe, (m, a, b) => { changed++; return a + grid + b; });

  // stats row — the live-sites figure tracks the project count
  const row = stats.map(s =>
    `      <li><b>${s.label.toLowerCase() === 'live sites' ? projects.length : s.n}</b><span>${s.label}</span></li>`
  ).join('\n');
  const statRe = /(<ul class="wstats p-rise">\n)[\s\S]*?(\n    <\/ul>)/;
  if (statRe.test(h)) h = h.replace(statRe, (m, a, b) => { changed++; return a + row + b; });

  // JSON-LD item list
  const items = projects.map((p, i) =>
    `        {"@type":"ListItem","position":${i + 1},"name":${JSON.stringify(p.name)},"url":${JSON.stringify(p.internal ? 'https://dssen.github.io/' : p.url)}}`
  ).join(',\n');
  const ldRe = /("itemListElement":\[\n)[\s\S]*?(\n      \])/;
  if (ldRe.test(h)) h = h.replace(ldRe, (m, a, b) => { changed++; return a + items + b; });

  fs.writeFileSync(PAGE, h);
  return changed;
}

/* ── run ──────────────────────────────────────────────────── */
(async () => {
  const targets = only.length ? projects.filter(p => only.includes(p.slug)) : projects;
  if (only.length && targets.length !== only.length) {
    const missing = only.filter(s => !projects.some(p => p.slug === s));
    console.error('  unknown project(s): ' + missing.join(', '));
    console.error('  run with --list to see the available slugs');
    process.exit(1);
  }

  if (!noCapture) {
    if (!fs.existsSync(CHROME)) {
      console.error('  Google Chrome not found at ' + CHROME);
      console.error('  Chrome is required for screenshots. Use --no-capture to rebuild the page only.');
      process.exit(1);
    }
    const needsLocal = targets.some(p => p.internal);
    if (needsLocal) {
      // the portfolio card shoots the local build, so the preview must be up
      try { execFileSync('curl', ['-sfo', '/dev/null', '--max-time', '5', 'http://localhost:4173/']); }
      catch (e) {
        console.error('  The local preview is not running, and one project captures it.');
        console.error('  Start it first:  node .claude/server.js');
        process.exit(1);
      }
    }

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-shots-'));
    console.log('  capturing ' + targets.length + ' site' + (targets.length === 1 ? '' : 's') + '…\n');
    let ok = 0, failed = [];
    for (const p of targets) {
      const png = await capture(p, tmp);
      if (!png) { failed.push(p.slug); console.log('  FAILED  ' + p.slug.padEnd(14) + p.url); continue; }
      const kb = optimise(png, p.slug);
      ok++;
      console.log('  ok      ' + p.slug.padEnd(14) + String(kb).padStart(4) + ' KB   ' + p.name);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log('\n  captured ' + ok + '/' + targets.length + (failed.length ? '  — failed: ' + failed.join(', ') : ''));
  }

  const changed = rebuild();
  console.log('  designs.html rebuilt (' + changed + ' blocks, ' + projects.length + ' projects)');

  // keep the cache-busting stamp in step
  try {
    execFileSync('node', [path.join(ROOT, 'stamp.js')], { cwd: ROOT, stdio: 'ignore' });
    console.log('  asset stamp refreshed');
  } catch (e) {
    console.log('  note: stamp.js did not run — asset URLs unchanged');
  }

  console.log('\n  Done. Preview at http://localhost:4173/designs.html, then deploy when you are happy.');
})();
