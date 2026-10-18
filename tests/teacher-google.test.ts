// Tes alur akun guru + Google. Google (tokeninfo) disimulasikan lewat fetch palsu; SQL memakai SQLite sungguhan.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeD1 } from './fakeD1';
import { getTeacherIdentity, handleClasses, handleSync, type Env } from '../server/core';
import {
  handleTeacherAccountLogin, handleTeacherGoogleConfig, handleTeacherGoogleLogin, handleTeacherRegister,
} from '../server/teacher-accounts';

const CLIENT_ID = 'uji-123.apps.googleusercontent.com';
const SECRET = 'rahasia-uji-yang-cukup-panjang-1234567890';
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function makeEnv(extra: Partial<Env> = {}): Env & { DB: ReturnType<typeof createFakeD1> } {
  return { DB: createFakeD1(), TEACHER_USERNAME: 'admin-env', TEACHER_SESSION_SECRET: SECRET, GOOGLE_CLIENT_ID: CLIENT_ID, ...extra };
}
/** Kredensial palsu berbentuk JWT (3 bagian, > 100 karakter). `tag` membedakan satu akun dengan lainnya. */
const cred = (tag: string) => `${'h'.repeat(40)}${tag}.${'p'.repeat(60)}${tag}.${'s'.repeat(20)}`;
type Claims = Record<string, unknown>;
const claims = (sub: string, email: string, extra: Claims = {}): Claims => ({
  aud: CLIENT_ID, sub, email, email_verified: 'true', iss: 'https://accounts.google.com', exp: String(Math.floor(Date.now() / 1000) + 3000), ...extra,
});
function mockGoogle(table: Record<string, Claims | 'network' | 'busy'>) {
  globalThis.fetch = (async (url: any) => {
    const id = new URL(String(url)).searchParams.get('id_token') || '';
    const entry = table[id];
    if (entry === 'network') throw new Error('offline');
    if (entry === 'busy') return new Response('{}', { status: 503 });
    if (!entry) return new Response(JSON.stringify({ error_description: 'Invalid Value' }), { status: 400 });
    return new Response(JSON.stringify(entry), { status: 200 });
  }) as typeof fetch;
}
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://x/api/${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
const register = (env: Env, credential: string, username = 'bu.sari', password = 'sandi-panjang-123') =>
  handleTeacherRegister(post('teacher-register', { credential, username, password, confirmPassword: password }), env);

test('konfigurasi: tanpa Client ID 503; migrasi belum jalan dilaporkan; konfigurasi lengkap siap', async () => {
  const noId = await handleTeacherGoogleConfig(new Request('http://x/api/teacher-google-config'), makeEnv({ GOOGLE_CLIENT_ID: '' }));
  assert.equal(noId.status, 503);

  const unmigrated = makeEnv();
  unmigrated.DB.raw.exec('DROP TABLE teacher_accounts');
  const bad = await (await handleTeacherGoogleConfig(new Request('http://x/api/teacher-google-config'), unmigrated)).json() as any;
  assert.equal(bad.ready, false);
  assert.match(bad.problems.join(' '), /migrasi/i);

  const ok = await (await handleTeacherGoogleConfig(new Request('http://x/api/teacher-google-config'), makeEnv())).json() as any;
  assert.equal(ok.ready, true);
  assert.equal(ok.clientId, CLIENT_ID);
});

test('daftar dengan Google valid: akun tersimpan, token sesi sah atas nama username', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'Sari@Sekolah.id') });
  const res = await register(env, cred('a'));
  assert.equal(res.status, 201);
  const body = await res.json() as any;
  assert.equal(body.username, 'bu.sari');
  const identity = await getTeacherIdentity(env, new Request('http://x', { headers: { Authorization: `Bearer ${body.token}` } }));
  assert.equal(identity, 'bu.sari');
  const row = env.DB.raw.prepare('SELECT google_email, password_hash FROM teacher_accounts').get() as any;
  assert.equal(row.google_email, 'sari@sekolah.id');
  assert.match(row.password_hash, /^pbkdf2-sha256\$/);
  assert.ok(!JSON.stringify(row).includes('sandi-panjang-123'), 'kata sandi tidak boleh tersimpan polos');
});

test('Client ID server dengan spasi/kutip tetap cocok dengan aud Google', async () => {
  const env = makeEnv({ GOOGLE_CLIENT_ID: `  "${CLIENT_ID}"  ` });
  mockGoogle({ [cred('q')]: claims('sub-q', 'q@x.id') });
  assert.equal((await register(env, cred('q'))).status, 201);
});

test('pendaftaran ditolak untuk Google tidak sah: aud salah, kedaluwarsa, email belum terverifikasi, token ditolak', async () => {
  const env = makeEnv();
  mockGoogle({
    [cred('1')]: claims('s1', 'a@x.id', { aud: 'client-lain' }),
    [cred('2')]: claims('s2', 'b@x.id', { exp: String(Math.floor(Date.now() / 1000) - 10) }),
    [cred('3')]: claims('s3', 'c@x.id', { email_verified: 'false' }),
    [cred('4')]: claims('s4', 'd@x.id', { iss: 'https://penipu.example' }),
  });
  for (const tag of ['1', '2', '3', '4', 'tidak-dikenal']) {
    const res = await register(env, cred(tag), `guru${tag.slice(0, 1)}x`);
    assert.equal(res.status, 401, `tag ${tag}`);
  }
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM teacher_accounts').get().n, 0);
  assert.equal((await register(env, 'bukan-jwt', 'guruzzz')).status, 401);
});

