import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  LearningTrack,
  AssessmentSubmission,
  TeamIdentity,
  MissionSubmissionAnswers,
  PresentationData,
  ReflectionData,
  MissionQuestion,
  RubricConfig,
  FullEvaluation,
  GroupToken,
  GroupTokenStatus,
} from '../types';
import {
  INITIAL_QUESTION_BANK,
  migrateInnovatorProblemAnalysis,
  migrateInnovatorProblemAnswers,
} from '../data/questionBank';
import { calculateLCM, addDaysToDate } from '../utils/math';

interface AssessmentContextType {
  validateStudentClassCode: (code: string) => Promise<{ success: boolean; message: string }>;
  learningContent: LearningContentState;
  saveLearningDraft: (draft: LearningContent) => Promise<{ success: boolean; message: string }>;
  publishLearningDraft: (draft: LearningContent) => Promise<{ success: boolean; message: string }>;
  // Questions Bank
  questions: MissionQuestion[];
  updateQuestion: (updated: MissionQuestion) => void;
  resetQuestionsToDefault: () => void;

  // Group Tokens (Section A)
  groupTokens: GroupToken[];
  activeGroupToken: GroupToken | null;
  hasVerifiedGroupToken: boolean;
  createGroupTokens: (quantity: number, customPrefix?: string) => GroupToken[];
  createStudentGroupToken: () => Promise<{ success: boolean; message: string; code?: string }>;
  toggleGroupTokenStatus: (id: string, newStatus: GroupTokenStatus) => void;
  deleteGroupToken: (id: string) => { success: boolean; message: string };
  replaceGroupToken: (id: string) => GroupToken;
  verifyAndClaimGroupToken: (code: string) => Promise<{ success: boolean; message: string; isResume?: boolean }>; 
  logoutGroupToken: () => void;

  // Active Student Session
  activeSubmission: AssessmentSubmission;
  currentTrack: LearningTrack;
  setCurrentTrack: (track: LearningTrack) => void;
  updateTeamIdentity: (team: TeamIdentity) => void;
  clearTeamIdentity: () => void;
  updateMissionAnswer: (
    questionId: string,
    step: 'step1' | 'step2' | 'step3' | 'step4',
    fieldId: string,
    value: string
  ) => void;
  updatePresentation: (data: Partial<PresentationData>) => void;
  updateReflection: (data: Partial<ReflectionData>) => void;
  submitAssessment: () => { success: boolean; message: string };

  // 25-Minute Countdown Timer (Section B)
  timerSeconds: number;
  isTimerActive: boolean;
  hasTimeExpired: boolean;
  startMissionTimer: () => void;
  resetTimer: () => void;

  // Multiple Submissions Management (for Classroom use)
  allSubmissions: AssessmentSubmission[];
  activeSubmissionId: string;
  switchActiveSubmission: (id: string) => void;
  createNewSubmission: (groupId?: string, groupCode?: string) => AssessmentSubmission;
  deleteSubmission: (id: string) => void;

