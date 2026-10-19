import type { MissionQuestion, MissionSubmissionAnswers } from '../types';

export type PolyaAnswerStep = 'step1' | 'step2' | 'step3' | 'step4';

export const getQuestionAnswerRows = (
  question: MissionQuestion,
  step: PolyaAnswerStep,
  answers?: MissionSubmissionAnswers,
) => {
  const fieldKey = `${step}Fields` as const;
  const fields = question[fieldKey] || [];
  const stepAnswers = answers?.[step] || {};
  const known = new Set(fields.map((field) => field.id));
  const rows = fields.map((field) => ({
    id: field.id,
    label: field.label,
    answer: stepAnswers[field.id] || '',
    expectedAnswer: field.expectedAnswer || '',
  }));
  const legacyRows = Object.entries(stepAnswers)
    .filter(([id, answer]) => !known.has(id) && Boolean(answer?.trim()))
    .map(([id, answer]) => ({ id, label: id, answer, expectedAnswer: '' }));
  return [...rows, ...legacyRows];
};
