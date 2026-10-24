import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createFakeD1 } from './fakeD1';
import { handleSync, handleTeacherAuth, handleClasses, handleGroupToken, issueTeacherToken, type Env } from '../server/core';

const SECRET = 'rahasia-uji-yang-cukup-panjang-1234567890';

test('migrasi sesi mempertahankan kelompok lama dan hanya menghubungkan classId yang terbukti', () => {
  const db = new DatabaseSync(':memory:');
  for (const migration of ['0001_init.sql', '0002_classes.sql', '0003_teacher_accounts_ownership.sql']) {
    db.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'));
  }
  db.prepare("INSERT INTO classes (id, teacher_username, name, join_code, status, created_at) VALUES ('class-known', 'guru', 'Kelas Lama', 'KELAS-LAMA1', 'active', 1)").run();
  db.prepare("INSERT INTO group_tokens (id, code, status, data, updated_at, owner_id) VALUES ('group-known', 'KPK-LAMA-111', 'available', ?, 1, 'guru')")
    .run(JSON.stringify({ id: 'group-known', code: 'KPK-LAMA-111', classId: 'class-known' }));
  db.prepare("INSERT INTO group_tokens (id, code, status, data, updated_at, owner_id) VALUES ('group-unmapped', 'KPK-LAMA-222', 'available', ?, 1, 'guru')")
    .run(JSON.stringify({ id: 'group-unmapped', code: 'KPK-LAMA-222', classId: 'class-missing' }));
  db.exec(readFileSync(new URL('../migrations/0004_exam_sessions.sql', import.meta.url), 'utf8'));
  assert.equal((db.prepare("SELECT session_id FROM group_tokens WHERE id = 'group-known'").get() as any).session_id, 'class-known');
  assert.equal((db.prepare("SELECT session_id FROM group_tokens WHERE id = 'group-unmapped'").get() as any).session_id, null);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM group_tokens').get() as any).n, 2);
  db.close();
});
function makeEnv(): Env & { DB: ReturnType<typeof createFakeD1> } {
  return { DB: createFakeD1(), TEACHER_USERNAME: 'guru', TEACHER_PASSWORD_HASH: 'pbkdf2-sha256$210000$dGVzdC1zYWx0LTAxMjM0NTY3$nl_C_y6KSSxGvuhem6RfVT_2xKGg7jNAWmaBwRF4tE8', TEACHER_SESSION_SECRET: SECRET };
}
async function login(env: Env, username = 'guru', password = 'sandi-kuat') {
  return handleTeacherAuth(new Request('http://x/api/teacher-auth', { method: 'POST', body: JSON.stringify({ username, password }) }), env);
}
async function teacherToken(env: Env) { return (await (await login(env)).json()).token as string; }
async function call(env: Env, method: 'GET' | 'POST', opts: { token?: string; body?: unknown; query?: string } = {}) {
  const res = await handleSync(new Request(`http://x/api/sync${opts.query || ''}`, {
    method, headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  }), env);
  return { status: res.status, body: await res.json() as any };
}
const token = (id: string, code: string, extra: object = {}) => ({ id, code, status: 'available', createdAt: '2026-10-15T00:00:00Z', classId: 'class-test', classCode: 'KELAS-TEST23', className: 'Kelas Tes', ...extra });
const sub = (id: string, tok: { id: string; code: string }, extra: object = {}) => ({
  id, groupId: tok.id, groupCode: tok.code, status: 'in_progress', team: { teamName: 'Tim', schoolName: 'SD', members: [], agreement: '' },
  answers: {}, history: [], startedAt: '2026-10-15T00:00:00Z', ...extra,
});
const claim = (env: Env, tok: { id: string; code: string }, sid: string) =>
  call(env, 'POST', { body: { upsertTokens: [{ ...tok, status: 'claimed', claimedBySubmissionId: sid }] } });

async function seed(env: Env) {
  const t = await teacherToken(env);
  await env.DB.prepare("INSERT INTO classes (id, teacher_username, name, join_code, status, group_count, created_at) VALUES (?, ?, ?, ?, 'active', 0, ?)")
    .bind('class-test', 'guru', 'Kelas Tes', 'KELAS-TEST23', Date.now()).run();
  const r = await call(env, 'POST', { token: t, body: {
    upsertTokens: [token('tok_1', 'KPK-1A-91', { notes: 'catatan guru' }), token('tok_2', 'KPK-2B-47')],
    settings: { questions: [{ id: 'q1' }], trackLock: { isLocked: false, lockedTrack: null }, rubric: { a: 1 } },
  } });
  assert.equal(r.status, 200);
  return t;
}

