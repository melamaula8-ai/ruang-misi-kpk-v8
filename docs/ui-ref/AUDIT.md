# Audit UI Beranda Misi

## Kondisi sebelum revisi

- Aplikasi memakai React 19 dan TypeScript, dibangun dengan Vite dan Tailwind CSS, lalu disajikan oleh Cloudflare Pages. `App.tsx` memilih tampilan berdasarkan state `currentView`, bukan router eksternal.
- Beranda umum ada di `HomeView.tsx`; peta empat misi siswa ada di `MissionsHubView.tsx` pada view `misi`.
- Jawaban ditulis ke `AssessmentContext` melalui `updateMissionAnswer`, disimpan di state/local storage, lalu disinkronkan ke API Cloudflare. Pengiriman akhir dilakukan oleh `submitAssessment` setelah seluruh kasus dan refleksi wajib lengkap; server menerima submission melalui `/api/sync`.
- Status kasus sebelumnya dihitung dari jumlah kolom jawaban yang terisi. `MissionDetailView` juga memicu perayaan segera setelah jawaban melewati ambang tersebut, sebelum pengiriman akhir. Peta memiliki perayaan terpisah saat semua kasus tampak lengkap; penanda perayaan itu hanya state komponen sehingga dapat muncul lagi setelah reload.
- Belum ada pratinjau jawaban siswa sebelum pengiriman. Ada pratinjau draf khusus dashboard guru, tetapi itu bukan alur pratinjau jawaban siswa.
- Identitas saat ini menggunakan nama Ruang Misi KPK, favicon `/app_logo.jpg`, palet cokelat/oranye/hijau, serta Nunito Sans dan Plus Jakarta Sans. Ilustrasi empat kasus dibuat oleh komponen SVG di `Illustrations.tsx`.

## Asumsi dan batas perubahan

- “Beranda misi” berarti peta siswa yang saat ini tampil pada view `misi`, bukan beranda umum atau halaman guru.
- Aset PNG dari paket dipakai tanpa mengubah pikselnya. Kemajuan peta tetap dihitung dari jawaban yang tersimpan dan ambang penyelesaian yang sudah dipakai asesmen.
- Pratinjau ditempatkan sebelum tindakan kirim asesmen yang sudah ada. Tombol edit kembali ke kasus terkait, dan setelah selesai mengedit siswa kembali ke pratinjau. Aturan pengiriman, penilaian, timer, musik, backend, dan skema database tidak diubah.
- Perayaan hanya dijadwalkan setelah respons pengiriman sukses; penanda sesi dikonsumsi sekali oleh peta agar reload tidak memutar ulang.
- Repo ditemukan di branch `main` dengan sejumlah perubahan lokal yang sudah ada. Metadata `.git` tidak termasuk area tulis yang diizinkan, sehingga perubahan ini dikerjakan tanpa membuat branch atau commit dan tanpa menimpa perubahan sebelumnya.
- Prototipe Claude Artifact tidak dapat diakses dari lingkungan kerja; ukuran, posisi, warna, state, dan animasi mengikuti JSON lokal yang disertakan.

## Referensi

- `ruang-misi-ui-spec.json` — ukuran, posisi, warna, status, dan timing.
- `prompt-codex-ruang-misi.pdf` — batas perubahan, kebutuhan pratinjau, dan aturan pemicu perayaan.
- `assets/` — aset gambar asli yang disalin apa adanya ke `public/assets/` untuk aplikasi.
