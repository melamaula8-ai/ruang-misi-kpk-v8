// Adaptor D1 palsu di atas SQLite sungguhan (node:sqlite) agar logika server diuji dengan SQL asli.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import type { D1Like, D1Stmt, D1Result } from '../server/core';

class Stmt implements D1Stmt {
  private params: unknown[] = [];
  constructor(private db: DatabaseSync, private sql: string) {}
  bind(...values: unknown[]) { this.params = values; return this; }
  private args(): unknown[] | Record<string, unknown> {
    // Node 22's node:sqlite treats numbered placeholders (?1) as named parameters.
    // Map them explicitly so the test adapter behaves like D1 across supported Node versions.
    if (/\?\d+/.test(this.sql)) return Object.fromEntries(this.params.map((value, index) => [`?${index + 1}`, value]));
    return this.params;
  }
  async all<T = any>() { const args = this.args(); return { results: (Array.isArray(args) ? this.db.prepare(this.sql).all(...args as any[]) : this.db.prepare(this.sql).all(args as any)) as T[] }; }
  async first<T = any>() { const args = this.args(); return ((Array.isArray(args) ? this.db.prepare(this.sql).get(...args as any[]) : this.db.prepare(this.sql).get(args as any)) as T) ?? null; }
  async run(): Promise<D1Result> {
    const args = this.args();
    const r = Array.isArray(args) ? this.db.prepare(this.sql).run(...args as any[]) : this.db.prepare(this.sql).run(args as any);
    return { meta: { changes: Number(r.changes) } };
  }
}
export function createFakeD1(): D1Like & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
  raw.exec(readFileSync(new URL('../migrations/0002_classes.sql', import.meta.url), 'utf8'));
  raw.exec(readFileSync(new URL('../migrations/0003_teacher_accounts_ownership.sql', import.meta.url), 'utf8'));
  raw.exec(readFileSync(new URL('../migrations/0004_exam_sessions.sql', import.meta.url), 'utf8'));
  return {
    raw,
    prepare: (sql) => new Stmt(raw, sql),
    // D1.batch() = satu transaksi; gagal satu, batal semua.
    async batch(statements) {
      raw.exec('BEGIN');
      try {
        const out: D1Result[] = [];
        for (const s of statements) out.push(await s.run());
        raw.exec('COMMIT');
        return out;
      } catch (e) { raw.exec('ROLLBACK'); throw e; }
    },
  };
}
