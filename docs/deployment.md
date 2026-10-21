# Deployment preparation — IdeoMint

## Current status

The repository is prepared for the existing Vercel setup (`vercel.json`). The production build passes locally after moving live admin dashboard/event queries to request time. This does **not** prove the hosting environment or remote services are configured. No deployment, push, migration, customer email or live payment was performed during this preparation.

The local `.env.local` currently contains the website Zoho SMTP settings; it does not contain the existing live IdeoFest database/payment settings. Those may already be configured in the friend's existing hosting project. They do not automatically download to this computer, and this computer's new settings do not automatically upload to the host.

Validation completed: TypeScript, scoped new-code ESLint, 20 tests, and the full production build passed. Existing admin files were linted with their pre-existing `no-explicit-any` usage excluded. A local production server on port 3002 returned the homepage, Services and all three new footer pages successfully; an invalid enquiry returned 400 without sending email. The portfolio protected route emitted its login redirect, and the anonymous event-admin request redirected to its existing localhost subdomain without dashboard data. No live backend credentials were supplied for connected-service tests. Event sitemap generation reports missing local Supabase configuration, so its live event entries still need a configured rebuild.

## 1. Use the existing hosting project

Ask the friend to identify the existing Vercel project serving `ideomint.com` and the admin subdomain `ideofest.ideomint.com`. Confirm its connected repository and production branch. Do not create a replacement project, change DNS, alter payment callbacks or replace the environment as a whole.

Open **Project → Settings → Environment Variables**. Keep all working Supabase, Cloudinary, ticket SMTP, PayHere, signing, QR, bank and optional legacy MongoDB values. Never replace working values with the blanks in the template.

Both domains must retain their existing project mapping. The `ideofest.` subdomain is mapped to the event admin by the existing proxy. The new portfolio admin is `/admin/login` on the main domain and is separate.

## 2. Add the NEW website email settings

Add these four names to the intended Production environment using the tested local values, entered privately in the dashboard:

| Name | Purpose |
| --- | --- |
| CONTACT_SMTP_HOST | Tested Zoho outgoing host |
| CONTACT_SMTP_PORT | 465 for the tested configuration |
| CONTACT_SMTP_USER | hello@ideomint.com |
| CONTACT_SMTP_PASSWORD | Zoho application credential; server-only |

Do not change the existing `SMTP_*` or `EMAIL_*` values used by IdeoFest tickets. The new enquiry account is separate. Never add `NEXT_PUBLIC_` to a password, service-role key or merchant secret. Add settings before rebuilding: browser-exposed `NEXT_PUBLIC_*` settings are baked into the build.

Configuration changes apply to a **new deployment**, not an already-running deployment. No real secrets belong in Git, this guide or the reference template.

## 3. Choose portfolio activation explicitly

For a release preserving the approved two-project gallery, set **PORTFOLIO_CMS_ENABLED=false**. This keeps the homepage working without activating the unfinished remote CMS setup.

To activate editing/publishing, follow [portfolio-admin.md](portfolio-admin.md): configure `PORTFOLIO_SUPABASE_URL` and `PORTFOLIO_SUPABASE_ANON_KEY`, have the owner review the additive migration, create an Auth administrator and membership, verify the private bucket/RLS, import both projects, preview and publish them. Then verify the homepage before setting the flag to true.

The existing IdeoFest Supabase project does not automatically contain the portfolio tables. A separate development project remains the safest place to test. If the owner chooses the existing production project later, inspect grants/RLS and backups first. Do not replay old migrations or run a reset. No migrations run during npm install/build/start.

`PORTFOLIO_SCHEMA_VERIFIED=true` and `PORTFOLIO_ADMIN_VERIFIED=true` are operator confirmations for the checker, not switches that create or test anything. Set them only after actual verification. See [portfolio-admin.md](portfolio-admin.md) for the checklist.

## 4. Check settings without printing secrets

The blank reference inventory is [config/deployment.env.example](../config/deployment.env.example). It documents the names, not the live values. Optional bank/legacy values depend on the current live configuration; retain them if already present.

```bash
npm run check:deployment
```

This loads local production-mode env files and reports only names/status, never values. A nonzero result means configuration is incomplete or needs owner review. The current local run is expected to fail for the missing live IdeoFest values; it is not a test of the Vercel dashboard.

