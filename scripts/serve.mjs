import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.json': 'application/json; charset=utf-8'
};

const baseSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...baseSecurityHeaders, 'Allow': 'GET, HEAD' });
      return res.end('Method Not Allowed');
    }
    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === '/__preview') {
      const width = [375, 768, 1440].includes(Number(url.searchParams.get('width')))
        ? Number(url.searchParams.get('width'))
        : 1440;
      res.writeHead(200, {
        ...baseSecurityHeaders,
        'Content-Type': 'text/html; charset=utf-8'
      });
      return res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verificação visual - ${width}px</title><style>body{margin:0;background:#ddd;font:14px sans-serif}header{padding:16px;background:#fff;position:sticky;top:0;z-index:5}a{margin-right:24px;color:#253b25}#report{padding:12px;font-size:12px}iframe{border:0;width:${width}px;height:960px;display:block;transform-origin:top left}main{overflow:hidden}</style></head><body><header><a href="/__preview?width=375">375px</a><a href="/__preview?width=768">768px</a><a href="/__preview?width=1440">1440px</a><a href="/">Página</a><div id="report">Conferindo layout...</div></header><main><iframe src="/" title="Sítio Imperador - prévia responsiva"></iframe></main><script>const frame=document.querySelector('iframe');function fit(){const scale=Math.min(1,innerWidth/${width});frame.style.transform='scale('+scale+')';document.querySelector('main').style.height=(960*scale)+'px'}fit();addEventListener('resize',fit);frame.addEventListener('load',async()=>{await frame.contentDocument.fonts.ready;const doc=frame.contentDocument;const missing=[...doc.images].filter(i=>i.getAttribute('src')&&i.loading!=='lazy'&&(!i.complete||!i.naturalWidth)).map(i=>i.getAttribute('src'));const overflow=doc.documentElement.scrollWidth>doc.documentElement.clientWidth;document.querySelector('#report').textContent='Viewport: '+frame.contentWindow.innerWidth+'px | Overflow horizontal: '+overflow+' | Imagens iniciais ausentes: '+missing.length+' | Título: '+doc.title;});</script></body></html>`);
    }
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403, baseSecurityHeaders);
      return res.end('Forbidden');
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    const data = await readFile(file);
    res.writeHead(200, {
      ...baseSecurityHeaders,
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'self'; object-src 'none';",
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, baseSecurityHeaders);
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