test('login guru: hash PBKDF2, salah sandi, benar, token dipalsukan', async () => {
  assert.equal((await login({ DB: createFakeD1() } as Env)).status, 503);
  const env = makeEnv();
  assert.equal((await login(env, 'guru', 'salah')).status, 401);
  const t = await teacherToken(env);
  assert.ok(t.includes('.'));
  assert.equal((await call(env, 'GET', { token: t })).status, 200);
  const [p, s] = t.split('.');
  assert.equal((await call(env, 'GET', { token: `${p}.${s.slice(0, -2)}xx` })).status, 401);
  const forgedPayload = Buffer.from(JSON.stringify({ sub: 'guru', exp: Date.now() + 1e9 })).toString('base64url');
  assert.equal((await call(env, 'GET', { token: `${forgedPayload}.${s}` })).status, 401);
});

test('login valid tidak membutuhkan CAPTCHA atau konfigurasi Turnstile', async () => {
  const response = await login(makeEnv());
  assert.equal(response.status, 200);
  assert.equal(typeof (await response.json() as any).token, 'string');
});

test('GET publik tidak membocorkan jawaban/penilaian kelompok lain', async () => {
  const env = makeEnv(); const t = await seed(env);
  await claim(env, { id: 'tok_1', code: 'KPK-1A-91' }, 's1');
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('s1', { id: 'tok_1', code: 'KPK-1A-91' })] } })).status, 200);
  // guru menilai
  const full = (await call(env, 'GET', { token: t })).body.submissions[0];
  await call(env, 'POST', { token: t, body: { upsertSubmissions: [{ ...full, status: 'reviewed', evaluation: { totalScore: 90 }, reviewedAt: 'x' }] } });
  const other = await call(env, 'GET', { query: '?groupCode=KPK-2B-47' });
  assert.equal(other.body.submissions.length, 0);
  assert.equal(other.body.settings.rubric, undefined);
  assert.deepEqual(Object.keys(other.body.tokens[0]).sort(), ['code', 'createdAt', 'id', 'status']);
  const own = await call(env, 'GET', { query: '?groupCode=kpk-1a-91' });
  assert.equal(own.body.submissions.length, 1);
  assert.equal(own.body.submissions[0].evaluation, undefined, 'nilai belum dipublikasikan harus disembunyikan');
});

test('draf pembelajaran hanya terlihat oleh guru pemilik; murid menerima versi yang dipublikasikan', async () => {
  const env = makeEnv(); const t = await seed(env);
  const content = {
    draft: { objective: 'TUJUAN DRAF RAHASIA', questions: [{ id: 'draft-question' }] },
    published: { objective: 'TUJUAN TERBIT', questions: [{ id: 'published-question' }] },
  };
  assert.equal((await call(env, 'POST', { token: t, body: { settings: { learningContent: content } } })).status, 200);
  assert.equal((await call(env, 'POST', { body: { settings: { learningContent: content } } })).status, 403);
  const teacherData = await call(env, 'GET', { token: t });
  assert.equal(teacherData.body.settings.learningContent.draft.objective, 'TUJUAN DRAF RAHASIA');
  const studentData = await call(env, 'GET', { query: '?groupCode=KPK-1A-91' });
  assert.deepEqual(studentData.body.settings.learningContent, content.published);
  assert.equal(JSON.stringify(studentData.body).includes('TUJUAN DRAF RAHASIA'), false);
});

test('dua siswa berebut ID yang sama secara bersamaan: tepat satu menang', async () => {
  const env = makeEnv(); await seed(env);
  const tok = { id: 'tok_1', code: 'KPK-1A-91' };
  const results = await Promise.all([claim(env, tok, 'sA'), claim(env, tok, 'sB'), claim(env, tok, 'sC')]);
  assert.equal(results.filter((r) => r.status === 200).length, 1);
  assert.ok(results.filter((r) => r.status !== 200).every((r) => r.status === 409 && r.body.code === 'TOKEN_CLAIMED'));
});

