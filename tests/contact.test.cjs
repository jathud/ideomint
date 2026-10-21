/* eslint-disable @typescript-eslint/no-require-imports -- Tests compile the route with the installed TypeScript compiler and inject an SMTP stub. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function fixture(configured = true, delivery = 'accepted') {
  const captured = [];
  const env = configured ? { CONTACT_SMTP_HOST: 'smtp.example.test', CONTACT_SMTP_USER: 'hello@ideomint.com', CONTACT_SMTP_PASSWORD: 'test-only' } : {};
  const routeModule = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/app/api/contact/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, {
    module: routeModule, exports: routeModule.exports, process: { env }, Request, Response, URL,
    require: name => name === 'nodemailer' ? { createTransport: () => ({ sendMail: async message => { captured.push(message); if (delivery === 'error') throw Error('SMTP secret diagnostic'); return { accepted: delivery === 'accepted' ? ['hello@ideomint.com'] : [] }; }, close() {} }) } : require(name),
  });
  return { post: routeModule.exports.POST, captured };
}
function request(body, origin = 'http://localhost:3000') {
  return new Request('http://localhost:3000/api/contact', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
const valid = { name: 'Test Visitor', email: 'visitor@example.test', service: 'Websites', message: 'A business website.' };

test('enquiry sends only to the studio, keeps visitor as reply-to, and uses plain text', async () => {
  const { post, captured } = fixture();
  const response = await post(request({ ...valid, to: 'attacker@example.test', message: '<img src=x>' }));
  assert.equal(response.status, 200);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].to, 'hello@ideomint.com');
  assert.equal(captured[0].replyTo.address, valid.email);
  assert.equal(captured[0].html, undefined);
  assert.ok(captured[0].text.includes('<img src=x>'));
});
test('unconfigured transport returns an honest error, never a success', async () => {
  const { post, captured } = fixture(false);
  assert.equal((await post(request(valid))).status, 503);
  assert.equal(captured.length, 0);
});
test('SMTP rejection and failure do not claim delivery or expose diagnostics', async () => {
  for (const outcome of ['rejected', 'error']) {
    const { post } = fixture(true, outcome);
    const response = await post(request(valid));
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes('secret'), false);
  }
});
test('invalid email, empty name, oversized data and honeypot do not send', async () => {
  const { post, captured } = fixture();
  for (const patch of [{ email: 'bad' }, { name: '' }, { company_url: 'bot.test' }, { message: 'x'.repeat(6001) }]) {
    assert.equal((await post(request({ ...valid, ...patch }))).status, 400);
  }
  assert.equal((await post(request({ ...valid, message: 'x'.repeat(21000) }))).status, 413);
  assert.equal(captured.length, 0);
});
test('foreign origins and malformed JSON cannot send email', async () => {
  const { post, captured } = fixture();
  assert.equal((await post(request(valid, 'https://other.example'))).status, 403);
  assert.equal((await post(new Request('http://localhost:3000/api/contact', { method: 'POST', body: '{' }))).status, 400);
  assert.equal(captured.length, 0);
});
test('repeated valid enquiries are rate limited before more mail is sent', async () => {
  const { post, captured } = fixture();
  for (let i = 0; i < 5; i++) assert.equal((await post(request(valid))).status, 200);
  assert.equal((await post(request(valid))).status, 429);
  assert.equal(captured.length, 5);
});
