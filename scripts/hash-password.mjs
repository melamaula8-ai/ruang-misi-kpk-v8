#!/usr/bin/env node
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { stdin, stdout, stderr } from 'node:process';

const iterations = 210000;
if (!stdin.isTTY || !stdin.setRawMode) {
  stderr.write('Jalankan langsung di terminal interaktif; input kata sandi tidak boleh diteruskan melalui argumen atau pipe.\n');
  process.exit(2);
}
stdout.write('Kata sandi baru (minimal 12 karakter; tidak akan ditampilkan): ');
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
let password = '';
const cleanup = () => { try { stdin.setRawMode(false); } catch {} stdin.pause(); };
stdin.on('data', (key) => {
  if (key === '\u0003') { cleanup(); stdout.write('\nDibatalkan.\n'); process.exit(130); }
  if (key === '\r' || key === '\n') {
    cleanup();
    if (password.length < 12) { stdout.write('\nKata sandi minimal 12 karakter.\n'); process.exit(1); }
    const salt = randomBytes(16);
    const digest = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    password = '';
    stdout.write('\nHash kata sandi (simpan sebagai Secret TEACHER_PASSWORD_HASH):\n');
    stdout.write(`pbkdf2-sha256$${iterations}$${salt.toString('base64url')}$${digest.toString('base64url')}\n`);
    process.exit(0);
  }
  if (key === '\u007f' || key === '\b') { password = password.slice(0, -1); return; }
  if (key.length === 1 && key >= ' ') password += key;
});
