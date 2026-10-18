# Audit dan Revisi Terpadu — Ruang Misi KPK

## Dasar revisi
- Berangkat dari arsip revisi proyek yang sudah ada, bukan membuat aplikasi baru.
- Mempertahankan mesin empat kasus, empat tahap Polya, autosave, timer asesmen 25 menit, penilaian manual, publikasi hasil, dashboard, dan ekspor Excel.
- Tidak menjalankan migrasi atau deployment database produksi secara otomatis.
- Installer menyimpan backup kode lokal dan tidak menghapus `.git`, `node_modules`, `dist`, `.dev.vars`, `.env`, atau `.env.local`.

## Perubahan pada paket ini
1. Login akun guru terdaftar memverifikasi hash PBKDF2-SHA-256 dengan salt acak. Login bootstrap berbasis environment tetap mendukung `TEACHER_PASSWORD_HASH` dan menyediakan kompatibilitas `TEACHER_PASSWORD` lama; gunakan hash untuk produksi.
2. Login bootstrap menolak akses jika konfigurasi kredensial atau session secret tidak tersedia; login akun terdaftar memakai database dan session secret.
3. Menghapus ketergantungan Cloudflare Turnstile/CAPTCHA dari UI dan endpoint login; autentikasi tetap memakai validasi kata sandi dan sesi bertanda tangan.
4. Menambahkan skrip pembuat hash interaktif tanpa menampilkan kata sandi yang diketik.
5. Menambahkan header keamanan Cloudflare Pages pada `public/_headers`.
6. Memastikan endpoint pembuatan sesi kelompok memakai handler backend yang memvalidasi kode kelas aktif, membatasi jumlah kelompok, dan menyimpan token ke database.
7. Menambahkan CTA dari latihan mandiri tanpa timer ke identitas tim, lalu ke pintu misi dan countdown asesmen.
8. Memperbarui panel kemajuan empat tahap Polya dan detail visual petualangan dengan animasi ringan serta palet warna yang sudah dipakai aplikasi.
9. Menambahkan skrip pemeriksaan konfigurasi keamanan.
10. Memperbaiki implementasi `loginTeacherWithGoogle` yang dipanggil UI tetapi belum tersedia di context; sesi hasil login Google kini disimpan konsisten.
11. Memperbaiki pemilihan endpoint login agar akun guru terdaftar tetap dapat login ketika akun bootstrap melalui environment juga dikonfigurasi.
12. Menyesuaikan `Cross-Origin-Opener-Policy` untuk mendukung komunikasi popup Google Identity Services.

## Pemeriksaan yang dilakukan di lingkungan ini
- Pemeriksaan konfigurasi keamanan (`node scripts/check-security-config.mjs`): lulus.
- Pengujian backend melalui Node native TypeScript runner: 13/13 lulus, termasuk login tanpa CAPTCHA, token sesi, kepemilikan data, kelas, dan pembuatan token kelompok.
- Pengujian logika aplikasi melalui Node native TypeScript runner: 4/4 lulus setelah penyesuaian ekstensi impor khusus untuk runner sementara.
- `npm ci` tidak selesai di lingkungan ini karena akses dependensi jaringan/CDN tidak tersedia; karena itu perintah resmi `npm test`, `npm run lint`, dan `npm run build` belum dapat dijalankan penuh. Jalankan ketiganya di komputer lokal sebelum deploy.

## Fitur yang tetap memerlukan konfigurasi/implementasi tambahan
- `GOOGLE_CLIENT_ID` dan `TEACHER_SESSION_SECRET` harus dikonfigurasi sesuai lingkungan hosting.
- Kata sandi baru harus di-hash lalu disimpan sebagai Secret `TEACHER_PASSWORD_HASH`; Secret lama `TEACHER_PASSWORD` perlu dihapus setelah verifikasi login.
- Pendaftaran akun guru mengikat username ke kredensial Google yang tervalidasi; login Google hanya mengizinkan akun yang sudah terdaftar. Pastikan `GOOGLE_CLIENT_ID`, binding D1, dan migrasi `0001`–`0003` sudah sesuai. Email OTP tidak diimplementasikan.
- Rate limiting login tingkat edge perlu dikonfigurasi melalui Cloudflare WAF/Rate Limiting bila tersedia pada paket/akun.
- Uji end-to-end di D1 produksi, perangkat murid, dan dashboard guru belum dilakukan; deployment tidak dijalankan.

## Revisi lanjutan: autentikasi Google (18 Okt 2026)
Lihat `STATUS-PAKET.txt` untuk daftar lengkap. Ringkasnya: pesan kesalahan Google yang spesifik, pembersihan Client ID,
username admin dicadangkan, login Google tidak lagi 500 saat migrasi belum ada, diagnosis konfigurasi di UI,
sesi kedaluwarsa otomatis keluar, migrasi D1 lokal masuk ke skrip jalankan, dan 11 tes baru (total 28 lulus).
Catatan: tokeninfo Google dipakai untuk memeriksa ID token; cukup untuk beban kelas, dan bisa diganti verifikasi JWKS lokal bila trafik besar.
