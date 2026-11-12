# Final delivery report — youdecide.studio

Date: 12 November 2026 · Build environment: Linux sandbox, Node 22, headless Chrome
Recorded test output: `docs/test-evidence/` · Screenshots: `docs/screenshots/`

## 1. Completed features

- Landing page, 8 sections in the specified order with the supplied copy: Hero, The Belief, What We Build, How It Works, Wall of Trust, Our Philosophy, Enquiry, Footer.
- Approved Concept C logo (unmodified SVG), Geist / Geist Mono self-hosted, blue-and-white palette from the brief.
- Sky hero with parallax (sky layer + slowly drifting cloud layer), animated blue highlight on "No problem.", scroll cue.
- Lenis smooth scrolling with anchor navigation; Motion for React animation throughout; slim scroll-progress bar.
- Enquiry form → server validation → Supabase → Nodemailer email, with honeypot, two rate limiters and a no-loss fallback when email fails.
- Wall of Trust reading a masked database view; sort by contribution / latest with animated re-ordering; anonymous entries; empty state; clearly badged demo mode.
- Admin at `/admin`: Supabase password login, overview stats, contribution CRUD with consent / anonymous / publish controls and a public preview, enquiry table with search, status filter, status changes, internal notes, delivery status and delete.
- Database migration with constraints, indexes, RLS policies, a SELECT-only public view and explicit grants.
- SEO: metadata, Open Graph, sitemap.xml, robots.txt (admin and API disallowed), favicon/app icons, web manifest. Security headers.
- Accessibility: semantic landmarks, labelled fields, `aria-live` form status, visible focus rings, Escape closes the mobile menu, reduced-motion fallbacks.

## 2. Deviations from the written brief

| Brief | Delivered | Why |
|---|---|---|
| Resend for email | **Nodemailer + Gmail SMTP** | Your instruction during the build. |
| Real sky photography from Unsplash/Pexels | An original generated sky image | Those sites are unreachable from the build environment. Replace one file (README §12). |
| Custom Framer components | None | None were supplied; see §4. |

## 3. Installed dependencies

| Package | Version | Used for |
|---|---|---|
| next | 16.4.6 | framework (App Router) |
| react / react-dom | 19.3.1 | UI |
| motion | 14.13.0 | Motion for React (`motion/react`) |
| lenis | 1.3.27 | smooth scrolling |
| @supabase/supabase-js | 2.119.0 | database client |
| @supabase/ssr | 0.12.7 | cookie-based auth sessions |
| zod | 4.6.7 | validation |
| nodemailer | 10.5.0 | enquiry email over SMTP |
| lucide-react | 1.72.0 | icons |
| server-only | 0.0.1 | keeps server modules out of client bundles |
| tailwindcss, @tailwindcss/postcss | 4.3.5 | styling |
| typescript, @types/node, @types/react, @types/react-dom, @types/nodemailer | 7.0.2 / 26.6.6 / 19.3.0 / 19.3.0 / 8.0.2 | types |

`npm install` reported 0 vulnerabilities. A separate `postcss` dependency was removed as unused; the build was re-run afterwards.

## 4. Framer components

- **Inspected:** none. No Framer component links or files were provided, so there was nothing to inspect or port.
- **Integrated:** none from Framer. The animation utilities in `components/framer/motion-kit.tsx` are original and written directly against Motion for React: `MotionRoot` (reduced-motion config), `ScrollProgress`, `Reveal`, `ScrollWords`, `EASE`.
- If you have specific Framer components in mind, send the links and they can be adapted into this folder.

## 5. Lenis implementation

- `components/layout/SmoothScroll.tsx` creates one Lenis instance for the public page: `autoRaf: true`, `duration: 1.1`, quartic ease-out, `anchors: true`, `touchMultiplier: 1.2`; destroyed on unmount.
- Lenis drives the real document scroll, so Motion's `useScroll`, `useTransform` and `whileInView` work unchanged.
- The offset under the fixed nav comes from `scroll-padding-top` in `styles/globals.css`, which the native fallback also uses.
- `hooks/useLenis.ts` exposes the instance through context; `Nav` pauses Lenis while the mobile menu is open.
- Not started when `prefers-reduced-motion: reduce` is set. Not used in the admin area; the scrollable admin drawer carries `data-lenis-prevent`.

## 6. Build and TypeScript

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS, 0 errors |
| `npm run build` (Next.js 16) | PASS, 13 routes generated |
| `npm run dev` | PASS, ready in under 1 s, homepage HTTP 200 |
| `npm start` | PASS, used for the functional tests below |

## 7. How the functional tests were run

There are no Supabase or Gmail credentials for this project, so integrations were exercised against local equivalents:

- **Database:** real PostgreSQL 16 with the migration applied, served through real PostgREST 12.2.3 (the REST layer Supabase uses) with `anon`, `authenticated` and `service_role` roles. RLS and grants were tested for real.
- **Auth:** a small local stand-in that checks a password and issues JWTs. It proves the app's session handling and authorisation logic, **not** Supabase Auth itself.
- **Email:** Nodemailer pointed at a local SMTP capture server via `SMTP_HOST` / `SMTP_PORT`. It proves mail is composed and sent, **not** Gmail delivery.
- **Browser:** headless Chrome driven by Puppeteer at 1440, 1024, 768 and 390 px.

