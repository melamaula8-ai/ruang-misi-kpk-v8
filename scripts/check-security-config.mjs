import { readFileSync, existsSync } from 'node:fs';
const required = ['server/core.ts','server/teacher-accounts.ts','scripts/hash-password.mjs','public/_headers','migrations/0002_classes.sql','migrations/0003_teacher_accounts_ownership.sql'];
const missing = required.filter(file => !existsSync(file));
if (missing.length) { console.error('Berkas penting hilang:', missing.join(', ')); process.exit(1); }
const core = readFileSync('server/core.ts','utf8');
const accounts = readFileSync('server/teacher-accounts.ts','utf8');
const headers = readFileSync('public/_headers','utf8');
const checks = [
  ['PBKDF2 password verification', core.includes('PBKDF2') && core.includes('TEACHER_PASSWORD_HASH')],
  ['Signed expiring teacher sessions', core.includes('TEACHER_SESSION_SECRET') && core.includes('SESSION_TTL_MS') && core.includes('crypto.subtle.sign')],
  ['Google credential audience and email verification', accounts.includes('data.aud !== clientId') && accounts.includes('email_verified')],
  ['Turnstile/CAPTCHA dependency removed', !core.includes('siteverify') && !core.includes('TURNSTILE_SECRET_KEY')],
  ['Security headers copied into public output', headers.includes('X-Content-Type-Options: nosniff')],
];
let failed = false;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed = true; }
process.exit(failed ? 1 : 0);
