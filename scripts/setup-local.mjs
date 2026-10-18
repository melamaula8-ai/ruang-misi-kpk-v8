#!/usr/bin/env node
// Membuat .dev.vars lokal dari .dev.vars.example dengan secret sesi acak. Aman diulang: tidak menimpa file yang sudah ada.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

if (existsSync('.dev.vars')) {
  console.log('.dev.vars sudah ada; tidak diubah.');
  process.exit(0);
}
if (!existsSync('.dev.vars.example')) {
  console.error('.dev.vars.example tidak ditemukan.');
  process.exit(1);
}
const secret = randomBytes(48).toString('base64url');
const content = readFileSync('.dev.vars.example', 'utf8')
  .replace(/^# .*\r?\n/, '# Dibuat otomatis oleh npm run setup:local. Jangan commit/unggah file ini ke GitHub.\n')
  .replace('DIISI-OTOMATIS', secret);
writeFileSync('.dev.vars', content, { mode: 0o600 });
console.log('.dev.vars dibuat dengan secret sesi acak baru.');
