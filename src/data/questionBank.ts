import { AssessmentSubmission, MissionQuestion } from '../types';

export const INITIAL_QUESTION_BANK: MissionQuestion[] = [
  // ==========================================
  // MISI 1 — JADWAL PIKET KELAS
  // ==========================================
  {
    id: 'm1_penjelajah',
    missionNumber: 1,
    context: 'piket',
    track: 'penjelajah',
    title: 'Misi 1: Jadwal Piket Kelas (Penjelajah)',
    story:
      'Rina bertugas menyiram tanaman kelas setiap 2 hari sekali, sedangkan Siti setiap 3 hari sekali. Mereka bertugas bersama pada tanggal 1 Agustus. Pada tanggal berapa mereka akan bertugas bersama lagi?',
    num1: 2,
    num2: 3,
    startDate: '1 Agustus',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi informasi penting dari cerita di atas:',
    step1Fields: [
      {
        id: 'rina_interval',
        label: 'Rina bertugas setiap ... hari sekali',
        placeholder: 'Tuliskan angka interval Rina...',
        type: 'number',
        scaffoldSuffix: 'hari sekali',
        expectedAnswer: '2',
      },
      {
        id: 'siti_interval',
        label: 'Siti bertugas setiap ... hari sekali',
        placeholder: 'Tuliskan angka interval Siti...',
        type: 'number',
        scaffoldSuffix: 'hari sekali',
        expectedAnswer: '3',
      },
      {
        id: 'start_date',
        label: 'Mereka bertugas bersama pada tanggal ...',
        placeholder: 'Tuliskan tanggal awal bersama...',
        type: 'text',
        expectedAnswer: '1 Agustus',
      },
      {
        id: 'question_asked',
        label: 'Yang ditanyakan adalah ...',
        placeholder: 'Tuliskan apa yang ingin dicari...',
        type: 'text',
        expectedAnswer: 'Tanggal mereka bertugas bersama lagi',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt:
      'Carilah KPK dari kedua bilangan dengan menuliskan kelipatan untuk menentukan berapa hari lagi mereka bertugas bersama.',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana strategi kelompok kami:',
        placeholder: 'Jelaskan langkah apa yang akan kalian gunakan untuk mencari jadwal bersama...',
        type: 'textarea',
        helperText: 'Tuliskan langkah pencarian kelipatan dari kedua bilangan untuk menemukan kelipatan yang sama.',
        expectedAnswer: 'Mencari kelipatan 2 dan kelipatan 3, lalu mencari KPK.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Tuliskan kelipatan kedua bilangan dan temukan kelipatan persekutuan terkecil (KPK):',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 2:',
        placeholder: 'Tuliskan deretan kelipatan 2 dipisahkan koma...',
        type: 'text',
        helperText: 'Tuliskan kelipatan 2 secara berurutan.',
        expectedAnswer: '2, 4, 6, 8, 10, 12',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 3:',
        placeholder: 'Tuliskan deretan kelipatan 3 dipisahkan koma...',
        type: 'text',
        helperText: 'Tuliskan kelipatan 3 secara berurutan.',
        expectedAnswer: '3, 6, 9, 12, 15, 18',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Tuliskan nilai KPK...',
        type: 'number',
        expectedAnswer: '6',
      },
      {
        id: 'days_interval',
        label: 'Mereka bertugas bersama lagi setelah ... hari',
        placeholder: 'Jumlah hari berikutnya...',
        type: 'number',
        scaffoldSuffix: 'hari',
        expectedAnswer: '6',
      },
      {
        id: 'final_date',
        label: 'Tanggal berikutnya (tanggal awal + hasil KPK):',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '7 Agustus',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Pastikan hasil perhitunganmu telah diuji dan benar:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Apakah hasil KPK habis dibagi kedua interval bilangan?',
        placeholder: 'Tuliskan pembuktian pembagian tanpa sisa...',
        type: 'text',
        helperText: 'Periksa apakah hasil KPK dibagi kedua bilangan menghasilkan bilangan bulat.',
        expectedAnswer: 'Ya, 6 habis dibagi 2 dan 3.',
      },
      {
        id: 'check_smallest',
        label: 'Apakah ada kelipatan persekutuan positif yang lebih kecil dari hasilmu?',
        placeholder: 'Jelaskan hasil pemeriksaanmu...',
        type: 'text',
        expectedAnswer: 'Tidak ada, 6 adalah kelipatan persekutuan pertama/terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Apakah tanggal awal sudah ditambahkan dengan KPK secara teliti?',
        placeholder: 'Tuliskan cara kalian menjumlahkan tanggal awal dengan hari KPK...',
        type: 'text',
        expectedAnswer: 'Sudah, 1 Agustus + 6 hari = 7 Agustus.',
      },
    ],
    didacticHints: {
      step1: [
        'Cermati berapa hari sekali Rina menyiram tanaman.',
        'Cermati berapa hari sekali Siti menyiram tanaman.',
        'Kapan mereka pertama kali piket bersama?',
      ],
      step2: [
        'Peristiwa ini berulang secara berkala. Konsep matematika apa yang tepat?',
        'Apakah kita perlu mencari bilangan kelipatan bersama?',
      ],
      step3: [
        'Tuliskan kelipatan pertama bilangan dengan melompat secara berkala.',
        'Perhatikan angka pertama yang sama-sama muncul di kedua daftar.',
        'Tambahkan hasil KPK ke tanggal awal kegiatan.',
      ],
      step4: [
        'Apakah angka KPK bisa dibagi kedua interval tanpa sisa?',
        'Apakah ada angka yang sama sebelum angka KPK tersebut?',
      ],
    },
    internalKey: {
      kpk: 6,
      finalAnswer: '7 Agustus',
      multiples1: [2, 4, 6, 8, 10, 12],
      multiples2: [3, 6, 9, 12, 15, 18],
    },
    explanation:
      'Kelipatan 2 adalah 2, 4, 6, 8, 10, 12... Kelipatan 3 adalah 3, 6, 9, 12, 15... Kelipatan persekutuan terkecil (KPK) dari 2 dan 3 adalah 6. Jadi mereka bertugas bersama lagi setelah 6 hari. Tanggal awal 1 Agustus + 6 hari = 7 Agustus.',
    practiceAdvice:
      'Latih kembali penjumlahan bilangan loncat untuk memastikan kelipatan ditemukan dengan akurat.',
  },

  {
    id: 'm1_pengembang',
    missionNumber: 1,
    context: 'piket',
    track: 'pengembang',
    title: 'Misi 1: Jadwal Piket Kelas (Pengembang)',
    story:
      'Kelompok piket A bertugas setiap 4 hari sekali, sedangkan kelompok B setiap 6 hari sekali. Mereka bertugas bersama pada tanggal 2 Agustus. Tentukan tanggal mereka bertugas bersama lagi.',
    num1: 4,
    num2: 6,
    startDate: '2 Agustus',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Tuliskan hal-hal yang diketahui dan ditanyakan secara mandiri:',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Informasi yang diketahui (interval masing-masing kelompok & tanggal awal):',
        placeholder: 'Tuliskan interval kedua kelompok dan tanggal awal bersama...',
        type: 'textarea',
        expectedAnswer: 'Kelompok A bertugas setiap 4 hari sekali, Kelompok B setiap 6 hari sekali. Bersama tanggal 2 Agustus.',
      },
      {
        id: 'question_asked',
        label: 'Hal yang ditanyakan:',
        placeholder: 'Tuliskan apa yang ingin ditentukan...',
        type: 'text',
        expectedAnswer: 'Tanggal kedua kelompok bertugas bersama lagi.',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt:
      'Tentukan KPK dari 4 dan 6 dengan menyusun strategi penyelesaian bersama kelompokmu.',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Strategi pemecahan masalah kelompok kami:',
        placeholder: 'Jelaskan alur pencarian KPK dan penambahan kalender...',
        type: 'textarea',
        expectedAnswer: 'Menuliskan kelipatan 4 dan 6, mencari KPK, lalu menambahkan hasil KPK ke tanggal 2 Agustus.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Tuliskan deret kelipatan dan tentukan tanggal bertugas bersama berikutnya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 4:',
        placeholder: 'Tuliskan deretan kelipatan 4...',
        type: 'text',
        expectedAnswer: '4, 8, 12, 16, 20, 24',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 6:',
        placeholder: 'Tuliskan deretan kelipatan 6...',
        type: 'text',
        expectedAnswer: '6, 12, 18, 24, 30',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '12',
      },
      {
        id: 'final_date',
        label: 'Tanggal piket bersama berikutnya:',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '14 Agustus',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Periksa kebenaran hasil perhitungan dan kalender:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Apakah KPK habis dibagi kedua interval bilangan?',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: 'Ya, 12 : 4 = 3 dan 12 : 6 = 2.',
      },
      {
        id: 'check_smallest',
        label: 'Pastikan tidak ada kelipatan persekutuan positif yang lebih kecil dari hasilmu:',
        placeholder: 'Penjelasan pemeriksaanmu...',
        type: 'text',
        expectedAnswer: 'Benar, 12 adalah kelipatan persekutuan terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Periksa tanggal berikutnya menggunakan kalender:',
        placeholder: 'Tuliskan perhitungan penambahan tanggal kalender...',
        type: 'text',
        expectedAnswer: '2 Agustus + 12 hari = 14 Agustus.',
      },
    ],
    didacticHints: {
      step1: ['Tuliskan kedua interval dan tanggal awal kegiatan bersama.'],
      step2: ['Gunakan metode kelipatan untuk mencari persekutuan terkecil.'],
      step3: ['Perhatikan angka pertama yang sama pada kedua deret kelipatan.', 'Jumlahkan tanggal awal dengan hasil KPK.'],
      step4: ['Buktikan bahwa hasil KPK habis dibagi kedua bilangan tanpa sisa.'],
    },
    internalKey: {
      kpk: 12,
      finalAnswer: '14 Agustus',
      multiples1: [4, 8, 12, 16, 20, 24],
      multiples2: [6, 12, 18, 24, 30],
    },
    explanation:
      'Kelipatan 4 = 4, 8, 12, 16... Kelipatan 6 = 6, 12, 18... KPK dari 4 dan 6 adalah 12. Tanggal piket bersama berikutnya = 2 Agustus + 12 hari = 14 Agustus.',
    practiceAdvice:
      'Perhatikan bilangan yang sama-sama menjadi kelipatan kedua bilangan; pilihlah yang paling kecil.',
  },

  {
    id: 'm1_inovator',
    missionNumber: 1,
    context: 'piket',
    track: 'inovator',
    title: 'Misi 1: Jadwal Piket Kelas (Inovator)',
    story:
      'Kelompok piket A bertugas setiap 8 hari sekali dan kelompok B setiap 12 hari sekali. Mereka bertugas bersama pada tanggal 3 September. Tentukan tanggal mereka bertugas bersama lagi dan jelaskan alasanmu.',
    num1: 8,
    num2: 12,
    startDate: '3 September',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Baca cerita, lalu isi tiga hal ini: yang diketahui, yang ditanyakan, dan tanggal awal.',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Apa yang diketahui?',
        placeholder: 'Contoh: Kelompok A piket setiap 8 hari dan kelompok B setiap 12 hari.',
        type: 'textarea',
        expectedAnswer: 'Kelompok A piket setiap 8 hari dan kelompok B setiap 12 hari.',
      },
      {
        id: 'question_asked',
        label: 'Apa yang ditanyakan?',
        placeholder: 'Tuliskan hal yang harus dicari...',
        type: 'text',
        expectedAnswer: 'Tanggal mereka piket bersama lagi dan alasan jawabannya.',
      },
      {
        id: 'start_date',
        label: 'Tanggal/waktu awal:',
        placeholder: 'Tuliskan kapan mereka mulai bersama...',
        type: 'text',
        expectedAnswer: '3 September',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Pilih dan rancang strategi efektif untuk mencari KPK dari kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_choice',
        label: 'Pilihan strategi dan rasionalitasnya:',
        placeholder: 'Jelaskan metode yang dipilih (pohon faktor, faktorisasi prima, deret) beserta alasannya...',
        type: 'textarea',
        expectedAnswer: 'Menggunakan faktorisasi prima atau kelipatan untuk mencari KPK(8, 12).',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Laksanakan strategi pembuktian matematika:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan atau faktorisasi bilangan pertama:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '8, 16, 24, 32, 40 (atau 2^3)',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan atau faktorisasi bilangan kedua:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '12, 24, 36, 48 (atau 2^2 x 3)',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan:',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '24',
      },
      {
        id: 'final_date',
        label: 'Tanggal piket bersama berikutnya:',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '27 September',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Buktikan dan evaluasi kebenaran solusi secara logis:',
    step4Fields: [
      {
        id: 'proof_divisibility',
        label: 'Buktikan bahwa hasil KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian matematis pembagian...',
        type: 'textarea',
        expectedAnswer: '24 : 8 = 3 dan 24 : 12 = 2. Keduanya bilangan bulat tanpa sisa.',
      },
      {
        id: 'proof_minimality',
        label: 'Jelaskan mengapa hasil tersebut merupakan kelipatan persekutuan TERKECIL:',
        placeholder: 'Jelaskan alasan logis minimalitasnya...',
        type: 'textarea',
        expectedAnswer: 'Kelipatan 12 sebelum 24 adalah 12, dan 12 tidak habis dibagi 8. Maka 24 adalah kelipatan persekutuan positif terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Periksa perhitungan penambahan tanggal kalender:',
        placeholder: 'Tuliskan langkah pengujian penambahan tanggal...',
        type: 'text',
        expectedAnswer: '3 September + 24 hari = 27 September.',
      },
    ],
    didacticHints: {
      step1: ['Tentukan interval berulang dan kondisi awal sistem.'],
      step2: ['Strategi apa yang paling cepat: mendaftar kelipatan atau pohon faktor?'],
      step3: ['Periksa faktor prima atau deretan kelipatan terkecil yang sama.'],
      step4: ['Buktikan bahwa tidak ada bilangan positif di bawah hasil KPK yang habis dibagi kedua bilangan.'],
    },
    internalKey: {
      kpk: 24,
      finalAnswer: '27 September',
      multiples1: [8, 16, 24, 32, 40],
      multiples2: [12, 24, 36, 48],
    },
    explanation:
      'KPK dari 8 dan 12 adalah 24 (karena 24 habis dibagi 8 dan 12, dan merupakan yang terkecil). Tanggal awal 3 September + 24 hari = 27 September.',
    practiceAdvice:
      'Buktikan sifat minimalitas kelipatan persekutuan dengan memeriksa kelipatan yang lebih kecil.',
  },

  // ==========================================
  // MISI 2 — LAMPU LALU LINTAS (SIMULASI)
  // ==========================================
  {
    id: 'm2_penjelajah',
    missionNumber: 2,
    context: 'lampu',
    track: 'penjelajah',
    title: 'Misi 2: Lampu Lalu Lintas (Penjelajah)',
    story:
      '(Catatan: Waktu pada soal merupakan simulasi pembelajaran di laboratorium sekolah, bukan pengaturan lalu lintas jalan raya nyata.)\nDalam simulasi persimpangan, lampu A memberikan tanda setiap 2 detik dan lampu B setiap 4 detik. Kedua lampu memberikan tanda bersama pada awal simulasi. Setelah berapa detik keduanya memberikan tanda bersama lagi?',
    num1: 2,
    num2: 4,
    unit: 'detik',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi informasi penting dari simulasi lampu:',
    step1Fields: [
      {
        id: 'lamp_a_interval',
        label: 'Lampu A memberikan tanda setiap ... detik',
        placeholder: 'Tuliskan angka interval lampu A...',
        type: 'number',
        scaffoldSuffix: 'detik',
        expectedAnswer: '2',
      },
      {
        id: 'lamp_b_interval',
        label: 'Lampu B memberikan tanda setiap ... detik',
        placeholder: 'Tuliskan angka interval lampu B...',
        type: 'number',
        scaffoldSuffix: 'detik',
        expectedAnswer: '4',
      },
      {
        id: 'question_asked',
        label: 'Yang ditanyakan adalah ...',
        placeholder: 'Tuliskan sasaran waktu yang dicari...',
        type: 'text',
        expectedAnswer: 'Setelah berapa detik keduanya memberikan tanda bersama lagi',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Carilah KPK dari kedua interval detik dengan menuliskan kelipatan kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kelompok kami:',
        placeholder: 'Tuliskan cara mencari waktu menyala bersama...',
        type: 'textarea',
        expectedAnswer: 'Mencari kelipatan 2 dan 4 dalam hitungan detik untuk menemukan KPK.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Tuliskan kelipatan detik dan temukan detik bersamanya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan bilangan pertama:',
        placeholder: 'Tuliskan deretan kelipatan bilangan pertama...',
        type: 'text',
        expectedAnswer: '2, 4, 6, 8, 10, 12',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan bilangan kedua:',
        placeholder: 'Tuliskan deretan kelipatan bilangan kedua...',
        type: 'text',
        expectedAnswer: '4, 8, 12, 16, 20',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '4',
      },
      {
        id: 'final_answer',
        label: 'Kedua lampu memberikan tanda bersama lagi setelah ... detik',
        placeholder: 'Tuliskan jawaban dalam detik...',
        type: 'text',
        expectedAnswer: '4 detik',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Pastikan waktu simulasi telah diuji:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Apakah hasil KPK habis dibagi kedua interval bilangan?',
        placeholder: 'Tuliskan pengujian pembagian...',
        type: 'text',
        expectedAnswer: 'Ya, 4 : 2 = 2 dan 4 : 4 = 1.',
      },
      {
        id: 'check_smallest',
        label: 'Apakah ada waktu positif yang lebih kecil ketika kedua lampu menyala bersama?',
        placeholder: 'Jelaskan pengamatanmu...',
        type: 'text',
        expectedAnswer: 'Tidak ada, 4 detik adalah waktu pertama keduanya bertanda bersama.',
      },
      {
        id: 'check_conclusion',
        label: 'Jadi, waktu kedua lampu memberikan tanda bersama lagi adalah ... detik:',
        placeholder: 'Tuliskan kesimpulan akhir...',
        type: 'text',
        expectedAnswer: '4 detik',
      },
    ],
    didacticHints: {
      step1: ['Perhatikan interval kedip masing-masing lampu dalam satuan detik.'],
      step2: ['Gunakan kelipatan waktu detik untuk menemukan persekutuan.'],
      step3: ['Perhatikan angka pertama yang sama pada kedua baris kelipatan.'],
      step4: ['Buktikan bahwa pada detik hasil KPK kedua lampu menyala pada saat yang sama.'],
    },
    internalKey: {
      kpk: 4,
      finalAnswer: '4 detik',
      multiples1: [2, 4, 6, 8, 10, 12],
      multiples2: [4, 8, 12, 16, 20],
    },
    explanation:
      'Kelipatan 2 = 2, 4, 6, 8... Kelipatan 4 = 4, 8, 12... Karena 4 adalah kelipatan dari 2, maka KPK dari 2 dan 4 adalah 4. Kedua lampu menyala bersama lagi setelah 4 detik.',
    practiceAdvice:
      'Jika salah satu bilangan merupakan kelipatan dari bilangan lain, maka KPK-nya adalah bilangan yang lebih besar tersebut.',
  },

  {
    id: 'm2_pengembang',
    missionNumber: 2,
    context: 'lampu',
    track: 'pengembang',
    title: 'Misi 2: Lampu Lalu Lintas (Pengembang)',
    story:
      '(Catatan: Waktu pada soal merupakan simulasi pembelajaran di laboratorium sekolah, bukan pengaturan lalu lintas jalan raya nyata.)\nDalam simulasi persimpangan, lampu A memberikan tanda setiap 6 detik dan lampu B setiap 8 detik. Keduanya memberikan tanda bersama pada awal simulasi. Setelah berapa detik keduanya memberikan tanda bersama lagi?',
    num1: 6,
    num2: 8,
    unit: 'detik',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Tuliskan informasi diketahui dan ditanyakan:',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Diketahui (interval kedua lampu):',
        placeholder: 'Tuliskan interval masing-masing lampu...',
        type: 'textarea',
        expectedAnswer: 'Lampu A bertanda setiap 6 detik, Lampu B bertanda setiap 8 detik.',
      },
      {
        id: 'question_asked',
        label: 'Ditanyakan:',
        placeholder: 'Tuliskan apa yang ditanyakan...',
        type: 'text',
        expectedAnswer: 'Setelah berapa detik keduanya memberikan tanda bersama lagi.',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Tuliskan kelipatan 6 dan 8, kemudian tentukan kelipatan persekutuan terkecilnya:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kerja kelompok:',
        placeholder: 'Uraikan rencana penyelesaian masalah...',
        type: 'textarea',
        expectedAnswer: 'Mencari kelipatan 6 dan kelipatan 8, lalu mengambil KPK.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Cari KPK dari 6 dan 8:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 6:',
        placeholder: 'Tuliskan kelipatan 6...',
        type: 'text',
        expectedAnswer: '6, 12, 18, 24, 30, 36',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 8:',
        placeholder: 'Tuliskan kelipatan 8...',
        type: 'text',
        expectedAnswer: '8, 16, 24, 32, 40',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '24',
      },
      {
        id: 'final_answer',
        label: 'Kedua lampu memberikan tanda bersama lagi setelah ... detik',
        placeholder: 'Tuliskan hasil akhir...',
        type: 'text',
        expectedAnswer: '24 detik',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Evaluasi hasil dan jelaskan rasionalitas penggunaan KPK:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Periksa apakah hasil KPK habis dibagi 6 dan 8:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '24 : 6 = 4 dan 24 : 8 = 3.',
      },
      {
        id: 'check_smallest',
        label: 'Pastikan tidak ada kelipatan persekutuan positif yang lebih kecil:',
        placeholder: 'Penjelasan pemeriksaanmu...',
        type: 'text',
        expectedAnswer: '24 adalah kelipatan persekutuan terkecil dari 6 dan 8.',
      },
      {
        id: 'explain_why_lcm',
        label: 'Jelaskan mengapa kasus ini menggunakan KPK:',
        placeholder: 'Tuliskan alasan mengapa KPK tepat digunakan...',
        type: 'textarea',
        expectedAnswer: 'Karena mencari waktu berulang bersama pertama kali dari dua siklus yang berbeda.',
      },
    ],
    didacticHints: {
      step1: ['Catat angka interval masing-masing lampu.'],
      step2: ['Kita ingin mencari waktu detik terkecil saat kedua lampu bertemu.'],
      step3: ['Periksa kelipatan bersama terkecil yang muncul pada kedua daftar.'],
      step4: ['Jelaskan bahwa KPK digunakan untuk peristiwa berulang yang mencari pertemuan berikutnya.'],
    },
    internalKey: {
      kpk: 24,
      finalAnswer: '24 detik',
      multiples1: [6, 12, 18, 24, 30, 36],
      multiples2: [8, 16, 24, 32, 40],
    },
    explanation:
      'Kelipatan 6 = 6, 12, 18, 24, 30... Kelipatan 8 = 8, 16, 24, 32... KPK dari 6 dan 8 adalah 24. Kedua lampu memberikan tanda bersama lagi setelah 24 detik.',
    practiceAdvice:
      'Pastikan menulis kelipatan bilangan secara bertahap untuk mempermudah mencocokkan.',
  },

  {
    id: 'm2_inovator',
    missionNumber: 2,
    context: 'lampu',
    track: 'inovator',
    title: 'Misi 2: Lampu Lalu Lintas (Inovator)',
    story:
      '(Catatan: Waktu pada soal merupakan simulasi pembelajaran di laboratorium sekolah, bukan pengaturan lalu lintas jalan raya nyata.)\nDua lampu indikator dalam simulasi memberikan tanda setiap 8 detik dan 18 detik. Keduanya memberikan tanda bersama pada awal simulasi. Tentukan waktu kedua lampu memberikan tanda bersama lagi.',
    num1: 8,
    num2: 18,
    unit: 'detik',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Baca cerita, lalu isi tiga hal ini: yang diketahui, yang ditanyakan, dan waktu awal.',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Apa yang diketahui?',
        placeholder: 'Contoh: Lampu A memberi tanda setiap 8 detik dan lampu B setiap 18 detik.',
        type: 'textarea',
        expectedAnswer: 'Lampu A memberi tanda setiap 8 detik dan lampu B setiap 18 detik.',
      },
      {
        id: 'question_asked',
        label: 'Apa yang ditanyakan?',
        placeholder: 'Tuliskan hal yang harus dicari...',
        type: 'text',
        expectedAnswer: 'Setelah berapa detik kedua lampu memberi tanda bersama lagi.',
      },
      {
        id: 'start_date',
        label: 'Tanggal/waktu awal:',
        placeholder: 'Tuliskan kapan kedua lampu mulai memberi tanda bersama...',
        type: 'text',
        expectedAnswer: 'Awal simulasi, saat kedua lampu memberi tanda bersama (0 detik).',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Pilih strategi efektif untuk menemukan KPK dari 8 dan 18:',
    step2Fields: [
      {
        id: 'strategy_choice',
        label: 'Strategi pemilihan metode:',
        placeholder: 'Jelaskan metode yang dipilih...',
        type: 'textarea',
        expectedAnswer: 'Menggunakan faktorisasi prima: 8 = 2^3 dan 18 = 2 x 3^2, atau rumus KPK = (a x b) / FPB.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Lakukan perhitungan KPK:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Proses kelipatan / faktorisasi bilangan pertama:',
        placeholder: 'Tuliskan langkah perhitungan...',
        type: 'text',
        expectedAnswer: '8, 16, 24, 32, 40, 48, 56, 64, 72 (2^3)',
      },
      {
        id: 'multiples_num2',
        label: 'Proses kelipatan / faktorisasi bilangan kedua:',
        placeholder: 'Tuliskan langkah perhitungan...',
        type: 'text',
        expectedAnswer: '18, 36, 54, 72 (2 x 3^2)',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '72',
      },
      {
        id: 'final_answer',
        label: 'Kedua lampu memberikan tanda bersama lagi setelah ... detik',
        placeholder: 'Tuliskan hasil akhir...',
        type: 'text',
        expectedAnswer: '72 detik',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Buktikan dan validasi model matematika:',
    step4Fields: [
      {
        id: 'proof_divisibility',
        label: 'Buktikan bahwa hasil KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '72 : 8 = 9 dan 72 : 18 = 4, keduanya menghasilkan bilangan bulat.',
      },
      {
        id: 'proof_minimality',
        label: 'Periksa apakah terdapat kelipatan persekutuan positif yang lebih kecil:',
        placeholder: 'Tuliskan evaluasi minimalitas...',
        type: 'text',
        expectedAnswer: 'Kelipatan 18 yang lebih kecil (18, 36, 54) tidak ada yang habis dibagi 8. Jadi 72 adalah yang terkecil.',
      },
      {
        id: 'explain_why_lcm',
        label: 'Jelaskan mengapa KPK tepat digunakan pada kasus ini:',
        placeholder: 'Tuliskan argumentasi matematis...',
        type: 'textarea',
        expectedAnswer: 'Karena kita mencari titik temu pertama dari dua siklus waktu berkala.',
      },
    ],
    didacticHints: {
      step1: ['Perhatikan angka kedua interval.'],
      step2: ['Faktorisasi prima dapat mempermudah menghitung bilangan belasan.'],
      step3: ['Ambil faktor prima dengan pangkat tertinggi.'],
      step4: ['Buktikan dengan pembagian pada kedua bilangan asli.'],
    },
    internalKey: {
      kpk: 72,
      finalAnswer: '72 detik',
      multiples1: [8, 16, 24, 32, 40, 48, 56, 64, 72],
      multiples2: [18, 36, 54, 72],
    },
    explanation:
      '8 = 2³, 18 = 2 × 3². KPK = 2³ × 3² = 8 × 9 = 72. Kedua lampu indikator memberikan tanda bersama lagi setelah 72 detik.',
    practiceAdvice:
      'Gunakan metode faktorisasi prima untuk bilangan yang lebih besar agar perhitungan lebih cepat.',
  },

  // ==========================================
  // MISI 3 — JADWAL OLAHRAGA
  // ==========================================
  {
    id: 'm3_penjelajah',
    missionNumber: 3,
    context: 'olahraga',
    track: 'penjelajah',
    title: 'Misi 3: Jadwal Olahraga (Penjelajah)',
    story:
      'Dika berolahraga setiap 2 hari sekali, sedangkan Rudi setiap 7 hari sekali. Mereka berolahraga bersama pada tanggal 1 Oktober. Pada tanggal berapa mereka akan berolahraga bersama lagi?',
    num1: 2,
    num2: 7,
    startDate: '1 Oktober',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi informasi penting dari jadwal olahraga:',
    step1Fields: [
      {
        id: 'dika_interval',
        label: 'Dika berolahraga setiap ... hari sekali',
        placeholder: 'Interval Dika...',
        type: 'number',
        scaffoldSuffix: 'hari sekali',
        expectedAnswer: '2',
      },
      {
        id: 'rudi_interval',
        label: 'Rudi berolahraga setiap ... hari sekali',
        placeholder: 'Interval Rudi...',
        type: 'number',
        scaffoldSuffix: 'hari sekali',
        expectedAnswer: '7',
      },
      {
        id: 'start_date',
        label: 'Mereka berolahraga bersama pada tanggal ...',
        placeholder: 'Tanggal awal bersama...',
        type: 'text',
        expectedAnswer: '1 Oktober',
      },
      {
        id: 'question_asked',
        label: 'Yang ditanyakan adalah ...',
        placeholder: 'Tuliskan hal yang ditanyakan...',
        type: 'text',
        expectedAnswer: 'Pada tanggal berapa mereka akan berolahraga bersama lagi',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Carilah KPK dari 2 dan 7 dengan menuliskan kelipatan kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kerja:',
        placeholder: 'Tuliskan rencana penyelesaian...',
        type: 'textarea',
        expectedAnswer: 'Mencari kelipatan 2 dan 7, mencari KPK, lalu menambahkan ke 1 Oktober.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Hitung kelipatan dan tentukan tanggal bersama berikutnya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 2:',
        placeholder: 'Tuliskan kelipatan 2...',
        type: 'text',
        expectedAnswer: '2, 4, 6, 8, 10, 12, 14',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 7:',
        placeholder: 'Tuliskan kelipatan 7...',
        type: 'text',
        expectedAnswer: '7, 14, 21, 28',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '14',
      },
      {
        id: 'days_interval',
        label: 'Mereka berolahraga bersama lagi setelah ... hari',
        placeholder: 'Jumlah hari...',
        type: 'number',
        scaffoldSuffix: 'hari',
        expectedAnswer: '14',
      },
      {
        id: 'final_date',
        label: 'Tanggal berikutnya (tanggal awal + hasil KPK):',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '15 Oktober',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Periksa perhitungan dan penambahan kalender:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Apakah KPK habis dibagi kedua interval bilangan?',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: 'Ya, 14 : 2 = 7 dan 14 : 7 = 2.',
      },
      {
        id: 'check_smallest',
        label: 'Apakah ada kelipatan persekutuan positif yang lebih kecil?',
        placeholder: 'Jelaskan hasil pemeriksaanmu...',
        type: 'text',
        expectedAnswer: 'Tidak ada, 14 adalah kelipatan persekutuan terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Tambahkan hasil KPK ke tanggal awal untuk menentukan tanggal berikutnya:',
        placeholder: 'Tuliskan perhitungan penambahan tanggal...',
        type: 'text',
        expectedAnswer: '1 Oktober + 14 hari = 15 Oktober.',
      },
    ],
    didacticHints: {
      step1: ['Perhatikan interval olahraga Dika dan Rudi.'],
      step2: ['Kedua bilangan merupakan bilangan prima.'],
      step3: ['Periksa kelipatan yang pertama kali sama.'],
      step4: ['Jumlahkan tanggal awal dengan hasil KPK pada bulan yang sama.'],
    },
    internalKey: {
      kpk: 14,
      finalAnswer: '15 Oktober',
      multiples1: [2, 4, 6, 8, 10, 12, 14],
      multiples2: [7, 14, 21, 28],
    },
    explanation:
      'Kelipatan 2 = 2, 4, 6, 8, 10, 12, 14... Kelipatan 7 = 7, 14, 21... KPK dari 2 dan 7 adalah 14. Tanggal awal 1 Oktober + 14 hari = 15 Oktober.',
    practiceAdvice:
      'Ingat bahwa jika kedua bilangan adalah bilangan prima (seperti 2 dan 7), maka KPK-nya adalah perkalian kedua bilangan tersebut (2 x 7 = 14).',
  },

  {
    id: 'm3_pengembang',
    missionNumber: 3,
    context: 'olahraga',
    track: 'pengembang',
    title: 'Misi 3: Jadwal Olahraga (Pengembang)',
    story:
      'Tim futsal berlatih setiap 4 hari sekali, sedangkan tim bulu tangkis setiap 6 hari sekali. Kedua tim berlatih bersama pada tanggal 3 Oktober. Tentukan tanggal mereka berlatih bersama lagi.',
    num1: 4,
    num2: 6,
    startDate: '3 Oktober',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi fakta dan sasaran pencarian:',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Diketahui (jadwal latihan kedua tim & tanggal awal):',
        placeholder: 'Tuliskan jadwal masing-masing tim dan tanggal awal...',
        type: 'textarea',
        expectedAnswer: 'Tim futsal berlatih setiap 4 hari, tim bulu tangkis setiap 6 hari. Berlatih bersama tanggal 3 Oktober.',
      },
      {
        id: 'question_asked',
        label: 'Ditanyakan:',
        placeholder: 'Tuliskan apa yang ditanyakan...',
        type: 'text',
        expectedAnswer: 'Tanggal kedua tim berlatih bersama lagi.',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Tuliskan kelipatan 4 dan 6, kemudian tentukan KPK-nya:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kerja:',
        placeholder: 'Jelaskan langkah penyelesaian...',
        type: 'textarea',
        expectedAnswer: 'Menuliskan kelipatan 4 dan 6, mencari KPK, lalu menjumlahkan ke tanggal 3 Oktober.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Hitung kelipatan dan tentukan tanggal bersama berikutnya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 4:',
        placeholder: 'Tuliskan kelipatan 4...',
        type: 'text',
        expectedAnswer: '4, 8, 12, 16, 20, 24',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 6:',
        placeholder: 'Tuliskan kelipatan 6...',
        type: 'text',
        expectedAnswer: '6, 12, 18, 24, 30',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '12',
      },
      {
        id: 'final_date',
        label: 'Kedua tim akan berlatih bersama lagi pada tanggal ...',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '15 Oktober',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Validasi perhitungan dan verifikasi kalender Oktober:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Periksa apakah KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '12 : 4 = 3 dan 12 : 6 = 2.',
      },
      {
        id: 'check_smallest',
        label: 'Pastikan tidak ada kelipatan persekutuan positif yang lebih kecil:',
        placeholder: 'Penjelasan pemeriksaanmu...',
        type: 'text',
        expectedAnswer: '12 adalah kelipatan persekutuan terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Cocokkan tanggal latihan bersama berikutnya dengan kalender:',
        placeholder: 'Tuliskan perhitungan penambahan tanggal kalender...',
        type: 'text',
        expectedAnswer: '3 Oktober + 12 hari = 15 Oktober.',
      },
    ],
    didacticHints: {
      step1: ['Interval: kedua tim memiliki jadwal berbeda.'],
      step2: ['Tuliskan kelipatan kedua bilangan untuk membandingkannya.'],
      step3: ['Tambahkan hasil KPK ke tanggal awal kegiatan.'],
      step4: ['Periksa ketelitian penjumlahan tanggal.'],
    },
    internalKey: {
      kpk: 12,
      finalAnswer: '15 Oktober',
      multiples1: [4, 8, 12, 16, 20, 24],
      multiples2: [6, 12, 18, 24, 30],
    },
    explanation:
      'KPK dari 4 dan 6 adalah 12. Tanggal awal latihan bersama adalah 3 Oktober. 3 Oktober + 12 hari = 15 Oktober.',
    practiceAdvice:
      'Selalu teliti menambahkan tanggal awal dengan hasil KPK.',
  },

  {
    id: 'm3_inovator',
    missionNumber: 3,
    context: 'olahraga',
    track: 'inovator',
    title: 'Misi 3: Jadwal Olahraga (Inovator)',
    story:
      'Klub olahraga mengadakan latihan renang setiap 9 hari sekali dan latihan senam setiap 15 hari sekali. Kedua kegiatan berlangsung bersama pada tanggal 3 November. Tentukan tanggal kedua kegiatan berlangsung bersama lagi dan jelaskan strategi yang digunakan.',
    num1: 9,
    num2: 15,
    startDate: '3 November',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Baca cerita, lalu isi tiga hal ini: yang diketahui, yang ditanyakan, dan tanggal awal.',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Apa yang diketahui?',
        placeholder: 'Contoh: Renang setiap 9 hari dan senam setiap 15 hari.',
        type: 'textarea',
        expectedAnswer: 'Renang setiap 9 hari dan senam setiap 15 hari.',
      },
      {
        id: 'question_asked',
        label: 'Apa yang ditanyakan?',
        placeholder: 'Tuliskan hal yang harus dicari...',
        type: 'text',
        expectedAnswer: 'Tanggal kedua kegiatan berlangsung bersama lagi dan strategi yang digunakan.',
      },
      {
        id: 'start_date',
        label: 'Tanggal/waktu awal:',
        placeholder: 'Tuliskan tanggal mereka mulai berlatih bersama...',
        type: 'text',
        expectedAnswer: '3 November',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Pilih strategi yang efektif untuk menentukan KPK dari kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Strategi pencarian KPK dan penanganan pergantian bulan kalender:',
        placeholder: 'Jelaskan metode pencarian KPK dan cara menghitung penambahan hari melintasi bulan...',
        type: 'textarea',
        expectedAnswer: 'Mencari KPK(9, 15) dengan faktorisasi prima, lalu menghitung penambahan hari dari 3 November melewati 30 November ke bulan Desember.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Laksanakan perhitungan matematis dan kalender:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan atau faktorisasi bilangan pertama:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '9, 18, 27, 36, 45 (3^2)',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan atau faktorisasi bilangan kedua:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '15, 30, 45 (3 x 5)',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '45',
      },
      {
        id: 'final_date',
        label: 'Kedua kegiatan berlangsung bersama lagi pada tanggal ...',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '18 Desember',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Buktikan KPK dan verifikasi pergantian bulan kalender:',
    step4Fields: [
      {
        id: 'proof_divisibility',
        label: 'Buktikan bahwa hasil KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '45 : 9 = 5 dan 45 : 15 = 3.',
      },
      {
        id: 'proof_minimality',
        label: 'Jelaskan mengapa hasil tersebut merupakan kelipatan persekutuan terkecil:',
        placeholder: 'Tuliskan penjelasan logis...',
        type: 'textarea',
        expectedAnswer: 'Kelipatan 15 sebelum 45 adalah 15 dan 30, keduanya tidak habis dibagi 9. Maka 45 adalah kelipatan persekutuan terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Periksa tanggal kegiatan berikutnya berdasarkan tanggal awal dan jumlah hari per bulan:',
        placeholder: 'Perhatikan jumlah hari pada bulan awal saat melompat ke bulan berikutnya...',
        type: 'textarea',
        expectedAnswer: 'Bulan November memiliki 30 hari. Dari 3 November sampai akhir November ada 27 hari. Sisa hari = 45 - 27 = 18 hari, sehingga jatuh pada 18 Desember.',
      },
    ],
    didacticHints: {
      step1: ['Perhatikan angka kedua interval serta tanggal awal kegiatan.'],
      step2: ['Ingat: Cermati berapa hari yang dimiliki bulan awal tersebut!'],
      step3: ['Gunakan faktorisasi atau deretan kelipatan terkecil yang sama.'],
      step4: ['Hitung sisa hari di bulan pertama sebelum menghitung tanggal di bulan berikutnya.'],
    },
    internalKey: {
      kpk: 45,
      finalAnswer: '18 Desember',
      multiples1: [9, 18, 27, 36, 45],
      multiples2: [15, 30, 45],
    },
    explanation:
      '9 = 3², 15 = 3 × 5. KPK = 3² × 5 = 45 hari. Tanggal awal 3 November. November memiliki 30 hari, sehingga tersisa 27 hari di bulan November (30 - 3 = 27). Sisa hari untuk bulan berikutnya = 45 - 27 = 18 hari. Maka kegiatan berlangsung bersama lagi pada tanggal 18 Desember.',
    practiceAdvice:
      'Saat menjumlahkan hari yang melampaui jumlah hari dalam suatu bulan, kurangi dengan sisa hari bulan tersebut untuk menemukan tanggal di bulan berikutnya.',
  },

  // ==========================================
  // MISI 4 — AGENDA SEKOLAH
  // ==========================================
  {
    id: 'm4_penjelajah',
    missionNumber: 4,
    context: 'agenda',
    track: 'penjelajah',
    title: 'Misi 4: Agenda Sekolah (Penjelajah)',
    story:
      'Sekolah mengadakan kegiatan membaca bersama setiap 3 hari sekali dan senam pagi setiap 5 hari sekali. Kedua kegiatan dilaksanakan bersama pada tanggal 1 November. Pada tanggal berapa kedua kegiatan berlangsung bersama lagi?',
    num1: 3,
    num2: 5,
    startDate: '1 November',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi rincian agenda sekolah:',
    step1Fields: [
      {
        id: 'reading_interval',
        label: 'Membaca bersama dilaksanakan setiap ... hari',
        placeholder: 'Interval membaca...',
        type: 'number',
        scaffoldSuffix: 'hari',
        expectedAnswer: '3',
      },
      {
        id: 'gym_interval',
        label: 'Senam pagi dilaksanakan setiap ... hari',
        placeholder: 'Interval senam...',
        type: 'number',
        scaffoldSuffix: 'hari',
        expectedAnswer: '5',
      },
      {
        id: 'start_date',
        label: 'Tanggal awal kegiatan bersama adalah ...',
        placeholder: 'Tanggal awal...',
        type: 'text',
        expectedAnswer: '1 November',
      },
      {
        id: 'question_asked',
        label: 'Yang ditanyakan adalah ...',
        placeholder: 'Hal yang ingin dicari...',
        type: 'text',
        expectedAnswer: 'Pada tanggal berapa kedua kegiatan berlangsung bersama lagi',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Carilah KPK dari 3 dan 5 dengan menuliskan kelipatan kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kerja:',
        placeholder: 'Tuliskan rencana kerja...',
        type: 'textarea',
        expectedAnswer: 'Mencari kelipatan 3 dan 5, mencari KPK, lalu menambahkan ke 1 November.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Cari kelipatan 3 dan 5, tentukan KPK dan tanggal kegiatan berikutnya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 3:',
        placeholder: 'Tuliskan kelipatan 3...',
        type: 'text',
        expectedAnswer: '3, 6, 9, 12, 15, 18',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 5:',
        placeholder: 'Tuliskan kelipatan 5...',
        type: 'text',
        expectedAnswer: '5, 10, 15, 20, 25',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '15',
      },
      {
        id: 'days_interval',
        label: 'Kedua kegiatan berlangsung bersama lagi setelah ... hari',
        placeholder: 'Jumlah hari...',
        type: 'number',
        scaffoldSuffix: 'hari',
        expectedAnswer: '15',
      },
      {
        id: 'final_date',
        label: 'Tanggal berikutnya (tanggal awal + hasil KPK):',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '16 November',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Pastikan hasil perhitungan sudah diuji dengan teliti:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Apakah KPK habis dibagi kedua interval bilangan?',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: 'Ya, 15 : 3 = 5 dan 15 : 5 = 3.',
      },
      {
        id: 'check_smallest',
        label: 'Apakah ada kelipatan persekutuan positif yang lebih kecil?',
        placeholder: 'Jelaskan hasil pemeriksaanmu...',
        type: 'text',
        expectedAnswer: 'Tidak ada, 15 adalah kelipatan persekutuan terkecil.',
      },
      {
        id: 'check_calendar',
        label: 'Tambahkan hasil KPK ke tanggal awal untuk menentukan tanggal berikutnya:',
        placeholder: 'Tuliskan penambahan tanggal...',
        type: 'text',
        expectedAnswer: '1 November + 15 hari = 16 November.',
      },
    ],
    didacticHints: {
      step1: ['Catat interval hari untuk kedua agenda sekolah.'],
      step2: ['Kedua bilangan adalah bilangan prima.'],
      step3: ['Periksa kelipatan persekutuan terkecil yang muncul pada kedua daftar.'],
      step4: ['Jumlahkan tanggal awal dengan hasil KPK.'],
    },
    internalKey: {
      kpk: 15,
      finalAnswer: '16 November',
      multiples1: [3, 6, 9, 12, 15, 18],
      multiples2: [5, 10, 15, 20, 25],
    },
    explanation:
      'Kelipatan 3 = 3, 6, 9, 12, 15... Kelipatan 5 = 5, 10, 15... KPK dari 3 dan 5 adalah 15. Tanggal awal 1 November + 15 hari = 16 November.',
    practiceAdvice:
      'Latih mengenali bilangan prima untuk mempercepat penemuan kelipatan persekutuan terkecil.',
  },

  {
    id: 'm4_pengembang',
    missionNumber: 4,
    context: 'agenda',
    track: 'pengembang',
    title: 'Misi 4: Agenda Sekolah (Pengembang)',
    story:
      'Sekolah mengadakan kegiatan literasi setiap 4 hari sekali dan pemeriksaan kebersihan kelas setiap 5 hari sekali. Kedua kegiatan berlangsung bersama pada tanggal 2 November. Tentukan tanggal keduanya berlangsung bersama lagi.',
    num1: 4,
    num2: 5,
    startDate: '2 November',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Identifikasi fakta dan sasaran penyelesaian:',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Diketahui (interval kedua agenda & tanggal awal):',
        placeholder: 'Tuliskan data kedua interval dan tanggal awal...',
        type: 'textarea',
        expectedAnswer: 'Kegiatan literasi setiap 4 hari sekali, pemeriksaan kebersihan setiap 5 hari sekali. Bersama tanggal 2 November.',
      },
      {
        id: 'question_asked',
        label: 'Ditanyakan:',
        placeholder: 'Tuliskan sasaran yang dicari...',
        type: 'text',
        expectedAnswer: 'Tanggal kedua kegiatan berlangsung bersama lagi.',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Tuliskan kelipatan 4 dan 5, kemudian tentukan kelipatan persekutuan terkecilnya:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Rencana kerja:',
        placeholder: 'Jelaskan rencana kerja penyelesaian...',
        type: 'textarea',
        expectedAnswer: 'Menuliskan kelipatan 4 dan 5, mencari KPK, lalu menambahkan ke tanggal 2 November.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Cari kelipatan dan hitung tanggal bersama berikutnya:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Kelipatan 4:',
        placeholder: 'Tuliskan deretan kelipatan 4...',
        type: 'text',
        expectedAnswer: '4, 8, 12, 16, 20, 24',
      },
      {
        id: 'multiples_num2',
        label: 'Kelipatan 5:',
        placeholder: 'Tuliskan deretan kelipatan 5...',
        type: 'text',
        expectedAnswer: '5, 10, 15, 20, 25',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '20',
      },
      {
        id: 'final_date',
        label: 'Kedua kegiatan berlangsung bersama lagi pada tanggal ...',
        placeholder: 'Tuliskan tanggal dan bulan di sini...',
        type: 'text',
        expectedAnswer: '22 November',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Evaluasi hasil dan periksa kalender:',
    step4Fields: [
      {
        id: 'check_divisible',
        label: 'Periksa apakah KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '20 : 4 = 5 dan 20 : 5 = 4.',
      },
      {
        id: 'check_smallest',
        label: 'Pastikan tidak ada kelipatan persekutuan positif yang lebih kecil:',
        placeholder: 'Penjelasan pemeriksaanmu...',
        type: 'text',
        expectedAnswer: '20 adalah kelipatan persekutuan terkecil dari 4 dan 5.',
      },
      {
        id: 'check_calendar',
        label: 'Periksa tanggal kegiatan bersama menggunakan kalender:',
        placeholder: 'Tuliskan penambahan tanggal...',
        type: 'text',
        expectedAnswer: '2 November + 20 hari = 22 November.',
      },
    ],
    didacticHints: {
      step1: ['Interval: catat kedua angka interval kegiatan.'],
      step2: ['Kedua bilangan tidak memiliki faktor persekutuan selain 1.'],
      step3: ['Tambahkan hasil KPK ke tanggal awal kegiatan.'],
      step4: ['Periksa ketelitian penjumlahan kalender.'],
    },
    internalKey: {
      kpk: 20,
      finalAnswer: '22 November',
      multiples1: [4, 8, 12, 16, 20, 24],
      multiples2: [5, 10, 15, 20, 25],
    },
    explanation:
      'Kelipatan 4 = 4, 8, 12, 16, 20... Kelipatan 5 = 5, 10, 15, 20... KPK dari 4 dan 5 adalah 20. Tanggal awal 2 November + 20 hari = 22 November.',
    practiceAdvice:
      'Jika dua bilangan tidak memiliki faktor persekutuan selain 1 (relatif prima), KPK-nya adalah perkalian kedua bilangan tersebut.',
  },

  {
    id: 'm4_inovator',
    missionNumber: 4,
    context: 'agenda',
    track: 'inovator',
    title: 'Misi 4: Agenda Sekolah (Inovator)',
    story:
      'Sekolah mengadakan kegiatan literasi setiap 8 hari sekali dan senam bersama setiap 15 hari sekali. Kedua kegiatan berlangsung bersama pada tanggal 1 Desember. Tentukan tanggal kedua kegiatan berlangsung bersama lagi dan jelaskan mengapa KPK tepat digunakan. (Gunakan asumsi standar Februari memiliki 28 hari).',
    num1: 8,
    num2: 15,
    startDate: '1 Desember',
    unit: 'hari',
    step1Title: 'Tahap 1 — Memahami Masalah',
    step1Prompt: 'Baca cerita, lalu isi tiga hal ini: yang diketahui, yang ditanyakan, dan tanggal awal.',
    step1Fields: [
      {
        id: 'known_info',
        label: 'Apa yang diketahui?',
        placeholder: 'Tuliskan jadwal literasi dan senam, termasuk aturan jumlah hari di Februari.',
        type: 'textarea',
        expectedAnswer: 'Literasi setiap 8 hari dan senam setiap 15 hari. Februari dianggap memiliki 28 hari.',
      },
      {
        id: 'question_asked',
        label: 'Apa yang ditanyakan?',
        placeholder: 'Tuliskan hal yang harus dicari...',
        type: 'text',
        expectedAnswer: 'Tanggal kedua kegiatan berlangsung bersama lagi dan alasan KPK digunakan.',
      },
      {
        id: 'start_date',
        label: 'Tanggal/waktu awal:',
        placeholder: 'Tuliskan tanggal kedua kegiatan mulai bersama...',
        type: 'text',
        expectedAnswer: '1 Desember',
      },
    ],
    step2Title: 'Tahap 2 — Menyusun Rencana Penyelesaian',
    step2Prompt: 'Pilih strategi yang efektif untuk menentukan KPK dari kedua bilangan:',
    step2Fields: [
      {
        id: 'strategy_plan',
        label: 'Strategi pencarian KPK dan pemodelan kalender multi-bulan:',
        placeholder: 'Jelaskan cara mencari KPK dan penelusuran tanggal melintasi pergantian tahun...',
        type: 'textarea',
        expectedAnswer: 'Mencari KPK(8, 15) = 120. Menghitung penambahan 120 hari dari 1 Desember melintasi Desember, Januari, Februari (28 hari), hingga Maret.',
      },
    ],
    step3Title: 'Tahap 3 — Melaksanakan Rencana',
    step3Prompt: 'Hitung KPK dan penelusuran tanggal kalender:',
    step3Fields: [
      {
        id: 'multiples_num1',
        label: 'Faktorisasi atau kelipatan bilangan pertama:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '8 = 2^3',
      },
      {
        id: 'multiples_num2',
        label: 'Faktorisasi atau kelipatan bilangan kedua:',
        placeholder: 'Tuliskan proses penjabaran...',
        type: 'text',
        expectedAnswer: '15 = 3 x 5',
      },
      {
        id: 'lcm_value',
        label: 'KPK dari kedua bilangan adalah ...',
        placeholder: 'Nilai KPK...',
        type: 'number',
        expectedAnswer: '120',
      },
      {
        id: 'final_date',
        label: 'Kedua kegiatan berlangsung bersama lagi pada tanggal ...',
        placeholder: 'Format: tanggal, bulan, dan tahun berikutnya jika ada',
        type: 'text',
        expectedAnswer: '31 Maret tahun berikutnya',
      },
    ],
    step4Title: 'Tahap 4 — Memeriksa Kembali',
    step4Prompt: 'Buktikan KPK dan verifikasi kalender multi-bulan secara terperinci:',
    step4Fields: [
      {
        id: 'proof_divisibility',
        label: 'Buktikan bahwa hasil KPK habis dibagi kedua bilangan:',
        placeholder: 'Tuliskan pembuktian pembagian...',
        type: 'text',
        expectedAnswer: '120 : 8 = 15 dan 120 : 15 = 8. Keduanya menghasilkan bilangan bulat.',
      },
      {
        id: 'proof_minimality',
        label: 'Jelaskan mengapa hasil tersebut merupakan kelipatan persekutuan terkecil:',
        placeholder: 'Tuliskan alasan minimalitasnya...',
        type: 'textarea',
        expectedAnswer: 'Karena 8 dan 15 tidak memiliki faktor prima persekutuan (FPB = 1), maka KPK adalah hasil kali keduanya yaitu 8 x 15 = 120.',
      },
      {
        id: 'check_calendar',
        label: 'Periksa tanggal kegiatan bersama berikutnya berdasarkan tanggal awal dan jumlah hari per bulan:',
        placeholder: 'Tuliskan perhitungan akumulasi hari per bulan hingga mencapai hari KPK...',
        type: 'textarea',
        expectedAnswer: 'Sisa hari Desember: 31 - 1 = 30 hari. Januari: 31 hari. Februari: 28 hari. Jumlah hari sampai akhir Februari = 30 + 31 + 28 = 89 hari. Sisa hari = 120 - 89 = 31 hari di bulan Maret. Maka jatuh tepat pada tanggal 31 Maret tahun berikutnya.',
      },
    ],
    didacticHints: {
      step1: ['Catat kedua interval dan tanggal awal kegiatan.'],
      step2: ['Kedua bilangan tidak memiliki faktor prima sekutu (relatif prima).'],
      step3: ['Hitung perkalian faktor prima pangkat tertinggi.'],
      step4: ['Hitung sisa hari dari bulan Desember, lanjutkan ke Januari, Februari (28 hari), dan sisanya di bulan berikutnya.'],
    },
    internalKey: {
      kpk: 120,
      finalAnswer: '31 Maret tahun berikutnya',
      multiples1: [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120],
      multiples2: [15, 30, 45, 60, 75, 90, 105, 120],
    },
    explanation:
      '8 = 2³, 15 = 3 × 5. KPK = 2³ × 3 × 5 = 120. Menghitung 120 hari dari 1 Desember: Sisa Desember = 30 hari; Januari = 31 hari; Februari (28 hari) = 28 hari; total 30 + 31 + 28 = 89 hari. Sisa 120 - 89 = 31 hari yang jatuh tepat pada 31 Maret tahun berikutnya.',
    practiceAdvice:
      'Buat tabel jumlah hari per bulan (31, 28, 31, 30...) saat menghitung penambahan hari yang melintasi beberapa bulan.',
  },
];

