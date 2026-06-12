# iRescueAthens — Repository Audit

Date: 2026-06-12. Audited at commit `b5c861e` (Initial commit), branch `main`, clean tree.

This document has two parts:

1. **Findings** — the state of the repo before any changes (Phase 0 inventory).
2. **Change log** — what was actually done in each phase (appended as work proceeds, so it can be reviewed before committing).

---

## Part 1 — Findings

### 1.1 Security issues

| Severity | Finding | Location |
|---|---|---|
| **Critical** | **Committed SSH keypair** (`Desktop` = private key, `Desktop.pub` = public key). Present in the initial commit, so it lives in git history even after deletion. | repo root |
| **Critical** | Committed SQLite database `prisma/dev.db` (452 KB). Likely contains real customer bookings/listings (names, emails, phone numbers). Also in git history. | `prisma/dev.db` |
| **Critical** | Admin auth uses **three inconsistent mechanisms**: NextAuth sessions (some routes), a custom JWT cookie signed with `JWT_SECRET` (`/api/admin/login`, `/api/admin/ping`), and an `ADMIN_KEY` passed as a **query-string parameter** (8+ routes). Query-string secrets end up in server logs and browser history. | `src/app/api/admin/*` |
| **Critical** | `ADMIN_KEY` checks use loose equality (`!=`), and `NEXT_PUBLIC_ADMIN_KEY` ships the admin key **to the browser bundle** (`admin/page.tsx`, `purchase/page.tsx`). Anything `NEXT_PUBLIC_` is public. | multiple |
| **High** | `PATCH /api/admin/bookings/[id]` has **no auth check at all** — anyone can change booking status. | `src/app/api/admin/bookings/[id]/route.ts` |
| **High** | Debug endpoints exposed in production: `/api/test-api` (DB schema introspection), `/api/test-days` (creates rows), `/api/admin/ping`, plus a test page `/admin/available-days-test` that can **delete all available days**. | `src/app/api/test-*`, `src/app/admin/available-days-test` |
| **High** | Real personal/business data hardcoded: phone `+30 697 455 8380` (contact page, 3×), `contact@irescueathens.com`, `delivery@irescueathens.com`, `irescueathens@gmail.com` (DEPLOYMENT.md), a real-looking Supabase project ref `ehvsszvqgdylkcickfyn` in a connection-string example (DEPLOYMENT.md:17). | `src/app/contact/page.tsx`, `src/lib/emailUtils.ts`, `DEPLOYMENT.md` |
| **High** | Committed end-user uploads (2 PNGs with UUID names) in `public/uploads/`. | `public/uploads/` |
| **Medium** | 14 API routes return raw `error.message` to clients (internal/Prisma error leakage). | `src/app/api/**` |
| **Medium** | `next.config.js` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — type and lint errors are silently shipped. | `next.config.js` |
| **Medium** | `images.remotePatterns` allows `https://**` (any host) — defeats Next image allowlisting. | `next.config.js` |
| **Medium** | `src/scripts/create-admin.mjs` logs the admin password in plaintext (lines 33, 48) and contains a **syntax error** (`const password = = process.env.ADMIN_KEY`) — the script cannot run at all. | `src/scripts/create-admin.mjs` |
| **Medium** | `scripts/db-test.mjs` prints `DATABASE_URL` (including password) to stdout. | `scripts/db-test.mjs:39` |
| **Low** | No input validation framework; all routes do ad-hoc presence checks (no email/length/format validation). | all API routes |
| **Low** | No rate limiting on public form endpoints. | contact/booking routes |

### 1.2 The payment flow is simulated — Stripe is not integrated

Despite README claims ("Payment Integration: Secure online payments with Stripe") there is **no Stripe code anywhere**: no `stripe` package, no checkout session, no webhook. `purchase-booking` hardcodes `paymentMethod: 'instore'`, `paymentStatus: 'PENDING'`. `/payment/success` shows success without verifying anything. The schema comment mentions `stripePaymentIntentId` only in the hand-written `postgres-schema.sql`, not in `schema.prisma`.

**Action taken:** real Stripe Checkout (test mode) added in Phase 5, with graceful degradation to "pay in store" when keys are absent (see change log).

### 1.3 Stale / dead files

