/**
 * Railway backend — small, boring, reliable.
 *
 * Endpoints:
 *  GET  /health            → { ok, uptime, version }            (Railway healthcheck + Cloudflare monitoring)
 *  POST /api/enquiries     → stores a backup copy of each contact-form submission (JSON lines file)
 *  GET  /api/enquiries     → last 50 enquiries (protected by ADMIN_TOKEN) — proves no lead is ever lost
 *  POST /api/newsletter    → newsletter signup with validation + duplicate guard
 *
 * Storage: append-only JSONL file (./data/*.jsonl). For production volume, swap
 * `appendLine` for Postgres (Railway plugin) — the route contracts stay identical.
 *
 * Deploy: connect this folder as a Railway service (railway.toml), set ADMIN_TOKEN.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const PORT = Number(process.env.PORT ?? 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? 'dev-token-change-me';
const VERSION = '1.0.0';
const startedAt = Date.now();

const server = http.createServer(async (req, res) => {
  // CORS: only allow the Cloudflare frontend (+ local dev).
  const allowed = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4321,https://fjord-and-form.demo')
    .split(',').map((s) => s.trim());
  const origin = req.headers.origin ?? '';
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return send(res, 204, '');

  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, { ok: true, version: VERSION, uptimeSec: Math.round((Date.now() - startedAt) / 1000) });
    }
    if (req.method === 'POST' && url.pathname === '/api/enquiries') {
      const body = await readJson(req);
      const errors = validateEnquiry(body);
      if (errors.length) return send(res, 422, { ok: false, errors });
      const record = { id: `enq_${Date.now().toString(36)}`, receivedAt: new Date().toISOString(), ...pick(body, ['name', 'email', 'company', 'budget', 'message', 'source']) };
      appendLine('enquiries.jsonl', record);
      console.log(`[enquiries] backup stored ${record.id} from ${record.email}`);
      return send(res, 201, { ok: true, id: record.id });
    }
    if (req.method === 'GET' && url.pathname === '/api/enquiries') {
      if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return send(res, 401, { ok: false, error: 'Unauthorized' });
      return send(res, 200, { ok: true, items: readLast('enquiries.jsonl', 50) });
    }
    if (req.method === 'POST' && url.pathname === '/api/newsletter') {
      const body = await readJson(req);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(body.email ?? ''))) {
        return send(res, 422, { ok: false, errors: ['Valid email required.'] });
      }
      const existing = readLast('newsletter.jsonl', 5000).some((r) => r.email === body.email);
      if (!existing) appendLine('newsletter.jsonl', { email: body.email, subscribedAt: new Date().toISOString() });
      return send(res, 201, { ok: true, duplicate: existing });
    }
    return send(res, 404, { ok: false, error: 'Not found' });
  } catch (err) {
    console.error('[api:error]', err);
    return send(res, 500, { ok: false, error: 'Internal error' });
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`[api] listening on :${PORT} (data: ${DATA_DIR})`));

// ---- helpers ----
function send(res, status, body) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json' });
  res.end(payload);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1_000_000) reject(new Error('payload too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('invalid JSON')); } });
    req.on('error', reject);
  });
}
function validateEnquiry(b) {
  const errors = [];
  if (!b?.name || String(b.name).trim().length < 2) errors.push('name required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(b?.email ?? ''))) errors.push('valid email required');
  if (!b?.message || String(b.message).trim().length < 5) errors.push('message required');
  return errors;
}
function pick(obj, keys) {
  return Object.fromEntries(keys.map((k) => [k, obj?.[k] ?? null]));
}
function appendLine(file, record) {
  fs.appendFileSync(path.join(DATA_DIR, file), JSON.stringify(record) + '\n');
}
function readLast(file, n) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  const lines = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean);
  return lines.slice(-n).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