const INNOVATOR_MISSION_IDS = ['m1_inovator', 'm2_inovator', 'm3_inovator', 'm4_inovator'];

/**
 * Existing browsers and the shared database may still hold the older one-field
 * analysis prompt. Upgrade only those legacy fields so teacher-edited mission
 * content outside this requested section remains untouched.
 */
export function migrateInnovatorProblemAnalysis(
  questions: MissionQuestion[]
): MissionQuestion[] {
  return questions.map((question) => {
    if (
      !INNOVATOR_MISSION_IDS.includes(question.id) ||
      question.step1Fields.length !== 1 ||
      !['problem_analysis', 'problem_variables'].includes(question.step1Fields[0].id)
    ) {
      return question;
    }

    const current = INITIAL_QUESTION_BANK.find((item) => item.id === question.id);
    return current
      ? {
          ...question,
          step1Prompt: current.step1Prompt,
          step1Fields: current.step1Fields.map((field) => ({ ...field })),
        }
      : question;
  });
}

/**
 * Keep a student's previous free-text analysis when migrating it to the new
 * three-part form; the old answer remains in the record as well.
 */
export function migrateInnovatorProblemAnswers(
  submissions: AssessmentSubmission[]
): AssessmentSubmission[] {
  const legacyFieldByQuestion: Record<string, string> = {
    m1_inovator: 'problem_analysis',
    m2_inovator: 'problem_variables',
    m3_inovator: 'problem_analysis',
    m4_inovator: 'problem_analysis',
  };

  return submissions.map((submission) => {
    let changed = false;
    const answers = { ...submission.answers };

    for (const [questionId, legacyFieldId] of Object.entries(legacyFieldByQuestion)) {
      const saved = answers[questionId];
      const oldAnalysis = saved?.step1?.[legacyFieldId];
      if (oldAnalysis?.trim() && !saved.step1.known_info?.trim()) {
        answers[questionId] = {
          ...saved,
          step1: { ...saved.step1, known_info: oldAnalysis },
        };
        changed = true;
      }
    }

    return changed ? { ...submission, answers } : submission;
  });
}
