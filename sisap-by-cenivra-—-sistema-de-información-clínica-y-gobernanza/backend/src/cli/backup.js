/**
 * CLI: respaldo controlado de la base de pruebas.
 * Uso: node src/cli/backup.js [destino]
 * No sobrescribe un respaldo existente: agrega timestamp.
 */
import fs from 'node:fs';
import path from 'node:path';
import { config, getDbPath } from '../config.js';
import { openDatabase, closeDatabase } from '../db/index.js';

const dbPath = getDbPath();
if (!fs.existsSync(dbPath)) {
  console.error('No existe base de datos para respaldar:', dbPath);
  process.exit(1);
}

// Forzar checkpoint WAL para un respaldo consistente
const db = openDatabase({ quiet: true });
try { db.exec('PRAGMA wal_checkpoint(TRUNCATE);'); } catch { /* noop */ }
closeDatabase();

const backupsDir = path.join(config.dbDir, 'backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const explicit = process.argv[2];
const dest = explicit
  ? path.resolve(explicit)
  : path.join(backupsDir, `sisap_test_${ts}.sqlite3`);

if (fs.existsSync(dest)) {
  console.error('El destino ya existe, no se sobrescribe:', dest);
  process.exit(1);
}

fs.copyFileSync(dbPath, dest);
try { fs.chmodSync(dest, 0o600); } catch { /* noop */ }

console.log(JSON.stringify({ ok: true, source: dbPath, backup: dest }, null, 2));
