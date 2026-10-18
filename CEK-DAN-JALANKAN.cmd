@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo RUANG MISI KPK - CEK DAN JALANKAN LOKAL
echo ================================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Pasang Node.js LTS lalu ulangi.
  pause
  exit /b 1
)
if not exist node_modules\ (
  echo [1/5] Memasang dependensi...
  call npm install
  if errorlevel 1 goto gagal
) else (
  echo [1/5] Dependensi sudah terpasang.
)
echo [2/5] Menyiapkan database lokal (migrasi D1, aman diulang)...
call npm run db:migrate:local < nul
if errorlevel 1 goto gagal
echo [3/5] Menjalankan tes...
call npm test
if errorlevel 1 goto gagal
echo [4/5] Memeriksa TypeScript...
call npm run lint
if errorlevel 1 goto gagal
echo [5/5] Membuat build dan menjalankan server lokal...
echo.
echo BUKA: http://localhost:8788   (gunakan "localhost", bukan 127.0.0.1)
echo.
call npm run pages:dev
if errorlevel 1 goto gagal
exit /b 0
:gagal
echo.
echo Pemeriksaan gagal. Jangan deploy dahulu. Simpan teks error untuk diperiksa.
pause
exit /b 1
