# Estimation template — realistic, reviewable, buffer-explicit

Every estimate uses **ranges** (not single numbers), names **assumptions**, and shows the **buffer**. A client should be able to argue with it — that's the point.

## Format

| Work package | Low–High (hrs) | Assumption |
|---|---|---|
| Audit + token freeze + redirect map | 4–6 | Read-only Webflow link + CMS export provided day 1 |
| Base (layout, header, footer, CSS system) | 6–10 | Style guide page exists; else +4h to derive tokens |
| Per marketing page (hero→CTA) | 4–8 | 6–10 sections; custom IX at high end |
| Per CMS template (listing + detail) | 6–10 | Includes Zod schema + Markdown conversion |
| Interactions pack (menu/accordion/slider/reveals) | 4–6 | Vanilla JS; +4h if Webflow IX is timeline-heavy |
| Form + Resend + Railway backup + Turnstile | 5–8 | Resend domain already verified; else +2h DNS |
| QA pass (checklist) + fixes | 6–10 | 3 browsers × 4 breakpoints + a11y |
| Launch (DNS, redirects, monitoring, handover) | 3–5 | Cloudflare access granted; else +2h coordination |
| **Subtotal** | **—** | |
| Buffer (15–20%, explicit) | — | Scope fuzz, feedback rounds, embed surprises |
| **Total** | **low–high** | |

## Worked example — this demo site (7 templates, 2 collections, 1 form)

Subtotal 38–63h → +20% buffer → **46–76h ≈ 6–10 working days**.
Actual build order: audit (0.5d) → base+CSS (1d) → home (1.5d) → CMS (1.5d) → inner pages (1d) → forms/integrations (1d) → QA+launch (1.5d).

## Rules

1. **Never estimate from screenshots alone** — need read-only link or export.
2. **Flag the top 3 risks with cost if they materialise** (e.g. "unverified Resend domain: +2h").
3. **Re-estimate at 50%** — compare actuals, update the range, communicate early.
4. **Fixed-price from the high end**, hourly from actuals. Say which one the quote is.
5. **Questions beat padding** — ask what's unclear instead of hiding 10h "misc".
