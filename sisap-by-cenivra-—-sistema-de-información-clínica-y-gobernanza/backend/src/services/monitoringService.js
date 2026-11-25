/**
 * Servicio soberano de monitorización operativa y errores sanitizados (Fase 7).
 * NUNCA almacena PHI, identidades de pacientes, CURP ni respuestas psicométricas.
 */
import { getDatabase, healthCheck } from '../db/index.js';
import { verifyChain, recordEvent } from './auditService.js';
import { logger } from '../utils/logger.js';

const PHI_REDACT_PATTERNS = [
  /TUS-\d+/gi,
  /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g,
  /CED-PROF-\w+/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\b\d{10}\b/g,
  /[A-Za-z]:\\Users\\[^\\\s]+/gi,
  /\b(nombre_completo|curp|diagnostico|craving|paciente)\b/gi,
];

export function sanitizeMonitoringText(raw) {
  let out = String(raw || '');
  for (const rx of PHI_REDACT_PATTERNS) {
    out = out.replace(rx, '[REDACTED]');
  }
  return out.slice(0, 240);
}

export function getSystemMonitoringMetrics() {
  const health = healthCheck();
  const chain = verifyChain();
  const mem = process.memoryUsage();
  const db = getDatabase();

  const counts = {
    patients_total: db.prepare('SELECT COUNT(*) AS n FROM patients').get().n,
    psychometric_evaluations_total: db.prepare('SELECT COUNT(*) AS n FROM psychometric_evaluations').get().n,
    model_runs_total: db.prepare('SELECT COUNT(*) AS n FROM model_runs').get().n,
    follow_ups_total: db.prepare('SELECT COUNT(*) AS n FROM follow_up_evaluations').get().n,
    formulations_total: db.prepare('SELECT COUNT(*) AS n FROM clinical_formulations').get().n,
  };

  return {
    timestamp_utc: new Date().toISOString(),
    service: 'sisap-local-backend',
    uptime_seconds: Number(process.uptime().toFixed(2)),
    node_version: process.version,
    memory: {
      rss_bytes: mem.rss,
      heap_used_bytes: mem.heapUsed,
      heap_total_bytes: mem.heapTotal,
    },
    database: {
      ok: health.ok,
      tables: health.tables,
      migrations_applied: health.migrationsApplied,
      foreign_keys_enabled: health.foreignKeysEnabled,
    },
    audit_worm: {
      valid: chain.valid,
      total_events: chain.total,
    },
    operational_counts_aggregate: counts,
    phi_exported: false,
  };
}

export function recordSanitizedClientError(body) {
  const kind = sanitizeMonitoringText(body?.kind || 'client_error');
  const message = sanitizeMonitoringText(body?.message || 'unspecified');
  const route = sanitizeMonitoringText(body?.route || '/');
  const clientOs = sanitizeMonitoringText(body?.client_os || 'unknown');

  logger.warn('client.monitoring.error', { kind, route, clientOs, summary: message });
  recordEvent({
    actor: 'client_runtime',
    actorRole: 'system',
    action: 'monitoring.client_error',
    details: `kind=${kind} route=${route}`,
  });

  return {
    accepted: true,
    phi_sanitized: true,
    kind,
    route,
    message,
  };
}
