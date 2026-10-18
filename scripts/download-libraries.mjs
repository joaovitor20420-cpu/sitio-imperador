import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('dist/vendor', {recursive:true});
for (const file of ['lenis.min.js','lenis.css']) {
  const response = await fetch(`https://unpkg.com/lenis@1.3.26/dist/${file}`);
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  await writeFile(`dist/vendor/${file}`, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${file}`);
}
const fontResponse = await fetch('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;450;500;550;600;650&display=swap', {headers:{'User-Agent':'Mozilla/5.0'}});
if (!fontResponse.ok) throw new Error('Fonts unavailable');
let css = await fontResponse.text();
let index = 0;
for (const url of [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/g))]) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font ${response.status}`);
  const ext = new URL(url).pathname.split('.').at(-1);
  const name = `font-${index++}.${ext}`;
  await writeFile(`dist/vendor/${name}`, Buffer.from(await response.arrayBuffer()));
  css = css.replaceAll(url, `./${name}`);
}
await writeFile('dist/vendor/fonts.css', css);
console.log(`Saved ${index} local fonts`);
