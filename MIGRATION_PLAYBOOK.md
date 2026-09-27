# Webflow → Astro Migration Playbook (end-to-end)

The exact system used to build this demo — and proposed as the **internal development system** for ongoing collaboration. Each phase has a goal, concrete steps with commands, a deliverable, and an exit gate. Nothing proceeds on vibes.

---

## §0. Working agreement (how we work — read first)

1. **Single source of truth:** GitHub. `main` is always deployable; work happens in `feat/<page>` branches; every merge needs a PR with screenshots (see `PULL_REQUEST_TEMPLATE.md`).
2. **Ask early:** if a requirement is unclear, ask in the PR/issue within 4 working hours — don't guess and rebuild later. Unclear items are labelled `needs-decision` and never silently resolved.
3. **Flag problems + propose better:** every PR template has a "risks / better solutions" field. Finding a cheaper correct approach is senior behaviour, not scope creep.
4. **Realistic estimates:** ranges + assumptions + explicit buffer (`ESTIMATION_TEMPLATE.md`). Re-estimate visibly at 50%.
5. **Own the quality:** `QA_CHECKLIST.md` is the definition of done. The author runs it before requesting review — reviewers spot-check, not debug.
6. **AI welcome, understanding mandatory:** AI may draft, but every delivered line must be explainable, debuggable and maintainable by the author. No black-box components; comments explain *why*, not *what*. (This matches your AI policy 1:1.)

**Repo conventions:** Astro 4 + TypeScript strict · Cloudflare `hybrid` output · kebab-case routes · Webflow class names preserved · CSS tokens in one file · content in `src/content/` with Zod schemas · secrets only via env (never committed).

---

## Phase 1 — Audit & freeze (½–1 day)

**Goal:** know exactly what we're rebuilding; freeze scope in writing.

1. Get Webflow **read-only link** + CMS CSV exports + form notification settings.
2. Run the audit script and review output:
   ```bash
   node scripts/export-webflow-audit.mjs
   ```
   It inventories pages, sections, interactions, CMS fields, forms, embeds, redirects.
3. Screenshot **every template at 1440 / 768 / 390px** (including menu-open + form-error states — the ones people forget).
4. Freeze the **style guide**: copy every swatch, type style and spacing value into CSS custom properties (`src/styles/global.css :root`). This is the contract visual QA is judged against.
5. Start the **redirect map** NOW (not at launch): list every live URL → new URL. Collection renames (`/blog/* → /journal/*`) and æ/ø/å slugs go here.
6. Flag risks in writing: missing alt text, unverified email domains, embeds that need accounts, CMS items over plan limits.

**Deliverable:** `audit/inventory.md` + screenshot folder + `redirects.csv`.
**Exit gate:** client/lead confirms "yes, this inventory is complete."

---

## Phase 2 — Content migration (½–1 day)

**Goal:** all words and images out of Webflow, typed and versioned.

1. Convert CMS CSVs → Markdown with frontmatter. One file per item: `src/content/projects/<slug>.md`.
2. Define **Zod schemas** first (`src/content/config.ts`) — the schema IS the CMS spec now. Build fails on bad content instead of silently rendering broken pages (a Webflow footgun).
3. Normalise slugs: lowercase, ASCII (`å→a, æ→ae, ø→o`), add old→new rows to the redirect map.
4. Images: export originals → `public/images/`, keep filenames stable, preserve alt text, add `width`/`height` at render time (kills CLS).
5. Rich text: Webflow HTML → Markdown (headings, quotes, lists). Anything exotic (tables, embeds) becomes an Astro component, not raw HTML paste.
6. Spot-check: item counts match CMS (`6 projects, 3 posts` in this demo), random-read 3 items fully.

**Deliverable:** content collections + `astro check` passing on content.
**Exit gate:** `getCollection()` counts equal Webflow counts; zero build warnings.

---

## Phase 3 — Section-by-section rebuild (3–5 days for a site this size)

**Goal:** pixel-faithful pages with 1/10th the JS. Order matters — build the system before the pages.

1. **Base first:** `BaseLayout.astro` (SEO head, fonts, global script) → `Header`/`Footer` → `global.css`. Get ONE page perfect before cloning patterns.
2. **Keep Webflow class names** (`.heading-xl`, `.button-primary`, …). This makes visual regression a real diff instead of a vibe check, and lets anyone cross-reference the old export.
3. **Rebuild interactions in vanilla JS**, one delegated `<script>` in the layout:
   - Navbar/mobile menu (~10 lines), scroll reveals via `IntersectionObserver` (~15 lines), accordion (delegated, ~15 lines), slider with autoplay+dots (~60 lines), marquee (pure CSS).
   - Total for this demo: **~200 lines, 0 dependencies** — vs Webflow's jQuery + IX2 (~400 KB). Every line is explainable in review (AI-policy compliant).
   - Always add `prefers-reduced-motion` fallbacks and keyboard operability (buttons, not divs; `aria-expanded` on toggles).
4. **CMS pages as dynamic routes:** `src/pages/work/[slug].astro` + `getStaticPaths()` (static generation — fastest + cheapest on Cloudflare). Listing pages sort/filter at build time.
5. **Screenshot-compare each template** at 3 breakpoints before moving on. Fix drift immediately; drift compounds.
6. **No-JS pass per page:** disable JS — content, nav and native form POST must still work (progressive enhancement).