| File(s) | Why dead | Action |
|---|---|---|
| `Desktop`, `Desktop.pub` | committed SSH keypair | delete, gitignore patterns |
| `prisma/dev.db` | committed SQLite DB; schema provider is `postgresql` | delete, gitignore |
| `next.config.ts` | empty duplicate of `next.config.js` — Next.js uses `.ts` when both exist, so the real config was being **ignored** | keep one merged `next.config.ts` |
| `src/lib/supabase.ts` | never imported; would crash on missing env vars | delete (+ remove dep) |
| `src/lib/mail.ts` | never imported; superseded by `emailUtils.ts`; crashes without `SMTP_*` vars | delete |
| `src/lib/db.ts` | duplicate Prisma client singleton (vs `prisma.ts`); routes import both randomly | consolidate into one |
| `src/lib/imageUtils.ts` | helpers mostly unused; logic re-implemented inline in routes | fold useful parts into rewrite |
| `scripts/db-test.mjs` | orphan (not referenced by package.json); duplicate of `src/lib/db-test.mjs`; leaks DATABASE_URL | delete |
| `scripts/deploy.mjs`, `scripts/deploy-migrations.mjs`, `scripts/post-build.mjs` | Vercel deployment hacks; `post-build.mjs` referenced by `postbuild` hook but redundant | delete |
| `prisma/fix-migrations.mjs`, `prisma/setup-database.mjs`, `prisma/postgres-schema.sql` | SQLite→PostgreSQL conversion hacks; migrations regenerated cleanly instead | delete |
| `tools/hash.js` | 207-byte one-off bcrypt snippet with placeholder text | delete |
| `src/scripts/create-admin.mjs` | broken (syntax error), logs passwords; superseded by seed script | delete |
| `scripts/reset-admin.mjs` | **referenced in package.json but does not exist** (`npm run reset-admin` fails) | remove script entry |
| `src/app/api/test-api`, `src/app/api/test-days`, `src/app/api/admin/ping` | debug endpoints | delete |
| `src/app/admin/available-days-test` | test page that can wipe data | delete |
| `public/video.mp4` (4.8 MB) | unused | delete |
| `public/uploads/*.png` | end-user uploaded content | delete, gitignore `public/uploads/` |
| `public/documents/*.pdf` (4 Greek legal PDFs) | real business legal documents; not appropriate for a public portfolio repo; linked only from the privacy page | delete, rewrite privacy page |
| `vercel.json` | Vercel-specific build/caching config; project no longer targets Vercel-specific deploys (headers moved to `next.config.ts`) | delete |
| `Calendar.css`, `CalendarFix.css` | `!important`-laden patches for react-calendar | removed with custom date picker |

### 1.4 Dead code inside live files

- `repair/page.tsx` (1,578 lines): ~900 lines of hardcoded pricing tables embedded in the component; an empty OnePlus pricing object; `as any` casts.
- `admin/login/page.tsx`: empty `handleResetAdmin()` function.
- `ThemeSwitcher.tsx`: leftover `console.log` debug.
- `PaymentSection.tsx` (709 lines): generates a fake `listingId` with `uuidv4()` client-side instead of using the API response.
- Duplicated brand/model extraction logic between `create-booking` and `purchase-booking` routes; ~200 lines of duplicated email-template scaffolding in `emailUtils.ts`.

### 1.5 Dependency status (declared → latest at audit time)

**Unused (remove):** `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` (no 3D anywhere), `@supabase/supabase-js` (only the dead `supabase.ts`), `heroicons` (never imported), `psql` (junk 0.0.1 npm package, not the CLI), `vercel` (CLI does not belong in dependencies), `critters` (CSS-inlining experiment never enabled), `@next-auth/prisma-adapter` **and** `@auth/prisma-adapter` (two copies of the same adapter; JWT-strategy credentials auth needs no adapter at all), `bcrypt` + `@types/bcrypt` (duplicate of `bcryptjs`; native build pain on Windows), `jsonwebtoken` + types (custom admin JWT replaced by NextAuth), `uuid` (replaced by `crypto.randomUUID`/DB ids), `ts-node` (unused).

