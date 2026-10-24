export interface MissionCelebrationMarker {
  submissionId: string;
  missionId: string;
  fromDone: number;
  toDone: number;
}

const pendingKey = 'ruang-misi-pending-map-celebration';
const completedKey = (submissionId: string, missionId: string) =>
  `ruang-misi-map-celebrated:${submissionId}:${missionId}`;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const browserSessionStorage = (): StorageLike | undefined => {
  if (typeof window === 'undefined') return undefined;
  try { return window.sessionStorage; } catch { return undefined; }
};

/** Queue a one-time map animation after a mission reaches its completion rule. */
export const queueMissionCelebrationAfterMission = (
  submissionId: string,
  missionId: string,
  doneCount: number,
  missionCompleted: boolean,
  storage: StorageLike | undefined = browserSessionStorage(),
): boolean => {
  if (!missionCompleted || !submissionId || !missionId || !storage) return false;
  try {
    const completedId = completedKey(submissionId, missionId);
    if (storage.getItem(completedId)) return false;

    const toDone = Math.max(0, Math.min(4, Math.floor(doneCount)));
    const marker: MissionCelebrationMarker = {
      submissionId,
      missionId,
      fromDone: Math.max(0, toDone - 1),
      toDone,
    };
    storage.setItem(completedId, '1');
    storage.setItem(pendingKey, JSON.stringify(marker));
    return true;
  } catch {
    return false;
  }
};

/** Also support completion of all missions after a successful final submission. */
export const queueMissionCelebrationAfterSubmit = queueMissionCelebrationAfterMission;

/** Consume the marker on map entry so a refresh never replays the animation. */
export const consumeMissionCelebration = (
  submissionId: string,
  storage: StorageLike | undefined = browserSessionStorage(),
): MissionCelebrationMarker | null => {
  if (!storage) return null;
  let raw: string | null;
  try { raw = storage.getItem(pendingKey); } catch { return null; }
  if (!raw) return null;
  try { storage.removeItem(pendingKey); } catch { return null; }
  try {
    const marker = JSON.parse(raw) as MissionCelebrationMarker;
    if (
      marker.submissionId !== submissionId ||
      typeof marker.missionId !== 'string' ||
      !Number.isInteger(marker.fromDone) ||
      !Number.isInteger(marker.toDone) ||
      marker.fromDone < 0 || marker.fromDone > 4 ||
      marker.toDone < 0 || marker.toDone > 4
    ) return null;
    return marker;
  } catch {
    return null;
  }
};