  // Teacher Administration (Section C & D)
  isTeacherLoggedIn: boolean;
  loginTeacher: (u: string, p: string) => Promise<{ success: boolean; message: string }>;
  loginTeacherWithGoogle: (credential: string) => Promise<{ success: boolean; message: string }>;
  registerTeacher: (credential: string, u: string, p: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  logoutTeacher: () => void;
  trackLockConfig: { isLocked: boolean; lockedTrack: LearningTrack | null };
  setTrackLockConfig: (config: { isLocked: boolean; lockedTrack: LearningTrack | null }) => void;
  rubricConfig: RubricConfig;
  updateRubricConfig: (config: RubricConfig) => void;

  // Teacher Review & Submissions Actions
  saveEvaluationDraft: (submissionId: string, evaluation: FullEvaluation) => void;
  publishEvaluationResults: (submissionId: string, evaluation: FullEvaluation) => { success: boolean; message: string };
  saveEvaluation: (submissionId: string, evaluation: FullEvaluation) => void;
  publishResults: (submissionId: string) => void;
  deleteSubmissionResponse: (submissionId: string, releaseToken: boolean) => { success: boolean; message: string };
  allowResubmission: (submissionId: string, retainHistoryAsVersion: boolean, teacherName: string) => void;
  requestRevision: (submissionId: string, notes: string, allowedSections: string[]) => void;
  reopenAssessment: (submissionId: string, reason: string, teacherName: string) => void;
  unlockActiveSubmission: () => void;

  // Custom Logo Configuration
  customLogoUrl: string | null;
  updateCustomLogo: (logoUrlOrBase64: string | null) => void;
  cloudStatus: 'connecting' | 'online' | 'offline';
  sessionDeletedNotice: boolean;
  dismissSessionDeletedNotice: () => void;
}

export interface LearningContent {
  objective: string;
  materials: string;
  instructions: string;
  hints: string;
  tracks: Record<LearningTrack, { name: string; material: string; cases: string; activity: string; difficulty: string }>;
  questions: MissionQuestion[];
}
export interface LearningContentState { draft: LearningContent; published: LearningContent }

const makeDefaultLearningContent = (bank: MissionQuestion[]): LearningContent => ({
  objective: 'Menentukan KPK dari dua bilangan melalui masalah sehari-hari, menjelaskan strategi, dan memeriksa jawaban bersama tim.',
  materials: 'Papan tulis atau kertas, pensil warna, tabel kelipatan, garis bilangan, dan kalender.',
  instructions: 'Baca cerita dengan teliti, bagi peran dalam tim, tulis strategi pada empat tahap, lalu periksa jawaban sebelum dikirim.',
  hints: 'Mulai dengan menuliskan kelipatan kedua bilangan. Cari bilangan pertama yang muncul pada kedua daftar.',
  tracks: {
    penjelajah: { name: 'Penjelajah', material: 'Tabel kelipatan berpandu dan contoh langkah.', cases: 'Jadwal piket, lampu lalu lintas, olahraga, dan agenda sekolah.', activity: 'Lengkapi pola kelipatan dengan petunjuk bertahap.', difficulty: 'Terbimbing' },
    pengembang: { name: 'Pengembang', material: 'Ruang untuk menyusun daftar kelipatan dan strategi sendiri.', cases: 'Jadwal berulang dan kalender kegiatan sekolah.', activity: 'Pilih strategi kelompok dan jelaskan cara menemukan KPK.', difficulty: 'Mandiri dengan refleksi' },
    inovator: { name: 'Inovator', material: 'Lembar investigasi terbuka untuk pembuktian strategi.', cases: 'Kasus jadwal dengan penalaran dan tanggal yang lebih menantang.', activity: 'Buktikan hasil, periksa minimalitas KPK, dan bandingkan strategi.', difficulty: 'Tantangan' },
  },
  questions: bank,
});

const DEFAULT_TEAM: TeamIdentity = {
  teamName: '',
  schoolName: '',
  members: [
    { name: '', role: 'Pembaca masalah' },
    { name: '', role: 'Pencatat informasi' },
    { name: '', role: 'Penyusun strategi' },
    { name: '', role: 'Pemeriksa perhitungan' },
    { name: '', role: 'Penyaji hasil' },
  ],
  agreement: 'Kami sepakat saling mendengarkan, bekerja sama secara teliti, dan memeriksa setiap perhitungan.',
};

const DEFAULT_PRESENTATION: PresentationData = {
  problemSolved: '',
  knownInformation: '',
  strategyUsed: '',
  lcmFound: '',
  verificationMethod: '',
  confidenceReason: '',
  groupConclusion: '',
};

const DEFAULT_REFLECTION: ReflectionData = {
  easyPart: '',
  confusingPart: '',
  challengingMission: '',
  mostHelpfulSupport: '',
  didRecheck: '',
  correctionPlan: '',
  lcmLearning: '',
  futureDifference: '',
};

const DEFAULT_RUBRIC: RubricConfig = {
  mission1: { step1: 4, step2: 4, step3: 8, step4: 4 },
  mission2: { step1: 4, step2: 4, step3: 8, step4: 4 },
  mission3: { step1: 4, step2: 4, step3: 8, step4: 4 },
  mission4: { step1: 4, step2: 4, step3: 8, step4: 4 },
  presentation: { accuracy: 8, strategy: 6, collaboration: 6 },
};

const STORAGE_KEYS = {
  QUESTIONS: 'ruang_misi_kpk_questions_v1',
  SUBMISSIONS: 'ruang_misi_kpk_submissions_v1',
  ACTIVE_ID: 'ruang_misi_kpk_active_id_v1',
  TEACHER_AUTH: 'ruang_misi_kpk_teacher_auth_v1',
  TRACK_LOCK: 'ruang_misi_kpk_track_lock_v1',
  RUBRIC: 'ruang_misi_kpk_rubric_v1',
  GROUP_TOKENS: 'ruang_misi_kpk_group_tokens_v1',
  ACTIVE_TOKEN_CODE: 'ruang_misi_kpk_active_token_code_v1',
};

// Generates a collision-resistant unique token code with format: PREFIX-NUMLETTER-HEX (e.g. KPK-4A-82)
function generateUniqueGroupCode(existingCodes: Set<string>, prefix: string = 'KPK'): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let attempts = 0;
  while (attempts < 1000) {
    attempts++;
    const num = Math.floor(Math.random() * 9) + 1; // 1-9
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const hex = Math.floor(10 + Math.random() * 90); // 10-99
    const code = `${prefix}-${num}${letter}-${hex}`;
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

function createFreshSubmission(groupId?: string, groupCode?: string): AssessmentSubmission {
  const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  return {
    id,
    groupId,
    groupCode,
    version: 1,
    team: {
      teamName: '',
      schoolName: '',
      members: [
        { name: '', role: 'Pembaca masalah' },
        { name: '', role: 'Pencatat informasi' },
        { name: '', role: 'Penyusun strategi' },
        { name: '', role: 'Pemeriksa perhitungan' },
        { name: '', role: 'Penyaji hasil' },
      ],
      agreement: 'Kami sepakat saling mendengarkan, bekerja sama secara teliti, dan memeriksa setiap perhitungan.',
    },
    track: 'penjelajah',
    answers: {},
    presentation: { ...DEFAULT_PRESENTATION },
    reflection: { ...DEFAULT_REFLECTION },
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    isTimerRunning: false,
    history: [
      {
        timestamp: new Date().toISOString(),
        action: 'Sesi asesmen dimulai',
        actor: 'Sistem',
      },
    ],
  };
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Questions Bank
  const [questions, setQuestions] = useState<MissionQuestion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (stored) return migrateInnovatorProblemAnalysis(JSON.parse(stored));
    } catch {}
    return INITIAL_QUESTION_BANK;
  });
  const [learningContent, setLearningContent] = useState<LearningContentState>(() => {
    const initial = makeDefaultLearningContent(INITIAL_QUESTION_BANK);
    return { draft: initial, published: initial };
  });

  // Track Lock Config
  const [trackLockConfig, setTrackLockConfig] = useState<{
    isLocked: boolean;
    lockedTrack: LearningTrack | null;
  }>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRACK_LOCK);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { isLocked: false, lockedTrack: null };
  });

  // Rubric Config
  const [rubricConfig, setRubricConfig] = useState<RubricConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RUBRIC);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_RUBRIC;
  });

  // Teacher Authentication state
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('ruang_misi_kpk_teacher_token'));
    } catch {
      return false;
    }
  });

  // Group Tokens (Section A)
  const [groupTokens, setGroupTokens] = useState<GroupToken[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GROUP_TOKENS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const demoCodes = new Set(['KPK-1A-91', 'KPK-2B-47', 'KPK-3C-55', 'KPK-4D-68', 'KPK-5E-72', 'KPK-6F-83']);
          return parsed.filter((token: GroupToken) => !(demoCodes.has(token.code) && /^tok_[1-6]$/.test(token.id) && token.status === 'available' && !token.claimedBySubmissionId));
        }
      }
    } catch {}

    // ID kelas tidak dibuat otomatis. Guru membuat ID unik dari dashboard.
    return [];
  });

  // Active verified token code on this browser session
  const [activeTokenCode, setActiveTokenCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN_CODE) || '';
    } catch {
      return '';
    }
  });

  // All Submissions List
  const [allSubmissions, setAllSubmissions] = useState<AssessmentSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migrateInnovatorProblemAnswers(parsed.map((s: AssessmentSubmission) => {
            // Check if this submission has real student work
            const hasRealAnswers =
              s.status !== 'in_progress' ||
              Object.keys(s.answers || {}).some(
                (k) =>
                  s.answers[k]?.step1?.story_summary ||
                  s.answers[k]?.step3?.lcm_value ||
                  s.answers[k]?.step3?.final_date
              );

            const isDummyName = (name?: string) => {
              if (!name) return true;
              const lower = name.trim().toLowerCase();
              return (
                lower === 'kelompok 1' ||
                lower === 'kelompok' ||
                lower.startsWith('kelompok 1 -') ||
                lower === 'contoh tim' ||
                ['budi', 'siti', 'ahmad', 'dewi', 'rian', 'andi', 'siswa 1', 'siswa 2'].includes(lower)
              );
            };

            // If unstarted/no real answers, sanitize dummy names so students start with blank fields
            if (!hasRealAnswers) {
              return {
                ...s,
                team: {
                  ...DEFAULT_TEAM,
                  ...s.team,
                  teamName: isDummyName(s.team?.teamName) ? '' : (s.team?.teamName || ''),
                  schoolName: s.team?.schoolName || '',
                  members: (s.team?.members && s.team.members.length > 0
                    ? s.team.members
                    : DEFAULT_TEAM.members
                  ).map((m: any) => ({
                    ...m,
                    name: isDummyName(m.name) ? '' : (m.name || ''),
                  })),
                },
                reflection: {
                  ...DEFAULT_REFLECTION,
                  ...(s.reflection || {}),
                },
              };
            }

            return {
              ...s,
              reflection: {
                ...DEFAULT_REFLECTION,
                ...(s.reflection || {}),
              },
            };
          }));
        }
      }
    } catch {}
    const initial = createFreshSubmission();
    return [initial];
  });

  // Active Student Submission ID
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (stored) return stored;
    } catch {}
    return allSubmissions[0]?.id || '';
  });

  // Custom Logo Storage
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ruang_misi_kpk_custom_logo');
    } catch {
      return null;
    }
  });

  const updateCustomLogo = (logoUrlOrBase64: string | null) => {
    setCustomLogoUrl(logoUrlOrBase64);
    try {
      if (logoUrlOrBase64) {
        localStorage.setItem('ruang_misi_kpk_custom_logo', logoUrlOrBase64);
      } else {
        localStorage.removeItem('ruang_misi_kpk_custom_logo');
      }
    } catch {}
  };

  // Shared database connection status. Local storage remains a cache, not the source of truth.
  const [cloudStatus, setCloudStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [cloudReady, setCloudReady] = useState(false);
  const [sessionDeletedNotice, setSessionDeletedNotice] = useState(false);
  const lastPushedSnapshot = useRef('');
  const lastRemoteSnapshot = useRef('');
  const applyingRemote = useRef(false);
  const cloudHeaders = (jsonBody = false): HeadersInit => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (jsonBody) headers['Content-Type'] = 'application/json';
    const token = sessionStorage.getItem('ruang_misi_kpk_teacher_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };
  const persistLearningContent = async (draft: LearningContent, publish: boolean) => {
    if (!isTeacherLoggedIn) return { success: false, message: 'Masuk sebagai guru untuk mengubah materi.' };
    if (cloudStatus !== 'online') return { success: false, message: 'Database belum terhubung. Perubahan belum tersimpan.' };
    const next: LearningContentState = {
      draft,
      published: publish ? draft : learningContent.published,
    };
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: cloudHeaders(true),
        body: JSON.stringify({ settings: { learningContent: next } }),
      });
      const result = await response.json().catch(() => ({} as { error?: string }));
      if (!response.ok) return { success: false, message: result.error || 'Materi gagal disimpan ke server.' };
      setLearningContent(next);
      if (publish) setQuestions(draft.questions);
      setCloudStatus('online');
      return { success: true, message: publish ? 'Materi berhasil dipublikasikan untuk murid.' : 'Draf materi berhasil disimpan.' };
    } catch {
      setCloudStatus('offline');
      return { success: false, message: 'Koneksi terputus. Perubahan belum tersimpan.' };
    }
  };
  const validateStudentClassCode = async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { success: false, message: 'Masukkan kode kelas dari gurumu.' };
    try {
      const response = await fetch(`/api/classes?code=${encodeURIComponent(normalized)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      const data = await response.json().catch(() => ({} as { error?: string }));
      return response.ok
        ? { success: true, message: 'Kode kelas berhasil diverifikasi.' }
        : { success: false, message: data.error || 'Kode kelas tidak dapat diverifikasi.' };
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.' };
    }
  };
  const cloudUrl = () => {
    if (!isTeacherLoggedIn && activeTokenCode) {
      return `/api/sync?groupCode=${encodeURIComponent(activeTokenCode)}&sessionId=${encodeURIComponent(activeSubmissionId)}`;
    }
    return '/api/sync';
  };

  // Dipanggil saat server memastikan sesi ini sudah dihapus guru: buang sisa progres lokal
  // dan mulai dari sesi kosong supaya data lama tidak bisa tersimpan lagi.
  const resetDeletedStudentSession = () => {
    const freshSubmission = createFreshSubmission();
    applyingRemote.current = true;
    setAllSubmissions([freshSubmission]);
    setActiveSubmissionId(freshSubmission.id);
    setActiveTokenCode('');
    setSessionDeletedNotice(true);
    lastPushedSnapshot.current = '';
    window.setTimeout(() => { applyingRemote.current = false; }, 0);
  };

  const buildSnapshot = (overrides?: {
    tokens?: GroupToken[]; submissions?: AssessmentSubmission[]; questions?: MissionQuestion[];
    trackLock?: { isLocked: boolean; lockedTrack: LearningTrack | null }; rubric?: RubricConfig; logo?: string | null; learningContent?: LearningContentState;
  }) => {
    const rows = overrides?.submissions ?? allSubmissions;
    const settings: Record<string, unknown> = {
      questions: overrides?.questions ?? questions,
      trackLock: overrides?.trackLock ?? trackLockConfig,
      customLogo: overrides?.logo !== undefined ? overrides.logo : customLogoUrl,
    };
    if (isTeacherLoggedIn) settings.rubric = overrides?.rubric ?? rubricConfig;
    if (isTeacherLoggedIn) settings.learningContent = overrides?.learningContent ?? learningContent;
    return JSON.stringify({
      tokens: overrides?.tokens ?? groupTokens,
      submissions: isTeacherLoggedIn ? rows : rows.filter((row) => activeTokenCode && row.groupCode?.toUpperCase() === activeTokenCode.toUpperCase()),
      settings,
    });
  };

  const applyCloudData = (data: any) => {
    applyingRemote.current = true;
    const publishedBank = data.settings?.learningContent?.published?.questions ?? data.settings?.learningContent?.questions;
    const remoteBank = Array.isArray(publishedBank) ? publishedBank : data.settings?.questions;
    const incomingQuestions = Array.isArray(remoteBank) && remoteBank.length
      ? migrateInnovatorProblemAnalysis(remoteBank)
      : questions;
    const incomingSubmissions = Array.isArray(data.submissions)
      ? migrateInnovatorProblemAnswers(data.submissions)
      : null;
    const incomingLearning = data.settings?.learningContent as LearningContentState | undefined;
    if (incomingLearning?.draft && incomingLearning?.published) {
      setLearningContent(incomingLearning);
      const publishedQuestions = incomingLearning.published.questions;
      if (Array.isArray(publishedQuestions) && publishedQuestions.length) setQuestions(migrateInnovatorProblemAnalysis(publishedQuestions));
    } else if (!isTeacherLoggedIn && Array.isArray(data.settings?.learningContent?.questions)) {
      const publicContent = data.settings.learningContent as LearningContent;
      setLearningContent({ draft: publicContent, published: publicContent });
      if (publicContent.questions.length) setQuestions(migrateInnovatorProblemAnalysis(publicContent.questions));
    } else if (Array.isArray(data.settings?.questions) && data.settings.questions.length) {
      const migratedQuestions = migrateInnovatorProblemAnalysis(data.settings.questions);
      const seeded = makeDefaultLearningContent(migratedQuestions);
      setLearningContent({ draft: seeded, published: seeded });
    }
    if (Array.isArray(data.tokens)) {
      setGroupTokens((previousTokens) => data.tokens.map((remoteToken: GroupToken) => {
        const localToken = previousTokens.find((item) => item.id === remoteToken.id && item.code.toUpperCase() === remoteToken.code.toUpperCase());
        const matchingSubmission = incomingSubmissions?.find((submission) =>
          submission.groupId === remoteToken.id && submission.groupCode?.toUpperCase() === remoteToken.code.toUpperCase()
        );
        const claimedBySubmissionId = matchingSubmission?.id ||
          (remoteToken.status === 'claimed' && localToken?.status === 'claimed' ? localToken.claimedBySubmissionId : undefined);
        if (remoteToken.status !== 'claimed' || !claimedBySubmissionId) return remoteToken;
        return {
          ...remoteToken,
          claimedAt: localToken?.claimedAt,
          claimedBySubmissionId,
          teamName: matchingSubmission?.team?.teamName || localToken?.teamName || '',
        };
      }));
    }
    if (incomingSubmissions) {
      // Server memastikan lewat `sessionRevoked`. Menebak dari status ID kelompok bisa salah
      // (mis. tepat setelah klaim, sebelum data pertama tersimpan) dan mengeluarkan siswa tanpa sebab.
      const activeSessionWasReleased =
        !isTeacherLoggedIn && Boolean(activeTokenCode) && data.sessionRevoked === true;

      if (activeSessionWasReleased) {
        // A teacher deleted this active group on another device. Drop its local
        // unsent progress and start clean so it cannot be restored by this client.
        const freshSubmission = createFreshSubmission();
        setAllSubmissions([freshSubmission]);
        setActiveSubmissionId(freshSubmission.id);
        setActiveTokenCode('');
        setSessionDeletedNotice(true);
      } else if (incomingSubmissions.length > 0) {
        setAllSubmissions(incomingSubmissions);
        if (!incomingSubmissions.some((submission) => submission.id === activeSubmissionId)) {
          setActiveSubmissionId(incomingSubmissions[0].id);
        }
      } else if (isTeacherLoggedIn) {
        const freshSubmission = createFreshSubmission();
        setAllSubmissions([freshSubmission]);
        setActiveSubmissionId(freshSubmission.id);
      }
    }
    if (Array.isArray(data.settings?.questions) && data.settings.questions.length) {
      setQuestions(incomingQuestions);
    }
    if (data.settings?.trackLock && typeof data.settings.trackLock === 'object') setTrackLockConfig(data.settings.trackLock);
    if (data.settings?.rubric && typeof data.settings.rubric === 'object') setRubricConfig(data.settings.rubric);
    if (typeof data.settings?.customLogo === 'string' || data.settings?.customLogo === null) setCustomLogoUrl(data.settings.customLogo);
    const questionsBeforeMigration =
      isTeacherLoggedIn &&
      Array.isArray(data.settings?.questions) &&
      data.settings.questions.length
        ? data.settings.questions
        : incomingQuestions;
    const snapshot = buildSnapshot({
      tokens: Array.isArray(data.tokens) ? data.tokens : [],
      submissions: Array.isArray(data.submissions) ? data.submissions : [],
      questions: questionsBeforeMigration,
      trackLock: data.settings?.trackLock ?? trackLockConfig,
      rubric: data.settings?.rubric ?? rubricConfig,
      logo: data.settings && 'customLogo' in data.settings ? data.settings.customLogo : customLogoUrl,
      learningContent: incomingLearning ?? (Array.isArray(data.settings?.questions) && data.settings.questions.length
        ? { draft: makeDefaultLearningContent(migrateInnovatorProblemAnalysis(data.settings.questions)), published: makeDefaultLearningContent(migrateInnovatorProblemAnalysis(data.settings.questions)) }
        : learningContent),
    });
    lastPushedSnapshot.current = snapshot;
    lastRemoteSnapshot.current = JSON.stringify(data);
    window.setTimeout(() => { applyingRemote.current = false; }, 0);
  };

  // First connection: hydrate from the shared database; seed it only when the database is empty.
  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      try {
        const response = await fetch(cloudUrl(), { headers: cloudHeaders(), cache: 'no-store' });
        if (response.status === 401 && isTeacherLoggedIn) {
          // Sesi guru kedaluwarsa (8 jam) atau token tidak sah: keluar agar login ulang bisa dilakukan.
          if (!cancelled) logoutTeacher();
          return;
        }
        if (!response.ok) throw new Error(`Database API returned ${response.status}`);
        const data = await response.json();
        if (cancelled) return;
        if (data.initialized) {
          applyCloudData(data);
        } else if (isTeacherLoggedIn) {
          const payload = JSON.parse(buildSnapshot());
          const seed = await fetch('/api/sync', {
            method: 'POST', headers: cloudHeaders(true),
            body: JSON.stringify({ upsertTokens: payload.tokens, upsertSubmissions: payload.submissions, settings: payload.settings }),
          });
          if (!seed.ok) throw new Error(`Database initialization returned ${seed.status}`);
          lastPushedSnapshot.current = buildSnapshot();
          lastRemoteSnapshot.current = JSON.stringify(await (await fetch('/api/sync', { headers: cloudHeaders(), cache: 'no-store' })).json());
        } else {
          // Do not let the first student seed or initialize the shared database.
          setCloudStatus('offline');
          setCloudReady(false);
          return;
        }
        setCloudStatus('online');
        setCloudReady(true);
      } catch (error) {
        console.error('[Ruang Misi KPK] Shared database connection failed:', error);
        if (!cancelled) { setCloudStatus('offline'); setCloudReady(true); }
      }
    };
    void connect();
    return () => { cancelled = true; };
    // Initial connection deliberately runs once; it hydrates current browser state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherLoggedIn]);

  // Send only changed records to the shared database. The API preserves records not changed by this device.
  useEffect(() => {
    if (!cloudReady || applyingRemote.current) return;
    const current = JSON.parse(buildSnapshot());
    const currentString = JSON.stringify(current);
    if (currentString === lastPushedSnapshot.current) return;
    const timeout = window.setTimeout(async () => {
      try {
        const previous = lastPushedSnapshot.current ? JSON.parse(lastPushedSnapshot.current) : { tokens: [], submissions: [], settings: {} };
        const byId = (rows: any[]) => new Map((rows || []).map((row: any) => [row.id, row]));
        const previousTokens = byId(previous.tokens || []), currentTokens = byId(current.tokens || []);
        const previousSubs = byId(previous.submissions || []), currentSubs = byId(current.submissions || []);
        const changed = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);
        const settings: Record<string, unknown> = {};
        for (const key of ['questions', 'trackLock', 'rubric', 'customLogo', 'learningContent']) {
          if (changed(previous.settings?.[key], current.settings?.[key])) settings[key] = current.settings?.[key] ?? null;
        }
        const payload = {
          upsertTokens: [...currentTokens.values()].filter((row: any) => !previousTokens.has(row.id) || changed(previousTokens.get(row.id), row)),
          deleteTokens: [...previousTokens.keys()].filter((id: string) => !currentTokens.has(id)),
          upsertSubmissions: [...currentSubs.values()].filter((row: any) => !previousSubs.has(row.id) || changed(previousSubs.get(row.id), row)),
          deleteSubmissions: [...previousSubs.keys()].filter((id: string) => !currentSubs.has(id)),
          settings,
        };
        if (!payload.upsertTokens.length && !payload.deleteTokens.length && !payload.upsertSubmissions.length && !payload.deleteSubmissions.length && !Object.keys(settings).length) return;
        const response = await fetch('/api/sync', { method: 'POST', headers: cloudHeaders(true), body: JSON.stringify(payload) });
        if (!response.ok) {
          const failure = await response.json().catch(() => ({} as { code?: string }));
          if (!isTeacherLoggedIn && failure?.code === 'SESSION_DELETED') {
            // Guru sudah menghapus sesi ini: jangan terus mencoba menyimpan data yang sudah dibuang.
            resetDeletedStudentSession();
            return;
          }
          throw new Error(`Database save returned ${response.status}`);
        }
        lastPushedSnapshot.current = currentString;
        setCloudStatus('online');
      } catch (error) {
        console.error('[Ruang Misi KPK] Could not sync changes:', error);
        setCloudStatus('offline');
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudReady, groupTokens, allSubmissions, questions, trackLockConfig, rubricConfig, customLogoUrl, learningContent]);

  // Tarik perubahan dari perangkat lain. Siswa cukup tiap 8 detik, guru tiap 5 detik, dan tab yang
  // tersembunyi tidak ikut menarik data (menghemat kuota gratis Cloudflare dan data seluler siswa).
  // Perubahan lokal yang belum terkirim tidak pernah ditimpa.
  useEffect(() => {
    if (!cloudReady) return;
    const pollOnce = async () => {
      try {
        const response = await fetch(cloudUrl(), { headers: cloudHeaders(), cache: 'no-store' });
        if (response.status === 401 && isTeacherLoggedIn) { logoutTeacher(); return; }
        if (!response.ok) throw new Error(`Database poll returned ${response.status}`);
        const data = await response.json();
        const remoteString = JSON.stringify(data);
        const activeSessionWasDeleted =
          !isTeacherLoggedIn && Boolean(activeTokenCode) && data.sessionRevoked === true;
        if (
          remoteString !== lastRemoteSnapshot.current &&
          (activeSessionWasDeleted ||
            !lastPushedSnapshot.current ||
            buildSnapshot() === lastPushedSnapshot.current)
        ) {
          applyCloudData(data);
        }
        setCloudStatus('online');
      } catch { setCloudStatus('offline'); }
    };
    const poll = window.setInterval(() => { if (!document.hidden) void pollOnce(); }, isTeacherLoggedIn ? 5000 : 8000);
    const onVisible = () => { if (!document.hidden) void pollOnce(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(poll); document.removeEventListener('visibilitychange', onVisible); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudReady, isTeacherLoggedIn, activeTokenCode, activeSubmissionId]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUP_TOKENS, JSON.stringify(groupTokens));
    } catch {}
  }, [groupTokens]);

  useEffect(() => {
    try {
      if (activeTokenCode) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TOKEN_CODE, activeTokenCode);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN_CODE);
      }
    } catch {}
  }, [activeTokenCode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(allSubmissions));
    } catch {}
  }, [allSubmissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeSubmissionId);
    } catch {}
  }, [activeSubmissionId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACK_LOCK, JSON.stringify(trackLockConfig));
    } catch {}
  }, [trackLockConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RUBRIC, JSON.stringify(rubricConfig));
    } catch {}
  }, [rubricConfig]);

  // Active Submission Reference
  const activeSubmission =
    allSubmissions.find((s) => s.id === activeSubmissionId) ||
    allSubmissions[0] ||
    createFreshSubmission();

  const effectiveActiveId = activeSubmission.id;

  // Active Group Token Reference
  const activeGroupToken = groupTokens.find(
    (t) =>
      (activeSubmission.groupId && t.id === activeSubmission.groupId) ||
      (activeSubmission.groupCode &&
        t.code.toUpperCase() === activeSubmission.groupCode.toUpperCase()) ||
      (t.code === activeTokenCode && t.claimedBySubmissionId === activeSubmission.id)
  ) || null;

  const hasVerifiedGroupToken = Boolean(activeGroupToken && activeGroupToken.status === 'claimed');

  // ==========================================
  // SECTION A: SISTEM ID KELOMPOK UNIK
  // ==========================================

  // A1: Pembuatan ID Kelompok oleh Guru dengan jaminan keunikan 100%
  const createGroupTokens = (quantity: number, customPrefix: string = 'KPK'): GroupToken[] => {
    const count = Math.max(1, Math.min(50, quantity));
    const existing = new Set(groupTokens.map((t) => t.code.toUpperCase()));
    const newTokens: GroupToken[] = [];

    for (let i = 0; i < count; i++) {
      const uniqueCode = generateUniqueGroupCode(existing, customPrefix.toUpperCase());
      existing.add(uniqueCode);

      const token: GroupToken = {
        id: 'tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        code: uniqueCode,
        status: 'available',
        createdAt: new Date().toISOString(),
      };
      newTokens.push(token);
    }

    setGroupTokens((prev) => [...prev, ...newTokens]);
    return newTokens;
  };

  const createStudentGroupToken = async (): Promise<{ success: boolean; message: string; code?: string }> => {
    try {
      const response = await fetch('/api/group-token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.token) {
        return {
          success: false,
          message: result.error || 'ID Kelompok gagal dibuat. Silakan coba lagi.',
        };
      }

      const serverToken = result.token as GroupToken;
      const token: GroupToken = {
        ...serverToken,
        status: 'claimed',
        claimedAt: new Date().toISOString(),
        claimedBySubmissionId: activeSubmission.id,
        teamName: activeSubmission.team?.teamName || '',
      };

      setGroupTokens((prev) => {
        const exists = prev.some(
          (item) =>
            item.id === token.id ||
            item.code.toUpperCase() === token.code.toUpperCase()
        );

        if (exists) {
          return prev.map((item) =>
            item.id === token.id ||
            item.code.toUpperCase() === token.code.toUpperCase()
              ? { ...item, ...token }
              : item
          );
        }

        return [...prev, token];
      });

      setAllSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === activeSubmission.id
            ? {
                ...submission,
                groupId: token.id,
                groupCode: token.code,
              }
            : submission
        )
      );

      setActiveTokenCode(token.code);

      return {
        success: true,
        message: 'ID Kelompok berhasil dibuat dan sesi kelompok siap digunakan.',
        code: token.code,
      };
    } catch (error) {
      console.error('[Ruang Misi KPK] Gagal membuat ID kelompok:', error);
      return {
        success: false,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.',
      };
    }
  };
  const toggleGroupTokenStatus = (id: string, newStatus: GroupTokenStatus) => {
    setGroupTokens((prev) =>
      prev.map((tok) => {
        if (tok.id !== id) return tok;
        return { ...tok, status: newStatus };
      })
    );
  };

  const deleteGroupToken = (id: string): { success: boolean; message: string } => {
    const token = groupTokens.find((t) => t.id === id);
    if (!token) return { success: false, message: 'ID Kelompok tidak ditemukan.' };
    if (token.status === 'claimed') {
      return {
        success: false,
        message: 'ID Kelompok sedang digunakan oleh kelompok aktif. Hapus respons kelompok terlebih dahulu.',
      };
    }
    setGroupTokens((prev) => prev.filter((t) => t.id !== id));
    return { success: true, message: `ID Kelompok ${token.code} berhasil dihapus.` };
  };

  const replaceGroupToken = (id: string): GroupToken => {
    const existing = new Set(groupTokens.map((t) => t.code.toUpperCase()));
    const newCode = generateUniqueGroupCode(existing);
    let updatedToken: GroupToken = {
      id: 'tok_' + Date.now(),
      code: newCode,
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    setGroupTokens((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        updatedToken = {
          ...t,
          code: newCode,
          status: 'available',
          createdAt: new Date().toISOString(),
          claimedAt: undefined,
          claimedBySubmissionId: undefined,
          teamName: undefined,
        };
        return updatedToken;
      })
    );
    return updatedToken;
  };

  // A2 & A3: Verifikasi & Klaim ID Kelompok oleh Siswa
  const verifyAndClaimGroupToken = async (
    inputCode: string
  ): Promise<{ success: boolean; message: string; isResume?: boolean }> => {
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'Harap masukkan ID Kelompok yang diberikan guru.' };
    }

    let token = groupTokens.find((t) => t.code.toUpperCase() === code);

    if (!token) {
      try {
        const response = await fetch(
          `/api/sync?groupCode=${encodeURIComponent(code)}`,
          {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          }
        );

        if (response.ok) {
          const remote = await response.json();
          const remoteToken = Array.isArray(remote.tokens)
            ? remote.tokens.find(
                (item: GroupToken) => item.code?.toUpperCase() === code
              )
            : null;

          if (remoteToken) {
            token = remoteToken as GroupToken;
            const foundToken = token;

            setGroupTokens((prev) =>
              prev.some((item) => item.code.toUpperCase() === code)
                ? prev
                : [...prev, foundToken]
            );
          }
        }
      } catch (error) {
        console.error(
          '[Ruang Misi KPK] Pencarian ID dari server gagal:',
          error
        );
      }
    }

    if (!token) {
      return {
        success: false,
        message: 'ID Kelompok tidak ditemukan. Periksa kode dan koneksi internet, lalu coba lagi.',
      };
    }

    if (token.status === 'disabled') {
      return {
        success: false,
        message: 'ID Kelompok ini telah dinonaktifkan oleh guru. Silakan hubungi gurumu.',
      };
    }

    // Check if this token was already claimed
    if (token.status === 'claimed' || token.status === 'resubmit_allowed') {
      // Check if it's the current user's session
      const matchingSub = allSubmissions.find(
        (s) => s.groupId === token.id || s.groupCode === token.code
      );

      if (matchingSub) {
        // Resume existing session on this device
        setActiveSubmissionId(matchingSub.id);
        setActiveTokenCode(token.code);
        setGroupTokens((prev) => prev.map((item) => item.id === token.id
          ? { ...item, status: 'claimed', claimedBySubmissionId: matchingSub.id, teamName: matchingSub.team.teamName || '' }
          : item));
        return {
          success: true,
          message: `Selamat datang kembali, ${matchingSub.team.teamName || 'Kelompok'}! Melanjutkan sesi asesmen.`,
          isResume: true,
        };
      } else {
        // A group may resume on another device by proving possession of its unique group code.
        try {
          const response = await fetch(`/api/sync?groupCode=${encodeURIComponent(code)}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
          if (response.ok) {
            const remote = await response.json();
            const remoteSubmission = Array.isArray(remote.submissions)
              ? remote.submissions.find((item: AssessmentSubmission) => item.groupCode?.toUpperCase() === code)
              : null;
            if (remoteSubmission) {
              setAllSubmissions((prev) => [remoteSubmission, ...prev.filter((item) => item.id !== remoteSubmission.id && item.groupCode?.toUpperCase() !== code)]);
              setActiveSubmissionId(remoteSubmission.id);
              setActiveTokenCode(code);
              setGroupTokens((prev) => prev.map((item) => item.id === token.id ? { ...item, status: 'claimed', claimedBySubmissionId: remoteSubmission.id, teamName: remoteSubmission.team.teamName } : item));
              return { success: true, message: `Sesi ${remoteSubmission.team.teamName || 'kelompokmu'} ditemukan. Kamu dapat melanjutkan dari perangkat ini.`, isResume: true };
            }
          }
        } catch (error) {
          console.error('[Ruang Misi KPK] Resume lookup failed:', error);
        }
        return { success: false, message: 'ID Kelompok sudah digunakan, tetapi sesi belum dapat dipulihkan. Periksa koneksi atau minta bantuan guru.' };
      }
    }

    // Token is available or resubmit_allowed -> Claim it!
    const targetSub = activeSubmission;
    targetSub.groupId = token.id;
    targetSub.groupCode = token.code;

    // Link token with submission
    setGroupTokens((prev) =>
      prev.map((t) =>
        t.id === token.id
          ? {
              ...t,
              status: 'claimed',
              claimedAt: new Date().toISOString(),
              claimedBySubmissionId: targetSub.id,
              teamName: targetSub.team.teamName || '',
            }
          : t
      )
    );

    setAllSubmissions((prev) =>
      prev.map((s) => (s.id === targetSub.id ? { ...s, groupId: token.id, groupCode: token.code } : s))
    );

    setActiveTokenCode(token.code);

    return {
      success: true,
      message: `ID Kelompok ${token.code} berhasil diverifikasi! Silakan lengkapi identitas tim.`,
      isResume: false,
    };
  };

  const logoutGroupToken = () => {
    setActiveTokenCode('');
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TOKEN_CODE);
    } catch {}
  };

  // ==========================================
  // SECTION B: TIMER 25 MENIT & BATAS WAKTU (AKURAT BERBASIS TIMESTAMP)
  // ==========================================

  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    if (activeSubmission.isTimerRunning && activeSubmission.targetEndTimestamp) {
      return Math.max(0, Math.round((activeSubmission.targetEndTimestamp - Date.now()) / 1000));
    }
    return 25 * 60; // 1500 seconds default
  });

  const [isTimerActive, setIsTimerActive] = useState<boolean>(() => {
    return Boolean(activeSubmission.isTimerRunning);
  });

  const [hasTimeExpired, setHasTimeExpired] = useState<boolean>(() => {
    return activeSubmission.status === 'time_expired_pending_review';
  });

  // Calculate remaining seconds directly from source of truth targetEndTimestamp
  useEffect(() => {
    if (!activeSubmission.isTimerRunning || !activeSubmission.targetEndTimestamp) {
      setIsTimerActive(false);
      if (activeSubmission.status === 'time_expired_pending_review') {
        setHasTimeExpired(true);
        setTimerSeconds(0);
      } else {
        setHasTimeExpired(false);
        setTimerSeconds(25 * 60);
      }
      return;
    }

    const checkTimer = () => {
      const remaining = Math.max(
        0,
        Math.round((activeSubmission.targetEndTimestamp! - Date.now()) / 1000)
      );
      setTimerSeconds(remaining);

      if (remaining <= 0) {
        // B3: Waktu Habis — Kunci, Simpan, dan Kirim Otomatis
        setIsTimerActive(false);
        setHasTimeExpired(true);

        const now = new Date().toISOString();
        setAllSubmissions((prev) =>
          prev.map((sub) => {
            if (sub.id !== activeSubmission.id) return sub;
            if (
              sub.status === 'submitted_pending_review' ||
              sub.status === 'time_expired_pending_review' ||
              sub.status === 'results_published'
            ) {
              return sub;
            }
            return {
              ...sub,
              status: 'time_expired_pending_review',
              isTimerRunning: false,
              submittedAt: now,
              history: [
                ...sub.history,
                {
                  timestamp: now,
                  action: 'Waktu 25 menit habis — jawaban otomatis dikunci dan dikirim ke guru',
                  actor: 'Sistem Timer Otomatis',
                },
              ],
            };
          })
        );
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSubmission.id, activeSubmission.isTimerRunning, activeSubmission.targetEndTimestamp]);

  // B1: Memulai Timer — HANYA saat siswa mulai mengerjakan Track 1 / Kasus Investigasi
  const startMissionTimer = () => {
    if (activeSubmission.isTimerRunning && activeSubmission.targetEndTimestamp) {
      return; // Already running
    }
    const startedAt = Date.now();
    const targetEnd = startedAt + 25 * 60 * 1000; // 25 Menit (1500 detik)

    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== activeSubmission.id) return sub;
        return {
          ...sub,
          timerStartedAtTimestamp: startedAt,
          targetEndTimestamp: targetEnd,
          isTimerRunning: true,
          history: [
            ...sub.history,
            {
              timestamp: new Date().toISOString(),
              action: 'Timer 25 menit investigasi resmi dimulai oleh murid',
              actor: sub.team.teamName || 'Kelompok Murid',
            },
          ],
        };
      })
    );
    setIsTimerActive(true);
    setHasTimeExpired(false);
  };

  const resetTimer = () => {
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== activeSubmission.id) return sub;
        return {
          ...sub,
          timerStartedAtTimestamp: undefined,
          targetEndTimestamp: undefined,
          isTimerRunning: false,
        };
      })
    );
    setTimerSeconds(25 * 60);
    setIsTimerActive(false);
    setHasTimeExpired(false);
  };

  // Track & Identity handlers
  const currentTrack = activeSubmission.track;

  const setCurrentTrack = (track: LearningTrack) => {
    if (trackLockConfig.isLocked && trackLockConfig.lockedTrack) {
      return;
    }
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => (sub.id === targetId ? { ...sub, track } : sub))
    );
  };

  const updateTeamIdentity = (team: TeamIdentity) => {
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => (sub.id === targetId ? { ...sub, team } : sub))
    );

    // Also update team name in groupToken if claimed
    if (activeSubmission.groupId) {
      setGroupTokens((prev) =>
        prev.map((t) =>
          t.id === activeSubmission.groupId ? { ...t, teamName: team.teamName } : t
        )
      );
    }
  };

  const clearTeamIdentity = () => {
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== targetId) return sub;
        return {
          ...sub,
          team: {
            ...sub.team,
            teamName: '',
            schoolName: '',
            members: [
              { name: '', role: 'Pembaca masalah' },
              { name: '', role: 'Pencatat informasi' },
              { name: '', role: 'Penyusun strategi' },
              { name: '', role: 'Pemeriksa perhitungan' },
              { name: '', role: 'Penyaji hasil' },
            ],
          },
        };
      })
    );
  };

  const updateMissionAnswer = (
    questionId: string,
    step: 'step1' | 'step2' | 'step3' | 'step4',
    fieldId: string,
    value: string
  ) => {
    // Prevent edits if submission is locked
    if (
      activeSubmission.status === 'submitted_pending_review' ||
      activeSubmission.status === 'time_expired_pending_review' ||
      activeSubmission.status === 'results_published'
    ) {
      return;
    }

    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== targetId) return sub;

        const currentQAnswers = sub.answers[questionId] || {
          step1: {},
          step2: {},
          step3: {},
          step4: {},
        };

        const updatedStepAnswers = {
          ...currentQAnswers[step],
          [fieldId]: value,
        };

        return {
          ...sub,
          answers: {
            ...sub.answers,
            [questionId]: {
              ...currentQAnswers,
              [step]: updatedStepAnswers,
              completed: true,
            },
          },
        };
      })
    );
  };

  const updatePresentation = (data: Partial<PresentationData>) => {
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === targetId
          ? { ...sub, presentation: { ...sub.presentation, ...data } }
          : sub
      )
    );
  };

  const updateReflection = (data: Partial<ReflectionData>) => {
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === targetId
          ? { ...sub, reflection: { ...sub.reflection, ...data } }
          : sub
      )
    );
  };

  const submitAssessment = () => {
    if (!activeSubmission.team.teamName.trim()) {
      return { success: false, message: 'Harap lengkapi nama kelompok pada Identitas Tim terlebih dahulu.' };
    }

    const now = new Date().toISOString();
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== targetId) return sub;
        return {
          ...sub,
          status: 'submitted_pending_review',
          isTimerRunning: false,
          submittedAt: now,
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: 'Asesmen dikirim oleh kelompok untuk pemeriksaan guru',
              actor: sub.team.teamName || 'Kelompok Murid',
            },
          ],
        };
      })
    );

    setIsTimerActive(false);

    // Apresiasi audio setelah murid berhasil mengirim asesmen. File lokal di public/sounds.
    // Dipanggil dari aksi kirim oleh pengguna; bila browser membatasi audio, alur pengiriman tetap berhasil.
    try {
      const applause = new Audio('/sounds/tepuk-tangan.wav');
      applause.volume = 0.82;
      void applause.play().catch(() => undefined);
    } catch {
      // Audio adalah tambahan apresiasi, bukan syarat untuk mengirim jawaban.
    }

    return {
      success: true,
      message: 'Asesmen berhasil dikirim! Menunggu pemeriksaan dan publikasi hasil oleh guru.',
    };
  };

  // Submissions management
  const removeSubmissionRecord = (
    submissionId: string,
    releaseToken: boolean
  ): { success: boolean; message: string } => {
    const target = allSubmissions.find((submission) => submission.id === submissionId);
    if (!target) {
      return { success: false, message: 'Data kelompok tidak ditemukan atau sudah dihapus.' };
    }

    const remaining = allSubmissions.filter((submission) => submission.id !== submissionId);
    const nextSubmissions = remaining.length > 0 ? remaining : [createFreshSubmission()];
    const removedActiveSubmission = activeSubmissionId === submissionId;

    if (releaseToken && (target.groupId || target.groupCode)) {
      setGroupTokens((previousTokens) =>
        previousTokens.map((token) => {
          const matchesSubmission =
            token.id === target.groupId ||
            (target.groupCode &&
              token.code.toUpperCase() === target.groupCode.toUpperCase());
          const belongsToAnotherSubmission =
            token.claimedBySubmissionId && token.claimedBySubmissionId !== submissionId;

          if (!matchesSubmission || belongsToAnotherSubmission) return token;

          return {
            ...token,
            status: 'available',
            claimedAt: undefined,
            claimedBySubmissionId: undefined,
            teamName: undefined,
            revokedSubmissionIds: Array.from(
              new Set([...(token.revokedSubmissionIds || []), submissionId])
            ),
          };
        })
      );
    }

    setAllSubmissions(nextSubmissions);
    if (removedActiveSubmission) {
      const nextActiveSubmission = nextSubmissions[0];
      setActiveSubmissionId(nextActiveSubmission.id);
      setActiveTokenCode(nextActiveSubmission.groupCode || '');
    }

    const teamLabel = target.team.teamName || target.groupCode || 'Kelompok';
    return {
      success: true,
      message: `Data kelompok ${teamLabel} berhasil dihapus.${
        releaseToken && (target.groupId || target.groupCode)
          ? ' ID Kelompoknya kembali tersedia.'
          : ''
      }`,
    };
  };

  const switchActiveSubmission = (id: string) => {
    const found = allSubmissions.find((s) => s.id === id);
    if (found) {
      setActiveSubmissionId(id);
      setActiveTokenCode(found.groupCode || '');
    }
  };

  const createNewSubmission = (groupId?: string, groupCode?: string): AssessmentSubmission => {
    const fresh = createFreshSubmission(groupId, groupCode);
    if (trackLockConfig.isLocked && trackLockConfig.lockedTrack) {
      fresh.track = trackLockConfig.lockedTrack;
    }
    setAllSubmissions((prev) => [fresh, ...prev]);
    setActiveSubmissionId(fresh.id);
    setActiveTokenCode(groupCode || '');
    return fresh;
  };

  const deleteSubmission = (id: string) => {
    removeSubmissionRecord(id, true);
  };

  // Teacher Authentication
  const loginTeacher = async (u: string, p: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/teacher-auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      let data: { token?: unknown; error?: unknown } = {};
      try { data = await response.json(); } catch { /* ditangani di bawah */ }
      if (!response.ok) {
        return {
          success: false,
          message: typeof data.error === 'string' ? data.error : 'Login gagal. Periksa username dan kata sandi Anda.',
        };
      }
      if (typeof data.token !== 'string' || !data.token) return { success: false, message: 'Token sesi tidak diterima dari server.' };
      sessionStorage.setItem('ruang_misi_kpk_teacher_token', data.token);
      setIsTeacherLoggedIn(true);
      return { success: true, message: 'Login berhasil.' };
    } catch (error) {
      console.error('[Ruang Misi KPK] Teacher login failed:', error);
      return { success: false, message: 'Tidak dapat terhubung ke server. Pastikan aplikasi dijalankan lewat "npm run pages:dev" atau sudah di-deploy.' };
    }
  };

  const loginTeacherWithGoogle = async (credential: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/teacher-google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ credential }),
      });
      let data: { token?: unknown; error?: unknown } = {};
      try { data = await response.json(); } catch { /* handled below */ }
      if (!response.ok) {
        return {
          success: false,
          message: typeof data.error === 'string' ? data.error : 'Login Google belum berhasil. Coba kembali.',
        };
      }
      if (typeof data.token !== 'string' || !data.token) {
        return { success: false, message: 'Token sesi tidak diterima dari server.' };
      }
      sessionStorage.setItem('ruang_misi_kpk_teacher_token', data.token);
      setIsTeacherLoggedIn(true);
      return { success: true, message: 'Login Google berhasil.' };
    } catch (error) {
      console.error('[Ruang Misi KPK] Google teacher login failed:', error);
      return { success: false, message: 'Tidak dapat terhubung ke server. Periksa koneksi dan konfigurasi Google.' };
    }
  };

  const registerTeacher = async (credential: string, u: string, p: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch("/api/teacher-register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ credential, username: u, password: p, confirmPassword }),
      });
      let data: { token?: unknown; error?: unknown } = {};
      try { data = await response.json(); } catch { /* ditangani di bawah */ }
      if (!response.ok) return { success: false, message: typeof data.error === "string" ? data.error : "Pendaftaran belum berhasil. Pastikan aplikasi dijalankan lewat npm run pages:dev." };
      if (typeof data.token !== "string" || !data.token) return { success: false, message: "Token sesi tidak diterima." };
      sessionStorage.setItem("ruang_misi_kpk_teacher_token", data.token);
      setIsTeacherLoggedIn(true);
      return { success: true, message: "Pendaftaran berhasil." };
    } catch (error) {
      console.error("[Ruang Misi KPK] Teacher registration failed:", error);
      return { success: false, message: "Tidak dapat terhubung ke server. Pastikan aplikasi lokal sedang berjalan." };
    }
  };

  const logoutTeacher = () => {
    setIsTeacherLoggedIn(false);
    sessionStorage.removeItem('ruang_misi_kpk_teacher_token');
    localStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
  };

  // ==========================================
  // SECTION C: HAPUS RESPON & IZINKAN RESUBMIT
  // ==========================================

  // C1: Hapus Respons Kelompok Tertentu
  const deleteSubmissionResponse = (
    submissionId: string,
    releaseToken: boolean
  ): { success: boolean; message: string } => {
    return removeSubmissionRecord(submissionId, releaseToken);
  };

  // C2: Izinkan Resubmit / Pengerjaan Ulang untuk Kelompok Tertentu Saja
  const allowResubmission = (
    submissionId: string,
    retainHistoryAsVersion: boolean,
    teacherName: string = 'Guru Matematika'
  ) => {
    const now = new Date().toISOString();

    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const currentVersion = sub.version || 1;
        const newVersion = retainHistoryAsVersion ? currentVersion + 1 : currentVersion;

        return {
          ...sub,
          version: newVersion,
          status: 'in_progress',
          isTimerRunning: false, // Timer starts fresh when student begins
          timerStartedAtTimestamp: undefined,
          targetEndTimestamp: undefined,
          submittedAt: undefined,
          reviewedAt: undefined,
          publishedAt: undefined,
          answers: retainHistoryAsVersion ? sub.answers : {},
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: `Guru memberikan izin pengerjaan ulang (Versi ${newVersion}). Timer 25 menit siap dimulai ulang.`,
              actor: teacherName,
            },
          ],
        };
      })
    );

    // Update group token status
    const target = allSubmissions.find((s) => s.id === submissionId);
    if (target?.groupId) {
      setGroupTokens((prev) =>
        prev.map((t) =>
          t.id === target.groupId
            ? {
                ...t,
                status: 'resubmit_allowed',
                resubmitCount: (t.resubmitCount || 0) + 1,
              }
            : t
        )
      );
    }
  };

  // ==========================================
  // SECTION D: PENILAIAN MANUAL SEPENUHNYA
  // ==========================================

  // D7: Simpan Draf Koreksi Guru (Status reviewed/draft, TIDAK DIPUBLIKASIKAN KE SISWA)
  const saveEvaluationDraft = (submissionId: string, evaluation: FullEvaluation) => {
    const now = new Date().toISOString();
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          status: sub.status === 'results_published' ? 'results_published' : 'reviewed',
          reviewedAt: now,
          evaluation,
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: `Draf penilaian disimpan (Skor internal: ${evaluation.totalScore}/100)`,
              actor: evaluation.reviewedBy || 'Guru Matematika',
            },
          ],
        };
      })
    );
  };

  // D9 & D11: Kirim Hasil Penilaian (PUBLISH RESMI KE SISWA)
  const publishEvaluationResults = (
    submissionId: string,
    evaluation: FullEvaluation
  ): { success: boolean; message: string } => {
    const now = new Date().toISOString();

    // Validasi kelengkapan penilaian
    if (!evaluation.missions || Object.keys(evaluation.missions).length < 4) {
      return { success: false, message: 'Harap periksa dan lengkapi skor untuk seluruh 4 misi sebelum memublikasikan.' };
    }

    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          status: 'results_published',
          reviewedAt: sub.reviewedAt || now,
          publishedAt: now,
          evaluation,
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: `Penilaian resmi diterbitkan ke murid (Nilai Akhir: ${evaluation.totalScore}/100)`,
              actor: evaluation.reviewedBy || 'Guru Matematika',
            },
          ],
        };
      })
    );

    return {
      success: true,
      message: `Hasil penilaian berhasil diterbitkan! Murid sekarang dapat melihat nilai akhir dan rincian evaluasi.`,
    };
  };

  // Legacy aliases for backward compatibility
  const saveEvaluation = saveEvaluationDraft;
  const publishResults = (submissionId: string) => {
    const sub = allSubmissions.find((s) => s.id === submissionId);
    if (sub && sub.evaluation) {
      publishEvaluationResults(submissionId, sub.evaluation);
    }
  };

  const requestRevision = (submissionId: string, notes: string, allowedSections: string[]) => {
    const now = new Date().toISOString();
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          status: 'revision_requested',
          revisionNotes: notes,
          allowedRevisionSections: allowedSections,
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: `Guru meminta revisi: ${notes}`,
              actor: 'Guru Matematika',
              note: notes,
            },
          ],
        };
      })
    );
  };

  const reopenAssessment = (submissionId: string, reason: string, teacherName: string) => {
    const now = new Date().toISOString();
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        return {
          ...sub,
          status: 'reopened',
          reopenedAt: now,
          reopenedReason: reason,
          reopenedBy: teacherName,
          history: [
            ...sub.history,
            {
              timestamp: now,
              action: `Asesmen dibuka kembali oleh ${teacherName}. Alasan: ${reason}`,
              actor: teacherName,
              note: reason,
            },
          ],
        };
      })
    );
  };

  const unlockActiveSubmission = () => {
    const targetId = effectiveActiveId;
    setAllSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== targetId) return sub;
        return {
          ...sub,
          status: 'in_progress',
          history: [
            ...sub.history,
            {
              timestamp: new Date().toISOString(),
              action: 'Kunci asesmen dibuka untuk melanjutkan pengisian jawaban',
              actor: 'Murid / Guru',
            },
          ],
        };
      })
    );
  };

  // Question Bank
  const updateQuestion = (updated: MissionQuestion) => {
    const newLcm = calculateLCM(updated.num1, updated.num2);
    let newFinalAnswer = updated.internalKey.finalAnswer;

    if (updated.startDate) {
      const targetDate = addDaysToDate(updated.startDate, newLcm);
      newFinalAnswer = targetDate.formatted;
    } else if (updated.unit === 'detik') {
      newFinalAnswer = `${newLcm} detik`;
    }

    const recalculated: MissionQuestion = {
      ...updated,
      internalKey: {
        ...updated.internalKey,
        kpk: newLcm,
        finalAnswer: newFinalAnswer,
      },
    };

    setQuestions((prev) =>
      prev.map((q) => (q.id === recalculated.id ? recalculated : q))
    );
  };

  const resetQuestionsToDefault = () => {
    setQuestions(INITIAL_QUESTION_BANK);
    try {
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    } catch {}
  };

  const updateRubricConfig = (config: RubricConfig) => {
    setRubricConfig(config);
  };

  return (
    <AssessmentContext.Provider
      value={{
        validateStudentClassCode,
        learningContent,
        saveLearningDraft: (draft) => persistLearningContent(draft, false),
        publishLearningDraft: (draft) => persistLearningContent(draft, true),
        questions,
        updateQuestion,
        resetQuestionsToDefault,
        groupTokens,
        activeGroupToken,
        hasVerifiedGroupToken,
        createGroupTokens,
        createStudentGroupToken,
        toggleGroupTokenStatus,
        deleteGroupToken,
        replaceGroupToken,
        verifyAndClaimGroupToken,
        logoutGroupToken,
        activeSubmission,
        currentTrack,
        setCurrentTrack,
        updateTeamIdentity,
        clearTeamIdentity,
        updateMissionAnswer,
        updatePresentation,
        updateReflection,
        submitAssessment,
        timerSeconds,
        isTimerActive,
        hasTimeExpired,
        startMissionTimer,
        resetTimer,
        allSubmissions,
        activeSubmissionId,
        switchActiveSubmission,
        createNewSubmission,
        deleteSubmission,
        isTeacherLoggedIn,
        loginTeacher,
        loginTeacherWithGoogle,
        registerTeacher,
        logoutTeacher,
        trackLockConfig,
        setTrackLockConfig,
        rubricConfig,
        updateRubricConfig,
        saveEvaluationDraft,
        publishEvaluationResults,
        saveEvaluation,
        publishResults,
        deleteSubmissionResponse,
        allowResubmission,
        requestRevision,
        reopenAssessment,
        unlockActiveSubmission,
        customLogoUrl,
        updateCustomLogo,
        cloudStatus,
        sessionDeletedNotice,
        dismissSessionDeletedNotice: () => setSessionDeletedNotice(false),
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