**Kept and updated within major:** `next` 15.2→15.5, `react`/`react-dom` 19.0→19.2, `next-auth` 4.24.x, `@prisma/client`/`prisma` 6.5→6.x latest, `nodemailer`, `react-hot-toast`, `react-icons`, `tailwindcss` 3.4.x, `typescript` 5.x, `eslint` 9, `eslint-config-next` 15.x.

**Added:** `zod` (validation), `stripe` (Checkout, test mode), `autoprefixer` (was missing from PostCSS chain).

**Major bumps available but intentionally NOT applied** (flagged per brief):

| Package | Current major | Latest | Why deferred |
|---|---|---|---|
| `next` / `eslint-config-next` | 15 | 16 | Next 16 migration (async APIs, Turbopack default) is a project of its own; 15.x is current and supported |
| `tailwindcss` | 3 | 4 | v4 replaces `tailwind.config.ts` with CSS-first config; the design-token setup here targets v3 deliberately |
| `prisma` / `@prisma/client` | 6 | 7 | Prisma 7 changes generator/client layout; no feature need |
| `typescript` | 5 | 6 | ecosystem (eslint-config-next 15) pins TS 5 peer ranges |
| `eslint` | 9 | 10 | eslint-config-next 15 targets ESLint 9 |
| `react-calendar` | 5 | 6 | dependency removed entirely (custom date picker) |
| `nodemailer` | 6 | 8 | SMTP behaviour can't be regression-tested here; 6.x maintained |

**Node:** `.nvmrc`/`.node-version`/engines pinned `18.x` — EOL since April 2025. Updated to Node 24 (active LTS), engines `>=20`.

### 1.6 Database / Prisma issues

- `schema.prisma` says `provider = "postgresql"` but the first two migrations are **SQLite SQL** (`DATETIME`, no quoted identifiers) — `prisma migrate deploy` against PostgreSQL fails without the `fix-migrations.mjs` rewrite hack.
- Migration `20250330164300_add_phone_for_sale_model` is **corrupted**: it contains Prisma schema syntax pasted into the `.sql` file.
- Migration `20250402_add_available_hours` is hand-written PostgreSQL with a different naming convention.
- `AdminUser` table duplicates `User.role === "admin"`; the app used both.
- `Booking`/`PhoneListing` store free-form status strings; no enums.
- **Action:** migrations regenerated as a single clean PostgreSQL init migration from the (cleaned) schema; `AdminUser` model dropped in favour of `User.role`.

### 1.7 Documentation inconsistencies

- README says `NEXTAUTH_SECRET` + `ADMIN_EMAIL`/`EMAIL_PASSWORD`; DEPLOYMENT.md says `JWT_SECRET` + `EMAIL_USER`/`EMAIL_PASSWORD`; the code actually read `NEXTAUTH_SECRET` (NextAuth), `JWT_SECRET` (custom admin JWT), `EMAIL_USER`/`EMAIL_PASSWORD` (nodemailer), and `ADMIN_EMAIL` **nowhere**.
- `ADMIN_KEY` and `DIRECT_URL` were required by code but documented nowhere.
- README documents `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` for an integration that didn't exist.
- README advises Gmail "Less secure app access" — removed by Google in 2022; app passwords are the only option.
- EMAIL_SETUP.md / README-CONTACT-FORM.md claim provider auto-detection and an Ethereal fallback; partially true (`emailUtils.ts`) but contradicted by the dead `mail.ts` which would crash.
- A Vercel troubleshooting dump is pasted into the bottom half of README.md.
- Four overlapping docs: `README.md`, `DEPLOYMENT.md`, `EMAIL_SETUP.md`, `README-CONTACT-FORM.md`.

### 1.8 UI/UX problems per page (pre-overhaul)

Global: customer pages 100% Greek while admin pages are English; no design system (ad-hoc purple-on-gray Tailwind); no loading skeletons; no empty states; no focus styles; emoji used as icons; giant single-file page components.

