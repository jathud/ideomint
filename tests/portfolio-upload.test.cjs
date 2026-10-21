/* eslint-disable @typescript-eslint/no-require-imports -- Compile server actions with injected storage/auth stubs, without remote writes. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
require.extensions['.ts'] = (loaded, filename) => loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const validation = require('../src/lib/portfolio/validation.ts');
const project = 'f705d69d-e404-4ed9-ad69-035852c12a24';
const asset = '6d20bb4c-6c23-4416-a7f5-ec07f831b0da';
function fixture({ authorized = true, exists = true, mime = 'image/jpeg', bytes = new Uint8Array([255, 216, 255, 0]) } = {}) {
  const calls = [];
  const client = {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: exists ? { id: project } : null }) }) }) }),
    storage: { from: () => ({ createSignedUploadUrl: async (key, options) => { calls.push({ key, options }); return { data: { signedUrl: 'https://example.supabase.co/signed-test' } }; }, download: async () => ({ data: new Blob([bytes], { type: mime }) }) }) },
  };
  const routeModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/app/admin/actions.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports: routeModule.exports, module: routeModule, Blob, Uint8Array, crypto: { randomUUID: () => asset },
    require: name => {
      if (name === 'next/cache') return { revalidatePath() {} };
      if (name === 'next/navigation') return { redirect() {} };
      if (name.endsWith('/portfolio/supabase')) return { authorizedPortfolioClient: async () => { if (!authorized) throw Error('Denied'); return client; } };
      if (name.endsWith('/portfolio/validation')) return validation;
      if (name.endsWith('/portfolio/legacy-projects')) return { legacyProjects: [] };
      return require(name);
    },
  });
  return { actions: routeModule.exports, calls };
}
test('signed upload is scoped to an existing project, immutable key and permitted image metadata', async () => {
  const { actions, calls } = fixture();
  const result = await actions.preparePortfolioUpload(project, 'image/jpeg', 8 * 1024 * 1024);
  assert.equal(result.key, `${project}/${asset}.jpg`);
  assert.ok(result.signedUrl);
  assert.equal(calls[0].options.upsert, false);
  for (const args of [[project, 'image/svg+xml', 100], [project, 'image/jpeg', 11 * 1024 * 1024], ['bad', 'image/jpeg', 100]]) assert.ok((await actions.preparePortfolioUpload(...args)).error);
  assert.equal(calls.length, 1);
});
test('unauthorized users and unsaved projects cannot obtain upload URLs', async () => {
  for (const options of [{ authorized: false }, { exists: false }]) assert.ok((await fixture(options).actions.preparePortfolioUpload(project, 'image/jpeg', 100)).error);
});
test('completion verifies storage bytes and project path before returning a gallery source', async () => {
  const { actions } = fixture();
  assert.equal((await actions.completePortfolioUpload(project, `${project}/${asset}.jpg`)).src, `/api/portfolio/media/${project}/${asset}.jpg`);
  assert.ok((await actions.completePortfolioUpload(project, `${asset}/${asset}.jpg`)).error);
  assert.ok((await fixture({ bytes: new TextEncoder().encode('<svg/>') }).actions.completePortfolioUpload(project, `${project}/${asset}.jpg`)).error);
  assert.ok((await fixture({ bytes: new Uint8Array(10 * 1024 * 1024 + 1) }).actions.completePortfolioUpload(project, `${project}/${asset}.jpg`)).error);
});
