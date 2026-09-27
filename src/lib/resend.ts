/**
 * Resend email helper — runs on Cloudflare (fetch-based, no Node SMTP).
 * In local dev without a key it logs instead of sending (mock mode),
 * so the demo form works end-to-end before credentials exist.
 */
import type { ContactInput } from './validation';

export interface SendResult { ok: boolean; id?: string; mocked?: boolean; error?: string }

export async function sendContactEmail(input: ContactInput, env: Record<string, string | undefined>): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL ?? 'hello@example.com';
  const from = env.CONTACT_FROM_EMAIL ?? 'website@fjord-and-form.demo';

  const subject = `New project enquiry — ${input.name.trim()}${input.company?.trim() ? ` (${input.company.trim()})` : ''}`;
  const text =
    `Name: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company || '—'}\nBudget: ${input.budget || '—'}\n\n${input.message}\n`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2 style="margin:0 0 8px">New project enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}<br/>
      <strong>Email:</strong> ${escapeHtml(input.email)}<br/>
      <strong>Company:</strong> ${escapeHtml(input.company || '—')}<br/>
      <strong>Budget:</strong> ${escapeHtml(input.budget || '—')}</p>
      <hr/><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </div>`.trim();

  // Mock mode: no key → don't fail the demo, just log.
  if (!apiKey || apiKey.includes('demo') || apiKey.includes('replace_me')) {
    console.log('[resend:mock] Would send email:', { to, from, subject, text: text.slice(0, 200) });
    return { ok: true, mocked: true, id: `mock_${Date.now()}` };
  }

  // Real send via Resend REST API (works on Cloudflare Workers — plain fetch).
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: input.email.trim(), subject, text, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    console.error('[resend:error]', res.status, detail);
    return { ok: false, error: `Email provider error (${res.status}). Please try again or email us directly.` };
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
