# Ruang Misi KPK — UI V8 + Musik (konfigurasi lokal disiapkan)

Paket sumber lengkap dengan UI dan musik dipertahankan. Konfigurasi lokal sudah diisi menggunakan Google OAuth Client ID yang sebelumnya Anda berikan dan ID database D1 yang tercatat di `wrangler.toml`.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Buka CMD di folder `Ruang-Misi-KPK-Utuh-UI-V8`.
3. Jalankan `npm ci`.
4. Jalankan `npm run db:migrate:local` untuk menyiapkan database D1 lokal (tidak mengubah database produksi).
5. Jalankan `npm test`, lalu `npm run lint`, lalu `npm run build`.
6. Jalankan `npm run pages:dev`, lalu buka `http://localhost:8788`.
7. Gunakan alur **Daftar Akun** untuk mendaftarkan akun guru dengan Google. Login Google hanya berfungsi jika origin lokal sudah diizinkan pada Google Cloud OAuth Client. Tambahkan `http://localhost:8788` dan `http://localhost` ke **Authorized JavaScript origins** jika belum ada.

## Konfigurasi yang telah disiapkan

- Google OAuth Client ID: ada di `wrangler.toml` (`[vars]`) dan `.dev.vars.example`; nilainya publik.
- `TEACHER_SESSION_SECRET`: dibuat acak otomatis di `.dev.vars` oleh `npm run setup:local`; di produksi diisi sebagai Secret di Cloudflare.
- D1 binding: `DB`; nama database dan database ID tercantum di `wrangler.toml`.
- CAPTCHA/Turnstile: tidak digunakan.

## Jalan pintas Windows

Klik dua kali `CEK-DAN-JALANKAN.cmd`: memasang dependensi, menjalankan migrasi database lokal, tes, lint, build, lalu server di `http://localhost:8788`.

## Batasan penting

- `.dev.vars` hanya untuk pengembangan lokal dan masuk `.gitignore`; jangan commit atau unggah ke GitHub (`npm run check:repo` memeriksanya).
- Satu-satunya pengaturan produksi manual: Secret `TEACHER_SESSION_SECRET` di dashboard Cloudflare. Lihat `PANDUAN-GITHUB-CLOUDFLARE.txt`.
- `npm ci`, tes, lint, build, dan login Google end-to-end perlu dijalankan pada komputer Anda karena membutuhkan dependensi dan jaringan/provider Google.
- `npm run db:migrate:local` hanya menyiapkan database lokal. Jangan menjalankan migrasi remote atau deploy sebelum sengaja memverifikasi target produksi.
- Jika Client ID lama sudah diganti/dicabut di Google Cloud, ganti `GOOGLE_CLIENT_ID` di `.dev.vars` dengan Client ID aktif.
