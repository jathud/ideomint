/* eslint-disable @typescript-eslint/no-require-imports -- Read-only integration checks against a running production server. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
const origin = 'https://ideomint.com';
const pages = new Map();
async function get(path, options) {
  if (options) { const response = await fetch(base + path, options); return { response, text: await response.text() }; }
  if (!pages.has(path)) pages.set(path, fetch(base + path).then(async response => ({ response, text: await response.text() })));
  return pages.get(path);
}
const meta = (html, name) => (html.match(new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`, 'i')) || [])[1];
const canonical = html => (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1];

test('public agency pages have self canonicals and matching social URLs/titles', async () => {
  for (const path of ['/', '/services', '/privacy', '/terms', '/careers']) {
    const { response, text } = await get(path);
    assert.equal(response.status, 200);
    assert.equal(new URL(canonical(text)).href, new URL(path, origin).href);
    assert.equal(new URL(meta(text, 'og:url')).href, new URL(path, origin).href);
    assert.equal(meta(text, 'twitter:title'), meta(text, 'og:title'));
    assert.equal((text.match(/<h1\b/g) || []).length, 1);
    assert.ok(meta(text, 'description'));
  }
});
test('initial agency HTML is not parked inside hidden streamed containers', async () => {
  for (const path of ['/', '/services', '/privacy']) {
    const { text } = await get(path);
    assert.equal(/<div hidden id="S:/.test(text), false);
    assert.equal(/<div style="opacity:0;transform:translateY\(20px\)">/.test(text), false);
  }
  const { text } = await get('/');
  assert.ok(/<noscript>[\s\S]*?Choice to Lead[\s\S]*?<\/noscript>/.test(text));
});
test('entity graph connects organization, website, services and public portfolio', async () => {
  const { text } = await get('/');
  const nodes = [...text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
  const organization = nodes.find(node => node['@type'] === 'Organization');
  assert.equal(organization['@id'], origin + '/#organization');
  assert.equal(organization.address.addressLocality, 'Jaffna');
  assert.equal(organization.email, 'hello@ideomint.com');
  assert.equal(organization.sameAs.length, 3);
  const services = nodes.filter(node => node['@type'] === 'Service');
  assert.equal(services.length, 3);
  for (const service of services) assert.equal(service.provider['@id'], organization['@id']);
  assert.ok(nodes.find(node => node['@type'] === 'ItemList'));
  assert.equal(nodes.some(node => node.aggregateRating || node.review), false);
});
test('robots permits public pages and published-media route while excluding private paths', async () => {
  const { response, text } = await get('/robots.txt');
  assert.equal(response.status, 200);
  assert.ok(text.includes('Allow: /api/portfolio/media/'));
  for (const path of ['/admin', '/ideofest/admin', '/ideofest/dashboard', '/api/']) assert.ok(text.includes('Disallow: ' + path + '\n'));
  assert.ok(text.includes('User-Agent: OAI-SearchBot'));
});
test('utility metadata prevents indexing; sitemap excludes ticket lookup and invented modification dates', async () => {
  for (const path of ['/admin/login', '/ideofest/my-tickets', '/my-tickets']) {
    const { text } = await get(path);
    assert.ok(meta(text, 'robots')?.includes('noindex'), path);
    assert.equal(canonical(text), undefined);
  }
  for (const path of ['/sitemap.xml', '/ideofest/sitemap.xml']) {
    const { response, text } = await get(path);
    assert.equal(response.status, 200);
    assert.ok(text.includes('<urlset'));
    assert.equal(text.includes('/my-tickets'), false);
    const homepage = text.match(/<url>\s*<loc>https:\/\/ideomint\.com<\/loc>([\s\S]*?)<\/url>/);
    if (homepage) assert.equal(homepage[1].includes('<lastmod>'), false);
  }
});
test('browser and crawler user agents receive the same core homepage facts', async () => {
  for (const agent of ['Mozilla/5.0', 'Googlebot/2.1', 'GPTBot/1.2', 'OAI-SearchBot/1.0', 'ChatGPT-User/1.0', 'PerplexityBot/1.0', 'ClaudeBot/1.0']) {
    const { response, text } = await get('/', { headers: { 'User-Agent': agent } });
    assert.equal(response.status, 200);
    assert.ok(text.includes('The studio behind the ideas'));
    assert.ok(text.includes('hello@ideomint.com'));
    assert.equal(/Vercel Security Checkpoint/.test(text), false);
  }
});
test('security headers remain and nonexistent routes return a genuine noindex 404', async () => {
  const { response } = await get('/');
  assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const missing = await get('/seo-test-nonexistent-page');
  assert.equal(missing.response.status, 404);
  assert.ok(meta(missing.text, 'robots')?.includes('noindex'));
});

test('event admin login retains subdomain routing and is noindex', async () => {
  const url = new URL(base);
  let html;
  if (['localhost', '127.0.0.1'].includes(url.hostname)) {
    html = await new Promise((resolve, reject) => {
      require('node:http').get({ hostname: url.hostname, port: url.port, path: '/login', headers: { host: `ideofest.localhost:${url.port}`, 'x-forwarded-host': `ideofest.localhost:${url.port}` } }, response => {
        let body = ''; response.on('data', chunk => { body += chunk; }); response.on('end', () => resolve(body));
      }).on('error', reject);
    });
  } else html = (await get('/ideofest/admin/login')).text;
  assert.ok(meta(html, 'robots')?.includes('noindex'));
});
