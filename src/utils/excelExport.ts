import * as XLSX from 'xlsx';
import { AssessmentSubmission, RubricConfig } from '../types';

/**
 * Calculates achievement category based on standard Indonesian formative assessment scales.
 */
export const getPredikatScore = (score: number | undefined): string => {
  if (score === undefined || score === null) return 'Belum Dinilai';
  if (score >= 90) return 'Sangat Mahir (A)';
  if (score >= 80) return 'Mahir (B)';
  if (score >= 70) return 'Berkembang (C)';
  return 'Perlu Pendampingan (D)';
};

/**
 * Translates learning track enum to human-friendly Indonesian label
 */
export const getTrackLabel = (track: string): string => {
  switch (track) {
    case 'penjelajah':
      return 'Penjelajah (Butuh Bimbingan)';
    case 'pengembang':
      return 'Pengembang (Berkembang)';
    case 'inovator':
      return 'Inovator (Mahir)';
    default:
      return track;
  }
};

/**
 * Translates submission status to readable Indonesian text
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'in_progress':
      return 'Belum Dinilai (Sedang Dikerjakan)';
    case 'submitted_pending_review':
      return 'Belum Dinilai (Menunggu Koreksi Guru)';
    case 'time_expired_pending_review':
      return 'Waktu Habis (Menunggu Koreksi Guru)';
    case 'reviewed':
      return 'Draf Koreksi (Belum Diterbitkan)';
    case 'revision_requested':
      return 'Revisi Diminta Guru';
    case 'reopened':
      return 'Dibuka Kembali';
    case 'results_published':
      return 'Penilaian Diterbitkan (Resmi)';
    default:
      return status;
  }
};

/**
 * Export all formative assessment evaluation data to an Excel (.xlsx) file
 */
