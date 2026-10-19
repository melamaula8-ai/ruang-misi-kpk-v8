import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Sliders,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  LogOut,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Send,
  FileSpreadsheet,
  Upload,
  KeyRound,
  Link2,
  Copy,
  Check,
} from 'lucide-react';
import {
  LearningTrack,
  MissionQuestion,
  ReviewVerdict,
  FullEvaluation,
} from '../../types';
import { useAssessment } from '../../context/AssessmentContext';
import type { LearningContent } from '../../context/AssessmentContext';
import { calculateLCM, addDaysToDate, checkSimilarity } from '../../utils/math';
import { exportAssessmentToExcel } from '../../utils/excelExport';
import type { ExcelDownload } from '../../utils/excelExport';
import { getQuestionAnswerRows } from '../../utils/questionAnswerRows';
import { INITIAL_QUESTION_BANK } from '../../data/questionBank';

interface Props {
  onNavigate: (view: string) => void;
}

export const TeacherDashboardView: React.FC<Props> = ({ onNavigate }) => {
  const {
    logoutTeacher,
    allSubmissions,
    activeSubmissionId,
    switchActiveSubmission,
    createNewSubmission,
    deleteSubmissionResponse,
    questions,
    trackLockConfig,
    setTrackLockConfig,
    rubricConfig,
    updateRubricConfig,
    saveEvaluation,
    publishEvaluationResults,
    requestRevision,
    reopenAssessment,
    customLogoUrl,
    updateCustomLogo,
    groupTokens,
    createGroupTokens,
    toggleGroupTokenStatus,
    deleteGroupToken,
    cloudStatus,
    learningContent,
    saveLearningDraft,
    publishLearningDraft,
  } = useAssessment();

  const [activeTab, setActiveTab] = useState<
    'ringkasan' | 'penilaian' | 'kelompok' | 'akses_kelas' | 'editor' | 'bank_soal' | 'rubrik' | 'rekap'
  >('ringkasan');

  // Currently selected submission for grading
  const selectedSubmission =
    allSubmissions.find((s) => s.id === activeSubmissionId) || allSubmissions[0];
  const reviewQuestions = questions
    .filter((question) => question.track === selectedSubmission?.track)
    .slice()
    .sort((a, b) => a.missionNumber - b.missionNumber);
  const rubricForMission = (missionNumber: number) =>
    rubricConfig[`mission${missionNumber}`] || rubricConfig.mission1;
  const initialMissionScores = () => {
    const defaults: Record<number, { step1: number; step2: number; step3: number; step4: number; status: ReviewVerdict; feedback: string }> = {};
    for (let missionNumber = 1; missionNumber <= 4; missionNumber += 1) {
      const saved = selectedSubmission?.evaluation?.missions?.[missionNumber];
      defaults[missionNumber] = {
        step1: saved?.step1?.score ?? 0,
        step2: saved?.step2?.score ?? 0,
        step3: saved?.step3?.score ?? 0,
        step4: saved?.step4?.score ?? 0,
        status: saved?.missionVerdict ?? 'pending',
        feedback: saved?.feedback ?? '',
      };
    }
    return { ...defaults, ...Object.fromEntries(reviewQuestions.map((question) => {
      const saved = selectedSubmission?.evaluation?.missions?.[question.missionNumber];
      return [question.missionNumber, {
      step1: saved?.step1?.score ?? 0,
      step2: saved?.step2?.score ?? 0,
      step3: saved?.step3?.score ?? 0,
      step4: saved?.step4?.score ?? 0,
      status: saved?.missionVerdict ?? 'pending' as ReviewVerdict,
      feedback: saved?.feedback ?? '',
      }];
    })) };
  };

  // Grading states for the selected submission
  const [editingMissionNum, setEditingMissionNum] = useState<number>(reviewQuestions[0]?.missionNumber ?? 1);
  const [missionScores, setMissionScores] = useState<
    Record<
      number,
      {
        step1: number;
        step2: number;
        step3: number;
        step4: number;
        status: ReviewVerdict;
        feedback: string;
      }
    >
  >(initialMissionScores);

  const [generalFeedback, setGeneralFeedback] = useState(selectedSubmission?.evaluation?.generalFeedback ?? '');
  React.useEffect(() => {
    setMissionScores(initialMissionScores());
    setEditingMissionNum(reviewQuestions[0]?.missionNumber ?? 1);
    setGeneralFeedback(selectedSubmission?.evaluation?.generalFeedback ?? '');
  }, [selectedSubmission?.id]);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [allowedSections, setAllowedSections] = useState<string[]>(['misi-1']);

  // Reopen Modal State
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [teacherNameInput, setTeacherNameInput] = useState('Ibu Mela, S.Pd.');

  // Question Bank Editing State
  const [editingQuestion, setEditingQuestion] = useState<MissionQuestion | null>(null);
  const [editorDraft, setEditorDraft] = useState<LearningContent>(learningContent.draft);
  const [editorNotice, setEditorNotice] = useState('');
  const [editorBusy, setEditorBusy] = useState(false);
  const [previewLearning, setPreviewLearning] = useState(false);
  const [editorTrack, setEditorTrack] = useState<LearningTrack>('penjelajah');
  const [editorQuestionId, setEditorQuestionId] = useState('');
  React.useEffect(() => { setEditorDraft(learningContent.draft); }, [learningContent.draft]);

  // Group Management State
  const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupTrack, setNewGroupTrack] = useState<LearningTrack>('penjelajah');
  const [groupDeleteNotice, setGroupDeleteNotice] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [tokenQuantity, setTokenQuantity] = useState(5);
  const [tokenPrefix, setTokenPrefix] = useState('KPK');
  const [tokenNotice, setTokenNotice] = useState('');
  const [tokenCreating, setTokenCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const [exportNotice, setExportNotice] = useState('');
  const [excelDownload, setExcelDownload] = useState<ExcelDownload | null>(null);

  const handleGenerateClassTokens = async () => {
    if (cloudStatus !== 'online') { setTokenNotice('Database belum terhubung. Tunggu sampai status Terhubung sebelum membuat ID kelas.'); return; }
    setTokenCreating(true);
    setTokenNotice('Membuat ID dan menghubungkannya dengan akun guru…');
    try {
      const created = await createGroupTokens(tokenQuantity, tokenPrefix.trim() || 'KPK');
      setTokenNotice(`${created.length} ID berhasil dibuat dan terhubung ke akun guru ini. Bagikan ID atau tautan kepada kelompok yang sesuai.`);
      setCopiedLink('');
    } catch (error) {
      setTokenNotice(error instanceof Error ? error.message : 'ID kelas gagal dibuat. Periksa koneksi lalu coba lagi.');
    } finally {
      setTokenCreating(false);
    }
  };

  const getClassLink = (code: string) => `${window.location.origin}${window.location.pathname}?kelas=${encodeURIComponent(code)}`;

  const handleCopyClassLink = async (code: string) => {
    const link = getClassLink(code);
    try { await navigator.clipboard.writeText(link); setCopiedLink(code); setTokenNotice(`Link kelas ${code} berhasil disalin.`); }
    catch { setTokenNotice(`Salin tautan ini secara manual: ${link}`); }
  };

  const handleCopyClassCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); setCopiedLink(code); setTokenNotice(`ID ${code} berhasil disalin.`); }
    catch { setTokenNotice(`Salin ID secara manual: ${code}`); }
  };

  const scoreForMission = (missionNumber: number) => missionScores[missionNumber] || {
    step1: 0, step2: 0, step3: 0, step4: 0, status: 'pending' as ReviewVerdict, feedback: '',
  };
  const maxCaseScore = reviewQuestions.reduce((sum, question) => {
    const rubric = rubricForMission(question.missionNumber);
    return sum + rubric.step1 + rubric.step2 + rubric.step3 + rubric.step4;
  }, 0);
  const rawCaseScore = reviewQuestions.reduce((sum, question) => {
    const score = scoreForMission(question.missionNumber);
    return sum + score.step1 + score.step2 + score.step3 + score.step4;
  }, 0);
  const totalScoreCalc = Math.round(maxCaseScore ? (rawCaseScore / maxCaseScore) * 100 : 0);

  const buildEvaluation = (): FullEvaluation => {
    const missions = Object.fromEntries(reviewQuestions.map((question) => {
      const score = scoreForMission(question.missionNumber);
      const rubric = rubricForMission(question.missionNumber);
      const step = (key: 'step1' | 'step2' | 'step3' | 'step4') => ({ score: score[key], maxScore: rubric[key], verdict: score.status });
      return [question.missionNumber, {
        step1: step('step1'), step2: step('step2'), step3: step('step3'), step4: step('step4'),
        totalScore: score.step1 + score.step2 + score.step3 + score.step4,
        missionVerdict: score.status,
        feedback: score.feedback,
      }];
    }));
    return {
      missions,
      // Kompatibilitas data lama: presentasi/refleksi bukan komponen nilai.
      presentation: { accuracy: 0, strategy: 0, collaboration: 0, totalScore: 0, comments: '' },
      totalScore: totalScoreCalc,
      generalFeedback,
      practiceRecommendations: [],
      reviewedBy: teacherNameInput,
      publishedAt: new Date().toISOString(),
    };
  };

  const handleSaveEvaluation = () => {
    if (selectedSubmission) saveEvaluation(selectedSubmission.id, buildEvaluation());
  };

  const handlePublishResults = () => {
    if (!selectedSubmission) return;
    const result = publishEvaluationResults(selectedSubmission.id, buildEvaluation());
    if (!result.success) window.alert(result.message);
  };

  const handleRequestRevisionSubmit = () => {
    if (!revisionNotes.trim()) return;
    requestRevision(selectedSubmission.id, revisionNotes, allowedSections);
    setRevisionModalOpen(false);
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim()) return;
    reopenAssessment(selectedSubmission.id, reopenReason, teacherNameInput);
    setReopenModalOpen(false);
  };

  // Multi-Sheet Microsoft Excel (.XLSX) Export
  const startExcelDownload = (file: ExcelDownload) => {
    setExcelDownload(file);
    window.setTimeout(() => URL.revokeObjectURL(file.url), 300_000);
    const anchor = document.createElement('a');
    anchor.href = file.url;
    anchor.download = file.fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setExportNotice('Berkas Excel sudah disiapkan. Jika unduhan tidak dimulai, gunakan tombol “Unduh ulang Excel” di bawah.');
  };

  const handleExportXLSX = () => {
    try {
      startExcelDownload(exportAssessmentToExcel(allSubmissions, rubricConfig, 'Rekap_Asesmen_Formatif_KPK_Kelas_V', questions));
    } catch (error) {
      console.error('[Ruang Misi KPK] Ekspor Excel gagal:', error);
      setExportNotice('Unduhan Excel gagal dibuat. Coba lagi atau gunakan CSV.');
    }
  };

  // Export single selected group to Excel
  const handleExportSelectedGroupXLSX = () => {
    const groupName = selectedSubmission.team.teamName
      ? selectedSubmission.team.teamName.replace(/\s+/g, '_')
      : selectedSubmission.id;
    try {
      startExcelDownload(exportAssessmentToExcel([selectedSubmission], rubricConfig, `Kartu_Nilai_KPK_${groupName}`, questions));
    } catch (error) {
      console.error('[Ruang Misi KPK] Ekspor kartu Excel gagal:', error);
      setExportNotice('Unduhan Excel gagal dibuat. Coba lagi atau gunakan ekspor rekap CSV.');
    }
  };

  // Custom Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateCustomLogo(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'ID Kelompok',
      'Nama Kelompok',
      'Pintu Belajar',
      'Status',
      'Skor Akhir',
      'Waktu Pengiriman',
    ];
    const rows = allSubmissions.map((s) => [
      `"${s.id}"`,
      `"${s.team.teamName || 'Belum dinamai'}"`,
      `"${s.track}"`,
      `"${s.status}"`,
      `"${s.evaluation?.totalScore ?? '-'}"`,
      `"${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('id-ID') : '-'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_asesmen_kpk_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const editorQuestions = editorDraft.questions;
  const selectedEditorQuestion = editorQuestions.find((question) => question.id === editorQuestionId) || editorQuestions.find((question) => question.track === editorTrack) || editorQuestions[0];
  const patchEditorQuestion = (questionId: string, patch: Partial<MissionQuestion>) => {
    setEditorDraft((draft) => ({ ...draft, questions: draft.questions.map((question) => question.id === questionId ? { ...question, ...patch } : question) }));
  };
  const handleAddEditorQuestion = (track: LearningTrack = editorTrack) => {
    const trackQuestions = editorDraft.questions.filter((question) => question.track === track);
    const base = trackQuestions[0] || INITIAL_QUESTION_BANK.find((question) => question.track === track) || INITIAL_QUESTION_BANK[0];
    const missionNumber = Math.max(0, ...trackQuestions.map((question) => question.missionNumber)) + 1;
    const id = `editor_${track}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const added: MissionQuestion = {
      ...base,
      id,
      track,
      missionNumber,
      title: `Kasus ${missionNumber}: Soal baru`,
      story: '',
      num1: 2,
      num2: 3,
      internalKey: { ...base.internalKey, kpk: 6, finalAnswer: '6' },
    };
    setEditorDraft((draft) => ({ ...draft, questions: [...draft.questions, added] }));
    setEditorQuestionId(id);
  };
  const handleDeleteEditorQuestion = (questionId: string) => {
    if (allSubmissions.some((submission) => submission.answers?.[questionId])) {
      setEditorNotice('Soal ini sudah memiliki jawaban murid. Soal dipertahankan agar jawaban lama tetap dapat diperiksa.');
      return;
    }
    setEditorDraft((draft) => ({ ...draft, questions: draft.questions.filter((question) => question.id !== questionId) }));
    if (editorQuestionId === questionId) {
      setEditorQuestionId(editorQuestions.find((question) => question.id !== questionId)?.id || '');
    }
  };
  const handleEditorTrackChange = (question: MissionQuestion, track: LearningTrack) => {
    const nextNumber = Math.max(0, ...editorQuestions.filter((item) => item.track === track && item.id !== question.id).map((item) => item.missionNumber)) + 1;
    patchEditorQuestion(question.id, { track, missionNumber: nextNumber });
  };
  const handleEditorQuestionNumberChange = (question: MissionQuestion, rawValue: string) => {
    const missionNumber = Number(rawValue);
    if (!Number.isInteger(missionNumber) || missionNumber < 1) return;
    if (editorQuestions.some((item) => item.id !== question.id && item.track === question.track && item.missionNumber === missionNumber)) {
      setEditorNotice(`Nomor kasus ${missionNumber} sudah dipakai pada pintu ini.`);
      return;
    }
    patchEditorQuestion(question.id, { missionNumber });
  };
  const moveEditorQuestion = (questionId: string, direction: -1 | 1) => {
    setEditorDraft((draft) => {
      const from = draft.questions.findIndex((question) => question.id === questionId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= draft.questions.length) return draft;
      const questions = [...draft.questions];
      [questions[from], questions[to]] = [questions[to], questions[from]];
      return { ...draft, questions };
    });
  };
  const saveEditor = async (publish: boolean) => {
    const preparedDraft: LearningContent = {
      ...editorDraft,
      questions: editorDraft.questions.map((question) => {
        const kpk = calculateLCM(question.num1, question.num2);
        const finalAnswer = question.startDate
          ? addDaysToDate(question.startDate, kpk).formatted
          : question.unit === 'detik'
            ? `${kpk} detik`
            : question.internalKey.finalAnswer;
        return { ...question, internalKey: { ...question.internalKey, kpk, finalAnswer } };
      }),
    };
    setEditorDraft(preparedDraft);
    setEditorBusy(true);
    setEditorNotice('Menyimpan ke server…');
    const result = publish ? await publishLearningDraft(preparedDraft) : await saveLearningDraft(preparedDraft);
    setEditorBusy(false);
    setEditorNotice(result.message);
  };

  return (
    <div className="teacher-dashboard-page max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header with App/School Logo and Quick Change */}
      <div className="bg-[#3E2723] text-white rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-[#FFE082] shadow-md flex items-center justify-center overflow-hidden">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Logo Sekolah / Aplikasi" className="w-full h-full object-contain" />
              ) : (
                <div aria-label="Logo Ruang Misi KPK" className="flex h-full w-full items-center justify-center rounded-xl bg-[#3E2723] text-lg font-black tracking-tight text-[#FFE082]">KPK</div>
              )}
            </div>
            {/* Logo Change Hover Overlay */}
            <label
              htmlFor="dashboard-logo-upload"
              className="absolute inset-0 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-[10px] font-bold p-1 text-center"
              title="Unggah logo sekolah Anda (PNG/JPG/SVG)"
            >
              <Upload className="w-4 h-4 mb-0.5 text-[#FFE082]" />
              <span>Ganti Logo</span>
            </label>
            <input
              id="dashboard-logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE082]/20 text-[#FFE082] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dashboard Administrator & Evaluator Formatif</span>
              </div>
              {customLogoUrl && (
                <button
                  onClick={() => updateCustomLogo(null)}
                  className="text-[11px] text-amber-200 underline hover:text-white cursor-pointer transition-colors"
                  title="Kembalikan ke logo standar Ruang Misi KPK"
                >
                  Kembalikan Logo Standar
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ruang Guru Matematika Kelas V SD/MI
            </h1>
            <p className="text-xs sm:text-sm text-[#D8CFC8]">
              Kelola data murid, bank soal 12 variasi, pemeriksaan tahap Polya, rubrik nilai, dan ekspor berkas Excel (.XLSX).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('beranda')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tinjau Tampilan Murid
          </button>
          <button
            onClick={() => {
              logoutTeacher();
              onNavigate('beranda');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="teacher-dashboard-tabs flex min-w-0 max-w-full border-b border-[#EAE3D9] overflow-x-auto gap-2">
        {[
          { id: 'ringkasan' as const, label: 'Ikhtisar', icon: BookOpen },
          { id: 'penilaian' as const, label: 'Pemeriksaan & Rubrik', icon: Award },
          { id: 'kelompok' as const, label: 'Pengaturan Kelas', icon: Sliders },
          { id: 'akses_kelas' as const, label: 'ID Kelas', icon: KeyRound },
          { id: 'editor' as const, label: 'Materi & Soal', icon: BookOpen },
          { id: 'rubrik' as const, label: 'Rubrik', icon: Sliders },
          { id: 'rekap' as const, label: 'Ekspor Nilai', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#FF913D] text-[#3E2723] bg-white rounded-t-xl'
                  : 'border-transparent text-[#6D5A50] hover:text-[#3E2723]'
              }`}
            >
              <Icon className="w-4 h-4 text-[#95634F]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {exportNotice && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DCE9C6] bg-[#F4F9E9] px-4 py-3 text-sm font-semibold text-[#42631D]"><span>{exportNotice}</span>{excelDownload && <a href={excelDownload.url} download={excelDownload.fileName} className="inline-flex rounded-lg bg-[#4A671E] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#385017]">Unduh ulang Excel</a>}</div>}

      {/* TAB: ID DAN LINK KELAS */}
      {activeTab === 'akses_kelas' && (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-[#E8D6A5] bg-gradient-to-br from-[#FFF7D8] via-white to-[#EFF7E2] p-6 shadow-sm sm:p-8">
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#C5E68A]/35 blur-2xl" aria-hidden="true" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F0D9A7] bg-white/80 px-3 py-1.5 text-xs font-black text-[#795329]"><KeyRound className="h-4 w-4"/> AKSES KELAS MURID</div>
                <h2 className="mt-3 text-2xl font-black text-[#3E2723] sm:text-3xl">Buat ID atau link kelas</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#6D5A50]">Buat ID unik untuk kelompok. Bagikan kode secara langsung atau salin link kelas. Murid yang membuka link tetap melihat halaman utama, mengikuti materi dan latihan, lalu sistem melewati kolom input ID saja.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white px-3 py-1.5 text-[#4A671E] ring-1 ring-[#DCE9C6]">ID unik</span><span className="rounded-full bg-white px-3 py-1.5 text-[#8C6D1F] ring-1 ring-[#F0D9A7]">Link siap dibagikan</span><span className="rounded-full bg-white px-3 py-1.5 text-[#95634F] ring-1 ring-[#E8D8CE]">Monitoring kelompok</span></div>
              </div>
              <div className="rounded-2xl border border-white bg-white/85 p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <div className="space-y-1.5">
                    <label htmlFor="token-prefix" className="block text-xs font-extrabold text-[#3E2723]">Awalan ID</label>
                    <input id="token-prefix" value={tokenPrefix} onChange={e => setTokenPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0,8))} maxLength={8} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] px-3 py-2.5 text-sm font-bold text-[#3E2723] outline-none focus:border-[#FF913D] focus:ring-2 focus:ring-[#FF913D]/20" placeholder="KPK" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="token-quantity" className="block text-xs font-extrabold text-[#3E2723]">Jumlah ID</label>
                    <select id="token-quantity" value={tokenQuantity} onChange={e => setTokenQuantity(Number(e.target.value))} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] px-3 py-2.5 text-sm font-bold text-[#3E2723] outline-none focus:border-[#FF913D]">
                      {[1,2,3,4,5,10,15,20,25,30,40,50].map(n => <option key={n} value={n}>{n} ID</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" onClick={() => void handleGenerateClassTokens()} disabled={cloudStatus !== 'online' || tokenCreating} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF913D] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E9782E] disabled:cursor-not-allowed disabled:opacity-50"><KeyRound className="h-4 w-4"/> {tokenCreating ? 'Menghubungkan ID…' : `Buat ${tokenQuantity} ID Kelas`}</button>
                <p className="mt-3 text-[11px] leading-5 text-[#8C7A70]">Status database: <strong className={cloudStatus === 'online' ? 'text-[#4A671E]' : 'text-[#B7652B]'}>{cloudStatus === 'online' ? 'Terhubung' : cloudStatus === 'connecting' ? 'Menghubungkan' : 'Belum terhubung'}</strong>. Pastikan status terhubung sebelum membagikan kode ke murid.</p>
              </div>
            </div>
          </section>
          {tokenNotice && <div role="status" className="rounded-xl border border-[#DCE9C6] bg-[#F4F9E9] px-4 py-3 text-sm font-semibold text-[#42631D]">{tokenNotice}</div>}
          <section className="space-y-4 rounded-2xl border border-[#EAE3D9] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-black text-[#3E2723]">Daftar ID dan link kelas</h3><p className="mt-1 text-xs text-[#6D5A50]">Salin link untuk membagikan akses. ID yang dipakai menampilkan sesi kelompok terkait.</p></div><span className="rounded-full bg-[#FAF8F5] px-3 py-1.5 text-xs font-extrabold text-[#95634F]">{groupTokens.length} ID · {groupTokens.filter(token => token.status === 'claimed').length} dipakai · {groupTokens.filter(token => token.status === 'available').length} tersedia</span></div>
            {groupTokens.length === 0 ? <div className="rounded-2xl border-2 border-dashed border-[#E8D8CE] bg-[#FFFCF7] px-5 py-10 text-center"><KeyRound className="mx-auto h-8 w-8 text-[#95634F]"/><p className="mt-3 font-black text-[#3E2723]">Belum ada ID kelas</p><p className="mt-1 text-sm text-[#6D5A50]">Buat ID di bagian atas untuk mulai membagikan akses.</p></div> : <div className="grid gap-3 lg:grid-cols-2">{groupTokens.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(token => {
              const linkedSubmission = allSubmissions.find(submission => submission.id === token.claimedBySubmissionId || submission.groupId === token.id || submission.groupCode?.toUpperCase() === token.code.toUpperCase());
              const statusLabel = token.status === 'claimed' ? `Dipakai · ${linkedSubmission?.team.teamName || token.teamName || 'sesi kelompok terhubung'}` : token.status === 'disabled' ? 'Dinonaktifkan' : token.status === 'resubmit_allowed' ? 'Boleh mengumpulkan ulang' : 'Siap digunakan';
              return <article key={token.id} className="rounded-2xl border border-[#EAE3D9] bg-[#FFFCF7] p-4 transition hover:border-[#D8C4B9] hover:shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xl font-black tracking-wider text-[#3E2723]">{token.code}</p><p className="mt-1 text-[11px] text-[#8C7A70]">Dibuat {new Date(token.createdAt).toLocaleDateString('id-ID')}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${token.status === 'claimed' ? 'bg-[#E8D8CE] text-[#704A36]' : token.status === 'disabled' ? 'bg-red-50 text-red-700' : 'bg-[#F2F9E5] text-[#4A671E]'}`}>{statusLabel}</span></div><div className="mt-3 break-all rounded-lg border border-[#EAE3D9] bg-white px-3 py-2 text-[11px] leading-5 text-[#6D5A50]">{getClassLink(token.code)}</div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void handleCopyClassLink(token.code)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#95634F] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#754936]">{copiedLink === token.code ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>} Salin link</button><button type="button" onClick={() => void handleCopyClassCode(token.code)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC8] bg-white px-3 py-2 text-xs font-bold text-[#3E2723] hover:bg-[#FAF8F5]"><KeyRound className="h-3.5 w-3.5"/> Salin ID</button>{token.status !== 'claimed' && <button type="button" onClick={() => { toggleGroupTokenStatus(token.id, token.status === 'disabled' ? 'available' : 'disabled'); setTokenNotice(`Status ID ${token.code} diperbarui.`); }} className="rounded-lg border border-[#D8CFC8] bg-white px-3 py-2 text-xs font-bold text-[#6D5A50] hover:bg-[#FAF8F5]">{token.status === 'disabled' ? 'Aktifkan' : 'Nonaktifkan'}</button>}<button type="button" onClick={() => { const activeSessionWarning = token.status === 'claimed' ? ' Kelompok yang sedang menggunakan ID ini akan dikeluarkan; jawaban, progres, dan timer sesi ikut dihapus.' : ''; if (window.confirm(`Hapus ID ${token.code}? ID ini tidak dapat digunakan lagi.${activeSessionWarning}`)) { const result = deleteGroupToken(token.id); setTokenNotice(result.message); } }} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Hapus</button></div></article>;
            })}</div>}
            <div className="flex gap-2 rounded-xl border border-[#F0D9A7] bg-[#FFF7DC] p-3 text-xs leading-5 text-[#795329]"><Link2 className="mt-0.5 h-4 w-4 shrink-0"/><span>Link kelas mempertahankan halaman pembuka yang sama. Murid tetap memilih “Masuk sebagai Murid”, mempelajari materi dan latihan, lalu ID pada link akan diverifikasi otomatis saat masuk ke halaman kelas.</span></div>
          </section>
        </div>
      )}

      {/* TAB 1: RINGKASAN KELAS */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs font-semibold text-[#8C7A70]">Total Kelompok Terdaftar</span>
              <div className="text-3xl font-extrabold text-[#3E2723] font-mono">
                {allSubmissions.length}
              </div>
            </div>

            <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs font-semibold text-[#8C7A70]">Menunggu Pemeriksaan</span>
              <div className="text-3xl font-extrabold text-[#FF913D] font-mono">
                {
                  allSubmissions.filter(
                    (s) =>
                      s.status === 'submitted_pending_review' ||
                      s.status === 'reviewed'
                  ).length
                }
              </div>
            </div>

            <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs font-semibold text-[#8C7A70]">Hasil Terpublikasi</span>
              <div className="text-3xl font-extrabold text-[#4A671E] font-mono">
                {allSubmissions.filter((s) => s.status === 'results_published').length}
              </div>
            </div>

            <div className="bg-white border border-[#EAE3D9] p-5 rounded-2xl space-y-1 shadow-xs">
              <span className="text-xs font-semibold text-[#8C7A70]">Pintu Murid Aktif</span>
              <div className="text-sm font-bold text-[#3E2723] pt-1">
                P: {allSubmissions.filter((s) => s.track === 'penjelajah').length} · B:{' '}
                {allSubmissions.filter((s) => s.track === 'pengembang').length} · I:{' '}
                {allSubmissions.filter((s) => s.track === 'inovator').length}
              </div>
            </div>
          </div>

          {/* Quick Submissions Table */}
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#3E2723]">
                  Daftar Berkas Asesmen Kelompok
                </h3>
                <p className="text-xs text-[#6D5A50]">
                  Pilih kelompok untuk meninjau dan menilai berkas jawaban.
                </p>
              </div>

              <button
                onClick={() => createNewSubmission()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Sesi Kelompok Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAE3D9] text-[#8C7A70] uppercase font-bold">
                    <th className="py-2.5 px-3">Nama Kelompok</th>
                    <th className="py-2.5 px-3">Pintu</th>
                    <th className="py-2.5 px-3">Status Asesmen</th>
                    <th className="py-2.5 px-3">Waktu Kirim</th>
                    <th className="py-2.5 px-3">Nilai</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D9]">
                  {allSubmissions.map((sub) => {
                    const isSelected = sub.id === activeSubmissionId;
                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-[#FAF8F5] transition-colors ${
                          isSelected ? 'bg-[#FFE082]/15 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#3E2723]">
                            {sub.team.teamName || '(Belum diberi nama)'}
                          </span>
                          <span className="text-[10px] text-[#8C7A70] block">
                            {sub.team.schoolName || 'SD/MI'}
                          </span>
                        </td>
                        <td className="py-3 px-3 uppercase text-[#95634F] font-bold">
                          {sub.track}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="py-3 px-3 font-mono text-[#6D5A50]">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#3E2723]">
                          {sub.evaluation?.totalScore ?? '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              switchActiveSubmission(sub.id);
                              setActiveTab('penilaian');
                            }}
                            className="px-3 py-1 bg-[#95634F] hover:bg-[#3E2723] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Buka Penilaian
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PEMERIKSAAN & RUBRIK NILAI */}
      {activeTab === 'penilaian' && (
        <div className="space-y-6">
          {/* Submission Info Bar */}
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-[#8C7A70]">Menilai Berkas Kelompok:</span>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#3E2723]">
                  {selectedSubmission?.team?.teamName || 'Kelompok Belajar'}
                </h2>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A]">
                  Pintu {selectedSubmission?.track}
                </span>
                <StatusBadge status={selectedSubmission?.status || 'in_progress'} />
              </div>
            </div>

            {/* Governance Actions + Excel Export */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportSelectedGroupXLSX}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Unduh Lembar / Kartu Nilai Kelompok ini dalam format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                <span>Unduh Excel Kelompok</span>
              </button>

              <button
                onClick={() => setRevisionModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFE082] hover:bg-[#FCD25A] text-[#6F4736] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Minta Revisi</span>
              </button>

              <button
                onClick={() => setReopenModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#D8CFC8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-[#95634F]" />
                <span>Buka Kembali</span>
              </button>

              <button
                onClick={handlePublishResults}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Setujui & Publikasikan Hasil</span>
              </button>
            </div>
          </div>

          {/* Mission Selector Subtabs */}
          <div className="grid grid-cols-2 gap-2 border-b border-[#EAE3D9] pb-2 sm:grid-cols-3 lg:grid-cols-4">
            {reviewQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => setEditingMissionNum(question.missionNumber)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  editingMissionNum === question.missionNumber
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-white text-[#6D5A50] border border-[#EAE3D9] hover:bg-[#FAF8F5]'
                }`}
              >
                Kasus {question.missionNumber}: {question.title}
              </button>
            ))}
          </div>

          {/* Active Mission Inspection Box */}
          {(() => {
            const currentQ = reviewQuestions.find((q) => q.missionNumber === editingMissionNum);
            if (!currentQ) return null;

            const studentAns = selectedSubmission.answers[currentQ.id] || {
              step1: {},
              step2: {},
              step3: {},
              step4: {},
            };
            const currentMissionScore = scoreForMission(editingMissionNum);
            const currentRubric = rubricForMission(editingMissionNum);

            return (
              <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#3E2723]">
                      {currentQ.title}
                    </h3>
                    <p className="text-xs text-[#6D5A50] mt-0.5">{currentQ.story}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#6D5A50]">
                      Status Evaluasi Misi {editingMissionNum}:
                    </span>
                    <select
                      value={currentMissionScore.status}
                      onChange={(e) =>
                        setMissionScores({
                          ...missionScores,
                          [editingMissionNum]: {
                            ...currentMissionScore,
                            status: e.target.value as ReviewVerdict,
                          },
                        })
                      }
                      className="px-2.5 py-1 bg-[#FAF8F5] border border-[#D8CFC8] rounded-lg text-xs font-bold text-[#3E2723]"
                    >
                      <option value="correct">Benar</option>
                      <option value="partially_correct">Sebagian Benar</option>
                      <option value="needs_revision">Perlu Diperbaiki</option>
                      <option value="pending">Menunggu Penilaian</option>
                    </select>
                  </div>
                </div>

                {/* 4 Polya Steps Review */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3E2723]">
                        Tahap 1: Memahami Masalah
                      </span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>Skor:</span>
                        <input
                          type="number"
                          min="0"
                          max={currentRubric.step1}
                          value={currentMissionScore.step1}
                          onChange={(e) =>
                            setMissionScores({
                              ...missionScores,
                              [editingMissionNum]: {
                                ...currentMissionScore,
                                step1: Math.min(currentRubric.step1, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              },
                            })
                          }
                          className="w-12 px-1.5 py-0.5 bg-white border border-[#D8CFC8] rounded text-center font-bold"
                        />
                        <span className="text-[#8C7A70]">/ {currentRubric.step1}</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E8DFD8] text-[11px] space-y-1">
                      <span className="font-semibold text-[#8C7A70] block">Jawaban Murid:</span>
                      {getQuestionAnswerRows(currentQ, 'step1', studentAns).map((row) => (
                        <div key={row.id} className="break-words">
                          <strong>{row.label}:</strong> {row.answer || '(Belum diisi)'}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3E2723]">
                        Tahap 2: Menyusun Rencana
                      </span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>Skor:</span>
                        <input
                          type="number"
                          min="0"
                          max={currentRubric.step2}
                          value={currentMissionScore.step2}
                          onChange={(e) =>
                            setMissionScores({
                              ...missionScores,
                              [editingMissionNum]: {
                                ...currentMissionScore,
                                step2: Math.min(currentRubric.step2, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              },
                            })
                          }
                          className="w-12 px-1.5 py-0.5 bg-white border border-[#D8CFC8] rounded text-center font-bold"
                        />
                        <span className="text-[#8C7A70]">/ {currentRubric.step2}</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E8DFD8] text-[11px] space-y-1">
                      <span className="font-semibold text-[#8C7A70] block">Strategi Murid:</span>
                      {getQuestionAnswerRows(currentQ, 'step2', studentAns).map((row) => <p key={row.id} className="break-words"><strong>{row.label}:</strong> {row.answer || '(Belum diisi)'}</p>)}
                    </div>
                  </div>

                  {/* Step 3 (Objektif KPK) */}
                  <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3E2723]">
                        Tahap 3: Melaksanakan Rencana
                      </span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>Skor:</span>
                        <input
                          type="number"
                          min="0"
                          max={currentRubric.step3}
                          value={currentMissionScore.step3}
                          onChange={(e) =>
                            setMissionScores({
                              ...missionScores,
                              [editingMissionNum]: {
                                ...currentMissionScore,
                                step3: Math.min(currentRubric.step3, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              },
                            })
                          }
                          className="w-12 px-1.5 py-0.5 bg-white border border-[#D8CFC8] rounded text-center font-bold"
                        />
                        <span className="text-[#8C7A70]">/ {currentRubric.step3}</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E8DFD8] text-[11px] space-y-1">
                      {getQuestionAnswerRows(currentQ, 'step3', studentAns).map((row) => <div key={row.id} className="break-words"><strong>{row.label}:</strong> {row.answer || '(Belum diisi)'}{row.expectedAnswer && <span className="text-[#4A671E]"> · Kunci: {row.expectedAnswer}</span>}</div>)}
                      <div><strong>Kunci KPK:</strong> {currentQ.internalKey.kpk} · <strong>Hasil:</strong> {currentQ.internalKey.finalAnswer}</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3E2723]">
                        Tahap 4: Memeriksa Kembali
                      </span>
                      <div className="flex items-center gap-1 font-mono">
                        <span>Skor:</span>
                        <input
                          type="number"
                          min="0"
                          max={currentRubric.step4}
                          value={currentMissionScore.step4}
                          onChange={(e) =>
                            setMissionScores({
                              ...missionScores,
                              [editingMissionNum]: {
                                ...currentMissionScore,
                                step4: Math.min(currentRubric.step4, Math.max(0, parseInt(e.target.value, 10) || 0)),
                              },
                            })
                          }
                          className="w-12 px-1.5 py-0.5 bg-white border border-[#D8CFC8] rounded text-center font-bold"
                        />
                        <span className="text-[#8C7A70]">/ {currentRubric.step4}</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E8DFD8] text-[11px] space-y-1">
                      {getQuestionAnswerRows(currentQ, 'step4', studentAns).map((row) => <p key={row.id} className="break-words"><strong>{row.label}:</strong> {row.answer || '(Belum diisi)'}</p>)}
                    </div>
                  </div>
                </div>

                {/* Feedback for this mission */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3E2723] block">
                    Komentar & Umpan Balik Guru untuk Misi {editingMissionNum}:
                  </label>
                  <input
                    type="text"
                    value={currentMissionScore.feedback}
                    onChange={(e) =>
                      setMissionScores({
                        ...missionScores,
                        [editingMissionNum]: {
                          ...currentMissionScore,
                          feedback: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs font-medium text-[#2D231E]"
                  />
                </div>
              </div>
            );
          })()}

          {/* Presentation & Reflection Scoring */}
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-[#3E2723] border-b border-[#EAE3D9] pb-3">
              Refleksi Murid (Tidak Masuk Penilaian)
            </h3>

            {/* Reflection Answers Display */}
            <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl space-y-3">
              <span className="text-xs font-bold text-[#95634F] uppercase tracking-wider block">
                Jawaban Refleksi Kelompok — hanya sebagai catatan belajar:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px]">1. Pelajaran Bermakna KPK:</span>
                  <p className="text-[#5D4E46] italic">
                    {selectedSubmission?.reflection?.lcmLearning || '(Belum ada jawaban)'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px]">2. Tantangan Terbesar & Solusi:</span>
                  <p className="text-[#5D4E46] italic">
                    {selectedSubmission?.reflection?.challengingMission || '(Belum ada jawaban)'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px]">3. Bagian Paling Mudah:</span>
                  <p className="text-[#5D4E46] italic">
                    {selectedSubmission?.reflection?.easyPart || '(Belum ada jawaban)'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#E8DFD8] space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px]">4. Bagian Membingungkan & Solusi:</span>
                  <p className="text-[#5D4E46] italic">
                    {selectedSubmission?.reflection?.confusingPart || '(Belum ada jawaban)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#3E2723] block">
                Umpan Balik Umum untuk Kelompok:
              </label>
              <textarea
                rows={2}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs font-medium text-[#2D231E]"
              />
            </div>

            {/* Total Score Summary */}
            <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8C7A70] block">Total Skor Dihitung:</span>
                <span className="text-2xl font-extrabold text-[#3E2723] font-mono">
                  {totalScoreCalc} / 100 Poin
                </span>
              </div>

              <button
                onClick={handleSaveEvaluation}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#FFE082]" />
                <span>Simpan Draf Penilaian</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA KELOMPOK & PENGATURAN PINTU */}
      {activeTab === 'kelompok' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#3E2723]">
                  Pengaturan Pintu Belajar (TaRL) & Kunci Jalur
                </h3>
                <p className="text-xs text-[#6D5A50]">
                  Atur apakah murid bebas memilih pintu atau guru yang menetapkan jalur secara seragam.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setTrackLockConfig({
                      isLocked: !trackLockConfig.isLocked,
                      lockedTrack: trackLockConfig.lockedTrack || 'penjelajah',
                    })
                  }
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                    trackLockConfig.isLocked
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-[#C5E68A]/30 border-[#A8D468] text-[#2D231E]'
                  }`}
                >
                  {trackLockConfig.isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>Pintu Terkunci oleh Guru</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-[#4A671E]" />
                      <span>Murid Bebas Memilih Pintu</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {trackLockConfig.isLocked && (
              <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#FFE082] rounded-xl text-xs">
                <span className="font-bold text-[#3E2723]">Tetapkan Jalur Seragam:</span>
                <select
                  value={trackLockConfig.lockedTrack || 'penjelajah'}
                  onChange={(e) =>
                    setTrackLockConfig({
                      ...trackLockConfig,
                      lockedTrack: e.target.value as LearningTrack,
                    })
                  }
                  className="px-2.5 py-1 bg-white border border-[#D8CFC8] rounded-lg font-bold uppercase text-[#3E2723]"
                >
                  <option value="penjelajah">Penjelajah</option>
                  <option value="pengembang">Pengembang</option>
                  <option value="inovator">Inovator</option>
                </select>
              </div>
            )}
          </div>

          {/* Groups List */}
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#3E2723]">
                Daftar Seluruh Kelompok Belajar
              </h3>
              <button
                onClick={() => createNewSubmission()}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FF913D] text-white text-xs font-bold rounded-lg"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Kelompok</span>
              </button>
            </div>

            {groupDeleteNotice && (
              <div
                role={groupDeleteNotice.success ? 'status' : 'alert'}
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                  groupDeleteNotice.success
                    ? 'bg-[#C5E68A]/30 border-[#A8D468] text-[#3E5A1C]'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {groupDeleteNotice.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`border rounded-xl p-4 space-y-3 transition-all ${
                    sub.id === activeSubmissionId
                      ? 'border-[#FF913D] bg-[#FAF8F5] ring-2 ring-[#FF913D]/20'
                      : 'border-[#EAE3D9] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#3E2723] text-sm">
                        {sub.team.teamName || '(Kelompok Baru)'}
                      </h4>
                      <p className="text-[11px] text-[#8C7A70]">{sub.team.schoolName || 'SD/MI'}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A]">
                        {sub.track}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>

                  {/* Members list */}
                  <div className="text-xs text-[#6D5A50] space-y-0.5">
                    {sub.team.members.filter((m) => m.name).length > 0 ? (
                      sub.team.members
                        .filter((m) => m.name)
                        .map((m, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>{m.name}</span>
                            <span className="text-[#8C7A70] italic">({m.role})</span>
                          </div>
                        ))
                    ) : (
                      <span className="text-[#8C7A70] italic text-[11px]">
                        Anggota belum diisi oleh murid
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D9] flex items-center justify-between text-xs">
                    <button
                      onClick={() => switchActiveSubmission(sub.id)}
                      className="font-bold text-[#FF913D] hover:underline"
                    >
                      Pilih Sebagai Kelompok Aktif
                    </button>
                    <button
                      onClick={() => {
                        const teamName = sub.team.teamName || 'ini';
                        const lastGroupNotice =
                          allSubmissions.length === 1
                            ? '\nKarena ini kelompok terakhir, aplikasi akan menyiapkan satu sesi kosong baru.'
                            : '';
                        const linkedTokenNotice =
                          sub.groupId || sub.groupCode
                            ? ' ID Kelompok yang terhubung akan dikembalikan menjadi tersedia.'
                            : '';
                        const workingNotice =
                          sub.isTimerRunning || sub.status === 'in_progress'
                            ? '\nKelompok ini mungkin sedang mengerjakan misi: layar siswa akan keluar dari sesi dalam beberapa detik dan progres yang belum dikirim tidak dapat dipulihkan.'
                            : '';
                        const confirmed = confirm(
                          `Hapus data kelompok ${teamName}? Identitas, jawaban, progres, dan timer aktif akan dihapus.${linkedTokenNotice}${lastGroupNotice}${workingNotice}`
                        );
                        if (confirmed) {
                          setGroupDeleteNotice(deleteSubmissionResponse(sub.id, true));
                        }
                      }}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Hapus data kelompok"
                      aria-label={`Hapus data kelompok ${sub.team.teamName || 'baru'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#DCE9C6] bg-gradient-to-br from-[#F4F9E9] via-white to-[#FFF7DC] p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#4A671E] shadow-sm">RUANG KREASI GURU</span><h2 className="mt-3 text-2xl font-black text-[#3E2723] sm:text-3xl">Materi & Soal</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#6D5A50]">Atur materi dan soal untuk ketiga pintu belajar, simpan sebagai draf, lalu terbitkan setelah pratinjau.</p><button type="button" onClick={() => setActiveTab('bank_soal')} className="mt-3 rounded-lg border border-[#D8CFC8] bg-white px-3 py-2 text-xs font-bold text-[#704A36]">Atur jumlah soal per pintu</button></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setPreviewLearning((open) => !open)} className="rounded-xl border border-[#D8CFC8] bg-white px-4 py-2.5 text-sm font-extrabold text-[#704A36]">{previewLearning ? 'Tutup Pratinjau' : 'Pratinjau Murid'}</button><span className="self-center rounded-full bg-white px-3 py-2 text-xs font-bold text-[#4A671E]">Database: {cloudStatus === 'online' ? 'Terhubung' : cloudStatus === 'connecting' ? 'Menghubungkan' : 'Offline'}</span></div>
            </div>
          </section>
          {editorNotice && <div role="status" className="rounded-xl border border-[#DCE9C6] bg-[#F4F9E9] px-4 py-3 text-sm font-bold text-[#42631D]">{editorNotice}</div>}
          {previewLearning && <section className="rounded-2xl border-2 border-dashed border-[#FFCB74] bg-white p-5 sm:p-7"><span className="rounded-full bg-[#FFF7DC] px-3 py-1 text-xs font-black text-[#8C6D1F]">PRATINJAU KONTEN DRAF</span><h3 className="mt-3 text-xl font-black text-[#3E2723]">{editorDraft.tracks[editorTrack].name} · {editorDraft.tracks[editorTrack].difficulty}</h3><p className="mt-2 text-sm leading-6 text-[#5D4E46]">{editorDraft.objective}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><p className="rounded-xl bg-[#F4F9E9] p-4 text-sm"><strong>Materi:</strong> {editorDraft.materials}</p><p className="rounded-xl bg-[#FFF7DC] p-4 text-sm"><strong>Petunjuk:</strong> {editorDraft.hints}</p><p className="rounded-xl bg-[#FAF8F5] p-4 text-sm"><strong>Instruksi:</strong> {editorDraft.instructions}</p><p className="rounded-xl bg-[#FBEDE2] p-4 text-sm"><strong>Aktivitas pintu:</strong> {editorDraft.tracks[editorTrack].activity}</p></div>{selectedEditorQuestion && <div className="mt-4 rounded-xl border border-[#EAE3D9] p-4"><strong>{selectedEditorQuestion.title}</strong><p className="mt-2 text-sm">{selectedEditorQuestion.story}</p></div>}</section>}

          <section className="space-y-5 rounded-2xl border border-[#EAE3D9] bg-white p-5 shadow-sm sm:p-7">
            <div><h3 className="text-lg font-black text-[#3E2723]">Tujuan dan panduan belajar</h3><p className="text-sm text-[#6D5A50]">Konten umum ditampilkan pada materi murid setelah diterbitkan.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              {([
                ['objective', 'Tujuan pembelajaran'], ['materials', 'Materi dan alat belajar'], ['instructions', 'Instruksi pengerjaan'], ['hints', 'Petunjuk umum'],
              ] as const).map(([key, label]) => <label key={key} className="space-y-1.5 text-sm font-extrabold text-[#3E2723]">{label}<textarea rows={3} value={editorDraft[key]} onChange={(event) => setEditorDraft((draft) => ({ ...draft, [key]: event.target.value }))} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] p-3 text-sm font-medium" /></label>)}
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-[#EAE3D9] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-[#3E2723]">Pintu belajar 1, 2, dan 3</h3><p className="text-sm text-[#6D5A50]">Atur nama, materi, kasus, aktivitas, dan tingkat tantangan tiap pintu.</p></div><select aria-label="Pilih pintu belajar" value={editorTrack} onChange={(event) => setEditorTrack(event.target.value as LearningTrack)} className="rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] px-3 py-2 font-bold"><option value="penjelajah">Pintu 1 · Penjelajah</option><option value="pengembang">Pintu 2 · Pengembang</option><option value="inovator">Pintu 3 · Inovator</option></select></div>
            <div className="grid gap-4 sm:grid-cols-2">{([
              ['name', 'Nama pintu'], ['difficulty', 'Tingkat kesulitan'], ['material', 'Materi khusus pintu'], ['cases', 'Nama dan konteks kasus'], ['activity', 'Aktivitas murid'],
            ] as const).map(([key, label]) => <label key={key} className="space-y-1.5 text-sm font-extrabold text-[#3E2723]">{label}<textarea rows={key === 'name' || key === 'difficulty' ? 1 : 2} value={editorDraft.tracks[editorTrack][key]} onChange={(event) => setEditorDraft((draft) => ({ ...draft, tracks: { ...draft.tracks, [editorTrack]: { ...draft.tracks[editorTrack], [key]: event.target.value } } }))} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] p-3 text-sm font-medium" /></label>)}</div>
          </section>

          <section className="space-y-5 rounded-2xl border border-[#EAE3D9] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-[#3E2723]">Editor soal dan aktivitas</h3><p className="text-sm text-[#6D5A50]">Buat soal sebanyak yang dibutuhkan pada setiap pintu. Nomor soal mengikuti urutan di pintu tersebut.</p></div><button type="button" onClick={() => handleAddEditorQuestion(editorTrack)} className="inline-flex items-center gap-2 rounded-xl bg-[#4A671E] px-4 py-2.5 text-sm font-black text-white"><Plus size={17}/> Tambah soal · {editorDraft.tracks[editorTrack].name}</button></div>
            <div className="grid gap-4 lg:grid-cols-[minmax(220px,.72fr)_minmax(0,1.6fr)]">
              <div className="max-h-[32rem] space-y-2 overflow-y-auto rounded-xl bg-[#FAF8F5] p-3">{editorQuestions.map((question, index) => <div key={question.id} className={`rounded-xl border p-3 ${selectedEditorQuestion?.id === question.id ? 'border-[#FF913D] bg-white' : 'border-[#EAE3D9] bg-white/70'}`}><button type="button" onClick={() => { setEditorTrack(question.track); setEditorQuestionId(question.id); }} className="w-full text-left"><span className="block text-xs font-black text-[#95634F]">{index + 1}. Kasus {question.missionNumber} · {editorDraft.tracks[question.track].name}</span><span className="mt-1 block text-sm font-bold text-[#3E2723]">{question.title}</span></button><div className="mt-2 flex gap-1"><button type="button" aria-label="Pindahkan soal ke atas" disabled={index === 0} onClick={() => moveEditorQuestion(question.id, -1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">↑</button><button type="button" aria-label="Pindahkan soal ke bawah" disabled={index === editorQuestions.length - 1} onClick={() => moveEditorQuestion(question.id, 1)} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40">↓</button><button type="button" onClick={() => handleDeleteEditorQuestion(question.id)} className="ml-auto rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-700">Hapus</button></div></div>)}</div>
              {selectedEditorQuestion ? <div className="grid content-start gap-4 sm:grid-cols-2"><label className="space-y-1 text-sm font-bold text-[#3E2723]">Pintu soal<select value={selectedEditorQuestion.track} onChange={(event) => handleEditorTrackChange(selectedEditorQuestion, event.target.value as LearningTrack)} className="w-full rounded-xl border border-[#D8CFC8] p-3"><option value="penjelajah">Pintu 1 · Penjelajah</option><option value="pengembang">Pintu 2 · Pengembang</option><option value="inovator">Pintu 3 · Inovator</option></select></label><label className="space-y-1 text-sm font-bold text-[#3E2723]">Nomor kasus<input type="number" min="1" value={selectedEditorQuestion.missionNumber} onChange={(event) => handleEditorQuestionNumberChange(selectedEditorQuestion, event.target.value)} className="w-full rounded-xl border border-[#D8CFC8] p-3" /></label>{[
                { key: 'title', label: 'Nama soal / aktivitas', rows: 1 }, { key: 'story', label: 'Cerita kasus', rows: 4 }, { key: 'step1Prompt', label: 'Instruksi tahap 1', rows: 2 }, { key: 'step2Prompt', label: 'Instruksi tahap 2', rows: 2 }, { key: 'step3Prompt', label: 'Instruksi tahap 3', rows: 2 }, { key: 'step4Prompt', label: 'Instruksi tahap 4', rows: 2 }, { key: 'explanation', label: 'Pembahasan / rubrik jawaban', rows: 3 }, { key: 'practiceAdvice', label: 'Saran belajar', rows: 2 },
              ].map(({ key, label, rows }) => <label key={key} className="space-y-1 text-sm font-bold text-[#3E2723]">{label}<textarea rows={rows} value={String(selectedEditorQuestion[key as keyof MissionQuestion] ?? '')} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { [key]: event.target.value })} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] p-3 text-sm font-medium" /></label>)}
                <label className="space-y-1 text-sm font-bold text-[#3E2723]">Bilangan 1<input type="number" min="1" value={selectedEditorQuestion.num1} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { num1: Math.max(1, Number(event.target.value) || 1) })} className="w-full rounded-xl border border-[#D8CFC8] p-3" /></label><label className="space-y-1 text-sm font-bold text-[#3E2723]">Bilangan 2<input type="number" min="1" value={selectedEditorQuestion.num2} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { num2: Math.max(1, Number(event.target.value) || 1) })} className="w-full rounded-xl border border-[#D8CFC8] p-3" /></label>
                <label className="space-y-1 text-sm font-bold text-[#3E2723]">Kunci jawaban akhir<input value={selectedEditorQuestion.internalKey.finalAnswer} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { internalKey: { ...selectedEditorQuestion.internalKey, finalAnswer: event.target.value } })} className="w-full rounded-xl border border-[#D8CFC8] p-3" /></label><label className="space-y-1 text-sm font-bold text-[#3E2723]">Tanggal awal (opsional)<input value={selectedEditorQuestion.startDate || ''} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { startDate: event.target.value || undefined })} className="w-full rounded-xl border border-[#D8CFC8] p-3" /></label>
                {(['step1', 'step2', 'step3', 'step4'] as const).map((step) => <label key={step} className="space-y-1 text-sm font-bold text-[#3E2723]">Petunjuk {step.slice(-1)} (satu per baris)<textarea rows={3} value={selectedEditorQuestion.didacticHints[step].join('\n')} onChange={(event) => patchEditorQuestion(selectedEditorQuestion.id, { didacticHints: { ...selectedEditorQuestion.didacticHints, [step]: event.target.value.split('\n') } })} className="w-full rounded-xl border border-[#D8CFC8] bg-[#FFFCF7] p-3 text-sm font-medium" /></label>)}
                <div className="rounded-xl bg-[#FFF7DC] p-3 text-sm"><strong>Kunci hitung otomatis:</strong> KPK({selectedEditorQuestion.num1}, {selectedEditorQuestion.num2}) = {calculateLCM(selectedEditorQuestion.num1, selectedEditorQuestion.num2)} {selectedEditorQuestion.unit}</div>
              </div> : <p className="rounded-xl bg-[#FAF8F5] p-5 text-sm text-[#6D5A50]">Belum ada soal. Tambahkan soal untuk mulai menyunting.</p>}
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#EAE3D9] pt-4"><button type="button" disabled={editorBusy || cloudStatus !== 'online'} onClick={() => void saveEditor(false)} className="rounded-xl border border-[#95634F] bg-white px-5 py-3 text-sm font-black text-[#704A36] disabled:opacity-50">{editorBusy ? 'Menyimpan…' : 'Simpan Draf'}</button><button type="button" disabled={editorBusy || cloudStatus !== 'online' || !editorDraft.questions.length} onClick={() => { if (confirm('Terbitkan materi ini untuk semua murid di kelas Anda?')) void saveEditor(true); }} className="rounded-xl bg-[#FF913D] px-5 py-3 text-sm font-black text-white shadow-sm disabled:opacity-50">{editorBusy ? 'Memproses…' : 'Publikasikan untuk Murid'}</button></div>
          </section>
        </div>
      )}

      {/* TAB 4: BANK SOAL */}
      {activeTab === 'bank_soal' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#3E2723]">
                  Bank Soal · {editorQuestions.length} soal
                </h3>
                <p className="text-xs text-[#6D5A50]">
                  Atur jumlah soal tanpa batas untuk setiap pintu. Perubahan disimpan sebagai draf dan diterbitkan melalui Editor Pembelajaran.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-bold text-[#3E2723]">Pintu belajar
                <select value={editorTrack} onChange={(event) => setEditorTrack(event.target.value as LearningTrack)} className="ml-2 rounded-lg border border-[#D8CFC8] bg-white px-3 py-2">
                  {(['penjelajah', 'pengembang', 'inovator'] as LearningTrack[]).map((track) => <option key={track} value={track}>{editorDraft.tracks[track].name}</option>)}
                </select>
              </label>
              <span className="text-xs text-[#6D5A50]">{editorQuestions.filter((question) => question.track === editorTrack).length} soal pada pintu ini</span>
              <button type="button" onClick={() => handleAddEditorQuestion(editorTrack)} className="ml-auto rounded-xl bg-[#4A671E] px-4 py-2.5 text-sm font-black text-white"><Plus size={16} className="mr-1 inline"/>Tambah soal</button>
            </div>
            {/* Daftar soal pada pintu aktif */}
            <div className="space-y-3">
              {editorQuestions.filter((q) => q.track === editorTrack).map((q) => (
                <div
                  key={q.id}
                  className="bg-[#FAF8F5] border border-[#EAE3D9] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#95634F]/20 text-[#6F4736]">
                        Misi {q.missionNumber} · Pintu {q.track}
                      </span>
                      <h4 className="font-bold text-sm text-[#3E2723]">{q.title}</h4>
                    </div>
                    <p className="text-xs text-[#6D5A50] line-clamp-2">{q.story || 'Belum ada teks soal.'}</p>
                    <div className="text-[11px] font-mono text-[#3E2723]">
                      Interval: <strong>{q.num1} & {q.num2} {q.unit}</strong> · KPK Terhitung:{' '}
                      <strong>{q.internalKey.kpk}</strong> · Kunci Jawaban Akhir:{' '}
                      <strong className="text-[#4A671E]">{q.internalKey.finalAnswer}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#FFE082]" />
                    <span>Edit Soal & Bilangan</span>
                  </button>
                  <button type="button" onClick={() => handleDeleteEditorQuestion(q.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
            {editorNotice && <p role="status" className="text-sm font-semibold text-[#6F4736]">{editorNotice}</p>}
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#EAE3D9] pt-4">
              <button type="button" disabled={editorBusy || cloudStatus !== 'online'} onClick={() => void saveEditor(false)} className="rounded-xl border border-[#95634F] bg-white px-5 py-3 text-sm font-black text-[#704A36] disabled:opacity-50">{editorBusy ? 'Menyimpan…' : 'Simpan Draf'}</button>
              <button type="button" disabled={editorBusy || cloudStatus !== 'online' || !editorDraft.questions.length} onClick={() => { if (confirm('Terbitkan perubahan bank soal untuk murid?')) void saveEditor(true); }} className="rounded-xl bg-[#FF913D] px-5 py-3 text-sm font-black text-white shadow-sm disabled:opacity-50">{editorBusy ? 'Memproses…' : 'Terbitkan Soal'}</button>
            </div>
          </div>

          {/* Edit Question Modal */}
          {editingQuestion && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#EAE3D9] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#EAE3D9] pb-3">
                  <h3 className="text-base font-bold text-[#3E2723]">
                    Edit Soal: {editingQuestion.title}
                  </h3>
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-[#8C7A70] hover:text-[#3E2723]"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#3E2723] block">Teks Cerita Soal:</label>
                    <textarea
                      rows={3}
                      value={editingQuestion.story}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, story: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-[#3E2723] block">Bilangan 1 (Interval):</label>
                      <input
                        type="number"
                        min="1"
                        value={editingQuestion.num1}
                        onChange={(e) => {
                          const n1 = parseInt(e.target.value, 10) || 1;
                          setEditingQuestion({ ...editingQuestion, num1: n1 });
                        }}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#3E2723] block">Bilangan 2 (Interval):</label>
                      <input
                        type="number"
                        min="1"
                        value={editingQuestion.num2}
                        onChange={(e) => {
                          const n2 = parseInt(e.target.value, 10) || 1;
                          setEditingQuestion({ ...editingQuestion, num2: n2 });
                        }}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {editingQuestion.startDate && (
                    <div className="space-y-1">
                      <label className="font-bold text-[#3E2723] block">Tanggal Awal Kegiatan:</label>
                      <input
                        type="text"
                        value={editingQuestion.startDate}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, startDate: e.target.value })
                        }
                        placeholder="Tuliskan tanggal awal kegiatan..."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-medium"
                      />
                    </div>
                  )}

                  {/* Real-time Math Recalculation Preview */}
                  <div className="p-3 bg-[#FFE082]/30 border border-[#FFE082] rounded-xl text-xs space-y-1">
                    <span className="font-bold text-[#6F4736] block">
                      Kalkulasi Otomatis Sistem:
                    </span>
                    <div className="font-mono text-[#3E2723]">
                      KPK({editingQuestion.num1}, {editingQuestion.num2}) ={' '}
                      <strong>{calculateLCM(editingQuestion.num1, editingQuestion.num2)}</strong>
                    </div>
                    {editingQuestion.startDate && (
                      <div className="font-mono text-[#3E2723]">
                        Tanggal Berikutnya:{' '}
                        <strong>
                          {
                            addDaysToDate(
                              editingQuestion.startDate,
                              calculateLCM(editingQuestion.num1, editingQuestion.num2)
                            ).formatted
                          }
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE3D9]">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 bg-[#FAF8F5] text-xs font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      patchEditorQuestion(editingQuestion.id, editingQuestion);
                      setEditingQuestion(null);
                    }}
                    className="px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl"
                  >
                    Simpan ke Draf
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RUBRIK PENILAIAN */}
      {activeTab === 'rubrik' && (
        <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-[#EAE3D9] pb-4">
            <h3 className="text-base font-bold text-[#3E2723]">
              Pengaturan Bobot Rubrik Nilai (Total Maksimal 100 Poin)
            </h3>
            <p className="text-xs text-[#6D5A50] mt-0.5">
              Nilai akhir dihitung dari jawaban empat kasus dan dinormalisasi ke skala 100. Refleksi tidak dinilai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D9] space-y-3">
              <h4 className="font-bold text-[#3E2723]">Durasi Pengerjaan</h4>
              <label className="block font-semibold" htmlFor="assessment-duration">Waktu dalam menit (default 25 menit):</label>
              <input
                id="assessment-duration"
                type="number"
                min="1"
                max="240"
                step="1"
                value={rubricConfig.durationMinutes ?? 25}
                onChange={(e) => updateRubricConfig({
                  ...rubricConfig,
                  durationMinutes: Math.max(1, Math.min(240, parseInt(e.target.value, 10) || 25)),
                })}
                className="w-28 px-3 py-2 bg-white border border-[#D8CFC8] rounded-lg font-mono font-bold"
              />
              <p className="text-[11px] text-[#6D5A50]">Perubahan berlaku untuk pengerjaan berikutnya. Jika tidak diubah, timer memakai 25 menit.</p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D9] space-y-3">
              <h4 className="font-bold text-[#3E2723]">Bobot Empat Misi (20 Poin Masing-Masing)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block font-semibold">Tahap 1 (Memahami):</span>
                  <input
                    type="number"
                    value={rubricConfig.mission1.step1}
                    onChange={(e) =>
                      updateRubricConfig({
                        ...rubricConfig,
                        mission1: { ...rubricConfig.mission1, step1: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#D8CFC8] rounded font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <span className="block font-semibold">Tahap 2 (Rencana):</span>
                  <input
                    type="number"
                    value={rubricConfig.mission1.step2}
                    onChange={(e) =>
                      updateRubricConfig({
                        ...rubricConfig,
                        mission1: { ...rubricConfig.mission1, step2: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#D8CFC8] rounded font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <span className="block font-semibold">Tahap 3 (Hitung KPK):</span>
                  <input
                    type="number"
                    value={rubricConfig.mission1.step3}
                    onChange={(e) =>
                      updateRubricConfig({
                        ...rubricConfig,
                        mission1: { ...rubricConfig.mission1, step3: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#D8CFC8] rounded font-mono font-bold mt-1"
                  />
                </div>
                <div>
                  <span className="block font-semibold">Tahap 4 (Periksa):</span>
                  <input
                    type="number"
                    value={rubricConfig.mission1.step4}
                    onChange={(e) =>
                      updateRubricConfig({
                        ...rubricConfig,
                        mission1: { ...rubricConfig.mission1, step4: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-[#D8CFC8] rounded font-mono font-bold mt-1"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: REKAP NILAI & EKSPOR EXCEL / CSV */}
      {activeTab === 'rekap' && (
        <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#3E2723]">
                Rekap Hasil Asesmen Formatif KPK Kelas V
              </h3>
              <p className="text-xs text-[#6D5A50]">
                Ekspor berkas Microsoft Excel (.XLSX) lengkap multi-sheet, CSV, atau cetak lembar nilai formatif untuk rekap kurikulum sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                title="Unduh seluruh rekap nilai, detail Polya, dan transkrip jawaban dalam berkas Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                <span>Unduh Excel (.XLSX)</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#FFE082]" />
                <span>Unduh CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#D8CFC8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#95634F]" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D9] text-[#8C7A70] uppercase font-bold">
                  <th className="py-2.5 px-3">Kelompok</th>
                  <th className="py-2.5 px-3">Pintu Belajar</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">M1 (20)</th>
                  <th className="py-2.5 px-3">M2 (20)</th>
                  <th className="py-2.5 px-3">M3 (20)</th>
                  <th className="py-2.5 px-3">M4 (20)</th>
                  <th className="py-2.5 px-3 font-bold">Total (100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D9]">
                {allSubmissions.map((s) => {
                  const ev = s.evaluation;
                  return (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-bold text-[#3E2723]">
                        {s.team.teamName || 'Kelompok Belajar'}
                      </td>
                      <td className="py-3 px-3 uppercase text-[#95634F] font-bold">
                        {s.track}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-3 font-mono">{ev?.missions?.[1]?.totalScore ?? '-'}</td>
                      <td className="py-3 px-3 font-mono">{ev?.missions?.[2]?.totalScore ?? '-'}</td>
                      <td className="py-3 px-3 font-mono">{ev?.missions?.[3]?.totalScore ?? '-'}</td>
                      <td className="py-3 px-3 font-mono">{ev?.missions?.[4]?.totalScore ?? '-'}</td>
                      <td className="py-3 px-3 font-mono font-extrabold text-[#3E2723]">
                        {ev?.totalScore ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EAE3D9]">
            <h3 className="text-base font-bold text-[#3E2723]">
              Kirim Permintaan Revisi ke Murid
            </h3>
            <p className="text-xs text-[#5D4E46]">
              Tentukan bagian mana saja yang dibuka kuncinya untuk diperbaiki oleh kelompok.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#3E2723] block">
                Bagian yang Diizinkan Diedit:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'misi-1', label: 'Misi 1 (Piket)' },
                  { id: 'misi-2', label: 'Misi 2 (Lampu)' },
                  { id: 'misi-3', label: 'Misi 3 (Olahraga)' },
                  { id: 'misi-4', label: 'Misi 4 (Agenda)' },
                  { id: 'presentation', label: 'Presentasi' },
                  { id: 'reflection', label: 'Refleksi' },
                ].map((sec) => (
                  <label key={sec.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedSections.includes(sec.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedSections([...allowedSections, sec.id]);
                        } else {
                          setAllowedSections(allowedSections.filter((s) => s !== sec.id));
                        }
                      }}
                      className="accent-[#FF913D]"
                    />
                    <span>{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#3E2723] block">
                Catatan Petunjuk Perbaikan Guru:
              </label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Tuliskan petunjuk perbaikan yang perlu diperiksa kembali oleh kelompok..."
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 bg-[#FAF8F5] text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleRequestRevisionSubmit}
                className="px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EAE3D9]">
            <h3 className="text-base font-bold text-[#3E2723]">
              Buka Kembali Asesmen Murid
            </h3>
            <p className="text-xs text-[#5D4E46]">
              Guru wajib mencantumkan alasan pembukaan kembali asesmen untuk pencatatan riwayat sistem.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#3E2723] block">Nama Guru:</label>
              <input
                type="text"
                value={teacherNameInput}
                onChange={(e) => setTeacherNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-[#3E2723] block">
                Alasan Pembukaan Kembali:
              </label>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Tuliskan alasan membuka kembali asesmen..."
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReopenModalOpen(false)}
                className="px-4 py-2 bg-[#FAF8F5] text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleReopenSubmit}
                className="px-5 py-2 bg-[#3E2723] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Konfirmasi Buka Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'results_published') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5E68A] text-[#2D231E]">
        Dipublikasikan
      </span>
    );
  }
  if (status === 'submitted_pending_review') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFE082] text-[#6F4736]">
        Menunggu Tinjauan
      </span>
    );
  }
  if (status === 'revision_requested') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
        Revisi Diminta
      </span>
    );
  }
  if (status === 'reopened') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
        Dibuka Kembali
      </span>
    );
  }
  if (status === 'reviewed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
        Sudah Diperiksa (Belum Publik)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-[#8C7A70]">
      Sedang Dikerjakan
    </span>
  );
}
