/**
 * Pruebas de integración de monitorización soberana (Fase 7):
 * - GET /api/monitoring/metrics
 * - POST /api/monitoring/client-error (sanitización y cero PHI en bitácora)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-mon-test-'));
process.env.SISAP_DB_DIR = tmpDir;
process.env.SISAP_DB_FILE = 'mon_test.sqlite3';

const { openDatabase, closeDatabase } = await import('../src/db/index.js');
const { route } = await import('../src/routes/index.js');

test('MON-01: GET /api/monitoring/metrics expone salud BD, memoria, WORM y contadores agregados sin PHI', async () => {
  openDatabase({ quiet: true });
  const res = await route({
    method: 'GET',
    pathname: '/api/monitoring/metrics',
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.database.ok, true);
  assert.equal(res.body.database.tables, 15);
  assert.equal(res.body.audit_worm.valid, true);
  assert.equal(res.body.phi_exported, false);
  assert.ok(res.body.memory.rss_bytes > 0);
  assert.ok(typeof res.body.operational_counts_aggregate.patients_total === 'number');
});

test('MON-02: POST /api/monitoring/client-error sanitiza TUS-XXXX, correos y rutas personales', async () => {
  const res = await route({
    method: 'POST',
    pathname: '/api/monitoring/client-error',
    query: new URLSearchParams(),
    body: {
      kind: 'window_error',
      route: '/centro_psicometrico',
      client_os: 'Windows',
      message: 'Fallo UI paciente TUS-0099 correo clinico@example.com ruta C:\\Users\\devuser\\file.ts',
    },
  });
  assert.equal(res.status, 202);
  assert.equal(res.body.accepted, true);
  assert.equal(res.body.phi_sanitized, true);
  assert.ok(!res.body.message.includes('TUS-0099'));
  assert.ok(!res.body.message.includes('clinico@example.com'));
  assert.ok(!res.body.message.includes('devuser'));
  assert.ok(res.body.message.includes('[REDACTED]'));
});

test.after(() => {
  closeDatabase();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
