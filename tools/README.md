# Designs page tooling

The thumbnails on `designs.html` are real screenshots of the live sites,
captured locally and served from `assets/img/work/`. They are static files, so
when a client site changes the portfolio keeps showing the old design until you
refresh it.

## Refresh everything

```bash
node tools/refresh-designs.js
```

Recaptures all nine sites, optimises each to a 1200px JPEG, rebuilds the
project grid, stats row and JSON-LD in `designs.html`, and re-stamps the asset
URLs so browsers pick up the change.

## Refresh one site

```bash
node tools/refresh-designs.js themparadu
node tools/refresh-designs.js kubana hotbowl
```

Much quicker when only one client has redesigned. `--list` shows the slugs.

## Rebuild the page without recapturing

```bash
node tools/refresh-designs.js --no-capture
```

Use this after editing `tools/projects.json` — changing a description, adding
a tag, reordering the cards.

## Adding or removing a project

`tools/projects.json` is the single source of truth. Add an entry:

```json
{
  "slug": "newclient",
  "name": "New Client",
  "year": "2026",
  "cat": "Restaurant",
  "url": "https://newclient.example.com/",
  "host": "newclient.example.com",
  "internal": false,
  "d": "One or two sentences about what the site does.",
  "tags": ["Web Design", "Hospitality"]
}
```

Then `node tools/refresh-designs.js newclient`. The "live sites" figure in the
stats row follows the project count automatically — no need to edit it.

Cards appear in file order, so put the newest first.

## Requirements

- **Google Chrome** at `/Applications/Google Chrome.app` — used headlessly for
  the screenshots. Without it, only `--no-capture` works.
- **`sips`** — built into macOS, no install needed.
- The **local preview** must be running (`node .claude/server.js`) when the
  `portfolio` card is in scope, because that one captures this site itself.

## Two things that trip it up

Chrome writes the PNG and then does not exit, so the script backgrounds each
run, polls for the file and kills the process. If you adapt this, keep that.

The `portfolio` entry is captured with `--force-prefers-reduced-motion`. The
hero's GSAP intro never completes under Chrome's virtual clock, so without that
flag the screenshot comes out empty. The trade-off is that the hero photograph
is hidden in that one shot, since reduced-motion also hides `.scene`.
