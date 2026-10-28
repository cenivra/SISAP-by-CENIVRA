import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeTempDbEnv, cleanupTempDir } from './helpers.js';

let dir;
let dbmod;

before(async () => {
  dir = makeTempDbEnv();
  process.env.NODE_ENV = 'test';
  dbmod = await import('../src/db/index.js');
});

after(() => {
  dbmod.closeDatabase();
  cleanupTempDir(dir);
});

test('T-01: inicialización crea base, tablas y schema_migrations', () => {
  const h = dbmod.healthCheck();
  assert.equal(h.ok, true, 'health.ok');
  assert.equal(h.missingTables.length, 0, 'sin tablas faltantes');
  assert.ok(h.migrationsApplied >= 1, 'al menos una migración aplicada');
  assert.equal(h.foreignKeysEnabled, true, 'foreign_keys activado');
});

test('T-02: migraciones idempotentes (no duplican filas)', () => {
  const db = dbmod.getDatabase();
  const before = db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n;
  const h2 = dbmod.healthCheck();
  const after = db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n;
  assert.equal(before, after, 'no se agregan migraciones duplicadas');
  assert.equal(h2.ok, true);
});

test('T-10 (parcial): restricción WORM en audit_events', () => {
  const db = dbmod.getDatabase();
  db.prepare(
    `INSERT INTO audit_events (event_id, occurred_at, action) VALUES (?, ?, ?)`
  ).run('evt-1', new Date().toISOString(), 'test.event');
  assert.throws(() => {
    db.prepare(`UPDATE audit_events SET action = 'x' WHERE event_id = 'evt-1'`).run();
  }, /WORM|append-only|VIOLACION/i);
  assert.throws(() => {
    db.prepare(`DELETE FROM audit_events WHERE event_id = 'evt-1'`).run();
  }, /WORM|append-only|VIOLACION/i);
});
