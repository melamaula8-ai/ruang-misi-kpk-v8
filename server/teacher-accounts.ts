import { issueTeacherToken, type Env } from './core';
const encoder = new TextEncoder();
const ITERATIONS = 100000;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const b64 = (bytes: Uint8Array) => { let raw = ''; for (const b of bytes) raw += String.fromCharCode(b); return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); };
const un64 = (value: string) => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));
async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)));
}
async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256$${ITERATIONS}$${b64(salt)}$${await derive(password, salt, ITERATIONS)}`;
}
async function verifyPassword(password: string, encoded: string) {
  try {
    const [algorithm, countText, saltText, digest] = encoded.split('$');
    const iterations = Number(countText);
    if (algorithm !== 'pbkdf2-sha256' || !Number.isInteger(iterations) || iterations < 100000 || iterations > 600000 || !saltText || !digest) return false;
    const a = encoder.encode(await derive(password, un64(saltText), iterations));
    const b = encoder.encode(digest); let diff = a.length ^ b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
    return diff === 0;
  } catch { return false; }
}
/** Client ID dari environment sering terbawa spasi/kutip saat disalin ke dashboard; bersihkan agar `aud` cocok. */
export function googleClientId(env: Env): string {
  return (env.GOOGLE_CLIENT_ID || '').trim().replace(/^["']+|["']+$/g, '').trim();
}
type GoogleIdentity = { sub: string; email: string };
type GoogleResult = ({ ok: true } & GoogleIdentity) | { ok: false; status: 400 | 401 | 502; error: string };
const googleFail = (status: 400 | 401 | 502, error: string): GoogleResult => ({ ok: false, status, error });

async function verifyGoogleCredential(credential: unknown, env: Env): Promise<GoogleResult> {
  const clientId = googleClientId(env);
  if (!clientId) return googleFail(400, 'GOOGLE_CLIENT_ID belum diisi pada konfigurasi server.');
  if (typeof credential !== 'string' || credential.length < 100 || credential.length > 10000 || credential.split('.').length !== 3) {
    return googleFail(401, 'Verifikasi Google gagal. Klik tombol Google dan pilih akun terlebih dahulu.');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { signal: controller.signal });
  } catch {
    return googleFail(502, 'Server tidak dapat menghubungi Google untuk memeriksa akun. Periksa koneksi internet lalu coba lagi.');
  } finally { clearTimeout(timer); }
  if (response.status === 429 || response.status >= 500) return googleFail(502, 'Layanan verifikasi Google sedang sibuk. Coba lagi beberapa saat lagi.');
  if (!response.ok) return googleFail(401, 'Token Google ditolak atau sudah kedaluwarsa. Klik tombol Google dan pilih akun lagi.');
  let data: { aud?: string; sub?: string; email?: string; email_verified?: string | boolean; iss?: string; exp?: string | number };
  try { data = await response.json() as typeof data; } catch { return googleFail(502, 'Jawaban Google tidak dapat dibaca. Coba lagi.'); }
  if (data.aud !== clientId) return googleFail(401, 'Google Client ID di server tidak sama dengan Client ID yang dipakai tombol Google. Periksa GOOGLE_CLIENT_ID.');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(data.iss || '')) return googleFail(401, 'Penerbit token Google tidak sah.');
  if (data.exp !== undefined && Number(data.exp) * 1000 <= Date.now()) return googleFail(401, 'Token Google sudah kedaluwarsa. Klik tombol Google lagi.');
  if (!data.sub || !data.email || !data.email.includes('@')) return googleFail(401, 'Data akun Google tidak lengkap.');
  if (![true, 'true'].includes(data.email_verified as any)) return googleFail(401, 'Email Google belum terverifikasi.');
  return { ok: true, sub: data.sub, email: data.email.trim().toLowerCase() };
}
function validUsername(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9_.-]{3,30}$/.test(value.trim()); }
function validPassword(value: unknown): value is string { return typeof value === 'string' && value.length >= 10 && value.length <= 128; }
/** Username admin dari environment dicadangkan: akun terdaftar tidak boleh memakainya (akan mewarisi data admin). */
function isReservedUsername(username: string, env: Env): boolean {
  const reserved = (env.TEACHER_USERNAME || '').trim().toLowerCase();
  return Boolean(reserved) && username.trim().toLowerCase() === reserved;
}
const MIGRATION_HINT = 'Tabel akun guru belum ada. Jalankan "npm run db:migrate:local" (lokal) atau terapkan migrasi 0001–0003 pada D1 (produksi).';
const isMissingTable = (error: unknown) => /no such table|no such column/i.test(String((error as any)?.message ?? error));

/** Dipakai UI untuk menampilkan tombol Google sekaligus menjelaskan konfigurasi yang masih kurang. */
export async function handleTeacherGoogleConfig(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const clientId = googleClientId(env);
  if (!clientId) return json({ error: 'GOOGLE_CLIENT_ID belum dikonfigurasi pada server.' }, 503);
  const problems: string[] = [];
  if (!env.TEACHER_SESSION_SECRET) problems.push('TEACHER_SESSION_SECRET belum diisi pada server.');
  if (!env.DB) problems.push('Binding database D1 bernama "DB" belum tertaut.');
  else {
    try { await env.DB.prepare('SELECT 1 AS ok FROM teacher_accounts LIMIT 1').first(); }
    catch { problems.push(MIGRATION_HINT); }
  }
  return json({ clientId, ready: problems.length === 0, problems });
}
async function accountByGoogle(env: Env, credential: unknown) {
  const google = await verifyGoogleCredential(credential, env);
  if (!google.ok) return { error: google.error, status: google.status };
  try {
    const account = await env.DB.prepare('SELECT username, google_email FROM teacher_accounts WHERE google_sub = ? OR google_email = ? COLLATE NOCASE LIMIT 1').bind(google.sub, google.email).first<{ username: string; google_email: string }>();
    if (!account) return { error: 'Akun Google ini belum terdaftar. Pilih Daftar Akun terlebih dahulu.', status: 404 as const };
    if (isReservedUsername(account.username, env)) return { error: 'Username akun ini dicadangkan untuk admin. Hubungi pengelola aplikasi.', status: 403 as const };
    return { account, google };
  } catch (error) {
    return isMissingTable(error) ? { error: MIGRATION_HINT, status: 503 as const } : { error: 'Login Google belum dapat diproses. Coba lagi.', status: 500 as const };
  }
}
export async function handleTeacherRegister(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.DB || !googleClientId(env) || !env.TEACHER_SESSION_SECRET) return json({ error: 'Konfigurasi database, Google Client ID, atau sesi guru belum lengkap.' }, 503);
  let body: any; try { body = await request.json(); } catch { return json({ error: 'Data pendaftaran tidak valid.' }, 400); }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  if (!validUsername(username)) return json({ error: 'Username harus 3–30 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.' }, 400);
  if (!validPassword(body.password)) return json({ error: 'Kata sandi harus 10–128 karakter.' }, 400);
  if (body.password !== body.confirmPassword) return json({ error: 'Konfirmasi kata sandi tidak sama.' }, 400);
  if (isReservedUsername(username, env)) return json({ error: 'Username ini dicadangkan untuk admin. Gunakan username lain.' }, 409);
  const google = await verifyGoogleCredential(body.credential, env);
  if (!google.ok) return json({ error: google.error }, google.status);
  try {
    const exists = await env.DB.prepare('SELECT username FROM teacher_accounts WHERE google_sub = ? OR google_email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE LIMIT 1').bind(google.sub, google.email, username).first();
    if (exists) return json({ error: 'Akun Google atau username sudah terdaftar. Silakan login atau gunakan username lain.' }, 409);
    await env.DB.prepare('INSERT INTO teacher_accounts (google_sub, google_email, username, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').bind(google.sub, google.email, username, await hashPassword(body.password), new Date().toISOString()).run();
    return json({ token: await issueTeacherToken(env, username), expiresIn: SESSION_TTL_SECONDS, username }, 201);
  } catch (error) {
    if (/unique|constraint/i.test(String(error))) return json({ error: 'Akun Google atau username sudah terdaftar.' }, 409);
    console.error('[teacher-register] gagal menyimpan akun:', String(error));
    if (isMissingTable(error)) return json({ error: MIGRATION_HINT }, 503);
    return json({ error: 'Akun belum dapat disimpan. Coba lagi beberapa saat.' }, 500);
  }
}
export async function handleTeacherAccountLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.DB || !env.TEACHER_SESSION_SECRET) return json({ error: 'Konfigurasi database atau sesi guru belum tersedia.' }, 503);
  let body: any; try { body = await request.json(); } catch { return json({ error: 'Data login tidak valid.' }, 400); }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!username || !password || username.length > 30 || password.length > 128) return json({ error: 'Username atau kata sandi tidak sesuai.' }, 401);
  try {
    const account = await env.DB.prepare('SELECT username, password_hash FROM teacher_accounts WHERE username = ? COLLATE NOCASE LIMIT 1').bind(username).first<{ username: string; password_hash: string }>();
    if (!account || !(await verifyPassword(password, account.password_hash))) return json({ error: 'Username atau kata sandi tidak sesuai.' }, 401);
    return json({ token: await issueTeacherToken(env, account.username), expiresIn: SESSION_TTL_SECONDS, username: account.username });
  } catch (error) {
    if (isMissingTable(error)) return json({ error: MIGRATION_HINT }, 503);
    return json({ error: 'Login belum dapat diproses. Coba lagi beberapa saat.' }, 500);
  }
}
export async function handleTeacherGoogleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!env.DB || !googleClientId(env) || !env.TEACHER_SESSION_SECRET) return json({ error: 'Konfigurasi Google atau sesi guru belum tersedia.' }, 503);
  let body: any; try { body = await request.json(); } catch { return json({ error: 'Data Google tidak valid.' }, 400); }
  const result = await accountByGoogle(env, body.credential);
  if ('error' in result) return json({ error: result.error }, result.status);
  return json({ token: await issueTeacherToken(env, result.account.username), expiresIn: SESSION_TTL_SECONDS, username: result.account.username });
}