test('klaim siswa tidak menimpa catatan guru; klaim ulang oleh sesi yang sama idempoten', async () => {
  const env = makeEnv(); const t = await seed(env);
  assert.equal((await claim(env, { id: 'tok_1', code: 'KPK-1A-91' }, 's1')).status, 200);
  assert.equal((await claim(env, { id: 'tok_1', code: 'KPK-1A-91' }, 's1')).status, 200);
  const stored = (await call(env, 'GET', { token: t })).body.tokens.find((x: any) => x.id === 'tok_1');
  assert.equal(stored.notes, 'catatan guru');
  assert.equal(stored.status, 'claimed');
  assert.equal(stored.claimedBySubmissionId, 's1');
});

test('siswa tidak bisa: hapus, ubah pengaturan, ubah kode, tulis ke sesi/ID lain, set status guru', async () => {
  const env = makeEnv(); await seed(env);
  const t1 = { id: 'tok_1', code: 'KPK-1A-91' }, t2 = { id: 'tok_2', code: 'KPK-2B-47' };
  await claim(env, t1, 's1'); await claim(env, t2, 's2');
  assert.equal((await call(env, 'POST', { body: { deleteSubmissions: ['s1'] } })).status, 403);
  assert.equal((await call(env, 'POST', { body: { settings: { questions: [] } } })).status, 403);
  assert.equal((await call(env, 'POST', { body: { upsertTokens: [{ ...t1, code: 'HACK-1', status: 'claimed', claimedBySubmissionId: 's1' }] } })).status, 403);
  const stolen = await call(env, 'POST', { body: { upsertSubmissions: [sub('s2', t1)] } }); // s2 memakai ID milik s1
  assert.equal(stolen.status, 409);
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('s1', t1, { status: 'results_published' })] } })).status, 403);
});

test('autosave siswa tidak menimpa evaluasi guru; sesi yang sudah dinilai terkunci', async () => {
  const env = makeEnv(); const t = await seed(env);
  const t1 = { id: 'tok_1', code: 'KPK-1A-91' };
  await claim(env, t1, 's1');
  await call(env, 'POST', { body: { upsertSubmissions: [sub('s1', t1, { status: 'submitted_pending_review' })] } });
  const full = (await call(env, 'GET', { token: t })).body.submissions[0];
  await call(env, 'POST', { token: t, body: { upsertSubmissions: [{ ...full, status: 'submitted_pending_review', evaluation: { totalScore: 77 } }] } });
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('s1', t1, { status: 'submitted_pending_review' })] } })).status, 200);
  assert.equal((await call(env, 'GET', { token: t })).body.submissions[0].evaluation.totalScore, 77);
  await call(env, 'POST', { token: t, body: { upsertSubmissions: [{ ...full, status: 'reviewed', evaluation: { totalScore: 77 } }] } });
  const locked = await call(env, 'POST', { body: { upsertSubmissions: [sub('s1', t1)] } });
  assert.equal(locked.status, 403);
});

test('HAPUS SAAT SISWA SEDANG MENGERJAKAN: data hilang, ID tersedia, sesi lama tidak hidup lagi', async () => {
  const env = makeEnv(); const t = await seed(env);
  const t1 = { id: 'tok_1', code: 'KPK-1A-91' };
  await claim(env, t1, 'sesi_lama');
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('sesi_lama', t1, { isTimerRunning: true })] } })).status, 200);

  // Guru menghapus (pola yang sama dengan klien: token dilepas + sesi dihapus dalam satu permintaan).
  const del = await call(env, 'POST', { token: t, body: {
    upsertTokens: [token('tok_1', 'KPK-1A-91', { revokedSubmissionIds: ['sesi_lama'] })],
    deleteSubmissions: ['sesi_lama'],
  } });
  assert.equal(del.status, 200);
  const state = (await call(env, 'GET', { token: t })).body;
  assert.equal(state.submissions.length, 0);
  assert.equal(state.tokens.find((x: any) => x.id === 'tok_1').status, 'available');

  // Perangkat siswa (belum tahu) masih mengirim autosave: harus ditolak dan tidak menghidupkan data.
  const late = await call(env, 'POST', { body: { upsertSubmissions: [sub('sesi_lama', t1, { isTimerRunning: true })] } });
  assert.equal(late.status, 409); assert.equal(late.body.code, 'SESSION_DELETED');
  assert.equal((await call(env, 'GET', { token: t })).body.submissions.length, 0);
  const lateClaim = await claim(env, t1, 'sesi_lama');
  assert.equal(lateClaim.status, 409); assert.equal(lateClaim.body.code, 'SESSION_DELETED');

  // Klien memeriksa status sesinya saat polling.
  const poll = await call(env, 'GET', { query: '?groupCode=KPK-1A-91&sessionId=sesi_lama' });
  assert.equal(poll.body.sessionRevoked, true);
  assert.equal((await call(env, 'GET', { query: '?groupCode=KPK-1A-91&sessionId=sesi_baru' })).body.sessionRevoked, false);

  // Kelompok yang sama (atau kelompok lain) boleh memulai sesi baru dengan ID tersebut.
  assert.equal((await claim(env, t1, 'sesi_baru')).status, 200);
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('sesi_baru', t1)] } })).status, 200);
});

