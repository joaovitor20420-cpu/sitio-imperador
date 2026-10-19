import {readFile,stat,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const html = await readFile('dist/index.html','utf8');
const js = await readFile('dist/app.js','utf8');
const css = await readFile('dist/styles.css','utf8');

// 1. Unique IDs & valid anchor targets
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
for (const [,id] of html.matchAll(/(?:href="#|aria-controls=")([^"\s]+)"/g)) {
  assert(ids.includes(id),`Missing anchor: ${id}`);
}

// 2. Local assets existence & non-empty size
const paths = new Set([...html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)].map(match=>match[1]));
for(const asset of paths) {
  assert((await stat('dist'+asset)).size>0,`Missing asset ${asset}`);
}
for(const [,file] of js.matchAll(/image:'([^']+)'/g)) {
  assert((await stat('dist/assets/'+file)).size>0, `Missing tab photo ${file}`);
}

// 3. PNG alpha channel verification for all generated/brand RGBA assets
const requiredPngs = ['logo-imperador.png', 'botanical.png', 'toast.png', 'flowers.png', 'gastronomy.png', 'lantern.png'];
for (const png of requiredPngs) {
  const buf = await readFile(`dist/assets/${png}`);
  assert.equal(buf[25], 6, `${png} must be RGBA colorType 6`);
}

// 4. Accessibility, Pre-Flight & Security checks
assert.equal((html.match(/<h1\b/g)||[]).length,1,'One main heading');
assert(html.includes('lang="pt-BR"'));
assert(css.includes('prefers-reduced-motion'));
assert(!html.includes('—') && !html.includes('–'), 'Zero em-dashes or en-dashes allowed in HTML');
assert(!js.includes('innerHTML') && !js.includes('outerHTML') && !js.includes('document.write'), 'XSS-safe DOM manipulation required');
assert(!js.includes("addEventListener('scroll'"), 'Use Lenis scroll callback instead of raw window scroll listener');

// 5. Eyebrow restraint check (<= ceil(sections / 3))
const sectionCount = (html.match(/<section\b/g)||[]).length;
const eyebrowCount = (html.match(/class="eyebrow\b/g)||[]).length;
assert(eyebrowCount <= Math.ceil(sectionCount / 3), `Too many eyebrows: ${eyebrowCount} for ${sectionCount} sections`);

// 6. Verified Betim business data
const business=JSON.parse(await readFile('dist/business.json','utf8'));
assert.equal(business.whatsapp,'5531999728064');
assert.equal(business.officialDomain,null);

// 7. WCAG AA Contrast verification (Imperial Burgundy, Royal Gold & Champagne Ivory)
const lum = hex => {
  const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const pairs=[
  ['231815','f8f4ec'],
  ['5c4e46','f8f4ec'],
  ['5c4e46','efe8da'],
  ['fffdf9','5c161a'],
  ['f1e5d8','5c161a'],
  ['231815','ede3d2'],
  ['f6efe4','16100f'],
  ['cbbba8','16100f']
];
for(const [fg,bg] of pairs){
  const a=lum(fg),b=lum(bg),contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  console.log(`${fg}/${bg}: ${contrast.toFixed(2)}:1`);
  assert(contrast>=4.5,`Insufficient contrast ${fg} on ${bg}`);
}

const files=await readdir('dist/assets');
console.log(`PASS: ${paths.size} local references, ${ids.length} unique IDs, ${files.length} image assets (${requiredPngs.length} RGBA PNGs), ${eyebrowCount}/${sectionCount} eyebrows, zero em-dashes, XSS-safe JS, contacts and contrast verified.`);
