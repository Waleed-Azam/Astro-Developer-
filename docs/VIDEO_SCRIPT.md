# 5-minute video walkthrough — narration script

Total: ~740 words ≈ 5 minutes at ~150 wpm. One audio file per segment.
Voice: English, friendly-professional. Video: `docs/walkthrough.mp4`.

---

## SEGMENT 1 — Intro (title card) [~100 words]

Rebuilding Webflow sites in Astro — without losing the design, the content, or your mind.

Hi, I'm Waleed, an Astro developer, and in the next five minutes I'll walk you through a complete, end-to-end migration demo built on a real production stack: Astro, Cloudflare, Resend, Railway, and GitHub.

Our fictional client is Fjord and Form, an interior architecture studio in Stavanger, Norway. A classic Webflow marketing site: seven page templates, two CMS collections, and a contact form.

Everything you're about to see is running live, and every line of code is in the repo linked below. Let's dive in.

---

## SEGMENT 2 — Homepage tour [~115 words]

This is the homepage — rebuilt section by section from the original Webflow page.

At the top: a sticky, blurring navbar with an accessible mobile menu. Then the hero, with a staggered line-by-line entrance animation that mirrors the old Webflow timeline — but written in thirty lines of CSS, not a four-hundred-kilobyte runtime.

Below that: a client logo marquee that pauses on hover, a studio intro with a stats band, featured projects pulled straight from content collections, a services accordion, an auto-playing testimonial slider with dots and keyboard support, the latest journal posts, and finally a call-to-action band.

Every section you see here maps one-to-one to a section in Webflow. Same design, same content — a fraction of the JavaScript.

---

## SEGMENT 3 — Design parity, minus the runtime [~105 words]

Now, how do you prove a migration is faithful? Class names.

The Webflow style guide was frozen into CSS custom properties — same hex values, same type scale, same spacing. And the Webflow classes were kept one-to-one: heading-xl, button-primary, card, eyebrow. Open DevTools on any page and compare it against the old Webflow export: same structure, no runtime.

All interactions — the mobile menu, scroll reveals, accordion, slider — are one delegated script of about two hundred lines of vanilla JavaScript. Total shipped to the browser: around eight kilobytes. There is literally zero kilobytes of framework.

It also respects reduced-motion preferences and works with JavaScript disabled. Try that with a page builder.

---

## SEGMENT 4 — CMS becomes content collections [~100 words]

Webflow's CMS collections are now Astro content collections — typed Markdown files validated by Zod schemas.

Here are the six projects: each one is a Markdown file with frontmatter for client, location, year, and services. If an editor makes a mistake, the build fails with a clear error instead of silently rendering a broken page.

Click into any project and you get a statically generated case-study page with a related-projects section. Same story for the journal: three articles, dynamic routes, read-next links.

Drafts are branches. Reviews are pull requests. Rollbacks are one click. Content finally lives in Git, where developers can actually work with it.

---

## SEGMENT 5 — Forms that you own [~115 words]

Now the part most migrations get wrong: forms.

This contact form is progressive enhancement done right. It validates inline as you type, includes an invisible honeypot that silently catches bots, and — kill JavaScript entirely — it still submits through a native post. Client and server share the exact same validation rules, so they can never drift apart.

On submit, one Cloudflare function validates the data, sends a transactional email through Resend with reply-to set to the visitor, and backs everything up to a small Railway API — so no enquiry is ever lost, even if email hiccups.

No form-submit tax, no Zapier glue, no third-party silo. And locally, the whole flow runs in mock mode before credentials even exist.

---

## SEGMENT 6 — Deploy and infrastructure [~110 words]

Let's talk infrastructure. The site builds to hybrid output: sixteen static pages served from Cloudflare's edge, plus exactly one server function for the contact form. Static where possible, server where necessary.

The Railway backend is deliberately boring: zero-dependency Node with a health check, an enquiry backup endpoint, and a newsletter signup — CORS-locked to the frontend domains.

And GitHub Actions guards every pull request: type-check, build, verify all routes exist, and fail the build if a single byte of Webflow or jQuery runtime ever leaks into the output.

Every pull request gets its own Cloudflare preview URL. Merging to main deploys to production. And the old Webflow site stays read-only for thirty days as an instant rollback.

---

## SEGMENT 7 — Docs and wrap-up [~95 words]

Finally, the part nobody screenshots but everybody needs: the docs.

The repo ships a full migration playbook — the six-phase system from audit to launch — plus a QA checklist with eight quality gates, an estimation template with a worked example, and the CI workflow and pull-request template that enforce all of it.

Run it yourself in two minutes: install, copy the example env file, start the dev server. Links are in the description.

If you're moving Webflow sites to Astro and want senior-level execution with evidence instead of promises — let's talk. Thanks for watching, and I'll see you in the next one.