test('guru dapat menghapus ID yang sedang dipakai dan mencabut sesi aktif dengan aman', async () => {
  const env = makeEnv(); const t = await seed(env);
  const t1 = { id: 'tok_1', code: 'KPK-1A-91' };
  await claim(env, t1, 'sesi_aktif');
  await call(env, 'POST', { body: { upsertSubmissions: [sub('sesi_aktif', t1, { isTimerRunning: true })] } });

  const deleted = await call(env, 'POST', { token: t, body: {
    deleteTokens: ['tok_1'],
    deleteSubmissions: ['sesi_aktif'],
  } });
  assert.equal(deleted.status, 200);
  const state = (await call(env, 'GET', { token: t })).body;
  assert.equal(state.tokens.some((item: any) => item.id === 'tok_1'), false);
  assert.equal(state.submissions.some((item: any) => item.id === 'sesi_aktif'), false);
  assert.equal((await call(env, 'GET', { query: '?groupCode=KPK-1A-91&sessionId=sesi_aktif' })).body.sessionRevoked, true);
  const late = await call(env, 'POST', { body: { upsertSubmissions: [sub('sesi_aktif', t1)] } });
  assert.equal(late.status, 409);
  assert.equal(late.body.code, 'SESSION_DELETED');
});

test('hapus tanpa melepas ID secara eksplisit: server tetap melepas ID yang dipegang sesi itu', async () => {
  const env = makeEnv(); const t = await seed(env);
  const t2 = { id: 'tok_2', code: 'KPK-2B-47' };
  await claim(env, t2, 's2');
  await call(env, 'POST', { body: { upsertSubmissions: [sub('s2', t2)] } });
  assert.equal((await call(env, 'POST', { token: t, body: { deleteSubmissions: ['s2'] } })).status, 200);
  const state = (await call(env, 'GET', { token: t })).body;
  assert.equal(state.tokens.find((x: any) => x.id === 'tok_2').status, 'available');
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('s2', t2)] } })).status, 409);
});

test('ID yang dinonaktifkan guru tidak bisa diklaim; kode ID harus unik', async () => {
  const env = makeEnv(); const t = await seed(env);
  await call(env, 'POST', { token: t, body: { upsertTokens: [token('tok_2', 'KPK-2B-47', { status: 'disabled' })] } });
  assert.equal((await claim(env, { id: 'tok_2', code: 'KPK-2B-47' }, 's2')).status, 403);
  const dup = await call(env, 'POST', { token: t, body: { upsertTokens: [token('tok_9', 'kpk-1a-91')] } });
  assert.equal(dup.status, 409);
});

test('guru kedaluwarsa/token rusak mendapat 401, bukan data', async () => {
  const env = makeEnv(); await seed(env);
  const r = await call(env, 'GET', { token: 'rusak.rusak' });
  assert.equal(r.status, 401);
});


