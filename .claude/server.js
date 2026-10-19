// Minimal static file server for local preview.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PORT = 4173;
const TYPES = {'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8',
  '.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png',
  '.mp4':'video/mp4','.webm':'video/webm','.xml':'application/xml','.txt':'text/plain;charset=utf-8','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}).end('404 ' + p); return; }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream',
                        'Cache-Control':'no-cache'});
    res.end(data);
  });
}).listen(PORT, () => console.log('serving ' + ROOT + ' on http://localhost:' + PORT));
