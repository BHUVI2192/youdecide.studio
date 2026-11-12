# youdecide.studio

Marketing site, working enquiry pipeline and protected admin dashboard for **youdecide.studio**.

> "A small budget should never mean a small dream."

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion for React (`motion/react`) · Lenis smooth scroll · Supabase (Postgres, Auth, Row Level Security) · Nodemailer over Gmail SMTP · Zod · Lucide.

> **Email note.** Enquiry email uses **Nodemailer + Gmail SMTP**, as requested, not Resend. Wherever a brief says "configure Resend", follow §6 instead.

---

## 1. Prerequisites

- Node.js **20.9+** (built and tested on 22) and npm 10+
- A Supabase project (free tier is fine)
- A Gmail / Google Workspace account with 2-Step Verification (for the App Password)

## 2. Install

```bash
unzip youdecide-studio-complete-source.zip
cd youdecide-studio
npm install
```

## 3. Run locally

```bash
cp .env.example .env.local     # then fill in the values (§4–§6)
npm run dev                    # http://localhost:3000
```

With no credentials at all the public site still runs: the Wall of Trust shows its empty state and the enquiry form answers "temporarily unavailable". Set `NEXT_PUBLIC_SHOW_DEMO_DATA=true` to preview the wall with clearly-badged DEMO rows.

Other scripts: `npm run typecheck`, `npm run build`, `npm start`.

## 4. Configure Supabase

