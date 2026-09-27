---
title: "We moved our site from Webflow to Astro — here's the honest report"
description: "Same design, 1/5th the JavaScript, full control of forms. What we kept, what we rebuilt, and what we'd do differently."
pubDate: 2026-06-02
author: "Ingrid Fjord"
tags: ["Process", "Web", "Astro"]
cover: "/images/journal-webflow.svg"
coverAlt: "Webflow to Astro migration diagram"
---

Webflow got us far. We built our first three sites in it, and the designer-to-publish loop is still unmatched for speed. But as the studio grew, three frictions kept surfacing:

1. **Forms** — every submission lived in Webflow's silo; piping them to our inbox + CRM needed Zapier glue.
2. **CMS limits** — 10,000 items sounds like a lot until translations and drafts multiply it.
3. **Performance ceiling** — great scores were possible, but every embed and interaction fought us.

## What we kept 1:1

The design system transferred class-for-class: same spacing scale, same type scale, same page structure. We exported the style guide, froze it as CSS custom properties, and screenshotted every breakpoint for visual regression.

## What got better

- **JavaScript:** 412 KB → ~8 KB on the homepage (all interactions rewritten in ~200 lines of vanilla JS).
- **Forms:** native POST to our own API → Resend email + Railway backup. No third-party form tax.
- **Content:** Markdown in Git. Drafts are branches; reviews are pull requests; rollbacks are one click.

## What we'd do differently

Start the redirect map on day one, not week three. And screenshot the *mobile menu open state* — it's the one thing we forgot to spec and had to redo.

Full method in our [migration notes](/migration).
