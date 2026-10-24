export const isMissionMarkedComplete = (completedMissionIds: string[] | undefined, missionId: string) =>
  Boolean(completedMissionIds?.includes(missionId));

export const addCompletedMissionId = (completedMissionIds: string[] | undefined, missionId: string) =>
  isMissionMarkedComplete(completedMissionIds, missionId)
    ? completedMissionIds!
    : [...(completedMissionIds || []), missionId];