**Deliverable:** all templates on a Cloudflare preview URL.
**Exit gate:** side-by-side screenshots approved; `npm run build` green.

---

## Phase 4 — Forms, integrations & deployment (1 day)

**Goal:** every dynamic behaviour owned by us, observable, and failure-tolerant.

### Forms (Webflow Forms → own API)
```
browser ──POST──▶ /api/contact (Cloudflare Function)
                      ├─ validate (shared rules, src/lib/validation.ts)
                      ├─ honeypot (bots → silent fake-success)
                      ├─ Resend → transactional email (reply-to = visitor)
                      └─ Railway → backup log (best-effort, never blocks UX)
```
1. Client + server share `validateContact()` — rules can't drift.
2. **Resend:** verify the sending domain (DNS TXT), store `RESEND_API_KEY` as a Cloudflare secret (never in repo). Local dev runs in **mock mode** (logs instead of sending) so the form is testable pre-credentials.
3. **Railway backup:** `POST /api/enquiries` from the contact function with a 4s timeout; failures are logged, never user-visible. Proves no lead is lost if email hiccups.
4. Hardening (production): add Cloudflare Turnstile (~15 lines) + per-IP rate limit if spam appears. Don't pre-build; add on evidence.

### Deployment
- **Cloudflare Pages:** connect repo → build `npm run build`, output `dist`, Node 20. Every PR gets a preview URL; `main` auto-deploys. Secrets via dashboard (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `RAILWAY_API_URL`).
- **Railway:** service from `/backend`, healthcheck `/health`, vars `ADMIN_TOKEN` + `ALLOWED_ORIGINS` (CORS-locked to the Cloudflare domains).
- **DNS cutover:** Cloudflare proxied; keep Webflow plan read-only 30 days as instant rollback.

**Deliverable:** staging URL + test email received + Railway backup row visible.
**Exit gate:** send a real enquiry end-to-end; kill Railway; send again (must still succeed); restart Railway.

---

## Phase 5 — QA & performance (1–1.5 days)

**Goal:** hand over with evidence, not hope. Run `QA_CHECKLIST.md` in full:

1. **Visual:** 4 breakpoints × every template vs frozen screenshots.
2. **Function:** menu, accordion, slider, form (valid/invalid/no-JS/honeypot), 404.
3. **Browsers:** Chrome, Safari, Firefox + iOS/Android (real devices for the homepage at minimum).
4. **A11y:** keyboard-only pass, focus-visible styles, `aria-expanded`/`aria-label` on controls, reduced-motion.
5. **Perf:** Lighthouse mobile ≥95 perf / ≥95 a11y / 100 SEO; LCP <2s; total JS <50 KB. This demo (measured `dist/_astro/*.js`): **~8 KB, 0 KB framework**.
6. **SEO/redirects:** unique titles/descriptions, canonical, OG unfurl test, sitemap, redirect map spot-checked (10 URLs incl. renamed collections).
7. **Failure drills:** Resend key revoked → friendly error; Railway stopped → form still succeeds.

**Deliverable:** completed checklist in the PR + Lighthouse screenshots.
**Exit gate:** all boxes checked or explicitly waived with reason + owner + date.

---

## Phase 6 — Launch & handover (½ day + 48h watch)

1. Deploy redirects + cut DNS (low-traffic hour). Verify 10 old URLs 301 correctly.
2. Submit sitemap (Search Console), spot-check OG unfurls on Slack/X/LinkedIn.
3. Monitor 48h: Cloudflare analytics + Resend delivery log + Railway logs.
4. Handover pack: repo README, this playbook, redirect map, credentials list (in password manager, never chat), 15-min Loom walkthrough.
5. Schedule a 2-week check-in: rankings/traffic vs pre-launch baseline.

**Deliverable:** live URL + handover pack + monitoring screenshot.
**Exit gate:** client confirms; Webflow downgraded to read-only (rollback retained 30 days).

---

## Appendix — file tree & why

```
src/
  layouts/BaseLayout.astro     # SEO head + header/footer + ONE delegated interaction script
  components/                  # Header, Footer, ContactForm, CtaBand (ex-Webflow symbols)
  content/{projects,journal}/  # ex-CMS collections, typed by Zod
  pages/                       # 1 file per template; [slug].astro = ex-CMS template pages
    api/contact.ts             # ex-Webflow Form → validate → Resend → Railway backup
  lib/                         # validation.ts (shared client+server), resend.ts (mock-aware)
  styles/global.css            # ex-Style-Guide page: tokens + 1:1 class names
backend/                       # Railway: /health, /api/enquiries, /api/newsletter (0 deps)
.github/workflows/ci.yml       # check → build → route smoke test → no-Webflow-JS guard
```

**Why hybrid output?** 99% of pages are static (fastest, cheapest); only `/api/*` runs as Functions. **Why keep Webflow class names?** Diffable parity + zero retraining for anyone reading the old export. **Why vanilla JS?** 200 understandable lines beat 400 KB of runtime for marketing interactions — and any reviewer can explain every line (your AI policy, honoured structurally).
