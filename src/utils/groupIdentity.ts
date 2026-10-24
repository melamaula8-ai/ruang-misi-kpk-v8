import type { AssessmentSubmission, TeamIdentity } from '../types';
import { isTeamIdentityComplete } from './teamIdentity';

/** Find this group's saved identity across its track submissions without crossing groups. */
export function findCompleteGroupIdentity(
  submissions: AssessmentSubmission[],
  active: AssessmentSubmission,
): TeamIdentity | undefined {
  if (isTeamIdentityComplete(active.team)) return active.team;

  const code = active.groupCode?.trim().toUpperCase();
  return submissions.find((submission) => {
    if (submission.id === active.id) return false;
    const sameGroup = code
      ? submission.groupCode?.trim().toUpperCase() === code
      : Boolean(active.groupId && submission.groupId === active.groupId);
    const sameClass = !active.classId || !submission.classId || submission.classId === active.classId;
    return sameGroup && sameClass && isTeamIdentityComplete(submission.team);
  })?.team;
}
