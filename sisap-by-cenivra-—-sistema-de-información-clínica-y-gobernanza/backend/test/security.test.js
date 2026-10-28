import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeTempDbEnv, cleanupTempDir } from './helpers.js';

let dir;
let dbmod;
let security;
let audit;

before(async () => {
  dir = makeTempDbEnv();
  dbmod = await import('../src/db/index.js');
  security = await import('../src/middleware/security.js');
  audit = await import('../src/services/auditService.js');
  dbmod.openDatabase({ quiet: true });
});

after(() => {
  dbmod.closeDatabase();
  cleanupTempDir(dir);
});

test('T-10: loopbackOnly rechaza conexiones no locales', () => {
  assert.throws(() => security.loopbackOnly({ socket: { remoteAddress: '192.168.1.50' } }), /loopback/i);
  // Loopback acepta
  assert.doesNotThrow(() => security.loopbackOnly({ socket: { remoteAddress: '127.0.0.1' } }));
  assert.doesNotThrow(() => security.loopbackOnly({ socket: { remoteAddress: '::1' } }));
});

test('rate limiting bloquea tras exceder el límite', () => {
  security._resetRateLimit();
  const req = { socket: { remoteAddress: '127.0.0.1' } };
  let blocked = false;
  for (let i = 0; i < 200; i++) {
    try {
      security.rateLimit(req);
    } catch (e) {
      blocked = true;
      break;
    }
  }
  assert.equal(blocked, true, 'debe bloquear tras el límite');
});

test('verifyOrigin rechaza orígenes no autorizados en POST', () => {
  assert.throws(
    () => security.verifyOrigin({ method: 'POST', headers: { origin: 'http://evil.example' } }),
    /Origen no autorizado/i
  );
  assert.doesNotThrow(() =>
    security.verifyOrigin({ method: 'POST', headers: { origin: 'http://localhost:3000' } })
  );
});

test('cadena de auditoría WORM es verificable', () => {
  audit.recordEvent({ action: 'test.evt.1' });
  audit.recordEvent({ action: 'test.evt.2' });
  const v = audit.verifyChain();
  assert.equal(v.valid, true, 'cadena íntegra');
  assert.ok(v.total >= 2);
});

test('logger redacta claves sensibles', async () => {
  const { logger } = await import('../src/utils/logger.js');
  // Captura stdout
  const orig = process.stdout.write;
  let captured = '';
  process.stdout.write = (chunk) => { captured += chunk; return true; };
  logger.info('prueba', { nombre_completo: 'NOMBRE REAL', curp: 'XXXX', total: 1 });
  process.stdout.write = orig;
  assert.ok(!captured.includes('NOMBRE REAL'), 'no filtra nombre');
  assert.ok(!captured.includes('XXXX'), 'no filtra curp');
  assert.ok(captured.includes('[REDACTED]'), 'marca redacción');
  assert.ok(captured.includes('"total":1'), 'conserva campos no sensibles');
});
