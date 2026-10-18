#!/usr/bin/env node
// Memastikan tidak ada file sensitif yang akan terunggah ke GitHub. Jalankan sebelum push: npm run check:repo
import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let files;
try { files = run('git ls-files --cached --others --exclude-standard').split(/\r?\n/).filter(Boolean); }
catch { console.error('Folder ini belum repositori git. Jalankan: git init'); process.exit(2); }

const forbidden = [
  [/(^|\/)\.dev\.vars$/, '.dev.vars (secret lokal)'],
  [/(^|\/)\.env(\.(?!example$)[^/]+)?$/, 'file .env'],
  [/(^|\/)\.wrangler\//, 'folder .wrangler'],
  [/(^|\/)node_modules\//, 'node_modules'],
  [/(^|\/)dist\//, 'folder dist (hasil build)'],
  [/\.(pem|key|p12|pfx)$/i, 'kunci/sertifikat'],
  [/\.zip$/i, 'berkas ZIP (bisa membawa .dev.vars)'],
];
const bad = [];
for (const f of files) for (const [re, label] of forbidden) if (re.test(f)) bad.push(`${f}  <- ${label}`);

// Cari pola rahasia di isi berkas teks yang akan diunggah.
const secretPatterns = [
  [/TEACHER_SESSION_SECRET\s*=\s*["']?(?!DIISI-OTOMATIS|ganti-dengan|replace-with)[A-Za-z0-9_\-]{24,}/, 'nilai TEACHER_SESSION_SECRET asli'],
  [/TEACHER_PASSWORD\s*=\s*["'][^"']+["']/, 'TEACHER_PASSWORD berisi nilai'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/GOCSPX-[A-Za-z0-9_\-]{20,}/, 'Google client secret'],
];
const { readFileSync, statSync } = await import('node:fs');
for (const f of files) {
  try {
    if (statSync(f).size > 1_000_000 || /\.(jpg|png|mp3|wav|lock|tgz)$/i.test(f) || f === 'package-lock.json') continue;
    const text = readFileSync(f, 'utf8');
    for (const [re, label] of secretPatterns) if (re.test(text)) bad.push(`${f}  <- ${label}`);
  } catch { /* berkas dihapus/tak terbaca */ }
}
if (bad.length) {
  console.error('BERBAHAYA: berkas berikut tidak boleh diunggah ke GitHub:\n' + bad.map((b) => '  - ' + b).join('\n'));
  process.exit(1);
}
console.log(`AMAN: ${files.length} berkas siap diunggah, tidak ada file atau pola rahasia yang terdeteksi.`);
