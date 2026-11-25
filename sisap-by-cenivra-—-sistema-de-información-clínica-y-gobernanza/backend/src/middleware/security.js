/**
 * Middlewares de seguridad del backend local:
 *  - CORS restringido a orígenes permitidos (localhost:3000).
 *  - Rate limiting en memoria por IP.
 *  - Verificación de Origin (mitiga CSRF de navegador).
 *  - Límite de tamaño de cuerpo.
 *  - Restricción de red: solo loopback.
 */
import { config } from '../config.js';
import { Errors } from '../utils/errors.js';

/** Solo permite conexiones desde loopback. */
export function loopbackOnly(req) {
  const addr = req.socket?.remoteAddress || '';
  const ok =
    addr === '127.0.0.1' ||
    addr === '::1' ||
    addr === '::ffff:127.0.0.1' ||
    addr.startsWith('127.');
  if (!ok) throw Errors.forbidden('El servicio local solo acepta conexiones desde loopback.');
}

/** CORS restringido. */
export function applyCors(req, res) {
  const origin = req.headers['origin'];
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-SISAP-Actor, X-SISAP-Role'
    );
    res.setHeader('Access-Control-Max-Age', '600');
  }
  // Sin origin (peticiones server-side/CLI) no se concede CORS.
}

/**
 * Verificación de Origin para métodos de escritura (mitiga CSRF).
 * Se relaja cuando no hay Origin (peticiones directas desde CLI/tests locales).
 */
export function verifyOrigin(req) {
  if (req.method === 'GET' || req.method === 'OPTIONS') return;
  const origin = req.headers['origin'];
  if (origin && !config.allowedOrigins.includes(origin)) {
    throw Errors.forbidden('Origen no autorizado.');
  }
}

// ---- Rate limiting en memoria -------------------------------------------------
const hits = new Map(); // ip -> { count, windowStart }

export function rateLimit(req) {
  const ip = req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60_000;
  let entry = hits.get(ip);
  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now };
    hits.set(ip, entry);
  }
  entry.count += 1;
  if (entry.count > config.rateLimitPerMinute) {
    throw Errors.tooMany();
  }
}

export function _resetRateLimit() {
  hits.clear();
}

/** Lee y parsea el cuerpo JSON con límite de tamaño. */
export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > config.maxBodyBytes) {
        reject(Errors.badRequest('Cuerpo de solicitud demasiado grande.'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Errors.badRequest('JSON inválido.'));
      }
    });
    req.on('error', () => reject(Errors.badRequest('Error leyendo la solicitud.')));
  });
}
