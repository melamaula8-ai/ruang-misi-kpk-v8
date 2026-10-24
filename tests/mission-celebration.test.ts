import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  consumeMissionCelebration,
  queueMissionCelebrationAfterSubmit,
} from '../src/utils/missionCelebration';

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
};

test('perayaan tidak diantrekan oleh jawaban saja atau pengiriman gagal', () => {
  const storage = memoryStorage();
  assert.equal(queueMissionCelebrationAfterSubmit('submission-1', 'misi-4', 4, false, storage), false);
  assert.equal(consumeMissionCelebration('submission-1', storage), null);
});

test('pengiriman sukses mengantrekan perayaan sekali dan muat ulang tidak memutarnya lagi', () => {
  const storage = memoryStorage();
  assert.equal(queueMissionCelebrationAfterSubmit('submission-1', 'misi-4', 4, true, storage), true);
  assert.deepEqual(consumeMissionCelebration('submission-1', storage), {
    submissionId: 'submission-1', missionId: 'misi-4', fromDone: 3, toDone: 4,
  });
  assert.equal(consumeMissionCelebration('submission-1', storage), null);
  assert.equal(queueMissionCelebrationAfterSubmit('submission-1', 'misi-4', 4, true, storage), false);
});

test('penanda perayaan submission lain tidak dipakai oleh kelompok aktif', () => {
  const storage = memoryStorage();
  queueMissionCelebrationAfterSubmit('submission-1', 'misi-4', 4, true, storage);
  assert.equal(consumeMissionCelebration('submission-2', storage), null);
  assert.equal(consumeMissionCelebration('submission-1', storage), null);
});
