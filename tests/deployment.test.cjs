/* eslint-disable @typescript-eslint/no-require-imports -- Standalone deployment checker tests. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inspectDeployment } = require('../scripts/check-deployment.cjs');
function configured() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-server-only',
    NEXT_PUBLIC_APP_URL: 'https://ideomint.com', NEXTAUTH_SECRET: 'a'.repeat(40), IDEOFEST_ADMIN_EMAIL: 'admin@example.test', IDEOFEST_ADMIN_PASSWORD: 'test-strong-password',
    CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test', CLOUDINARY_API_SECRET: 'test', SMTP_USER: 'tickets@example.test', SMTP_PASS: 'test',
    CONTACT_SMTP_HOST: 'smtp.zoho.com', CONTACT_SMTP_PORT: '465', CONTACT_SMTP_USER: 'hello@ideomint.com', CONTACT_SMTP_PASSWORD: 'test',
    PAYHERE_MERCHANT_ID: 'test', PAYHERE_MERCHANT_SECRET: 'test', PAYHERE_SANDBOX: 'false', PORTFOLIO_CMS_ENABLED: 'false',
  };
}
test('incomplete environments fail without exposing values', () => {
  const report = inspectDeployment({ CONTACT_SMTP_PASSWORD: 'unique-secret-value' });
  assert.equal(report.ok, false);
  assert.equal(JSON.stringify(report).includes('unique-secret-value'), false);
});
test('existing-gallery rollout can pass shape checks without enabling unconfigured CMS', () => {
  assert.equal(inspectDeployment(configured()).ok, true);
});
test('CMS requires explicit schema and administrator verification', () => {
  const env = { ...configured(), PORTFOLIO_CMS_ENABLED: 'true', PORTFOLIO_SUPABASE_URL: 'https://example.supabase.co', PORTFOLIO_SUPABASE_ANON_KEY: 'test' };
  assert.equal(inspectDeployment(env).ok, false);
  env.PORTFOLIO_SCHEMA_VERIFIED = 'true'; env.PORTFOLIO_ADMIN_VERIFIED = 'true';
  assert.equal(inspectDeployment(env).ok, true);
});
test('preview must use sandbox and production rejects localhost URLs or default admin password', () => {
  const env = configured();
  assert.equal(inspectDeployment(env, 'preview').ok, false);
  env.PAYHERE_SANDBOX = 'true';
  assert.equal(inspectDeployment(env, 'preview').ok, true);
  env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  assert.equal(inspectDeployment(env, 'preview').ok, false);
  env.NEXT_PUBLIC_APP_URL = 'https://ideomint.com'; env.IDEOFEST_ADMIN_PASSWORD = 'ideofest2026';
  assert.equal(inspectDeployment(env, 'preview').ok, false);
});