Running the migration this way exposed one real flaw, fixed before delivery: Supabase's default grants would have given `anon` write privileges on the `public_leaderboard` view, which runs with its owner's rights. The migration now revokes everything and grants back only what is needed.

## 8. Functional test results — 77 passed, 0 failed

Line-by-line output: `docs/test-evidence/`. Two failures seen during development were fixed and re-tested (a 10 px horizontal overflow at 390 px; a doubled anchor offset with Lenis). One rate-limit line in the first API run failed only because the previous run had already limited that IP; it passed when re-run with a fresh IP (noted in the evidence file).

| Area | Result |
|---|---|
| RLS and grants, tested directly against PostgREST (anon cannot read enquiries / contributions / private details / admin_users; anon can insert only a default-status enquiry; view returns only published + consented rows with anonymous rows masked; anon cannot update or delete through the view; non-admin login sees nothing and cannot insert or self-promote; admin JWT reads all; the database refuses publish-without-consent even for the service role) | 17 / 17 |
| Enquiry API (field errors 422, bad JSON 400, honeypot stores nothing, valid enquiry stored, email sent with Reply-To = visitor, IP stored only as hash, HTML kept as text, per-email and per-IP limits → 429, enquiry kept and marked `failed` when SMTP is down) | 12 / 12 |
| Admin API and routes without rights (401, redirect to login, private names absent from public HTML) | 3 / 3 |
| Homepage in browser (no console errors, sections in order, Lenis active, anchor animation and landing offset, progress bar, solid nav, scroll reveals, 3 Calendly links with correct URL/new tab/noopener, hero CTA) | 11 / 11 |
| Leaderboard in browser (DB rows, private/anonymous identities hidden, sort toggle, ₹ format) | 4 / 4 |
| Enquiry form in browser (validation errors; success and reset) | 2 / 2 |
| Responsive (no overflow at 390 / 768 / 1024, mobile menu, Escape, 44 px targets) | 6 / 6 |
| Reduced motion (Lenis off, CSS animation off) | 1 / 1 |
| Admin in browser (wrong password; non-admin refused and 403; admin overview totals; publish locked until consent; add / edit / delete; server rejects publish without consent; public wall updates on publish and un-publish; preview; enquiry list, search, filter, status, notes persist, delete; sign-out ends session) | 20 / 20 |
| Whole run: no uncaught browser errors (expected 4xx from negative tests excluded) | 1 / 1 |

Secret scan: the service-role key and mail password do not appear in `.next/static` (client bundles).

## 9. Not tested — do not treat as passed

| Item | Why |
|---|---|
| A real Supabase cloud project | No credentials. The SQL ran on stock PostgreSQL 16 with stand-in `auth` schema and roles. Confirm with `supabase db push`. |
| Real Supabase Auth (login, cookie refresh, invitations) | The auth endpoint was a local stand-in. |
| Real Gmail delivery, spam placement, sending limits | No Gmail credentials; outbound SMTP is blocked here. |
| The Calendly page loading | External sites are blocked here; only the link's URL and attributes were checked. |
| Live deployment | No deployment environment is configured. **Nothing was deployed; there is no live URL.** |
| Lighthouse / Core Web Vitals | Not measured. |
| Safari, Firefox, real phones, screen readers | Only headless Chrome was used. Keyboard and ARIA were checked in code and partly by script. |
| Frame-by-frame animation quality | Verified by state and position checks and still screenshots, not by watching playback. |

## 10. External integrations requiring credentials

| Integration | Status | You provide |
|---|---|---|
| Supabase database + auth | Code complete, not connected | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; run the migration; create the first admin |
| Gmail (Nodemailer) | Code complete, not connected | `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_EMAIL` |
| Calendly | Working link, no credentials | Change `NEXT_PUBLIC_CALENDLY_URL` only if the link changes |
| Hosting | Not deployed | A Vercel (or other Node) account and the domain |

## 11. Known limitations

- The hero sky is a generated image, not a photograph.
- The in-memory rate limiter is per server instance; the database limiter is the durable one.
- The leaderboard page is cached up to 60 s; admin-dashboard changes refresh it immediately, direct SQL edits appear within a minute.
- Sort mode is chosen by each visitor (default: by contribution); there is no stored site-wide default.
- No Open Graph image yet. Instagram and LinkedIn show "coming soon" until set.
- Admin password reset is done from the Supabase dashboard; no in-app reset flow.
- Service-card artwork is original vector illustration, not client-work screenshots.
- Pricing/legal wording has had no CA or legal review; no trademark clearance has been done.

## 12. Exact commands to start

```bash
cd youdecide-studio
npm install
cp .env.example .env.local      # fill in Supabase + Gmail values
npm run dev                     # http://localhost:3000   (admin: /admin/login)

# production
npm run build && npm start
```
