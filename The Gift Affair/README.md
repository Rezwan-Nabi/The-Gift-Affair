# The Gift Affair: wedding gift ideas platform

A colourful, editorial website for discovering wedding gifts by ceremony, recipient, category and budget, with a protected admin dashboard for managing content. Built from the PRD v2.0 (MVP).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage) · Zod · React Hook Form · Radix Dialog · Motion · Lucide · Vitest · Playwright

> **"The Gift Affair" is the PRD's working name.** Change it in `src/lib/constants.ts`.

---

## Quick start (demo mode, no database)

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

With the Supabase variables left empty, the **public site runs on bundled sample content** (`src/lib/demo/seed.json`): 20 gift ideas, 6 categories, 3 occasions, 4 recipient groups, 3 budget ranges and 2 guides. The admin area shows a "Supabase isn't configured" message until you connect a project.

## Connect Supabase

1. **Create a project** at [supabase.com](https://supabase.com). Use separate projects for development and production.
2. **Run the migrations**, in order. Either:
   - with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <ref>` then `supabase db push`, or
   - paste each file from `supabase/migrations/` into the SQL editor, oldest first.
3. **(Optional) Load the sample content:** run `supabase/seed.sql` in the SQL editor. It references images in `public/images/`, so it works without uploading anything.
4. **Add environment variables** to `.env.local` (and later to Vercel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # or the legacy anon key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   The app never needs the service-role/secret key.
5. **Turn off public sign-ups:** Authentication → Sign In / Providers → disable "Allow new users to sign up". Editors are invited, not self-registered.
6. **Create your admin account:** Authentication → Users → Add user (email + password). Then grant the role in the SQL editor:
   ```sql
   update public.profiles
   set role = 'admin'   -- or 'editor'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Roles can only be changed with SQL. There is deliberately no API policy that lets a user change their own role.
7. Restart `npm run dev` and sign in at `/admin/login`.

To regenerate `seed.sql` after editing `seed.json`: `node scripts/generate-seed.mjs`.

## What's built

### Public site

| PRD | Feature | Where |
|---|---|---|
| FR-001–009 | Homepage: hero with search, category cards, occasion collections, popular ideas, budget links, featured guide, brand note, footer | `src/app/(public)/page.tsx`, `src/components/home/` |
| FR-011–016 | Gift grid; filter by category, occasion, recipient, budget; clear filters | `src/components/gifts/GiftBrowser.tsx`, `src/components/filters/` |
| FR-017–020 (P1) | Result count, sort (featured/newest), pagination, filters kept in the URL | same |
| FR-021–025 | Search (title, summary, keywords) with empty state, combinable with filters | `search_gifts()` SQL function / `src/lib/filters.ts` |
| FR-026–031 | Gift page: gallery, labels, "why it's thoughtful", safe external link, related ideas, share/copy link | `src/components/gifts/GiftDetail.tsx` |
| FR-032–035 (P1) | Gift guides list and detail with curated ideas and related links | `src/app/(public)/gift-guides/` |
| §5.1 | `/categories`, `/occasions`, `/recipients`, `/budget` listing pages; About, Contact, Privacy, Terms, 404 | `src/app/(public)/` |
| §14 | Per-page titles and descriptions, canonical URLs, Open Graph, sitemap, robots, breadcrumb JSON-LD; filtered views are `noindex` | page `generateMetadata`, `src/app/sitemap.ts`, `robots.ts` |

### Admin (`/admin`)

| PRD | Feature |
|---|---|
| FR-036 | Email/password sign-in via Supabase Auth; only `admin`/`editor` roles get in |
| FR-037–039 | Create, edit, publish, unpublish, archive and delete gift ideas (delete asks for confirmation); upload main and gallery images |
| FR-040–042 | Manage categories, occasions, recipients and budget ranges (with usage counts and show/hide) |
| FR-043 (P1) | Mark ideas as featured |
| FR-044 (P1) | Create and edit gift guides, choose and order their ideas |
| FR-045 (P1) | Preview any idea, including drafts, exactly as visitors will see it |
| §7.4 | Dashboard: totals, published, drafts, categories, recent updates, quick "Add a gift idea" |

### Security (PRD §9.3, §16.2)

Authorisation is enforced in three layers:

1. **`src/proxy.ts`** redirects signed-out visitors away from `/admin/*` (first line only).
2. **Every admin page and server action** re-checks the user and role on the server (`src/lib/auth.ts`), and validates input with the same Zod schemas the forms use.
3. **Row Level Security** in Postgres: the public can only read published ideas/guides and active categories/tags; only `is_editor()` users can write. Storage uploads/deletes are editor-only, and the bucket itself enforces a 5 MB limit and JPG/PNG/WebP/AVIF types.

Gifts and guides are saved through transactional SQL functions (`save_gift`, `save_guide`), so an idea and its categories, tags and gallery are saved together or not at all. Outbound links must be `http(s)`, open in a new tab with `rel="noopener noreferrer"`, and are validated in both Zod and a database `CHECK`. Content is plain text (no HTML), so there's nothing to sanitise.

### Accessibility and responsiveness (PRD §15)

Semantic landmarks and heading order, skip link, visible focus rings, labelled form fields with linked error messages, keyboard-operable menus (Escape closes them), focus-trapped dialogs and drawers (Radix), status never shown by colour alone, reduced-motion support. Grids go 1 → 2 → 3 → 4 columns. Text on bright accent colours is always plum.

## Testing

```bash
npm test             # Vitest unit tests: filters, budget/tag matching, slugs, validation schemas, formatting
npm run test:e2e     # Playwright: builds and starts the app, then runs desktop + mobile
```

The public end-to-end tests work in demo mode or against a seeded database. The admin tests (sign in, create draft, upload an image, publish, check it's public, delete) need a Supabase project and an editor account:

```bash
E2E_ADMIN_EMAIL=you@example.com E2E_ADMIN_PASSWORD=... npm run test:e2e
```

Run them against a development project: they create and delete a test idea.

## Deploying to Vercel

1. Push to GitHub and import the repository in Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL` (your real domain) for Production. Point Preview deployments at the development Supabase project.
3. Deploy, then add your domain. In Supabase → Authentication → URL Configuration, set the Site URL to the same domain.
4. After launch: submit `/sitemap.xml` in Google Search Console and run Lighthouse on mobile.

Public pages are cached and revalidated every 5 minutes, and immediately after any admin change.

## Decisions I made for the PRD's open questions (§21.3)

These are defaults to get you started. Each is easy to change.

| Question | Assumption in this build | Change it in |
|---|---|---|
| Launch market and currency | Bangladesh; budget ranges in BDT: under ৳3,000 / ৳3,000–10,000 / over ৳10,000 | Admin → Occasions, recipients and budgets |
| Show prices? | Optional. A price only shows with a currency and a "checked on" date (enforced by the form and the database) | Gift form |
| Recommend or sell? | Recommend only. No cart, checkout or affiliate tracking | n/a |
| Ceremonies | Holud, Wedding Ceremony, Reception | Admin |
| Recipients | The Couple, The Bride, The Groom, The Family | Admin |
| Saved ideas without an account | Not included (P2) | n/a |
| Affiliate links | Not included. If you add them, disclose them on each gift page and in the Terms | `GiftDetail.tsx`, Terms page |

## Before launch (PRD acceptance criterion 18: no placeholder content)

- [ ] Replace the sample ideas and guides with real content. Delete the seeded rows or don't run `seed.sql` in production.
- [ ] All 30 website photos in `public/images/` were generated with Figma AI ([source file](https://www.figma.com/design/w0zoxDYpC8IBJE9ecDSXIj)). They show the *kind* of gift, not a specific product. When an idea links to a real shop or maker, swap in that seller's photo (with permission) or your own, so visitors see what they'd actually buy.
- [ ] Replace the "Example Maker (placeholder)" links.
- [ ] Set the site name, contact email and social links in `src/lib/constants.ts`.
- [ ] Rewrite the About page, and have the Privacy and Terms templates reviewed for your market.
- [ ] Confirm the budget ranges.
- [ ] Note that the image bucket is public: anyone with an image's exact URL can view it, including images attached to drafts. Don't upload anything private.

## Images

Photos live in `public/images/` (`hero/`, `gifts/`, `categories/`, `occasions/`, `guides/`, `og-image.jpg`). The three homepage hero photos are listed in `src/lib/hero.ts`; the rest and are referenced from `src/lib/demo/seed.json` / the database. They were generated in the Figma file linked above, where each frame is already named with its path and set to export as JPG:

1. In Figma, select all frames on the page and click **Export** (bottom of the right panel). Figma downloads a zip whose folders match `public/images/`.
2. Unzip it into `public/images/`, replacing the existing files.

`next/image` resizes and converts them to WebP/AVIF automatically. Images you upload through the admin go to Supabase Storage instead. The favicon is `src/app/icon.svg`.

## Project structure

```text
src/
  app/
    (public)/            public routes, sharing the site header and footer
    admin/
      login/             sign-in (outside the protected layout)
      (dashboard)/       protected admin pages
      actions.ts         server actions: role check → Zod → Supabase (RLS) → revalidate
    sitemap.ts, robots.ts, not-found.tsx, globals.css (design tokens)
  components/
    layout/ home/ gifts/ filters/ guides/ admin/ ui/
  lib/
    supabase/            browser, server and proxy clients
    queries/             public.ts (published content), admin.ts, row mappers
    validations/         Zod schemas shared by forms and server actions
    demo/                sample content used when Supabase isn't configured
    filters.ts           URL ⇄ filter parsing, matching, sorting, pagination
  proxy.ts               keeps signed-out visitors out of /admin
  types/
supabase/
  migrations/            schema, indexes, search, RLS, storage, save functions
  seed.sql               generated sample content
tests/
  unit/                  Vitest
  e2e/                   Playwright
scripts/generate-seed.mjs
```

## Design notes

- **Palette** (PRD §8.2): coral, lavender, orange, sunshine and sage accents on warm cream with deep plum text, defined as tokens in `globals.css`.
- **Type:** Playfair Display for headings, Inter for text (via `next/font`).
- **Signature details:** a bead "garland" in the five accent colours, like a holud marigold string, under the hero and above the footer, and one colour per ceremony (sunshine for the holud, coral for the wedding, lavender for the reception).
- **Motion:** one entrance sequence in the hero, gentle image zoom on card hover, dialog and drawer transitions. All of it is reduced or off when the visitor asks for reduced motion.
