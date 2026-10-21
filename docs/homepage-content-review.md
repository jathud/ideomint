# Homepage content and enquiry update

Local changes only. Hero.tsx, MintingFrame.tsx, project data, all portfolio images, pricing amounts, portfolio admin logic, IdeoFest bookings and payment integrations were preserved in this update.

## Changes

- Added About content adapted from the supplied agency story, with the navigation pointing to it.
- Kept the Standard animation, shortened its statements, and replaced unsupported speed claims in comparison/process copy.
- Retained the gallery presentation and made introductory wording independent of project count. Existing admin-fed projects remain supported; no schema changes.
- Added website service information using the existing LKR 45,000 landing-page starting price; mapped homepage service cards to relevant anchors. Branding and Personal Branding remain available.
- Labelled the Lab as an illustrative demo and replaced invented performance figures and its inactive action.
- Replaced the disconnected newsletter with a direct email invitation. Added Privacy, Terms and Careers pages and sitemap entries.
- Added contact delivery via separate Zoho SMTP settings; homepage and custom-plan forms use the same endpoint. Includes validation, fixed recipient, Reply-To, honeypot, origin check and a best-effort per-instance send limit. No form success is shown for missing SMTP or delivery errors.
- Improved labels, errors, focus visibility, anchor offsets, muted text and reduced-motion support.
- Updated homepage search/social positioning to Websites, Marketing & Creative.

## Files changed in this update

Modified:
- src/app/globals.css
- src/app/layout.tsx
- src/app/page.tsx
- src/app/sitemap.ts
- src/components/sections/Comparison.tsx
- src/components/sections/Contact.tsx
- src/components/sections/ExperienceReel.tsx
- src/components/sections/Footer.tsx
- src/components/sections/Manifesto.tsx
- src/components/sections/Process.tsx
- src/components/sections/Sandbox.tsx
- src/components/sections/Services.tsx
- src/components/services/CustomPlanForm.tsx
- src/components/services/ServicesContent.tsx
- src/components/ui/CustomCursor.tsx
- src/components/ui/Header.tsx
- src/components/ui/SmoothScroll.tsx

Added:
- .env.contact.example
- src/app/api/contact/route.ts
- src/app/privacy/page.tsx
- src/app/terms/page.tsx
- src/app/careers/page.tsx
- src/components/sections/AgencyAbout.tsx
- src/components/ui/StudioPage.tsx
- tests/contact.test.cjs
- docs/contact-email.md
- docs/homepage-content-review.md

The working tree already contained previous authorized, uncommitted changes. Git diff against HEAD includes those earlier changes too.

## Validation and limitations

- TypeScript and scoped ESLint passed.
- Six SMTP-stubbed contact tests and seven existing portfolio tests passed. No real messages were sent by the tests.
- Chromium homepage checks at 320, 390, 768 and 1440 CSS pixels: no horizontal overflow. Hero CTA heights remain 56 pixels. Existing assets loaded.
- Privacy, Terms, Careers and Services routes opened locally. The unconfigured endpoint returned 503; the UI displayed the error, preserved the entered name and did not show success.
- Production build compiled and type-checked, then failed prerendering the existing /ideofest/admin route because Supabase settings are missing. That unrelated route was not modified.
- No production Lighthouse score, real-user Core Web Vitals, live Zoho delivery or connected portfolio admin integration test was performed.
- SMTP configuration and inbox receipt test remain required; see contact-email.md. Portfolio CMS still needs its previously documented development Supabase setup.
- Privacy and working terms describe the implemented studio enquiry flow; IdeoFest terms remain separate. Owner should review these public texts before publication.

Preview: http://localhost:3000 (npm run dev if stopped). No commit, push, deployment or production database modification.