test('kelas: hanya guru dapat membuat kelas, murid hanya dapat melihat kelas lewat kode yang benar', async () => {
  const env = makeEnv();
  assert.equal((await handleClasses(new Request('http://x/api/classes', { method: 'POST', body: JSON.stringify({ name: 'Kelas V A' }) }), env)).status, 401);
  const token = await teacherToken(env);
  const created = await handleClasses(new Request('http://x/api/classes', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Kelas V A' }),
  }), env);
  assert.equal(created.status, 201);
  const classroom = (await created.json() as any).class;
  assert.match(classroom.joinCode, /^KELAS-[A-Z2-9]{6}$/);
  const listed = await handleClasses(new Request('http://x/api/classes', { headers: { Authorization: `Bearer ${token}` } }), env);
  assert.equal((await listed.json() as any).classes.length, 1);
  const publicLookup = await handleClasses(new Request(`http://x/api/classes?code=${classroom.joinCode}`), env);
  assert.equal((await publicLookup.json() as any).class.name, 'Kelas V A');
  assert.equal((await call(env, 'GET')).body.initialized, true, 'kelas yang sudah dibuat harus mengaktifkan sinkronisasi siswa');
  const badLookup = await handleClasses(new Request('http://x/api/classes?code=KELAS-SALAH1'), env);
  assert.equal(badLookup.status, 404);
});

test('sesi kelompok hanya dibuat otomatis setelah kode kelas sah diverifikasi', async () => {
  const env = makeEnv();
  assert.equal((await handleGroupToken(new Request('http://x/api/group-token', { method: 'POST', body: JSON.stringify({}) }), env)).status, 400);
  const teacher = await teacherToken(env);
  const created = await handleClasses(new Request('http://x/api/classes', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Kelas Uji' }),
  }), env);
  const createdData = (await created.json()) as any;
  const joinCode = createdData.class.joinCode as string;
  const invalid = await handleGroupToken(new Request('http://x/api/group-token', { method: 'POST', body: JSON.stringify({ classCode: 'KELAS-TIDAKADA' }) }), env);
  assert.equal(invalid.status, 404);
  const joined = await handleGroupToken(new Request('http://x/api/group-token', { method: 'POST', body: JSON.stringify({ classCode: joinCode.toLowerCase() }) }), env);
  assert.equal(joined.status, 201);
  const result = (await joined.json()) as any;
  assert.equal(result.token.classId, createdData.class.id);
  assert.equal(result.token.classCode, joinCode);
  assert.match(result.token.code, /^KPK-[A-Z2-9]{3}-[A-Z2-9]{3}$/);
});

