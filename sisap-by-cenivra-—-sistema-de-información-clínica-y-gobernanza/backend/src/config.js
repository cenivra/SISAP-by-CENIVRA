/**
 * Configuración del backend local de SISAP.
 *
 * Reglas:
 *  - Todas las rutas se derivan de la ubicación de este archivo (nunca rutas
 *    absolutas hardcodeadas de la máquina del desarrollador).
 *  - El host por defecto es loopback (127.0.0.1): el servicio NO debe ser
 *    accesible desde la red.
 *  - El puerto y otras variables pueden sobreescribirse por entorno.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src -> backend -> raíz de la app
const BACKEND_DIR = path.resolve(__dirname, '..');
const APP_ROOT = path.resolve(BACKEND_DIR, '..');

const env = (key, fallback) => {
  const v = process.env[key];
  return v === undefined || v === '' ? fallback : v;
};

export const config = {
  appRoot: APP_ROOT,
  backendDir: BACKEND_DIR,

  // Base de datos de pruebas: fuera de src/, public/ y dist/
  dbDir: env('SISAP_DB_DIR', path.join(APP_ROOT, 'data', 'local')),
  dbFile: env('SISAP_DB_FILE', 'sisap_test.sqlite3'),

  // Servidor: solo loopback por defecto
  host: env('SISAP_HOST', '127.0.0.1'),
  port: Number(env('SISAP_PORT', '8080')),

  // CORS: frontend de desarrollo y escritorio local
  allowedOrigins: env(
    'SISAP_ALLOWED_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // Límites
  searchLimit: Number(env('SISAP_SEARCH_LIMIT', '10')),
  rateLimitPerMinute: Number(env('SISAP_RATE_LIMIT', '100')),
  maxBodyBytes: Number(env('SISAP_MAX_BODY_BYTES', String(256 * 1024))),

  // Sesión
  sessionTtlMs: Number(env('SISAP_SESSION_TTL_MS', String(30 * 60 * 1000))),

  // Entorno
  isTest: env('NODE_ENV', 'development') === 'test',
};

export function getDbPath() {
  return path.join(config.dbDir, config.dbFile);
}
