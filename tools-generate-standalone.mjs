import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('./docs/', import.meta.url);
let html = await readFile(new URL('index.html', path), 'utf8');
const css = await readFile(new URL('styles.css', path), 'utf8');
const modules = ['levels', 'engine', 'storage', 'audio', 'renderer', 'app'];
let js = '';
for (const module of modules) {
  let source = await readFile(new URL(`js/${module}.js`, path), 'utf8');
  source = source.replace(/^import .*?;\s*/gm, '').replace(/\bexport\s+/g, '').replace(/^\/\/# sourceMappingURL=.*$/gm, '');
  js += `\n// ${module}\n${source}`;
}
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
html = html.replace(/<link rel="icon"[^>]*>/, '');
html = html.replace(/<script type="module"[^>]*><\/script>/, `<script>${js}</script>`);
html = html.replace('<meta name="description"', '<meta name="description"');
await writeFile(new URL('./PLAY_ECHO_SHIFT.html', import.meta.url), html);
console.log('Generated PLAY_ECHO_SHIFT.html (offline, single-file game).');
