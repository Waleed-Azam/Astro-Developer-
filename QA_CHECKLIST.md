# QA checklist — run before EVERY handover

No page is "done" until every box is checked or explicitly waived with a reason.
Copy this into the PR description.

## 1. Visual parity (vs Webflow read-only link)
- [ ] Desktop 1440px screenshot matches (spacing, type, colors)
- [ ] Laptop 1024px, tablet 768px, mobile 390px checked
- [ ] Mobile menu open state matches
- [ ] Hover/focus states match (buttons, cards, links)
- [ ] No horizontal scroll at any width 320–1920px

## 2. Content
- [ ] All copy migrated verbatim (or change-logged)
- [ ] CMS counts match (this demo: 6 projects, 3 posts)
- [ ] Every image has alt text (flag any missing from Webflow)
- [ ] Dates, prices, phone numbers, org numbers verified
- [ ] No lorem ipsum / placeholder anywhere (`grep -ri lorem src/`)

## 3. Functionality
- [ ] Nav + mobile menu + footer links all resolve (no 404s)
- [ ] Accordion: single-open, keyboard operable, `aria-expanded` correct
- [ ] Slider: prev/next/dots/autoplay/pause-on-hover
- [ ] Form: valid submit → success; invalid → inline errors; honeypot silently passes
- [ ] Form works with JavaScript DISABLED (native POST)
- [ ] 404 page renders for unknown routes

## 4. Cross-browser & devices
- [ ] Chrome, Safari, Firefox (latest) — layout + interactions
- [ ] iOS Safari + Android Chrome (real device or BrowserStack)
- [ ] Keyboard-only full pass (no mouse)
- [ ] `prefers-reduced-motion` disables animation

## 5. Performance (Lighthouse, mobile, throttled)
- [ ] Performance ≥ 95, Accessibility ≥ 95, SEO = 100
- [ ] LCP < 2.0s, CLS < 0.1, no layout shift on font load
- [ ] Total page JS < 50 KB (justify any exception)
- [ ] Images have width/height (no CLS), lazy below fold

## 6. SEO & redirects
- [ ] Title + meta description unique per page, canonical set
- [ ] OG image unfurls (test with opengraph.xyz)
- [ ] Sitemap + robots.txt correct
- [ ] Redirect map deployed & tested (`/blog/* → /journal/*` etc.)
- [ ] Old Webflow URLs return 301, not 404 (spot-check 10)

## 7. Integrations
- [ ] Resend: test email received, reply-to = visitor, FROM domain verified
- [ ] Railway: enquiry backup logged (`GET /api/enquiries` with token)
- [ ] Resend failure → user sees friendly error, Railway still logs
- [ ] Railway down → form still succeeds (best-effort backup, tested by stopping backend)

## 8. Release hygiene
- [ ] `npm run build` clean, CI green
- [ ] No secrets in repo (`grep -ri "re_[A-Za-z0-9]" src/ backend/` empty)
- [ ] Preview URL shared, staging approved by client
- [ ] Rollback plan noted (Webflow read-only 30 days / Cloudflare instant rollback)
