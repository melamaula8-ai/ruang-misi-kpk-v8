@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo RUANG MISI KPK - SIAPKAN UNGGAHAN KE GITHUB
echo ================================================
where git >nul 2>nul
if errorlevel 1 (
  echo Git belum terpasang. Pasang dari https://git-scm.com lalu ulangi.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Pasang Node.js LTS lalu ulangi.
  pause
  exit /b 1
)
if not exist .git\ (
  echo [1/3] Membuat repositori git...
  git init -b main
  if errorlevel 1 goto gagal
) else (
  echo [1/3] Repositori git sudah ada.
)
echo [2/3] Menambahkan berkas (file rahasia otomatis dilewati oleh .gitignore)...
git add .
if errorlevel 1 goto gagal
echo [3/3] Memeriksa file sensitif...
call npm run check:repo
if errorlevel 1 goto gagal
echo.
echo ================================================
echo AMAN. Langkah berikutnya (ganti URL dengan repo GitHub Anda):
echo   git commit -m "Ruang Misi KPK"
echo   git remote add origin https://github.com/NAMA-ANDA/NAMA-REPO.git
echo   git push -u origin main
echo ================================================
pause
exit /b 0
:gagal
echo.
echo BERHENTI. Jangan push sebelum masalah di atas beres.
pause
exit /b 1
