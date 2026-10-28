/**
 * Motor de migraciones versionadas e idempotentes.
 *
 * - Lee archivos .sql numerados de backend/migrations (001_..., 002_...).
 * - Registra cada migración aplicada en schema_migrations con su checksum.
 * - NUNCA borra ni reinicializa una base existente.
 * - Si el esquema es incompatible (migración ya aplicada con checksum distinto),
 *   informa y NO aplica cambios destructivos.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'migrations');

export function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      return na - nb;
    });
}

function checksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     INTEGER PRIMARY KEY,
      name        TEXT    NOT NULL,
      checksum    TEXT,
      applied_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getAppliedMigrations(db) {
  ensureMigrationsTable(db);
  const rows = db.prepare('SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version').all();
  const map = new Map();
  for (const r of rows) map.set(r.version, r);
  return map;
}

/**
 * Aplica migraciones pendientes. Idempotente: ejecutar dos veces no produce cambios.
 * Devuelve un resumen de lo aplicado y del estado final.
 */
export function runMigrations(db, { logger } = {}) {
  ensureMigrationsTable(db);
  const applied = getAppliedMigrations(db);
  const files = listMigrationFiles();
  const appliedNow = [];
  const skipped = [];
  const conflicts = [];

  for (const file of files) {
    const version = parseInt(file, 10);
    const name = file.replace(/^\d+_/, '').replace(/\.sql$/, '');
    const sqlPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const sum = checksum(sql);

    if (applied.has(version)) {
      const rec = applied.get(version);
      if (rec.checksum && rec.checksum !== sum) {
        // Migración ya aplicada pero el archivo cambió: no re-aplicar, avisar.
        conflicts.push({ version, name, expected: rec.checksum, actual: sum });
      } else {
        skipped.push({ version, name });
      }
      continue;
    }

    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)').run(
        version,
        name,
        sum
      );
      db.exec('COMMIT');
      appliedNow.push({ version, name });
      if (logger) logger.info('migración aplicada', { version, name });
    } catch (err) {
      db.exec('ROLLBACK');
      throw new Error(`Fallo al aplicar migración ${file}: ${err.message}`);
    }
  }

  return { appliedNow, skipped, conflicts, total: files.length };
}
