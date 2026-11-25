/**
 * Conexión a la base de datos SQLite local de pruebas.
 *
 * Usa el módulo nativo node:sqlite (Node >= 22.5). Sin dependencias externas.
 *
 * Garantías:
 *  - Crea el directorio data/local/ si no existe.
 *  - Crea la base si no existe.
 *  - Aplica migraciones versionadas e idempotentes.
 *  - Activa foreign_keys y WAL para integridad y concurrencia limitada.
 *  - NUNCA borra ni reinicializa silenciosamente.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config, getDbPath } from '../config.js';
import { runMigrations, getAppliedMigrations } from './migrations.js';
import { logger } from '../utils/logger.js';

let _db = null;

export function ensureDbDir() {
  if (!fs.existsSync(config.dbDir)) {
    fs.mkdirSync(config.dbDir, { recursive: true });
  }
}

export function openDatabase({ applyMigrations = true, quiet = false } = {}) {
  if (_db) return _db;

  ensureDbDir();
  const dbPath = getDbPath();
  const existedBefore = fs.existsSync(dbPath);

  // Aplica restricciones de permisos razonables al archivo (best-effort).
  const db = new DatabaseSync(dbPath);

  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');

  let migrationResult = null;
  if (applyMigrations) {
    migrationResult = runMigrations(db, { logger: quiet ? undefined : logger });
  }

  try {
    fs.chmodSync(dbPath, 0o600);
  } catch {
    // En Windows chmod es parcialmente soportado; no es crítico.
  }

  if (!quiet) {
    logger.info('base de datos abierta', {
      path: dbPath,
      existedBefore,
      migrationsApplied: migrationResult ? migrationResult.appliedNow.length : 0,
      conflicts: migrationResult ? migrationResult.conflicts.length : 0,
    });
  }

  _db = db;
  _db.__meta = { dbPath, existedBefore, migrationResult };
  return _db;
}

export function getDatabase() {
  if (!_db) return openDatabase();
  return _db;
}

export function closeDatabase() {
  if (_db) {
    try {
      _db.close();
    } catch {
      /* noop */
    }
    _db = null;
  }
  return _db;
}

/**
 * Comprobación de salud: abre la base, verifica tablas y migraciones aplicadas.
 */
export function healthCheck() {
  const db = openDatabase({ quiet: true });
  const dbPath = getDbPath();
  const applied = getAppliedMigrations(db);

  const required = [
    'schema_migrations',
    'patients',
    'clinical_records',
    'initial_evaluations',
    'scale_responses',
    'scale_scores',
    'weekly_observations',
    'model_runs',
    'model_outputs',
    'audit_events',
    'follow_up_evaluations',
    'clinical_formulations',
    'psychometric_evaluations',
    'psychometric_item_responses',
    'psychometric_results',
    'model_governance_registry',
  ];

  const present = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r) => r.name)
  );

  const missing = required.filter((t) => !present.has(t));
  const fkOn = db.prepare('PRAGMA foreign_keys').get();

  return {
    ok: missing.length === 0,
    dbPath,
    exists: fs.existsSync(dbPath),
    tables: required.length - missing.length,
    missingTables: missing,
    migrationsApplied: applied.size,
    foreignKeysEnabled: !!(fkOn && (fkOn.foreign_keys === 1 || fkOn.foreign_keys === true)),
  };
}
