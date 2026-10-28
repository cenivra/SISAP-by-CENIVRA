/**
 * CLI: inicializa la base de pruebas (crea directorios, base y aplica migraciones).
 * Idempotente: si la base ya existe, solo aplica migraciones pendientes.
 * NUNCA borra una base existente.
 */
import { openDatabase, closeDatabase, healthCheck } from '../db/index.js';
import { getDbPath } from '../config.js';

const quiet = process.argv.includes('--quiet');
const db = openDatabase({ quiet });
const meta = db.__meta;

const h = healthCheck();
closeDatabase();

if (!quiet) {
  console.log(JSON.stringify({
    ok: h.ok,
    dbPath: getDbPath(),
    existedBefore: meta.existedBefore,
    migrationsApplied: meta.migrationResult ? meta.migrationResult.appliedNow : [],
    conflicts: meta.migrationResult ? meta.migrationResult.conflicts : [],
    tablesPresent: h.tables,
    missingTables: h.missingTables,
  }, null, 2));
} else {
  process.stdout.write(h.ok ? 'OK\n' : 'FAIL\n');
}

process.exit(h.ok ? 0 : 1);