| Page | Problems |
|---|---|
| `/` (landing) | Auto-rotating image carousel as the entire above-the-fold; no value proposition, no journey cards, no social proof; footer minimal |
| `/about` | Wall of text, emoji icons, hardcoded `bg-purple-600` CTA |
| `/repair` | 1,578-line component; 4-step flow with no step indicator; pricing tables hardcoded in JSX; no error boundary; no inline validation |
| `/sell` | 893 lines; base64-encodes images client-side with no size limit; reads contact info from the DOM instead of state |
| `/purchase` | 717 lines; dynamic Tailwind class names that the JIT can't see (`grid-cols-${n}`); admin key referenced via `NEXT_PUBLIC_ADMIN_KEY` |
| `/contact` | Personal phone number hardcoded 3×; form errors don't clear; no success state styling |
| `/faq` | Non-semantic accordion (`div`s + "+"/"−" text), data hardcoded |
| `/privacy` | Links to four PDFs; placeholder legal text |
| `/login` | Mixed Greek/English labels; no role hint |
| `/admin/*` | Plain unstyled tables; no stat cards, sorting, filtering, or empty states; separate custom-JWT login at `/admin/login` |
| `PaymentSection` | 709 lines; react-calendar patched with two `!important` CSS files; loose phone regex |

### 1.9 Other inconsistencies

- `package.json` carries 14 npm scripts, half of them deployment hacks (`vercel-build`, `export` using removed `next export`, `apply-migration`, `fix-migrations`, `db-setup`, `deploy*`, `reset-admin` → missing file).
- Two Prisma singletons (`db.ts`, `prisma.ts`) → two PrismaClient instances in dev.
- `PhoneForSale.id` uses `uuid()` while every other model uses `cuid()`.
- `.gitignore` has duplicate `.env` entries and misses `*.db`, key patterns, `public/uploads`.

---

## Part 2 — Change log (updated per phase)

### Phase 0 — Audit
- Wrote this document. No code changes.

### Phase 1 — Stale & dangerous files
- **Deleted:** `Desktop`/`Desktop.pub` (SSH keypair), `prisma/dev.db`, `public/uploads/*`, `public/video.mp4`, `public/documents/*.pdf`, `next.config.js` (merged into a single `next.config.ts` — note the empty `.ts` had been *shadowing* the real `.js` config), `vercel.json`, `tools/`, `scripts/db-test.mjs`, `scripts/deploy.mjs`, `scripts/deploy-migrations.mjs`, `scripts/post-build.mjs`, `prisma/fix-migrations.mjs`, `prisma/setup-database.mjs`, `prisma/postgres-schema.sql`, `src/scripts/create-admin.mjs`, `src/lib/{db-test.mjs,supabase.ts,mail.ts}`, debug routes `api/test-api`, `api/test-days`, `api/admin/ping`, test page `admin/available-days-test`.
- **.gitignore** rewritten: `.env*` (except `.env.example`), `*.db`, `*.pem`, `*.pub`, `*.key`, `id_rsa*`/`id_ecdsa*`/`id_ed25519*`, `public/uploads/`, editor dirs; removed duplicate entries.
- **Scrubbed:** personal phone `+30 697 455 8380` → placeholder; Supabase project ref and Gmail address in DEPLOYMENT.md → placeholders. Repo-wide scan for key/token patterns (AWS, Stripe live, GitHub, Slack, Google, PEM blocks): no further hits.
- New `next.config.ts`: removed `ignoreBuildErrors`/`ignoreDuringBuilds`, removed the `https://**` image wildcard and dead image domains, kept security headers (moved from vercel.json).

### Phase 2 — Dependencies & tooling
- `package.json` rebuilt. Removed unused/duplicated deps: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `@supabase/supabase-js`, `heroicons`, `psql`, `vercel`, `critters`, `bcrypt` + `@types/bcrypt` (only `bcryptjs` was imported), `@auth/prisma-adapter`, `@next-auth/prisma-adapter` (JWT-strategy credentials auth needs no adapter), `ts-node`. Added `zod`, `stripe`, `autoprefixer`.
- Updated everything else to latest within-major (see §1.5 for deferred majors). One exception: **nodemailer 6 → 7** — forced by next-auth 4.24.14's peer range; `createTransport` API unchanged, compiles clean.
- Node: `.nvmrc`/`.node-version` → `24`, `engines.node` → `>=20` (was EOL 18.x). Build verified on Node 24.
- npm scripts reduced from 17 to 10; removed all Vercel/SQLite hack scripts and the broken `reset-admin`. Added `setup`, `db:up`, `db:migrate`, `db:seed`, `typecheck`.
- ESLint tightened: `no-explicit-any` error, `no-unused-vars` error (underscore-args exempt), `eqeqeq`, `prefer-const`, `no-console` (warn/error allowed). `lint` now runs `eslint src` directly (`next lint` is deprecated in 15.5).
- PostCSS: added `autoprefixer`.
- Known minor: Prisma prints a deprecation warning for the `package.json#prisma` seed config; kept because `prisma.config.ts` stops auto-loading `.env` (worse trade for a demo repo). Revisit with the Prisma 7 bump.

