// Post-build audit of dist/: one title / canonical / description per page,
// canonical equals the page's own URL, unique titles & descriptions, valid
// JSON-LD, sitemap URLs map to real files, and no broken internal links.
// Usage: node scripts/verify_dist.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const site = (process.env.PUBLIC_SITE_URL || 'https://approveddecorators.co.uk').replace(/\/$/, '');

const htmlFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
})(dist);

const urlFor = (file) => {
  const rel = path.relative(dist, file).replace(/\\/g, '/').replace(/\.html$/, '');
  return rel === 'index' ? `${site}/` : `${site}/${rel}`;
};
const fileForPath = (p) => {
  const clean = p.split('#')[0].split('?')[0].replace(/\/$/, '');
  if (clean === '') return path.join(dist, 'index.html');
  const candidates = [path.join(dist, clean), path.join(dist, `${clean}.html`)];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
};

const problems = [];
const titles = new Map();
const descs = new Map();
const links = new Set();
let pages = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(dist, file);
  const is404 = rel === '404.html';
  pages++;
  const head = html.split('</head>')[0];
  const t = [...html.matchAll(/<title>(.*?)<\/title>/g)].map((m) => m[1]);
  const c = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  const d = [...html.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => m[1]);
  if (t.length !== 1 || !head.includes('<title>')) problems.push(`${rel}: ${t.length} <title>`);
  if (c.length !== 1) problems.push(`${rel}: ${c.length} canonical`);
  if (d.length !== 1) problems.push(`${rel}: ${d.length} description`);
  if (!is404 && c[0] !== urlFor(file)) problems.push(`${rel}: canonical ${c[0]} != ${urlFor(file)}`);
  if (!is404) {
    titles.set(t[0], [...(titles.get(t[0]) || []), rel]);
    descs.set(d[0], [...(descs.get(d[0]) || []), rel]);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      JSON.parse(m[1]);
    } catch {
      problems.push(`${rel}: invalid JSON-LD`);
    }
  }
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.startsWith('/') && !href.startsWith('//')) links.add(href);
    else if (href.startsWith(site)) links.add(href.slice(site.length) || '/');
  }
}

for (const [v, files] of titles) if (files.length > 1) problems.push(`duplicate title "${v}": ${files.join(', ')}`);
for (const [v, files] of descs) if (files.length > 1) problems.push(`duplicate description "${v}": ${files.join(', ')}`);

let broken = 0;
for (const href of links) {
  if (href.split('#')[0].endsWith('/') && href !== '/' && !href.startsWith('/#')) problems.push(`trailing-slash link ${href}`);
  if (!fileForPath(href)) { problems.push(`broken internal link ${href}`); broken++; }
}

const sitemapUrls = [];
for (const f of fs.readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
  sitemapUrls.push(...[...fs.readFileSync(path.join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}
for (const u of sitemapUrls) {
  if (!u.startsWith(site)) problems.push(`sitemap URL on wrong host ${u}`);
  else if (!fileForPath(u.slice(site.length) || '/')) problems.push(`sitemap URL without page ${u}`);
  if (u !== `${site}/` && u.endsWith('/')) problems.push(`sitemap URL with trailing slash ${u}`);
}

console.log(`HTML pages: ${pages} | sitemap URLs: ${sitemapUrls.length} | unique internal links: ${links.size} | broken: ${broken}`);
if (problems.length) {
  console.log(`❌ ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 50)) console.log('  - ' + p);
  process.exit(1);
}
console.log('✅ All checks passed');
