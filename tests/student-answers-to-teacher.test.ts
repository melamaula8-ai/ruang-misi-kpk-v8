import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFakeD1 } from './fakeD1';
import { handleSync, handleTeacherAuth, type Env } from '../server/core';

const SECRET = 'rahasia-uji-jawaban-murid-yang-cukup-panjang';
const GROUP_CODE = 'KPK-JAWABAN-01';

function makeEnv(): Env & { DB: ReturnType<typeof createFakeD1> } {
  return {
    DB: createFakeD1(),
    TEACHER_USERNAME: 'guru',
    TEACHER_PASSWORD_HASH: 'pbkdf2-sha256$210000$dGVzdC1zYWx0LTAxMjM0NTY3$nl_C_y6KSSxGvuhem6RfVT_2xKGg7jNAWmaBwRF4tE8',
    TEACHER_SESSION_SECRET: SECRET,
  };
}

async function getTeacherToken(env: Env) {
  const response = await handleTeacherAuth(new Request('http://x/api/teacher-auth', {
    method: 'POST', body: JSON.stringify({ username: 'guru', password: 'sandi-kuat' }),
  }), env);
  assert.equal(response.status, 200);
  return (await response.json() as { token: string }).token;
}

async function sync(env: Env, method: 'GET' | 'POST', options: { token?: string; body?: unknown; query?: string } = {}) {
  const response = await handleSync(new Request(`http://x/api/sync${options.query || ''}`, {
    method,
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : {},
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  }), env);
  return { status: response.status, body: await response.json() as any };
}

test('jawaban murid tetap terbaca guru selama penilaian dan pintu berganti', async () => {
  const env = makeEnv();
  const teacherToken = await getTeacherToken(env);
  await env.DB.prepare("INSERT INTO classes (id, teacher_username, name, join_code, status, group_count, created_at) VALUES (?, ?, ?, ?, 'active', 0, ?)")
    .bind('class-answers', 'guru', 'Kelas Jawaban', 'KELAS-JAWABAN1', Date.now()).run();

  const groupToken = { id: 'group-answers', code: GROUP_CODE, status: 'available', classId: 'class-answers', classCode: 'KELAS-JAWABAN1', className: 'Kelas Jawaban' };
  assert.equal((await sync(env, 'POST', { token: teacherToken, body: { upsertTokens: [groupToken] } })).status, 200);

  const submission = (id: string, track: string, answers: Record<string, unknown>) => ({
    id, groupId: groupToken.id, groupCode: GROUP_CODE, classId: 'class-answers', track,
    status: 'in_progress', answers, team: { teamName: 'Tim KPK', members: [] },
    presentation: {}, reflection: {}, startedAt: '2026-10-24T08:00:00.000Z', history: [],
  });

  const firstId = 'student-session-penjelajah';
  assert.equal((await sync(env, 'POST', { body: { upsertTokens: [{ ...groupToken, status: 'claimed', claimedBySubmissionId: firstId }] } })).status, 200);
  const initialAnswers = { m1_penjelajah: { step1: { rina_interval: '2' }, step2: { plan: 'Daftar kelipatan' }, step3: { lcm: '12' }, step4: { check: '12' } } };
  assert.equal((await sync(env, 'POST', { body: { upsertSubmissions: [submission(firstId, 'penjelajah', initialAnswers)] } })).status, 200);

  // A: Answers from the student's submission are visible through the teacher's sync feed.
  const teacherAfterStudent = await sync(env, 'GET', { token: teacherToken });
  assert.deepEqual(teacherAfterStudent.body.submissions.find((row: any) => row.id === firstId)?.answers, initialAnswers);

  // B: A stale teacher copy has no answers; saving evaluation must not erase the server copy.
  const staleTeacherCopy = { ...submission(firstId, 'penjelajah', {}), status: 'reviewed', evaluation: { totalScore: 80 }, reviewedAt: '2026-10-24T08:10:00.000Z' };
  assert.equal((await sync(env, 'POST', { token: teacherToken, body: { upsertSubmissions: [staleTeacherCopy] } })).status, 200);
  const teacherAfterReview = await sync(env, 'GET', { token: teacherToken });
  assert.deepEqual(teacherAfterReview.body.submissions.find((row: any) => row.id === firstId)?.answers, initialAnswers);
  const studentAfterReview = await sync(env, 'GET', { query: `?groupCode=${GROUP_CODE}&sessionId=${firstId}` });
  assert.deepEqual(studentAfterReview.body.submissions.find((row: any) => row.id === firstId)?.answers, initialAnswers);

  // C: Later student autosaves merge new answers while retaining teacher evaluation.
  const updatedAnswers = { ...initialAnswers, m1_penjelajah: { ...initialAnswers.m1_penjelajah, step4: { check: '12 benar' }, extra: { note: 'dicek lagi' } } };
  assert.equal((await sync(env, 'POST', { body: { upsertSubmissions: [submission(firstId, 'penjelajah', updatedAnswers)] } })).status, 200);
  const teacherAfterAutosave = await sync(env, 'GET', { token: teacherToken });
  const afterAutosave = teacherAfterAutosave.body.submissions.find((row: any) => row.id === firstId);
  assert.deepEqual(afterAutosave?.answers, updatedAnswers);
  assert.deepEqual(afterAutosave?.evaluation, { totalScore: 80 });

  // D: A separate submission ID for another mission in the same group remains independently visible.
  const secondId = 'student-session-pintu-kedua';
  const secondAnswers = { m1_penjelajah: { step1: { rina_interval: '3' }, step2: {}, step3: {}, step4: {} } };
  assert.equal((await sync(env, 'POST', { body: { upsertSubmissions: [submission(secondId, 'inovator', secondAnswers)] } })).status, 200);
  const teacherAfterSecondMission = await sync(env, 'GET', { token: teacherToken });
  const visible = teacherAfterSecondMission.body.submissions.filter((row: any) => row.groupCode === GROUP_CODE);
  assert.equal(visible.length, 2);
  assert.deepEqual(visible.find((row: any) => row.id === firstId)?.answers, updatedAnswers);
  assert.deepEqual(visible.find((row: any) => row.id === secondId)?.answers, secondAnswers);
});