### Phase 3 — Code hygiene (API & lib layer rewritten)
- **Prisma schema rebuilt** (`prisma/schema.prisma`): real enums (`Role`, `BookingType`, `BookingStatus`, `PaymentMethod`, `PaymentStatus`, `ListingStatus`, `PhoneStatus`, `Condition`); dropped the redundant `AdminUser` table (admins are `User.role = ADMIN`); added the previously schema-less `AvailableDay` model (was raw SQL against a hand-created table); `AvailabilityConfig.slots` and `images`/`issues` as native `String[]` instead of JSON-in-a-string; `Booking.phoneForSaleId` FK with `onDelete: SetNull`; `stripeSessionId` on Booking; consistent `cuid()` ids. Old corrupted SQLite/PostgreSQL migration mix deleted and regenerated as one clean PostgreSQL init migration.
- **Single Prisma client** (`src/lib/prisma.ts`); deleted duplicate `db.ts`.
- **Auth unified on NextAuth** (`src/lib/auth.ts`): credentials provider + JWT sessions with typed `role` claim (`src/types/next-auth.d.ts`), `auth()`/`isAdmin()` helpers. Custom admin JWT (`/api/admin/login`, `jsonwebtoken`), `ADMIN_KEY` query-string auth, and `NEXT_PUBLIC_ADMIN_KEY` are all gone. `/api/register` removed (no page ever linked to it).
- **Validation:** `src/lib/validation.ts` — zod schemas for every payload; routes return 400 with field-level messages via `parseBody()` (`src/lib/api.ts`), 401/403 via `requireAdmin()`, and generic 500s via `serverError()` — no internal error text reaches clients.
- **Email:** `src/lib/email.ts` replaces `emailUtils.ts` (~470 → ~110 lines): one transport, one shared template renderer, console fallback when SMTP is unconfigured, and failures never break the request. Admin notifications now sent **server-side inside** the booking/listing/contact routes — the old client-triggered `/api/notifications/*` endpoints (anyone could spam the admin inbox) are gone.
- **Stripe:** `src/lib/stripe.ts` — `getStripe()` returns `null` without keys; online payment is offered only when configured.
- **API surface** (old → new): `create-booking`+`purchase-booking`+`purchase-phones`+`notifications/*` → `POST /api/bookings`, `POST /api/purchases`, `GET /api/checkout/verify`; `phone-listings` → `POST /api/listings`; `phones-for-sale` → `GET /api/phones`; `available-days`+`available-hours` → `GET /api/availability` (now also returns per-day taken slots — double-booking a slot is rejected with 409, which the old app allowed); admin CRUD consolidated under `/api/admin/{bookings,listings,phones,availability}` with NextAuth guards (the previously **unauthenticated** booking-status PATCH is now admin-only); `admin/upload-images` → `POST /api/upload` with type/size/count limits.
- Repair pricing data (~900 lines embedded in `repair/page.tsx`) extracted to `src/lib/repair-catalog.ts`, typed, with Greek labels translated.
- Checkpoint: `tsc --noEmit` clean for the entire new lib/API layer; remaining errors confined to 3 legacy UI files that Phase 4 replaces (the old build only passed because `ignoreBuildErrors: true` hid them).

### Phase 4 — UI/UX overhaul
The presentation layer was rebuilt from scratch (old pages deleted, ~4,900 lines of page code replaced by ~3,000 across small composable files). Business behaviour is preserved; the UI language is now **English** (the old UI was Greek — this repo is the public portfolio copy, and a demo a reviewer can read is worth more; reverting is a content-only change).

