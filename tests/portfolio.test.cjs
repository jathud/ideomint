/* eslint-disable @typescript-eslint/no-require-imports -- This Node CommonJS test harness registers a TypeScript loader without adding runtime dependencies. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Use the installed TypeScript compiler; no test/runtime dependency is added.
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  module._compile(output.outputText, filename);
};
const { legacyProjects } = require('../src/lib/portfolio/legacy-projects.ts');
const { contentSchema, draftSchema, photoSchema, toGalleryProject, validateImage } = require('../src/lib/portfolio/validation.ts');
const id = 'f705d69d-e404-4ed9-ad69-035852c12a24';
const other = '6d20bb4c-6c23-4416-a7f5-ec07f831b0da';
const content = () => contentSchema.parse(legacyProjects[0]);
const draft = () => ({ id, version: 0, slug: 'ideofest', content: content(), sort_order: 0, featured: true });

test('both existing projects and all 13 local images remain valid and accessible', () => {
  assert.equal(legacyProjects.length, 2);
  const photos = legacyProjects.flatMap(project => contentSchema.parse(project).photos);
  assert.equal(photos.length, 13);
  for (const photo of photos) assert.ok(fs.existsSync('public' + photo.src));
  assert.ok(legacyProjects[0].services.includes('Marketing'));
});
test('a draft may be saved before uploading, but cannot be published incomplete', () => {
  const item = draft(); item.content.photos = []; item.content.description = '';
  assert.ok(draftSchema.safeParse(item).success);
  assert.equal(contentSchema.safeParse(item.content).success, false);
});
test('published content needs image alternatives, groups, real categories and bounded copy', () => {
  const item = content(); item.photos[0].alt = ''; assert.equal(contentSchema.safeParse(item).success, false);
  const noTheme = content(); noTheme.photos[0].theme = ''; assert.equal(contentSchema.safeParse(noTheme).success, false);
  const invalid = content(); invalid.services = ['Events']; assert.equal(contentSchema.safeParse(invalid).success, false);
  const duplicate = content(); duplicate.services = ['Marketing', 'Marketing']; assert.equal(contentSchema.safeParse(duplicate).success, false);
  const overflow = content(); overflow.title = 'x'.repeat(81); assert.equal(contentSchema.safeParse(overflow).success, false);
});
test('draft writes reject unsafe slugs, stale-format versions and negative ordering', () => {
  for (const patch of [{ slug: '../admin' }, { version: -1 }, { sort_order: -1 }, { id: 'fake' }]) assert.equal(draftSchema.safeParse({ ...draft(), ...patch }).success, false);
});
test('media sources reject remote URLs, traversal, SVG and cross-project uploads', () => {
  for (const src of ['javascript:alert(1)', 'https://example.com/x.jpg', '/portfolio/../../private.jpg', '/portfolio/x.svg', '//evil.example/x.jpg']) assert.equal(photoSchema.safeParse({ src, alt: 'Valid description', theme: 'Work' }).success, false);
  const item = draft(); item.content.photos[0].src = `/api/portfolio/media/${other}/${id}.jpg`;
  assert.equal(draftSchema.safeParse(item).success, false);
  item.content.photos[0].src = `/api/portfolio/media/${id}/${other}.jpg`;
  assert.ok(draftSchema.safeParse(item).success);
});
test('gallery adaptation preserves exact image order, attribution and derived theme groups', () => {
  const item = content(); const gallery = toGalleryProject(id, item, 5);
  assert.equal(gallery.index, '06'); assert.deepEqual(gallery.photos, item.photos);
  assert.equal(gallery.label, item.label);
  assert.deepEqual(gallery.themes, ['The Energy', 'The Experience', 'The Details']);
});
test('upload checks reject spoofed MIME types and files larger than 10 MB', () => {
  assert.equal(validateImage(new TextEncoder().encode('<svg onload=alert(1)>'), 'image/jpeg'), null);
  assert.equal(validateImage(new Uint8Array(10 * 1024 * 1024 + 1), 'image/png'), null);
  for (const [file, mime, extension] of [['public/portfolio/choice-to-lead/JK_D9587.JPG', 'image/jpeg', 'jpg'], ['public/portfolio/ideofest/IMG_0889.WEBP', 'image/webp', 'webp']]) assert.equal(validateImage(fs.readFileSync(file), mime), extension);
});
