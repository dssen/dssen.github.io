/* Cache-busting build stamp.
   Hostinger serves CSS/JS with `Cache-Control: max-age=604800`, so a browser
   that has visited once keeps those files for a week and never sees a deploy.
   This rewrites every local CSS/JS reference to asset.ext?v=<stamp>, which
   gives each deploy a fresh URL. Run it before building the deploy archive:
       node stamp.js
*/
const fs = require('fs');
const ASSETS = ['style.css','pricing.css','work.css','script.js','pricing.js','work.js'];
const PAGES  = ['index.html','pricing.html','designs.html'];

const d = new Date();
const p = (n) => String(n).padStart(2,'0');
const stamp = `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;

let total = 0;
PAGES.forEach(page => {
  if (!fs.existsSync(page)) return;
  let h = fs.readFileSync(page, 'utf8');
  let n = 0;
  ASSETS.forEach(a => {
    // matches href="style.css", src="script.js", and any existing ?v=...
    const re = new RegExp('((?:href|src)=")' + a.replace('.', '\\.') + '(?:\\?v=[0-9]+)?(")', 'g');
    h = h.replace(re, (m, pre, post) => { n++; return pre + a + '?v=' + stamp + post; });
  });
  fs.writeFileSync(page, h);
  console.log(`  ${page.padEnd(14)} ${n} asset refs stamped`);
  total += n;
});
console.log(`  stamp = ${stamp}  (${total} refs total)`);
