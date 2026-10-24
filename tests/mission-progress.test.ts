import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCompletedMissionId, isMissionMarkedComplete } from '../src/utils/missionProgress';

test('menyelesaikan misi membuka titik berikutnya dan tersimpan tanpa duplikasi', () => {
  const first = addCompletedMissionId(undefined, 'm1_penjelajah');
  const repeated = addCompletedMissionId(first, 'm1_penjelajah');

  assert.deepEqual(first, ['m1_penjelajah']);
  assert.deepEqual(repeated, ['m1_penjelajah']);
  assert.equal(isMissionMarkedComplete(repeated, 'm1_penjelajah'), true);
  assert.equal(isMissionMarkedComplete(repeated, 'm2_penjelajah'), false);
});