1. Create a project at <https://supabase.com>.
2. **Project Settings → API** → copy into `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never `NEXT_PUBLIC_`)
3. **Authentication → Sign In / Providers → Email**: keep Email enabled and **turn off "Allow new users to sign up"**. Admins are created by you, never self-registered.

## 5. Run the database migration

Either with the CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

or paste `supabase/migrations/20261112000001_init.sql` into **SQL Editor → Run**.

What it creates and enforces:

| Object | Rule |
|---|---|
| `contributions` | CHECK constraint: a row can never be `is_published` without `consent_to_public_display`. Admin-only via RLS. |
| `contribution_private` | Contact name/email/notes, kept apart from display fields. Admin-only. |
| `public_leaderboard` (view) | The **only** thing visitors can read: published + consented rows, anonymous rows masked to "Anonymous" with project and link blanked. SELECT only. |
| `enquiries` | Visitors may INSERT (with default status only), never read. Admin-only otherwise. |
| `admin_users` | No API policies at all. `is_admin()` (SECURITY DEFINER) is what RLS consults. |

Optional, local only: `supabase/seed-demo.sql` inserts three fictional, **unpublished** rows prefixed `DEMO ·`.

## 6. Configure email (Nodemailer + Gmail) and the business inbox

1. Sign in to the Google account that should **send** notifications.
2. <https://myaccount.google.com/security> → turn on **2-Step Verification**.
3. <https://myaccount.google.com/apppasswords> → create an app password named "youdecide website". Copy the 16 characters.
4. In `.env.local`:
   ```
   GMAIL_USER=you@gmail.com
   GMAIL_APP_PASSWORD=abcdabcdabcdabcd
   CONTACT_EMAIL=hello@yourdomain.com     # the business inbox that receives enquiries
   ```
5. Mail is sent over `smtp.gmail.com:465`. `Reply-To` is the visitor, so replying from the inbox answers them directly.
6. Not using Gmail? Set `SMTP_HOST` and `SMTP_PORT` as well; `GMAIL_USER` / `GMAIL_APP_PASSWORD` are then that server's username and password.

An enquiry is **saved to the database first**, then emailed. If the email fails, the row is kept and marked `failed` with the error text, visible in **Admin → Enquiries**.

`NEXT_PUBLIC_CONTACT_EMAIL` (optional) is the address shown publicly in the footer.

## 7. Create the first admin user (securely)

There is no default admin, no default password and no sign-up page.

1. Supabase → **Authentication → Users → Add user → Create new user**. Enter the email and a strong, unique password (or use **Send invitation** so the person sets their own). Tick *Auto Confirm User* if you set the password yourself.
2. Copy that user's **UID**.
3. **SQL Editor**:
   ```sql
   insert into public.admin_users (user_id, role)
   values ('PASTE-THE-UID-HERE', 'owner');
   ```
4. Open `/admin/login` and sign in.

To remove an admin: `delete from public.admin_users where user_id = '...';`

Every admin page and every `/api/admin/*` handler re-checks the session with Supabase Auth and looks the user up in `admin_users` on the server. A valid login that is not in that table gets "This account is not an admin" and 403s.

## 8. Configure Calendly

The link defaults to `https://calendly.com/youdecide-std/30min`. To change it, set one variable (no code changes):

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-handle/30min
```

It is used by the hero's secondary button, the "Prefer a conversation?" card and the footer, and always opens in a new tab.

## 9. Production build

```bash
npm run typecheck
npm run build
npm start            # serves the production build on :3000
```

## 10. Deploy

**Vercel (recommended)**

```bash
git init && git add -A && git commit -m "youdecide.studio"
# push to GitHub, then import the repo at https://vercel.com/new
```

Add every variable from `.env.example` under **Project → Settings → Environment Variables** (Production + Preview). Set `NEXT_PUBLIC_SITE_URL=https://youdecide.studio` and `NEXT_PUBLIC_SHOW_DEMO_DATA=false`. Deploy, then attach the domain under **Settings → Domains**.

**Any Node host:** `npm ci && npm run build && npm start` behind HTTPS. The API routes need the Node.js runtime (Nodemailer does not run on Edge).

## 11. Update the leaderboard (Wall of Trust)

1. `/admin` → **Wall of Trust** → **Add entry**.
2. Fill the public fields (display name, project, service, amount in whole rupees, optional link).
3. Tick **Customer explicitly consented** only once they have agreed. Until it is ticked the **Publish** box stays locked, the API refuses, and the database refuses.
4. Tick **Show as Anonymous** to list the amount and service without the name, project or link.
5. Tick **Publish** → Save. The public wall refreshes immediately.
6. The Public/Private pill in the table toggles visibility; the pencil edits; the bin deletes. **Preview public wall** shows exactly what visitors see.

Visitors can sort by contribution or latest. With nothing published, the wall shows a friendly empty state.

## 12. Replace images and brand assets

| What | File | Notes |
|---|---|---|
| Hero sky | `public/images/hero-sky.jpg` | ≥ 2400 px wide, open sky on the left for the headline. Currently an original generated image; drop in a licensed Unsplash/Pexels photo with the same filename. |
| Drifting clouds | `public/images/clouds-drift.png` | Transparent PNG, tiles horizontally. Delete the layer in `components/sections/Hero.tsx` if your photo doesn't need it. |
| Logo | `public/images/youdecide-primary-horizontal_{colour,white}.svg` | Approved Concept C wordmark, unmodified. Rendered by `components/ui/Logo.tsx`. |
| Favicon / app icons | `app/favicon.ico`, `public/icons/*`, `public/site.webmanifest` | |
| Fonts | `public/fonts/*.ttf`, wired in `app/layout.tsx` | Geist + Geist Mono, SIL OFL 1.1 (`public/fonts/OFL-Geist.txt`). |
| Colours | `styles/globals.css` → `@theme` | `--color-blue #315BDB`, `--color-navy #101A35`, `--color-blue-deep #2447A8`, `--color-sky #DCE6FF`, `--color-ink #171717`. |
| Copy | `components/sections/*.tsx` | One file per section. |
| Nav labels, form options, statuses | `lib/config.ts` | |
| Social links | `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_LINKEDIN_URL` | Empty = "coming soon". |

## Project structure

```
app/                     routes: page, layout, sitemap, robots, error/loading/404
  admin/login            password sign-in
  admin/(dash)/          Overview · Wall of Trust · Enquiries (server-authorised layout)
  api/enquiries          public POST endpoint
  api/admin/**           admin CRUD + sign-out (each handler calls denyUnlessAdmin())
components/
  ui/                    Logo, PillLink
  framer/                motion-kit: MotionRoot, ScrollProgress, Reveal, ScrollWords, EASE
  layout/                Nav, Footer, SmoothScroll (Lenis)
  sections/              Hero, Belief, Build, How, Trust, Philosophy, Enquiry
  admin/                 ContributionsManager, EnquiriesManager, SignOut
hooks/useLenis.ts        Lenis context + hook
lib/                     config, validation (Zod), auth, mailer, rate-limit, leaderboard, format, supabase/*
types/                   shared TypeScript types
styles/globals.css       Tailwind theme + a few keyframes
supabase/migrations/     schema, constraints, indexes, RLS, view, grants
proxy.ts                 refreshes the admin session cookie, redirects signed-out visitors
docs/                    screenshots + recorded test results
```

## Environment variables

See `.env.example` for the annotated list. Nothing secret is hard-coded; only `NEXT_PUBLIC_*` values reach the browser.

## Spam and abuse protection

Honeypot field · Zod validation on the server · 12 KB body cap · per-IP limiter in memory (5 per 10 min) · durable limiter in the database (5 per hour per hashed IP, 3 per hour per email) · raw IPs are never stored · security headers in `next.config.ts`.

## Still needs a human

- Legal / CA review of the pay-what-you-believe wording, and trademark clearance for the name.
- Instagram handle, LinkedIn URL, public contact email.
- An Open Graph image (`app/opengraph-image.png`, 1200×630).
- Real sky photography, if preferred over the generated image.
