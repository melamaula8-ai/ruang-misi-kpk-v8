import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFreshSubmission,
  findSubmissionForGroupToken,
} from '../src/context/AssessmentContext';
import type { AssessmentSubmission, GroupToken } from '../src/types';

const groupA: GroupToken = {
  id: 'group-a', code: 'KPK-A-11', classId: 'class-a',
  status: 'claimed', createdAt: '2026-10-20T00:00:00.000Z',
};
const groupB: GroupToken = {
  id: 'group-b', code: 'KPK-B-22', classId: 'class-b',
  status: 'available', createdAt: '2026-10-20T00:00:00.000Z',
};
const submission = (token: GroupToken, id: string, teamName: string, members: string[]): AssessmentSubmission => ({
  ...createFreshSubmission(token.id, token.code, token.classId),
  id,
  team: {
    teamName,
    schoolName: `Sekolah ${teamName}`,
    agreement: 'Sepakat bekerja sama.',
    members: members.map((name, index) => ({ name, role: `Peran ${index + 1}` })),
  },
});

test('klaim Kelas B menghasilkan identitas kosong dan tidak mewarisi identitas Kelas A', () => {
  const savedA = submission(groupA, 'submission-a', 'Tim A', ['Ayu', 'Bima', 'Citra']);
  const rows = [savedA];

  assert.equal(findSubmissionForGroupToken(rows, groupB), undefined);
  const claimedB = createFreshSubmission(groupB.id, groupB.code, groupB.classId);
  assert.equal(claimedB.groupId, groupB.id);
  assert.equal(claimedB.groupCode, groupB.code);
  assert.equal(claimedB.classId, groupB.classId);
  assert.equal(claimedB.team.teamName, '');
  assert.equal(claimedB.team.schoolName, '');
  assert.ok(claimedB.team.members.every((member) => member.name === ''));
  assert.equal(JSON.stringify(claimedB).includes('Ayu'), false);
  assert.equal(JSON.stringify(claimedB).includes('Tim A'), false);
  assert.equal(rows[0], savedA, 'klaim kelompok baru tidak mengganti submission lama');
});

test('membuka link kelompok secara bergantian memilih data masing-masing tanpa menukar identitas', () => {
  const savedA = submission(groupA, 'submission-a', 'Tim A', ['Ayu', 'Bima', 'Citra']);
  const savedB = submission(groupB, 'submission-b', 'Tim B', ['Dara', 'Eko', 'Fani']);
  const rows = [savedA, savedB];

  assert.equal(findSubmissionForGroupToken(rows, groupB)?.team.members[0].name, 'Dara');
  assert.equal(findSubmissionForGroupToken(rows, groupA)?.team.members[0].name, 'Ayu');
  assert.equal(findSubmissionForGroupToken(rows, groupB)?.team.teamName, 'Tim B');
  assert.equal(findSubmissionForGroupToken(rows, groupA)?.team.teamName, 'Tim A');
});

test('refresh/local restore dan server restore Kelas A mengembalikan submission A yang tersimpan', () => {
  const savedA = submission(groupA, 'submission-a', 'Tim A', ['Ayu', 'Bima', 'Citra']);
  const savedB = submission(groupB, 'submission-b', 'Tim B', ['Dara', 'Eko', 'Fani']);
  const persistedRows = JSON.parse(JSON.stringify([savedA, savedB])) as AssessmentSubmission[];
  const serverRows = JSON.parse(JSON.stringify([savedA])) as AssessmentSubmission[];

  const afterRefresh = findSubmissionForGroupToken(persistedRows, groupA);
  const afterServerRestore = findSubmissionForGroupToken(serverRows, groupA);
  for (const restored of [afterRefresh, afterServerRestore]) {
    assert.equal(restored?.id, 'submission-a');
    assert.equal(restored?.team.teamName, 'Tim A');
    assert.deepEqual(restored?.team.members.map((member) => member.name), ['Ayu', 'Bima', 'Citra']);
  }
  assert.equal(persistedRows.length, 2, 'pemulihan tidak menghapus submission kelas lain');
});

test('ID kelompok yang sama tetapi classId berbeda tetap terisolasi', () => {
  const tokenA = { ...groupA, id: 'shared-group', code: 'KPK-SHARED-33' };
  const tokenB = { ...groupB, id: 'shared-group', code: 'KPK-SHARED-33' };
  const savedA = submission(tokenA, 'submission-a', 'Tim A', ['Ayu', 'Bima', 'Citra']);
  const savedB = submission(tokenB, 'submission-b', 'Tim B', ['Dara', 'Eko', 'Fani']);

  assert.equal(findSubmissionForGroupToken([savedA], tokenB), undefined);
  assert.equal(findSubmissionForGroupToken([savedA, savedB], tokenA)?.team.teamName, 'Tim A');
  assert.equal(findSubmissionForGroupToken([savedA, savedB], tokenB)?.team.teamName, 'Tim B');
});

test('kode unik yang sama tetapi classId berbeda tetap terisolasi', () => {
  const tokenA = { ...groupA, code: 'KPK-SHARED-44' };
  const tokenB = { ...groupB, code: 'KPK-SHARED-44' };
  const savedA = submission(tokenA, 'submission-a', 'Tim A', ['Ayu', 'Bima', 'Citra']);
  const savedB = submission(tokenB, 'submission-b', 'Tim B', ['Dara', 'Eko', 'Fani']);

  assert.equal(findSubmissionForGroupToken([savedA], tokenB), undefined);
  assert.equal(findSubmissionForGroupToken([savedA, savedB], tokenA)?.id, 'submission-a');
  assert.equal(findSubmissionForGroupToken([savedA, savedB], tokenB)?.id, 'submission-b');
});
