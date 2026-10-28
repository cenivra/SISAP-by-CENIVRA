/**
 * Bitácora de auditoría append-only (WORM) con cadena de hash.
 *
 * Cada evento se encadena con el hash del anterior (prev_hash), permitiendo
 * detectar alteraciones. Los triggers SQL impiden UPDATE/DELETE.
 *
 * IMPORTANTE: `details` NUNCA debe contener datos clínicos identificables.
 */
import { getDatabase } from '../db/index.js';
import { uuid, sha256 } from '../utils/crypto.js';

const GENESIS = 'SISAP_LOCAL_GENESIS_ROOT';

export function recordEvent({
  actor = 'system',
  actorRole = 'system',
  action,
  subjectPseudonym = null,
  details = null,
  ip = null,
}) {
  const db = getDatabase();
  const occurredAt = new Date().toISOString();
  const eventId = uuid();

  const prev = db
    .prepare('SELECT hash FROM audit_events ORDER BY occurred_at DESC, rowid DESC LIMIT 1')
    .get();
  const prevHash = prev && prev.hash ? prev.hash : GENESIS;

  const payload = `${prevHash}|${eventId}|${occurredAt}|${actor}|${actorRole}|${action}|${subjectPseudonym ?? ''}`;
  const hash = sha256(payload);

  db.prepare(
    `INSERT INTO audit_events
       (event_id, occurred_at, actor, actor_role, action, subject_pseudonym, details, ip, prev_hash, hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(eventId, occurredAt, actor, actorRole, action, subjectPseudonym, details, ip, prevHash, hash);

  return { eventId, hash, prevHash };
}

export function listEvents({ limit = 50 } = {}) {
  const db = getDatabase();
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  return db
    .prepare(
      `SELECT event_id, occurred_at, actor, actor_role, action, subject_pseudonym, ip, prev_hash, hash
       FROM audit_events ORDER BY occurred_at DESC, rowid DESC LIMIT ?`
    )
    .all(n);
}

/**
 * Verifica la integridad de la cadena de hash.
 */
export function verifyChain() {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT event_id, occurred_at, actor, actor_role, action, subject_pseudonym, prev_hash, hash
       FROM audit_events ORDER BY occurred_at ASC, rowid ASC`
    )
    .all();

  let expectedPrev = GENESIS;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.prev_hash !== expectedPrev) {
      return { valid: false, total: rows.length, brokenAt: i, reason: 'prev_hash no encadena' };
    }
    const payload = `${r.prev_hash}|${r.event_id}|${r.occurred_at}|${r.actor}|${r.actor_role}|${r.action}|${r.subject_pseudonym ?? ''}`;
    if (sha256(payload) !== r.hash) {
      return { valid: false, total: rows.length, brokenAt: i, reason: 'hash no coincide' };
    }
    expectedPrev = r.hash;
  }
  return { valid: true, total: rows.length };
}
