/**
 * Utilidades criptográficas y de normalización.
 *  - UUID estable para claves internas.
 *  - SHA-256 para hashes de entrada y cadena de bitácora.
 *  - Normalización de nombres para búsqueda (NO altera el nombre almacenado).
 */
import crypto from 'node:crypto';

export function uuid() {
  return crypto.randomUUID();
}

export function sha256(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Normaliza un nombre SOLO para el índice de búsqueda.
 * - minúsculas, sin acentos, sin puntuación, espacios colapsados.
 * El nombre original se conserva aparte.
 */
export function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verificación en tiempo constante de dos cadenas hex (evita timing attacks).
 */
export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Genera un fingerprint de registro para detección de duplicados.
 */
export function duplicateFingerprint({ nombre_completo, curp }) {
  const base = `${normalizeName(nombre_completo)}|${String(curp ?? '').toUpperCase().trim()}`;
  return sha256(base);
}
