export type LearningTrack = 'penjelajah' | 'pengembang' | 'inovator';

export type MissionContext = 'piket' | 'lampu' | 'olahraga' | 'agenda';

export type PolyaStep = 'step1' | 'step2' | 'step3' | 'step4';

export type AssessmentStatus =
  | 'in_progress'
  | 'submitted_pending_review'
  | 'time_expired_pending_review'
  | 'revision_requested'
  | 'reopened'
  | 'reviewed'
  | 'results_published';

export type GroupTokenStatus = 'available' | 'claimed' | 'disabled' | 'resubmit_allowed';

export interface GroupToken {
  id: string;
  code: string; // e.g. "KPK-4A-82"
  status: GroupTokenStatus;
  createdAt: string;
  claimedAt?: string;
  claimedBySubmissionId?: string;
  teamName?: string;
  resubmitCount?: number;
  notes?: string;
  classId?: string;
  className?: string;
  classCode?: string;
  revokedSubmissionIds?: string[];
}

export type ReviewVerdict = 'correct' | 'partially_correct' | 'needs_revision' | 'pending';

export interface TeamMember {
  name: string;
  role: string;
}

export interface TeamIdentity {
  teamName: string;
  schoolName: string;
  members: TeamMember[];
  agreement: string;
}

export interface PolyaField {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'textarea' | 'scaffold';
  scaffoldPrefix?: string;
  scaffoldSuffix?: string;
  helperText?: string;
  expectedAnswer?: string;
}

export interface MissionQuestion {
  id: string;
  missionNumber: number;
  context: MissionContext;
  track: LearningTrack;
  title: string;
  story: string;
  num1: number;
  num2: number;
  startDate?: string;
  unit: string;
  // Polya Steps Definitions
  step1Title: string;
  step1Prompt: string;
  step1Fields: PolyaField[];

  step2Title: string;
  step2Prompt: string;
  step2Fields: PolyaField[];

  step3Title: string;
  step3Prompt: string;
  step3Fields: PolyaField[];

  step4Title: string;
  step4Prompt: string;
  step4Fields: PolyaField[];

  didacticHints: {
    step1: string[];
    step2: string[];
    step3: string[];
    step4: string[];
  };

  internalKey: {
    kpk: number;
    finalAnswer: string;
    multiples1: number[];
    multiples2: number[];
  };

  explanation: string;
  practiceAdvice: string;
}

export interface MissionSubmissionAnswers {
  step1: Record<string, string>;
  step2: Record<string, string>;
  step3: Record<string, string>;
  step4: Record<string, string>;
  completed?: boolean;
}

export interface PresentationData {
  problemSolved: string;
  knownInformation: string;
  strategyUsed: string;
  lcmFound: string;
  verificationMethod: string;
  confidenceReason: string;
  groupConclusion: string;
  completed?: boolean;
}

export interface ReflectionData {
  easyPart: string;
  confusingPart: string;
  challengingMission: string;
  mostHelpfulSupport: string;
  didRecheck: string;
  correctionPlan: string;
  lcmLearning: string;
  futureDifference: string;
  completed?: boolean;
}

export interface PolyaStepScore {
  score: number;
  maxScore: number;
  verdict: ReviewVerdict;
  teacherNote?: string;
}

export interface MissionEvaluation {
  step1: PolyaStepScore;
  step2: PolyaStepScore;
  step3: PolyaStepScore;
  step4: PolyaStepScore;
  totalScore: number;
  missionVerdict: ReviewVerdict;
  feedback: string;
}

export interface PresentationEvaluation {
  accuracy: number;
  strategy: number;
  collaboration: number;
  totalScore: number;
  comments: string;
}

export interface FullEvaluation {
  missions: Record<number, MissionEvaluation>;
  presentation: PresentationEvaluation;
  totalScore: number;
  generalFeedback: string;
  practiceRecommendations: string[];
  reviewedBy: string;
  publishedAt?: string;
}

export interface AssessmentSubmission {
  id: string;
  groupId?: string;
  groupCode?: string;
  classId?: string;
  version?: number;
  team: TeamIdentity;
  track: LearningTrack;
  answers: Record<string, MissionSubmissionAnswers>; // questionId -> answers
  presentation: PresentationData;
  reflection: ReflectionData;
  status: AssessmentStatus;
  startedAt: string;
  timerStartedAtTimestamp?: number;
  targetEndTimestamp?: number;
  isTimerRunning?: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  reopenedAt?: string;
  reopenedReason?: string;
  reopenedBy?: string;
  revisionNotes?: string;
  allowedRevisionSections?: string[]; // e.g. ['misi-1', 'misi-2', 'presentation', 'reflection']
  evaluation?: FullEvaluation;
  history: Array<{
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }>;
}

export interface RubricConfig {
  [mission: `mission${number}`]: { step1: number; step2: number; step3: number; step4: number };
  mission1: { step1: number; step2: number; step3: number; step4: number };
  mission2: { step1: number; step2: number; step3: number; step4: number };
  mission3: { step1: number; step2: number; step3: number; step4: number };
  mission4: { step1: number; step2: number; step3: number; step4: number };
  presentation: { accuracy: number; strategy: number; collaboration: number };
}