test('kelompok guru wajib dibuat di sesi milik guru; submission tetap masuk ke monitoring pemilik', async () => {
  const env = makeEnv();
  const teacher = await teacherToken(env);
  const missingSession = await handleGroupToken(new Request('http://x/api/group-token', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 2, prefix: 'KPK' }),
  }), env);
  assert.equal(missingSession.status, 400);
  assert.equal((await call(env, 'POST', { token: teacher, body: { upsertTokens: [{ id: 'no-session', code: 'KPK-NO-SESSION', status: 'available' }] } })).status, 400,
    'endpoint sinkronisasi juga tidak bisa membuat kelompok tanpa sesi');
  const createdSession = await handleClasses(new Request('http://x/api/classes', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Asesmen Kelas 5A' }),
  }), env);
  const sessionId = (await createdSession.json() as any).class.id as string;
  const wrongOwner = await handleGroupToken(new Request('http://x/api/group-token', {
    method: 'POST', headers: { Authorization: `Bearer ${await issueTeacherToken(env, 'guru-lain')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 2, sessionId }),
  }), env);
  assert.equal(wrongOwner.status, 404);
  const response = await handleGroupToken(new Request('http://x/api/group-token', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 2, prefix: 'KPK', sessionId }),
  }), env);
  assert.equal(response.status, 201);
  const issued = (await response.json() as any).tokens as Array<{ id: string; code: string; classId: string; classCode: string }>;
  assert.equal(issued.length, 2);
  assert.match(issued[0].code, /^KPK-GURU-[A-Z2-9]{6}$/);
  assert.ok(issued[0].classId && issued[0].classCode);
  assert.ok(issued.every((group) => group.classId === sessionId), 'semua kelompok terkait ke sesi yang dipilih');
  const movedSession = await handleClasses(new Request('http://x/api/classes', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Sesi Lain' }),
  }), env);
  const movedSessionId = (await movedSession.json() as any).class.id;
  assert.equal((await call(env, 'POST', { token: teacher, body: { upsertTokens: [{ ...issued[0], classId: movedSessionId }] } })).status, 403,
    'kelompok yang sudah dibuat tidak dapat dipindahkan lewat sinkronisasi');

  const assigned = { ...issued[0], status: 'available' };
  assert.equal((await claim(env, assigned, 'student-session-1')).status, 200);
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('student-session-1', assigned)] } })).status, 200);
  const ownerData = await call(env, 'GET', { token: teacher });
  assert.equal(ownerData.body.submissions.length, 1);
  assert.equal(ownerData.body.submissions[0].groupCode, assigned.code);

  const otherTeacher = await issueTeacherToken(env, 'guru-lain');
  const otherData = await call(env, 'GET', { token: otherTeacher });
  assert.equal(otherData.body.submissions.length, 0);
  assert.equal(otherData.body.tokens.length, 0);
});

test('guru menghapus sesi aktif beserta seluruh ID kelompok dan data pengerjaannya', async () => {
  const env = makeEnv();
  const teacher = await teacherToken(env);
  const created = await handleClasses(new Request('http://x/api/classes', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Sesi Aktif' }),
  }), env);
  const session = (await created.json() as any).class;
  const issued = await handleGroupToken(new Request('http://x/api/group-token', {
    method: 'POST', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id, quantity: 1 }),
  }), env);
  const group = (await issued.json() as any).tokens[0];
  assert.equal((await claim(env, group, 'student-live-session')).status, 200);
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('student-live-session', group)] } })).status, 200);
  await env.DB.prepare('INSERT INTO revoked_sessions (submission_id, group_code, revoked_at) VALUES (?, ?, ?)')
    .bind('student-live-session', group.code, Date.now()).run();

  const wrongOwnerDelete = await handleClasses(new Request('http://x/api/classes', {
    method: 'DELETE', headers: { Authorization: `Bearer ${await issueTeacherToken(env, 'guru-lain')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: session.id }),
  }), env);
  assert.equal(wrongOwnerDelete.status, 404);
  const deleted = await handleClasses(new Request('http://x/api/classes', {
    method: 'DELETE', headers: { Authorization: `Bearer ${teacher}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: session.id }),
  }), env);
  assert.equal(deleted.status, 200);
  assert.equal((await (await handleClasses(new Request('http://x/api/classes', { headers: { Authorization: `Bearer ${teacher}` } }), env)).json() as any).classes.length, 0);
  assert.equal((await env.DB.prepare('SELECT COUNT(*) AS n FROM classes WHERE id = ?').bind(session.id).first<any>()).n, 0);
  assert.equal((await env.DB.prepare('SELECT COUNT(*) AS n FROM group_tokens WHERE id = ? OR code = ?').bind(group.id, group.code).first<any>()).n, 0);
  assert.equal((await env.DB.prepare('SELECT COUNT(*) AS n FROM submissions WHERE id = ?').bind('student-live-session').first<any>()).n, 0);
  const tombstone = await env.DB.prepare('SELECT group_code FROM revoked_sessions WHERE submission_id = ?').bind('student-live-session').first<any>();
  assert.equal(tombstone.group_code, null, 'tombstone tetap mencegah pemulihan oleh klien lama tanpa menyimpan ID kelompok');
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('student-live-session', group, { answers: { edited: true } })] } })).status, 409);
  assert.equal((await claim(env, group, 'student-another-session')).status, 409);
  assert.equal((await handleGroupToken(new Request('http://x/api/group-token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classCode: session.joinCode }),
  }), env)).status, 404);
});

test('ID lama yang belum memiliki metadata kelas tetap dapat mengirim hasil', async () => {
  const env = makeEnv();
  const teacher = await teacherToken(env);
  const oldToken = { id: 'old-token-1', code: 'KPK-LAMA-123456', status: 'available', createdAt: new Date().toISOString() };
  await env.DB.prepare("INSERT INTO group_tokens (id, code, status, claimed_by, data, updated_at, owner_id) VALUES (?, ?, 'available', NULL, ?, ?, 'legacy')")
    .bind(oldToken.id, oldToken.code, JSON.stringify(oldToken), Date.now()).run();
  assert.equal((await call(env, 'GET', { token: teacher })).status, 200, 'data lama diadopsi tanpa memerlukan sesi baru');
  assert.equal((await claim(env, oldToken, 'old-student-session')).status, 200);
  assert.equal((await call(env, 'POST', { body: { upsertSubmissions: [sub('old-student-session', oldToken)] } })).status, 200);
  const monitored = await call(env, 'GET', { token: teacher });
  assert.equal(monitored.body.submissions.length, 1);
  assert.equal(monitored.body.submissions[0].groupCode, oldToken.code);
});
