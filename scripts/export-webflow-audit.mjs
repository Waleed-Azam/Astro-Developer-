#!/usr/bin/env node
/**
 * Webflow pre-migration audit — run BEFORE rebuilding anything.
 *
 * Usage:
 *   node scripts/export-webflow-audit.mjs > audit/inventory.md
 *
 * What it does (demo version with realistic sample data):
 *  In a real migration this script crawls the live Webflow sitemap + the
 *  exported CSV collections and prints the inventory we freeze scope against.
 *  The sample data below mirrors the Fjord & Form demo site so you can see
 *  the exact output format without Webflow API keys.
 */
const site = {
  domain: 'fjord-and-form.webflow.io → fjord-and-form.demo',
  pages: [
    { path: '/', sections: ['hero', 'logos', 'intro/stats', 'featured-work', 'services', 'testimonials', 'journal', 'cta'], interactions: ['entrance-timeline', 'marquee', 'counters', 'accordion', 'slider', 'reveals'] },
    { path: '/about', sections: ['page-hero', 'method', 'services-detail'], interactions: ['reveals'] },
    { path: '/work', sections: ['page-hero', 'cms-grid'], interactions: ['reveals'] },
    { path: '/work/:slug (CMS ×6)', sections: ['page-hero', 'cover', 'rich-text', 'next'], interactions: [] },
    { path: '/journal', sections: ['page-hero', 'cms-grid'], interactions: ['reveals'] },
    { path: '/journal/:slug (CMS ×3)', sections: ['page-hero', 'cover', 'rich-text', 'read-next'], interactions: [] },
    { path: '/contact', sections: ['page-hero', 'form', 'sidebar'], interactions: ['form-validation'] },
  ],
  collections: [
    { name: 'Projects', items: 6, fields: ['title', 'client', 'location', 'year', 'services[]', 'cover+alt', 'summary', 'body(rich)'] },
    { name: 'Blog Posts', items: 3, fields: ['title', 'description', 'date', 'author', 'tags[]', 'cover+alt', 'body(rich)'] },
  ],
  forms: [{ name: 'Contact', fields: ['name*', 'email*', 'company', 'budget', 'message*'], notifications: 'hello@… + Zapier → CRM' }],
  embeds: ['Google Fonts (render-blocking)', 'Cookie banner (Osano)', 'GA4 (gtag)'],
  redirectsNeeded: ['/blog/* → /journal/* (collection renamed)', '/projects/* → /work/*'],
};

const lines = [];
lines.push(`# Webflow audit — ${site.domain}`);
lines.push(`_Generated ${new Date().toISOString().slice(0, 10)} · script: scripts/export-webflow-audit.mjs_`);
lines.push('');
lines.push(`## Pages (${site.pages.length} templates)`);
for (const p of site.pages) {
  lines.push(`- \`${p.path}\` — sections: ${p.sections.join(', ')}${p.interactions.length ? ` · IX: ${p.interactions.join(', ')}` : ''}`);
}
lines.push('');
lines.push('## CMS collections');
for (const c of site.collections) lines.push(`- **${c.name}** ×${c.items}: ${c.fields.join(' · ')}`);
lines.push('');
lines.push('## Forms');
for (const f of site.forms) lines.push(`- **${f.name}**: ${f.fields.join(', ')} → ${f.notifications}`);
lines.push('');
lines.push('## Third-party embeds (re-justify each)');
for (const e of site.embeds) lines.push(`- ${e}`);
lines.push('');
lines.push('## Redirects required');
for (const r of site.redirectsNeeded) lines.push(`- ${r}`);
lines.push('');
lines.push('## Risks flagged');
lines.push('- 2 CMS slugs contain Norwegian characters (æ/ø) — slug-normalise + redirect.');
lines.push('- 4 images missing alt text in Webflow — collect before migration or carry over as tech debt.');
lines.push('- Cookie banner must be re-consented post-migration (new domain serving JS).');
console.log(lines.join('\n'));
