/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node deployment utility. */
function inspectDeployment(env, target = 'production') {
  const checks = [];
  const add = (name, ok, note) => checks.push({ name, ok: Boolean(ok), note });
  const present = name => Boolean(env[name]?.trim()) && !/^(?:your[-_]|replace[-_]|https:\/\/YOUR)/i.test(env[name]);
  const required = name => add(name, present(name), 'Configure this in the hosting project.');
  const https = name => {
    let ok = false;
    try { const url = new URL(env[name]); ok = url.protocol === 'https:' && !/localhost|127\.0\.0\.1/.test(url.hostname); } catch { /* missing or invalid */ }
    add(name, ok, 'Use the actual HTTPS URL for this environment.');
  };
  https('NEXT_PUBLIC_SUPABASE_URL');
  required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  required('SUPABASE_SERVICE_ROLE_KEY');
  https('NEXT_PUBLIC_APP_URL');
  add('NEXTAUTH_SECRET', present('NEXTAUTH_SECRET') && env.NEXTAUTH_SECRET.length >= 32, 'Preserve the existing strong signing secret; do not rotate casually.');
  add('IDEOFEST_ADMIN_EMAIL', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.IDEOFEST_ADMIN_EMAIL || ''), 'Set the existing administrator email explicitly.');
  add('IDEOFEST_ADMIN_PASSWORD', present('IDEOFEST_ADMIN_PASSWORD') && env.IDEOFEST_ADMIN_PASSWORD.length >= 12 && env.IDEOFEST_ADMIN_PASSWORD !== 'ideofest2026', 'An explicit non-default password is required; coordinate changes with the owner.');
  ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].forEach(required);
  add('IdeoFest SMTP user', present('EMAIL_USER') || present('SMTP_USER'), 'Keep the existing ticket-email account.');
  add('IdeoFest SMTP password', present('EMAIL_PASS') || present('SMTP_PASS'), 'Keep the existing ticket-email credential.');
  ['CONTACT_SMTP_HOST', 'CONTACT_SMTP_USER', 'CONTACT_SMTP_PASSWORD'].forEach(required);
  add('CONTACT_SMTP_PORT', ['465', '587'].includes(env.CONTACT_SMTP_PORT), 'Set 465 (TLS) or 587 (STARTTLS).');
  ['PAYHERE_MERCHANT_ID', 'PAYHERE_MERCHANT_SECRET'].forEach(required);
  add('PAYHERE_SANDBOX', target === 'preview' ? env.PAYHERE_SANDBOX === 'true' : env.PAYHERE_SANDBOX === 'false', target === 'preview' ? 'Preview payment tests must use sandbox credentials and true.' : 'Confirm the existing live merchant credentials and false for a live-payment release.');
  add('PORTFOLIO_CMS_ENABLED', ['true', 'false'].includes(env.PORTFOLIO_CMS_ENABLED), 'Set false to retain the approved local gallery until CMS setup is verified.');
  const partialPortfolio = present('PORTFOLIO_SUPABASE_URL') || present('PORTFOLIO_SUPABASE_ANON_KEY');
  if (env.PORTFOLIO_CMS_ENABLED === 'true' || partialPortfolio) {
    https('PORTFOLIO_SUPABASE_URL');
    required('PORTFOLIO_SUPABASE_ANON_KEY');
    // These flags are operator attestations, not database tests.
    add('PORTFOLIO_SCHEMA_VERIFIED', env.PORTFOLIO_SCHEMA_VERIFIED === 'true', 'Owner must verify the additive schema and private bucket; this checker never applies migrations.');
    add('PORTFOLIO_ADMIN_VERIFIED', env.PORTFOLIO_ADMIN_VERIFIED === 'true', 'Confirm real sign-in/upload/preview/publish tests in the intended environment.');
  }
  const warnings = [];
  if (!present('QR_ENCRYPTION_KEY') || !present('QR_HMAC_SECRET')) warnings.push('QR secrets are not explicit. Ask the owner which values existing tickets use before setting or rotating them.');
  if (!present('MONGODB_URI')) warnings.push('Legacy MongoDB event-detail routes exist. Confirm whether live traffic uses them and preserve MONGODB_URI if applicable.');
  if (env.PORTFOLIO_CMS_ENABLED !== 'true') warnings.push('Homepage keeps the existing local gallery; portfolio publishing is not activated.');
  warnings.push('This checks configuration shape only. It does not test credentials, remote settings, tables, policies, payments or email delivery.');
  return { checks, warnings, ok: checks.every(check => check.ok) };
}

if (require.main === module) {
  require('@next/env').loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const target = process.argv.includes('--preview') ? 'preview' : 'production';
  const report = inspectDeployment(process.env, target);
  console.log(`Deployment configuration check (${target}); values are never printed.`);
  for (const check of report.checks) console.log(`${check.ok ? 'OK' : 'MISSING/REVIEW'} ${check.name}${check.ok ? '' : ': ' + check.note}`);
  for (const warning of report.warnings) console.log('NOTE ' + warning);
  console.log(report.ok ? 'Configuration checks passed. Remote smoke tests remain required.' : 'Configuration is incomplete; this is not ready for a live rollout.');
  process.exitCode = report.ok ? 0 : 1;
}
module.exports = { inspectDeployment };
