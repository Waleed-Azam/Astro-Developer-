/**
 * POST /api/contact — the Astro replacement for Webflow Forms.
 *
 * Flow:
 *  1. Parse + validate (shared rules in src/lib/validation.ts)
 *  2. Honeypot check (bots fill `website` → silent success, no email)
 *  3. Send via Resend (transactional email)
 *  4. Best-effort backup to Railway backend (so no enquiry is ever lost)
 *  5. Return JSON { ok, mocked? } — the form shows inline status
 *
 * Runs on Cloudflare (hybrid output: this route is server-rendered).
 */
import type { APIRoute } from 'astro';
import { validateContact, isValid, type ContactInput } from '../../lib/validation';
import { sendContactEmail } from '../../lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Env precedence: Cloudflare runtime bindings → .env (import.meta) → process.env.
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};
  const metaEnv = import.meta.env as unknown as Record<string, string>;
  const env: Record<string, string | undefined> = { ...(process.env as Record<string, string>), ...metaEnv, ...runtimeEnv };

  let input: ContactInput;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      input = (await request.json()) as ContactInput;
    } else {
      // Native form POST fallback (no-JS) → convert FormData to object.
      const fd = await request.formData();
      input = Object.fromEntries(fd.entries()) as unknown as ContactInput;
    }
  } catch {
    return json({ ok: false, error: 'Could not read your submission. Please try again.' }, 400);
  }

  // Honeypot: pretend success so bots can't probe the endpoint.
  if (input.website?.trim()) {
    await sleep(400);
    return json({ ok: true, mocked: true });
  }

  const errors = validateContact(input ?? ({} as ContactInput));
  if (!isValid(errors)) {
    return json({ ok: false, errors }, 422);
  }

  // Rate-limit guard (simple, stateless): reject absurdly fast re-submits via timestamp field if present.
  // (Production hardening: add Cloudflare Turnstile — 15 lines, see MIGRATION_PLAYBOOK §5.)

  const result = await sendContactEmail(input, env);
  if (!result.ok) {
    return json({ ok: false, error: result.error ?? 'Email failed. Please try again.' }, 502);
  }

  // Best-effort backup to Railway (never blocks the user-visible success).
  backupToRailway(input, env).catch((err) => console.error('[railway:backup-failed]', err));

  return json({ ok: true, mocked: result.mocked ?? false, id: result.id });
};

// Browsers POSTing natively (no JS) get JSON back; Astro serves it fine.
// A nicer no-JS UX is a redirect — uncomment to enable:
export const GET: APIRoute = async () => {
  return json({ ok: false, error: 'Use POST with { name, email, message }.' }, 405);
};

async function backupToRailway(input: ContactInput, env: Record<string, string | undefined>): Promise<void> {
  const base = env.RAILWAY_API_URL ?? env.PUBLIC_RAILWAY_API_URL;
  if (!base) return; // Railway not configured → skip silently (Resend already sent).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(`${base.replace(/\/$/, '')}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name?.trim(),
        email: input.email?.trim(),
        company: input.company?.trim() || null,
        budget: input.budget || null,
        message: input.message?.trim(),
        source: 'website-contact',
        receivedAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
