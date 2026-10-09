import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const base = resolve(process.cwd(), 'docs');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const path = resolve(base, relative);
    if (path !== base && !path.startsWith(base + sep)) throw new Error('forbidden');
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    const bytes = await readFile(file);
    const ext = file.substring(file.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': types[ext] ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(bytes);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, () => console.log(`ECHO//SHIFT ready at http://localhost:${port}`));
