import type { AssessmentSubmission } from '../types';

/** Keep the active group's locally-created track submission until the server has received it. */
export function mergeGroupSubmissionsPreservingActive(
  remote: AssessmentSubmission[],
  local: AssessmentSubmission[],
  activeId: string,
  groupCode: string,
): AssessmentSubmission[] {
  const code = groupCode.trim().toUpperCase();
  if (!code) return remote;

  const remoteIds = new Set(remote.map((submission) => submission.id));
  const pendingGroupSubmissions = local.filter((submission) =>
    submission.id === activeId &&
    !remoteIds.has(submission.id) &&
    submission.groupCode?.toUpperCase() === code
  );
  return [...pendingGroupSubmissions, ...remote];
}
