# Portfolio administration

Local entry: `/admin/login`. This is separate from `/ideofest/admin`.

## Current activation status

Code and an additive migration are supplied. No migration, administrator account,
bucket, or database record is created automatically. No credentials are included.
Without configuration the login page explains setup, protected pages redirect to
login, and the homepage continues showing the original local portfolio.

The old IdeoFest migration contains permissive RLS policies and a destructive
reset. **Do not replay it.** The safest development setup is a separate Supabase
project. Reuse of an existing project requires its owner to inspect live grants,
policies, backups, and Auth configuration first. Portfolio accounts must not gain
access to existing event/customer/payment records through inherited permissions.

## What to ask the database owner

“Please provide a development Supabase project URL and its anon/publishable key,
review the new portfolio-only migration, create my email/password Auth user, and
grant that user's UUID membership in portfolio_admins. Do not send service-role
keys or production passwords in chat.”

No service-role key is required by this implementation. A project URL alone does
not prove the mailbox, database, or admin permissions are ready.

## Setup (owner-managed, development first)

1. Set these real values in the untracked `.env.local` file:

   ```dotenv
   PORTFOLIO_SUPABASE_URL=https://YOUR-DEVELOPMENT-PROJECT.supabase.co
   PORTFOLIO_SUPABASE_ANON_KEY=YOUR-DEVELOPMENT-ANON-OR-PUBLISHABLE-KEY
   PORTFOLIO_CMS_ENABLED=false
   ```

2. Review and apply **only** `supabase/migrations/004_portfolio_cms.sql` once to the
   intended development project. It creates portfolio tables, RPCs and a private
   storage bucket. It does not touch IdeoFest tables or change Auth settings.
3. Create/invite the administrator in Supabase Auth and set their password using
   Supabase's secure user flow. Using a privileged SQL editor, grant membership:

   ```sql
   insert into public.portfolio_admins (user_id)
   select id from auth.users where lower(email) = lower('YOUR-ADMIN-EMAIL');
   ```

   An ordinary signed-in user cannot create or change their own membership.
4. Configure appropriate Supabase Auth password policy, rate limits and account
   recovery for the intended environment. Restart `npm run dev` and sign in at
   `/admin/login`. Never use the old IdeoFest default credentials here.
5. Use **Import existing work as drafts** once. It skips existing slugs and keeps
   all 13 assets at their current `/public/portfolio/` paths; nothing is copied,
   moved, overwritten, or published automatically.
6. Inspect each draft, save and preview it, then explicitly publish it. New
   projects can be created directly in the editor. Pick multiple services where
   justified, add alt text and photo groups, order the images, and choose a cover
   by moving an image to position one. Display order controls project order.
7. Only after checking both existing projects, switch
   `PORTFOLIO_CMS_ENABLED=true` and restart locally. Published **featured** projects
   now populate the existing ExperienceReel. Saving edits does not change the
   public snapshot. Archive removes a publication without deleting originals.
8. Deployment and production migration remain separate approval steps.

## Publishing, isolation and media

- New projects start as private drafts. Draft tables and revision history have
  admin-only RLS. Public content lives in a separate snapshot table, so selecting
  a public row never exposes draft fields.
- Each write checks a server-verified Supabase user and active admin membership.
  Server Actions retain Next.js same-origin checks. The new session uses its own
  HTTP-only cookie. Proxy refreshes only portfolio `/admin` sessions; authorization
  is also checked in every protected page/action/media request.
- Optimistic versions reject conflicting saves. Publish/archive lock the project,
  compare its version, and change the public snapshot atomically with a revision
  record. Unpublished edits never mutate the previous public snapshot.
- Media is JPEG, PNG or WebP, limited to 10 MB, checked by file signatures, stored
  under generated project/asset UUIDs, and never overwritten. Originals remain in
  a private bucket. Public reads require a reference in a published snapshot;
  draft preview requires admin authorization. Media responses are not cached,
  and private media bypasses Next Image's shared optimizer cache.