- **Design system**: tokens in `tailwind.config.ts` — `brand` teal scale (trustworthy/technical, deliberately not the generic purple), `accent` amber, slate neutrals, `font-sans` Inter + `font-display` Space Grotesk (via `next/font`), card shadows, content width. Global focus-visible ring for keyboard users in `globals.css`.
- **Primitives** (`src/components/ui/`): Button (variants/sizes/loading/href), Card, Input/Textarea/Select with label+error+hint wiring (`aria-invalid`, `role="alert"`), Badge (5 tones), Modal (Escape/backdrop close, `aria-modal`, focus move), Table set, Skeleton, Spinner, EmptyState, Stepper.
- **Information architecture**: sticky navbar with the three journeys (Repair / Buy a phone / Sell yours) + persistent "Book a repair" CTA + accessible mobile menu; footer with services, company links, address/hours/phone/email. Route group `(site)` for public pages; `admin/` has its own guarded layout.
- **Landing page**: value proposition above the fold, trust stats, three journey cards, price teasers computed from the real repair catalog, features, testimonials, CTA band. Replaces the auto-rotating Greek image carousel (framer-motion dependency dropped with it).
- **Repair flow**: 4 steps with Stepper (brand → searchable model list → issues with live prices and estimated total → calendar/slots/contact). "Other" brand/model supported with quote-on-inspection pricing. Confirmation screen with booking reference.
- **Purchase**: server-rendered catalog (SEO + no skeleton flash) with client-side filters (brand/condition/max price), condition badges, detail modal with image gallery, reserve-pickup modal with payment-method choice; "pay online" auto-hidden when Stripe is unconfigured. Phones without photos get an SVG placeholder (the old `default-phone.jpg` was a broken 36-byte file).
- **Sell flow**: 3 steps (device → photos & asking price → contact) with multipart upload to `/api/upload` (replaces base64-into-JSON), photo previews with remove, zod-mirrored inline validation.
- **Contact / FAQ / About / Privacy**: rewritten in English; FAQ uses semantic `<details>/<summary>`; privacy no longer links the four deleted business PDFs.
- **Login**: single sign-in page for staff (replaces the parallel `/admin/login`); shows field-level errors; redirects to `callbackUrl`.
- **Admin**: server-guarded layout (session check + role check, redirect to `/login`), sidebar nav, sign-out. Dashboard with 4 stat cards + latest-bookings table (server component). Bookings page: status/type filters, date-sort toggle, per-row status select with optimistic update, detail modal. Sell requests: review modal with photos and Make offer / Decline / Mark bought / Delete actions. Inventory: full CRUD with image upload and status badges. Availability: open-day management + slot editor. Empty states everywhere.
- **Custom date picker** (~100 lines) replaces react-calendar + its two `!important` patch CSS files; only open days are enabled, taken slots are struck through.
- **Accessibility**: semantic landmarks, labelled fields, `aria-pressed` on pickers, `aria-current` on nav and steps, focus-visible rings, `sr-only` labels on icon buttons; responsive at 360/768/1280 via mobile-first Tailwind.
- **Dark mode**: skipped per brief (token system is light-only; next-themes/ThemeSwitcher removed).
- Final dependency prune completed here: `framer-motion`, `react-calendar`, `next-themes`, `uuid` (→ `crypto.randomUUID`), `jsonwebtoken` + types removed. Deleted unused brand SVGs (11 of 14), the old hero carousel images (1–4.png), and `irescue-logo.png` (replaced by an inline SVG logo + `app/icon.svg` favicon).

### Phase 5 — Demo-ability
- `docker-compose.yml`: PostgreSQL 16 (user/pass/db `irescue`) with healthcheck and named volume; `npm run db:up`.
- `.env.example`: every variable the code reads, commented, with safe defaults matching docker-compose. Doc contradictions resolved by aligning to the code: `NEXTAUTH_SECRET` (only auth secret left), `EMAIL_USER`/`EMAIL_PASSWORD`/`EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_SECURE`/`EMAIL_RECEIVER`, `STRIPE_SECRET_KEY`, `DATABASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`. `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_KEY`, `NEXT_PUBLIC_ADMIN_KEY`, `DIRECT_URL`, `SMTP_*` no longer exist.
- `npm run setup` = install → migrate → seed (`prisma generate` runs on postinstall).
- `prisma/seed.mjs`: demo admin (`admin@demo.com` / `demo-admin-123`, README-documented as demo-only), 12 open days (next 14 minus Sundays) + 10 slots, 10 refurbished phones with realistic specs/prices (3 with photos), 6 bookings across all four statuses (repair + purchase, one paid-online), 5 sell requests across all four statuses. Reseeding resets demo data by design.
- Email degrades gracefully (console log, verified at runtime); Stripe absence hides online payment and returns a friendly 400 if forced (verified at runtime).

