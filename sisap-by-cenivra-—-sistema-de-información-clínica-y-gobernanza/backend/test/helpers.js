/** Helpers de prueba: base temporal limpia por test. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function makeTempDbEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-test-'));
  process.env.SISAP_DB_DIR = dir;
  process.env.SISAP_DB_FILE = 'sisap_test.sqlite3';
  process.env.NODE_ENV = 'test';
  return dir;
}

export function cleanupTempDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* noop */
  }
}
