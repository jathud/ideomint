# SEO, AEO and GEO implementation — 21 October 2026

Local changes only. No commit, push, deployment, database write, live booking, payment or customer email was made in this task. Rankings, search inclusion and AI citations are not guaranteed by technical configuration.

## What changed

### Content accessible before JavaScript

The root loading file introduced a page-wide Suspense boundary that put the entire marketing page in `<div hidden id="S:0">`. Loading UI now belongs to the IdeoFest and event-alias route segments; the agency homepage and service/privacy pages render visibly without that boundary. The existing event loader appearance is preserved.

Public sections are imported directly. Scroll entrances enhance already-visible HTML using a short, one-time Web Animation; they no longer start with opacity zero in server HTML. The approved hero composition, project photography, colours and typography remain. Project switching still animates. Non-JavaScript visitors get real project overview/role text for every current published/local project, and the Standard text is crisp. Lab starts with a visible preview. User-agent-specific splash exceptions were removed; there is no new bot-only content.

`inlineCss` is disabled, using Next's normal stylesheet delivery instead of repeating the full CSS payload inside HTML and Flight data. Measured uncompressed homepage HTML decreased from 532,287 bytes on the audited live release to 105,633 bytes in the updated local production build. Inline style content decreased from 141,664 bytes to 94 bytes. This compares two versions and includes the other rendering changes; it is not a Lighthouse result or a claimed speed percentage. External CSS/JS still transfers and must be measured separately.

### Canonical and social identity

`src/lib/seo.ts` centralizes canonical, Open Graph and Twitter metadata. Agency pages and public IdeoFest listing pages get self-referencing URLs. The root homepage canonical no longer leaks to unrelated routes. Event-detail branding is composed once; its canonical event route remains unchanged. Portfolio admin title duplication was removed.

Admin, dashboard, ticket lookup, booking and event-creation utility layouts have noindex metadata and no inherited canonical. Those additions only affect indexing metadata, not authentication, booking state, payment or database logic.

### Robots and sitemaps

The stale public/robots.txt and public/sitemap.xml duplicates were removed. The App Router metadata files now provide the single source of truth.

Robots excludes both exact private roots and their descendants, allows public pages, and includes a narrow allow for `/api/portfolio/media/` so published gallery imagery can be fetched. The endpoint still requires publication or administrator authorization; the robots exception does not expose drafts. Other API routes remain disallowed. OAI-SearchBot is explicitly listed alongside the existing crawler names. All receive the same public content; user-agent strings do not grant access.

Both sitemaps revalidate hourly. Static pages no longer claim a new modification date just because a build occurred. Event entries use their stored updated_at/created_at when available. Ticket lookup is omitted. Local Supabase settings are absent, so local event entries cannot be populated or tested; the live published event list must be checked after an approved deployment. No database changes are required for these sitemap fixes.

### Structured facts for search and answer engines

The entity graph links Organization, WebSite, WebPage and the three real Services using stable IDs. Organization facts match visible contact/About information: IdeoMint, Jaffna/Sri Lanka, hello@ideomint.com, +94 78 689 2649 and the existing three social profiles. The homepage ItemList describes only the projects actually returned by the existing portfolio source. Services gets breadcrumb and service markup.

No invented reviews, aggregate ratings, precise street address, coordinates, opening hours, customer outcomes, worldwide-service claims or FAQ answers were added. No special AI schema or llms.txt dependency was introduced. Google states that established SEO fundamentals remain relevant to AI features; unsupported AI-visibility promises are not made here.

## Validation

- Full production build, TypeScript and scoped ESLint passed.
- 20 existing contact/portfolio/upload/deployment tests passed.
- Eight new production HTTP integration tests passed: canonical/social consistency, visible initial HTML, entity graph, robots, utility indexing/sitemaps, seven user-agent variants, security/404s and admin-subdomain login indexing.
- Chromium with JavaScript disabled: homepage, Services and Privacy main content visible; zero hidden section ancestors. Both portfolio project overviews are available in the no-script fallback.
- JavaScript enabled: 320, 390, 768 and 1440 CSS pixel layouts had no horizontal overflow; hero photo counts remained one on mobile/two desktop; Choice to Lead switching worked.
- Existing CSP, nosniff, frame restrictions, proxy authentication and API rate limiting were preserved. No DNS change or global cache disabling was made.

To repeat the HTTP checks against a running production server, set `SEO_BASE_URL` to that server URL and run:

```bash
node tests/seo.integration.cjs
```

The default is http://localhost:3000. The tests issue read-only GETs and do not submit forms. In PowerShell, for example: `$env:SEO_BASE_URL = 'http://localhost:3006'` before running the test.

## After an explicitly approved deployment

1. Verify the same HTML, no-JavaScript visibility, canonicals, social metadata, robots and both sitemaps on the public domain.
2. Confirm the real published event remains in the refreshed sitemap; check event-detail title/canonical using the connected environment.
3. Use Search Console URL Inspection/live test for homepage and Services; submit the sitemap and request recrawl where appropriate. A cached answer/search index may take time to refresh.
4. Investigate a failing fetcher's timestamp/IP in Vercel firewall logs before changing any security rule. An external tool error alone is not proof of a site block.
5. Keep off-site business profiles accurate and obtain genuine project evidence as it becomes available. These owner-controlled actions were not performed automatically.

## Files changed

- next.config.ts
- public/robots.txt (removed duplicate)
- public/sitemap.xml (removed duplicate)
- src/app/loading.tsx (moved to event-specific loading boundaries)
- src/app/ideofest/loading.tsx
- src/app/events/loading.tsx
- src/app/layout.tsx
- src/app/page.tsx
- src/app/services/page.tsx
- src/app/privacy/page.tsx
- src/app/terms/page.tsx
- src/app/careers/page.tsx
- src/app/robots.ts
- src/app/sitemap.ts
- src/app/ideofest/sitemap.ts
- src/app/ideofest/page.tsx
- src/app/ideofest/events/layout.tsx
- src/app/ideofest/events/[slug]/page.tsx (title metadata only)
- src/app/ideofest/admin/layout.tsx
- src/app/ideofest/dashboard/layout.tsx
- src/app/admin/layout.tsx
- src/app/ideofest/my-tickets/layout.tsx
- src/app/my-tickets/layout.tsx
- src/app/ideofest/events/[slug]/book/layout.tsx
- src/app/events/[slug]/book/layout.tsx
- src/app/ideofest/events/create/layout.tsx
- src/app/events/create/layout.tsx
- src/components/ui/AnimatedSection.tsx
- src/components/ui/SplashScreen.tsx
- src/components/sections/ExperienceReel.tsx
- src/components/sections/Manifesto.tsx
- src/components/sections/Sandbox.tsx
- src/lib/seo.ts
- tests/seo.integration.cjs
- docs/seo-aeo-geo.md

## References

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/ai-features
- https://schema.org/Organization
- https://schema.org/Service
