/**
 * Logika Matematika KPK, FPB, dan Perhitungan Kalender
 * Ruang Misi KPK - Kelas V SD/MI
 */

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Hari dalam setiap bulan dengan asumsi standar Februari = 28 hari untuk kalender sekolah dasar
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Menghitung Faktor Persekutuan Terbesar (FPB) dengan Algoritma Euclidean
 */
export function calculateGCD(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 1;
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Menghitung Kelipatan Persekutuan Terkecil (KPK) dengan rumus:
 * KPK(a, b) = (a * b) / FPB(a, b)
 */
export function calculateLCM(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  return Math.round((a * b) / calculateGCD(a, b));
}

/**
 * Mendapatkan daftar n kelipatan pertama dari suatu bilangan
 */
export function getMultiples(num: number, count: number = 6): number[] {
  if (num <= 0 || count <= 0) return [];
  const result: number[] = [];
  for (let i = 1; i <= count; i++) {
    result.push(num * i);
  }
  return result;
}

/**
 * Parsing tanggal Indonesia seperti:
 * "1 Agustus", "2 Agustus", "3 September", "1 Oktober", "3 Oktober", "3 November", "1 November", "2 November", "1 Desember"
 */
export interface ParsedDate {
  day: number;
  monthIndex: number; // 0-based: 0 = Januari, ..., 11 = Desember
  yearOffset: number; // 0 untuk tahun berjalan, 1 untuk tahun berikutnya
}

export function parseIndonesianDate(dateStr: string): ParsedDate | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  const match = clean.match(/^(\d{1,2})\s+([a-zA-Z]+)(?:\s+(\d{4}))?$/i);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();

  const monthIndex = INDONESIAN_MONTHS.findIndex(
    (m) => m.toLowerCase() === monthName
  );

  if (monthIndex === -1) return null;

  return { day, monthIndex, yearOffset: 0 };
}

/**
 * Menambahkan sejumlah hari ke tanggal awal dengan penanganan pergantian bulan dan tahun.
 * Mengikuti aturan didaktis:
 * Tanggal berikutnya = tanggal awal + n hari
 * Misalnya: 1 Agustus + 6 hari = 7 Agustus
 * 3 November + 45 hari = 18 Desember (November 30 hari -> sisa 27 hari, sisa 18 hari di Desember)
 * 1 Desember + 120 hari = 31 Maret tahun berikutnya (Des: 30 hari lagi, Jan: 31, Feb: 28, Mar: 31 -> total 120 hari)
 */
export function addDaysToDate(
  startDateStr: string,
  daysToAdd: number
): { formatted: string; day: number; monthName: string; isNextYear: boolean } {
  const parsed = parseIndonesianDate(startDateStr);
  if (!parsed || daysToAdd < 0) {
    return {
      formatted: `${startDateStr} + ${daysToAdd} hari`,
      day: 0,
      monthName: '',
      isNextYear: false,
    };
  }

  let currentDay = parsed.day;
  let currentMonth = parsed.monthIndex;
  let remainingDays = daysToAdd;
  let isNextYear = false;

  while (remainingDays > 0) {
    const daysInCurrentMonth = DAYS_IN_MONTH[currentMonth];
    const daysLeftInMonth = daysInCurrentMonth - currentDay;

    if (remainingDays <= daysLeftInMonth) {
      currentDay += remainingDays;
      remainingDays = 0;
    } else {
      remainingDays -= daysLeftInMonth + 1;
      currentDay = 1;
      currentMonth++;
      if (currentMonth >= 12) {
        currentMonth = 0;
        isNextYear = true;
      }
    }
  }

  const resultMonthName = INDONESIAN_MONTHS[currentMonth];
  const formatted = isNextYear
    ? `${currentDay} ${resultMonthName} tahun berikutnya`
    : `${currentDay} ${resultMonthName}`;

  return {
    formatted,
    day: currentDay,
    monthName: resultMonthName,
    isNextYear,
  };
}

/**
 * Membersihkan teks jawaban untuk perbandingan toleran
 */
export function normalizeAnswer(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mengevaluasi apakah jawaban murid mendekati jawaban yang diharapkan
 */
export function checkSimilarity(expected: string, actual: string): boolean {
  const normExpected = normalizeAnswer(expected);
  const normActual = normalizeAnswer(actual);
  if (!normActual) return false;
  if (normExpected === normActual) return true;

  // Cek apakah angka yang dibutuhkan terkandung
  const expectedNumbers = normExpected.match(/\d+/g);
  const actualNumbers = normActual.match(/\d+/g);

  if (expectedNumbers && actualNumbers) {
    const allExpectedNumbersPresent = expectedNumbers.every((n) =>
      actualNumbers.includes(n)
    );
    if (allExpectedNumbersPresent) {
      // Jika ada teks bulan, periksa kecocokan bulan
      const expectedMonths = INDONESIAN_MONTHS.filter((m) =>
        normExpected.includes(m.toLowerCase())
      );
      if (expectedMonths.length > 0) {
        return expectedMonths.some((m) =>
          normActual.includes(m.toLowerCase())
        );
      }
      return true;
    }
  }

  return normActual.includes(normExpected) || normExpected.includes(normActual);
}
