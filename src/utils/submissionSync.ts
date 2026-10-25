import type { AssessmentSubmission, PolyaStep } from '../types';

export type PendingMissionAnswerEdits = Record<string, Record<string, Partial<Record<PolyaStep, Record<string, string>>>>>;
export type PendingMissionCompletions = Record<string, string[]>;

export function enqueueSerializedWrite(
  queue: Promise<void>,
  write: () => Promise<void>,
): Promise<void> {
  return queue.then(write, write);
}

export function overlayPendingMissionAnswerEdits(
  submissions: AssessmentSubmission[],
  edits: PendingMissionAnswerEdits,
): AssessmentSubmission[] {
  return submissions.map((submission) => {
    const submissionEdits = edits[submission.id];
    if (!submissionEdits) return submission;

    const answers = { ...submission.answers };
    for (const [questionId, questionEdits] of Object.entries(submissionEdits)) {
      const currentAnswers = answers[questionId] || { step1: {}, step2: {}, step3: {}, step4: {} };
      const updatedAnswers = { ...currentAnswers };
      for (const [step, fieldEdits] of Object.entries(questionEdits)) {
        if (!fieldEdits) continue;
        const answerStep = step as PolyaStep;
        updatedAnswers[answerStep] = {
          ...updatedAnswers[answerStep],
          ...fieldEdits,
        };
      }
      answers[questionId] = updatedAnswers;
    }
    return { ...submission, answers };
  });
}

export function overlayPendingMissionCompletions(
  submissions: AssessmentSubmission[],
  completions: PendingMissionCompletions,
): AssessmentSubmission[] {
  return submissions.map((submission) => {
    const pendingIds = completions[submission.id];
    if (!pendingIds?.length) return submission;
    return {
      ...submission,
      completedMissionIds: [...new Set([...(submission.completedMissionIds || []), ...pendingIds])],
    };
  });
}

export function shouldApplyRemoteSnapshot(state: {
  isLatestRequest: boolean;
  sessionRevoked: boolean;
  hasPendingLocalChanges: boolean;
  answerRevisionAtRequest: number;
  currentAnswerRevision: number;
  writeRevisionAtRequest: number;
  currentWriteRevision: number;
}): boolean {
  if (!state.isLatestRequest) return false;
  if (state.sessionRevoked) return true;
  return !state.hasPendingLocalChanges &&
    state.answerRevisionAtRequest === state.currentAnswerRevision &&
    state.writeRevisionAtRequest === state.currentWriteRevision;
}

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
