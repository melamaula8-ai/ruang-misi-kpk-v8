import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTeamIdentityValidationErrors, isTeamIdentityComplete } from '../src/utils/teamIdentity';
import { INITIAL_QUESTION_BANK, migrateInnovatorProblemAnalysis, migrateInnovatorProblemAnswers } from '../src/data/questionBank';
import { calculateLCM, addDaysToDate } from '../src/utils/math';

const team = (o: any = {}) => ({ teamName: 'Tim A', schoolName: 'SDN 1', agreement: '', members: [{name:'a',role:'r'},{name:'b',role:'r'},{name:'c',role:'r'}], ...o });

test('identitas wajib: kosong, spasi saja, anggota kurang, nama anggota kosong', () => {
  assert.equal(isTeamIdentityComplete(team()), true);
  assert.ok(getTeamIdentityValidationErrors(team({ teamName: '' })).teamName);
  assert.ok(getTeamIdentityValidationErrors(team({ teamName: '   ' })).teamName);
  assert.ok(getTeamIdentityValidationErrors(team({ schoolName: ' ' })).schoolName);
  assert.ok(getTeamIdentityValidationErrors(team({ members: [{name:'a',role:'r'}] })).members[-1]);
  const e = getTeamIdentityValidationErrors(team({ members: [{name:'a',role:'r'},{name:'',role:'r'},{name:'c',role:'r'}] }));
  assert.deepEqual(Object.keys(e.members), ['1']);
  assert.equal(isTeamIdentityComplete(team({ agreement: '' })), true, 'kesepakatan tidak diwajibkan');
});

test('4 kasus Inovator: tiga kolom (diketahui, ditanyakan, tanggal awal), bahasa sederhana', () => {
  const inov = INITIAL_QUESTION_BANK.filter((q) => q.track === 'inovator');
  assert.equal(inov.length, 4);
  for (const q of inov) {
    assert.deepEqual(q.step1Fields.map((f) => f.id), ['known_info', 'question_asked', 'start_date'], q.id);
    assert.match(q.step1Prompt, /diketahui/); assert.match(q.step1Prompt, /ditanyakan/); assert.match(q.step1Prompt, /awal/);
    for (const f of q.step1Fields) assert.ok(f.label && f.placeholder && f.expectedAnswer, `${q.id}.${f.id}`);
  }
});

test('kunci jawaban 4 kasus Inovator konsisten dengan perhitungan KPK dan kalender', () => {
  const inov = INITIAL_QUESTION_BANK.filter((q) => q.track === 'inovator');
  for (const q of inov) {
    assert.equal(calculateLCM(q.num1, q.num2), q.internalKey.kpk, `${q.id} KPK`);
    if (q.startDate) console.log(q.id, q.startDate, '+', q.internalKey.kpk, '=>', addDaysToDate(q.startDate, q.internalKey.kpk), '| kunci:', q.internalKey.finalAnswer);
  }
});

test('migrasi data lama (satu kolom) ke tiga kolom tanpa kehilangan jawaban siswa', () => {
  const legacy = INITIAL_QUESTION_BANK.map((q) => q.track === 'inovator'
    ? { ...q, step1Fields: [{ id: q.id === 'm2_inovator' ? 'problem_variables' : 'problem_analysis', label: 'lama', type: 'textarea' as const }] } : q);
  const migrated = migrateInnovatorProblemAnalysis(legacy as any);
  for (const q of migrated.filter((x) => x.track === 'inovator')) assert.equal(q.step1Fields.length, 3);
  const subs = migrateInnovatorProblemAnswers([{ id: 's', answers: { m1_inovator: { step1: { problem_analysis: 'A piket 8 hari' }, step2: {}, step3: {}, step4: {} } } } as any]);
  assert.equal((subs[0].answers as any).m1_inovator.step1.known_info, 'A piket 8 hari');
});
