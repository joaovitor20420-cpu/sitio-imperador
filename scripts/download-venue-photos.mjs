import fs from 'node:fs/promises';
const base = 'https://cdn0.casamentos.com.br/vendor/0381/3_2/960/jpg/';
const photos = [
  ['hero.jpg', 'dscf6890_13_240381.jpeg', 'Piscina'],
  ['garden.jpg', 'img-3827_13_240381.jpeg', 'Cerimônia na área externa'],
  ['hall.jpg', '43_13_240381.jpeg', 'Salão de festas'],
  ['pool.jpg', 'dscf5373_13_240381.jpeg', 'Área da piscina'],
  ['celebration.jpg', '20190209-130945_13_240381-165344030726105.jpeg', '15 anos'],
  ['wedding.jpg', '20190209-214730_13_240381-165344035521364.jpeg', 'Casamento'],
  ['exterior.jpg', 'dscf5364_13_240381-164921088122852.jpeg', 'Área externa'],
  ['decor.jpg', '20170708-122336_13_240381.jpeg', 'Decoração interna'],
  ['rustic.jpg', 'dscf0047_13_240381.jpeg', 'Decoração rústica'],
  ['dance.jpg', 'dscf0078_13_240381-164921088337113.jpeg', 'Dança do casal'],
  ['bouquet.jpg', 'dscf0099_13_240381-164921088534504.jpeg', 'Bouquet na piscina'],
  ['flowers.jpg', 'dscf6704_13_240381-164921090356349.jpeg', 'Decoração'],
  ['day-exterior.jpg', '20190209-135301_13_240381-165344035635672.jpeg', 'Área externa'],
  ['pool-day.jpg', 'img-20170518-wa0005_13_240381-165344041391515.jpeg', 'Piscina'],
];
await fs.mkdir('dist/assets', { recursive: true });
await fs.mkdir('docs', { recursive: true });
const sources = await Promise.all(photos.map(async ([file, remote, caption]) => {
  const url = base + remote;
  try { await fs.access(`dist/assets/${file}`); }
  catch { 
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(`dist/assets/${file}`, bytes);
    console.log(`${file}: ${bytes.length} bytes`);
  }
  return { file: `assets/${file}`, caption, url, sourcePage: 'https://www.casamentos.com.br/sitio-casamento/imperador-eventos--e240381' };
}));
await fs.writeFile('docs/photo-sources.json', JSON.stringify({ downloadedAt: '2026-10-18', photos: sources }, null, 2));