export const exportAssessmentToExcel = (
  submissions: AssessmentSubmission[],
  rubricConfig?: RubricConfig,
  fileNamePrefix: string = 'Rekap_Asesmen_Ruang_Misi_KPK'
) => {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: REKAP NILAI FORMATIF UTAMA
  // ==========================================
  const rekapData: (string | number)[][] = [
    ['REKAPITULASI HASIL ASESMEN FORMATIF MATEMATIKA KELAS V SD/MI'],
    ['Materi Pokok: Kelipatan Persekutuan Terkecil (KPK) - 4 Tahap Polya'],
    [`Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}`],
    [''], // Baris kosong pemisah
    [
      'No',
      'ID Kelompok',
      'Nama Kelompok',
      'Pintu Belajar (Tingkat)',
      'Anggota Tim',
      'Status Asesmen',
      'Kasus 1',
      'Kasus 2',
      'Kasus 3',
      'Kasus 4',
      'Presentasi Kelompok',
      'Total Nilai (100)',
      'Predikat Capaian',
      'Catatan & Umpan Balik Guru',
      'Waktu Pengumpulan',
    ],
  ];

  submissions.forEach((sub, idx) => {
    const ev = sub.evaluation;
    const isPublished = sub.status === 'results_published';
    const isDraftReview = sub.status === 'reviewed';
    const members = (sub.team.members || []).map((m) => m.name).filter(Boolean).join(', ');

    // Protect unconfirmed scores: Only export final scores if officially published
    const m1Score = isPublished || isDraftReview ? (ev?.missions?.[1]?.totalScore ?? '-') : '-';
    const m2Score = isPublished || isDraftReview ? (ev?.missions?.[2]?.totalScore ?? '-') : '-';
    const m3Score = isPublished || isDraftReview ? (ev?.missions?.[3]?.totalScore ?? '-') : '-';
    const m4Score = isPublished || isDraftReview ? (ev?.missions?.[4]?.totalScore ?? '-') : '-';
    const presScore = isPublished || isDraftReview ? (ev?.presentation?.totalScore ?? '-') : '-';
    const totalScore = isPublished ? (ev?.totalScore ?? '-') : isDraftReview ? `[Draf: ${ev?.totalScore ?? '-'}]` : '-';
    const predikat = isPublished && typeof ev?.totalScore === 'number'
      ? getPredikatScore(ev.totalScore)
      : isDraftReview
      ? 'Draf Koreksi (Belum Disahkan)'
      : 'Belum Dinilai';

    rekapData.push([
      idx + 1,
      sub.groupCode || sub.groupId || sub.id,
      sub.team.teamName || 'Kelompok Belajar',
      getTrackLabel(sub.track),
      members || '-',
      getStatusLabel(sub.status),
      m1Score,
      m2Score,
      m3Score,
      m4Score,
      presScore,
      totalScore,
      predikat,
      ev?.generalFeedback || '-',
      sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('id-ID') : 'Belum Dikirim',
    ]);
  });

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);

  // Set column widths for Sheet 1
  wsRekap['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // ID Kelompok
    { wch: 22 }, // Nama Kelompok
    { wch: 28 }, // Pintu Belajar
    { wch: 35 }, // Anggota Tim
    { wch: 24 }, // Status
    { wch: 16 }, // Kasus 1
    { wch: 16 }, // Kasus 2
    { wch: 16 }, // Kasus 3
    { wch: 16 }, // Kasus 4
    { wch: 16 }, // Presentasi
    { wch: 14 }, // Total Nilai
    { wch: 22 }, // Predikat
    { wch: 45 }, // Umpan Balik Guru
    { wch: 20 }, // Waktu Pengumpulan
  ];

  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap Nilai');

  // ==========================================
  // SHEET 2: DETAIL TAHAP POLYA PER KASUS
  // ==========================================
  const detailPolyaData: (string | number)[][] = [
    ['RINCIAN SKOR 4 TAHAP POLYA PER KASUS MATEMATIKA'],
    ['Skor maksimal per kasus = 20 (Tahap 1 = 4, Tahap 2 = 4, Tahap 3 = 8, Tahap 4 = 4) | Presentasi = 20'],
    [''],
    [
      'Nama Kelompok',
      'Pintu Belajar',
      // Kasus 1
      'K1: T1 (Memahami)',
      'K1: T2 (Rencana)',
      'K1: T3 (Selesai)',
      'K1: T4 (Periksa)',
      'K1: Subtotal',
      // Kasus 2
      'K2: T1 (Memahami)',
      'K2: T2 (Rencana)',
      'K2: T3 (Selesai)',
      'K2: T4 (Periksa)',
      'K2: Subtotal',
      // Kasus 3
      'K3: T1 (Memahami)',
      'K3: T2 (Rencana)',
      'K3: T3 (Selesai)',
      'K3: T4 (Periksa)',
      'K3: Subtotal',
      // Kasus 4
      'K4: T1 (Memahami)',
      'K4: T2 (Rencana)',
      'K4: T3 (Selesai)',
      'K4: T4 (Periksa)',
      'K4: Subtotal',
      // Presentasi
      'Pres: Ketepatan (8)',
      'Pres: Strategi (6)',
      'Pres: Kolaborasi (6)',
      'Pres: Subtotal (20)',
      // Total
      'TOTAL SKOR AKHIR (100)',
    ],
  ];

  submissions.forEach((sub) => {
    const ev = sub.evaluation;
    const m1 = ev?.missions?.[1];
    const m2 = ev?.missions?.[2];
    const m3 = ev?.missions?.[3];
    const m4 = ev?.missions?.[4];
    const pres = ev?.presentation;

    detailPolyaData.push([
      sub.team.teamName || 'Kelompok Belajar',
      getTrackLabel(sub.track),
      // M1
      m1?.step1?.score ?? (m1 as any)?.step1Score ?? '-',
      m1?.step2?.score ?? (m1 as any)?.step2Score ?? '-',
      m1?.step3?.score ?? (m1 as any)?.step3Score ?? '-',
      m1?.step4?.score ?? (m1 as any)?.step4Score ?? '-',
      m1?.totalScore ?? '-',
      // M2
      m2?.step1?.score ?? (m2 as any)?.step1Score ?? '-',
      m2?.step2?.score ?? (m2 as any)?.step2Score ?? '-',
      m2?.step3?.score ?? (m2 as any)?.step3Score ?? '-',
      m2?.step4?.score ?? (m2 as any)?.step4Score ?? '-',
      m2?.totalScore ?? '-',
      // M3
      m3?.step1?.score ?? (m3 as any)?.step1Score ?? '-',
      m3?.step2?.score ?? (m3 as any)?.step2Score ?? '-',
      m3?.step3?.score ?? (m3 as any)?.step3Score ?? '-',
      m3?.step4?.score ?? (m3 as any)?.step4Score ?? '-',
      m3?.totalScore ?? '-',
      // M4
      m4?.step1?.score ?? (m4 as any)?.step1Score ?? '-',
      m4?.step2?.score ?? (m4 as any)?.step2Score ?? '-',
      m4?.step3?.score ?? (m4 as any)?.step3Score ?? '-',
      m4?.step4?.score ?? (m4 as any)?.step4Score ?? '-',
      m4?.totalScore ?? '-',
      // Pres
      pres?.accuracy ?? (pres as any)?.accuracyScore ?? '-',
      pres?.strategy ?? (pres as any)?.strategyScore ?? '-',
      pres?.collaboration ?? (pres as any)?.collaborationScore ?? '-',
      pres?.totalScore ?? '-',
      // Total
      ev?.totalScore ?? '-',
    ]);
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailPolyaData);
  wsDetail['!cols'] = [
    { wch: 22 }, // Kelompok
    { wch: 20 }, // Pintu
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, // K1
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, // K2
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, // K3
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, // K4
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, // Pres
    { wch: 18 }, // Total
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Rincian Tahap Polya');

  // ==========================================
  // SHEET 3: TRANSKRIP JAWABAN SISWA
  // ==========================================
  const transkripData: (string | number)[][] = [
    ['TRANSKRIP JAWABAN ASESMEN FORMATIF SISWA PER KASUS'],
    ['Rekaman pengerjaan lembar kerja siswa untuk kebutuhan arsip dan portofolio belajar'],
    [''],
    [
      'Nama Kelompok',
      'Pintu Belajar',
      'Kasus Ke',
      'Tahap Polya',
      'Kode Pertanyaan',
      'Jawaban Siswa',
    ],
  ];

  submissions.forEach((sub) => {
    const teamName = sub.team.teamName || 'Kelompok Belajar';
    const trackLabel = getTrackLabel(sub.track);

    [1, 2, 3, 4].forEach((missionNum) => {
      const answers =
        sub.answers?.[missionNum] ||
        (sub.answers as any)?.[String(missionNum)] ||
        (sub.answers as any)?.[`misi-${missionNum}`];
      if (!answers) return;

      const steps: Array<{ stepKey: 'step1' | 'step2' | 'step3' | 'step4'; stepLabel: string }> = [
        { stepKey: 'step1', stepLabel: 'Tahap 1: Memahami Masalah' },
        { stepKey: 'step2', stepLabel: 'Tahap 2: Menyusun Rencana' },
        { stepKey: 'step3', stepLabel: 'Tahap 3: Melaksanakan Rencana' },
        { stepKey: 'step4', stepLabel: 'Tahap 4: Memeriksa Kembali' },
      ];

      steps.forEach(({ stepKey, stepLabel }) => {
        const stepAnswers = answers[stepKey];
        if (!stepAnswers || typeof stepAnswers !== 'object') return;

        Object.entries(stepAnswers).forEach(([fieldId, ansVal]) => {
          if (ansVal !== undefined && ansVal !== null && String(ansVal).trim() !== '') {
            transkripData.push([
              teamName,
              trackLabel,
              `Kasus ${missionNum}`,
              stepLabel,
              fieldId,
              String(ansVal),
            ]);
          }
        });
      });
    });
  });

  const wsTranskrip = XLSX.utils.aoa_to_sheet(transkripData);
  wsTranskrip['!cols'] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 12 },
    { wch: 30 },
    { wch: 20 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTranskrip, 'Jawaban Murid');

  // ==========================================
  // SHEET 4: PRESENTASI & REFLEKSI KELOMPOK
  // ==========================================
  const presentasiRefleksiData: (string | number)[][] = [
    ['NASKAH PRESENTASI & REFLEKSI AKHIR KELOMPOK'],
    ['Dokumentasi komunikasi matematis dan refleksi metakognitif siswa'],
    [''],
    [
      'Nama Kelompok',
      'Pintu Belajar',
      'Masalah yang Dipilih',
      'Informasi Diketahui',
      'Strategi Kelipatan yang Dipakai',
      'Nilai KPK yang Ditemukan',
      'Cara Memeriksa Kebenaran',
      'Alasan Keyakinan Jawaban',
      'Kesimpulan Kelompok',
      'Refleksi: Pelajaran Baru tentang KPK',
      'Refleksi: Tantangan Terbesar & Solusi',
      'Refleksi: Bagian Paling Mudah',
      'Refleksi: Bagian Membingungkan',
    ],
  ];

  submissions.forEach((sub) => {
    const p = sub.presentation || ({} as any);
    const r = sub.reflection || ({} as any);
    presentasiRefleksiData.push([
      sub.team.teamName || 'Kelompok Belajar',
      getTrackLabel(sub.track),
      p.problemSolved || '-',
      p.knownInformation || '-',
      p.strategyUsed || '-',
      p.lcmFound || '-',
      p.verificationMethod || '-',
      p.confidenceReason || '-',
      p.groupConclusion || '-',
      r.lcmLearning || '-',
      r.challengingMission || '-',
      r.easyPart || '-',
      r.confusingPart || '-',
    ]);
  });

  const wsPresRef = XLSX.utils.aoa_to_sheet(presentasiRefleksiData);
  wsPresRef['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 30 },
    { wch: 30 },
    { wch: 35 },
    { wch: 25 },
    { wch: 30 },
    { wch: 30 },
    { wch: 35 },
    { wch: 35 },
    { wch: 35 },
    { wch: 30 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPresRef, 'Presentasi & Refleksi');

  // ==========================================
  // SHEET 5: RUBRIK PENILAIAN FORMATIF
  // ==========================================
  const rubrikData: (string | number)[][] = [
    ['PANDUAN RUBRIK PENILAIAN FORMATIF MATEMATIKA KPK KELAS V'],
    ['Berdasarkan 4 Tahap Pemecahan Masalah George Polya dan Presentasi Kelompok'],
    [''],
    ['Komponen Evaluasi', 'Tahap / Aspek', 'Bobot Maksimal', 'Deskripsi Capaian'],
    ['Pemecahan Masalah Soal', 'Tahap 1: Memahami Masalah', rubricConfig?.mission1?.step1 ?? 4, 'Menuliskan hal yang diketahui, ditanyakan, dan waktu awal secara lengkap & tepat.'],
    ['Pemecahan Masalah Soal', 'Tahap 2: Menyusun Rencana', rubricConfig?.mission1?.step2 ?? 4, 'Memilih strategi kelipatan persekutuan atau penandaan kalender yang sistematis.'],
    ['Pemecahan Masalah Soal', 'Tahap 3: Melaksanakan Rencana', rubricConfig?.mission1?.step3 ?? 8, 'Menemukan KPK dengan benar dan menghitung tanggal/waktu pertemuan berikutnya dengan akurat.'],
    ['Pemecahan Masalah Soal', 'Tahap 4: Memeriksa Kembali', rubricConfig?.mission1?.step4 ?? 4, 'Menguji kelipatan dan memastikan kebenaran hasil perhitungan secara matematis.'],
    ['Presentasi Kelompok', 'Ketepatan Matematika', rubricConfig?.presentation?.accuracy ?? 8, 'Ketepatan konsep kelipatan, KPK, dan penjelasan kalender.'],
    ['Presentasi Kelompok', 'Strategi & Kejelasan Alur', rubricConfig?.presentation?.strategy ?? 6, 'Kejelasan pemaparan langkah 1-4 secara logis dan runtut.'],
    ['Presentasi Kelompok', 'Kolaborasi Tim', rubricConfig?.presentation?.collaboration ?? 6, 'Keterlibatan aktif anggota kelompok saat presentasi dan menjawab pertanyaan.'],
  ];

  const wsRubrik = XLSX.utils.aoa_to_sheet(rubrikData);
  wsRubrik['!cols'] = [
    { wch: 25 },
    { wch: 28 },
    { wch: 16 },
    { wch: 60 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRubrik, 'Panduan Rubrik');

  // Trigger browser download of .xlsx
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fullFileName = `${fileNamePrefix}_${dateStamp}.xlsx`;
  XLSX.writeFile(wb, fullFileName);
};