- Removing an image removes a draft reference, not the source file. Archive is
  reversible by publishing again; permanent deletion is deliberately unavailable.
- With CMS mode enabled, a database failure returns an empty portfolio rather
  than reviving static records that may have been archived. Turn CMS mode off
  only deliberately: that restores the preserved legacy content.
- Existing event ticketing, payment emails, booking records and QR passes are
  outside this CMS.

## Verification before activation

Run `node tests/portfolio.test.cjs`, TypeScript, relevant ESLint and a build.
Existing IdeoFest build dependencies still require their own environment settings.

With real development credentials, verify all of these before production:

- Anonymous and ordinary authenticated users cannot read draft projects,
  memberships of other users, revision history, or draft images; cannot write
  project/publication rows or upload media; cannot invoke publish/archive.
- An allowed admin can save a project before uploading, upload multiple images,
  edit alternatives/groups, move/remove images, preview, publish, edit privately,
  and archive. Signed-out or revoked administrators cannot perform these actions.
- Two browser tabs editing the same version cannot silently overwrite each other.
- Public requests return only published references. After archive, the image URL
  no longer serves publicly; private draft images never render anonymously.
- Both imported galleries contain their original six/seven images in order.
  IdeoFest belongs to Marketing and Content & Creative. No unverified website or
  campaign project is added.
- With CMS mode enabled, new published featured projects appear in the correct
  filters. More projects scroll horizontally in the selector without squeezing
  labels. Check 320px, tablet, desktop, keyboard and reduced-motion behavior.

Database-backed authentication/RLS/storage tests cannot be claimed complete until
the development connection and admin membership are supplied.

## File inventory for this implementation

Existing files integrated with the CMS:

- `src/app/page.tsx` — supplies published projects when explicitly enabled.
- `src/components/sections/ExperienceReel.tsx` — accepts project data, handles an
  empty publication list, retains gallery interactions, and scrolls long project lists.
- `src/proxy.ts` — refreshes the separate portfolio session only on `/admin` paths.
- `next.config.ts` — bounded 12 MB action requests for individual 10 MB uploads.

New files:

- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/actions.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/(protected)/layout.tsx`
- `src/app/admin/(protected)/work/page.tsx`
- `src/app/admin/(protected)/work/new/page.tsx`
- `src/app/admin/(protected)/work/[id]/page.tsx`
- `src/app/admin/(protected)/work/[id]/preview/page.tsx`
- `src/app/api/portfolio/media/[project]/[asset]/route.ts`
- `src/components/admin/PortfolioLogin.tsx`
- `src/components/admin/PortfolioEditor.tsx`
- `src/components/admin/LegacyImport.tsx`
- `src/lib/portfolio/legacy-projects.ts`
- `src/lib/portfolio/validation.ts`
- `src/lib/portfolio/supabase.ts`
- `src/lib/portfolio/session.ts`
- `src/lib/portfolio/repository.ts`
- `supabase/migrations/004_portfolio_cms.sql`
- `tests/portfolio.test.cjs`
- `docs/portfolio-admin.md`

The existing `src/lib/portfolio/categories.ts` and `ServiceFilters.tsx` remain the
shared category vocabulary and public filter UI. Earlier uncommitted homepage,
contact, footer, header and services edits are preserved.

## Hosting and direct uploads

See [deployment.md](deployment.md) for the release and environment checklist. The existing IdeoFest Supabase settings do not activate the new portfolio CMS automatically.

Portfolio image files (up to 10 MB each) now upload directly from the browser to a scoped Supabase signed-upload URL. Only small metadata requests pass through Server Actions. After upload, the server downloads and validates the stored image before returning a gallery source. Browser CSP must permit the configured Supabase origin (the existing policy permits standard *.supabase.co projects). Private draft/publication authorization still applies to streamed media delivery.

New uploads use random keys with overwrite disabled. Aborted or invalid uploads may leave unreferenced objects in the private bucket; no existing images are deleted automatically. Verify real upload/preview/publish/archive in development, including an image above 4.5 MB, before activating the CMS on Vercel.
