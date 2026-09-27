# Application kit — copy/paste answers for the 4 questions

Tailor the bracketed parts. Every claim links to runnable proof in this repo.

---

## 1. Two or three relevant projects (Astro) + my personal contribution

**A. Fjord & Form — Webflow → Astro migration (this demo, built end-to-end by me)**
7 templates, 2 CMS collections → typed Markdown, vanilla-JS interactions (~200 lines, 0 deps), contact API → Resend + Railway backup, Cloudflare hybrid deploy, CI with no-Webflow-JS guard. JS 412 KB → ~8 KB (measured).
Proof: this repo + live preview URL + `/migration` case file. I did everything: audit script, CSS system, all routes, API, backend, playbook, QA list.

**B. [Your real project 1 — e.g. SaaS marketing site in Astro]**
[1–2 lines: what it was, scale.] My part: [e.g. rebuilt 12 Webflow pages, built MDX docs, cut LCP 3.1→1.2s, set up Cloudflare previews.] Link: [URL/repo].

**C. [Your real project 2 — e.g. Astro + CMS + forms]**
[1–2 lines.] My part: [e.g. owned forms → Resend, Turnstile anti-spam, Railway service for X.] Link: [URL/repo].

> Tip: if you're light on public Astro work, lead with this demo (it's deep and reviewable) and frame B/C as adjacent experience (React/Next/Webflow). Honesty + proof beats padding.

---

## 2. Experience with Cloudflare and Railway

**Cloudflare:** [adjust to truth] Pages (build `npm run build` → `dist`, Node 20, preview-per-PR), Functions via Astro's Cloudflare adapter (`hybrid` output — static pages + `/api/*` server routes), secrets via dashboard (`RESEND_API_KEY` etc.), DNS + proxied cutover with 30-day Webflow rollback, wrangler for deploys/previews. See `astro.config.mjs`, `wrangler.toml`, `.github/workflows/ci.yml` in this repo.

**Railway:** [adjust] Node services from monorepo subfolders (`backend/railway.toml`), `/health` healthchecks, env-var config (`ADMIN_TOKEN`, `ALLOWED_ORIGINS`), CORS-locked to Cloudflare domains, JSONL→Postgres upgrade path documented. This demo's backend is zero-dependency Node (`backend/src/index.js`) with enquiry backup + newsletter endpoints.

**Resend (bonus, in your stack):** domain verification, `reply-to` = visitor, mock-mode local dev, failure UX (friendly error + Railway still logs). See `src/lib/resend.ts`.

---

## 3. How I'd approach migrating a Webflow site to Astro (brief version)

> Full version: `MIGRATION_PLAYBOOK.md` + the `/migration` page — this is the summary.

1. **Audit & freeze** — crawl sitemap/CMS/forms/embeds into a written inventory (`scripts/export-webflow-audit.mjs`); screenshot every breakpoint; freeze the style guide into CSS tokens; start the redirect map on day one.
2. **Content first** — CMS → typed Markdown collections (Zod schemas so bad content fails the build, not the page); normalise slugs; preserve alt text.
3. **Rebuild section-by-section** — base (layout/header/footer/CSS) → home → CMS templates → inner pages, keeping Webflow class names 1:1 so parity is diffable; interactions rewritten in ~200 lines of vanilla JS (no runtime).
4. **Forms & integrations** — Webflow Forms → `/api/contact` (shared validation, honeypot) → Resend email + Railway backup; every embed re-justified or removed.
5. **QA with evidence** — 4 breakpoints × 3 browsers, keyboard-only, Lighthouse ≥95, redirect spot-checks, failure drills (kill Railway, revoke Resend) — all in `QA_CHECKLIST.md`.
6. **Launch & handover** — Cloudflare cutover, 48h monitoring, Webflow read-only 30 days as rollback, handover pack + Loom.

Fixed scope from the audit, ranges + explicit buffer on estimates, and I flag risks in writing instead of padding silently.

---

## 4. Availability

> I'm available **[X days/week | from DATE]**, typically **[e.g. 20–30 hrs/week]**, overlapping **[e.g. 09:00–15:00 CET]** for standups/reviews. First response within one working day; PRs include screenshots + verification notes so reviews are fast. Happy to start with one migration as a paid trial, then scale to ongoing work.

---

## Suggested cover note (short)

> Hi — I'm an Astro developer specialising in Webflow migrations. Rather than describing my process, I built it: a complete Webflow→Astro rebuild on your exact stack (Astro · Cloudflare · Resend · Railway · GitHub) with the migration playbook, QA checklist and estimation template I work from. [Preview URL] · [Repo] · `/migration` walks through the method. Details per your four questions below. — [Name]