### Phase 6 — Documentation
- `DEPLOYMENT.md`, `EMAIL_SETUP.md`, `README-CONTACT-FORM.md` deleted; single `README.md` rewritten: features, screenshots checklist (10 captures listed), tech stack, mermaid request-flow + ER diagrams, one-command quick start, env-var reference, demo credentials, Stripe test cards, project structure, host-agnostic deployment notes. Gmail "less secure apps" advice replaced with App Passwords. Added `LICENSE` (MIT) — the old README claimed MIT with no license file.

### Phase 7 — Verification
Static checks (Node 24.11.1): `npx tsc --noEmit` ✅ zero errors · `npm run lint` ✅ zero warnings (with `no-explicit-any` as error) · `npm run build` ✅ 33 routes, 103–144 kB first-load JS.

Runtime (Docker unavailable on this machine, so verified against a disposable embedded PostgreSQL 16 on port 5433 — same engine the compose file provides):
- `prisma migrate deploy` + `prisma db seed` ✅ (the `npm run setup` chain).
- All 9 public pages render 200 with seeded content (catalog shows the 10 phones).
- Contact: valid → 200 + email logged to console; invalid → 400 with per-field messages.
- Repair booking → 201 with reference; same slot again → 409.
- Purchase (in-store) → 201; purchase (online, no Stripe key) → graceful 400.
- Sell request → 201; upload → 201 (PNG) / 400 (wrong type).
- Admin: unauthenticated API → 401, `/admin` → 307 to login; NextAuth credentials login → session with `role: ADMIN`; bookings list, booking PENDING→CONFIRMED, listing PENDING→APPROVED, inventory and availability endpoints all ✅.

**Not verified end-to-end:** the actual Stripe Checkout redirect (no Stripe test key exists on this machine). The graceful-degradation path is verified; to exercise the full flow, set `STRIPE_SECRET_KEY` to a test key and buy a phone with card `4242 4242 4242 4242`.

---

## Intentionally left alone

- **Prisma 6 / Tailwind 3 / Next 15 / TS 5 / ESLint 9** — current and supported; majors deferred (see §1.5) to keep the rebuild reviewable.
- **`package.json#prisma` seed config** — deprecated by Prisma 7 in favour of `prisma.config.ts`, but the config file disables automatic `.env` loading; the one-line warning is the better trade until the Prisma 7 bump.
- **Local-disk image uploads** — correct for the local demo; README documents the object-storage swap for serverless hosts.
- **Stripe webhook** — redirect-verification was chosen so the demo needs no extra process; webhook noted in README as the production hardening step.
- **No rate limiting / CAPTCHA on public forms** — out of scope for a demo; listed as a follow-up.
- **Greek UI** — replaced with English for the portfolio copy; the original Greek content survives in git history if ever needed.

## Recommended follow-ups

1. **Rotate the exposed SSH key now.** `Desktop`/`Desktop.pub` were public; assume the private key is compromised. Remove the old public key from every `authorized_keys` / GitHub → Settings → SSH keys entry it was added to.
2. **Rewrite git history before publishing.** The keypair and `prisma/dev.db` (likely containing real customer names/emails/phones) exist in commit `b5c861e`. Either squash to a fresh initial commit (simplest for a portfolio repo: delete `.git`, `git init`, commit) or use `git filter-repo` / BFG to excise the files.
3. If the Gmail address (`irescueathens@gmail.com`) ever had an app password in any deleted doc revision, rotate it too.
4. Consider rate limiting (e.g. Upstash or middleware token bucket) on `/api/contact`, `/api/bookings`, `/api/listings`, `/api/upload` before real deployment.
5. Add a Stripe webhook (`checkout.session.completed`) for payment robustness in production.
6. Capture the 10 screenshots listed in the README and replace the placeholder section.
7. Optional polish: tests (Playwright smoke suite for the booking flows), CI (GitHub Actions running `lint` + `typecheck` + `build`), and the Prisma 7 / Tailwind 4 / Next 16 upgrades as separate PRs.