If the owner securely provides an ignored `.env.production.local` containing the intended environment (never share its contents in chat), Node 22 can check it explicitly:

```bash
node --env-file=.env.production.local scripts/check-deployment.cjs
```

For an isolated preview environment with test database, test email recipient strategy and PayHere sandbox credentials:

```bash
npm run check:deployment -- --preview
```

Preview needs its own HTTPS `NEXT_PUBLIC_APP_URL`. Do not point test booking/payment actions at production customer data. Preserve QR/signing secrets used by existing tickets; changes require a separate compatibility plan. The checker verifies shape/operator attestations, not credentials, remote schema, policies or inbox delivery.

## 5. Local validation before any authorized release

```bash
npx tsc --noEmit
node tests/contact.test.cjs
node tests/portfolio.test.cjs
node tests/portfolio-upload.test.cjs
node tests/deployment.test.cjs
npm run build
```

`npm run build` passing does not replace the env checker. Without Supabase settings, sitemap generation logs that event URLs could not be read; static sitemap entries are still produced. With real settings, verify the generated event URLs too.

The new portfolio upload sends file bytes directly to a scoped signed Supabase URL, then verifies the stored bytes server-side before adding the gallery source. This retains the 10 MB limit without sending a large request through a Vercel function. Media responses stream through the existing authorization checks, with no-store headers. Aborted/rejected uploads may leave unreferenced private objects; cleanup is owner-managed. No originals are overwritten or automatically deleted.

**Existing IdeoFest limitation:** its unchanged `/api/ideofest/upload` accepts up to 10 MB in code, but Vercel has a 4.5 MB function request limit. Test existing slip/banner flows with files safely below 4 MB. Larger event uploads need a separate direct-upload change and regression testing; raising the Next.js body limit cannot fix this provider limit. No booking/upload/payment behavior was changed as part of this preparation.

## 6. Preview smoke tests (after separate authorization to deploy)

- Homepage, mobile menu, Work filters and Lab themes; Services anchors; About/Vision; Privacy/Terms/Careers links.
- One clearly labelled enquiry: verify inbox receipt and Reply-To with a consenting test address. Check failure handling too.
- Event admin login on the intended domain; logout; anonymous access must not show private management data. Existing authentication is unchanged.
- In an isolated test environment: event listing, booking, ticket email/QR, small slip upload and sandbox PayHere callback/return. Verify no real charges or production customer records are created.
- When CMS is configured: save/upload/preview/publish/archive a development project, including a 5–10 MB image to test the direct-upload path and streamed delivery; verify drafts remain private.
- Run production-mode Lighthouse on mobile/desktop; check real image loading and no layout shifts. No production Lighthouse score is currently claimed.

## 7. Release and rollback

Only after review/explicit authorization: create the approved commit, use the **existing** project's deployment workflow and correct environment, test the preview, then authorize production promotion. Preserve domain mappings and existing database/merchant settings.

Record the previous successful Vercel deployment before release. Rollback should restore that deployment; do not reset the database or rotate QR/auth/payment secrets as a rollback step. Portfolio activation can stay false until its own setup is verified.

## Changed files in this preparation

- package.json (adds `check:deployment`)
- vercel.json (30-second contact endpoint budget)
- next.config.ts (removes the misleading large Server Action request override)
- src/app/ideofest/admin/(protected)/page.tsx (request-time query)
- src/app/ideofest/admin/(protected)/events/page.tsx (request-time query)
- src/app/admin/actions.ts (authorized signed-upload preparation and stored-file validation)
- src/components/admin/PortfolioEditor.tsx (direct upload, same 10 MB allowance)
- src/app/api/portfolio/media/[project]/[asset]/route.ts (streamed delivery, same authorization)
- scripts/check-deployment.cjs
- config/deployment.env.example
- tests/deployment.test.cjs
- tests/portfolio-upload.test.cjs
- docs/deployment.md
- docs/portfolio-admin.md (updated hosting notes)

## Official references

- https://vercel.com/docs/environment-variables
- https://nextjs.org/docs/app/guides/environment-variables
- https://nextjs.org/docs/app/api-reference/functions/connection
- https://vercel.com/docs/functions/limitations
- https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
- https://supabase.com/docs/guides/storage/uploads/standard-uploads