test('gangguan jaringan/Google dilaporkan 502 dengan pesan jelas, bukan "verifikasi gagal" umum', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('n')]: 'network', [cred('b')]: 'busy' });
  const net = await register(env, cred('n'));
  assert.equal(net.status, 502);
  assert.match((await net.json() as any).error, /menghubungi Google/);
  assert.equal((await register(env, cred('b'))).status, 502);
});

test('username admin dari environment dicadangkan; duplikat akun Google/username ditolak', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id'), [cred('b')]: claims('sub-b', 'b@x.id'), [cred('c')]: claims('sub-c', 'c@x.id') });
  assert.equal((await register(env, cred('a'), 'ADMIN-ENV')).status, 409);
  assert.equal((await register(env, cred('a'), 'guru.a')).status, 201);
  assert.equal((await register(env, cred('a'), 'guru.lain')).status, 409); // akun Google sama
  assert.equal((await register(env, cred('b'), 'GURU.A')).status, 409); // username sama (tak peka huruf besar)
  assert.equal((await register(env, cred('c'), 'guru.c')).status, 201);
});

test('validasi isian: username, panjang kata sandi, konfirmasi', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id') });
  assert.equal((await register(env, cred('a'), 'a b')).status, 400);
  assert.equal((await register(env, cred('a'), 'guru.a', 'pendek')).status, 400);
  const mismatch = await handleTeacherRegister(post('teacher-register', { credential: cred('a'), username: 'guru.a', password: 'sandi-panjang-123', confirmPassword: 'beda-sandi-123' }), env);
  assert.equal(mismatch.status, 400);
});

test('login Google: akun terdaftar masuk, yang belum terdaftar 404, kredensial palsu 401', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id'), [cred('z')]: claims('sub-z', 'z@x.id') });
  await register(env, cred('a'), 'guru.a');
  const ok = await handleTeacherGoogleLogin(post('teacher-google-auth', { credential: cred('a') }), env);
  assert.equal(ok.status, 200);
  assert.equal((await ok.json() as any).username, 'guru.a');
  assert.equal((await handleTeacherGoogleLogin(post('teacher-google-auth', { credential: cred('z') }), env)).status, 404);
  assert.equal((await handleTeacherGoogleLogin(post('teacher-google-auth', { credential: cred('palsu') }), env)).status, 401);
  assert.equal((await handleTeacherGoogleLogin(new Request('http://x/api/teacher-google-auth'), env)).status, 405);
});

test('login username + kata sandi untuk akun terdaftar', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id') });
  await register(env, cred('a'), 'guru.a', 'sandi-panjang-123');
  const login = (username: string, password: string) => handleTeacherAccountLogin(post('teacher-auth', { username, password }), env);
  assert.equal((await login('GURU.A', 'sandi-panjang-123')).status, 200);
  assert.equal((await login('guru.a', 'salah-salah-123')).status, 401);
  assert.equal((await login('tidak-ada', 'sandi-panjang-123')).status, 401);
});

test('migrasi belum dijalankan: pesan jelas (503), bukan error 500 buram', async () => {
  const env = makeEnv();
  env.DB.raw.exec('DROP TABLE teacher_accounts');
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id') });
  const reg = await register(env, cred('a'));
  assert.equal(reg.status, 503);
  assert.match((await reg.json() as any).error, /db:migrate:local/);
  const gl = await handleTeacherGoogleLogin(post('teacher-google-auth', { credential: cred('a') }), env);
  assert.equal(gl.status, 503);
});

test('data antar guru terpisah: kelas dan ID kelompok guru A tidak terlihat oleh guru B', async () => {
  const env = makeEnv();
  mockGoogle({ [cred('a')]: claims('sub-a', 'a@x.id'), [cred('b')]: claims('sub-b', 'b@x.id') });
  const tokenA = (await (await register(env, cred('a'), 'guru.a')).json() as any).token as string;
  const tokenB = (await (await register(env, cred('b'), 'guru.b')).json() as any).token as string;
  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  const created = await handleClasses(post('classes', { name: 'Kelas 5A' }, auth(tokenA)), env);
  assert.equal(created.status, 201);
  const listA = await (await handleClasses(new Request('http://x/api/classes', { headers: auth(tokenA) }), env)).json() as any;
  const listB = await (await handleClasses(new Request('http://x/api/classes', { headers: auth(tokenB) }), env)).json() as any;
  assert.equal(listA.classes.length, 1);
  assert.equal(listB.classes.length, 0);

  const save = await handleSync(post('sync', { upsertTokens: [{ id: 't1', code: 'KPK-AAA-111', status: 'available' }] }, auth(tokenA)), env);
  assert.equal(save.status, 200);
  const seenB = await (await handleSync(new Request('http://x/api/sync', { headers: auth(tokenB) }), env)).json() as any;
  assert.equal(seenB.tokens.length, 0);
  const seenA = await (await handleSync(new Request('http://x/api/sync', { headers: auth(tokenA) }), env)).json() as any;
  assert.equal(seenA.tokens.length, 1);
});
